/**
 * Retry an async operation while `ok(result)` is false, with linear backoff.
 *
 * Purpose: Gemini intermittently returns 503 "This model is currently
 * experiencing high demand" (a transient, server-side overload on Google's
 * side). Without a retry, a single hiccup drops the user to the generic
 * fallback text. This waits a moment and tries again a few times so those
 * overloads become invisible — the deep reading still comes through.
 */
export async function retry<T>(
  fn: () => Promise<T>,
  ok: (r: T) => boolean,
  opts: { tries?: number; delayMs?: number; onRetry?: (attempt: number) => void } = {},
): Promise<T> {
  const tries = opts.tries ?? 4;
  const base = opts.delayMs ?? 1800;
  let last = await fn();
  for (let i = 1; i < tries && !ok(last); i++) {
    opts.onRetry?.(i);
    await new Promise((r) => setTimeout(r, base * i));
    last = await fn();
  }
  return last;
}
