import { test } from "node:test";
import assert from "node:assert/strict";
import { probeImage, mapWithConcurrency, RETRY_DELAYS_MS, MAX_CONCURRENCY } from "./image-probe.mjs";

const URL = "https://example.supabase.co/storage/v1/object/public/website-images/x.webp";

function fakeFetch(outcomes) {
    const calls = [];
    const fetch = async (url) => {
        calls.push(url);
        const next = outcomes.shift();
        if (next instanceof Error) throw next;
        return { status: next.status, headers: new Headers(next.headers ?? {}) };
    };
    return { fetch, calls };
}

function fakeSleep() {
    const waits = [];
    return { sleep: async (ms) => void waits.push(ms), waits };
}

test("2xx passes on the first attempt without sleeping", async () => {
    const { fetch, calls } = fakeFetch([{ status: 206 }]);
    const { sleep, waits } = fakeSleep();
    const r = await probeImage(URL, { fetch, sleep });
    assert.equal(r.status, 206);
    assert.equal(r.attempts, 1);
    assert.equal(calls.length, 1);
    assert.deepEqual(waits, []);
});

test("429 retries with 2s/5s/10s backoff and succeeds when the limit clears", async () => {
    const { fetch, calls } = fakeFetch([{ status: 429 }, { status: 429 }, { status: 429 }, { status: 206 }]);
    const { sleep, waits } = fakeSleep();
    const r = await probeImage(URL, { fetch, sleep });
    assert.equal(r.status, 206);
    assert.equal(r.attempts, 4);
    assert.equal(calls.length, 4);
    assert.deepEqual(waits, RETRY_DELAYS_MS);
});

test("429 that never clears reports 429 after exhausting the schedule", async () => {
    const { fetch, calls } = fakeFetch([{ status: 429 }, { status: 429 }, { status: 429 }, { status: 429 }]);
    const { sleep, waits } = fakeSleep();
    const r = await probeImage(URL, { fetch, sleep });
    assert.equal(r.status, 429);
    assert.equal(calls.length, RETRY_DELAYS_MS.length + 1);
    assert.deepEqual(waits, RETRY_DELAYS_MS);
});

test("5xx is treated as transient", async () => {
    const { fetch, calls } = fakeFetch([{ status: 503 }, { status: 200 }]);
    const { sleep, waits } = fakeSleep();
    const r = await probeImage(URL, { fetch, sleep });
    assert.equal(r.status, 200);
    assert.equal(calls.length, 2);
    assert.deepEqual(waits, [RETRY_DELAYS_MS[0]]);
});

test("404 fails immediately with no retry", async () => {
    const { fetch, calls } = fakeFetch([{ status: 404 }, { status: 200 }]);
    const { sleep, waits } = fakeSleep();
    const r = await probeImage(URL, { fetch, sleep });
    assert.equal(r.status, 404);
    assert.equal(r.attempts, 1);
    assert.equal(calls.length, 1);
    assert.deepEqual(waits, []);
});

test("403 (other 4xx) also fails immediately", async () => {
    const { fetch, calls } = fakeFetch([{ status: 403 }]);
    const { sleep } = fakeSleep();
    const r = await probeImage(URL, { fetch, sleep });
    assert.equal(r.status, 403);
    assert.equal(calls.length, 1);
});

test("Retry-After in seconds overrides the backoff step, capped at 30s", async () => {
    const { fetch } = fakeFetch([
        { status: 429, headers: { "retry-after": "3" } },
        { status: 429, headers: { "retry-after": "999" } },
        { status: 200 },
    ]);
    const { sleep, waits } = fakeSleep();
    const r = await probeImage(URL, { fetch, sleep });
    assert.equal(r.status, 200);
    assert.deepEqual(waits, [3000, 30000]);
});

test("network errors retry, then surface as NETWORK (warn, not fail)", async () => {
    const { fetch, calls } = fakeFetch([new Error("ECONNRESET"), new Error("ECONNRESET"), new Error("ECONNRESET"), new Error("ECONNRESET")]);
    const { sleep, waits } = fakeSleep();
    const r = await probeImage(URL, { fetch, sleep });
    assert.equal(r.status, "NETWORK");
    assert.equal(r.detail, "ECONNRESET");
    assert.equal(calls.length, 4);
    assert.deepEqual(waits, RETRY_DELAYS_MS);
});

test("mapWithConcurrency never exceeds the cap and returns every result", async () => {
    let inFlight = 0;
    let peak = 0;
    const items = Array.from({ length: 40 }, (_, i) => i);
    const results = await mapWithConcurrency(items, MAX_CONCURRENCY, async (i) => {
        inFlight += 1;
        peak = Math.max(peak, inFlight);
        await new Promise((r) => setTimeout(r, 1));
        inFlight -= 1;
        return i * 2;
    });
    assert.equal(peak, MAX_CONCURRENCY);
    assert.deepEqual([...results].sort((a, b) => a - b), items.map((i) => i * 2));
});
