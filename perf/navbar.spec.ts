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

    const { delta } = await measureCLSDelta(page, async () => {
      // Scroll in 200px increments, matching realistic user scroll speed.
      // page.mouse.wheel is unsupported on mobile WebKit, so use window.scrollBy
      // everywhere for portability.
      for (let step = 0; step < 12; step++) {
        await page.evaluate(() => window.scrollBy(0, 200));
        await page.waitForTimeout(60);
      }
    }, 800);

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

    console.log(`[scroll-cls] delta=${delta}`);
    expect(
      delta,
      `CLS delta from scrolling homepage (budget ${SCROLL_CLS_BUDGET})`,
    ).toBeLessThan(SCROLL_CLS_BUDGET);
  });
});
