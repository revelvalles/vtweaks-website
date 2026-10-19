begin;
alter table private.vt_billing_orders add column product text not null default 'app' check(product in ('app','iso','bundle'));
create function private.vt_billing_reserve(p_user uuid,p_mode text,p_price text,p_product text) returns jsonb
language plpgsql security invoker set search_path='' as $$
declare result private.vt_billing_orders;
begin
  if p_mode is null or p_mode not in ('test','live') or p_price is null or p_price !~ '^price_[A-Za-z0-9]+$' or p_user is null or p_product is null or p_product not in ('app','iso','bundle') then raise exception 'Compra inválida'; end if;
  if not exists(select 1 from public.vt_profiles where id=p_user) then raise exception 'Cuenta no disponible'; end if;
  perform pg_advisory_xact_lock(hashtextextended(p_user::text||':'||p_mode,0));
  if p_mode='live' and exists(select 1 from private.vt_billing_orders where user_id=p_user and mode='live' and product=p_product and status='paid') then raise exception 'Este paquete ya está activo'; end if;
  select * into result from private.vt_billing_orders where user_id=p_user and mode=p_mode and price_id=p_price and product=p_product and status='pending' and expires_at>now() order by created_at desc limit 1;
  if found then return to_jsonb(result); end if;
  if (select count(*) from private.vt_billing_orders where user_id=p_user and mode=p_mode and created_at>now()-interval '1 hour')>=6 then raise exception 'Espera antes de iniciar otra compra'; end if;
  insert into private.vt_billing_orders(user_id,mode,price_id,product,expires_at) values(p_user,p_mode,p_price,p_product,now()+interval '1 hour') returning * into result;
  return to_jsonb(result);
end;
$$;
create function public.vt_billing_reserve(p_user uuid,p_mode text,p_price text,p_product text) returns jsonb language sql security invoker set search_path='' as $$select private.vt_billing_reserve(p_user,p_mode,p_price,p_product);$$;
revoke all on function private.vt_billing_reserve(uuid,text,text,text),public.vt_billing_reserve(uuid,text,text,text) from public,anon,authenticated;
grant execute on function private.vt_billing_reserve(uuid,text,text,text),public.vt_billing_reserve(uuid,text,text,text) to service_role;

create or replace function private.vt_billing_record(p_event text,p_type text,p_order uuid,p_session text,p_payment text,p_price text,p_status text,p_amount bigint,p_currency text,p_livemode boolean) returns jsonb
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
  if purchase.status='refunded' or (purchase.status='disputed' and not(p_status='refunded' or (p_status='paid' and p_type='charge.dispute.closed'))) or (purchase.status='paid' and p_status in ('expired','failed')) then return jsonb_build_object('ignored',true); end if;
  update private.vt_billing_orders set status=p_status,session_id=p_session,payment_id=p_payment,amount=p_amount,currency=p_currency,updated_at=now() where id=p_order;
  if p_livemode and purchase.user_id is not null and purchase.product in ('app','bundle') then
    select exists(select 1 from private.vt_billing_orders where user_id=purchase.user_id and mode='live' and product in ('app','bundle') and status='paid') into entitlement;
    update public.vt_licenses set plan=case when entitlement then 'premium' else 'free' end,status=case when entitlement then 'active' else 'revoked' end,valid_until=null,updated_at=now() where user_id=purchase.user_id;
  end if;
  return jsonb_build_object('recorded',true,'test',not p_livemode,'status',p_status);
end;
$$;


create or replace function private.vt_billing_history() returns jsonb
language plpgsql stable security definer set search_path='' as $$
declare uid uuid:=(select auth.uid()); result jsonb;
begin
  if uid is null or not exists(select 1 from auth.users where id=uid and email_confirmed_at is not null and deleted_at is null and (banned_until is null or banned_until<now())) then raise exception 'Sesión confirmada requerida' using errcode='42501'; end if;
  select coalesce(jsonb_agg(row_to_json(item)),'[]'::jsonb) into result from (
    select id,product,mode,amount,currency,status,created_at,updated_at from private.vt_billing_orders where user_id=uid order by created_at desc limit 30
  ) item;
  return jsonb_build_object('orders',result,'test_premium',exists(select 1 from private.vt_billing_orders where user_id=uid and mode='test' and product in ('app','bundle') and status='paid'));
end;
$$;


commit;
