begin;

-- Stripe identifiers and webhook journals are never exposed as public tables.
create table private.vt_billing_orders (
  id uuid primary key default gen_random_uuid(),
  user_id uuid references auth.users(id) on delete set null,
  mode text not null check (mode in ('test','live')),
  price_id text not null check (price_id ~ '^price_[A-Za-z0-9]+$'),
  session_id text unique,
  payment_id text,
  amount bigint check (amount > 0),
  currency text check (currency ~ '^[a-z]{3}$'),
  status text not null default 'pending' check(status in ('pending','paid','expired','failed','refunded','disputed')),
  expires_at timestamptz,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);
create index vt_billing_orders_owner on private.vt_billing_orders(user_id,mode,created_at desc);
create index vt_billing_orders_payment on private.vt_billing_orders(payment_id) where payment_id is not null;
create table private.vt_billing_events (
  event_id text primary key,
  event_type text not null,
  order_id uuid not null references private.vt_billing_orders(id),
  processed_at timestamptz not null default now()
);
alter table private.vt_billing_orders enable row level security;
alter table private.vt_billing_events enable row level security;
revoke all on private.vt_billing_orders,private.vt_billing_events from public,anon,authenticated;
grant usage on schema private to service_role;
grant select,insert,update on private.vt_billing_orders to service_role;
grant select,insert on private.vt_billing_events to service_role;
grant select on public.vt_profiles,public.vt_licenses to service_role;
grant update on public.vt_licenses to service_role;

create function private.vt_billing_reserve(p_user uuid,p_mode text,p_price text) returns jsonb
language plpgsql security invoker set search_path='' as $$
declare result private.vt_billing_orders;
begin
  if p_mode not in ('test','live') or p_price !~ '^price_[A-Za-z0-9]+$' or p_user is null then raise exception 'Compra inválida'; end if;
  if not exists(select 1 from public.vt_profiles where id=p_user) then raise exception 'Cuenta no disponible'; end if;
  perform pg_advisory_xact_lock(hashtextextended(p_user::text||':'||p_mode,0));
  if p_mode='live' and exists(select 1 from public.vt_licenses where user_id=p_user and plan='premium' and status='active' and (valid_until is null or valid_until>now())) then raise exception 'Premium ya está activo'; end if;
  select * into result from private.vt_billing_orders where user_id=p_user and mode=p_mode and price_id=p_price and status='pending' and expires_at>now() order by created_at desc limit 1;
  if found then return to_jsonb(result); end if;
  if (select count(*) from private.vt_billing_orders where user_id=p_user and mode=p_mode and created_at>now()-interval '1 hour')>=6 then raise exception 'Espera antes de iniciar otra compra'; end if;
  insert into private.vt_billing_orders(user_id,mode,price_id,expires_at) values(p_user,p_mode,p_price,now()+interval '1 hour') returning * into result;
  return to_jsonb(result);
end;
$$;

create function private.vt_billing_attach(p_order uuid,p_session text,p_amount bigint,p_currency text,p_expires timestamptz) returns void
language plpgsql security invoker set search_path='' as $$
begin
  if p_session !~ '^cs_(test_|live_)?[A-Za-z0-9]+$' or p_amount<=0 or p_currency !~ '^[a-z]{3}$' then raise exception 'Checkout inválido'; end if;
  update private.vt_billing_orders set session_id=p_session,amount=p_amount,currency=p_currency,expires_at=p_expires,updated_at=now()
    where id=p_order and (session_id is null or session_id=p_session);
  if not found then raise exception 'Compra no disponible'; end if;
end;
$$;

