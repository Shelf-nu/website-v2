/**
 * Navbar perf tests.
 *
 * Targets the "menu jank" and "scroll jank" symptoms. Current navbar.tsx:
 *
 *   - Raw scroll listener fires per-frame, setState twice per event,
 *     re-renders the whole navbar tree.
 *   - Top banner collapses via a 300ms transition on hydration if the page
 *     loads scrolled, causing a visible jump on deep-link landings.
 *   - backdrop-blur-xl on scrolled state; Safari re-rasterizes on every paint.
 *
 * Expected today: elevated CLS during scroll, slow menu open on WebKit.
 * Starter budgets are lenient; ratchet in Phase 5.
 */

import { test, expect } from "@playwright/test";
import {
  attachVitals,
  readVitals,
  waitForVitalsSettle,
  measureCLSDelta,
} from "./helpers/capture-vitals";

const HOMEPAGE = "/";

// Starter budgets = current production (captured 2026-04-10) + safety margin.
// Ratchet down as fixes land. See docs/perf-audit/baseline-2026-04-10.md.
// Current measured on chromium vs live shelf.nu:
//   - mega menu open: ~1417ms (🔴 real jank, target post-fix: <300ms)
//   - scroll CLS: ~0.003 (clean, but top-banner transition is the source)
const MEGA_MENU_OPEN_BUDGET_MS = 2000;
const MOBILE_MENU_OPEN_BUDGET_MS = 1500;
const SCROLL_CLS_BUDGET = 0.05;

