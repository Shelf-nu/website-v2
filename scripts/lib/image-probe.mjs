/**
 * image-probe.mjs
 * ---------------
 * HTTP reachability probe used by verify-content-render.mjs --images.
 *
 * Kept as its own module so the retry policy can be unit-tested with a fake
 * fetch and a fake clock (scripts/lib/image-probe.test.mjs).
 *
 * Policy:
 *  - 2xx/3xx            → ok on the first try.
 *  - 429 and 5xx        → transient. Retry with backoff (RETRY_DELAYS_MS), then
 *                         report the last status if it never recovers.
 *                         A Retry-After header, when present and sane, wins
 *                         over the backoff schedule.
 *  - other 4xx (404…)   → definitive. Fail immediately, no retry: nothing we do
 *                         on our side changes a missing object.
 *  - network error      → retried like a transient, then reported as NETWORK
 *                         (the caller warns instead of failing).
 *
 * Why: on 2026-10-19 the production deploy went red twice on Supabase storage
 * answering 429 for images no PR had touched, because several builds started
 * within seconds and the old probe hammered 12 requests in parallel with
 * instant retries. Both passed on a plain rerun. See runs 39241743448 and
 * 39256690071.
 */

export const RETRY_DELAYS_MS = [2000, 5000, 10000];
export const MAX_CONCURRENCY = 6;
export const MAX_RETRY_AFTER_MS = 30000;

export function isTransientStatus(status) {
    return status === 429 || status >= 500;
}

function retryAfterMs(res) {
    const raw = res.headers?.get?.("retry-after");
    if (!raw) return null;
    const seconds = Number(raw);
    if (Number.isFinite(seconds) && seconds >= 0) return Math.min(seconds * 1000, MAX_RETRY_AFTER_MS);
    const at = Date.parse(raw);
    if (Number.isFinite(at)) return Math.min(Math.max(at - Date.now(), 0), MAX_RETRY_AFTER_MS);
    return null;
}

const defaultSleep = (ms) => new Promise((r) => setTimeout(r, ms));

/**
 * Probe one URL.
 * @returns {Promise<{url: string, status: number | "NETWORK", attempts: number, detail?: string}>}
 */
export async function probeImage(
    url,
    { fetch: fetchImpl = globalThis.fetch, sleep = defaultSleep, delays = RETRY_DELAYS_MS, timeoutMs = 15000 } = {},
) {
    let attempt = 0;
    for (;;) {
        attempt += 1;
        let res;
        try {
            res = await fetchImpl(encodeURI(decodeURI(url)), {
                method: "GET",
                headers: { Range: "bytes=0-0" },
                signal: AbortSignal.timeout(timeoutMs),
            });
        } catch (err) {
            if (attempt <= delays.length) {
                await sleep(delays[attempt - 1]);
                continue;
            }
            return { url, status: "NETWORK", attempts: attempt, detail: err?.message ?? String(err) };
        }

        if (isTransientStatus(res.status) && attempt <= delays.length) {
            await sleep(retryAfterMs(res) ?? delays[attempt - 1]);
            continue;
        }
        return { url, status: res.status, attempts: attempt };
    }
}

/** Run `fn` over `items` with at most `limit` in flight. Order of results is not preserved. */
export async function mapWithConcurrency(items, limit, fn) {
    const queue = [...items];
    const results = [];
    await Promise.all(
        Array.from({ length: Math.max(1, Math.min(limit, queue.length)) }, async () => {
            while (queue.length) results.push(await fn(queue.shift()));
        }),
    );
    return results;
}
