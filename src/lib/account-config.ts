// Public configuration. Both email callbacks are allowlisted in Supabase Auth.
export const accountConfig = {
  url: 'https://rybwxspbtleugpfjdybx.supabase.co',
  publishableKey: 'sb_publishable_sRcKzxv2jCoP8b5T1WcWhA_iJzFLP39',
  returnUrl: 'https://vtweaks-landing.vercel.app',
};
export const emailRedirect = (intent: 'confirm' | 'recovery') => `${accountConfig.returnUrl}/?auth=${intent}`;
