#!/usr/bin/env node

/**
 * Capture annotated screenshots and video for:
 * content/knowledge-base/adding-additional-fields-to-assets.mdx
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

  await callout(page, "text:Custom fields", "Manage all custom fields for your workspace here", {
    label: "Settings",
    side: "right",
  });
  await caption(page, "Settings → Custom Fields — add, edit, or deactivate custom fields for your assets");

  const shot1 = await screenshot(page, join(tmpDir, "custom-fields-settings.png"));
  await clearAll(page);
  await context.close();

  // ── Screenshot 2: New Asset form showing custom fields ─────────────
  console.log("📸 Capturing New Asset form...");
  const ctx2 = await createContext(browser);
  const page2 = await ctx2.newPage();
  page2.setDefaultTimeout(60000);
  await loginToShelf(page2);
  await navigateTo(page2, "/assets/new");
  await initAnnotations(page2);

  // Scroll down to show custom fields section
  await page2.evaluate(() => window.scrollTo({ top: 400, behavior: "instant" }));
  await page2.waitForTimeout(1000);

  await caption(page2, "New Asset form — custom fields appear alongside default fields");
  const shot2 = await screenshot(page2, join(tmpDir, "custom-fields-new-asset.png"));
  await clearAll(page2);
  await ctx2.close();

  // ── Video clip ─────────────────────────────────────────────────────
  console.log("🎬 Recording custom fields walkthrough...");
  const clipPath = await recordClip(browser, async (clipPage) => {
    await chapterCard(clipPage, "Custom Fields", "Add Extra Data Fields to Your Assets", 3000);

    // Show settings page
    await navigateTo(clipPage, "/settings/custom-fields");
    await initAnnotations(clipPage);
    await caption(clipPage, "Go to Settings → Custom Fields to manage your fields");
    await clipPage.waitForTimeout(3000);
    await clearAll(clipPage);

    // Navigate to new asset to show fields in action
    await chapterCard(clipPage, "In Action", "Custom Fields on the Asset Form", 2500);

    await navigateTo(clipPage, "/assets/new");
    await initAnnotations(clipPage);

    // Smooth scroll to show fields
    await clipPage.evaluate(async () => {
      const ease = (t) => t < 0.5 ? 4 * t * t * t : 1 - Math.pow(-2 * t + 2, 3) / 2;
      const scroll = (target, dur) => new Promise((resolve) => {
        const start = window.scrollY, diff = target - start, t0 = performance.now();
        const s = (now) => { const p = Math.min((now - t0) / dur, 1); window.scrollTo(0, start + diff * ease(p)); p < 1 ? requestAnimationFrame(s) : resolve(); };
        requestAnimationFrame(s);
      });
      await scroll(400, 1500);
      await new Promise(r => setTimeout(r, 800));
      await scroll(0, 1200);
    });
    await clipPage.waitForTimeout(500);

    await caption(clipPage, "Custom fields appear on the New Asset form — fill them just like default fields");
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
  urls.settings = await upload(webp1, `${BUCKET_PREFIX}/custom-fields-settings.webp`);
  urls.newAsset = await upload(webp2, `${BUCKET_PREFIX}/custom-fields-new-asset.webp`);
  urls.mp4 = await upload(mp4, `${BUCKET_PREFIX}/custom-fields-flow.mp4`);
  urls.webm = await upload(webm, `${BUCKET_PREFIX}/custom-fields-flow.webm`);

  Object.values(urls).forEach(u => console.log(`  ✅ ${u}`));

  console.log("\n📋 URLs for MDX:");
  console.log(`  ![Custom Fields settings](${urls.settings})`);
  console.log(`  ![New Asset form with custom fields](${urls.newAsset})`);
  console.log(`  <InlineVideo mp4="${urls.mp4}" webm="${urls.webm}" alt="Walkthrough of adding custom fields to assets in Shelf" />`);

  } finally { await browser.close(); }
}

main().catch((err) => { console.error("❌ Failed:", err); process.exit(1); });
