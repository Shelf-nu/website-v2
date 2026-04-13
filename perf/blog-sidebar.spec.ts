/**
 * Blog sidebar TOC perf tests.
 *
 * Targets the "blinking anchors on blog deep links" symptom. The current
 * blog-sidebar.tsx implementation:
 *
 *   1. Uses an IntersectionObserver that picks the *last* intersecting
 *      heading, not the topmost — so on fast scroll the active link
 *      cycles through multiple items.
 *   2. Accordions H3 children under the active H2, causing the sidebar
 *      to grow/shrink as active changes.
 *   3. Re-triggers `animate-in slide-in-from-left-1` on every H3 render.
 *
 * Expected today (before fix): elevated CLS on deep-link load and TOC clicks.
 * Expected after fix: CLS stays near zero.
 *
 * Starter budgets are lenient (0.25) so tests pass today. Phase 5 ratchets
 * them down to the current-production value minus a safety margin.
 */

import { test, expect } from "@playwright/test";
import {
  attachVitals,
  readVitals,
  waitForVitalsSettle,
  measureCLSDelta,
} from "./helpers/capture-vitals";

// Stable, long-form post with multiple H2s — gives the TOC something to chew on.
const BLOG_POST = "/blog/all-you-need-to-know-about-qr-codes";

// Starter budgets = current production (captured 2026-04-10) + safety margin.
// Current measured on chromium vs live shelf.nu:
//   - blog load CLS: ~0 (clean)
//   - deep-link CLS delta: ~0 (clean, but doesn't reproduce the Safari-reported
//     symptom — Phase 3 will investigate whether this is paint-flicker vs CLS)
// Ratchet down in Phase 5.
const INITIAL_LOAD_CLS_BUDGET = 0.1;
const DEEP_LINK_CLS_BUDGET = 0.1;
const TOC_CLICK_CLS_BUDGET = 0.1;

test.describe("Blog sidebar — TOC perf regression gate", () => {
  test("blog post initial load stays within CLS budget", async ({ page }) => {
    await attachVitals(page);
    await page.goto(BLOG_POST);
    await waitForVitalsSettle(page, 1500);

    const vitals = await readVitals(page);
    console.log("[blog-load]", JSON.stringify(vitals, null, 2));

    expect(
      vitals.CLS,
      `initial blog post load (budget ${INITIAL_LOAD_CLS_BUDGET})`,
    ).toBeLessThan(INITIAL_LOAD_CLS_BUDGET);
    expect(vitals.LCP, "LCP should be reported").not.toBeNull();
  });

  test("deep-link navigation to a heading causes minimal shift", async ({ page }) => {
    await attachVitals(page);
    await page.goto(BLOG_POST);
    await waitForVitalsSettle(page, 800);

    // Find an H2 inside the article with an id.
    const h2Id = await page.evaluate(() => {
      const h2 = document.querySelector("article h2[id], article h2 > span ~ *[id], article h2");
      return (h2 as HTMLElement | null)?.id ?? null;
    });

    test.skip(!h2Id, "no H2 with an id found in article — can't test deep linking");

    const { startCLS, endCLS, delta } = await measureCLSDelta(page, async () => {
      await page.evaluate((id) => {
        window.location.hash = id!;
      }, h2Id);
    }, 1500);

    console.log(
      `[deep-link] hash=#${h2Id} startCLS=${startCLS} endCLS=${endCLS} delta=${delta}`,
    );

    expect(
      delta,
      `CLS delta from deep-link navigation (budget ${DEEP_LINK_CLS_BUDGET})`,
    ).toBeLessThan(DEEP_LINK_CLS_BUDGET);
  });

  test("clicking TOC links causes minimal shift", async ({ page, isMobile }) => {
    test.skip(isMobile, "blog sidebar TOC is desktop-only (hidden on mobile)");

    await attachVitals(page);
    await page.goto(BLOG_POST);
    await waitForVitalsSettle(page, 800);

    // The blog sidebar has a nav containing only #anchor links.
    const toc = page
      .locator("nav")
      .filter({ has: page.locator('a[href^="#"]') })
      .first();

    const linkCount = await toc.locator('a[href^="#"]').count();
    test.skip(linkCount === 0, "no TOC found on this blog post");

    const { delta } = await measureCLSDelta(page, async () => {
      await toc.locator('a[href^="#"]').nth(0).click();
      await page.waitForTimeout(700);
      if (linkCount > 2) {
        await toc.locator('a[href^="#"]').nth(Math.floor(linkCount / 2)).click();
        await page.waitForTimeout(700);
      }
    }, 800);

    console.log(`[toc-click] links=${linkCount} delta=${delta}`);

    expect(
      delta,
      `CLS delta from TOC clicks (budget ${TOC_CLICK_CLS_BUDGET})`,
    ).toBeLessThan(TOC_CLICK_CLS_BUDGET);
  });
});
