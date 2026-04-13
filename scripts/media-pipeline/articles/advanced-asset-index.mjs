#!/usr/bin/env node

/**
 * Capture for: advanced-asset-index-complete-guide.mdx
 * Shows: Advanced index with column management, filter panel with column picker,
 * and the availability view toggle.
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
  const tmpDir = await mkdtemp(join(tmpdir(), "shelf-advanced-index-"));
  console.log(`Working in: ${tmpDir}`);
  const browser = await launchBrowser();
  try {
    const context = await createContext(browser);
    const page = await context.newPage();
    page.setDefaultTimeout(60000);
    await loginToShelf(page);

    // Shot 1: Advanced index with toolbar features highlighted
    console.log("📸 Capturing advanced index overview...");
    await navigateTo(page, "/assets?mode=advanced");
    await initAnnotations(page);
    // Highlight the view toggles area (list/calendar icons)
    await highlight(page, '[aria-label="Switch to list view"]', { padding: 12 });
    await callout(page, '[aria-label="Switch to list view"]', "Toggle between List View and Availability View — plus Filter, Sort, and Search", {
      label: "Advanced Toolbar",
      side: "bottom",
    });
    await caption(page, "Advanced Index — configurable columns, saved filters, list/calendar views, and batch actions");
    const shot1 = await screenshot(page, join(tmpDir, "advanced-index-1.png"));
    await clearAll(page);

    // Shot 2: Filter panel open with column selector
    console.log("📸 Capturing filter panel...");
    const filterBtn = await page.locator('button:has-text("Filter")').first();
    if (await filterBtn.count() > 0) {
      await filterBtn.click();
      await page.waitForTimeout(2000);
    }
    await initAnnotations(page);
    await callout(page, "text:Add filter", "Add filters by any column — Category, Location, Status, Tags, Custom Fields", {
      label: "Filters",
      side: "bottom",
    });
    await caption(page, "The filter panel lets you narrow assets by any field — stack multiple filters for precise results");
    const shot2 = await screenshot(page, join(tmpDir, "advanced-index-2.png"));
    await clearAll(page);
    await context.close();

    // Video
    console.log("🎬 Recording advanced index walkthrough...");
    const clipPath = await recordClip(browser, async (clipPage) => {
      await chapterCard(clipPage, "Advanced Index", "Full Control Over Your Asset List", 3000);

      // Show the advanced index
      await navigateTo(clipPage, "/assets?mode=advanced");
      await clipPage.waitForTimeout(1500);
      await initAnnotations(clipPage);
      await caption(clipPage, "The Advanced Index gives you configurable columns, filters, and multiple views");
      await clipPage.waitForTimeout(3000);
      await clearAll(clipPage);

      // Open filter panel
      await chapterCard(clipPage, "Filters", "Narrow Down Your Inventory", 2500);
      // Navigate fresh to clear any lingering annotations that block clicks
      await navigateTo(clipPage, "/assets?mode=advanced");
      await clipPage.waitForTimeout(1000);
      const fb = await clipPage.locator('button:has-text("Filter")').first();
      if (await fb.count() > 0) {
        await fb.click();
        await clipPage.waitForTimeout(2000);
      }
      await initAnnotations(clipPage);
      await caption(clipPage, "Add filters by any column — stack Category + Location + Status for precise results");
      await clipPage.waitForTimeout(3500);
      await clearAll(clipPage);

      // Show availability view
      await chapterCard(clipPage, "Views", "List View and Availability Calendar", 2500);
      await navigateTo(clipPage, "/assets?view=availability");
      await clipPage.waitForTimeout(2000);
      await initAnnotations(clipPage);
      await caption(clipPage, "Switch to Availability View to see booking timelines across your assets");
      await clipPage.waitForTimeout(3500);
      await clearAll(clipPage);
    });

    console.log("🔄 Converting...");
    const webp1 = toWebP(shot1);
    const webp2 = toWebP(shot2);
    const { mp4, webm } = toVideoFormats(clipPath);

    console.log("☁️  Uploading...");
    const urls = {};
    urls.overview = await upload(webp1, `${BUCKET_PREFIX}/advanced-index-1.webp`);
    urls.filter = await upload(webp2, `${BUCKET_PREFIX}/advanced-index-2.webp`);
    urls.mp4 = await upload(mp4, `${BUCKET_PREFIX}/advanced-index-flow.mp4`);
    urls.webm = await upload(webm, `${BUCKET_PREFIX}/advanced-index-flow.webm`);
    Object.values(urls).forEach(u => console.log(`  ✅ ${u}`));
  } finally {
    await browser.close();
    await rm(tmpDir, { recursive: true, force: true }).catch(() => {});
  }
}

main().catch((err) => { console.error("❌ Failed:", err); process.exit(1); });
