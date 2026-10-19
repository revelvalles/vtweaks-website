import { createContext, useContext, useEffect, useRef, useState, type ReactNode } from 'react';
import { createClient, type SupabaseClient } from '@supabase/supabase-js';
import { accountConfig, emailRedirect } from './account-config';
import { emailSchema, loginSchema, passwordSchema, preferenceSchema, registerSchema } from './account-rules';
import { accountFetch, accountRequest, AccountTimeoutError, AccountActionError } from './account-request';
export { AccountActionError } from './account-request';
import { forgetRecovery, recoveryExpiry, rememberRecovery } from './recovery-intent';
import { z } from 'zod';

export interface Account { id:string;email:string;email_confirmed:boolean;display_name:string|null;created_at:string;marketing_opt_in:boolean;consent_at:string|null;plan:string;license_status:string;valid_until:string|null;is_admin:boolean }
let client: SupabaseClient | undefined;
export function getSupabase() {
  if (!client) client = createClient(accountConfig.url, accountConfig.publishableKey, {
    global: { fetch: accountFetch },
    auth: { flowType:'pkce', detectSessionInUrl:false, persistSession:true, autoRefreshToken:true, storageKey:'vtweaks-web-auth' },
  });
  return client;
}
export function accountRpc(name: string, args?: Record<string, unknown>, signal?: AbortSignal) {
  return accountRequest(requestSignal => getSupabase().rpc(name, args).abortSignal(requestSignal), undefined, signal);
}
const changedAccount = () => new AccountActionError('La sesión cambió durante la operación. Vuelve a intentarlo desde tu cuenta actual.');
export function authMessage(error: unknown): string {
  if (error instanceof z.ZodError) return error.issues[0]?.message ?? 'Revisa los datos.';
  if (error instanceof AccountTimeoutError || (error as {code?:string})?.code === 'account_timeout') return new AccountTimeoutError().message;
  if (error instanceof AccountActionError) return error.message;
  const e = error as {code?:string;name?:string;status?:number};
  const codes: Record<string,string> = {
    invalid_credentials:'El correo o la contraseña no son correctos.', email_not_confirmed:'Confirma tu correo antes de iniciar sesión.',
    weak_password:'Usa una contraseña más segura, de al menos 10 caracteres.', same_password:'Elige una contraseña diferente.',
    otp_expired:'El enlace o código venció. Solicita uno nuevo.', bad_code_verifier:'Abre el enlace en el navegador donde lo solicitaste. Si ya confirmaste el correo, inicia sesión.',
    flow_state_expired:'Este enlace venció. Solicita uno nuevo.', over_email_send_rate_limit:'Espera antes de pedir otro correo.',
    signup_disabled:'El registro está temporalmente cerrado.', email_address_not_authorized:'El envío de correos todavía no está habilitado para todos los usuarios.',
    session_not_found:'Tu sesión venció. Inicia sesión de nuevo.', session_expired:'Tu sesión venció. Inicia sesión de nuevo.',
    refresh_token_not_found:'Tu sesión venció. Inicia sesión de nuevo.', refresh_token_already_used:'Tu sesión venció. Inicia sesión de nuevo.', bad_jwt:'Tu sesión venció. Inicia sesión de nuevo.',
    user_banned:'Esta cuenta no tiene acceso al servicio.', '42501':'Tu cuenta no tiene permiso para esta operación.',
  };
  if (e?.code && codes[e.code]) return codes[e.code]!;
  if (e?.status === 429) return 'Demasiados intentos. Espera un momento.';
  if (error instanceof TypeError || e?.name === 'AuthRetryableFetchError') return 'No hay conexión con el servicio. Vuelve a intentarlo.';
  if (e?.name === 'AbortError') return 'La solicitud se canceló. Vuelve a intentarlo si todavía la necesitas.';
  return 'No se pudo completar la operación. Vuelve a intentarlo.';
}
interface AuthValue {accountGuard:(requireAdmin?:boolean)=>()=>boolean;account:Account|null;sessionActive:boolean;loading:boolean;error:string;notice:string;recovery:boolean;refresh:()=>Promise<Account|null>;signIn:(email:string,password:string)=>Promise<void>;signUp:(email:string,password:string,confirm:string,marketing:boolean)=>Promise<void>;resetEmail:(email:string)=>Promise<void>;resend:(email:string)=>Promise<void>;verifyCode:(email:string,code:string,type:'email'|'recovery')=>Promise<void>;updatePassword:(password:string,confirm:string)=>Promise<void>;preferences:(name:string,marketing:boolean)=>Promise<void>;signOut:()=>Promise<void>}
const AuthContext = createContext<AuthValue | null>(null);
let callbackInitialization: Promise<{recovery:boolean;notice:string;userId?:string}> | undefined;
async function initializeCallback() {
  if (!callbackInitialization) callbackInitialization = (async () => {
    const url = new URL(window.location.href), intent = url.searchParams.get('auth'), code = url.searchParams.get('code');
    const hash = url.searchParams.get('token_hash'), type = url.searchParams.get('type');
    const fragment = new URLSearchParams(url.hash.slice(1));
    const unsafeFragment = fragment.has('access_token') || fragment.has('refresh_token');
    const failed = url.searchParams.has('error') || url.searchParams.has('error_code') || fragment.has('error') || fragment.has('error_code');
    if (code || hash || failed || unsafeFragment) {
      for (const key of ['auth','code','token_hash','type','error','error_code','error_description']) url.searchParams.delete(key);
      if (unsafeFragment || fragment.has('error') || fragment.has('error_code')) url.hash = '';
      history.replaceState(history.state, '', url.pathname + url.search + url.hash);
    }
    if (failed || unsafeFragment) throw new AccountActionError('El enlace no es válido. Solicita otro enlace seguro.');
    const recovery = intent === 'recovery' || type === 'recovery';
    if (hash || code) {
      if (hash && type !== 'email' && type !== 'recovery') throw new AccountActionError('Tipo de enlace no válido.');
      const { data, error } = await accountRequest(() => hash
        ? getSupabase().auth.verifyOtp({token_hash:hash, type:type as 'email'|'recovery'})
        : getSupabase().auth.exchangeCodeForSession(code!));
      if (error) throw error;
      if (!data.session || !data.user?.id) throw new AccountActionError('No se pudo verificar la sesión del enlace. Solicita uno nuevo.');
      return { recovery, notice:recovery ? 'Elige tu nueva contraseña.' : 'Correo confirmado.', userId:data.user.id };
    }
    return { recovery:false, notice:'' };
  })();
  return callbackInitialization;
}
export function AuthProvider({ children }: {children:ReactNode}) {
  const [account,setAccount] = useState<Account|null>(null), [sessionActive,setSessionActive] = useState(false);
  const [loading,setLoading] = useState(true), [error,setError] = useState(''), [notice,setNotice] = useState(''), [recovery,setRecovery] = useState(false);
  const mounted = useRef(true), identity = useRef<string|null>(null), epoch = useRef(0), readRevision = useRef(0);
  const currentAccount = useRef<Account|null>(null), currentRecovery = useRef(false), pendingRecovery = useRef(false), recoveryUntil = useRef(0);
  const authBusy = useRef(false), signingOut = useRef(false), logoutRevision = useRef(0);
  function storeAccount(value: Account|null) { currentAccount.current = value; setAccount(value); }
  function storeRecovery(value: boolean) { currentRecovery.current = value; setRecovery(value); if (!value) recoveryUntil.current = 0; }
  function adoptIdentity(userId: string|null, force = false) {
    if (!force && identity.current === userId) return;
    if (userId === null || (identity.current !== null && identity.current !== userId)) forgetRecovery();
    identity.current = userId; ++epoch.current; ++readRevision.current;
    storeAccount(null); storeRecovery(false); pendingRecovery.current = false; setSessionActive(false); setNotice('');
  }
  const current = (runEpoch: number, owner?: string) => mounted.current && !signingOut.current
    && runEpoch === epoch.current && (owner === undefined || identity.current === owner);
  async function refresh() {
    if (!mounted.current || signingOut.current) return null;
    const run = ++readRevision.current; let runEpoch = epoch.current, verified = false;
    const live = () => current(runEpoch) && run === readRevision.current;
    try {
      return await accountRequest(async signal => {
        const {data:{session},error:sessionError} = await getSupabase().auth.getSession();
        if (sessionError) throw sessionError;
        if (!live()) return null;
        if (!session) { adoptIdentity(null, true); setError(''); return null; }
        const {data:{user},error:userError} = await getSupabase().auth.getUser();
        if (userError) throw userError;
        if (!live()) return null;
        if (!user?.id || user.id !== session.user.id) throw new AccountActionError('La sesión no pudo verificarse. Vuelve a iniciar sesión.');
        if (identity.current !== user.id) { const wantedRecovery = pendingRecovery.current; adoptIdentity(user.id); pendingRecovery.current = wantedRecovery; runEpoch = epoch.current; readRevision.current = run; }
        verified = true; setSessionActive(true);
        if (pendingRecovery.current) { recoveryUntil.current = rememberRecovery(user.id); pendingRecovery.current = false; storeRecovery(true); }
        else { const until = recoveryExpiry(user.id) ?? (currentRecovery.current ? recoveryUntil.current : 0); storeRecovery(until > Date.now()); recoveryUntil.current = until; }
        const {data,error:profileError} = await getSupabase().rpc('vt_account').abortSignal(signal);
        if (profileError) throw profileError;
        if (!live()) return null;
        if (!data || data.id !== user.id) throw new AccountActionError('No se pudo verificar tu perfil. Usa «Volver a comprobar».');
        storeAccount(data as Account); setError(''); return data as Account;
      });
    } catch (e) {
      if (live()) { ++readRevision.current; storeAccount(null); setSessionActive(verified); if (!verified) storeRecovery(false); setError(authMessage(e)); }
      return null;
    }
  }
  useEffect(() => {
    mounted.current = true; let active = true, timer:ReturnType<typeof setTimeout>|undefined;
    const {data:{subscription}} = getSupabase().auth.onAuthStateChange((event, session) => {
      if (!active) return;
      if (event === 'SIGNED_OUT') { ++logoutRevision.current; adoptIdentity(null, true); setError(''); clearTimeout(timer); return; }
      if (!['SIGNED_IN','USER_UPDATED','PASSWORD_RECOVERY','TOKEN_REFRESHED'].includes(event) || signingOut.current) return;
      if (!session?.user.id) return;
      adoptIdentity(session.user.id);
      if (event === 'PASSWORD_RECOVERY') pendingRecovery.current = true;
      // Stay synchronous inside the SDK callback; Auth calls use a lock.
      if (authBusy.current) return;
      ++readRevision.current; clearTimeout(timer);
      timer = setTimeout(() => { if (active) void refresh(); }, 0);
    });
    const initialLogout = logoutRevision.current;
    initializeCallback().then(async info => {
      if (!active || initialLogout !== logoutRevision.current) return;
      if (info.userId && identity.current && info.userId !== identity.current) return;
      if (info.recovery) pendingRecovery.current = true;
      setNotice(info.notice); await refresh();
    }).catch(e => { if (active && initialLogout === logoutRevision.current) { setSessionActive(false); storeRecovery(false); setError(authMessage(e)); } })
      .finally(() => { if (active) setLoading(false); });
    return () => { active = false; mounted.current = false; clearTimeout(timer); subscription.unsubscribe(); ++epoch.current; ++readRevision.current; };
  }, []);
  async function authMutation(operation: () => Promise<void>) {
    if (authBusy.current) throw new AccountActionError('Espera a que termine la operación de cuenta actual.');
    authBusy.current = true;
    try { await operation(); } finally { authBusy.current = false; }
  }
  const signIn = async (email:string,password:string) => {
    const values = loginSchema.parse({email,password});
    await authMutation(async () => {
      const {data,error:failure} = await accountRequest(() => getSupabase().auth.signInWithPassword(values));
      if (failure) throw failure;
      if (!data.session || !data.user?.id) throw new AccountActionError('No se pudo verificar el inicio de sesión. Vuelve a intentarlo.');
      if (!mounted.current) throw changedAccount();
      adoptIdentity(data.user.id);
      const profile = await refresh();
      if (!profile || profile.id !== data.user.id) throw new AccountActionError('La sesión abrió, pero no pudimos leer el perfil. Usa «Volver a comprobar».');
    });
  };
  const signUp = async (email:string,password:string,confirm:string,marketing:boolean) => {
    const values = registerSchema.parse({email,password,confirm,marketing});
    await authMutation(async () => {
      const {data,error:failure} = await accountRequest(() => getSupabase().auth.signUp({email:values.email,password:values.password,options:{emailRedirectTo:emailRedirect('confirm'),data:{marketing_opt_in:values.marketing}}}));
      if (failure) throw failure;
      if (!data.user && !data.session) throw new AccountActionError('No pudimos completar el registro. Vuelve a intentarlo.');
      if (data.session && !await refresh()) throw new AccountActionError('La sesión abrió, pero no pudimos leer el perfil. Usa «Volver a comprobar».');
    });
  };
  const resetEmail = async (email:string) => {
    const address = emailSchema.parse(email);
    const {error:failure} = await accountRequest(() => getSupabase().auth.resetPasswordForEmail(address,{redirectTo:emailRedirect('recovery')}));
    if (failure) throw failure;
  };
  const resend = async (email:string) => {
    const address = emailSchema.parse(email);
    const {error:failure} = await accountRequest(() => getSupabase().auth.resend({type:'signup',email:address,options:{emailRedirectTo:emailRedirect('confirm')}}));
    if (failure) throw failure;
  };
  const verifyCode = async (email:string,code:string,type:'email'|'recovery') => {
    const token = z.string().regex(/^\d{6,8}$/,'El código debe tener entre 6 y 8 cifras.').parse(code);
    const address = emailSchema.parse(email), purpose = z.enum(['email','recovery']).parse(type);
    await authMutation(async () => {
      const {data,error:failure} = await accountRequest(() => getSupabase().auth.verifyOtp({email:address,token,type:purpose}));
      if (failure) throw failure;
      if (!data.session || !data.user?.id) throw new AccountActionError('No se pudo verificar la sesión del código. Solicita uno nuevo.');
      adoptIdentity(data.user.id); if (purpose === 'recovery') pendingRecovery.current = true;
      const profile = await refresh();
      if (!profile && !currentRecovery.current) throw new AccountActionError('La sesión abrió, pero no pudimos leer el perfil. Usa «Volver a comprobar».');
    });
  };
  const updatePassword = async (password:string,confirm:string) => {
    passwordSchema.parse(password);
    if (password !== confirm) throw new AccountActionError('Las contraseñas deben coincidir.');
    const owner = identity.current, runEpoch = epoch.current;
    if (!owner || !recovery || !sessionActive || recoveryUntil.current <= Date.now()) throw new AccountActionError('Abre un enlace de recuperación válido.');
    await authMutation(async () => {
      const {data,error:failure} = await accountRequest(() => getSupabase().auth.updateUser({password}));
      if (failure) throw failure;
      if (!current(runEpoch,owner) || data.user?.id !== owner) throw changedAccount();
      forgetRecovery(); storeRecovery(false); setNotice('Contraseña actualizada.'); await refresh();
    });
  };
  const preferences = async (name:string,marketing:boolean) => {
    const values = preferenceSchema.parse({name,marketing}), owner = currentAccount.current?.id, runEpoch = epoch.current;
    if (!owner || !current(runEpoch,owner)) throw changedAccount();
    const {data,error:failure} = await accountRpc('vt_set_preferences',{p_name:values.name,p_marketing:values.marketing});
    if (!current(runEpoch,owner) || currentAccount.current?.id !== owner) throw changedAccount();
    if (failure) throw failure;
    if (!data || data.id !== owner) throw new AccountActionError('No se pudo verificar el perfil guardado.');
    ++readRevision.current; storeAccount(data as Account);
  };
  const accountGuard = (requireAdmin = false) => {
    const owner = currentAccount.current?.id, runEpoch = epoch.current;
    return () => Boolean(owner && current(runEpoch,owner) && currentAccount.current?.id === owner
      && (!requireAdmin || currentAccount.current.is_admin));
  };
  const signOut = async () => {
    await authMutation(async () => {
      signingOut.current = true; ++logoutRevision.current; adoptIdentity(null, true); setError('');
      try { const {error:failure} = await accountRequest(() => getSupabase().auth.signOut({scope:'local'})); if (failure) throw failure; }
      catch (e) { signingOut.current = false; await refresh(); throw e; }
      finally { signingOut.current = false; }
    });
  };
  return <AuthContext.Provider value={{accountGuard,account,sessionActive,loading,error,notice,recovery,refresh,signIn,signUp,resetEmail,resend,verifyCode,updatePassword,preferences,signOut}}>{children}</AuthContext.Provider>;
}
export function useAuth() { const auth = useContext(AuthContext); if (!auth) throw new Error('AuthProvider missing'); return auth; }

