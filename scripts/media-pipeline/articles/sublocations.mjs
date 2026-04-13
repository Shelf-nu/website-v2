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
  const browser = await launchBrowser();
  try {
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

    // Shot 2: Click into a location that has children to show detail
    console.log("📸 Capturing location detail with children...");
    // Find a location with child count > 0 — Studio B has 2 children from recon
    const locHref = await page.evaluate(() => {
      const rows = Array.from(document.querySelectorAll('table tbody tr'));
      for (const row of rows) {
        const childCell = row.querySelector('td:nth-child(5)');
        if (childCell && parseInt(childCell.textContent) > 0) {
          const link = row.querySelector('a[href*="/locations/"]');
          return link ? link.getAttribute('href') : null;
        }
      }
      return null;
    });
    if (locHref) {
      await navigateTo(page, locHref);
    }
    await initAnnotations(page);
    await caption(page, "Location detail — see all assets at this location and its child locations");
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

      // Scroll to show all locations
      await cp.evaluate(async () => {
        await new Promise(r => { window.scrollTo({ top: 300, behavior: 'smooth' }); setTimeout(r, 1200); });
        await new Promise(r => { window.scrollTo({ top: 0, behavior: 'smooth' }); setTimeout(r, 1000); });
      });
      await initAnnotations(cp);
      await caption(cp, "Studio B → Gear Room, Audio Booth. Studio A → Post-Production Suite, Control Room.");
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
  } finally { await browser.close(); await rm(tmpDir, { recursive: true, force: true }).catch(() => {}); }
}
main().catch((err) => { console.error("❌ Failed:", err); process.exit(1); });
