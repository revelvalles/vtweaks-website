import {configuration,productConfiguration,stripeClient,approvedPrice,platformKey,json} from '../_shared/billing.ts';
import {catalog} from '../_shared/products.ts';
let cache:{at:number;result:unknown}|undefined;
// Public product readiness only: no user information, credentials or database writes.
Deno.serve(async req=>{
  if(req.method!=='GET')return json({error:'Método no permitido.'},405);
  if(cache&&Date.now()-cache.at<60000)return json(cache.result);
  let result:unknown,stage='platform';
  try{
    const base=configuration();
    if(base.live)return json({ready:false,issue:'live_diagnostics_disabled'});
    if(!platformKey('SUPABASE_PUBLISHABLE_KEYS','SUPABASE_ANON_KEY')||!platformKey('SUPABASE_SECRET_KEYS','SUPABASE_SERVICE_ROLE_KEY'))throw Error('platform_credentials_missing');
    stage='stripe';
    const checks=await Promise.all(catalog.map(async product=>{const c=productConfiguration(base,product.id);const price=await approvedPrice(stripeClient(c),c);return {product:product.id,ready:true,amount:price.unit_amount,currency:price.currency}}));
    result={ready:true,mode:'test',products:checks};
  }catch(error){
    const e=error as {name?:string;code?:string;param?:string;message?:string};
    result={ready:false,mode:'test',issue:stage==='platform'?'configuration_unavailable':'stripe_unavailable'};
    console.error('checkout_readiness',{kind:e.name,code:e.code,param:e.param,platformMissing:e.message==='platform_credentials_missing'});
  }
  cache={at:Date.now(),result};return json(result);
});
