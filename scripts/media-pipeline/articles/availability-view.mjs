#!/usr/bin/env node

/**
 * Capture for: availability-view-complete-guide.mdx
 * Shows: List view with calendar toggle → actual availability timeline view
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
  const tmpDir = await mkdtemp(join(tmpdir(), "shelf-availability-view-"));
  console.log(`Working in: ${tmpDir}`);
  let browser;
  try {
    browser = await launchBrowser();
    const context = await createContext(browser);
    const page = await context.newPage();
    page.setDefaultTimeout(60000);
    await loginToShelf(page);

    // Shot 1: List view with the availability toggle highlighted
    console.log("📸 Capturing list view with availability toggle...");
    await navigateTo(page, "/assets");
    await initAnnotations(page);
    await highlight(page, '[aria-label="Switch to availability view"]', { spotlight: true, padding: 8 });
    await callout(page, '[aria-label="Switch to availability view"]', "Click to switch to the Availability View — see booking timelines at a glance", {
      label: "Availability View",
      side: "left",
    });
    await caption(page, "From the Assets index, click the calendar icon to switch to Availability View");
    const shot1 = await screenshot(page, join(tmpDir, "availability-view-1.png"));
    await clearAll(page);

    // Shot 2: The actual availability view
    console.log("📸 Capturing availability view...");
    const avBtn = await page.$('[aria-label="Switch to availability view"]');
    if (!avBtn) throw new Error("Availability view toggle not found");
    await avBtn.click();
    await page.waitForTimeout(3000);
    await initAnnotations(page);
    await caption(page, "Availability View — see each asset's booking timeline with Month, Week, or Day granularity");
    const shot2 = await screenshot(page, join(tmpDir, "availability-view-2.png"));
    await clearAll(page);
    await context.close();

    // Video
    console.log("🎬 Recording availability view walkthrough...");
    const clipPath = await recordClip(browser, async (clipPage) => {
      await chapterCard(clipPage, "Availability View", "See Booking Timelines at a Glance", 3000);
      await navigateTo(clipPage, "/assets");
      await initAnnotations(clipPage);
      await highlight(clipPage, '[aria-label="Switch to availability view"]', { spotlight: true, padding: 8 });
      await callout(clipPage, '[aria-label="Switch to availability view"]', "Click the calendar icon to switch views", { label: "Toggle", side: "left" });
      await caption(clipPage, "Start from the standard asset list view");
      await clipPage.waitForTimeout(3000);
      await clearAll(clipPage);

      await chapterCard(clipPage, "Timeline", "Asset Booking Calendar", 2500);
      // Click the actual toggle instead of URL navigation
      await navigateTo(clipPage, "/assets");
      await clipPage.waitForTimeout(1000);
      const toggle = await clipPage.$('[aria-label="Switch to availability view"]');
      if (toggle) await toggle.click();
      await clipPage.waitForTimeout(2000);
      await initAnnotations(clipPage);
      await caption(clipPage, "Each row is an asset — booking blocks appear on the timeline. Toggle Month, Week, or Day.");
      await clipPage.waitForTimeout(4000);
      await clearAll(clipPage);
    });

    console.log("🔄 Converting...");
    const webp1 = toWebP(shot1);
    const webp2 = toWebP(shot2);
    const { mp4, webm } = toVideoFormats(clipPath);

    console.log("☁️  Uploading...");
    const urls = {};
    urls.list = await upload(webp1, `${BUCKET_PREFIX}/availability-view-1.webp`);
    urls.calendar = await upload(webp2, `${BUCKET_PREFIX}/availability-view-2.webp`);
    urls.mp4 = await upload(mp4, `${BUCKET_PREFIX}/availability-view-flow.mp4`);
    urls.webm = await upload(webm, `${BUCKET_PREFIX}/availability-view-flow.webm`);
    Object.values(urls).forEach(u => console.log(`  ✅ ${u}`));
  } finally {
    if (browser) await browser.close();
    await rm(tmpDir, { recursive: true, force: true }).catch(() => {});
  }
}

main().catch((err) => { console.error("❌ Failed:", err); process.exit(1); });
