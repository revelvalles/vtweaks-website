export const ACCOUNT_TIMEOUT_MS = 20_000;
export class AccountActionError extends Error {}
export class AccountTimeoutError extends Error {
  readonly code = 'account_timeout';
  constructor() { super('El servicio tardó demasiado. Vuelve a intentarlo; si ya solicitaste un correo, revisa tu bandeja antes de reenviarlo.'); this.name = 'AccountTimeoutError'; }
}
/** Bounds the complete operation and preserves cancellation from its caller. */
export function accountRequest<T>(operation: (signal: AbortSignal) => T | PromiseLike<T>, timeoutMs = ACCOUNT_TIMEOUT_MS, upstream?: AbortSignal | null): Promise<T> {
  const controller = new AbortController();
  let timer: ReturnType<typeof setTimeout> | undefined, cancel: (() => void) | undefined;
  const deadline = new Promise<never>((_resolve, reject) => {
    cancel = () => { const reason = upstream?.reason ?? new DOMException('Request cancelled', 'AbortError'); controller.abort(reason); reject(reason); };
    if (upstream?.aborted) { cancel(); return; }
    upstream?.addEventListener('abort', cancel, { once: true });
    timer = setTimeout(() => { const reason = new AccountTimeoutError(); controller.abort(reason); reject(reason); }, timeoutMs);
  });
  const work = upstream?.aborted ? deadline : Promise.resolve().then(() => { if (controller.signal.aborted) throw controller.signal.reason; return operation(controller.signal); });
  return Promise.race([work, deadline]).finally(() => { if (timer !== undefined) clearTimeout(timer); if (cancel) upstream?.removeEventListener('abort', cancel); });
}
/** Bound Auth's fetch as well: not every Auth SDK method exposes a signal. */
export const accountFetch: typeof fetch = (input, init = {}) => {
  const requestSignal = typeof Request !== 'undefined' && input instanceof Request ? input.signal : undefined;
  return accountRequest(async signal => {
    const response = await fetch(input, { ...init, signal });
    // Auth/RPC return finite JSON. Keep the deadline through body delivery too.
    await response.clone().arrayBuffer();
    return response;
  }, ACCOUNT_TIMEOUT_MS, init.signal ?? requestSignal);
};
