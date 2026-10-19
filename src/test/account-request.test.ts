import { afterEach, describe, expect, it, vi } from 'vitest';
import { accountFetch, accountRequest, AccountTimeoutError } from '../lib/account-request';

afterEach(() => { vi.useRealTimers(); vi.unstubAllGlobals(); });
describe('bounded account requests', () => {
  it('aborts stalled work after 20 seconds and provides a safe retry message', async () => {
    vi.useFakeTimers(); let signal: AbortSignal | undefined;
    const work = accountRequest(s => { signal = s; return new Promise(() => {}); });
    const result = work.catch(error => error);
    await vi.advanceTimersByTimeAsync(20_001);
    expect(await result).toBeInstanceOf(AccountTimeoutError);
    expect(signal?.aborted).toBe(true);
    expect((await result as AccountTimeoutError).message).toContain('Vuelve a intentarlo');
    expect(vi.getTimerCount()).toBe(0);
  });
  it('preserves a caller abort instead of replacing it with a timeout signal', async () => {
    const caller = new AbortController(); let signal: AbortSignal | undefined;
    const work = accountRequest(s => { signal = s; return new Promise(() => {}); }, 20_000, caller.signal).catch(error => error);
    await Promise.resolve(); const reason = new DOMException('Cancelled by caller', 'AbortError'); caller.abort(reason);
    expect(await work).toBe(reason); expect(signal?.reason).toBe(reason);
  });
  it('does not start work for an already aborted caller and clears successful deadlines', async () => {
    vi.useFakeTimers(); const caller = new AbortController(); caller.abort(); const operation = vi.fn();
    await expect(accountRequest(operation, 20_000, caller.signal)).rejects.toMatchObject({name:'AbortError'});
    expect(operation).not.toHaveBeenCalled();
    await expect(accountRequest(() => 'done')).resolves.toBe('done'); expect(vi.getTimerCount()).toBe(0);
  });
  it('does not start a request cancelled before the work microtask runs', async () => {
    const caller=new AbortController(),operation=vi.fn();const result=accountRequest(operation,20_000,caller.signal).catch(error=>error);caller.abort();
    expect(await result).toMatchObject({name:'AbortError'});expect(operation).not.toHaveBeenCalled();
  });
  it('keeps the deadline through response body delivery and leaves successful JSON readable', async () => {
    vi.stubGlobal('fetch',vi.fn(async()=>new Response(JSON.stringify({ok:true}),{headers:{'content-type':'application/json'}})));
    const response=await accountFetch('https://unit.test/account');expect(await response.json()).toEqual({ok:true});
  });
  it('composes the Supabase fetch caller signal with its own deadline', async () => {
    const caller = new AbortController(); let signal: AbortSignal | undefined;
    vi.stubGlobal('fetch', vi.fn((_input, init) => { signal = init.signal; return new Promise(() => {}); }));
    const work = accountFetch('https://unit.test/account', {signal:caller.signal}).catch(error => error);
    await Promise.resolve(); caller.abort();
    expect(await work).toMatchObject({name:'AbortError'}); expect(signal?.aborted).toBe(true); expect(signal).not.toBe(caller.signal);
  });
});
