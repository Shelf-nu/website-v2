#!/usr/bin/env node

/**
 * Capture the low-stock discoverability surfaces added in shelf.nu#2780:
 * the "Low stock only" quick filter inside the advanced asset index Filters
 * popover, and the showable "Min quantity" column.
 *
 * Source of truth:
 * apps/webapp/app/components/assets/assets-index/advanced-asset-index-filters-and-sorting.tsx
 * apps/webapp/app/modules/asset-index-settings/helpers.ts (minQuantity: "Min quantity")
 */

import { mkdtemp, rm } from "node:fs/promises";
import { join } from "node:path";
import { tmpdir } from "node:os";
import {
  launchBrowser,
  createContext,
  loginToShelf,
  navigateTo,
} from "../lib/browser.mjs";
import { screenshot } from "../lib/capture.mjs";
import { toWebP } from "../lib/convert.mjs";
import { upload } from "../lib/upload.mjs";
import { initAnnotations, caption, clearAll } from "../lib/annotate.mjs";

const BUCKET_PREFIX = "knowledgebase";

async function main() {
  const tmpDir = await mkdtemp(join(tmpdir(), "shelf-lowstock-"));
  console.log(`Working in: ${tmpDir}`);

  const browser = await launchBrowser();
  const urls = {};
  try {
    const context = await createContext(browser);
    const page = await context.newPage();
    page.setDefaultTimeout(60000);
    await loginToShelf(page);

    console.log("Opening the advanced asset index filters...");
    await navigateTo(page, "/assets");

    // The quick filter only exists in advanced mode. The trigger is labelled
    // "Filter" (singular); match it exactly so "Saved Filters (8)" next to it
    // can't win and open the wrong popover.
    const filtersBtn = page
      .getByRole("button", { name: "Filter", exact: true })
      .first();
    await filtersBtn.waitFor({ state: "visible", timeout: 30000 });
    await filtersBtn.click();

    // Hard assertion: fail the run if the toggle is not deployed yet.
    await page
      .locator('text="Low stock only"')
      .first()
      .waitFor({ state: "visible", timeout: 30000 });
    await page.waitForTimeout(1200);

    await initAnnotations(page);
    await caption(
      page,
      "Low stock only filters the index down to quantity-tracked items at or below their minimum"
    );
    const shot = await screenshot(page, join(tmpDir, "low-stock-filter.png"));
    await clearAll(page);

    await context.close();

    urls.filter = await upload(
      toWebP(shot),
      `${BUCKET_PREFIX}/low-stock-filter.webp`
    );
    Object.values(urls).forEach((u) => console.log(`  OK ${u}`));
  } finally {
    await browser.close();
    await rm(tmpDir, { recursive: true, force: true }).catch(() => {});
  }
}

main().catch((err) => {
  console.error("Failed:", err);
  process.exit(1);
});
