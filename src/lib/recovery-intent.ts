const KEY = 'vtweaks-recovery-intent';
const MAX_AGE_MS = 20 * 60 * 1000;
// UI continuation only; never a credential or authorization claim.
export function rememberRecovery(userId: string) {
  const expiresAt = Date.now() + MAX_AGE_MS;
  try { sessionStorage.setItem(KEY, JSON.stringify({ userId, expiresAt })); } catch { /* Current-view recovery still works. */ }
  return expiresAt;
}
export function forgetRecovery() { try { sessionStorage.removeItem(KEY); } catch { /* No credentials are kept here. */ } }
export function recoveryExpiry(userId: string): number | null {
  try {
    const value = JSON.parse(sessionStorage.getItem(KEY) ?? 'null');
    if (value?.userId === userId && typeof value.expiresAt === 'number' && value.expiresAt > Date.now() && value.expiresAt <= Date.now() + MAX_AGE_MS) return value.expiresAt;
    forgetRecovery();
  } catch { forgetRecovery(); }
  return null;
}
