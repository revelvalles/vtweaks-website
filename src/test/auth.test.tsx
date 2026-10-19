import { act, cleanup, render, waitFor } from '@testing-library/react';
import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest';
import { AuthProvider, useAuth, authMessage } from '../lib/auth';

const mock = vi.hoisted(() => {
  const auth = {getSession:vi.fn(),getUser:vi.fn(),onAuthStateChange:vi.fn(),signInWithPassword:vi.fn(),signUp:vi.fn(),verifyOtp:vi.fn(),exchangeCodeForSession:vi.fn(),resetPasswordForEmail:vi.fn(),resend:vi.fn(),updateUser:vi.fn(),signOut:vi.fn()};
  return {auth, rpc:vi.fn(), createClient:vi.fn(), listener:undefined as undefined|((event:string,session:any)=>void)};
});
vi.mock('@supabase/supabase-js', () => ({ createClient: (...args:any[]) => { mock.createClient(...args); return {auth:mock.auth,rpc:(name:string,args:unknown)=>({abortSignal:(signal:AbortSignal)=>mock.rpc(name,args,signal)})}; } }));
const profile = (id='user-a', plan='free') => ({id,email:id+'@example.test',email_confirmed:true,display_name:id,created_at:'2026-10-01T00:00:00Z',marketing_opt_in:false,consent_at:null,plan,license_status:'active',valid_until:null,is_admin:false});
const session = (id='user-a') => ({user:{id},access_token:'mock-access',refresh_token:'mock-refresh'});
function deferred<T>() { let resolve!:(value:T)=>void; const promise=new Promise<T>(done=>{resolve=done}); return {promise,resolve}; }
let latest:ReturnType<typeof useAuth>;
function Probe() { latest=useAuth(); return <output data-testid="auth">{latest.account?.id??'none'}|{String(latest.sessionActive)}|{String(latest.recovery)}|{latest.error}</output>; }
async function mount() { const result=render(<AuthProvider><Probe/></AuthProvider>); await waitFor(()=>expect(latest.loading).toBe(false)); return result; }
beforeEach(() => {
  vi.clearAllMocks(); sessionStorage.clear(); history.replaceState({},'', '/cuenta');
  mock.auth.getSession.mockResolvedValue({data:{session:session()},error:null});
  mock.auth.getUser.mockResolvedValue({data:{user:{id:'user-a'}},error:null});
  mock.auth.onAuthStateChange.mockImplementation(listener=>{mock.listener=listener;return {data:{subscription:{unsubscribe:vi.fn()}}}});
  mock.rpc.mockImplementation(()=>Promise.resolve({data:profile(),error:null}));
  mock.auth.signInWithPassword.mockResolvedValue({data:{session:session(),user:{id:'user-a'}},error:null});
  mock.auth.signUp.mockResolvedValue({data:{session:null,user:{id:'user-a'}},error:null});
  mock.auth.verifyOtp.mockResolvedValue({data:{session:session(),user:{id:'user-a'}},error:null});
  mock.auth.updateUser.mockResolvedValue({data:{user:{id:'user-a'}},error:null});
  mock.auth.signOut.mockImplementation(async()=>{mock.auth.getSession.mockResolvedValue({data:{session:null},error:null}); mock.listener?.('SIGNED_OUT',null); return {error:null};});
});
afterEach(()=>{cleanup();vi.useRealTimers();vi.restoreAllMocks();});
describe('account state and identity guards',()=>{
  it('does not restore preferences after logout starts or completes',async()=>{
    await mount(); const saved=deferred<any>(); mock.rpc.mockImplementation(name=>name==='vt_set_preferences'?saved.promise:Promise.resolve({data:profile(),error:null}));
    let saving!:Promise<unknown>; await act(async()=>{saving=latest.preferences('changed',true).catch(error=>error);});
    await act(async()=>{await latest.signOut();});
    await act(async()=>{saved.resolve({data:{...profile(),display_name:'changed'},error:null});});
    expect(await saving).toBeInstanceOf(Error); expect(latest.account).toBe(null); expect(latest.sessionActive).toBe(false);
  });
  it('invalidates a pending save before a slow logout returns from the SDK',async()=>{
    await mount();const saved=deferred<any>(),leaving=deferred<any>();mock.rpc.mockImplementation(name=>name==='vt_set_preferences'?saved.promise:Promise.resolve({data:profile(),error:null}));
    mock.auth.signOut.mockReturnValue(leaving.promise);let saving!:Promise<unknown>,logout!:Promise<void>;
    await act(async()=>{saving=latest.preferences('old name',true).catch(error=>error);});
    await act(async()=>{logout=latest.signOut();});
    await act(async()=>{saved.resolve({data:profile(),error:null});});expect(await saving).toBeInstanceOf(Error);expect(latest.account).toBe(null);
    await act(async()=>{leaving.resolve({error:null});await logout;});expect(latest.account).toBe(null);
  });
  it('does not replace a newly signed-in account with an earlier preference response',async()=>{
    await mount(); const saved=deferred<any>(); mock.rpc.mockImplementation(name=>name==='vt_set_preferences'?saved.promise:Promise.resolve({data:profile('user-b'),error:null}));
    let saving!:Promise<unknown>; await act(async()=>{saving=latest.preferences('old name',true).catch(error=>error);});
    mock.auth.getSession.mockResolvedValue({data:{session:session('user-b')},error:null}); mock.auth.getUser.mockResolvedValue({data:{user:{id:'user-b'}},error:null});
    act(()=>mock.listener?.('SIGNED_IN',session('user-b'))); await waitFor(()=>expect(latest.account?.id).toBe('user-b'));
    await act(async()=>{saved.resolve({data:profile('user-a'),error:null});});
    expect(await saving).toBeInstanceOf(Error); expect(latest.account?.id).toBe('user-b');
  });
  it('rereads the real plan on TOKEN_REFRESHED and ignores an older in-flight result',async()=>{
    await mount(); const old=deferred<any>(),fresh=deferred<any>(); mock.rpc.mockReturnValueOnce(old.promise).mockReturnValueOnce(fresh.promise);
    act(()=>mock.listener?.('TOKEN_REFRESHED',session())); await waitFor(()=>expect(mock.rpc).toHaveBeenCalledTimes(2));
    act(()=>mock.listener?.('TOKEN_REFRESHED',session())); await waitFor(()=>expect(mock.rpc).toHaveBeenCalledTimes(3));
    await act(async()=>{fresh.resolve({data:profile('user-a','premium'),error:null});}); expect(latest.account?.plan).toBe('premium');
    await act(async()=>{old.resolve({data:profile('user-a','free'),error:null});}); expect(latest.account?.plan).toBe('premium');
  });
  it('keeps verified session and a retry path when only the profile RPC fails',async()=>{
    mock.rpc.mockResolvedValue({data:null,error:{code:'42501',message:'private server details'}}); await mount();
    expect(latest.account).toBe(null); expect(latest.sessionActive).toBe(true); expect(latest.error).toContain('permiso');
    mock.rpc.mockResolvedValue({data:profile(),error:null}); await act(async()=>{await latest.refresh();}); expect(latest.account?.id).toBe('user-a'); expect(latest.error).toBe('');
  });
  it('clears verified flags when a previously valid session can no longer be verified',async()=>{
    await mount(); mock.auth.getUser.mockResolvedValue({data:{user:null},error:{code:'bad_jwt'}});
    await act(async()=>{await latest.refresh();}); expect(latest.account).toBe(null); expect(latest.sessionActive).toBe(false); expect(latest.recovery).toBe(false);
  });
  it('never accepts login without a real session or profile',async()=>{
    mock.auth.getSession.mockResolvedValue({data:{session:null},error:null}); await mount();
    mock.auth.signInWithPassword.mockResolvedValue({data:{session:null,user:null},error:null});
    await act(async()=>{await expect(latest.signIn('a@example.test','password')).rejects.toThrow('verificar el inicio');});
    expect(latest.account).toBe(null); expect(latest.sessionActive).toBe(false);
    mock.auth.signInWithPassword.mockResolvedValue({data:{session:session(),user:{id:'user-a'}},error:null});
    mock.auth.getSession.mockResolvedValue({data:{session:session()},error:null}); mock.rpc.mockResolvedValue({data:null,error:{code:'42501'}});
    await act(async()=>{await expect(latest.signIn('a@example.test','password')).rejects.toThrow('leer el perfil');}); expect(latest.account).toBe(null);
  });
  it('rejects an empty signup result and never leaks arbitrary SDK error messages',async()=>{
    await mount(); mock.auth.signUp.mockResolvedValue({data:{session:null,user:null},error:null});
    await act(async()=>{await expect(latest.signUp('a@example.test','long-password','long-password',false)).rejects.toThrow('completar el registro');});
    expect(authMessage(new Error('https://unit.test/?access_token=private&password=secret'))).not.toMatch(/private|secret|unit.test/);
  });
  it('ends a stalled initialization after 20 seconds, ignores late completion, and can retry',async()=>{
    vi.useFakeTimers(); const slow=deferred<any>(); mock.auth.getSession.mockReturnValue(slow.promise);
    render(<AuthProvider><Probe/></AuthProvider>); await act(async()=>{await vi.advanceTimersByTimeAsync(20_001);});
    expect(latest.loading).toBe(false); expect(latest.error).toContain('tardó demasiado'); expect(latest.sessionActive).toBe(false);
    await act(async()=>{slow.resolve({data:{session:session()},error:null});}); expect(mock.auth.getUser).not.toHaveBeenCalled(); expect(latest.account).toBe(null);
    mock.auth.getSession.mockResolvedValue({data:{session:session()},error:null}); await act(async()=>{await latest.refresh();}); expect(latest.account?.id).toBe('user-a');
  });
  it('preserves a verified recovery on reload without storing credentials, and removes it after logout',async()=>{
    const view=await mount(); await act(async()=>{await latest.verifyCode('a@example.test','123456','recovery');});
    expect(latest.recovery).toBe(true); const marker=sessionStorage.getItem('vtweaks-recovery-intent'); expect(marker).toContain('user-a'); expect(marker).not.toMatch(/mock-access|mock-refresh|password|example.test/);
    view.unmount(); await mount(); expect(latest.recovery).toBe(true); expect(latest.sessionActive).toBe(true);
    await act(async()=>{await latest.signOut();}); expect(sessionStorage.getItem('vtweaks-recovery-intent')).toBe(null);
  });
  it('does not restore another users recovery marker',async()=>{
    sessionStorage.setItem('vtweaks-recovery-intent',JSON.stringify({userId:'user-b',expiresAt:Date.now()+60_000})); await mount();
    expect(latest.recovery).toBe(false); expect(sessionStorage.getItem('vtweaks-recovery-intent')).toBe(null);
  });
});
