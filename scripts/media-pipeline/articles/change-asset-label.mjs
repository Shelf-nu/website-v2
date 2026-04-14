#!/usr/bin/env node
/** Capture for: change-asset-label-information.mdx
 * Shows: Settings → General → QR Code Display dropdown + asset detail with QR label */
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
    const ctx = await createContext(browser);
    const page = await ctx.newPage();
    page.setDefaultTimeout(60000);
    await loginToShelf(page);

    // Shot 1: Settings → General → QR Code Display section highlighted
    console.log("📸 Capturing QR Code Display settings...");
    await navigateTo(page, "/settings/general");
    // Scroll to QR Code Display
    const qrSection = page.locator('text=QR Code Display').first();
    if (await qrSection.count() > 0) {
      await qrSection.scrollIntoViewIfNeeded();
      await page.waitForTimeout(300);
      await page.evaluate(() => window.scrollBy(0, -80));
      await page.waitForTimeout(500);
    }
    await initAnnotations(page);
    await highlight(page, "text:QR Code Display", { spotlight: true, padding: 8 });
    await callout(page, "text:QR Code Display", "Choose what ID appears on your QR labels — the QR Code ID or the Sequential Asset Number (SAM ID)", { label: "Label Config", side: "right" });
    await caption(page, "Settings → General → QR Code Display — choose between QR Code ID or SAM ID on your asset labels");
    const shot1 = await screenshot(page, join(tmpDir, "asset-label-1.png"));
    await clearAll(page);

    // Shot 2: Asset detail — scroll right sidebar to show QR label with the ID visible
    console.log("📸 Capturing asset QR label...");
    await navigateTo(page, "/assets");
    const assetHref = await page.evaluate(() => {
      const link = document.querySelector('table a[href^="/assets/"]');
      return link ? link.getAttribute("href") : null;
    });
    if (!assetHref) throw new Error("No assets found");
    await navigateTo(page, assetHref);
    // Scroll down so the QR code label in the sidebar is fully visible with the ID text below it
    await page.evaluate(() => window.scrollTo({ top: 300, behavior: 'instant' }));
    await page.waitForTimeout(1000);
    await initAnnotations(page);
    // Highlight the Shelf QR Code dropdown which shows the ID type
    await highlight(page, "text:Shelf QR Code", { spotlight: true, padding: 8 });
    await callout(page, "text:Shelf QR Code", "This label shows the identifier you chose in Settings — QR Code ID or SAM ID", { label: "Your Label", side: "left" });
    await caption(page, "The QR label on the asset sidebar reflects your QR Code Display setting — download or print from here");
    const shot2 = await screenshot(page, join(tmpDir, "asset-label-2.png"));
    await clearAll(page);
    await ctx.close();

    // Video
    console.log("🎬 Recording...");
    const clipPath = await recordClip(browser, async (cp) => {
      await chapterCard(cp, "Asset Labels", "Choose What Appears on Your QR Codes", 3000);
      await navigateTo(cp, "/settings/general");
      const qr = cp.locator('text=QR Code Display').first();
      if (await qr.count() > 0) {
        await qr.scrollIntoViewIfNeeded();
        await cp.waitForTimeout(300);
        await cp.evaluate(() => window.scrollBy(0, -80));
        await cp.waitForTimeout(500);
      }
      await initAnnotations(cp);
      await highlight(cp, "text:QR Code Display", { spotlight: true, padding: 8 });
      await callout(cp, "text:QR Code Display", "Switch between QR Code ID and SAM ID", { label: "Config", side: "right" });
      await caption(cp, "Settings → General → QR Code Display — choose the identifier shown on asset labels");
      await cp.waitForTimeout(4000);
      await clearAll(cp);

      await chapterCard(cp, "On the Asset", "See Your Label in the Sidebar", 2500);
      await navigateTo(cp, "/assets");
      const href = await cp.evaluate(() => document.querySelector('table a[href^="/assets/"]')?.getAttribute("href"));
      if (href) await navigateTo(cp, href);
      await cp.waitForTimeout(1500);
      // Scroll to show the QR label clearly
      await cp.evaluate(() => window.scrollTo({ top: 300, behavior: 'smooth' }));
      await cp.waitForTimeout(1500);
      await initAnnotations(cp);
      await highlight(cp, "text:Shelf QR Code", { spotlight: true, padding: 8 });
      await caption(cp, "The label shows your chosen ID — scroll down to see the full QR code with the identifier beneath it");
      await cp.waitForTimeout(4000);
      await clearAll(cp);
    });

    console.log("🔄 Converting...");
    const webp1 = toWebP(shot1); const webp2 = toWebP(shot2);
    const { mp4, webm } = toVideoFormats(clipPath);
    console.log("☁️  Uploading...");
    const urls = {};
    urls.a = await upload(webp1, `${BUCKET_PREFIX}/asset-label-1.webp`);
    urls.b = await upload(webp2, `${BUCKET_PREFIX}/asset-label-2.webp`);
    urls.c = await upload(mp4, `${BUCKET_PREFIX}/asset-label-flow.mp4`);
    urls.d = await upload(webm, `${BUCKET_PREFIX}/asset-label-flow.webm`);
    Object.values(urls).forEach(u => console.log(`  ✅ ${u}`));
  } finally { await browser.close(); await rm(tmpDir, { recursive: true, force: true }).catch(() => {}); }
}
main().catch((err) => { console.error("❌ Failed:", err); process.exit(1); });
