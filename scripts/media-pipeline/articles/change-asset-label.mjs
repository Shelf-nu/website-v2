#!/usr/bin/env node

/**
 * Capture annotated screenshots and video for:
 * content/knowledge-base/change-asset-label.mdx
 *
 * QR Code Display settings and how labels appear on asset detail pages
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
  const tmpDir = await mkdtemp(join(tmpdir(), "shelf-asset-label-"));
  console.log(`Working in: ${tmpDir}`);

  const browser = await launchBrowser();
  try {

  const context = await createContext(browser);
  const page = await context.newPage();
  page.setDefaultTimeout(60000);
  await loginToShelf(page);

  // ── Screenshot 1: Settings → General → QR Code Display section ──────
  console.log("📸 Capturing QR Code Display settings...");
  await navigateTo(page, "/settings/general");
  await page.evaluate(() => {
    const headings = document.querySelectorAll("h2, h3, h4, label");
    for (const h of headings) {
      if (h.textContent?.toLowerCase().includes("qr") || h.textContent?.toLowerCase().includes("label")) {
        h.scrollIntoView({ behavior: "instant", block: "start" });
        break;
      }
    }
  });
  await page.waitForTimeout(300);
  await initAnnotations(page);
  await highlight(page, "textStartsWith:QR", { padding: 8 });
  await caption(page, "Go to Settings → General and scroll to QR Code Display to customize your asset labels");
  const shot1 = await screenshot(page, join(tmpDir, "asset-label-1.png"));
  await clearAll(page);

  // ── Screenshot 2: Asset detail page showing QR label in sidebar ─────
  console.log("📸 Capturing asset detail with QR label...");
  await navigateTo(page, "/assets");
  const firstAssetHref = await page.evaluate(() => {
    const link = document.querySelector('table a[href^="/assets/"], a[href^="/assets/"]');
    return link ? link.getAttribute("href") : null;
  });
  if (!firstAssetHref) throw new Error("No assets found in workspace");
  await navigateTo(page, firstAssetHref);
  await initAnnotations(page);
  await caption(page, "The QR label appears in the asset sidebar — it reflects your display settings");
  const shot2 = await screenshot(page, join(tmpDir, "asset-label-2.png"));
  await clearAll(page);
  await context.close();

  // ── Video clip: asset label walkthrough ─────────────────────────────
  console.log("🎬 Recording asset label walkthrough...");
  const clipPath = await recordClip(browser, async (clipPage) => {
    await chapterCard(clipPage, "Asset Labels", "Customize Your QR Code Display", 3000);

    await navigateTo(clipPage, "/settings/general");
    await clipPage.evaluate(() => {
      const headings = document.querySelectorAll("h2, h3, h4, label");
      for (const h of headings) {
        if (h.textContent?.toLowerCase().includes("qr") || h.textContent?.toLowerCase().includes("label")) {
          h.scrollIntoView({ behavior: "instant", block: "start" });
          break;
        }
      }
    });
    await clipPage.waitForTimeout(300);
    await initAnnotations(clipPage);
    await caption(clipPage, "Settings → General → QR Code Display controls what appears on your labels");
    await clipPage.waitForTimeout(3000);
    await clearAll(clipPage);

    await chapterCard(clipPage, "Preview", "See the Label on an Asset", 2500);
    // Look up first asset dynamically
    await navigateTo(clipPage, "/assets");
    const clipAssetHref = await clipPage.evaluate(() => {
      const link = document.querySelector('table a[href^="/assets/"], a[href^="/assets/"]');
      return link ? link.getAttribute("href") : null;
    });
    if (clipAssetHref) {
      await navigateTo(clipPage, clipAssetHref);
    }
    await initAnnotations(clipPage);
    await caption(clipPage, "The asset detail sidebar shows your customized QR label");
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
  urls.shot1 = await upload(webp1, `${BUCKET_PREFIX}/asset-label-1.webp`);
  urls.shot2 = await upload(webp2, `${BUCKET_PREFIX}/asset-label-2.webp`);
  urls.mp4 = await upload(mp4, `${BUCKET_PREFIX}/asset-label-flow.mp4`);
  urls.webm = await upload(webm, `${BUCKET_PREFIX}/asset-label-flow.webm`);
  Object.values(urls).forEach(u => console.log(`  ✅ ${u}`));

  } finally {
    await browser.close();
    await rm(tmpDir, { recursive: true, force: true }).catch(() => {});
  }
}

main().catch((err) => { console.error("❌ Failed:", err); process.exit(1); });
