#!/usr/bin/env node

/**
 * Capture annotated screenshots and video for:
 * content/knowledge-base/alternative-barcodes.mdx
 *
 * Shows: Asset page with barcodes section, "Add barcode" modal with Code 128,
 * typing a value, the generated barcode on the asset page
 */

import { mkdtemp } from "node:fs/promises";
import { join } from "node:path";
import { tmpdir } from "node:os";
import { launchBrowser, createContext, loginToShelf, navigateTo } from "../lib/browser.mjs";
import { screenshot, recordClip } from "../lib/capture.mjs";
import { toWebP, toVideoFormats } from "../lib/convert.mjs";
import { upload } from "../lib/upload.mjs";
import { initAnnotations, highlight, callout, caption, chapterCard, clearAll } from "../lib/annotate.mjs";

const BUCKET_PREFIX = "knowledgebase";
// Nikon D3200 asset — already has barcodes on the demo account
const ASSET_URL = "/assets/clxegs5z300592gmoqiem28qy";

async function main() {
  const tmpDir = await mkdtemp(join(tmpdir(), "shelf-barcodes-"));
  console.log(`Working in: ${tmpDir}`);

  const browser = await launchBrowser();
  try {

  const context = await createContext(browser);
  const page = await context.newPage();
  page.setDefaultTimeout(60000);
  await loginToShelf(page);

  // ── Screenshot 1: Asset page scrolled to Barcodes section ──────────
  console.log("📸 Capturing asset page with barcodes...");
  await navigateTo(page, ASSET_URL);

  // Scroll to the Barcodes section
  const barcodeHeading = page.locator('text=Barcodes (').first();
  if (await barcodeHeading.count() > 0) {
    await barcodeHeading.scrollIntoViewIfNeeded();
    await page.waitForTimeout(300);
    await page.evaluate(() => window.scrollBy(0, -120));
    await page.waitForTimeout(500);
  }

  await initAnnotations(page);
  await highlight(page, 'textStartsWith:Barcodes (', { padding: 8 });
  await callout(page, 'textStartsWith:Barcodes (', "Each asset can have multiple barcodes — Code 128, Code 39, DataMatrix, or EAN-13", {
    label: "Barcodes",
    side: "right",
  });
  await caption(page, "Open any asset to see and manage its barcodes in the Barcodes section");
  const shot1 = await screenshot(page, join(tmpDir, "barcodes-on-asset.png"));
  await clearAll(page);

  // ── Screenshot 2: The "Add barcode" modal with Code 128 selected ───
  console.log("📸 Capturing Add Barcode modal...");
  // Scroll back up to find the + button
  await page.evaluate(() => window.scrollTo(0, 0));
  await page.waitForTimeout(500);

  const addBtn = page.locator('[aria-label="Add code to asset"]');
  if (await addBtn.count() === 0) throw new Error("Add code button not found");
  await addBtn.scrollIntoViewIfNeeded();
  await page.waitForTimeout(500);
  await addBtn.click();
  await page.waitForTimeout(2000);

  await initAnnotations(page);
  await caption(page, "Select Code 128 as the barcode type, enter your value, and click Add Barcode");
  const shot2 = await screenshot(page, join(tmpDir, "barcodes-add-modal.png"));
  await clearAll(page);

  // Close the modal
  const cancelBtn = page.locator('button:has-text("Cancel")').first();
  if (await cancelBtn.count() > 0) await cancelBtn.click();
  await page.waitForTimeout(1000);

  // ── Screenshot 3: The + button and code type dropdown in sidebar ────
  console.log("📸 Capturing sidebar code selector...");
  await addBtn.scrollIntoViewIfNeeded();
  await page.waitForTimeout(500);
  await initAnnotations(page);
  await highlight(page, '[aria-label="Add code to asset"]', { spotlight: true, padding: 8 });
  await callout(page, '[aria-label="Add code to asset"]', "Click + to add a new barcode to this asset", {
    label: "Add Code",
    side: "left",
  });
  await caption(page, "Use the + button next to the code selector to add barcodes to any asset");
  const shot3 = await screenshot(page, join(tmpDir, "barcodes-add-button.png"));
  await clearAll(page);
  await context.close();

  // ── Video clip: full flow ──────────────────────────────────────────
  console.log("🎬 Recording barcode walkthrough...");
  const clipPath = await recordClip(browser, async (clipPage) => {
    await chapterCard(clipPage, "Alternative Barcodes", "Add Code 128 Barcodes to Your Assets", 3500);

    // Show asset page
    await navigateTo(clipPage, ASSET_URL);
    await initAnnotations(clipPage);
    await caption(clipPage, "Open any asset to see its barcodes");
    await clipPage.waitForTimeout(2500);
    await clearAll(clipPage);

    // Scroll to barcodes section
    const heading = clipPage.locator('text=Barcodes (').first();
    if (await heading.count() > 0) {
      await heading.scrollIntoViewIfNeeded();
      await clipPage.waitForTimeout(300);
      await clipPage.evaluate(() => window.scrollBy(0, -120));
      await clipPage.waitForTimeout(500);
    }

    await initAnnotations(clipPage);
    await highlight(clipPage, 'textStartsWith:Barcodes (', { padding: 8 });
    await callout(clipPage, 'textStartsWith:Barcodes (', "Existing barcodes on this asset — Code 128, DataMatrix, EAN-13", {
      label: "Barcodes",
      side: "right",
    });
    await clipPage.waitForTimeout(3500);
    await clearAll(clipPage);

    // Chapter: Add a new barcode
    await chapterCard(clipPage, "Step by Step", "Generate a Code 128 Barcode", 3000);

    await navigateTo(clipPage, ASSET_URL);
    await clipPage.waitForTimeout(1000);

    // Click the + button
    const add = clipPage.locator('[aria-label="Add code to asset"]');
    if (await add.count() > 0) {
      await add.scrollIntoViewIfNeeded();
      await clipPage.waitForTimeout(500);

      await initAnnotations(clipPage);
      await highlight(clipPage, '[aria-label="Add code to asset"]', { spotlight: true, padding: 8 });
      await callout(clipPage, '[aria-label="Add code to asset"]', "Click the + button to add a new barcode", {
        label: "Add Code",
        side: "left",
      });
      await clipPage.waitForTimeout(2500);
      await clearAll(clipPage);

      await add.click();
      await clipPage.waitForTimeout(2000);

      // Modal is open — Code 128 is default
      await initAnnotations(clipPage);
      await caption(clipPage, "Code 128 is selected by default — enter your barcode value");
      await clipPage.waitForTimeout(2500);
      await clearAll(clipPage);

      // Type a value
      const valueInput = clipPage.locator('input[placeholder="Enter barcode value"]').first();
      if (await valueInput.count() > 0) {
        await valueInput.click();
        await clipPage.waitForTimeout(300);
        const code = "SHELF-2026-DEMO";
        for (const char of code) {
          await clipPage.keyboard.type(char);
          await clipPage.waitForTimeout(50 + Math.random() * 30);
        }
        await clipPage.waitForTimeout(1500);

        await initAnnotations(clipPage);
        await caption(clipPage, "Type your Code 128 value — 4 to 40 characters, letters, numbers, and symbols");
        await clipPage.waitForTimeout(3000);
        await clearAll(clipPage);
      }

      // Don't actually click Add Barcode to avoid creating test data
      // Just show the filled form
      await initAnnotations(clipPage);
      await caption(clipPage, 'Click "Add Barcode" to generate and save — the code appears on the asset immediately');
      await clipPage.waitForTimeout(3500);
      await clearAll(clipPage);
    }
  });

  // ── Convert + Upload ───────────────────────────────────────────────
  console.log("🔄 Converting...");
  const webp1 = toWebP(shot1);
  const webp2 = toWebP(shot2);
  const webp3 = toWebP(shot3);
  const { mp4, webm } = toVideoFormats(clipPath);

  console.log("☁️  Uploading...");
  const urls = {};
  urls.onAsset = await upload(webp1, `${BUCKET_PREFIX}/barcodes-on-asset.webp`);
  urls.addModal = await upload(webp2, `${BUCKET_PREFIX}/barcodes-add-modal.webp`);
  urls.addButton = await upload(webp3, `${BUCKET_PREFIX}/barcodes-add-button.webp`);
  urls.mp4 = await upload(mp4, `${BUCKET_PREFIX}/barcodes-flow.mp4`);
  urls.webm = await upload(webm, `${BUCKET_PREFIX}/barcodes-flow.webm`);

  Object.values(urls).forEach(u => console.log(`  ✅ ${u}`));

  console.log("\n📋 URLs for MDX:");
  console.log(`  ![Barcodes on asset](${urls.onAsset})`);
  console.log(`  ![Add barcode modal](${urls.addModal})`);
  console.log(`  ![Add barcode button](${urls.addButton})`);
  console.log(`  <InlineVideo mp4="${urls.mp4}" webm="${urls.webm}" alt="How to generate Code 128 barcodes in Shelf" />`);

  } finally { await browser.close(); }
}

main().catch((err) => { console.error("❌ Failed:", err); process.exit(1); });
