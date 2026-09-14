#!/usr/bin/env node

/**
 * Capture the booking check-in receipt shipped in shelf.nu#3013.
 *
 * Source of truth:
 * apps/webapp/app/components/booking/booking-checkin-receipt-pdf.tsx
 * apps/webapp/app/modules/booking/checkin-receipt.ts (stamp wording)
 *
 * Read-only: opens the Actions menu of one pinned, synthetic demo booking and
 * the receipt preview dialog (a GET). Nothing is created, submitted, printed,
 * or deleted. The shots are uploaded to a public bucket, so the script refuses
 * to run against anything but the known demo fixture: the workspace name, the
 * booking name and the custodian's email are asserted before any capture.
 *
 * Set KEEP_DIR=<dir> to keep the PNGs for inspection, and NO_UPLOAD=1 to skip
 * the upload.
 */

import { mkdtemp, rm, copyFile } from "node:fs/promises";
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
import {
  initAnnotations,
  caption,
  highlight,
  clearAll,
} from "../lib/annotate.mjs";

const BUCKET_PREFIX = "knowledgebase";
const STAMPS = [
  "All items returned",
  "All items accounted for",
  "Partial return",
  "Nothing returned",
  "Nothing was checked out",
];

// Synthetic demo fixture. Everything on it is sample data.
const DEMO_WORKSPACE = "ACME, Inc.";
const DEMO_BOOKING_ID = "cmc1t61p60045ogi9tlnovdv1";
const DEMO_BOOKING_NAME = "Corporate Event";
const DEMO_CUSTODIAN_EMAIL = "john@shelf.nu";

async function openActions(page) {
  const trigger = page.getByRole("button", { name: /^Actions$/ }).first();
  await trigger.waitFor({ state: "visible", timeout: 30000 });
  await trigger.click();
  const entry = page
    .locator('button[name="generate checkin receipt"]:visible')
    .first();
  await entry.waitFor({ state: "visible", timeout: 15000 });
  return entry;
}

async function main() {
  const tmpDir = await mkdtemp(join(tmpdir(), "shelf-checkinreceipt-"));
  let browser;
  const urls = {};
  try {
    browser = await launchBrowser();
    const context = await createContext(browser);
    const page = await context.newPage();
    page.setDefaultTimeout(60000);
    await loginToShelf(page);

    await navigateTo(page, `/bookings/${DEMO_BOOKING_ID}/overview`);
    await page.waitForTimeout(2000);
    const bodyText = await page.evaluate(() => document.body.innerText);
    for (const expected of [DEMO_WORKSPACE, DEMO_BOOKING_NAME]) {
      if (!bodyText.includes(expected)) {
        throw new Error(
          `Not the demo fixture: page lacks ${JSON.stringify(expected)}`
        );
      }
    }
    const entryCheck = await openActions(page);
    if (!(await entryCheck.isEnabled())) {
      throw new Error("Receipt entry is disabled on the demo fixture");
    }
    const chosen = DEMO_BOOKING_ID;

    // Shot 1: the menu entry beside the checklist PDF.
    const entry = page
      .locator('button[name="generate checkin receipt"]:visible')
      .first();
    const menuText = await page.evaluate(() =>
      Array.from(document.querySelectorAll('[role="menu"]'))
        .map((m) => m.innerText)
        .join(" | ")
    );
    if (!menuText.includes("Generate check-in receipt")) {
      throw new Error(`Menu lacks the entry: ${menuText}`);
    }
    // The menu fades in; shooting mid-animation shows the page through it.
    await page.waitForTimeout(1500);
    await initAnnotations(page);
    await highlight(page, 'button[name="generate checkin receipt"]', {
      padding: 6,
    });
    await caption(
      page,
      "Generate check-in receipt sits in the booking's Actions menu, right under Generate overview PDF"
    );
    const menuShot = await screenshot(
      page,
      join(tmpDir, "booking-checkin-receipt-menu.png")
    );
    await clearAll(page);

    // Shot 2: the receipt preview.
    await entry.click();
    const stamp = page
      .locator("span")
      .filter({ hasText: new RegExp(STAMPS.join("|")) })
      .first();
    await stamp.waitFor({ state: "visible", timeout: 45000 });
    await page.getByText(/^Check-in receipt for /).first().waitFor();
    await page.getByRole("button", { name: "Download PDF" }).waitFor();
    const stampText = await stamp.innerText();
    console.log(`  stamp: ${stampText}`);
    const sheetText = await page.locator(".pdf-wrapper").first().innerText();
    if (
      !sheetText.includes(DEMO_WORKSPACE) ||
      !sheetText.includes(DEMO_CUSTODIAN_EMAIL)
    ) {
      throw new Error("Receipt does not show the demo fixture's workspace and custodian");
    }
    const sheet = page.locator(".pdf-wrapper").first();
    await sheet.scrollIntoViewIfNeeded();
    await page.waitForTimeout(1500);
    const previewShot = await screenshot(
      page,
      join(tmpDir, "booking-checkin-receipt-preview.png")
    );
    await page.keyboard.press("Escape");

    if (process.env.KEEP_DIR) {
      for (const f of [menuShot, previewShot]) {
        await copyFile(f, join(process.env.KEEP_DIR, f.split("/").pop()));
      }
    }

    if (!process.env.NO_UPLOAD) {
      urls.menu = await upload(
        toWebP(menuShot),
        `${BUCKET_PREFIX}/booking-checkin-receipt-menu.webp`
      );
      urls.preview = await upload(
        toWebP(previewShot),
        `${BUCKET_PREFIX}/booking-checkin-receipt-preview.webp`
      );
    }
    console.log(`  booking used: ${chosen}`);
    await context.close();
    Object.values(urls).forEach((u) => console.log(`  ✅ ${u}`));
  } finally {
    if (browser) await browser.close();
    await rm(tmpDir, { recursive: true, force: true }).catch(() => {});
  }
}

main().catch((err) => {
  console.error("❌ Failed:", err);
  process.exit(1);
});
