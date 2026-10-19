create table private.vt_ai_config (
  singleton boolean primary key default true check (singleton),
  gate_sha256 text not null check (gate_sha256 ~ '^[a-f0-9]{64}$')
);
create table private.vt_ai_usage (
  id bigint generated always as identity primary key,
  user_id uuid not null references auth.users(id) on delete cascade,
  created_at timestamptz not null default clock_timestamp(),
  reserved_tokens integer not null check (reserved_tokens between 1 and 8000)
);
create index vt_ai_usage_created on private.vt_ai_usage (created_at);
create index vt_ai_usage_user_created on private.vt_ai_usage (user_id, created_at);
alter table private.vt_ai_config enable row level security;
alter table private.vt_ai_usage enable row level security;
revoke all on private.vt_ai_config, private.vt_ai_usage from public, anon, authenticated;
insert into private.vt_ai_config(singleton,gate_sha256)
values (true,'716e3f4e7b25f7847ddf6c6f7c1158b2c1d404396e67c4670ba314b94b7a3cbd');

create function private.vt_ai_reserve(p_gate text,p_tokens integer)
returns jsonb language plpgsql security definer set search_path=''
as $$
declare
  owner_id uuid := (select auth.uid());
  instant timestamptz := clock_timestamp();
  day_start timestamptz := date_trunc('day',instant at time zone 'UTC') at time zone 'UTC';
  user_count bigint;
  latest timestamptz;
  minute_tokens bigint;
  day_tokens bigint;
begin
  if owner_id is null or p_gate is null or length(p_gate)<>64
    or p_tokens is null or p_tokens<1 or p_tokens>7500 then
    raise exception 'Solicitud no autorizada' using errcode='42501';
  end if;
  if not exists(select 1 from private.vt_ai_config c where c.singleton
    and c.gate_sha256=encode(sha256(convert_to(p_gate,'UTF8')),'hex')) then
    raise exception 'Solicitud no autorizada' using errcode='42501';
  end if;
  if not exists(select 1 from auth.users u join auth.sessions s on s.user_id=u.id
    where u.id=owner_id and u.deleted_at is null and u.email_confirmed_at is not null
    and not coalesce(u.is_anonymous,false)
    and (u.banned_until is null or u.banned_until<instant)
    and s.id::text=(select auth.jwt()->>'session_id')) then
    raise exception 'Sesión no disponible' using errcode='42501';
  end if;
  perform pg_advisory_xact_lock(674982301);
  select count(*),max(created_at) into user_count,latest
    from private.vt_ai_usage where user_id=owner_id and created_at>=day_start;
  if user_count>=12 then
    return jsonb_build_object('ok',false,'scope','user_day','retryAfter',ceil(extract(epoch from day_start+interval '1 day'-instant)));
  end if;
  if latest>instant-interval '8 seconds' then
    return jsonb_build_object('ok',false,'scope','user_burst','retryAfter',8);
  end if;
  select coalesce(sum(reserved_tokens),0) into minute_tokens
    from private.vt_ai_usage where created_at>instant-interval '60 seconds';
  select coalesce(sum(reserved_tokens),0) into day_tokens
    from private.vt_ai_usage where created_at>=day_start;
  if minute_tokens+p_tokens>7500 then
    return jsonb_build_object('ok',false,'scope','global_minute','retryAfter',60);
  end if;
  if day_tokens+p_tokens>180000 then
    return jsonb_build_object('ok',false,'scope','global_day','retryAfter',ceil(extract(epoch from day_start+interval '1 day'-instant)));
  end if;
  insert into private.vt_ai_usage(user_id,created_at,reserved_tokens) values(owner_id,instant,p_tokens);
  delete from private.vt_ai_usage where created_at<instant-interval '2 days';
  return jsonb_build_object('ok',true,'remaining',11-user_count);
end;
$$;
revoke all on function private.vt_ai_reserve(text,integer) from public,anon,authenticated;
grant usage on schema private to authenticated;
grant execute on function private.vt_ai_reserve(text,integer) to authenticated;

create function public.vt_ai_reserve(p_gate text,p_tokens integer)
returns jsonb language sql security invoker set search_path=''
as $$ select private.vt_ai_reserve(p_gate,p_tokens); $$;
revoke all on function public.vt_ai_reserve(text,integer) from public,anon;
grant execute on function public.vt_ai_reserve(text,integer) to authenticated;
comment on table private.vt_ai_usage is 'AI quota reservations only; never prompts, answers, emails, API keys or hardware data. Retained at most two days of active use.';

