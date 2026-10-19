import { describe, expect, it, vi, afterEach } from 'vitest';
import { forgetRecovery, rememberRecovery, recoveryExpiry } from '../lib/recovery-intent';
afterEach(()=>{sessionStorage.clear();vi.useRealTimers();vi.restoreAllMocks();});
describe('recovery continuation marker',()=>{
 it('expires after twenty minutes and is limited to its verified user',()=>{
  vi.useFakeTimers();vi.setSystemTime(new Date('2026-10-08T12:00:00Z'));rememberRecovery('user-a');
  expect(recoveryExpiry('user-a')).toBe(Date.now()+20*60*1000);vi.advanceTimersByTime(20*60*1000);expect(recoveryExpiry('user-a')).toBe(null);
  rememberRecovery('user-a');expect(recoveryExpiry('user-b')).toBe(null);
 });
 it('rejects malformed or unbounded markers and safely handles unavailable storage',()=>{
  sessionStorage.setItem('vtweaks-recovery-intent',JSON.stringify({userId:'user-a',expiresAt:Date.now()+86_400_000}));expect(recoveryExpiry('user-a')).toBe(null);
  vi.spyOn(Storage.prototype,'setItem').mockImplementation(()=>{throw new Error('blocked')});expect(rememberRecovery('user-a')).toBeGreaterThan(Date.now());
  expect(()=>forgetRecovery()).not.toThrow();
 });
});
