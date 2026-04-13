#!/usr/bin/env node

/**
 * Capture annotated screenshots and video for:
 * content/knowledge-base/availability-view.mdx
 *
 * Calendar-based availability view for assets
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

  const browser = await launchBrowser();
  try {

  const context = await createContext(browser);
  const page = await context.newPage();
  page.setDefaultTimeout(60000);
  await loginToShelf(page);

  // ── Screenshot 1: Assets index with calendar icon highlighted ───────
  console.log("📸 Capturing calendar toggle...");
  await navigateTo(page, "/assets");
  await initAnnotations(page);
  await highlight(page, "[title*='calendar'], [aria-label*='calendar'], [data-test*='calendar']", { padding: 6 });
  await callout(page, "[title*='calendar'], [aria-label*='calendar'], [data-test*='calendar']", "Click the calendar icon to switch to availability view", {
    label: "Toggle View",
    side: "left",
  });
  await caption(page, "Find the calendar icon in the assets toolbar to toggle the availability view");
  const shot1 = await screenshot(page, join(tmpDir, "availability-view-1.png"));
  await clearAll(page);

  // ── Screenshot 2: Availability view with booking blocks ─────────────
  console.log("📸 Capturing availability view...");
  await navigateTo(page, "/assets");
  // Click the calendar toggle to switch views
  const calendarBtn = await page.locator("[title*='calendar'], [aria-label*='calendar'], [data-test*='calendar']").count();
  if (calendarBtn > 0) {
    await page.locator("[title*='calendar'], [aria-label*='calendar'], [data-test*='calendar']").first().click();
    await page.waitForTimeout(1000);
  }
  await initAnnotations(page);
  await caption(page, "The availability view shows booking blocks across a timeline — see at a glance what is free");
  const shot2 = await screenshot(page, join(tmpDir, "availability-view-2.png"));
  await clearAll(page);
  await context.close();

  // ── Video clip: availability view walkthrough ───────────────────────
  console.log("🎬 Recording availability view walkthrough...");
  const clipPath = await recordClip(browser, async (clipPage) => {
    await chapterCard(clipPage, "Availability View", "See What Is Free at a Glance", 3000);

    await navigateTo(clipPage, "/assets");
    await initAnnotations(clipPage);
    await highlight(clipPage, "[title*='calendar'], [aria-label*='calendar'], [data-test*='calendar']", { padding: 6 });
    await caption(clipPage, "Start on the assets page and find the calendar toggle");
    await clipPage.waitForTimeout(3000);
    await clearAll(clipPage);

    await chapterCard(clipPage, "Timeline", "Booking Blocks on a Calendar", 2500);
    await navigateTo(clipPage, "/assets");
    await initAnnotations(clipPage);
    await caption(clipPage, "The availability view shows a timeline of bookings for each asset");
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
  urls.shot1 = await upload(webp1, `${BUCKET_PREFIX}/availability-view-1.webp`);
  urls.shot2 = await upload(webp2, `${BUCKET_PREFIX}/availability-view-2.webp`);
  urls.mp4 = await upload(mp4, `${BUCKET_PREFIX}/availability-view-flow.mp4`);
  urls.webm = await upload(webm, `${BUCKET_PREFIX}/availability-view-flow.webm`);
  Object.values(urls).forEach(u => console.log(`  ✅ ${u}`));

  } finally {
    await browser.close();
    await rm(tmpDir, { recursive: true, force: true }).catch(() => {});
  }
}

main().catch((err) => { console.error("❌ Failed:", err); process.exit(1); });
