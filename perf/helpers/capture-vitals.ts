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
  CLS: number;
  FCP: number | null;
  TTFB: number | null;
  /** Breakdown of the CLS entries so you can tell *which* element shifted. */
  clsEntries: CLSEntry[];
}

const INIT_SCRIPT = `
(() => {
  window.__vitals = { LCP: null, INP: null, CLS: 0, FCP: null, TTFB: null, clsEntries: [] };
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

/** Measure CLS delta across an async interaction. Handy for "click this, did the page shift?" */
export async function measureCLSDelta<T>(
  page: Page,
  action: () => Promise<T>,
  settleMs = 800,
): Promise<{ startCLS: number; endCLS: number; delta: number; result: T }> {
  const startCLS = (await readVitals(page)).CLS;
  const result = await action();
  await page.waitForTimeout(settleMs);
  const endCLS = (await readVitals(page)).CLS;
  return { startCLS, endCLS, delta: endCLS - startCLS, result };
}
