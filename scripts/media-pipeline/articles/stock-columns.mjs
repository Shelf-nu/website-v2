#!/usr/bin/env node

/**
 * Capture the stock surfaces added in shelf.nu#3041 on the advanced asset
 * index: the "Needs reordering" quick filter (formerly "Low stock only") in
 * the Filter popover, and the Free now / Stock status columns next to Status.
 *
 * Source of truth:
 * apps/webapp/app/components/assets/assets-index/advanced-asset-index-filters-and-sorting.tsx
 * apps/webapp/app/modules/asset-index-settings/helpers.ts (available: "Free now", stockStatus: "Stock status")
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
import { initAnnotations, caption, highlight, clearAll } from "../lib/annotate.mjs";

const BUCKET_PREFIX = "knowledgebase";

async function main() {
  const tmpDir = await mkdtemp(join(tmpdir(), "shelf-stock-columns-"));
  console.log(`Working in: ${tmpDir}`);

  const browser = await launchBrowser();
  const urls = {};
  try {
    const context = await createContext(browser);
    const page = await context.newPage();
    page.setDefaultTimeout(60000);
    await loginToShelf(page);

    // 1. Stock columns. The demo workspace lists its quantity-tracked pools
    // first, so the default view shows filled Free now / Stock status cells.
    console.log("Opening the advanced asset index...");
    await navigateTo(page, "/assets");
    await page
      .locator('th:has-text("Free now")')
      .first()
      .waitFor({ state: "visible", timeout: 30000 });
    await page.waitForTimeout(1500);
    await initAnnotations(page);
    await highlight(page, "text:Stock status", { padding: 6 });
    await caption(
      page,
      "Free now and Stock status sit right after Status on the advanced asset list"
    );
    const columnsShot = await screenshot(page, join(tmpDir, "stock-columns.png"));
    await clearAll(page);

    // 2. The quick filter in the Filter popover.
    console.log("Opening the Filter popover...");
    const filtersBtn = page
      .getByRole("button", { name: "Filter", exact: true })
      .first();
    await filtersBtn.waitFor({ state: "visible", timeout: 30000 });
    await filtersBtn.click();
    await page
      .locator('text="Needs reordering"')
      .first()
      .waitFor({ state: "visible", timeout: 30000 });
    await page.waitForTimeout(1200);
    await initAnnotations(page);
    await caption(
      page,
      "Needs reordering narrows the list to pools at or below the min quantity you set"
    );
    const filterShot = await screenshot(
      page,
      join(tmpDir, "needs-reordering-filter.png")
    );
    await clearAll(page);

    await context.close();

    // Set UPLOAD=0 to keep the PNGs in the working directory for a look first.
    if (process.env.UPLOAD === "0") {
      console.log(`  Kept for review: ${columnsShot}, ${filterShot}`);
      return;
    }

    urls.columns = await upload(
      toWebP(columnsShot),
      `${BUCKET_PREFIX}/stock-columns.webp`
    );
    urls.filter = await upload(
      toWebP(filterShot),
      `${BUCKET_PREFIX}/needs-reordering-filter.webp`
    );
    Object.values(urls).forEach((u) => console.log(`  OK ${u}`));
  } finally {
    await browser.close();
    if (process.env.UPLOAD !== "0") {
      await rm(tmpDir, { recursive: true, force: true }).catch(() => {});
    }
  }
}

main().catch((err) => {
  console.error("Failed:", err);
  process.exit(1);
});