test.describe("Navbar — menu + scroll regression gate", () => {
  test("desktop mega menu 'Product' opens within budget", async ({ page, isMobile }) => {
    test.skip(isMobile, "mega menu is desktop-only");

    await attachVitals(page);
    await page.goto(HOMEPAGE);
    await waitForVitalsSettle(page, 800);

    const trigger = page.getByRole("button", { name: /^Product$/ });
    await expect(trigger).toBeVisible();

    const start = Date.now();
    await trigger.click();
    await page
      .getByRole("link", { name: /Workspaces/i })
      .first()
      .waitFor({ state: "visible" });
    const elapsed = Date.now() - start;

    console.log(`[mega-menu-open] ${elapsed}ms`);
    expect(
      elapsed,
      `mega menu 'Product' open latency (budget ${MEGA_MENU_OPEN_BUDGET_MS}ms)`,
    ).toBeLessThan(MEGA_MENU_OPEN_BUDGET_MS);
  });

  test("mobile menu opens within budget", async ({ page, isMobile }) => {
    test.skip(!isMobile, "mobile menu only on mobile viewports");

    await attachVitals(page);
    await page.goto(HOMEPAGE);
    await waitForVitalsSettle(page, 800);

    const trigger = page.getByRole("button", { name: /Open menu/i });
    await expect(trigger).toBeVisible();

    const start = Date.now();
    await trigger.click();
    // The mobile menu panel has "Product" / "Solutions" / "Resources" section
    // headings that only exist inside it. Wait for one of those instead of
    // the "Close menu" button (which has two matches — the top-level toggle
    // and the in-panel close chip).
    await page.getByRole("heading", { name: /^Product$/i }).waitFor({ state: "visible" });
    const elapsed = Date.now() - start;

    console.log(`[mobile-menu-open] ${elapsed}ms`);
    expect(
      elapsed,
      `mobile menu open latency (budget ${MOBILE_MENU_OPEN_BUDGET_MS}ms)`,
    ).toBeLessThan(MOBILE_MENU_OPEN_BUDGET_MS);
  });

  test("scrolling the homepage doesn't shift layout", async ({ page }) => {
    await attachVitals(page);
    await page.goto(HOMEPAGE);
    await waitForVitalsSettle(page, 1000);

    // Install two measurements:
    //
    //   1. Long-task observer (Chromium only — WebKit doesn't support this
    //      entry type). Gives total main-thread blocking time >50ms tasks.
    //
    //   2. rAF frame-duration recorder (all browsers). Captures every frame's
    //      duration during the recording window so we can compute max-frame,
    //      dropped frames (>16.67ms = below 60fps), and total jank budget.
    //      This is the metric that actually shows backdrop-filter cost on
    //      WebKit since long-task API isn't available there.
    await page.evaluate(() => {
      type W = {
        __longTasks: Array<{ duration: number; startTime: number }>;
        __frameDurations: number[];
        __rafRecording: boolean;
      };
      const w = window as unknown as W;
      w.__longTasks = [];
      w.__frameDurations = [];
      w.__rafRecording = false;
      try {
        new PerformanceObserver((list) => {
          for (const entry of list.getEntries()) {
            w.__longTasks.push({ duration: entry.duration, startTime: entry.startTime });
          }
        }).observe({ entryTypes: ["longtask"] });
      } catch {
        // WebKit <17.4 doesn't support longtask PerformanceObserver — not fatal.
      }
    });

    // Start the rAF frame recorder right before scrolling begins.
    await page.evaluate(() => {
      type W = { __frameDurations: number[]; __rafRecording: boolean };
      const w = window as unknown as W;
      w.__frameDurations = [];
      w.__rafRecording = true;
      let prev = performance.now();
      const tick = () => {
        if (!w.__rafRecording) return;
        const now = performance.now();
        w.__frameDurations.push(now - prev);
        prev = now;
        requestAnimationFrame(tick);
      };
      requestAnimationFrame(tick);
    });

    const { delta } = await measureCLSDelta(page, async () => {
      // Scroll in 200px increments, matching realistic user scroll speed.
      // page.mouse.wheel is unsupported on mobile WebKit, so use window.scrollBy
      // everywhere for portability.
      for (let step = 0; step < 12; step++) {
        await page.evaluate(() => window.scrollBy(0, 200));
        await page.waitForTimeout(60);
      }
    }, 800);

    // Stop recording and drain one more frame.
    await page.evaluate(() => {
      (window as unknown as { __rafRecording: boolean }).__rafRecording = false;
    });
    await page.waitForTimeout(100);

    const vitals = await readVitals(page);
    if (vitals.clsEntries.length > 0) {
      console.log("[scroll-cls] top entries:");
      vitals.clsEntries
        .sort((a, b) => b.value - a.value)
        .slice(0, 5)
        .forEach((e, i) =>
          console.log(
            `  ${i + 1}. value=${e.value.toFixed(4)} t=${e.startTime.toFixed(0)}ms sources=${e.sources.slice(0, 2).join(", ")}`,
          ),
        );
    }

    const longTasks = await page.evaluate(
      () => (window as unknown as { __longTasks?: Array<{ duration: number; startTime: number }> }).__longTasks ?? [],
    );
    const longTaskTotalMs = longTasks.reduce((sum, t) => sum + t.duration, 0);
    const longTaskMaxMs = longTasks.reduce((max, t) => Math.max(max, t.duration), 0);

    const frameDurations = await page.evaluate(
      () => (window as unknown as { __frameDurations?: number[] }).__frameDurations ?? [],
    );
    // Drop the first frame (tick setup is noisy) and compute stats.
    const frames = frameDurations.slice(1);
    const frameCount = frames.length;
    const maxFrameMs = frames.reduce((max, d) => Math.max(max, d), 0);
    const avgFrameMs = frameCount > 0 ? frames.reduce((s, d) => s + d, 0) / frameCount : 0;
    const droppedFrames = frames.filter((d) => d > 16.67).length;
    const jankBudgetMs = frames
      .filter((d) => d > 16.67)
      .reduce((sum, d) => sum + (d - 16.67), 0);

    console.log(
      `[scroll-longtasks] count=${longTasks.length} total=${longTaskTotalMs.toFixed(0)}ms max=${longTaskMaxMs.toFixed(0)}ms`,
    );
    console.log(
      `[scroll-frames] n=${frameCount} avg=${avgFrameMs.toFixed(1)}ms max=${maxFrameMs.toFixed(1)}ms dropped=${droppedFrames} jank=${jankBudgetMs.toFixed(0)}ms`,
    );
    console.log(`[scroll-cls] delta=${delta}`);

    expect(
      delta,
      `CLS delta from scrolling homepage (budget ${SCROLL_CLS_BUDGET})`,
    ).toBeLessThan(SCROLL_CLS_BUDGET);
  });
});
