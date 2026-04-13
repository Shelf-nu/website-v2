#!/usr/bin/env node

/**
 * Capture annotated screenshots and video for:
 * content/knowledge-base/asset-reminders.mdx
 *
 * Reminders index and asset detail reminder widget
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
  const tmpDir = await mkdtemp(join(tmpdir(), "shelf-reminders-"));
  console.log(`Working in: ${tmpDir}`);

  const browser = await launchBrowser();
  try {

  const context = await createContext(browser);
  const page = await context.newPage();
  page.setDefaultTimeout(60000);
  await loginToShelf(page);

  // ── Screenshot 1: Reminders index page ──────────────────────────────
  console.log("📸 Capturing reminders index...");
  await navigateTo(page, "/reminders");
  await initAnnotations(page);
  await caption(page, "The reminders page shows all scheduled reminders across your workspace");
  const shot1 = await screenshot(page, join(tmpDir, "reminders-1.png"));
  await clearAll(page);

  // ── Screenshot 2: Asset detail with reminders widget ────────────────
  console.log("📸 Capturing asset reminder widget...");
  await navigateTo(page, "/assets");
  const firstAssetHref = await page.evaluate(() => {
    const link = document.querySelector('table a[href^="/assets/"], a[href^="/assets/"]');
    return link ? link.getAttribute("href") : null;
  });
  if (!firstAssetHref) throw new Error("No assets found in workspace");
  await navigateTo(page, firstAssetHref);
  await page.evaluate(() => {
    const headings = document.querySelectorAll("h2, h3, h4, span");
    for (const h of headings) {
      if (h.textContent?.toLowerCase().includes("reminder")) {
        h.scrollIntoView({ behavior: "instant", block: "start" });
        break;
      }
    }
  });
  await page.waitForTimeout(300);
  await initAnnotations(page);
  await highlight(page, "textStartsWith:Reminder", { padding: 8 });
  await caption(page, "Each asset has a reminders widget in the sidebar — set maintenance, review, or return dates");
  const shot2 = await screenshot(page, join(tmpDir, "reminders-2.png"));
  await clearAll(page);
  await context.close();

  // ── Video clip: reminders walkthrough ───────────────────────────────
  console.log("🎬 Recording reminders walkthrough...");
  const clipPath = await recordClip(browser, async (clipPage) => {
    await chapterCard(clipPage, "Reminders", "Never Miss a Maintenance Date", 3000);

    await navigateTo(clipPage, "/reminders");
    await initAnnotations(clipPage);
    await caption(clipPage, "Your reminders dashboard — all upcoming reminders in one place");
    await clipPage.waitForTimeout(3000);
    await clearAll(clipPage);

    await chapterCard(clipPage, "Per-Asset", "Reminders on the Asset Detail Page", 2500);
    // Look up first asset dynamically
    await navigateTo(clipPage, "/assets");
    const clipAssetHref = await clipPage.evaluate(() => {
      const link = document.querySelector('table a[href^="/assets/"], a[href^="/assets/"]');
      return link ? link.getAttribute("href") : null;
    });
    if (clipAssetHref) {
      await navigateTo(clipPage, clipAssetHref);
    }
    await initAnnotations(clipPage);
    await caption(clipPage, "Each asset has a reminders section — set dates for maintenance, inspections, or returns");
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
  urls.shot1 = await upload(webp1, `${BUCKET_PREFIX}/reminders-1.webp`);
  urls.shot2 = await upload(webp2, `${BUCKET_PREFIX}/reminders-2.webp`);
  urls.mp4 = await upload(mp4, `${BUCKET_PREFIX}/reminders-flow.mp4`);
  urls.webm = await upload(webm, `${BUCKET_PREFIX}/reminders-flow.webm`);
  Object.values(urls).forEach(u => console.log(`  ✅ ${u}`));

  } finally {
    await browser.close();
    await rm(tmpDir, { recursive: true, force: true }).catch(() => {});
  }
}

main().catch((err) => { console.error("❌ Failed:", err); process.exit(1); });
