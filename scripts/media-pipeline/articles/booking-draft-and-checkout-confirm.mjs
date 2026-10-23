#!/usr/bin/env node

/**
 * Captures for shelf.nu #3239 (a new booking is a draft) and #3238 (every
 * quick check-out asks first):
 * content/knowledge-base/how-to-create-a-booking.mdx
 * content/knowledge-base/introduction-to-bookings.mdx
 * content/knowledge-base/progressive-checkout-of-bookings.mdx
 *
 * 1. /bookings/new: the "This creates a draft" hint above the buttons.
 * 2. A Reserved booking whose start has arrived: header Check out opens the
 *    "Check out booking" dialog. The script presses Cancel, so nothing is
 *    checked out. Bookings whose dialog is the early warning are skipped (and
 *    cancelled too). If no booking qualifies, shot 2 is skipped, not faked.
 *
 * Nothing is created or submitted.
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
import { initAnnotations, highlight, caption, clearAll } from "../lib/annotate.mjs";

const BUCKET_PREFIX = "knowledgebase";

async function main() {
  const tmpDir = await mkdtemp(join(tmpdir(), "shelf-booking-draft-"));
  const browser = await launchBrowser();
  const urls = {};
  try {
    const context = await createContext(browser);
    const page = await context.newPage();
    page.setDefaultTimeout(60000);
    await loginToShelf(page);

    // Shot 1: the new booking form says it makes a draft.
    await navigateTo(page, "/bookings/new");
    const hint = page.locator("#new-booking-draft-hint").first();
    await hint.waitFor({ state: "visible" });
    console.log("hint: " + (await hint.innerText()));
    console.log(
      "buttons: " +
        (await page.locator("button[name=intent]").allInnerTexts()).join(" | ")
    );
    await hint.evaluate((el) => el.scrollIntoView({ block: "center" }));
    await page.waitForTimeout(600);
    await initAnnotations(page);
    await highlight(page, "#new-booking-draft-hint", { padding: 8 });
    await caption(page, "New booking: every button below creates a draft, which holds nothing until you reserve it");
    const shot1 = await screenshot(page, join(tmpDir, "booking-new-draft-hint.png"));
    await clearAll(page);
    urls.hint = await upload(toWebP(shot1), `${BUCKET_PREFIX}/booking-new-draft-hint.webp`);

    // Shot 2: probe Reserved bookings for a plain (not early) check-out.
    await navigateTo(page, "/bookings?status=RESERVED");
    await page.waitForTimeout(2500);
    const hrefs = await page.evaluate(() =>
      Array.from(document.querySelectorAll('a[href^="/bookings/"]'))
        .map((a) => a.getAttribute("href"))
        .filter((h) => /^\/bookings\/[a-z0-9]+(\/overview)?$/i.test(h))
    );
    const unique = [...new Set(hrefs)].slice(0, 15);
    console.log(`Reserved bookings to probe: ${unique.length}`);
    let captured = false;
    for (const href of unique) {
      await navigateTo(page, href);
      await page.waitForTimeout(1500);
      const trigger = page.getByRole("button", { name: /^Check out$/ }).first();
      if (!(await trigger.isVisible().catch(() => false))) continue;
      await trigger.click();
      await page.waitForTimeout(800);
      // A menu may open first; its "Check out" row opens the dialog.
      const menuItem = page.getByRole("menuitem", { name: /^Check out$/ }).first();
      if (await menuItem.isVisible().catch(() => false)) {
        await menuItem.click();
        await page.waitForTimeout(800);
      }
      const dialog = page.getByRole("dialog").first();
      if (!(await dialog.isVisible().catch(() => false))) continue;
      const text = await dialog.innerText();
      const cancel = dialog.getByRole("button", { name: "Cancel" }).first();
      if (!/Check out booking/.test(text)) {
        console.log(`${href}: not the plain dialog (${text.split("\n")[0]}), cancelling`);
        await cancel.click();
        continue;
      }
      console.log(`${href}: dialog text:\n${text}`);
      await initAnnotations(page);
      await caption(page, "Check out now asks first: Cancel leaves the booking Reserved");
      const shot2 = await screenshot(page, join(tmpDir, "booking-checkout-confirm.png"));
      await clearAll(page);
      await cancel.click();
      await page.waitForTimeout(800);
      urls.checkout = await upload(toWebP(shot2), `${BUCKET_PREFIX}/booking-checkout-confirm.webp`);
      captured = true;
      break;
    }
    if (!captured) console.log("No Reserved booking with a plain check-out: shot 2 skipped");
    await context.close();
    Object.entries(urls).forEach(([k, u]) => console.log(`  ✅ ${k}: ${u}`));
  } finally {
    await browser.close();
    await rm(tmpDir, { recursive: true, force: true }).catch(() => {});
  }
}

main().catch((err) => {
  console.error("❌ Failed:", err);
  process.exit(1);
});
