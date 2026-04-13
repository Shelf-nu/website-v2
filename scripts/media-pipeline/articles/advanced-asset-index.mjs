#!/usr/bin/env node

/**
 * Capture annotated screenshots and video for:
 * content/knowledge-base/advanced-asset-index.mdx
 *
 * Advanced mode asset index with columns and filter panel
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

  // ── Screenshot 1: Assets index in advanced mode ─────────────────────
  console.log("📸 Capturing advanced asset index...");
  await navigateTo(page, "/assets");
  await initAnnotations(page);
  await highlight(page, "text:Advanced", { padding: 6 });
  await callout(page, "text:Advanced", "Switch to Advanced mode for extra columns and powerful filters", {
    label: "Advanced Mode",
    side: "bottom",
  });
  await caption(page, "The advanced asset index gives you sortable columns, bulk actions, and granular filters");
  const shot1 = await screenshot(page, join(tmpDir, "advanced-index-1.png"));
  await clearAll(page);

  // ── Screenshot 2: Filter panel open ─────────────────────────────────
  console.log("📸 Capturing filter panel...");
  await navigateTo(page, "/assets");
  await initAnnotations(page);
  const filterBtnCount = await page.locator("text=Filter").count();
  if (filterBtnCount > 0) {
    await page.locator("text=Filter").first().click();
    await page.waitForTimeout(500);
  }
  await caption(page, "Open the filter panel to narrow assets by category, location, tag, custodian, and more");
  const shot2 = await screenshot(page, join(tmpDir, "advanced-index-2.png"));
  await clearAll(page);
  await context.close();

  // ── Video clip: advanced mode walkthrough ───────────────────────────
  console.log("🎬 Recording advanced index walkthrough...");
  const clipPath = await recordClip(browser, async (clipPage) => {
    await chapterCard(clipPage, "Advanced Index", "Power Up Your Asset View", 3000);

    await navigateTo(clipPage, "/assets");
    await initAnnotations(clipPage);
    await caption(clipPage, "Start from the assets index — notice the Advanced toggle at the bottom");
    await clipPage.waitForTimeout(3000);
    await clearAll(clipPage);

    await chapterCard(clipPage, "Columns", "Sort and Customize Your View", 2500);
    await navigateTo(clipPage, "/assets");
    await initAnnotations(clipPage);
    await highlight(clipPage, "text:Advanced", { padding: 6 });
    await caption(clipPage, "Advanced mode adds columns like Category, Location, and Custodian");
    await clipPage.waitForTimeout(3000);
    await clearAll(clipPage);

    await chapterCard(clipPage, "Filters", "Find Exactly What You Need", 2500);
    await navigateTo(clipPage, "/assets");
    await initAnnotations(clipPage);
    await highlight(clipPage, "text:Filter", { padding: 6 });
    await caption(clipPage, "Open filters to narrow your view by any field");
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
  urls.shot1 = await upload(webp1, `${BUCKET_PREFIX}/advanced-index-1.webp`);
  urls.shot2 = await upload(webp2, `${BUCKET_PREFIX}/advanced-index-2.webp`);
  urls.mp4 = await upload(mp4, `${BUCKET_PREFIX}/advanced-index-flow.mp4`);
  urls.webm = await upload(webm, `${BUCKET_PREFIX}/advanced-index-flow.webm`);
  Object.values(urls).forEach(u => console.log(`  ✅ ${u}`));

  } finally {
    await browser.close();
    await rm(tmpDir, { recursive: true, force: true }).catch(() => {});
  }
}

main().catch((err) => { console.error("❌ Failed:", err); process.exit(1); });
