#!/usr/bin/env node
/** Capture for: duplicating-assets-in-shelf.mdx
 * Shows: Asset detail → Actions dropdown with "Duplicate" highlighted */
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
    const ctx = await createContext(browser);
    const page = await ctx.newPage();
    page.setDefaultTimeout(60000);
    await loginToShelf(page);

    // Find first asset dynamically
    await navigateTo(page, "/assets");
    const assetHref = await page.evaluate(() => document.querySelector('table a[href^="/assets/"]')?.getAttribute("href"));
    if (!assetHref) throw new Error("No assets found");

    // Shot 1: Asset detail with Actions button highlighted
    console.log("📸 Capturing asset with Actions button...");
    await navigateTo(page, assetHref);
    await initAnnotations(page);
    await highlight(page, "text:Actions", { spotlight: true, padding: 8 });
    await callout(page, "text:Actions", "Click Actions to see all available operations — including Duplicate", { label: "Actions Menu", side: "bottom" });
    await caption(page, "Open any asset and click Actions to access the Duplicate option");
    const shot1 = await screenshot(page, join(tmpDir, "duplicate-asset-1.png"));
    await clearAll(page);

    // Shot 2: Actions dropdown open with Duplicate highlighted
    console.log("📸 Capturing Actions dropdown with Duplicate...");
    const actionsBtn = page.locator('button:has-text("Actions")').first();
    if (await actionsBtn.count() > 0) {
      await actionsBtn.click();
      await page.waitForTimeout(1500);
    }
    await initAnnotations(page);
    await highlight(page, "text:Duplicate", { spotlight: true, padding: 6 });
    await callout(page, "text:Duplicate", "Creates copies of this asset — choose how many copies to make", { label: "Duplicate", side: "left" });
    await caption(page, "Actions → Duplicate — enter the number of copies and confirm. New assets get a timestamped suffix.");
    const shot2 = await screenshot(page, join(tmpDir, "duplicate-asset-2.png"));
    await clearAll(page);
    await ctx.close();

    // Video
    console.log("🎬 Recording...");
    const clipPath = await recordClip(browser, async (cp) => {
      await chapterCard(cp, "Duplicate Assets", "Create Quick Copies", 3000);
      await navigateTo(cp, assetHref);
      await initAnnotations(cp);
      await highlight(cp, "text:Actions", { spotlight: true, padding: 8 });
      await callout(cp, "text:Actions", "Click Actions to find the Duplicate option", { label: "Actions", side: "bottom" });
      await caption(cp, "Open any asset and click the Actions button in the top toolbar");
      await cp.waitForTimeout(3000);
      await clearAll(cp);

      // Open the dropdown
      await navigateTo(cp, assetHref);
      await cp.waitForTimeout(1000);
      const ab = cp.locator('button:has-text("Actions")').first();
      if (await ab.count() > 0) {
        await ab.click();
        await cp.waitForTimeout(1500);
      }
      await initAnnotations(cp);
      await highlight(cp, "text:Duplicate", { spotlight: true, padding: 6 });
      await callout(cp, "text:Duplicate", "Creates copies with a timestamped suffix", { label: "Duplicate", side: "left" });
      await caption(cp, "Select Duplicate → choose how many copies → confirm. Each copy gets the same data with a unique name.");
      await cp.waitForTimeout(4500);
      await clearAll(cp);
    });

    console.log("🔄 Converting...");
    const webp1 = toWebP(shot1); const webp2 = toWebP(shot2);
    const { mp4, webm } = toVideoFormats(clipPath);
    console.log("☁️  Uploading...");
    const urls = {};
    urls.a = await upload(webp1, `${BUCKET_PREFIX}/duplicate-asset-1.webp`);
    urls.b = await upload(webp2, `${BUCKET_PREFIX}/duplicate-asset-2.webp`);
    urls.c = await upload(mp4, `${BUCKET_PREFIX}/duplicate-asset-flow.mp4`);
    urls.d = await upload(webm, `${BUCKET_PREFIX}/duplicate-asset-flow.webm`);
    Object.values(urls).forEach(u => console.log(`  ✅ ${u}`));
  } finally { await browser.close(); await rm(tmpDir, { recursive: true, force: true }).catch(() => {}); }
}
main().catch((err) => { console.error("❌ Failed:", err); process.exit(1); });
