#!/usr/bin/env node

/**
 * Capture annotated screenshots and video for:
 * content/knowledge-base/using-categories.mdx
 *
 * Categories index and creation flow
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
  const tmpDir = await mkdtemp(join(tmpdir(), "shelf-categories-"));
  console.log(`Working in: ${tmpDir}`);

  const browser = await launchBrowser();
  try {

  const context = await createContext(browser);
  const page = await context.newPage();
  page.setDefaultTimeout(60000);
  await loginToShelf(page);

  // ── Screenshot 1: Categories index ──────────────────────────────────
  console.log("📸 Capturing categories index...");
  await navigateTo(page, "/categories");
  await initAnnotations(page);
  await caption(page, "The categories page lists all your asset categories with color coding and asset counts");
  const shot1 = await screenshot(page, join(tmpDir, "categories-1.png"));
  await clearAll(page);

  // ── Screenshot 2: New category button highlighted ───────────────────
  console.log("📸 Capturing new category action...");
  await navigateTo(page, "/categories");
  await initAnnotations(page);
  await highlight(page, "textStartsWith:New category", { padding: 8 });
  await callout(page, "textStartsWith:New category", "Create a new category to organize assets by type, department, or purpose", {
    label: "Create",
    side: "bottom",
  });
  await caption(page, "Click New category to create a category — give it a name, color, and optional description");
  const shot2 = await screenshot(page, join(tmpDir, "categories-2.png"));
  await clearAll(page);
  await context.close();

  // ── Video clip: categories walkthrough ──────────────────────────────
  console.log("🎬 Recording categories walkthrough...");
  const clipPath = await recordClip(browser, async (clipPage) => {
    await chapterCard(clipPage, "Categories", "Organize Assets by Type", 3000);

    await navigateTo(clipPage, "/categories");
    await initAnnotations(clipPage);
    await caption(clipPage, "Your categories page — each category groups related assets together");
    await clipPage.waitForTimeout(3000);
    await clearAll(clipPage);

    await chapterCard(clipPage, "Create", "Add a New Category", 2500);
    await navigateTo(clipPage, "/categories");
    await initAnnotations(clipPage);
    await highlight(clipPage, "textStartsWith:New category", { padding: 8 });
    await caption(clipPage, "Click New category to add a category with a name, color, and description");
    await clipPage.waitForTimeout(3000);
    await clearAll(clipPage);
  });

  // ── Convert + Upload ───────────────────────────────────────────────
  console.log("🔄 Converting...");
  const webp1 = toWebP(shot1);
  const webp2 = toWebP(shot2);
  const { mp4, webm } = toVideoFormats(clipPath);

  console.log("☁️  Uploading...");
  const urls = {};
  urls.shot1 = await upload(webp1, `${BUCKET_PREFIX}/categories-1.webp`);
  urls.shot2 = await upload(webp2, `${BUCKET_PREFIX}/categories-2.webp`);
  urls.mp4 = await upload(mp4, `${BUCKET_PREFIX}/categories-flow.mp4`);
  urls.webm = await upload(webm, `${BUCKET_PREFIX}/categories-flow.webm`);
  Object.values(urls).forEach(u => console.log(`  ✅ ${u}`));

  } finally {
    await browser.close();
    await rm(tmpDir, { recursive: true, force: true }).catch(() => {});
  }
}

main().catch((err) => { console.error("❌ Failed:", err); process.exit(1); });
