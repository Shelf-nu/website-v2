#!/usr/bin/env node
/** Capture for: early-check-in-and-check-out-of-bookings.mdx (shelf.nu#3217)
 * Looks for an Ongoing or Overdue demo booking; if one exists, opens its Check-in
 * confirmation and shoots it, then Cancel. Nothing is submitted. */
import { mkdtemp, rm } from "node:fs/promises";
import { join } from "node:path";
import { tmpdir } from "node:os";
import { launchBrowser, createContext, loginToShelf, navigateTo } from "../lib/browser.mjs";
import { screenshot } from "../lib/capture.mjs";
import { toWebP } from "../lib/convert.mjs";
import { upload } from "../lib/upload.mjs";
import { initAnnotations, caption, clearAll } from "../lib/annotate.mjs";

const BUCKET_PREFIX = "knowledgebase";

async function main() {
  const tmpDir = await mkdtemp(join(tmpdir(), "shelf-checkin-"));
  let browser;
  try {
    browser = await launchBrowser();
    const ctx = await createContext(browser);
    const page = await ctx.newPage();
    page.setDefaultTimeout(60000);
    await loginToShelf(page);
    let href = null;
    for (const status of ["ONGOING", "OVERDUE"]) {
      await navigateTo(page, `/bookings?status=${status}`);
      const links = await page.locator("tbody tr a[href*='/bookings/']").evaluateAll((as) => as.map((a) => a.getAttribute("href")));
      console.log(status, "rows:", links.length, links.slice(0, 3));
      if (links.length) { href = links[0]; break; }
    }
    if (!href) { console.log("NO ONGOING/OVERDUE BOOKING in the demo workspace; nothing captured."); await ctx.close(); return; }
    await navigateTo(page, href.replace(/\?.*$/, ""));
    const text = await page.evaluate(() => document.body.innerText);
    console.log("Has Check-in control:", /Check-in|Check in/.test(text));
    const checkin = page.getByRole("button", { name: /^Check-in$|^Check in$/ }).first();
    if (!(await checkin.count())) { console.log("No Check-in button on the booking (role or explicit setting?)"); await ctx.close(); return; }
    await checkin.click();
    await page.waitForTimeout(800);
    // Either a dropdown (Quick check-in / scanner) or the dialog itself.
    const quick = page.getByRole("menuitem", { name: /Quick check-in/i }).or(page.getByText(/Quick check-in/i));
    if (await quick.count()) { await quick.first().click(); await page.waitForTimeout(800); }
    const dialog = page.getByRole("alertdialog").or(page.getByRole("dialog"));
    await dialog.first().waitFor({ state: "visible", timeout: 15000 });
    const dText = await dialog.first().innerText();
    console.log("Dialog:", dText.replace(/\n/g, " | "));
    if (!/Check in booking/.test(dText)) throw new Error("Not the check-in dialog: " + dText);
    await initAnnotations(page);
    await caption(page, "Quick check-in asks first: the dialog names the booking and what it will do.");
    const shot = await screenshot(page, join(tmpDir, "checkin-confirm-dialog.png"));
    await clearAll(page);
    await page.getByRole("button", { name: "Cancel" }).click();
    await page.waitForTimeout(500);
    await ctx.close();
    const u1 = await upload(toWebP(shot), `${BUCKET_PREFIX}/checkin-confirm-dialog.webp`);
    console.log(`  OK ${u1}`);
  } finally {
    if (browser) await browser.close();
    await rm(tmpDir, { recursive: true, force: true }).catch(() => {});
  }
}
main().catch((err) => { console.error("Failed:", err); process.exit(1); });
