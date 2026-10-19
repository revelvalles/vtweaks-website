begin;
do $$
declare uid uuid:=gen_random_uuid(); app_order jsonb; iso_order jsonb; bundle_order jsonb; outcome jsonb; snapshot jsonb; rejected boolean:=false;
begin
  insert into auth.users(id,email,email_confirmed_at,raw_app_meta_data,raw_user_meta_data,created_at,updated_at)
    values(uid,'billing-probe-'||uid::text||'@example.invalid',now(),'{}','{}',now(),now());
  app_order:=public.vt_billing_reserve(uid,'test','price_probeapp','app');
  iso_order:=public.vt_billing_reserve(uid,'test','price_probeiso','iso');
  bundle_order:=public.vt_billing_reserve(uid,'test','price_probebundle','bundle');
  if app_order->>'id'=iso_order->>'id' or iso_order->>'id'=bundle_order->>'id' then raise exception 'Packages share an order'; end if;
  if public.vt_billing_reserve(uid,'test','price_probeapp','app')->>'id'<>app_order->>'id' then raise exception 'Pending order not reused'; end if;
  begin perform public.vt_billing_reserve(uid,'test','price_probeinvalid','invalid'); exception when others then rejected:=true; end;
  if not rejected then raise exception 'Invalid SKU accepted'; end if;
  perform public.vt_billing_attach((iso_order->>'id')::uuid,'cs_test_probeiso',1500,'usd',now()+interval '1 hour');
  perform public.vt_billing_record('evt_probeiso','checkout.session.completed',(iso_order->>'id')::uuid,'cs_test_probeiso','pi_probeiso','price_probeiso','paid',1500,'usd',false);
  perform set_config('request.jwt.claim.sub',uid::text,true);
  snapshot:=public.vt_billing_history();
  if (snapshot->>'test_premium')::boolean then raise exception 'ISO granted app premium'; end if;
  if snapshot->'orders'->0->>'product' is null then raise exception 'History lacks product'; end if;
  perform public.vt_billing_attach((app_order->>'id')::uuid,'cs_test_probeapp',1000,'usd',now()+interval '1 hour');
  perform public.vt_billing_record('evt_probeapp','checkout.session.completed',(app_order->>'id')::uuid,'cs_test_probeapp','pi_probeapp','price_probeapp','paid',1000,'usd',false);
  outcome:=public.vt_billing_record('evt_probeapp','checkout.session.completed',(app_order->>'id')::uuid,'cs_test_probeapp','pi_probeapp','price_probeapp','paid',1000,'usd',false);
  if not(outcome->>'duplicate')::boolean then raise exception 'Duplicate not detected'; end if;
  if not(public.vt_billing_history()->>'test_premium')::boolean then raise exception 'App test entitlement missing'; end if;
  if exists(select 1 from public.vt_licenses where user_id=uid and plan='premium') then raise exception 'Test modified commercial license'; end if;
  perform public.vt_billing_record('evt_probedispute','charge.dispute.created',(app_order->>'id')::uuid,'cs_test_probeapp','pi_probeapp','price_probeapp','disputed',1000,'usd',false);
  perform public.vt_billing_record('evt_proberefund','charge.refunded',(app_order->>'id')::uuid,'cs_test_probeapp','pi_probeapp','price_probeapp','refunded',1000,'usd',false);
  perform public.vt_billing_record('evt_probelate','checkout.session.completed',(app_order->>'id')::uuid,'cs_test_probeapp','pi_probeapp','price_probeapp','paid',1000,'usd',false);
  if (select status from private.vt_billing_orders where id=(app_order->>'id')::uuid)<>'refunded' then raise exception 'Refund transition broken'; end if;
  if has_function_privilege('authenticated','public.vt_billing_reserve(uuid,text,text,text)','execute') or has_function_privilege('anon','public.vt_billing_history()','execute') or has_table_privilege('authenticated','private.vt_billing_orders','select') then raise exception 'Billing privilege leak'; end if;
end;
$$;
select 'PASS: packages, pending reuse, history, ISO separation, test isolation, idempotency, dispute/refund, privileges' as verification;
rollback;
