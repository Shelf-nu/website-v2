#!/usr/bin/env node

/**
 * Capture the new category form with its color swatch and badge preview
 * (shelf.nu #3244, #3241) for:
 * content/knowledge-base/using-categories-to-organize-your-asset-inventory.mdx
 *
 * Types a name and a hex color into /categories/new and shoots the live
 * "Preview" badge. Create is never pressed, so nothing is saved.
 */

import { mkdtemp, rm } from "node:fs/promises";
import { join } from "node:path";
import { tmpdir } from "node:os";
import {
  launchBrowser,
  createContext,
  loginToShelf,
  navigateTo,
} from "../lib/browser.mjs";
import { screenshot } from "../lib/capture.mjs";
import { toWebP } from "../lib/convert.mjs";
import { upload } from "../lib/upload.mjs";
import { initAnnotations, caption, clearAll } from "../lib/annotate.mjs";

const BUCKET_PREFIX = "knowledgebase";

async function main() {
  const tmpDir = await mkdtemp(join(tmpdir(), "shelf-category-color-"));
  const browser = await launchBrowser();
  try {
    const context = await createContext(browser);
    const page = await context.newPage();
    page.setDefaultTimeout(60000);
    await loginToShelf(page);

    await navigateTo(page, "/categories/new");
    await page.locator('text="Preview"').first().waitFor({ state: "visible" });

    await page.getByPlaceholder("Category name").first().fill("AV");
    // The hex field is the named color input; the swatch has no name.
    const hex = page.locator('input[name="color"]').first();
    await hex.fill("#2E7D32");
    await page.keyboard.press("Escape").catch(() => {});
    await page.locator("body").click({ position: { x: 5, y: 5 } }).catch(() => {});
    await page
      .locator("text=/Badges use a light tint of your color/")
      .first()
      .waitFor({ state: "visible" });
    const labels = await page.locator("label").allInnerTexts();
    console.log("labels: " + labels.join(" | "));
    await page.waitForTimeout(600);

    await initAnnotations(page);
    await caption(page, "New category: pick a color from the swatch or type it, and the Preview shows the badge as it will look");
    const shot = await screenshot(page, join(tmpDir, "category-color-picker.png"));
    await clearAll(page);
    await context.close();

    const url = await upload(toWebP(shot), `${BUCKET_PREFIX}/category-color-picker.webp`);
    console.log(`  ✅ ${url}`);
  } finally {
    await browser.close();
    await rm(tmpDir, { recursive: true, force: true }).catch(() => {});
  }
}

main().catch((err) => {
  console.error("❌ Failed:", err);
  process.exit(1);
});
