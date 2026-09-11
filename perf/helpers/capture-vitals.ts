/**
 * Web Vitals capture helper for Playwright perf tests.
 *
 * Injects the web-vitals IIFE bundle into every page *before* navigation,
 * then exposes a small API to read LCP/INP/CLS/FCP/TTFB at any point in
 * the test.
 *
 * Why this approach:
 * - web-vitals is the same library Google uses, so numbers match CrUX
 *   and Lighthouse "field"-side data.
 * - IIFE bundle attaches `window.webVitals` with no module/TS gymnastics.
 * - `reportAllChanges: true` fires every change (not just on page hide)
 *   so tests can read CLS deltas between interactions.
 *
 * CLS is Chromium-only. It comes from the Layout Instability API
 * (`layout-shift` entries), which WebKit does not implement (checked on
 * WebKit 26.4), so web-vitals never reports CLS there. CLS therefore starts
 * as `null` rather than 0, and the CLS readers throw on null: an unmeasured
 * page must never pass a CLS budget. Gate CLS tests with `canMeasureCLS()`.
 */

import { readFileSync } from "fs";
import { join } from "path";
import type { Page } from "@playwright/test";

// Tests run from the repo root so process.cwd() is stable.
const WEB_VITALS_JS = readFileSync(
  join(process.cwd(), "node_modules/web-vitals/dist/web-vitals.iife.js"),
  "utf-8",
);

export interface CLSEntry {
  value: number;
  startTime: number;
  sources: string[];
}

export interface Vitals {
  LCP: number | null;
  INP: number | null;
  /** null until web-vitals reports it, which never happens in WebKit. */
  CLS: number | null;
  FCP: number | null;
  TTFB: number | null;
  /** Breakdown of the CLS entries so you can tell *which* element shifted. */
  clsEntries: CLSEntry[];
}

const INIT_SCRIPT = `
(() => {
  window.__vitals = { LCP: null, INP: null, CLS: null, FCP: null, TTFB: null, clsEntries: [] };
  if (typeof webVitals === "undefined") return;
  webVitals.onLCP(function (m) { window.__vitals.LCP = m.value; }, { reportAllChanges: true });
  webVitals.onINP(function (m) { window.__vitals.INP = m.value; }, { reportAllChanges: true });
  webVitals.onCLS(function (m) {
    window.__vitals.CLS = m.value;
    (m.entries || []).forEach(function (e) {
      var sources = (e.sources || []).map(function (s) {
        if (!s.node) return "unknown";
        var n = s.node;
        var id = n.id ? "#" + n.id : "";
        var cls = n.className && typeof n.className === "string" ? "." + n.className.split(" ").slice(0, 2).join(".") : "";
        return (n.nodeName || "?") + id + cls;
      });
      window.__vitals.clsEntries.push({ value: e.value, startTime: e.startTime, sources: sources });
    });
  }, { reportAllChanges: true });
  webVitals.onFCP(function (m) { window.__vitals.FCP = m.value; });
  webVitals.onTTFB(function (m) { window.__vitals.TTFB = m.value; });
})();
`;

/** Attach web-vitals observers to the page BEFORE navigation. Call once per test. */
export async function attachVitals(page: Page): Promise<void> {
  await page.addInitScript({ content: WEB_VITALS_JS + INIT_SCRIPT });
}

/** Read the current vitals snapshot. Safe to call repeatedly. */
export async function readVitals(page: Page): Promise<Vitals> {
  return await page.evaluate(
    () => (window as unknown as { __vitals: Vitals }).__vitals,
  );
}

/** Wait until LCP has been reported, then settle for `settleMs` ms. */
export async function waitForVitalsSettle(page: Page, settleMs = 500): Promise<void> {
  await page.waitForFunction(
    () => (window as unknown as { __vitals: Vitals }).__vitals?.LCP != null,
    null,
    { timeout: 15_000 },
  );
  await page.waitForTimeout(settleMs);
}

/** Skip reason for CLS tests in browsers where `canMeasureCLS()` is false. */
export const CLS_UNMEASURABLE =
  "CLS needs the Layout Instability API ('layout-shift' entries), which only Chromium ships";

/**
 * True when the browser exposes `layout-shift` entries, the same check
 * web-vitals' onCLS makes before observing anything. This is feature
 * detection, not a browserName check, so a WebKit that ships the API gets
 * CLS-tested automatically. The list is the same on about:blank, so call it
 * first thing in the test: `test.skip(!(await canMeasureCLS(page)), CLS_UNMEASURABLE)`.
 */
export async function canMeasureCLS(page: Page): Promise<boolean> {
  return await page.evaluate(() =>
    PerformanceObserver.supportedEntryTypes.includes("layout-shift"),
  );
}

/** Read CLS, throwing if web-vitals never reported it rather than passing a budget at 0. */
export async function readCLS(page: Page): Promise<number> {
  const { CLS } = await readVitals(page);
  if (CLS === null) {
    throw new Error(
      "web-vitals never reported CLS on this page. In a browser without the Layout Instability API, " +
        "skip the test with test.skip(!(await canMeasureCLS(page)), CLS_UNMEASURABLE).",
    );
  }
  return CLS;
}

/** Measure CLS delta across an async interaction. Handy for "click this, did the page shift?" */
export async function measureCLSDelta<T>(
  page: Page,
  action: () => Promise<T>,
  settleMs = 800,
): Promise<{ startCLS: number; endCLS: number; delta: number; result: T }> {
  const startCLS = await readCLS(page);
  const result = await action();
  await page.waitForTimeout(settleMs);
  const endCLS = await readCLS(page);
  return { startCLS, endCLS, delta: endCLS - startCLS, result };
}
