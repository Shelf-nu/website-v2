#!/usr/bin/env node

/**
 * Capture the Reserve/Book eligibility rules shipped in shelf.nu#2859.
 *
 * Source of truth:
 * packages/labels/index.js (BOOKING_RESERVE_BLOCKED_LABELS)
 * apps/webapp/app/components/booking/forms/edit-booking-form.tsx (tooltip)
 *
 * Read-only: uses existing demo drafts, one empty and one holding an asset
 * marked unavailable. Nothing is created, submitted, or deleted.
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

const EMPTY_DRAFT = "cmo33nbpk06cqndi04cxxyve8"; // "DEMO", 0 assets
const UNAVAILABLE_DRAFT = "cmkqzkcha0064ndinag0i5zb5"; // "Winter Event (Copy)", includes unavailable assets

async function shoot(page, id, expectText, captionText, file, tmpDir) {
  await navigateTo(page, `/bookings/${id}/overview`);
  await page.waitForTimeout(2500);

  // Hover the Reserve button so its blocked-reason tooltip renders.
  //
  // Two things this had to learn the hard way: the tooltip does NOT carry
  // role="tooltip" (it lives in Radix's [data-radix-popper-content-wrapper]),
  // and a single `hover({force:true})` does not reliably open it. Walking the
  // pointer to the button in steps produces the mousemove sequence Radix waits
  // for.
  const book = page
    .locator('button:has-text("Reserve"), button:has-text("Request reservation")')
    .first();
  await book.waitFor({ state: "visible", timeout: 30000 });

  const readTooltip = () =>
    page.evaluate(() =>
      Array.from(
        document.querySelectorAll("[data-radix-popper-content-wrapper]")
      )
        .map((e) => (e.innerText || "").trim())
        .filter(Boolean)
        .join(" | ")
    );

  let tipText = "";
  for (let attempt = 0; attempt < 4 && !tipText.includes(expectText); attempt++) {
    await page.mouse.move(10, 10);
    await page.waitForTimeout(300);
    const box = await book.boundingBox();
    if (!box) throw new Error("Reserve button has no bounding box");
    const cx = box.x + box.width / 2;
    const cy = box.y + box.height / 2;
    for (const [x, y] of [
      [cx - 200, cy + 120],
      [cx - 100, cy + 60],
      [cx - 30, cy + 10],
      [cx, cy],
    ]) {
      await page.mouse.move(x, y, { steps: 8 });
      await page.waitForTimeout(250);
    }
    await page.waitForTimeout(1500);
    tipText = await readTooltip();
  }

  // Hard assertion: the tooltip copy must actually be on screen, otherwise the
  // caption would describe something the image does not show.
  if (!tipText.includes(expectText)) {
    throw new Error(
      `Tooltip did not show ${JSON.stringify(expectText)} - got: ${
        tipText || "(no tooltip)"
      }`
    );
  }

  await initAnnotations(page);
  await caption(page, captionText);
  const shot = await screenshot(page, join(tmpDir, file));
  await clearAll(page);
  return shot;
}

async function main() {
  const tmpDir = await mkdtemp(join(tmpdir(), "shelf-reserveblocked-"));
  console.log(`Working in: ${tmpDir}`);
  const browser = await launchBrowser();
  const urls = {};
  try {
    const context = await createContext(browser);
    const page = await context.newPage();
    page.setDefaultTimeout(60000);
    await loginToShelf(page);

    const a = await shoot(
      page,
      EMPTY_DRAFT,
      "Add assets or reserve at least one model",
      "Reserve stays greyed out while a draft booking holds nothing at all",
      "booking-reserve-blocked-empty.png",
      tmpDir
    );
    urls.empty = await upload(
      toWebP(a),
      `${BUCKET_PREFIX}/booking-reserve-blocked-empty.webp`
    );

    const b = await shoot(
      page,
      UNAVAILABLE_DRAFT,
      "marked as unavailable",
      "The same button names the other reason: something on the booking is marked unavailable",
      "booking-reserve-blocked-unavailable.png",
      tmpDir
    );
    urls.unavailable = await upload(
      toWebP(b),
      `${BUCKET_PREFIX}/booking-reserve-blocked-unavailable.webp`
    );

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
