#!/usr/bin/env node

/**
 * Capture the report filter bar added in shelf.nu#3043 on Asset Distribution:
 * Category, Location, Asset model and Custom field dropdowns, and the new
 * By Asset Model breakdown.
 *
 * Source of truth:
 * apps/webapp/app/components/reports/report-filter-bar.tsx
 * apps/webapp/app/modules/reports/registry.ts
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

const BUCKET_PREFIX = "features";

async function main() {
  const tmpDir = await mkdtemp(join(tmpdir(), "shelf-report-filter-bar-"));
  console.log(`Working in: ${tmpDir}`);

  const browser = await launchBrowser();
  try {
    const context = await createContext(browser);
    const page = await context.newPage();
    page.setDefaultTimeout(60000);
    await loginToShelf(page);

    await navigateTo(page, "/reports/distribution");
    await page
      .getByText("By Asset Model")
      .first()
      .waitFor({ state: "visible", timeout: 30000 });
    await page
      .getByText("Filter by")
      .first()
      .waitFor({ state: "visible", timeout: 30000 });
    await page.waitForTimeout(2500);

    await initAnnotations(page);
    await highlight(page, "text:Filter by", { padding: 6 });
    const shot = await screenshot(page, join(tmpDir, "reports-filter-bar.png"));
    await clearAll(page);
    await context.close();

    if (process.env.UPLOAD === "0") {
      console.log(`  Kept for review: ${shot}`);
      return;
    }
    const url = await upload(
      toWebP(shot),
      `${BUCKET_PREFIX}/reports-filter-bar.webp`
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
