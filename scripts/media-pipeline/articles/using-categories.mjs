#!/usr/bin/env node
/** Capture for: using-categories-to-organize-your-asset-inventory.mdx */
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
  const tmpDir = await mkdtemp(join(tmpdir(), "shelf-categories-"));
  console.log(`Working in: ${tmpDir}`);
  const browser = await launchBrowser();
  try {
    const ctx = await createContext(browser);
    const page = await ctx.newPage();
    page.setDefaultTimeout(60000);
    await loginToShelf(page);

    // Shot 1: Categories index with New category button
    console.log("📸 Capturing categories index...");
    await navigateTo(page, "/categories");
    await initAnnotations(page);
    await highlight(page, "text:New category", { spotlight: true, padding: 8 });
    await callout(page, "text:New category", "Create categories with custom names and colors to organize your assets", { label: "New Category", side: "bottom" });
    await caption(page, "Categories page — each category has a name, color badge, and shows how many assets use it");
    const shot1 = await screenshot(page, join(tmpDir, "categories-1.png"));
    await clearAll(page);

    // Shot 2: Click edit pencil on a category with assets to show edit form
    console.log("📸 Capturing category edit form...");
    const editHref = await page.evaluate(() => {
      const editLinks = Array.from(document.querySelectorAll('a[href*="/categories/"]')).filter(a => a.href.includes('edit'));
      return editLinks.length > 0 ? editLinks[0].href : null;
    });
    if (editHref) {
      await page.goto(editHref, { waitUntil: 'domcontentloaded' });
      await page.waitForTimeout(3000);
    }
    await initAnnotations(page);
    await caption(page, "Edit a category — change name, description, and color. Click Save to update all assets using this category.");
    const shot2 = await screenshot(page, join(tmpDir, "categories-2.png"));
    await clearAll(page);
    await ctx.close();

    // Video
    console.log("🎬 Recording...");
    const clipPath = await recordClip(browser, async (cp) => {
      await chapterCard(cp, "Categories", "Organize Your Assets by Type", 3000);
      await navigateTo(cp, "/categories");
      await initAnnotations(cp);
      await highlight(cp, "text:New category", { spotlight: true, padding: 8 });
      await callout(cp, "text:New category", "Create a new category", { label: "New", side: "bottom" });
      await caption(cp, "Categories group your assets — Camera, Audio, Lighting, and more");
      await cp.waitForTimeout(3500);
      await clearAll(cp);

      // Scroll to show all
      await cp.evaluate(async () => {
        await new Promise(r => { window.scrollTo({ top: 400, behavior: 'smooth' }); setTimeout(r, 1200); });
        await new Promise(r => { window.scrollTo({ top: 0, behavior: 'smooth' }); setTimeout(r, 1000); });
      });
      await initAnnotations(cp);
      await caption(cp, "Each category shows its asset count — edit or delete with the icons on the right");
      await cp.waitForTimeout(3500);
      await clearAll(cp);
    });

    console.log("🔄 Converting...");
    const webp1 = toWebP(shot1); const webp2 = toWebP(shot2);
    const { mp4, webm } = toVideoFormats(clipPath);
    console.log("☁️  Uploading...");
    const urls = {};
    urls.a = await upload(webp1, `${BUCKET_PREFIX}/categories-1.webp`);
    urls.b = await upload(webp2, `${BUCKET_PREFIX}/categories-2.webp`);
    urls.c = await upload(mp4, `${BUCKET_PREFIX}/categories-flow.mp4`);
    urls.d = await upload(webm, `${BUCKET_PREFIX}/categories-flow.webm`);
    Object.values(urls).forEach(u => console.log(`  ✅ ${u}`));
  } finally { await browser.close(); await rm(tmpDir, { recursive: true, force: true }).catch(() => {}); }
}
main().catch((err) => { console.error("❌ Failed:", err); process.exit(1); });
