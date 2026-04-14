#!/usr/bin/env node

/**
 * Capture for: how-to-enable-advanced-index.mdx
 * Shows: Simple mode with the "Advanced" link at bottom-right → Advanced mode
 * showing column configurability and enhanced features.
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
  const tmpDir = await mkdtemp(join(tmpdir(), "shelf-enable-advanced-"));
  console.log(`Working in: ${tmpDir}`);
  const browser = await launchBrowser();
  try {
    const context = await createContext(browser);
    const page = await context.newPage();
    page.setDefaultTimeout(60000);
    await loginToShelf(page);

    // Shot 1: Simple mode — force simple mode via URL, highlight the "Advanced" link
    console.log("📸 Capturing simple mode with Advanced link...");
    await navigateTo(page, "/assets?mode=simple");
    await initAnnotations(page);
    await highlight(page, "text:Advanced", { spotlight: true, padding: 6 });
    await callout(page, "text:Advanced", "Click Advanced to unlock column configuration, shared filters, and availability view", {
      label: "Switch to Advanced",
      side: "top",
    });
    await caption(page, "You are in Simple mode — click Advanced (bottom-right) to enable the full-featured index");
    const shot1 = await screenshot(page, join(tmpDir, "enable-advanced-1.png"));
    await clearAll(page);

    // Shot 2: Advanced mode — show the enhanced toolbar
    console.log("📸 Capturing advanced mode...");
    await clearAll(page);
    await navigateTo(page, "/assets?mode=advanced");
    await page.waitForTimeout(2000);

    await initAnnotations(page);
    await caption(page, "Advanced mode — configure columns, save filters, toggle availability view, and use batch actions");
    const shot2 = await screenshot(page, join(tmpDir, "enable-advanced-2.png"));
    await clearAll(page);
    await context.close();

    // Video
    console.log("🎬 Recording enable-advanced walkthrough...");
    const clipPath = await recordClip(browser, async (clipPage) => {
      await chapterCard(clipPage, "Simple Mode", "Your Default Asset Index", 2500);
      await navigateTo(clipPage, "/assets?mode=simple");
      await initAnnotations(clipPage);
      await highlight(clipPage, "text:Advanced", { spotlight: true, padding: 6 });
      await callout(clipPage, "text:Advanced", "Click here to switch to Advanced", { label: "Advanced", side: "top" });
      await caption(clipPage, "Simple mode shows the basics — click Advanced at the bottom-right for the full experience");
      await clipPage.waitForTimeout(3500);
      await clearAll(clipPage);

      await chapterCard(clipPage, "Advanced Mode", "Full Column Control + Filters + Views", 2500);
      // Navigate to advanced via URL
      await navigateTo(clipPage, "/assets?mode=advanced");
      await clipPage.waitForTimeout(2000);
      await initAnnotations(clipPage);
      await caption(clipPage, "Advanced mode — configure which columns show, save shared filters, toggle between list and calendar");
      await clipPage.waitForTimeout(4000);
      await clearAll(clipPage);
    });

    console.log("🔄 Converting...");
    const webp1 = toWebP(shot1);
    const webp2 = toWebP(shot2);
    const { mp4, webm } = toVideoFormats(clipPath);

    console.log("☁️  Uploading...");
    const urls = {};
    urls.simple = await upload(webp1, `${BUCKET_PREFIX}/enable-advanced-1.webp`);
    urls.advanced = await upload(webp2, `${BUCKET_PREFIX}/enable-advanced-2.webp`);
    urls.mp4 = await upload(mp4, `${BUCKET_PREFIX}/enable-advanced-flow.mp4`);
    urls.webm = await upload(webm, `${BUCKET_PREFIX}/enable-advanced-flow.webm`);
    Object.values(urls).forEach(u => console.log(`  ✅ ${u}`));
  } finally {
    await browser.close();
    await rm(tmpDir, { recursive: true, force: true }).catch(() => {});
  }
}

main().catch((err) => { console.error("❌ Failed:", err); process.exit(1); });
