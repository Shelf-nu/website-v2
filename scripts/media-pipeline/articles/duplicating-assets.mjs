#!/usr/bin/env node

/**
 * Capture annotated screenshots and video for:
 * content/knowledge-base/duplicating-assets.mdx
 *
 * Duplicate an asset via the Actions dropdown on the asset detail page
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
  const tmpDir = await mkdtemp(join(tmpdir(), "shelf-duplicate-asset-"));
  console.log(`Working in: ${tmpDir}`);

  const browser = await launchBrowser();
  try {

  const context = await createContext(browser);
  const page = await context.newPage();
  page.setDefaultTimeout(60000);
  await loginToShelf(page);

  // Navigate to an asset detail page
  await navigateTo(page, "/assets");
  const firstAssetHref = await page.evaluate(() => {
    const link = document.querySelector('table a[href^="/assets/"], a[href^="/assets/"]');
    return link ? link.getAttribute("href") : null;
  });
  if (!firstAssetHref) throw new Error("No assets found in workspace");

  // ── Screenshot 1: Asset detail with Actions dropdown highlighted ────
  console.log("📸 Capturing asset actions dropdown...");
  await navigateTo(page, firstAssetHref);
  await initAnnotations(page);
  await highlight(page, "text:Actions", { padding: 8 });
  await callout(page, "text:Actions", "The Actions menu contains Duplicate, Delete, and other asset operations", {
    label: "Actions",
    side: "bottom",
  });
  await caption(page, "Open an asset and click Actions to access duplicate, delete, and more");
  const shot1 = await screenshot(page, join(tmpDir, "duplicate-asset-1.png"));
  await clearAll(page);

  // ── Screenshot 2: Actions dropdown open showing Duplicate option ────
  console.log("📸 Capturing duplicate option...");
  await navigateTo(page, firstAssetHref);
  await initAnnotations(page);
  const actionsBtnCount = await page.locator("text=Actions").count();
  if (actionsBtnCount > 0) {
    await page.locator("text=Actions").first().click();
    await page.waitForTimeout(500);
  }
  await highlight(page, "text:Duplicate", { padding: 6 });
  await caption(page, "Select Duplicate to create a copy of this asset with all its details pre-filled");
  const shot2 = await screenshot(page, join(tmpDir, "duplicate-asset-2.png"));
  await clearAll(page);
  await context.close();

  // ── Video clip: duplicate asset walkthrough ─────────────────────────
  console.log("🎬 Recording duplicate asset walkthrough...");
  const clipPath = await recordClip(browser, async (clipPage) => {
    await chapterCard(clipPage, "Duplicate Assets", "Copy an Asset in Seconds", 3000);

    await navigateTo(clipPage, firstAssetHref);
    await initAnnotations(clipPage);
    await highlight(clipPage, "text:Actions", { padding: 8 });
    await caption(clipPage, "Open any asset and find the Actions button");
    await clipPage.waitForTimeout(3000);
    await clearAll(clipPage);

    await chapterCard(clipPage, "Duplicate", "Create an Identical Copy", 2500);
    await navigateTo(clipPage, firstAssetHref);
    await initAnnotations(clipPage);
    await caption(clipPage, "Click Duplicate to create a copy — all fields are pre-filled for quick editing");
    await clipPage.waitForTimeout(3500);
    await clearAll(clipPage);
  });

  // ── Convert + Upload ───────────────────────────────────────────────
  console.log("🔄 Converting...");
  const webp1 = toWebP(shot1);
  const webp2 = toWebP(shot2);
  const { mp4, webm } = toVideoFormats(clipPath);

  console.log("☁️  Uploading...");
  const urls = {};
  urls.shot1 = await upload(webp1, `${BUCKET_PREFIX}/duplicate-asset-1.webp`);
  urls.shot2 = await upload(webp2, `${BUCKET_PREFIX}/duplicate-asset-2.webp`);
  urls.mp4 = await upload(mp4, `${BUCKET_PREFIX}/duplicate-asset-flow.mp4`);
  urls.webm = await upload(webm, `${BUCKET_PREFIX}/duplicate-asset-flow.webm`);
  Object.values(urls).forEach(u => console.log(`  ✅ ${u}`));

  } finally {
    await browser.close();
    await rm(tmpDir, { recursive: true, force: true }).catch(() => {});
  }
}

main().catch((err) => { console.error("❌ Failed:", err); process.exit(1); });
