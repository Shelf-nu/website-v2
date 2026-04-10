/**
 * Search dialog perf tests.
 *
 * Targets the "search click jank" symptom. Current search-dialog.tsx
 * lazy-loads /pagefind/pagefind.js on first dialog open, so the first
 * click incurs a cold download + parse + init of pagefind (100-500KB
 * depending on index size). The input gets focus before pagefind is
 * ready, making early keystrokes silently fail.
 *
 * Expected today: first dialog open well above 500ms.
 * After fix (preload on hover/focus): first dialog open < 200ms.
 */

import { test, expect } from "@playwright/test";
import { attachVitals, waitForVitalsSettle } from "./helpers/capture-vitals";

const HOMEPAGE = "/";

// Starter budgets = current production (captured 2026-04-10) + safety margin.
// Current measured on chromium vs live shelf.nu:
//   - dialog open: ~1044ms (real latency, target post-fix: <200ms)
//   - first results: ~6066ms (🔴 brutal pagefind cold load, target post-fix: <800ms)
// Ratchet down as the "preload pagefind on hover/focus" fix lands.
const DIALOG_OPEN_BUDGET_MS = 2000;
const FIRST_RESULTS_BUDGET_MS = 8000;

test.describe("Search dialog — cold load regression gate", () => {
  test("first search-button click opens dialog within budget", async ({ page }) => {
    await attachVitals(page);
    await page.goto(HOMEPAGE);
    await waitForVitalsSettle(page, 500);

    // Navbar exposes the button with aria-label="Search"
    const searchBtn = page.getByRole("button", { name: /^Search$/i }).first();
    await expect(searchBtn).toBeVisible();

    const startOpen = Date.now();
    await searchBtn.click();
    await page
      .locator('[role="dialog"][aria-label="Site search"]')
      .waitFor({ state: "visible" });
    const openMs = Date.now() - startOpen;

    // Type a query; wait for either results or "no results" text.
    const input = page.locator('[role="dialog"] input[type="text"]');
    await input.fill("asset");

    await Promise.race([
      page.locator('[role="listbox"]').waitFor({ state: "visible", timeout: 5000 }).catch(() => null),
      page
        .getByText(/no results/i)
        .first()
        .waitFor({ state: "visible", timeout: 5000 })
        .catch(() => null),
    ]);
    const firstResultsMs = Date.now() - startOpen;

    console.log(`[search-cold] open=${openMs}ms firstResults=${firstResultsMs}ms`);

    expect(
      openMs,
      `search dialog open latency (budget ${DIALOG_OPEN_BUDGET_MS}ms)`,
    ).toBeLessThan(DIALOG_OPEN_BUDGET_MS);
    expect(
      firstResultsMs,
      `search first-results latency (budget ${FIRST_RESULTS_BUDGET_MS}ms)`,
    ).toBeLessThan(FIRST_RESULTS_BUDGET_MS);
  });
});
