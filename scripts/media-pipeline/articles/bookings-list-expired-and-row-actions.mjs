#!/usr/bin/env node

/**
 * Captures for shelf.nu #3291 (expired reservations) and #3280 (check out and
 * check in from the bookings list):
 * content/knowledge-base/introduction-to-bookings.mdx
 * content/knowledge-base/early-check-in-and-check-out-of-bookings.mdx
 * content/knowledge-base/check-bookings-out-and-in-from-the-bookings-list.mdx
 *
 * 1. /bookings?status=EXPIRED: the list filtered to Expired, gray chips.
 * 2. An expired reservation's page: header Check out opens the "Reservation
 *    dates have passed" dialog. The script presses Cancel.
 * 3. /bookings: the row buttons column (Check out / Check in).
 * 4. Two Reserved rows ticked, Actions menu open: Check out and Check in.
 *
 * Nothing is created or submitted.
 */

import { mkdtemp, rm } from "node:fs/promises";
import { join } from "node:path";
import { tmpdir } from "node:os";
import { launchBrowser, createContext, loginToShelf, navigateTo } from "../lib/browser.mjs";
import { screenshot } from "../lib/capture.mjs";
import { toWebP } from "../lib/convert.mjs";
import { upload } from "../lib/upload.mjs";
import { initAnnotations, highlight, caption, clearAll } from "../lib/annotate.mjs";

const BUCKET_PREFIX = "knowledgebase";

