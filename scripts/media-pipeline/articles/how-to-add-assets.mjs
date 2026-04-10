#!/usr/bin/env node

/**
 * Capture annotated screenshots and video for:
 * content/knowledge-base/how-to-add-assets-to-your-inventory.mdx
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
  const tmpDir = await mkdtemp(join(tmpdir(), "shelf-add-assets-"));
  console.log(`Working in: ${tmpDir}`);

  const browser = await launchBrowser();
  try {

  const context = await createContext(browser);
  const page = await context.newPage();
  page.setDefaultTimeout(60000);
  await loginToShelf(page);

  // ── Screenshot 1: Assets index with "New asset" button ─────────────
  console.log("📸 Capturing assets index with New asset button...");
  await navigateTo(page, "/assets");
  await initAnnotations(page);
  await highlight(page, "text:New asset", { spotlight: true, padding: 8 });
  await callout(page, "text:New asset", "Click to start adding a new asset to your inventory", {
    label: "Add Asset",
    side: "bottom",
  });
  await caption(page, "From the Assets index, click New asset to add an item manually");
  const shot1 = await screenshot(page, join(tmpDir, "add-assets-index.png"));
  await clearAll(page);

  // ── Screenshot 2: New Asset form ───────────────────────────────────
  console.log("📸 Capturing New Asset form...");
  await navigateTo(page, "/assets/new");
  await initAnnotations(page);
  await caption(page, "Fill in the asset name, category, location, and other details — then click Save");
  const shot2 = await screenshot(page, join(tmpDir, "add-assets-form.png"));
  await clearAll(page);

  // ── Screenshot 3: Import option ────────────────────────────────────
  console.log("📸 Capturing Import option...");
  await navigateTo(page, "/assets");
  await initAnnotations(page);
  await highlight(page, "text:Import", { spotlight: true, padding: 8 });
  await callout(page, "text:Import", "For larger inventories, import assets from a CSV file", {
    label: "Bulk Import",
    side: "bottom",
  });
  await caption(page, "Use Import to bring hundreds of assets at once via spreadsheet");
  const shot3 = await screenshot(page, join(tmpDir, "add-assets-import.png"));
  await clearAll(page);
  await context.close();

  // ── Video clip ─────────────────────────────────────────────────────
  console.log("🎬 Recording add assets walkthrough...");
  const clipPath = await recordClip(browser, async (clipPage) => {
    await chapterCard(clipPage, "Method 1", "Add Assets Manually", 3000);

    await navigateTo(clipPage, "/assets");
    await initAnnotations(clipPage);
    await highlight(clipPage, "text:New asset", { spotlight: true, padding: 8 });
    await callout(clipPage, "text:New asset", "Click here to add a new asset", {
      label: "New Asset",
      side: "bottom",
    });
    await clipPage.waitForTimeout(3000);
    await clearAll(clipPage);

    // Show the form
    await navigateTo(clipPage, "/assets/new");
    await clipPage.waitForTimeout(1000);

    await initAnnotations(clipPage);
    await caption(clipPage, "Fill in the asset details — name, category, location, image, custom fields");
    await clipPage.waitForTimeout(3500);
    await clearAll(clipPage);

    // Smooth scroll through the form
    await clipPage.evaluate(async () => {
      const ease = (t) => t < 0.5 ? 4 * t * t * t : 1 - Math.pow(-2 * t + 2, 3) / 2;
      const scroll = (target, dur) => new Promise((resolve) => {
        const start = window.scrollY, diff = target - start, t0 = performance.now();
        const s = (now) => { const p = Math.min((now - t0) / dur, 1); window.scrollTo(0, start + diff * ease(p)); p < 1 ? requestAnimationFrame(s) : resolve(); };
        requestAnimationFrame(s);
      });
      await scroll(500, 1500);
      await new Promise(r => setTimeout(r, 800));
      await scroll(0, 1200);
    });
    await clipPage.waitForTimeout(800);

    // Chapter 2: Bulk import
    await chapterCard(clipPage, "Method 2", "Import Assets in Bulk via CSV", 3000);

    await navigateTo(clipPage, "/assets");
    await initAnnotations(clipPage);
    await highlight(clipPage, "text:Import", { spotlight: true, padding: 8 });
    await callout(clipPage, "text:Import", "Import hundreds of assets from a spreadsheet at once", {
      label: "CSV Import",
      side: "bottom",
    });
    await caption(clipPage, "For larger inventories, use Import to bring everything in via CSV");
    await clipPage.waitForTimeout(4000);
    await clearAll(clipPage);
  });

  // ── Convert + Upload ───────────────────────────────────────────────
  console.log("🔄 Converting...");
  const webp1 = toWebP(shot1);
  const webp2 = toWebP(shot2);
  const webp3 = toWebP(shot3);
  const { mp4, webm } = toVideoFormats(clipPath);

  console.log("☁️  Uploading...");
  const urls = {};
  urls.index = await upload(webp1, `${BUCKET_PREFIX}/add-assets-index.webp`);
  urls.form = await upload(webp2, `${BUCKET_PREFIX}/add-assets-form.webp`);
  urls.import = await upload(webp3, `${BUCKET_PREFIX}/add-assets-import.webp`);
  urls.mp4 = await upload(mp4, `${BUCKET_PREFIX}/add-assets-flow.mp4`);
  urls.webm = await upload(webm, `${BUCKET_PREFIX}/add-assets-flow.webm`);

  Object.values(urls).forEach(u => console.log(`  ✅ ${u}`));

  } finally { await browser.close(); }
}

main().catch((err) => { console.error("❌ Failed:", err); process.exit(1); });
