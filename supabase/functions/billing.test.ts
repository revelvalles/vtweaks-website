import Stripe from 'stripe';
import {configuration,productConfiguration,platformKey,cors,validateCheckout,nextStatus} from './_shared/billing.ts';
import {catalog} from './_shared/products.ts';
function assert(value:unknown,message='Assertion failed'):asserts value {if(!value)throw Error(message)}
function rejected(fn:()=>unknown){try{fn()}catch{return}throw Error('Expected rejection')}
Deno.test('live billing stays disabled and secret keys must match mode',()=>{
  const names=['VT_BILLING_MODE','VT_BILLING_LIVE_ENABLED','VT_STRIPE_SECRET_KEY'];const old=names.map(n=>Deno.env.get(n));
  try{Deno.env.set(names[0],'live');Deno.env.delete(names[1]);rejected(configuration);Deno.env.set(names[0],'test');Deno.env.set(names[2],'sk_live_fixture');rejected(configuration)}finally{names.forEach((n,i)=>old[i]===undefined?Deno.env.delete(n):Deno.env.set(n,old[i]!))}
});
Deno.test('billing CORS accepts only the published website',()=>{assert(cors(new Request('https://example.test',{headers:{origin:'https://vtweaks-landing.vercel.app'}}))['Access-Control-Allow-Origin']==='https://vtweaks-landing.vercel.app');rejected(()=>cors(new Request('https://example.test',{headers:{origin:'https://attacker.example'}})))});
Deno.test('formatting artifacts from copied test keys cannot break HTTP headers',()=>{
  const old=Deno.env.get('VT_STRIPE_SECRET_KEY'),mode=Deno.env.get('VT_BILLING_MODE');
  try{Deno.env.set('VT_BILLING_MODE','test');Deno.env.set('VT_STRIPE_SECRET_KEY',' sk_test_\u2060fixture\u200b\n');assert(configuration().key==='sk_test_fixture');Deno.env.set('VT_STRIPE_SECRET_KEY','sk_test_invalid…');rejected(configuration)}finally{old===undefined?Deno.env.delete('VT_STRIPE_SECRET_KEY'):Deno.env.set('VT_STRIPE_SECRET_KEY',old);mode===undefined?Deno.env.delete('VT_BILLING_MODE'):Deno.env.set('VT_BILLING_MODE',mode)}
});
Deno.test('platform credentials support current named keys and legacy defaults',()=>{
  const names=['SUPABASE_SECRET_KEYS','SUPABASE_SERVICE_ROLE_KEY'],old=names.map(n=>Deno.env.get(n));
  try{Deno.env.set(names[0],JSON.stringify({billing:'sb_secret_fixture'}));Deno.env.delete(names[1]);assert(platformKey(names[0],names[1])==='sb_secret_fixture');Deno.env.set(names[0],JSON.stringify({default:'sb_secret_default',billing:'sb_secret_fixture'}));assert(platformKey(names[0],names[1])==='sb_secret_default');Deno.env.set(names[0],'invalid');Deno.env.set(names[1],'legacy_fixture');assert(platformKey(names[0],names[1])==='legacy_fixture')}finally{names.forEach((name,i)=>old[i]===undefined?Deno.env.delete(name):Deno.env.set(name,old[i]!))}
});
Deno.test('checkout identity, product, price, mode and amount are verified',()=>{
  const config={mode:'test',live:false,key:'sk_test_fixture',priceId:'price_fixture',webhook:'whsec_fixture',account:'acct_fixture',ready:true};
  const base={mode:'payment',livemode:false,metadata:{vt_order:'fixture',vt_user:'owner',vt_product:'premium'},client_reference_id:'owner',line_items:{data:[{price:{id:'price_fixture'},quantity:1}]},amount_total:1000,currency:'mxn'};
  assert(validateCheckout(base as unknown as Stripe.Checkout.Session,config)==='fixture');
  for(const change of [{livemode:true},{amount_total:0},{client_reference_id:'another'},{metadata:{vt_product:'other'}},{line_items:{data:[{price:{id:'price_other'},quantity:1}]}}])rejected(()=>validateCheckout({...base,...change} as unknown as Stripe.Checkout.Session,config));
});
Deno.test('late events cannot resurrect refunds or undo paid access',()=>{assert(nextStatus('refunded','paid','checkout.session.completed')==='refunded');assert(nextStatus('paid','failed','checkout.session.async_payment_failed')==='paid');assert(nextStatus('disputed','paid','checkout.session.completed')==='disputed');assert(nextStatus('disputed','paid','charge.dispute.closed')==='paid')});
Deno.test('full refunds close disputed purchases',()=>assert(nextStatus('disputed','refunded','charge.refunded')==='refunded'));
Deno.test('three packages enforce their server amount, currency and identity',()=>{
  const config={mode:'test',live:false,key:'sk_test_fixture',priceId:'price_legacy',webhook:'whsec_fixture',account:'acct_fixture',ready:true};
  assert(catalog.map(p=>p.amount).join(',')==='1499,1999,2499');
  for(const product of catalog){
    const selected=productConfiguration(config,product.id);
    const session={mode:'payment',livemode:false,metadata:{vt_order:'fixture',vt_user:'owner',vt_product:product.id},client_reference_id:'owner',line_items:{data:[{price:{id:product.testPrice},quantity:1}],has_more:false},amount_total:product.amount,currency:'usd'} as unknown as Stripe.Checkout.Session;
    assert(validateCheckout(session,selected)==='fixture');
    for(const change of [{amount_total:1},{currency:'mxn'},{metadata:{...session.metadata,vt_product:'other'}},{line_items:{...session.line_items,has_more:true}}])rejected(()=>validateCheckout({...session,...change} as Stripe.Checkout.Session,selected));
  }
  rejected(()=>productConfiguration(config,'invented'));
});
Deno.test('historical signed checkout prices remain verifiable after a price change',()=>{
  const config={mode:'test',live:false,key:'sk_test_fixture',priceId:'price_legacy',webhook:'whsec_fixture',account:'acct_fixture',ready:true};
  for(const product of catalog){
    const legacy=product.legacyTestPrices[0],selected=productConfiguration(config,product.id,legacy.id);
    const session={mode:'payment',livemode:false,metadata:{vt_order:'old_order',vt_user:'owner',vt_product:product.id},client_reference_id:'owner',line_items:{data:[{price:{id:legacy.id},quantity:1}],has_more:false},amount_total:legacy.amount,currency:'usd'} as unknown as Stripe.Checkout.Session;
    assert(validateCheckout(session,selected)==='old_order');
    rejected(()=>validateCheckout(session,productConfiguration(config,product.id)));
    rejected(()=>productConfiguration(config,product.id,'price_unapproved'));
    rejected(()=>productConfiguration({...config,live:true},product.id,legacy.id));
  }
});
Deno.test('Stripe SDK verifies raw-body signatures and rejects tampering',async()=>{
  const stripe=new Stripe('sk_test_fixture',{httpClient:Stripe.createFetchHttpClient()}),provider=Stripe.createSubtleCryptoProvider(),secret='whsec_fixture_not_a_real_key';
  const payload=JSON.stringify({id:'evt_fixture',object:'event',type:'checkout.session.completed',livemode:false,data:{object:{id:'cs_test_fixture'}}});
  const header=await stripe.webhooks.generateTestHeaderStringAsync({payload,secret,cryptoProvider:provider});
  const event=await stripe.webhooks.constructEventAsync(payload,header,secret,300,provider);assert(event.id==='evt_fixture');
  let failed=false;try{await stripe.webhooks.constructEventAsync(payload+' ',header,secret,300,provider)}catch{failed=true}assert(failed);
});
