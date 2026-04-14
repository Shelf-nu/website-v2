#!/usr/bin/env node

/**
 * Capture for: how-to-filter-export-and-report-on-your-asset-inventory.mdx
 * Shows: Filter panel open with column selector → filtered results with Export selection
 */

import { mkdtemp, rm } from "node:fs/promises";
import { join } from "node:path";
import { tmpdir } from "node:os";
import { launchBrowser, createContext, loginToShelf, navigateTo } from "../lib/browser.mjs";
import { screenshot, recordClip } from "../lib/capture.mjs";
import { toWebP, toVideoFormats } from "../lib/convert.mjs";
import { upload } from "../lib/upload.mjs";
import { initAnnotations, highlight, callout, caption, chapterCard, clearAll } from "../lib/annotate.mjs";

const BUCKET_PREFIX = "knowledgebase";

async function main() {
  const tmpDir = await mkdtemp(join(tmpdir(), "shelf-filter-export-"));
  console.log(`Working in: ${tmpDir}`);
  let browser;
  try {
    browser = await launchBrowser();
    const context = await createContext(browser);
    const page = await context.newPage();
    page.setDefaultTimeout(60000);
    await loginToShelf(page);

    // Shot 1: Filter panel open showing filter options
    console.log("📸 Capturing filter panel...");
    await navigateTo(page, "/assets");
    // Click Filter button to open the panel
    const filterBtn = await page.locator('button:has-text("Filter")').first();
    if (await filterBtn.count() === 0) throw new Error("Filter button not found on assets page");
    await filterBtn.click();
    await page.waitForTimeout(2000);
    await initAnnotations(page);
    await highlight(page, "text:Add filter", { padding: 6 });
    await callout(page, "text:Add filter", "Click to add a filter — choose from Category, Status, Location, Tags, and more", {
      label: "Filter",
      side: "bottom",
    });
    await caption(page, "Step 1 — Open the filter panel and add filters to narrow down your inventory");
    const shot1 = await screenshot(page, join(tmpDir, "filter-export-1.png"));
    await clearAll(page);

    // Shot 2: Select all assets then highlight Export selection (it lights up with count)
    console.log("📸 Capturing Export selection with assets selected...");
    await navigateTo(page, "/assets");
    // Click the header checkbox to select all visible assets
    const headerCheckbox = await page.$('thead input[type="checkbox"], thead th:first-child');
    if (!headerCheckbox) throw new Error("Header checkbox not found in assets table");
    await headerCheckbox.click();
    await page.waitForTimeout(1000);
    await initAnnotations(page);
    await highlight(page, "text:Export selection", { spotlight: true, padding: 8 });
    await callout(page, "text:Export selection", "With assets selected, Export selection shows the count and becomes active — click to download CSV", {
      label: "Export",
      side: "bottom",
    });
    await caption(page, "Step 2 — Select assets (click the Name header to select all), then click Export selection");
    const shot2 = await screenshot(page, join(tmpDir, "filter-export-2.png"));
    await clearAll(page);
    await context.close();

    // Video
    console.log("🎬 Recording filter-export walkthrough...");
    const clipPath = await recordClip(browser, async (clipPage) => {
      await chapterCard(clipPage, "Step 1", "Filter Your Assets", 2500);
      await navigateTo(clipPage, "/assets");
      await clipPage.waitForTimeout(1000);

      // Open filter panel
      const fb = await clipPage.locator('button:has-text("Filter")').first();
      if (await fb.count() === 0) throw new Error("Filter button not found on assets page (video clip)");
      await initAnnotations(clipPage);
      await highlight(clipPage, "text:Filter", { spotlight: true, padding: 6 });
      await caption(clipPage, "Click Filter to open the filtering panel");
      await clipPage.waitForTimeout(2000);
      await clearAll(clipPage);

      await fb.click();
      await clipPage.waitForTimeout(2000);
      await initAnnotations(clipPage);
      await caption(clipPage, "Add filters by column — Category, Status, Location, Tags, Custom Fields, and more");
      await clipPage.waitForTimeout(3500);
      await clearAll(clipPage);

      await chapterCard(clipPage, "Step 2", "Export Your Filtered Results", 2500);
      await navigateTo(clipPage, "/assets");
      await initAnnotations(clipPage);
      await highlight(clipPage, "text:Export selection", { spotlight: true, padding: 8 });
      await callout(clipPage, "text:Export selection", "Select assets then click here to download as CSV", {
        label: "Export",
        side: "bottom",
      });
      await caption(clipPage, "Select your filtered assets, then click Export selection to download a CSV report");
      await clipPage.waitForTimeout(4000);
      await clearAll(clipPage);
    });

    console.log("🔄 Converting...");
    const webp1 = toWebP(shot1);
    const webp2 = toWebP(shot2);
    const { mp4, webm } = toVideoFormats(clipPath);

    console.log("☁️  Uploading...");
    const urls = {};
    urls.filter = await upload(webp1, `${BUCKET_PREFIX}/filter-export-1.webp`);
    urls.export = await upload(webp2, `${BUCKET_PREFIX}/filter-export-2.webp`);
    urls.mp4 = await upload(mp4, `${BUCKET_PREFIX}/filter-export-flow.mp4`);
    urls.webm = await upload(webm, `${BUCKET_PREFIX}/filter-export-flow.webm`);
    Object.values(urls).forEach(u => console.log(`  ✅ ${u}`));
  } finally {
    if (browser) await browser.close();
    await rm(tmpDir, { recursive: true, force: true }).catch(() => {});
  }
}

main().catch((err) => { console.error("❌ Failed:", err); process.exit(1); });
