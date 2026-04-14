#!/usr/bin/env node
/** Capture for: sublocations-organize-locations-into-hierarchies.mdx
 * Locations index shows Parent/Child columns. Click into a parent to see children. */
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
  let browser;
  try {
    browser = await launchBrowser();
    const ctx = await createContext(browser);
    const page = await ctx.newPage();
    page.setDefaultTimeout(60000);
    await loginToShelf(page);

    // Shot 1: Locations index showing Parent and Child columns
    console.log("📸 Capturing locations index with hierarchy columns...");
    await navigateTo(page, "/locations");
    await initAnnotations(page);
    await highlight(page, "text:Parent location", { padding: 8 });
    await callout(page, "text:Parent location", "The Parent and Child columns show your location hierarchy at a glance", { label: "Hierarchy", side: "bottom" });
    await caption(page, "Locations index — Parent location and Child locations columns show the hierarchy tree");
    const shot1 = await screenshot(page, join(tmpDir, "sublocations-1.png"));
    await clearAll(page);

    // Shot 2: Hover on a parent location pill to show the popover with children
    console.log("📸 Capturing parent location popover...");
    // Find a parent location pill (like "Meander 901" or "Studio A") and hover it
    const parentPill = page.locator('table td a[href*="/locations/"]').first();
    if (await parentPill.count() === 0) throw new Error("No location links found in locations table");
    await parentPill.hover();
    await page.waitForTimeout(1500);
    await initAnnotations(page);
    await caption(page, "Hover on a parent location to see its children — the hierarchy is visible at a glance");
    const shot2 = await screenshot(page, join(tmpDir, "sublocations-2.png"));
    await clearAll(page);
    await ctx.close();

    // Video
    console.log("🎬 Recording...");
    const clipPath = await recordClip(browser, async (cp) => {
      await chapterCard(cp, "Sublocations", "Organize Locations into Hierarchies", 3000);
      await navigateTo(cp, "/locations");
      await initAnnotations(cp);
      await highlight(cp, "text:Parent location", { padding: 8 });
      await callout(cp, "text:Parent location", "Parent and Child columns show hierarchy", { label: "Hierarchy", side: "bottom" });
      await caption(cp, "Each location can have a parent and children — building, floor, room, desk");
      await cp.waitForTimeout(3500);
      await clearAll(cp);

      // Hover on a parent location pill to show popover
      const pill = cp.locator('table td a[href*="/locations/"]').first();
      if (await pill.count() === 0) throw new Error("No location links found in locations table (video clip)");
      await pill.hover();
      await cp.waitForTimeout(2000);
      await initAnnotations(cp);
      await caption(cp, "Hover on a parent location to see its children — Studio B → Gear Room, Audio Booth");
      await cp.waitForTimeout(4000);
      await clearAll(cp);
    });

    console.log("🔄 Converting...");
    const webp1 = toWebP(shot1); const webp2 = toWebP(shot2);
    const { mp4, webm } = toVideoFormats(clipPath);
    console.log("☁️  Uploading...");
    const urls = {};
    urls.a = await upload(webp1, `${BUCKET_PREFIX}/sublocations-1.webp`);
    urls.b = await upload(webp2, `${BUCKET_PREFIX}/sublocations-2.webp`);
    urls.c = await upload(mp4, `${BUCKET_PREFIX}/sublocations-flow.mp4`);
    urls.d = await upload(webm, `${BUCKET_PREFIX}/sublocations-flow.webm`);
    Object.values(urls).forEach(u => console.log(`  ✅ ${u}`));
  } finally { if (browser) await browser.close(); await rm(tmpDir, { recursive: true, force: true }).catch(() => {}); }
}
main().catch((err) => { console.error("❌ Failed:", err); process.exit(1); });
