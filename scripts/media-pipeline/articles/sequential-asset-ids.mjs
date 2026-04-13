#!/usr/bin/env node

/**
 * Capture annotated screenshots and video for:
 * content/knowledge-base/sequential-asset-ids.mdx
 *
 * Sequential asset IDs (SAM-XXXX) in the index and settings configuration
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
  const tmpDir = await mkdtemp(join(tmpdir(), "shelf-sequential-ids-"));
  console.log(`Working in: ${tmpDir}`);

  const browser = await launchBrowser();
  try {

  const context = await createContext(browser);
  const page = await context.newPage();
  page.setDefaultTimeout(60000);
  await loginToShelf(page);

  // ── Screenshot 1: Assets index showing SAM-XXXX IDs ─────────────────
  console.log("📸 Capturing asset IDs in index...");
  await navigateTo(page, "/assets");
  await initAnnotations(page);
  await highlight(page, "textStartsWith:SAM-", { padding: 4 });
  await caption(page, "Each asset gets a sequential ID like SAM-0001 — visible in the index for quick reference");
  const shot1 = await screenshot(page, join(tmpDir, "sequential-ids-1.png"));
  await clearAll(page);

  // ── Screenshot 2: Settings → Asset ID configuration ─────────────────
  console.log("📸 Capturing ID settings...");
  await navigateTo(page, "/settings/general");
  await page.evaluate(() => {
    const headings = document.querySelectorAll("h2, h3, h4, label");
    for (const h of headings) {
      if (h.textContent?.toLowerCase().includes("asset id") || h.textContent?.toLowerCase().includes("sequential")) {
        h.scrollIntoView({ behavior: "instant", block: "start" });
        break;
      }
    }
  });
  await page.waitForTimeout(300);
  await initAnnotations(page);
  await caption(page, "Configure your asset ID prefix and format in Settings → General");
  const shot2 = await screenshot(page, join(tmpDir, "sequential-ids-2.png"));
  await clearAll(page);
  await context.close();

  // ── Video clip: sequential IDs walkthrough ──────────────────────────
  console.log("🎬 Recording sequential IDs walkthrough...");
  const clipPath = await recordClip(browser, async (clipPage) => {
    await chapterCard(clipPage, "Sequential IDs", "Unique Identifiers for Every Asset", 3000);

    await navigateTo(clipPage, "/assets");
    await initAnnotations(clipPage);
    await highlight(clipPage, "textStartsWith:SAM-", { padding: 4 });
    await caption(clipPage, "Assets display their sequential IDs in the index — easy to reference and search");
    await clipPage.waitForTimeout(3000);
    await clearAll(clipPage);

    await chapterCard(clipPage, "Configuration", "Customize Your ID Format", 2500);
    await navigateTo(clipPage, "/settings/general");
    await initAnnotations(clipPage);
    await caption(clipPage, "Go to Settings → General to change the prefix, separator, or starting number");
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
  urls.shot1 = await upload(webp1, `${BUCKET_PREFIX}/sequential-ids-1.webp`);
  urls.shot2 = await upload(webp2, `${BUCKET_PREFIX}/sequential-ids-2.webp`);
  urls.mp4 = await upload(mp4, `${BUCKET_PREFIX}/sequential-ids-flow.mp4`);
  urls.webm = await upload(webm, `${BUCKET_PREFIX}/sequential-ids-flow.webm`);
  Object.values(urls).forEach(u => console.log(`  ✅ ${u}`));

  } finally {
    await browser.close();
    await rm(tmpDir, { recursive: true, force: true }).catch(() => {});
  }
}

main().catch((err) => { console.error("❌ Failed:", err); process.exit(1); });
