#!/usr/bin/env node

/**
 * Capture annotated screenshots and video for:
 * content/knowledge-base/export-exporting-workspace-data-from-shelf.mdx
 */

import { mkdtemp } from "node:fs/promises";
import { join } from "node:path";
import { tmpdir } from "node:os";
import {
  launchBrowser,
  createContext,
  loginToShelf,
  navigateTo,
} from "../lib/browser.mjs";
import { screenshot, recordClip } from "../lib/capture.mjs";
import { toWebP, toVideoFormats } from "../lib/convert.mjs";
import { upload } from "../lib/upload.mjs";
import {
  initAnnotations,
  highlight,
  callout,
  step,
  caption,
  chapterCard,
  clearAll,
} from "../lib/annotate.mjs";

const BUCKET_PREFIX = "knowledgebase";

async function main() {
  const tmpDir = await mkdtemp(join(tmpdir(), "shelf-export-"));
  console.log(`Working in: ${tmpDir}`);

  const browser = await launchBrowser();
  try {
  const context = await createContext(browser);
  const page = await context.newPage();
  page.setDefaultTimeout(60000);

  await loginToShelf(page);

  // ── Screenshot 1: Assets index — annotated export toolbar ──────────
  console.log("📸 Capturing annotated assets index...");
  await navigateTo(page, "/assets");
  await initAnnotations(page);

  // Spotlight + callout on Export selection
  await highlight(page, "text:Export selection", { spotlight: true, padding: 8 });
  await callout(page, "text:Export selection", "Select assets with checkboxes, then click here to export them as a CSV file.", {
    label: "Export",
    side: "bottom",
  });

  // Step badge on the filter button
  await step(page, "text:Filter", "1", { side: "top-left" });

  // Caption
  await caption(page, "Select the assets you need, then use Export selection to download as CSV", "1");

  const shot1 = await screenshot(page, join(tmpDir, "export-assets-index.png"));
  await clearAll(page);

  // ── Screenshot 2: Settings → Asset backup section ──────────────────
  console.log("📸 Capturing annotated settings CSV download...");
  await navigateTo(page, "/settings/general");
  await initAnnotations(page);

  // Scroll so the Download CSV button is visible and centered
  await page.evaluate(() => {
    const csvLink = Array.from(document.querySelectorAll("a")).find((a) =>
      a.href?.includes(".csv")
    );
    if (csvLink) {
      csvLink.scrollIntoView({ behavior: "instant", block: "center" });
    }
  });
  // Wait for scroll to settle, then verify position
  await page.waitForTimeout(500);
  await page.evaluate(() => {
    const csvLink = Array.from(document.querySelectorAll("a")).find((a) =>
      a.href?.includes(".csv")
    );
    if (csvLink) {
      const rect = csvLink.getBoundingClientRect();
      // If still not in the middle third, force scroll
      if (rect.top > 600 || rect.top < 200) {
        const absoluteTop = rect.top + window.scrollY;
        window.scrollTo({ top: absoluteTop - 400, behavior: "instant" });
      }
    }
  });
  await page.waitForTimeout(1000);

  // Spotlight the Download CSV button
  const csvSelector = 'a[href*=".csv"]';
  await highlight(page, csvSelector, { spotlight: true, padding: 10 });
  await callout(page, csvSelector, "Downloads a complete backup of every asset in your workspace as a CSV file.", {
    label: "Full Backup",
    side: "right",
  });

  await caption(page, "Settings → General → Asset backup → Download CSV for a complete workspace export", "2");

  const shot2 = await screenshot(page, join(tmpDir, "export-workspace-csv.png"));
  await clearAll(page);

  await context.close();

  // ── Video clip: annotated export walkthrough ───────────────────────
  console.log("🎬 Recording annotated export walkthrough...");
  const clipPath = await recordClip(browser, async (clipPage) => {
    await initAnnotations(clipPage);

    // ── CHAPTER 1: Export Selected Assets ──────────────────────────
    await chapterCard(clipPage, "Method 1", "Export a Selection of Assets", 3500);

    // Show the assets page
    await navigateTo(clipPage, "/assets");
    await initAnnotations(clipPage);

    // Smooth scroll through the list
    await clipPage.evaluate(async () => {
      const ease = (t) => t < 0.5 ? 4 * t * t * t : 1 - Math.pow(-2 * t + 2, 3) / 2;
      const scroll = (target, dur) => new Promise((resolve) => {
        const start = window.scrollY, diff = target - start, t0 = performance.now();
        const s = (now) => { const p = Math.min((now - t0) / dur, 1); window.scrollTo(0, start + diff * ease(p)); p < 1 ? requestAnimationFrame(s) : resolve(); };
        requestAnimationFrame(s);
      });
      await scroll(250, 1200);
      await new Promise(r => setTimeout(r, 500));
      await scroll(0, 1200);
    });
    await clipPage.waitForTimeout(600);

    // Highlight the Export selection button
    await highlight(clipPage, "text:Export selection", { spotlight: true, padding: 8 });
    await callout(clipPage, "text:Export selection", "Select specific assets, then export them as CSV", {
      label: "Export Selection",
      side: "bottom",
    });
    await caption(clipPage, "Select the assets you need → click Export selection → download CSV");
    await clipPage.waitForTimeout(4000);
    await clearAll(clipPage);

    // ── CHAPTER 2: Full Database Export ──────────────────────────────
    await chapterCard(clipPage, "Method 2", "Full Asset Database Backup", 3500);

    // Navigate to settings
    await navigateTo(clipPage, "/settings/general");
    await initAnnotations(clipPage);
    await clipPage.waitForTimeout(800);

    // Smooth scroll to CSV section
    await clipPage.evaluate(() => {
      const csvLink = Array.from(document.querySelectorAll("a")).find(a => a.href?.includes(".csv"));
      if (csvLink) {
        const section = csvLink.closest("div")?.parentElement || csvLink.parentElement;
        if (section) section.scrollIntoView({ behavior: "smooth", block: "center" });
      }
    });
    await clipPage.waitForTimeout(1500);

    // Spotlight the Download CSV button
    await highlight(clipPage, 'a[href*=".csv"]', { spotlight: true, padding: 10 });
    await callout(clipPage, 'a[href*=".csv"]', "Downloads every asset in your workspace as a complete CSV backup", {
      label: "Full Backup",
      side: "right",
    });
    await caption(clipPage, "Settings → General → Asset backup → Download CSV for a complete export");
    await clipPage.waitForTimeout(4000);
    await clearAll(clipPage);
  });

  // ── Convert ────────────────────────────────────────────────────────
  console.log("🔄 Converting screenshots to WebP...");
  const webp1 = toWebP(shot1);
  const webp2 = toWebP(shot2);

  console.log("🔄 Converting video to MP4 + WebM...");
  const { mp4, webm } = toVideoFormats(clipPath);

  // ── Upload ─────────────────────────────────────────────────────────
  console.log("☁️  Uploading to Supabase Storage...");

  const urls = {};
  urls.assetsIndex = await upload(webp1, `${BUCKET_PREFIX}/export-assets-index.webp`);
  console.log(`  ✅ ${urls.assetsIndex}`);

  urls.settingsCsv = await upload(webp2, `${BUCKET_PREFIX}/export-workspace-csv.webp`);
  console.log(`  ✅ ${urls.settingsCsv}`);

  urls.clipMp4 = await upload(mp4, `${BUCKET_PREFIX}/export-flow.mp4`);
  console.log(`  ✅ ${urls.clipMp4}`);

  urls.clipWebm = await upload(webm, `${BUCKET_PREFIX}/export-flow.webm`);
  console.log(`  ✅ ${urls.clipWebm}`);

  console.log("\n📋 Upload complete! URLs for MDX:\n");
  console.log("Screenshots:");
  console.log(`  ![Assets index with export toolbar](${urls.assetsIndex})`);
  console.log(`  ![Workspace settings CSV download](${urls.settingsCsv})`);
  console.log("\nVideo clip:");
  console.log(`  <InlineVideo mp4="${urls.clipMp4}" webm="${urls.clipWebm}" alt="Walkthrough of exporting assets from Shelf" />`);

  } finally {
    await browser.close();
  }
}

main().catch((err) => {
  console.error("❌ Failed:", err);
  process.exit(1);
});
