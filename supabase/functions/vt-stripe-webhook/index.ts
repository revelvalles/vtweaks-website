import Stripe from 'stripe';
import { BillingError,configuration,productConfiguration,stripeClient,serviceClient,json,failure,rpc,validateCheckout } from '../_shared/billing.ts';
import {supportedProduct} from '../_shared/products.ts';

const checkoutEvents = new Set(['checkout.session.completed','checkout.session.async_payment_succeeded','checkout.session.async_payment_failed','checkout.session.expired']);
const chargeEvents = new Set(['charge.refunded','charge.dispute.created','charge.dispute.closed']);
Deno.serve(async(req: Request) => {
  try {
    if (req.method!=='POST') return json({error:'Método no permitido.'},405);
    const config = configuration(), stripe = stripeClient(config);
    if (Number(req.headers.get('content-length') || 0)>1048576) throw new BillingError(413,'Evento demasiado grande.');
    const signature = req.headers.get('stripe-signature'); if (!signature) throw new BillingError(400,'Falta la firma del evento.');
    const body = await req.text(); if (body.length>1048576) throw new BillingError(413,'Evento demasiado grande.');
    let event: Stripe.Event;
    try { event = await stripe.webhooks.constructEventAsync(body,signature,config.webhook,300,Stripe.createSubtleCryptoProvider()); }
    catch { throw new BillingError(400,'Firma de Stripe no válida.'); }
    if (event.livemode!==config.live) throw new BillingError(400,'El evento no corresponde al modo configurado.');
    if (!checkoutEvents.has(event.type) && !chargeEvents.has(event.type)) return json({received:true,ignored:true});
    let sessionId: string | undefined, status: string | undefined;
    if (checkoutEvents.has(event.type)) {
      sessionId = (event.data.object as Stripe.Checkout.Session).id;
    } else {
      let intent: string | null = null;
      if (event.type==='charge.refunded') {
        const charge = await stripe.charges.retrieve(event.data.object.id);
        if (charge.amount_refunded < charge.amount) return json({received:true,partialRefund:true});
        intent = typeof charge.payment_intent==='string'?charge.payment_intent:charge.payment_intent?.id || null;
        status = 'refunded';
      } else {
        const dispute = await stripe.disputes.retrieve((event.data.object as {id:string}).id);
        intent = typeof dispute.payment_intent==='string'?dispute.payment_intent:dispute.payment_intent?.id || null;
        status = ['won','warning_closed','prevented'].includes(dispute.status)?'paid':'disputed';
      }
      if (!intent) return json({received:true,ignored:true});
      const list = await stripe.checkout.sessions.list({payment_intent:intent,limit:10});
      sessionId = list.data.find(s=>s.metadata?.vt_product==='premium'||supportedProduct(s.metadata?.vt_product))?.id;
      if (!sessionId) return json({received:true,ignored:true});
    }
    const session = await stripe.checkout.sessions.retrieve(sessionId!,{expand:['line_items','payment_intent.latest_charge']});
    if (session.metadata?.vt_product!=='premium'&&!supportedProduct(session.metadata?.vt_product)) return json({received:true,ignored:true});
    const selected=session.metadata?.vt_product==='premium'?config:productConfiguration(config,session.metadata?.vt_product,session.line_items?.data[0]?.price?.id);
    const orderId = validateCheckout(session,selected);
    const intent = typeof session.payment_intent==='object'?session.payment_intent:null;
    const charge = intent && typeof intent.latest_charge==='object'?intent.latest_charge:null;
    // Re-read Stripe state so a late completion cannot resurrect a refunded order.
    if (charge?.refunded) status='refunded';
    else if (charge?.disputed) {
      const disputes=await stripe.disputes.list({charge:charge.id,limit:100});
      if (!disputes.data.length || disputes.has_more || disputes.data.some(d=>!['won','warning_closed','prevented'].includes(d.status))) status='disputed';
    }
    if (!status) {
      if (session.payment_status==='paid') status='paid';
      else if (session.status==='expired') status='expired';
      else if (event.type==='checkout.session.async_payment_failed') status='failed';
      else return json({received:true,pending:true});
    }
    if (status==='paid' && session.payment_status!=='paid') throw new BillingError(400,'Stripe todavía no confirmó el pago.');
    const paymentId = typeof session.payment_intent==='string'?session.payment_intent:session.payment_intent?.id || null;
    const result = await rpc(serviceClient(),'vt_billing_record',{p_event:event.id,p_type:event.type,p_order:orderId,p_session:session.id,p_payment:paymentId,p_price:selected.priceId,p_status:status,p_amount:session.amount_total,p_currency:session.currency,p_livemode:event.livemode});
    return json({received:true,...result});
  } catch(error) { return failure(error); }
});
