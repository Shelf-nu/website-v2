#!/usr/bin/env node

/**
 * Capture the Quantity Overview card on a quantity-tracked asset's page after
 * shelf.nu#3041 renamed its "Available" row to "Free now".
 *
 * Source of truth:
 * apps/webapp/app/components/assets/quantity-overview-card.tsx
 * packages/labels/index.js (ASSET_QUANTITY_FIGURE_LABELS.FREE_NOW)
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
import { initAnnotations, highlight, clearAll } from "../lib/annotate.mjs";

const BUCKET_PREFIX = "knowledgebase";
// A quantity-tracked pool in the demo workspace with units in custody.
const ASSET_LINK = "Sandbag (Counterweight)";

async function main() {
  const tmpDir = await mkdtemp(join(tmpdir(), "shelf-qty-overview-"));
  console.log(`Working in: ${tmpDir}`);

  const browser = await launchBrowser();
  try {
    const context = await createContext(browser);
    const page = await context.newPage();
    page.setDefaultTimeout(60000);
    await loginToShelf(page);

    await navigateTo(page, "/assets");
    await page.locator(`a:has-text("${ASSET_LINK}")`).first().click();
    await page.waitForURL(/\/assets\/[a-z0-9]+/, { timeout: 30000 });
    await page
      .getByText("Quantity Overview")
      .first()
      .waitFor({ state: "visible", timeout: 30000 });
    await page.waitForTimeout(1500);

    await initAnnotations(page);
    await highlight(page, "text:Free now", { padding: 6 });
    const shot = await screenshot(page, join(tmpDir, "quantity-overview-free-now.png"));
    await clearAll(page);
    await context.close();

    if (process.env.UPLOAD === "0") {
      console.log(`  Kept for review: ${shot}`);
      return;
    }
    const url = await upload(
      toWebP(shot),
      `${BUCKET_PREFIX}/quantity-overview-free-now.webp`
    );
    console.log(`  OK ${url}`);
  } finally {
    await browser.close();
    if (process.env.UPLOAD !== "0") {
      await rm(tmpDir, { recursive: true, force: true }).catch(() => {});
    }
  }
}

main().catch((err) => {
  console.error("Failed:", err);
  process.exit(1);
});
