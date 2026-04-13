#!/usr/bin/env node

/**
 * Capture annotated screenshots and video for:
 * content/knowledge-base/enable-advanced-index.mdx
 *
 * Switching from simple to advanced asset index mode
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
  const tmpDir = await mkdtemp(join(tmpdir(), "shelf-enable-advanced-"));
  console.log(`Working in: ${tmpDir}`);

  const browser = await launchBrowser();
  try {

  const context = await createContext(browser);
  const page = await context.newPage();
  page.setDefaultTimeout(60000);
  await loginToShelf(page);

  // ── Screenshot 1: Simple mode with Advanced link highlighted ────────
  console.log("📸 Capturing simple mode...");
  await navigateTo(page, "/assets");
  await initAnnotations(page);
  await highlight(page, "text:Advanced", { padding: 8 });
  await callout(page, "text:Advanced", "Click here to switch from the simple card view to the powerful advanced table", {
    label: "Switch Mode",
    side: "top",
  });
  await caption(page, "The simple view shows asset cards — click Advanced at the bottom to unlock the full table view");
  const shot1 = await screenshot(page, join(tmpDir, "enable-advanced-1.png"));
  await clearAll(page);

  // ── Screenshot 2: Advanced mode showing the difference ──────────────
  console.log("📸 Capturing advanced mode...");
  await navigateTo(page, "/assets");
  // Click the Advanced toggle to switch modes
  const advancedBtnCount = await page.locator("text=Advanced").count();
  if (advancedBtnCount > 0) {
    await page.locator("text=Advanced").first().click();
    await page.waitForTimeout(1000);
  }
  await initAnnotations(page);
  await caption(page, "Advanced mode — sortable columns, inline editing, bulk actions, and granular filters");
  const shot2 = await screenshot(page, join(tmpDir, "enable-advanced-2.png"));
  await clearAll(page);
  await context.close();

  // ── Video clip: simple to advanced walkthrough ──────────────────────
  console.log("🎬 Recording enable advanced walkthrough...");
  const clipPath = await recordClip(browser, async (clipPage) => {
    await chapterCard(clipPage, "Enable Advanced", "Upgrade Your Asset View", 3000);

    await navigateTo(clipPage, "/assets");
    await initAnnotations(clipPage);
    await caption(clipPage, "Start in the simple view — great for browsing but limited for power users");
    await clipPage.waitForTimeout(3000);
    await clearAll(clipPage);

    await chapterCard(clipPage, "Switch", "Click Advanced to Transform Your View", 2500);
    await navigateTo(clipPage, "/assets");
    await initAnnotations(clipPage);
    await highlight(clipPage, "text:Advanced", { padding: 8 });
    await caption(clipPage, "Click Advanced at the bottom of the page to enable the full table view");
    await clipPage.waitForTimeout(3000);
    await clearAll(clipPage);

    await chapterCard(clipPage, "Power Mode", "Columns, Filters, and Bulk Actions", 2500);
    await navigateTo(clipPage, "/assets");
    await initAnnotations(clipPage);
    await caption(clipPage, "Advanced mode gives you sortable columns, filters, and bulk operations");
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
  urls.shot1 = await upload(webp1, `${BUCKET_PREFIX}/enable-advanced-1.webp`);
  urls.shot2 = await upload(webp2, `${BUCKET_PREFIX}/enable-advanced-2.webp`);
  urls.mp4 = await upload(mp4, `${BUCKET_PREFIX}/enable-advanced-flow.mp4`);
  urls.webm = await upload(webm, `${BUCKET_PREFIX}/enable-advanced-flow.webm`);
  Object.values(urls).forEach(u => console.log(`  ✅ ${u}`));

  } finally {
    await browser.close();
    await rm(tmpDir, { recursive: true, force: true }).catch(() => {});
  }
}

main().catch((err) => { console.error("❌ Failed:", err); process.exit(1); });
