#!/usr/bin/env node
/** Video for: using-batch-actions-in-shelf.mdx
 * Shows: Select assets → toolbar lights up → Actions dropdown with 14 operations */
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
  const tmpDir = await mkdtemp(join(tmpdir(), "shelf-batch-actions-"));
  console.log(`Working in: ${tmpDir}`);
  let browser;
  try {
    browser = await launchBrowser();
    const ctx = await createContext(browser);
    const page = await ctx.newPage();
    page.setDefaultTimeout(60000);
    await loginToShelf(page);

    // Screenshot: assets selected with Actions dropdown open
    console.log("📸 Capturing batch actions dropdown...");
    await navigateTo(page, "/assets");
    // Select all via header checkbox
    const hdr = await page.$('thead th:first-child');
    if (!hdr) throw new Error("Header checkbox not found");
    await hdr.click();
    await page.waitForTimeout(1000);
    // Open Actions dropdown
    const actionsBtn = page.locator('button:has-text("Actions")').first();
    if (await actionsBtn.count() === 0) throw new Error("Actions button not found");
    await actionsBtn.click();
    await page.waitForTimeout(1500);
    await initAnnotations(page);
    await caption(page, "Select assets → click Actions to see all available batch operations");
    const shot1 = await screenshot(page, join(tmpDir, "batch-actions-1.png"));
    await clearAll(page);
    await ctx.close();

    // Video
    console.log("🎬 Recording batch actions walkthrough...");
    const clipPath = await recordClip(browser, async (cp) => {
      await chapterCard(cp, "Batch Actions", "Manage Multiple Assets at Once", 3000);

      // Start with unselected assets
      await navigateTo(cp, "/assets");
      await initAnnotations(cp);
      await caption(cp, "Start by selecting the assets you want to act on");
      await cp.waitForTimeout(2500);
      await clearAll(cp);

      // Select all
      const h = await cp.$('thead th:first-child');
      if (h) await h.click();
      await cp.waitForTimeout(1500);

      await initAnnotations(cp);
      await highlight(cp, "text:Export selection", { padding: 6 });
      await caption(cp, "20 assets selected — Export selection and Actions buttons are now active");
      await cp.waitForTimeout(3000);
      await clearAll(cp);

      // Open Actions dropdown
      await chapterCard(cp, "Actions Menu", "14 Batch Operations Available", 2500);
      await navigateTo(cp, "/assets");
      await cp.waitForTimeout(1000);
      const h2 = await cp.$('thead th:first-child');
      if (h2) await h2.click();
      await cp.waitForTimeout(1000);
      const ab = cp.locator('button:has-text("Actions")').first();
      if (await ab.count() > 0) await ab.click();
      await cp.waitForTimeout(1500);

      await initAnnotations(cp);
      await caption(cp, "Download QR codes, create audits, assign custody/tags, update category/location, add to kit, and more");
      await cp.waitForTimeout(4500);
      await clearAll(cp);
    });

    console.log("🔄 Converting...");
    const webp1 = toWebP(shot1);
    const { mp4, webm } = toVideoFormats(clipPath);
    console.log("☁️  Uploading...");
    const urls = {};
    urls.a = await upload(webp1, `${BUCKET_PREFIX}/batch-actions-1.webp`);
    urls.b = await upload(mp4, `${BUCKET_PREFIX}/batch-actions-flow.mp4`);
    urls.c = await upload(webm, `${BUCKET_PREFIX}/batch-actions-flow.webm`);
    Object.values(urls).forEach(u => console.log(`  ✅ ${u}`));
  } finally { if (browser) await browser.close(); await rm(tmpDir, { recursive: true, force: true }).catch(() => {}); }
}
main().catch((err) => { console.error("❌ Failed:", err); process.exit(1); });
