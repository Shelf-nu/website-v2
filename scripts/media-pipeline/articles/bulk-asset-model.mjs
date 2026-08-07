#!/usr/bin/env node
/** Screenshots for: using-batch-actions-in-shelf.mdx + glossary/asset-models.mdx
 * Shows: the two new Actions-menu items (shelf.nu#2782) and the assign dialog. */
import { mkdtemp, rm } from "node:fs/promises";
import { join } from "node:path";
import { tmpdir } from "node:os";
import { launchBrowser, createContext, loginToShelf, navigateTo } from "../lib/browser.mjs";
import { screenshot } from "../lib/capture.mjs";
import { toWebP } from "../lib/convert.mjs";
import { upload } from "../lib/upload.mjs";
import { initAnnotations, highlight, caption, clearAll } from "../lib/annotate.mjs";
const BUCKET_PREFIX = "knowledgebase";

async function openActionsMenu(page) {
  await navigateTo(page, "/assets");
  const hdr = await page.$("thead th:first-child");
  if (!hdr) throw new Error("Header checkbox not found");
  await hdr.click();
  // Assert the selection actually registered before opening the menu.
  await page.locator('button:has-text("Actions")').first().waitFor({ state: "visible" });
  await page.waitForTimeout(1000);
  const actionsBtn = page.locator('button:has-text("Actions")').first();
  await actionsBtn.click();
  // The new items must be present, or the feature is not deployed yet.
  await page.locator('text="Update asset model"').first().waitFor({ state: "visible" });
  await page.locator('text="Remove from asset model"').first().waitFor({ state: "visible" });
  await page.waitForTimeout(800);
}

async function main() {
  const tmpDir = await mkdtemp(join(tmpdir(), "shelf-bulk-asset-model-"));
  console.log(`Working in: ${tmpDir}`);
  let browser;
  try {
    browser = await launchBrowser();
    const ctx = await createContext(browser);
    const page = await ctx.newPage();
    page.setDefaultTimeout(60000);
    await loginToShelf(page);

    console.log("📸 Actions menu with the asset-model items...");
    await openActionsMenu(page);
    await initAnnotations(page);
    await highlight(page, "text:Update asset model", { padding: 6 });
    await caption(page, "Update asset model and Remove from asset model sit under Update category in the Actions menu");
    const shot1 = await screenshot(page, join(tmpDir, "bulk-asset-model-menu.png"));
    await clearAll(page);

    console.log("📸 Group assets into an asset model dialog...");
    await openActionsMenu(page);
    await page.locator('text="Update asset model"').first().click();
    // Assert the dialog rendered before shooting it.
    await page.locator('text="Select asset model"').first().waitFor({ state: "visible" });
    /**
     * The shot exists to show the quantity-tracked warning, which renders only
     * when the selection actually holds pooled stock. Assert it rather than
     * hope for it: a page-one selection with no QT asset would otherwise
     * publish a screenshot the article's surrounding copy contradicts.
     */
    await page
      .locator("text=/quantity-tracked asset\\(s\\) in your selection will be skipped/")
      .first()
      .waitFor({ state: "visible" });
    await page.waitForTimeout(1200);
    await initAnnotations(page);
    await caption(page, "Pick one model for the whole selection. Category, value and custody are left alone.");
    const shot2 = await screenshot(page, join(tmpDir, "bulk-asset-model-dialog.png"));
    await clearAll(page);
    await ctx.close();

    console.log("🔄 Converting...");
    const webp1 = toWebP(shot1);
    const webp2 = toWebP(shot2);
    console.log("☁️  Uploading...");
    const urls = {};
    urls.menu = await upload(webp1, `${BUCKET_PREFIX}/bulk-asset-model-menu.webp`);
    urls.dialog = await upload(webp2, `${BUCKET_PREFIX}/bulk-asset-model-dialog.webp`);
    Object.values(urls).forEach((u) => console.log(`  ✅ ${u}`));
  } finally {
    if (browser) await browser.close();
    await rm(tmpDir, { recursive: true, force: true }).catch(() => {});
  }
}
main().catch((err) => { console.error("❌ Failed:", err); process.exit(1); });
