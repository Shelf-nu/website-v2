#!/usr/bin/env node

/**
 * Capture annotated screenshots and video for:
 * content/knowledge-base/understanding-sorting-in-shelf.mdx
 */

import { mkdtemp } from "node:fs/promises";
import { join } from "node:path";
import { tmpdir } from "node:os";
import { launchBrowser, createContext, loginToShelf, navigateTo } from "../lib/browser.mjs";
import { screenshot, recordClip } from "../lib/capture.mjs";
import { toWebP, toVideoFormats } from "../lib/convert.mjs";
import { upload } from "../lib/upload.mjs";
import { initAnnotations, highlight, callout, caption, chapterCard, clearAll } from "../lib/annotate.mjs";

const BUCKET_PREFIX = "knowledgebase";

async function main() {
  const tmpDir = await mkdtemp(join(tmpdir(), "shelf-sorting-"));
  console.log(`Working in: ${tmpDir}`);

  const browser = await launchBrowser();
  try {

  const context = await createContext(browser);
  const page = await context.newPage();
  page.setDefaultTimeout(60000);
  await loginToShelf(page);

  // ── Screenshot 1: Assets index with Sort button highlighted ────────
  console.log("📸 Capturing assets index with sort...");
  await navigateTo(page, "/assets");
  await initAnnotations(page);

  await highlight(page, "text:Sort", { spotlight: true, padding: 8 });
  await callout(page, "text:Sort", "Click to sort assets by any column — name, category, status, date, or custom fields", {
    label: "Quick Sort",
    side: "bottom",
  });
  await caption(page, "Use the Sort button to organize your asset inventory by any field");

  const shot1 = await screenshot(page, join(tmpDir, "sorting-assets-index.png"));
  await clearAll(page);

  // ── Screenshot 2: Click Sort to show the dropdown ──────────────────
  console.log("📸 Capturing sort dropdown...");
  const sortBtn = await page.locator('button:has-text("Sort")').first();
  if (sortBtn) {
    await sortBtn.click();
    await page.waitForTimeout(1500);
  }
  await initAnnotations(page);
  await caption(page, "Pick a column and toggle ascending or descending order");
  const shot2 = await screenshot(page, join(tmpDir, "sorting-dropdown.png"));
  await clearAll(page);
  await context.close();

  // ── Video clip ─────────────────────────────────────────────────────
  console.log("🎬 Recording sorting walkthrough...");
  const clipPath = await recordClip(browser, async (clipPage) => {
    await chapterCard(clipPage, "Sorting", "Organize Your Asset Inventory", 3000);

    await navigateTo(clipPage, "/assets");
    await initAnnotations(clipPage);
    await caption(clipPage, "Navigate to Assets to see your inventory");
    await clipPage.waitForTimeout(2500);
    await clearAll(clipPage);

    // Highlight sort button
    await initAnnotations(clipPage);
    await highlight(clipPage, "text:Sort", { spotlight: true, padding: 8 });
    await callout(clipPage, "text:Sort", "Click Sort to choose a column and direction", {
      label: "Sort",
      side: "bottom",
    });
    await clipPage.waitForTimeout(3000);
    await clearAll(clipPage);

    // Click sort to show dropdown
    const sort = await clipPage.locator('button:has-text("Sort")').first();
    if (sort) {
      await sort.click();
      await clipPage.waitForTimeout(2000);

      await initAnnotations(clipPage);
      await caption(clipPage, "Choose a field — toggle between ascending and descending");
      await clipPage.waitForTimeout(3500);
      await clearAll(clipPage);
    }
  });

  // ── Convert + Upload ───────────────────────────────────────────────
  console.log("🔄 Converting...");
  const webp1 = toWebP(shot1);
  const webp2 = toWebP(shot2);
  const { mp4, webm } = toVideoFormats(clipPath);

  console.log("☁️  Uploading...");
  const urls = {};
  urls.index = await upload(webp1, `${BUCKET_PREFIX}/sorting-assets-index.webp`);
  urls.dropdown = await upload(webp2, `${BUCKET_PREFIX}/sorting-dropdown.webp`);
  urls.mp4 = await upload(mp4, `${BUCKET_PREFIX}/sorting-flow.mp4`);
  urls.webm = await upload(webm, `${BUCKET_PREFIX}/sorting-flow.webm`);

  Object.values(urls).forEach(u => console.log(`  ✅ ${u}`));

  console.log("\n📋 URLs for MDX:");
  console.log(`  ![Assets index with sort](${urls.index})`);
  console.log(`  ![Sort dropdown](${urls.dropdown})`);
  console.log(`  <InlineVideo mp4="${urls.mp4}" webm="${urls.webm}" alt="Walkthrough of sorting assets in Shelf" />`);

  } finally { await browser.close(); }
}

main().catch((err) => { console.error("❌ Failed:", err); process.exit(1); });
