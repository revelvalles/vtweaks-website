import {BillingError,configuration,productConfiguration,stripeClient,serviceClient,userClient,cors,json,failure,rpc,approvedPrice,site} from '../_shared/billing.ts';
import {catalog} from '../_shared/products.ts';
Deno.serve(async(req:Request)=>{
  let headers:Record<string,string>={};
  try{
    headers=cors(req);
    if(req.method==='OPTIONS')return new Response(null,{status:204,headers});
    if(req.method!=='POST')return json({error:'Método no permitido.'},405,headers);
    if(Number(req.headers.get('content-length')||0)>4096)throw new BillingError(413,'Solicitud demasiado grande.');
    const {user,account}=await userClient(req),base=configuration();
    const raw=await req.text();if(raw.length>4096)throw new BillingError(413,'Solicitud demasiado grande.');
    let input;try{input=JSON.parse(raw)}catch{throw new BillingError(400,'Solicitud no válida.')}
    if(!input||typeof input!=='object'||Array.isArray(input))throw new BillingError(400,'Solicitud no válida.');
    if(input.action==='config'){
      const products=catalog.map(p=>{const c=productConfiguration(base,p.id);return {id:p.id,amount:p.amount,currency:p.currency,ready:c.ready}});
      return json({ready:products.every(p=>p.ready),mode:base.mode,allowed:true,products,message:base.live?'Pagos comerciales.':'Modo de prueba: no se cobra dinero real.'},200,headers);
    }
    if(input.action!=='checkout')throw new BillingError(400,'Acción no válida.');
    const config=productConfiguration(base,input.product);
    if(config.live&&config.product!=='app')throw new BillingError(503,'La entrega de ISO todavía no está habilitada.');
    if(config.live&&account.plan==='premium'&&config.product==='app')throw new BillingError(409,'La app Premium ya está activa en tu cuenta.');
    const stripe=stripeClient(config),price=await approvedPrice(stripe,config),db=serviceClient();
    const order=await rpc(db,'vt_billing_reserve',{p_user:user.id,p_mode:config.mode,p_price:price.id,p_product:config.product});
    if(order.session_id){
      const existing=await stripe.checkout.sessions.retrieve(order.session_id);
      if(existing.status==='open'&&existing.url&&existing.client_reference_id===user.id&&existing.metadata?.vt_product===config.product)return json({url:existing.url,mode:config.mode,orderId:order.id,product:config.product},200,headers);
      throw new BillingError(409,'El intento anterior ya terminó. Actualiza tus compras antes de continuar.');
    }
    const expires=Math.floor(new Date(order.expires_at).getTime()/1000);
    if(expires<Math.floor(Date.now()/1000)+1800)throw new BillingError(409,'El intento anterior está venciendo. Espera antes de iniciar otra compra.');
    const session=await stripe.checkout.sessions.create({
      mode:'payment',line_items:[{price:price.id,quantity:1}],allowed_payment_method_types:['card'],
      client_reference_id:user.id,customer_email:user.email,customer_creation:'always',
      metadata:{vt_order:order.id,vt_user:user.id,vt_product:config.product},
      payment_intent_data:{metadata:{vt_order:order.id,vt_product:config.product}},
      success_url:site+'/cuenta?payment=return#compras',cancel_url:site+'/cuenta?payment=cancelled&product='+config.product+'#compras',
      adaptive_pricing:{enabled:false},locale:'es',expires_at:expires,
    },{idempotencyKey:'vtweaks:checkout:'+order.id});
    if(!session.url||new URL(session.url).hostname!=='checkout.stripe.com')throw new BillingError(503,'Stripe no devolvió una página de pago válida.');
    await rpc(db,'vt_billing_attach',{p_order:order.id,p_session:session.id,p_amount:session.amount_total,p_currency:session.currency,p_expires:new Date(session.expires_at*1000).toISOString()});
    return json({url:session.url,mode:config.mode,orderId:order.id,product:config.product},200,headers);
  }catch(error){return failure(error,headers)}
});
