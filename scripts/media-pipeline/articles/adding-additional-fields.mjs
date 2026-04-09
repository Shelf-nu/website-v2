#!/usr/bin/env node

/**
 * Capture annotated screenshots and video for:
 * content/knowledge-base/adding-additional-fields-to-assets.mdx
 *
 * Shows: Custom Fields settings, create field flow, fields on asset edit form
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
  const tmpDir = await mkdtemp(join(tmpdir(), "shelf-customfields-"));
  console.log(`Working in: ${tmpDir}`);

  const browser = await launchBrowser();
  try {

  const context = await createContext(browser);
  const page = await context.newPage();
  page.setDefaultTimeout(60000);
  await loginToShelf(page);

  // ── Screenshot 1: Custom Fields settings page ──────────────────────
  console.log("📸 Capturing Custom Fields settings...");
  await navigateTo(page, "/settings/custom-fields");
  await initAnnotations(page);
  await caption(page, "Settings → Custom Fields — manage all custom fields for your workspace");
  const shot1 = await screenshot(page, join(tmpDir, "custom-fields-settings.png"));
  await clearAll(page);

  // ── Screenshot 2: Edit an existing asset and scroll to custom fields
  console.log("📸 Capturing asset edit form with custom fields...");
  // Navigate to an asset and click edit
  await navigateTo(page, "/assets");
  const firstAsset = await page.locator('table a, [role="row"] a').first();
  if (firstAsset) {
    await firstAsset.click();
    await page.waitForTimeout(3000);
  }
  // Scroll down to show custom fields section
  await page.evaluate(async () => {
    const ease = (t) => t < 0.5 ? 4 * t * t * t : 1 - Math.pow(-2 * t + 2, 3) / 2;
    const scroll = (target, dur) => new Promise((resolve) => {
      const start = window.scrollY, diff = target - start, t0 = performance.now();
      const s = (now) => { const p = Math.min((now - t0) / dur, 1); window.scrollTo(0, start + diff * ease(p)); p < 1 ? requestAnimationFrame(s) : resolve(); };
      requestAnimationFrame(s);
    });
    await scroll(600, 1200);
  });
  await page.waitForTimeout(1000);
  await initAnnotations(page);
  await caption(page, "Asset detail page — scroll down to see custom fields on any asset");
  const shot2 = await screenshot(page, join(tmpDir, "custom-fields-on-asset.png"));
  await clearAll(page);
  await context.close();

  // ── Video clip ─────────────────────────────────────────────────────
  console.log("🎬 Recording custom fields walkthrough...");
  const clipPath = await recordClip(browser, async (clipPage) => {
    // Chapter 1: Settings
    await chapterCard(clipPage, "Step 1", "Configure Custom Fields in Settings", 3000);

    await navigateTo(clipPage, "/settings/custom-fields");
    await initAnnotations(clipPage);
    await caption(clipPage, "Go to Settings → Custom Fields");
    await clipPage.waitForTimeout(2500);
    await clearAll(clipPage);

    // Highlight and click "New custom field" or "Add" button
    const addBtn = await clipPage.locator('a:has-text("New custom field"), button:has-text("New custom field"), a:has-text("new"), button:has-text("new")').first();
    if (addBtn) {
      await initAnnotations(clipPage);
      await highlight(clipPage, "text:New custom field", { spotlight: true, padding: 8 });
      await callout(clipPage, "text:New custom field", "Create a new field for your assets", {
        label: "Add Field",
        side: "bottom",
      });
      await clipPage.waitForTimeout(2500);
      await clearAll(clipPage);

      await addBtn.click().catch(() => {});
      await clipPage.waitForTimeout(3000);

      // Show the create form/modal
      await initAnnotations(clipPage);
      await caption(clipPage, "Set field name, type, required/optional, and help text");
      await clipPage.waitForTimeout(3500);
      await clearAll(clipPage);
    }

    // Chapter 2: Fields on asset
    await chapterCard(clipPage, "Step 2", "Custom Fields Appear on Your Assets", 2500);

    // Navigate to an asset to show fields
    await navigateTo(clipPage, "/assets");
    const asset = await clipPage.locator('table a, [role="row"] a').first();
    if (asset) {
      await asset.click();
      await clipPage.waitForTimeout(3000);
    }

    // Scroll down to custom fields
    await clipPage.evaluate(async () => {
      const ease = (t) => t < 0.5 ? 4 * t * t * t : 1 - Math.pow(-2 * t + 2, 3) / 2;
      const scroll = (target, dur) => new Promise((resolve) => {
        const start = window.scrollY, diff = target - start, t0 = performance.now();
        const s = (now) => { const p = Math.min((now - t0) / dur, 1); window.scrollTo(0, start + diff * ease(p)); p < 1 ? requestAnimationFrame(s) : resolve(); };
        requestAnimationFrame(s);
      });
      await scroll(600, 1500);
    });
    await clipPage.waitForTimeout(500);

    await initAnnotations(clipPage);
    await caption(clipPage, "Custom fields appear on asset pages — edit them just like default fields");
    await clipPage.waitForTimeout(4000);
    await clearAll(clipPage);
  });

  // ── Convert + Upload ───────────────────────────────────────────────
  console.log("🔄 Converting...");
  const webp1 = toWebP(shot1);
  const webp2 = toWebP(shot2);
  const { mp4, webm } = toVideoFormats(clipPath);

  console.log("☁️  Uploading...");
  const urls = {};
  urls.settings = await upload(webp1, `${BUCKET_PREFIX}/custom-fields-settings.webp`);
  urls.onAsset = await upload(webp2, `${BUCKET_PREFIX}/custom-fields-on-asset.webp`);
  urls.mp4 = await upload(mp4, `${BUCKET_PREFIX}/custom-fields-flow.mp4`);
  urls.webm = await upload(webm, `${BUCKET_PREFIX}/custom-fields-flow.webm`);

  Object.values(urls).forEach(u => console.log(`  ✅ ${u}`));

  console.log("\n📋 URLs for MDX:");
  console.log(`  ![Custom Fields settings](${urls.settings})`);
  console.log(`  ![Custom fields on asset page](${urls.onAsset})`);
  console.log(`  <InlineVideo mp4="${urls.mp4}" webm="${urls.webm}" alt="Walkthrough of adding custom fields to assets in Shelf" />`);

  } finally { await browser.close(); }
}

main().catch((err) => { console.error("❌ Failed:", err); process.exit(1); });
