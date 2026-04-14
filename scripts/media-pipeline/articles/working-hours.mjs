#!/usr/bin/env node
/** Capture for: working-hours-set-operating-schedules-for-your-workspace.mdx
 * Shows: Settings → Bookings scrolled to Working hours section with enable toggle */
import { mkdtemp, rm } from "node:fs/promises";
import { join } from "node:path";
import { tmpdir } from "node:os";
import { launchBrowser, createContext, loginToShelf, navigateTo } from "../lib/browser.mjs";
import { screenshot, recordClip } from "../lib/capture.mjs";
import { toWebP, toVideoFormats } from "../lib/convert.mjs";
import { upload } from "../lib/upload.mjs";
import { initAnnotations, highlight, callout, caption, chapterCard, clearAll } from "../lib/annotate.mjs";
const BUCKET_PREFIX = "knowledgebase";

/** Scroll to Working hours heading on the bookings settings page */
async function scrollToWorkingHours(page) {
  const wh = page.locator('h3:has-text("Working hours")').first();
  if (await wh.count() > 0) {
    await wh.scrollIntoViewIfNeeded();
    await page.waitForTimeout(300);
    await page.evaluate(() => window.scrollBy(0, -80));
    await page.waitForTimeout(500);
  }
}

async function main() {
  const tmpDir = await mkdtemp(join(tmpdir(), "shelf-working-hours-"));
  console.log(`Working in: ${tmpDir}`);
  const browser = await launchBrowser();
  try {
    const ctx = await createContext(browser);
    const page = await ctx.newPage();
    page.setDefaultTimeout(60000);
    await loginToShelf(page);

    // Shot 1: Bookings settings — Booking time restrictions area
    console.log("📸 Capturing bookings settings overview...");
    await navigateTo(page, "/settings/bookings");
    await initAnnotations(page);
    await caption(page, "Settings → Bookings — configure notification recipients, automation, and booking time restrictions");
    const shot1 = await screenshot(page, join(tmpDir, "working-hours-1.png"));
    await clearAll(page);

    // Shot 2: Scroll to Working hours section
    console.log("📸 Capturing working hours section...");
    await scrollToWorkingHours(page);
    await initAnnotations(page);
    await highlight(page, "text:Enable working hours", { spotlight: true, padding: 8 });
    await callout(page, "text:Enable working hours", "Flip this toggle to ON — then configure start/end times for each day of the week", { label: "Enable", side: "right" });
    await caption(page, "Working hours — enable the toggle, then set your schedule. Bookings outside these hours will be blocked.");
    const shot2 = await screenshot(page, join(tmpDir, "working-hours-2.png"));
    await clearAll(page);
    await ctx.close();

    // Video
    console.log("🎬 Recording...");
    const clipPath = await recordClip(browser, async (cp) => {
      await chapterCard(cp, "Working Hours", "Set Your Workspace Operating Schedule", 3000);
      await navigateTo(cp, "/settings/bookings");
      await initAnnotations(cp);
      await caption(cp, "Go to Settings → Bookings to find the Working hours section");
      await cp.waitForTimeout(2500);
      await clearAll(cp);

      // Scroll to working hours
      await scrollToWorkingHours(cp);
      await initAnnotations(cp);
      await highlight(cp, "text:Enable working hours", { spotlight: true, padding: 8 });
      await callout(cp, "text:Enable working hours", "Flip this toggle ON to activate working hours", { label: "Enable", side: "right" });
      await caption(cp, "Enable working hours → set start/end times per day → bookings outside these hours are blocked");
      await cp.waitForTimeout(4500);
      await clearAll(cp);
    });

    console.log("🔄 Converting...");
    const webp1 = toWebP(shot1); const webp2 = toWebP(shot2);
    const { mp4, webm } = toVideoFormats(clipPath);
    console.log("☁️  Uploading...");
    const urls = {};
    urls.a = await upload(webp1, `${BUCKET_PREFIX}/working-hours-1.webp`);
    urls.b = await upload(webp2, `${BUCKET_PREFIX}/working-hours-2.webp`);
    urls.c = await upload(mp4, `${BUCKET_PREFIX}/working-hours-flow.mp4`);
    urls.d = await upload(webm, `${BUCKET_PREFIX}/working-hours-flow.webm`);
    Object.values(urls).forEach(u => console.log(`  ✅ ${u}`));
  } finally { await browser.close(); await rm(tmpDir, { recursive: true, force: true }).catch(() => {}); }
}
main().catch((err) => { console.error("❌ Failed:", err); process.exit(1); });
