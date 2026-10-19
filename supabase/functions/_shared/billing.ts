import Stripe from 'stripe';
import { createClient } from '@supabase/supabase-js';
import {catalog} from './products.ts';

export const site = 'https://vtweaks-landing.vercel.app';
const testAccount = 'acct_1UQ9XSChkdIuPYsY';
export class BillingError extends Error { constructor(public status: number, message: string) { super(message); } }
export function platformKey(dictionary:string,legacy:string){
  try{const keys=JSON.parse(Deno.env.get(dictionary)||'{}');const value=keys?.default||Object.values(keys).find(v=>typeof v==='string'&&v.startsWith(dictionary==='SUPABASE_SECRET_KEYS'?'sb_secret_':'sb_publishable_'));if(typeof value==='string'&&value)return value}catch{}
  return Deno.env.get(legacy)||'';
}
export function configuration() {
  const mode = Deno.env.get('VT_BILLING_MODE') || 'test';
  if (!['test','live'].includes(mode)) throw new BillingError(503,'Configuración de pagos no válida.');
  const key = (Deno.env.get('VT_STRIPE_SECRET_KEY') || '').replace(/[\s\p{Cf}]/gu,'');
  const priceId = Deno.env.get('VT_STRIPE_PRICE_ID') || '';
  const webhook = Deno.env.get('VT_STRIPE_WEBHOOK_SECRET') || '';
  const live = mode === 'live';
  if (live && Deno.env.get('VT_BILLING_LIVE_ENABLED') !== 'true') throw new BillingError(503,'La venta pública todavía no está habilitada.');
  if (key && !key.startsWith(live ? 'sk_live_' : 'sk_test_') && !key.startsWith(live ? 'rk_live_' : 'rk_test_')) throw new BillingError(503,'Las credenciales no corresponden al modo de pagos.');
  if(key&&!/^(?:sk|rk)_(?:test|live)_[A-Za-z0-9]+$/.test(key))throw new BillingError(503,'La credencial de Stripe contiene caracteres de copia no válidos.');
  const account = live ? Deno.env.get('VT_STRIPE_LIVE_ACCOUNT_ID') : testAccount;
  return { mode, live, key, priceId, webhook, account, ready:Boolean(key && /^price_[A-Za-z0-9]+$/.test(priceId) && webhook.startsWith('whsec_') && account) };
}
export function stripeClient(config: ReturnType<typeof configuration>) {
  if (!config.ready) throw new BillingError(503,'Los pagos siguen en configuración. Vuelve a intentarlo más tarde.');
  return new Stripe(config.key, { httpClient:Stripe.createFetchHttpClient(), maxNetworkRetries:1, timeout:15000 });
}
export function serviceClient() {
  const url = Deno.env.get('SUPABASE_URL'), key = platformKey('SUPABASE_SECRET_KEYS','SUPABASE_SERVICE_ROLE_KEY');
  if (!url || !key) throw new BillingError(503,'El servicio de compras no está disponible.');
  return createClient(url,key,{auth:{persistSession:false,autoRefreshToken:false}});
}
export function productConfiguration(config:ReturnType<typeof configuration>,sku:unknown,settledPrice?:string){
  const product=catalog.find(p=>p.id===sku);
  if(!product)throw new BillingError(400,'Elige App, ISO o ISO + App.');
  let priceId:string=config.live?(Deno.env.get('VT_STRIPE_PRICE_'+product.id.toUpperCase())||''):product.testPrice;
  let amount:number=product.amount;
  // Only signed webhook processing supplies a settled price. New checkouts always use the current price.
  if(settledPrice&&settledPrice!==priceId){
    const legacy=!config.live?product.legacyTestPrices.find(p=>p.id===settledPrice):undefined;
    if(!legacy)throw new BillingError(400,'El precio no corresponde al paquete.');
    priceId=legacy.id;amount=legacy.amount;
  }
  return {...config,priceId,product:product.id,expectedAmount:amount,expectedCurrency:product.currency,ready:config.ready&&/^price_[A-Za-z0-9]+$/.test(priceId)};
}
export async function userClient(req: Request) {
  const authorization = req.headers.get('authorization') || '';
  if (!/^Bearer [A-Za-z0-9._-]+$/.test(authorization)) throw new BillingError(401,'Inicia sesión antes de comprar.');
  const url=Deno.env.get('SUPABASE_URL'),key=platformKey('SUPABASE_PUBLISHABLE_KEYS','SUPABASE_ANON_KEY');
  if(!url||!key)throw new BillingError(503,'La conexión de cuentas no está configurada.');
  const api = createClient(url,key,{global:{headers:{Authorization:authorization}},auth:{persistSession:false,autoRefreshToken:false}});
  const {data:{user},error} = await api.auth.getUser(authorization.slice(7));
  if (error || !user || !user.email_confirmed_at) throw new BillingError(401,'Se requiere una cuenta con correo confirmado.');
  const {data:account,error:profileError} = await api.rpc('vt_account');
  if (profileError || account?.id !== user.id) throw new BillingError(403,'No se pudo verificar tu cuenta.');
  return {api,user,account};
}
export function cors(req: Request) {
  const origin = req.headers.get('origin');
  if (origin && origin !== site) throw new BillingError(403,'Origen no permitido.');
  return {'Access-Control-Allow-Origin':site,'Access-Control-Allow-Headers':'authorization,apikey,content-type,x-client-info','Access-Control-Allow-Methods':'POST,OPTIONS','Vary':'Origin'};
}
export function json(value: unknown,status=200,headers:Record<string,string>={}) { return new Response(JSON.stringify(value),{status,headers:{'Content-Type':'application/json','Cache-Control':'no-store',...headers}}); }
export function failure(error: unknown,headers:Record<string,string>={}) {
  if(!(error instanceof BillingError)){
    const e=error as {name?:string;code?:string;param?:string};
    console.error('vt_billing_failure',{kind:e?.name||'unknown',code:e?.code||null,param:e?.param||null});
  }
  return json({error:error instanceof BillingError?error.message:'No se pudo completar la operación. Vuelve a intentarlo.'},error instanceof BillingError?error.status:503,headers);
}
export async function rpc(api: ReturnType<typeof serviceClient>,name: string,args: Record<string,unknown>) {
  const {data,error} = await api.rpc(name,args);
  if (error) throw new BillingError(503,'No se pudo registrar la compra. Vuelve a intentarlo desde tu cuenta.');
  return data;
}
export async function approvedPrice(stripe: Stripe,config: ReturnType<typeof configuration>&{expectedAmount?:number;expectedCurrency?:string}) {
  const [account,price] = await Promise.all([stripe.accounts.retrieve(null),stripe.prices.retrieve(config.priceId,{expand:['product']})]);
  if (account.id !== config.account || price.livemode !== config.live || !price.active || price.type !== 'one_time' || !price.unit_amount || price.unit_amount<=0 || typeof price.product === 'string' || price.product.deleted || !price.product.active) throw new BillingError(503,'El producto de pago no está configurado correctamente.');
  if(config.expectedAmount!==undefined&&(price.unit_amount!==config.expectedAmount||price.currency!==config.expectedCurrency))throw new BillingError(503,'El precio de Stripe no coincide con el paquete.');
  return price;
}
export function validateCheckout(session: Stripe.Checkout.Session,config: ReturnType<typeof configuration>&{product?:string;expectedAmount?:number;expectedCurrency?:string}) {
  const items = session.line_items?.data;
  if (session.livemode !== config.live || session.mode !== 'payment' || !session.metadata?.vt_order || session.metadata?.vt_product !== (config.product||'premium') || !items || items.length !== 1 || session.line_items?.has_more || items[0].price?.id !== config.priceId || items[0].quantity !== 1 || !session.amount_total || session.amount_total <= 0 || !session.currency || session.metadata.vt_user !== session.client_reference_id) throw new BillingError(400,'El pago no corresponde al paquete de VTweaks.');
  if(config.expectedAmount!==undefined&&(session.amount_total!==config.expectedAmount||session.currency!==config.expectedCurrency))throw new BillingError(400,'El importe o la moneda del pago no coincide.');
  return session.metadata.vt_order;
}
export function nextStatus(previous: string,incoming: string,eventType: string) {
  if (previous==='refunded' || previous==='disputed' && !(incoming==='refunded'||incoming==='paid' && eventType==='charge.dispute.closed') || previous==='paid' && ['failed','expired'].includes(incoming)) return previous;
  return incoming;
}
