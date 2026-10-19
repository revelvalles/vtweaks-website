import { z } from 'zod';
import { getSupabase, AccountActionError } from './auth';
import { accountRequest } from './account-request';
import type { ProductId } from './products';

export const orderSchema = z.object({id:z.string().uuid(),product:z.enum(['app','iso','bundle']).default('app'),mode:z.enum(['test','live']),status:z.enum(['pending','paid','expired','failed','refunded','disputed']),amount:z.number().int().positive().nullable(),currency:z.string().regex(/^[a-z]{3}$/).nullable(),created_at:z.string(),updated_at:z.string()});
export const billingHistorySchema = z.object({orders:z.array(orderSchema).max(30),test_premium:z.boolean()});
export const billingConfigSchema = z.object({ready:z.boolean(),mode:z.enum(['test','live']),allowed:z.boolean(),products:z.array(z.object({id:z.enum(['app','iso','bundle']),ready:z.boolean(),amount:z.number().int().positive(),currency:z.literal('usd')})).max(3).default([]),message:z.string().optional()});
export const checkoutResponseSchema=z.object({url:z.string().url(),orderId:z.string().uuid(),mode:z.enum(['test','live']),product:z.enum(['app','iso','bundle'])});
export type BillingHistory = z.infer<typeof billingHistorySchema>;
export type BillingConfig = z.infer<typeof billingConfigSchema>;
export function stripeCheckoutUrl(value: unknown) {
  if (typeof value!=='string') throw new AccountActionError('Stripe no devolvió una página de pago válida.');
  const url = new URL(value);
  if (url.protocol!=='https:' || url.hostname!=='checkout.stripe.com' || url.username || url.password || url.port) throw new AccountActionError('La página de pago no es válida.');
  return url.href;
}
export async function billingRequest(action:'config'|'checkout',signal?:AbortSignal,product?:ProductId) {
  return accountRequest(async requestSignal => {
    const {data,error} = await getSupabase().functions.invoke('vt-billing',{body:{action,product},signal:requestSignal});
    if (error) {
      let detail; try { detail = await error.context?.json?.(); } catch { /* Generic SDK failures contain no public explanation. */ }
      if(error.context?.status===401)throw new AccountActionError('Tu sesión de pago venció. Inicia sesión de nuevo para continuar.');
      throw new AccountActionError(typeof detail?.error==='string'?detail.error:'El servicio de pagos no está disponible. Vuelve a intentarlo.');
    }
    return data;
  },undefined,signal);
}
export async function billingHistory(signal?:AbortSignal) {
  const {data,error} = await accountRequest(requestSignal=>getSupabase().rpc('vt_billing_history').abortSignal(requestSignal),undefined,signal);
  if (error) throw new AccountActionError('No se pudo leer el historial de compras.');
  return billingHistorySchema.parse(data);
}
export const orderLabels = {pending:'Pendiente de confirmar',paid:'Pago confirmado',expired:'Checkout vencido',failed:'Pago fallido',refunded:'Reembolsado',disputed:'Pago en disputa'};