create function private.vt_billing_record(p_event text,p_type text,p_order uuid,p_session text,p_payment text,p_price text,p_status text,p_amount bigint,p_currency text,p_livemode boolean) returns jsonb
language plpgsql security invoker set search_path='' as $$
declare purchase private.vt_billing_orders; changed integer; entitlement boolean;
begin
  if p_event is null or p_event !~ '^evt_[A-Za-z0-9]+$' or p_status is null or p_status not in ('paid','expired','failed','refunded','disputed') or p_livemode is null or p_amount is null or p_amount<=0 or p_currency is null or p_price is null or p_session is null then raise exception 'Evento inválido'; end if;
  select * into purchase from private.vt_billing_orders where id=p_order for update;
  if not found then raise exception 'Compra desconocida'; end if;
  if purchase.mode<>(case when p_livemode then 'live' else 'test' end) or purchase.price_id<>p_price or (purchase.session_id is not null and purchase.session_id<>p_session) or (purchase.amount is not null and purchase.amount<>p_amount) or (purchase.currency is not null and purchase.currency<>p_currency) then raise exception 'El pago no coincide con la compra'; end if;
  insert into private.vt_billing_events(event_id,event_type,order_id) values(p_event,p_type,p_order) on conflict do nothing;
  get diagnostics changed=row_count;
  if changed=0 then return jsonb_build_object('duplicate',true); end if;
  -- Failed/expired events cannot revoke paid access. A late success cannot
  -- undo a refund or an open dispute; only a verified dispute-won event can.
  if purchase.status='refunded' or (purchase.status='disputed' and not(p_status='paid' and p_type='charge.dispute.closed')) or (purchase.status='paid' and p_status in ('expired','failed')) then return jsonb_build_object('ignored',true); end if;
  update private.vt_billing_orders set status=p_status,session_id=p_session,payment_id=p_payment,amount=p_amount,currency=p_currency,updated_at=now() where id=p_order;
  if p_livemode and purchase.user_id is not null then
    select exists(select 1 from private.vt_billing_orders where user_id=purchase.user_id and mode='live' and status='paid') into entitlement;
    update public.vt_licenses set plan=case when entitlement then 'premium' else 'free' end,status=case when entitlement then 'active' else 'revoked' end,valid_until=null,updated_at=now() where user_id=purchase.user_id;
  end if;
  return jsonb_build_object('recorded',true,'test',not p_livemode,'status',p_status);
end;
$$;

create function private.vt_billing_history() returns jsonb
language plpgsql stable security definer set search_path='' as $$
declare uid uuid:=(select auth.uid()); result jsonb;
begin
  if uid is null or not exists(select 1 from auth.users where id=uid and email_confirmed_at is not null and deleted_at is null and (banned_until is null or banned_until<now())) then raise exception 'Sesión confirmada requerida' using errcode='42501'; end if;
  select coalesce(jsonb_agg(row_to_json(item)),'[]'::jsonb) into result from (
    select id,mode,amount,currency,status,created_at,updated_at from private.vt_billing_orders where user_id=uid order by created_at desc limit 30
  ) item;
  return jsonb_build_object('orders',result,'test_premium',exists(select 1 from private.vt_billing_orders where user_id=uid and mode='test' and status='paid'));
end;
$$;

create function public.vt_billing_reserve(p_user uuid,p_mode text,p_price text) returns jsonb language sql security invoker set search_path='' as $$select private.vt_billing_reserve(p_user,p_mode,p_price);$$;
create function public.vt_billing_attach(p_order uuid,p_session text,p_amount bigint,p_currency text,p_expires timestamptz) returns void language sql security invoker set search_path='' as $$select private.vt_billing_attach(p_order,p_session,p_amount,p_currency,p_expires);$$;
create function public.vt_billing_record(p_event text,p_type text,p_order uuid,p_session text,p_payment text,p_price text,p_status text,p_amount bigint,p_currency text,p_livemode boolean) returns jsonb language sql security invoker set search_path='' as $$select private.vt_billing_record(p_event,p_type,p_order,p_session,p_payment,p_price,p_status,p_amount,p_currency,p_livemode);$$;
create function public.vt_billing_history() returns jsonb language sql stable security invoker set search_path='' as $$select private.vt_billing_history();$$;

revoke all on function private.vt_billing_reserve(uuid,text,text),private.vt_billing_attach(uuid,text,bigint,text,timestamptz),private.vt_billing_record(text,text,uuid,text,text,text,text,bigint,text,boolean),private.vt_billing_history() from public,anon,authenticated;
revoke all on function public.vt_billing_reserve(uuid,text,text),public.vt_billing_attach(uuid,text,bigint,text,timestamptz),public.vt_billing_record(text,text,uuid,text,text,text,text,bigint,text,boolean),public.vt_billing_history() from public,anon,authenticated;
grant execute on function private.vt_billing_reserve(uuid,text,text),private.vt_billing_attach(uuid,text,bigint,text,timestamptz),private.vt_billing_record(text,text,uuid,text,text,text,text,bigint,text,boolean) to service_role;
grant execute on function public.vt_billing_reserve(uuid,text,text),public.vt_billing_attach(uuid,text,bigint,text,timestamptz),public.vt_billing_record(text,text,uuid,text,text,text,text,bigint,text,boolean) to service_role;
grant execute on function private.vt_billing_history(),public.vt_billing_history() to authenticated;
commit;