async function main() {
  const tmpDir = await mkdtemp(join(tmpdir(), "shelf-bookings-list-"));
  const browser = await launchBrowser();
  const urls = {};
  try {
    const context = await createContext(browser);
    const page = await context.newPage();
    page.setDefaultTimeout(60000);
    await loginToShelf(page);

    const SKIP_1_2 = process.env.SKIP_1_2 === "1";
    // Shot 1: the Expired filter.
    await navigateTo(page, "/bookings?status=EXPIRED");
    await page.waitForTimeout(3000);
    const chips = SKIP_1_2 ? 0 : await page.locator("text=/^expired$/i").count();
    console.log(`Expired chips on the filtered list: ${chips}`);
    if (chips > 0) {
      await initAnnotations(page);
      await caption(page, "Status filter: Expired lists reservations whose end date passed with no check-out; the gray chip says they no longer hold the gear");
      const shot1 = await screenshot(page, join(tmpDir, "bookings-expired-filter.png"));
      await clearAll(page);
      urls.filter = await upload(toWebP(shot1), `${BUCKET_PREFIX}/bookings-expired-filter.webp`);
    } else {
      console.log("No Expired chips: shot 1 skipped");
    }

    // Shot 2: the expired check-out prompt from a booking header.
    const hrefs = await page.evaluate(() =>
      Array.from(document.querySelectorAll('a[href^="/bookings/"]'))
        .map((a) => a.getAttribute("href"))
        .filter((h) => /^\/bookings\/[a-z0-9]+(\/overview)?$/i.test(h))
    );
    const unique = SKIP_1_2 ? [] : [...new Set(hrefs)].slice(0, 6);
    console.log(`Expired bookings to probe: ${unique.length}`);
    let captured = false;
    for (const href of unique) {
      await navigateTo(page, href);
      await page.waitForTimeout(2000);
      const trigger = page.getByRole("button", { name: /^Check out$/ }).first();
      if (!(await trigger.isVisible().catch(() => false))) { console.log(`${href}: no Check out button`); continue; }
      await trigger.click();
      await page.waitForTimeout(800);
      const menuItem = page.getByRole("menuitem", { name: /^Check out$/ }).first();
      if (await menuItem.isVisible().catch(() => false)) {
        await menuItem.click();
        await page.waitForTimeout(800);
      }
      await page.waitForTimeout(700);
      const dialog = page.locator('[role="alertdialog"], [role="dialog"]').last();
      if (!(await dialog.isVisible().catch(() => false))) {
        const buttons = await page.getByRole("button").allInnerTexts().catch(() => []);
        console.log(`${href}: no dialog; buttons: ${buttons.filter(Boolean).join(" | ")}`);
        await page.keyboard.press("Escape"); continue;
      }
      const text = await dialog.innerText();
      const cancel = dialog.getByRole("button", { name: "Cancel" }).first();
      if (!/Reservation dates have passed/.test(text)) {
        console.log(`${href}: other dialog (${text.split("\n")[0]}), cancelling`);
        await cancel.click();
        continue;
      }
      console.log(`${href}: dialog text:\n${text}`);
      await initAnnotations(page);
      await caption(page, "An expired reservation asks first: start it now with a new end date, or check it out as overdue");
      const shot2 = await screenshot(page, join(tmpDir, "booking-expired-checkout-prompt.png"));
      await clearAll(page);
      await cancel.click();
      await page.waitForTimeout(800);
      urls.prompt = await upload(toWebP(shot2), `${BUCKET_PREFIX}/booking-expired-checkout-prompt.webp`);
      captured = true;
      break;
    }
    if (!captured) console.log("No expired prompt captured: shot 2 skipped");

    // Shots 3 and 4 need the whole table on screen, row buttons included.
    await context.close();
    const wide = await createContext(browser, { viewport: { width: 2100, height: 950 } });
    const list = await wide.newPage();
    list.setDefaultTimeout(60000);
    await loginToShelf(list);
    await navigateTo(list, "/bookings?status=RESERVED");
    await list.locator("table tbody tr").first().waitFor({ state: "visible" }).catch(() => {});
    await list.waitForTimeout(2500);
    console.log(`url: ${list.url()}; rows: ${await list.locator("table tbody tr").count()}`);
    const rowButtons = await list.locator('button[aria-label="Check out"], button[aria-label="Check in"], button[aria-label="Check out remaining"]').count();
    console.log(`Row buttons on /bookings?status=ALL: ${rowButtons}`);
    if (rowButtons > 0) {
      // The buttons sit in the table's last column, past the viewport: scroll
      // the table so the column is on screen before annotating.
      await list.locator('button[aria-label="Check out"]').first().scrollIntoViewIfNeeded();
      await list.waitForTimeout(600);
      await initAnnotations(list);
      await highlight(list, 'button[aria-label="Check out"]', { padding: 6 });
      await caption(list, "Each row that can be checked out or in has the button for it; it opens the same dialog as the booking page");
      const shot3 = await screenshot(list, join(tmpDir, "bookings-list-row-actions.png"));
      await clearAll(list);
      urls.rows = await upload(toWebP(shot3), `${BUCKET_PREFIX}/bookings-list-row-actions.webp`);

      // Shot 4: two Reserved rows ticked, Actions menu open.
      const reservedRows = list.locator('table tbody tr:has(button[aria-label="Check out"])');
      const n = await reservedRows.count();
      console.log(`Rows with Check out: ${n}`);
      if (n >= 2) {
        await reservedRows.nth(0).locator("td").first().click();
        await reservedRows.nth(1).locator("td").first().click();
        await list.waitForTimeout(700);
        const actions = list.getByRole("button", { name: /^Actions/ }).first();
        if (await actions.isVisible().catch(() => false)) {
          await actions.click();
          await list.waitForTimeout(900);
          const items = await list.getByRole("menuitem").allInnerTexts().catch(() => []);
          console.log(`Actions menu: ${items.map((t) => t.replace(/\s+/g, " ")).join(" | ")}`);
          await initAnnotations(list);
          await caption(list, "Actions on a selection: Check out and Check in sit ahead of Cancel, Archive and Delete; when the selection does not qualify, the entry is greyed out with the reason");
          const shot4 = await screenshot(list, join(tmpDir, "bookings-list-bulk-check-out.png"));
          await clearAll(list);
          await list.keyboard.press("Escape");
          urls.bulk = await upload(toWebP(shot4), `${BUCKET_PREFIX}/bookings-list-bulk-check-out.webp`);
        } else {
          console.log("No Actions button: shot 4 skipped");
        }
      }
    } else {
      console.log("No row buttons found: shots 3 and 4 skipped");
    }

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
