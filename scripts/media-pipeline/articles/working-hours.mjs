#!/usr/bin/env node

/**
 * Capture annotated screenshots and video for:
 * content/knowledge-base/working-hours.mdx
 *
 * Working hours configuration in booking settings
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
  const tmpDir = await mkdtemp(join(tmpdir(), "shelf-working-hours-"));
  console.log(`Working in: ${tmpDir}`);

  const browser = await launchBrowser();
  try {

  const context = await createContext(browser);
  const page = await context.newPage();
  page.setDefaultTimeout(60000);
  await loginToShelf(page);

  // ── Screenshot 1: Bookings settings page ────────────────────────────
  console.log("📸 Capturing bookings settings...");
  await navigateTo(page, "/settings/bookings");
  await initAnnotations(page);
  await caption(page, "Navigate to Settings → Bookings to configure working hours for your workspace");
  const shot1 = await screenshot(page, join(tmpDir, "working-hours-1.png"));
  await clearAll(page);

  // ── Screenshot 2: Working hours schedule section ────────────────────
  console.log("📸 Capturing working hours schedule...");
  await navigateTo(page, "/settings/bookings");
  await page.evaluate(() => {
    const el = document.querySelector('[id*="working"]') || document.querySelector('h3, h4');
    if (el) el.scrollIntoView({ behavior: "instant", block: "start" });
  });
  await page.waitForTimeout(300);
  await initAnnotations(page);
  await highlight(page, "textStartsWith:Working", { padding: 8 });
  await caption(page, "Set your working hours per day — bookings outside these hours will be blocked");
  const shot2 = await screenshot(page, join(tmpDir, "working-hours-2.png"));
  await clearAll(page);
  await context.close();

  // ── Video clip: working hours walkthrough ───────────────────────────
  console.log("🎬 Recording working hours walkthrough...");
  const clipPath = await recordClip(browser, async (clipPage) => {
    await chapterCard(clipPage, "Working Hours", "Control When Assets Can Be Booked", 3000);

    await navigateTo(clipPage, "/settings/bookings");
    await initAnnotations(clipPage);
    await caption(clipPage, "Go to Settings → Bookings to find the working hours section");
    await clipPage.waitForTimeout(3000);
    await clearAll(clipPage);

    await chapterCard(clipPage, "Schedule", "Configure Your Weekly Hours", 2500);
    await navigateTo(clipPage, "/settings/bookings");
    await clipPage.evaluate(() => {
      const el = document.querySelector('[id*="working"]') || document.querySelector('h3, h4');
      if (el) el.scrollIntoView({ behavior: "instant", block: "start" });
    });
    await clipPage.waitForTimeout(300);
    await initAnnotations(clipPage);
    await caption(clipPage, "Toggle days on or off and set start/end times for each day");
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
  urls.shot1 = await upload(webp1, `${BUCKET_PREFIX}/working-hours-1.webp`);
  urls.shot2 = await upload(webp2, `${BUCKET_PREFIX}/working-hours-2.webp`);
  urls.mp4 = await upload(mp4, `${BUCKET_PREFIX}/working-hours-flow.mp4`);
  urls.webm = await upload(webm, `${BUCKET_PREFIX}/working-hours-flow.webm`);
  Object.values(urls).forEach(u => console.log(`  ✅ ${u}`));

  } finally {
    await browser.close();
    await rm(tmpDir, { recursive: true, force: true }).catch(() => {});
  }
}

main().catch((err) => { console.error("❌ Failed:", err); process.exit(1); });
