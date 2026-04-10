#!/usr/bin/env node

/**
 * Capture annotated screenshots and video for:
 * content/knowledge-base/kits.mdx
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
  const tmpDir = await mkdtemp(join(tmpdir(), "shelf-kits-"));
  console.log(`Working in: ${tmpDir}`);

  const browser = await launchBrowser();
  try {

  const context = await createContext(browser);
  const page = await context.newPage();
  page.setDefaultTimeout(60000);
  await loginToShelf(page);

  // ── Screenshot 1: Kits index ───────────────────────────────────────
  console.log("📸 Capturing Kits index...");
  await navigateTo(page, "/kits");
  await initAnnotations(page);
  await highlight(page, "text:New kit", { spotlight: true, padding: 8 });
  await callout(page, "text:New kit", "Create a kit to group related assets that move together", {
    label: "Create Kit",
    side: "bottom",
  });
  await caption(page, "Kits group related assets — perfect for camera kits, tool sets, or any equipment that travels together");
  const shot1 = await screenshot(page, join(tmpDir, "kits-index.png"));
  await clearAll(page);

  // ── Screenshot 2: Kit detail page (existing kit with assets) ───────
  console.log("📸 Capturing kit detail page...");
  // Click on a kit that has multiple assets
  const kitLink = page.locator('a:has-text("Basic Video Production Kit")').first();
  if (await kitLink.count() === 0) throw new Error("Basic Video Production Kit not found");
  await kitLink.click();
  await page.waitForTimeout(3000);

  await initAnnotations(page);
  await caption(page, "A kit page shows all included assets, a single QR code, and the current custodian");
  const shot2 = await screenshot(page, join(tmpDir, "kits-detail.png"));
  await clearAll(page);

  // ── Screenshot 3: Kit overview tab showing more details ────────────
  console.log("📸 Capturing kit Overview tab...");
  const overviewTab = page.locator('a:has-text("Overview"), button:has-text("Overview")').first();
  if (await overviewTab.count() > 0) {
    await overviewTab.click().catch(() => {});
    await page.waitForTimeout(2000);
  }
  await initAnnotations(page);
  await caption(page, "The Overview tab shows the kit description, image, and total asset count");
  const shot3 = await screenshot(page, join(tmpDir, "kits-overview.png"));
  await clearAll(page);
  await context.close();

  // ── Video clip ─────────────────────────────────────────────────────
  console.log("🎬 Recording kits walkthrough...");
  const clipPath = await recordClip(browser, async (clipPage) => {
    await chapterCard(clipPage, "Kits", "Group Related Assets Together", 3000);

    // Show kits index
    await navigateTo(clipPage, "/kits");
    await initAnnotations(clipPage);
    await caption(clipPage, "Kits group related assets — perfect for camera setups, tool sets, equipment bundles");
    await clipPage.waitForTimeout(2500);
    await clearAll(clipPage);

    await initAnnotations(clipPage);
    await highlight(clipPage, "text:New kit", { spotlight: true, padding: 8 });
    await callout(clipPage, "text:New kit", "Click here to create a new kit", {
      label: "New Kit",
      side: "bottom",
    });
    await clipPage.waitForTimeout(3000);
    await clearAll(clipPage);

    // Click into an existing kit
    await chapterCard(clipPage, "Inside a Kit", "One Unit, One QR Code, Many Assets", 2500);

    // Navigate directly to the kit instead of clicking through (avoids annotation overlay issues)
    await navigateTo(clipPage, "/kits/clx3baakg001qu5dlfmcgreqj/assets");
    await clipPage.waitForTimeout(2000);

    await initAnnotations(clipPage);
    await caption(clipPage, "All assets in this kit move together — assign custody to the whole kit at once");
    await clipPage.waitForTimeout(3500);
    await clearAll(clipPage);

    // Smooth scroll to show all the kit details
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
    await clipPage.waitForTimeout(800);

    await initAnnotations(clipPage);
    await caption(clipPage, "One QR code on the kit means scanning it shows you everything inside");
    await clipPage.waitForTimeout(3000);
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
  urls.index = await upload(webp1, `${BUCKET_PREFIX}/kits-index.webp`);
  urls.detail = await upload(webp2, `${BUCKET_PREFIX}/kits-detail.webp`);
  urls.overview = await upload(webp3, `${BUCKET_PREFIX}/kits-overview.webp`);
  urls.mp4 = await upload(mp4, `${BUCKET_PREFIX}/kits-flow.mp4`);
  urls.webm = await upload(webm, `${BUCKET_PREFIX}/kits-flow.webm`);

  Object.values(urls).forEach(u => console.log(`  ✅ ${u}`));

  } finally { await browser.close(); }
}

main().catch((err) => { console.error("❌ Failed:", err); process.exit(1); });
