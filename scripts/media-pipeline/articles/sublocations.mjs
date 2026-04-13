#!/usr/bin/env node

/**
 * Capture annotated screenshots and video for:
 * content/knowledge-base/sublocations.mdx
 *
 * Location hierarchy and sublocation support
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
  const tmpDir = await mkdtemp(join(tmpdir(), "shelf-sublocations-"));
  console.log(`Working in: ${tmpDir}`);

  const browser = await launchBrowser();
  try {

  const context = await createContext(browser);
  const page = await context.newPage();
  page.setDefaultTimeout(60000);
  await loginToShelf(page);

  // ── Screenshot 1: Locations index showing hierarchy ─────────────────
  console.log("📸 Capturing locations index...");
  await navigateTo(page, "/locations");
  await initAnnotations(page);
  await caption(page, "The locations page shows your full hierarchy — parent locations with nested sublocations");
  const shot1 = await screenshot(page, join(tmpDir, "sublocations-1.png"));
  await clearAll(page);

  // ── Screenshot 2: Location detail or create form with Parent field ──
  console.log("📸 Capturing location detail...");
  await navigateTo(page, "/locations");
  const firstLocationHref = await page.evaluate(() => {
    const link = document.querySelector('a[href^="/locations/"]');
    return link ? link.getAttribute("href") : null;
  });
  if (firstLocationHref) {
    await navigateTo(page, firstLocationHref);
  }
  await initAnnotations(page);
  await highlight(page, "textStartsWith:Parent", { padding: 6 });
  await caption(page, "Each location can have a parent — this creates the hierarchy for sublocations");
  const shot2 = await screenshot(page, join(tmpDir, "sublocations-2.png"));
  await clearAll(page);
  await context.close();

  // ── Video clip: sublocations walkthrough ────────────────────────────
  console.log("🎬 Recording sublocations walkthrough...");
  const clipPath = await recordClip(browser, async (clipPage) => {
    await chapterCard(clipPage, "Sublocations", "Build a Location Hierarchy", 3000);

    await navigateTo(clipPage, "/locations");
    await initAnnotations(clipPage);
    await caption(clipPage, "Your locations page shows the full tree of locations and sublocations");
    await clipPage.waitForTimeout(3000);
    await clearAll(clipPage);

    await chapterCard(clipPage, "Hierarchy", "Parent and Child Locations", 2500);
    await navigateTo(clipPage, "/locations");
    await initAnnotations(clipPage);
    await caption(clipPage, "Scroll through the hierarchy to see how sublocations nest under parents");
    await clipPage.evaluate(() => window.scrollBy(0, 300));
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
  urls.shot1 = await upload(webp1, `${BUCKET_PREFIX}/sublocations-1.webp`);
  urls.shot2 = await upload(webp2, `${BUCKET_PREFIX}/sublocations-2.webp`);
  urls.mp4 = await upload(mp4, `${BUCKET_PREFIX}/sublocations-flow.mp4`);
  urls.webm = await upload(webm, `${BUCKET_PREFIX}/sublocations-flow.webm`);
  Object.values(urls).forEach(u => console.log(`  ✅ ${u}`));

  } finally {
    await browser.close();
    await rm(tmpDir, { recursive: true, force: true }).catch(() => {});
  }
}

main().catch((err) => { console.error("❌ Failed:", err); process.exit(1); });
