import {useEffect,useRef,useState} from 'react';
import {CreditCard,RefreshCw,ExternalLink} from 'lucide-react';
import {Button} from '@/components/ui/button';
import {useAuth,authMessage} from '@/lib/auth';
import {billingRequest,billingHistory,billingConfigSchema,checkoutResponseSchema,stripeCheckoutUrl,orderLabels,type BillingConfig,type BillingHistory} from '@/lib/billing';
import {products,productId,productName,productMoney,type ProductId} from '@/lib/products';
import {Busy,InfoNote} from './shared';

export function BillingPanel(){
  const auth=useAuth(),owner=auth.account?.id;
  const [selected,setSelected]=useState<ProductId>('app'),[config,setConfig]=useState<BillingConfig|null>(null),[history,setHistory]=useState<BillingHistory|null>(null),[loading,setLoading]=useState(true),[busy,setBusy]=useState(false),[error,setError]=useState(''),[revision,setRevision]=useState(0),[returned,setReturned]=useState<string|null>(null);
  const pending=useRef(false),mounted=useRef(true),autoStarted=useRef(false);
  useEffect(()=>{mounted.current=true;const query=new URLSearchParams(window.location.search);setSelected(productId(query.get('product'))||'app');setReturned(query.get('payment'));return()=>{mounted.current=false}},[]);
  useEffect(()=>{
    const controller=new AbortController(),valid=auth.accountGuard();let timer:ReturnType<typeof setTimeout>|undefined,attempt=0;
    setConfig(null);setHistory(null);setLoading(true);setError('');
    if(!owner){setLoading(false);return()=>controller.abort()}
    async function load(){
      const [settings,orders]=await Promise.allSettled([billingRequest('config',controller.signal),billingHistory(controller.signal)]);
      if(controller.signal.aborted||!valid())return;
      const problems:string[]=[];
      try{if(settings.status==='fulfilled')setConfig(billingConfigSchema.parse(settings.value));else problems.push(authMessage(settings.reason));}catch(e){problems.push(authMessage(e))}
      if(orders.status==='fulfilled'){
        setHistory(orders.value);
        let awaiting:string|null=null;try{awaiting=sessionStorage.getItem('vt-checkout:'+owner)}catch{}
        const purchase=orders.value.orders.find(o=>o.id===awaiting);
        if(purchase&&purchase.status!=='pending'){try{sessionStorage.removeItem('vt-checkout:'+owner)}catch{};if(purchase.status==='paid')void auth.refresh();}
        else if(purchase?.status==='pending'&&new URLSearchParams(window.location.search).get('payment')==='return'&&attempt++<10)timer=setTimeout(()=>void load(),2000);
      }else problems.push(authMessage(orders.reason));
      setError(problems.join(' '));setLoading(false);
    }
    void load();return()=>{controller.abort();clearTimeout(timer)};
  },[owner,revision]);
  async function checkout(product:ProductId=selected){
    if(pending.current||!owner)return;const valid=auth.accountGuard();pending.current=true;setBusy(true);setError('');
    try{
      const data=checkoutResponseSchema.parse(await billingRequest('checkout',undefined,product));
      if(!mounted.current||!valid())return;
      if(data.product!==product||data.mode!==config?.mode)throw Error('La respuesta de pago no coincide con el paquete elegido.');
      const url=stripeCheckoutUrl(data.url);try{sessionStorage.setItem('vt-checkout:'+owner,data.orderId)}catch{}
      window.location.assign(url);
    }catch(e){if(mounted.current&&valid())setError(authMessage(e))}
    finally{pending.current=false;if(mounted.current)setBusy(false)}
  }
  useEffect(()=>{
    if(!owner||!config?.ready||!config.allowed||autoStarted.current)return;
    const query=new URLSearchParams(window.location.search),chosen=productId(query.get('product'));
    if(query.get('checkout')!=='1'||!chosen)return;
    autoStarted.current=true;query.delete('checkout');
    window.history.replaceState(window.history.state,'',window.location.pathname+(query.size?'?'+query:'')+'#compras');
    setSelected(chosen);void checkout(chosen);
  },[owner,config]);
  if(!owner)return null;
  const selection=products.find(p=>p.id===selected)!,serverPrice=config?.products.find(p=>p.id===selected),ready=Boolean(config?.allowed&&serverPrice?.ready);
  return <section id="compras" className="billing-panel" aria-labelledby="billing-title"><div className="billing-heading"><div><span className="eyebrow"><CreditCard size={14}/> LICENCIA Y COMPRAS</span><h2 id="billing-title">Elige tu paquete.</h2></div><Button variant="outline" aria-label="Actualizar compras y licencia" disabled={loading||busy} onClick={()=>{void auth.refresh();setRevision(v=>v+1)}}><RefreshCw size={16}/>Actualizar</Button></div>
    <InfoNote>{config?.mode==='live'?'Pago único en USD.':'Modo de prueba · no se cobra dinero real. Usa únicamente una tarjeta de prueba de Stripe.'}</InfoNote>
    {returned==='cancelled'&&<p className="form-notice" role="status">Volviste del checkout. Puedes continuar el intento pendiente o elegir otro paquete.</p>}
    {returned==='return'&&!history?.orders.some(o=>o.status==='paid')&&<p className="small-note" role="status">Esperando la confirmación del servidor. Volver de Stripe no confirma por sí solo un pago.</p>}
    <div className="billing-products" role="group" aria-label="Paquetes disponibles">{products.map(product=><button type="button" key={product.id} className="billing-product" aria-pressed={selected===product.id} disabled={busy} onClick={()=>setSelected(product.id)}><span>{product.name}</span><strong>{productMoney(product.amount,product.currency)}</strong><small>Pago único{product.includesIso?' · ISO pendiente de entrega':''}</small></button>)}</div>
    {loading?<Busy label="Consultando compras"/>:<div className="billing-checkout"><div><strong>{selection.name}</strong><p className="small-note">{selection.description}{selection.includesIso?' La prueba no entrega una ISO ni una licencia de Windows.':''}</p></div><Button disabled={busy||!ready||config?.mode==='live'&&selected==='app'&&auth.account?.plan==='premium'} onClick={()=>void checkout()}>{busy?<Busy label="Abriendo Stripe"/>:<>{config?.mode==='live'?'Ir al pago':'Probar pago'} · {productMoney(serverPrice?.amount||selection.amount,serverPrice?.currency||selection.currency)}<ExternalLink size={14}/></>}</Button></div>}
    {!loading&&!ready&&<p className="small-note">El pago de este paquete todavía no está disponible. Pulsa Actualizar para volver a comprobarlo.</p>}
    {error&&<p className="form-error" role="alert">{error}</p>}
    {history&&<div className="billing-history"><h3>Tus compras</h3>{history.orders.length?<ul aria-label="Historial de compras">{history.orders.map(order=><li key={order.id}><div><strong>{productName(order.product)}</strong><span>{orderLabels[order.status]}{order.mode==='test'?' · Prueba sin cobro real':''}</span><time dateTime={order.created_at}>{new Date(order.created_at).toLocaleDateString('es-MX')}</time></div><span>{order.amount&&order.currency?productMoney(order.amount,order.currency):'—'}</span></li>)}</ul>:<p className="small-note">Todavía no hay compras registradas.</p>}{history.orders.some(o=>o.status==='paid'&&o.mode==='test')&&<p className="form-notice" role="status">Pago de prueba confirmado. Tu licencia comercial sigue siendo {auth.account?.plan==='premium'?'Premium':'Free'}.</p>}</div>}
  </section>;
}
