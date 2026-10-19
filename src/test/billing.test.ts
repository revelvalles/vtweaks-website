import {describe,it,expect,vi} from 'vitest';
vi.mock('../lib/auth',()=>({getSupabase:vi.fn(),AccountActionError:class extends Error{}}));
import {stripeCheckoutUrl,billingHistorySchema,billingConfigSchema} from '../lib/billing';
import {products,productId,purchasePath} from '../lib/products';
describe('billing boundaries',()=>{
  it('uses the current one-time USD prices and preserves package selection through login',()=>{expect(products.map(p=>[p.id,p.amount,p.currency])).toEqual([['app',1499,'usd'],['iso',1999,'usd'],['bundle',2499,'usd']]);for(const p of products){const url=new URL(purchasePath(p.id),'https://vtweaks-landing.vercel.app');expect(productId(url.searchParams.get('product'))).toBe(p.id);expect(url.searchParams.get('checkout')).toBe('1');expect(url.hash).toBe('#compras')}expect(productId('invented')).toBeUndefined()});
  it('allows only Stripe hosted HTTPS checkout',()=>{expect(stripeCheckoutUrl('https://checkout.stripe.com/c/pay/cs_test_fixture')).toContain('checkout.stripe.com');for(const url of ['https://checkout.stripe.com.attacker.test','http://checkout.stripe.com','javascript:alert(1)','https://user:secret@checkout.stripe.com','https://checkout.stripe.com:8443','https://attacker.test'])expect(()=>stripeCheckoutUrl(url)).toThrow()});
  it('keeps test payment history explicitly separate',()=>{const history=billingHistorySchema.parse({test_premium:true,orders:[{id:'12345678-1234-4123-8123-123456789012',mode:'test',status:'paid',amount:1000,currency:'mxn',created_at:'2026-10-13T12:00:00Z',updated_at:'2026-10-13T12:00:00Z'}]});expect(history.orders[0]?.mode).toBe('test');expect(history).not.toHaveProperty('plan')});
  it('rejects invalid history states and incomplete server configuration',()=>{expect(()=>billingHistorySchema.parse({orders:[],test_premium:'yes'})).toThrow();expect(()=>billingConfigSchema.parse({ready:true,allowed:true,mode:'invented'})).toThrow()});
});
