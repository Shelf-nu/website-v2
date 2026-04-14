#!/usr/bin/env node
/** Capture for: sequential-asset-ids-simplifying-asset-identification.mdx
 * Show the Asset ID column (SAM-XXXX) in the index + asset detail showing the ID */
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
  const tmpDir = await mkdtemp(join(tmpdir(), "shelf-sequential-ids-"));
  console.log(`Working in: ${tmpDir}`);
  let browser;
  try {
    browser = await launchBrowser();
    const ctx = await createContext(browser);
    const page = await ctx.newPage();
    page.setDefaultTimeout(60000);
    await loginToShelf(page);

    // Shot 1: Asset detail showing the Asset ID field (SAM-XXXX)
    console.log("📸 Capturing asset detail with SAM ID...");
    // Navigate to first asset to show the Asset ID field
    await navigateTo(page, "/assets");
    const assetHref = await page.evaluate(() => {
      const link = document.querySelector('table a[href^="/assets/"]');
      return link ? link.getAttribute("href") : null;
    });
    if (!assetHref) throw new Error("No assets found");
    await navigateTo(page, assetHref);
    // The Asset ID field (SAM-XXXX) should be on the detail page
    await initAnnotations(page);
    await highlight(page, "text:Asset ID", { padding: 8 });
    await callout(page, "text:Asset ID", "Sequential Asset IDs (SAM-0001, SAM-0002, ...) are auto-assigned when you create assets", { label: "Asset ID", side: "right" });
    await caption(page, "Each asset gets a sequential ID — visible on the asset detail page and searchable across your workspace");
    const shot1 = await screenshot(page, join(tmpDir, "sequential-ids-1.png"));
    await clearAll(page);

    // Shot 2: Settings showing the Asset ID prefix configuration
    console.log("📸 Capturing Asset ID settings...");
    await navigateTo(page, "/settings/general");
    // The Asset ID config is in the general settings — look for it
    await initAnnotations(page);
    await caption(page, "Settings → General — configure the Asset ID prefix and format for your workspace");
    const shot2 = await screenshot(page, join(tmpDir, "sequential-ids-2.png"));
    await clearAll(page);
    await ctx.close();

    // Video
    console.log("🎬 Recording...");
    const clipPath = await recordClip(browser, async (cp) => {
      await chapterCard(cp, "Sequential IDs", "Auto-Assigned Asset Identifiers", 3000);

      // Show asset detail with SAM ID
      await navigateTo(cp, "/assets");
      await cp.waitForTimeout(2000);
      const href = await cp.evaluate(() => {
        const link = document.querySelector('table a[href^="/assets/"]');
        return link ? link.getAttribute("href") : null;
      });
      if (!href) throw new Error("No assets found for sequential IDs clip");
      await navigateTo(cp, href);
      await cp.waitForTimeout(2000);
      await initAnnotations(cp);
      await highlight(cp, "text:Asset ID", { padding: 8 });
      await callout(cp, "text:Asset ID", "SAM-0042 — auto-assigned when the asset was created", { label: "Asset ID", side: "right" });
      await caption(cp, "Every asset gets a unique sequential ID — SAM-0001, SAM-0002, and so on");
      await cp.waitForTimeout(4000);
      await clearAll(cp);
    });

    console.log("🔄 Converting...");
    const webp1 = toWebP(shot1); const webp2 = toWebP(shot2);
    const { mp4, webm } = toVideoFormats(clipPath);
    console.log("☁️  Uploading...");
    const urls = {};
    urls.a = await upload(webp1, `${BUCKET_PREFIX}/sequential-ids-1.webp`);
    urls.b = await upload(webp2, `${BUCKET_PREFIX}/sequential-ids-2.webp`);
    urls.c = await upload(mp4, `${BUCKET_PREFIX}/sequential-ids-flow.mp4`);
    urls.d = await upload(webm, `${BUCKET_PREFIX}/sequential-ids-flow.webm`);
    Object.values(urls).forEach(u => console.log(`  ✅ ${u}`));
  } finally { if (browser) await browser.close(); await rm(tmpDir, { recursive: true, force: true }).catch(() => {}); }
}
main().catch((err) => { console.error("❌ Failed:", err); process.exit(1); });
