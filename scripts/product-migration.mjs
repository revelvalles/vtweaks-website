import fs from 'node:fs';
const old=fs.readFileSync('supabase/migrations/20261013173712_vtweaks_billing.sql','utf8');
const reserve=`create function private.vt_billing_reserve(p_user uuid,p_mode text,p_price text,p_product text) returns jsonb
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
`;
let record=old.slice(old.indexOf('create function private.vt_billing_record'),old.indexOf('create function private.vt_billing_history')).replace('create function','create or replace function');
record=record.replace("purchase.status='disputed' and not(p_status='paid' and p_type='charge.dispute.closed')","purchase.status='disputed' and not(p_status='refunded' or (p_status='paid' and p_type='charge.dispute.closed'))");
record=record.replace('if p_livemode and purchase.user_id is not null then',"if p_livemode and purchase.user_id is not null and purchase.product in ('app','bundle') then");
record=record.replace("where user_id=purchase.user_id and mode='live' and status='paid'","where user_id=purchase.user_id and mode='live' and product in ('app','bundle') and status='paid'");
let history=old.slice(old.indexOf('create function private.vt_billing_history'),old.indexOf('create function public.vt_billing_reserve')).replace('create function','create or replace function');
history=history.replace('select id,mode,amount,currency,status,created_at,updated_at','select id,product,mode,amount,currency,status,created_at,updated_at').replace("where user_id=uid and mode='test' and status='paid'","where user_id=uid and mode='test' and product in ('app','bundle') and status='paid'");
const sql=`begin;\nalter table private.vt_billing_orders add column product text not null default 'app' check(product in ('app','iso','bundle'));\n${reserve}\n${record}\n${history}\ncommit;\n`;
fs.writeFileSync('supabase/migrations/20261014145347_vtweaks_product_checkout.sql',sql);
console.log('Product migration generated from retained billing routines.');
