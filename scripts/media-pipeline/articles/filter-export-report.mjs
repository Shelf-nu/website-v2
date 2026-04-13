#!/usr/bin/env node

/**
 * Capture annotated screenshots and video for:
 * content/knowledge-base/filter-export-report.mdx
 *
 * Filter assets then export the filtered results
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

  const browser = await launchBrowser();
  try {

  const context = await createContext(browser);
  const page = await context.newPage();
  page.setDefaultTimeout(60000);
  await loginToShelf(page);

  // ── Screenshot 1: Assets page with filter panel open ────────────────
  console.log("📸 Capturing filter panel...");
  await navigateTo(page, "/assets");
  await initAnnotations(page);
  const filterBtnCount = await page.locator("text=Filter").count();
  if (filterBtnCount > 0) {
    await page.locator("text=Filter").first().click();
    await page.waitForTimeout(500);
  }
  await caption(page, "Open the filter panel to narrow your asset list before exporting");
  const shot1 = await screenshot(page, join(tmpDir, "filter-export-1.png"));
  await clearAll(page);

  // ── Screenshot 2: Filtered results with Export button highlighted ───
  console.log("📸 Capturing export button...");
  await navigateTo(page, "/assets");
  await initAnnotations(page);
  await highlight(page, "text:Export", { padding: 8 });
  await callout(page, "text:Export", "Export the current view as a CSV — filters are preserved in the export", {
    label: "Export",
    side: "bottom",
  });
  await caption(page, "After filtering, click Export to download a CSV of matching assets");
  const shot2 = await screenshot(page, join(tmpDir, "filter-export-2.png"));
  await clearAll(page);
  await context.close();

  // ── Video clip: filter then export ──────────────────────────────────
  console.log("🎬 Recording filter-export walkthrough...");
  const clipPath = await recordClip(browser, async (clipPage) => {
    await chapterCard(clipPage, "Filter & Export", "Build a Report in Seconds", 3000);

    await navigateTo(clipPage, "/assets");
    await initAnnotations(clipPage);
    await highlight(clipPage, "text:Filter", { padding: 6 });
    await caption(clipPage, "Step 1 — Open the filter panel");
    await clipPage.waitForTimeout(3000);
    await clearAll(clipPage);

    await chapterCard(clipPage, "Apply Filters", "Narrow Your Results", 2500);
    await navigateTo(clipPage, "/assets");
    await initAnnotations(clipPage);
    await caption(clipPage, "Choose category, location, tag, or any field to filter by");
    await clipPage.waitForTimeout(3000);
    await clearAll(clipPage);

    await chapterCard(clipPage, "Export", "Download Your Filtered Report", 2500);
    await navigateTo(clipPage, "/assets");
    await initAnnotations(clipPage);
    await highlight(clipPage, "text:Export", { padding: 8 });
    await caption(clipPage, "Click Export to download the filtered results as CSV");
    await clipPage.waitForTimeout(3000);
    await clearAll(clipPage);
  });

  // ── Convert + Upload ───────────────────────────────────────────────
  console.log("🔄 Converting...");
  const webp1 = toWebP(shot1);
  const webp2 = toWebP(shot2);
  const { mp4, webm } = toVideoFormats(clipPath);

  console.log("☁️  Uploading...");
  const urls = {};
  urls.shot1 = await upload(webp1, `${BUCKET_PREFIX}/filter-export-1.webp`);
  urls.shot2 = await upload(webp2, `${BUCKET_PREFIX}/filter-export-2.webp`);
  urls.mp4 = await upload(mp4, `${BUCKET_PREFIX}/filter-export-flow.mp4`);
  urls.webm = await upload(webm, `${BUCKET_PREFIX}/filter-export-flow.webm`);
  Object.values(urls).forEach(u => console.log(`  ✅ ${u}`));

  } finally {
    await browser.close();
    await rm(tmpDir, { recursive: true, force: true }).catch(() => {});
  }
}

main().catch((err) => { console.error("❌ Failed:", err); process.exit(1); });
