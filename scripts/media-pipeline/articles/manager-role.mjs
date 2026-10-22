#!/usr/bin/env node
/** Capture for the Manager role (shelf.nu#3167):
 *  1. Settings → Team → Users → "Invite a user" with the role list open, Manager in it.
 *  2. Settings → Bookings → the "Check-out needs each item scanned or selected" card,
 *     whose first switch now reads "Admins and Managers".
 *  3. Settings → Bookings → "Notify all owners, administrators and managers on new
 *     booking requests".
 * Read-only: dialogs are opened and closed with Escape, nothing is submitted or switched.
 * Also PROVES the role is live on app.shelf.nu: it fails if "Manager" is missing. */
import { mkdtemp, rm } from "node:fs/promises";
import { join } from "node:path";
import { tmpdir } from "node:os";
import { launchBrowser, createContext, loginToShelf, navigateTo } from "../lib/browser.mjs";
import { screenshot } from "../lib/capture.mjs";
import { toWebP } from "../lib/convert.mjs";
import { upload } from "../lib/upload.mjs";
import { initAnnotations, highlight, callout, caption, clearAll } from "../lib/annotate.mjs";

const BUCKET_PREFIX = "knowledgebase";

async function scrollToCard(page, heading) {
  const el = page.getByText(heading, { exact: false }).first();
  if ((await el.count()) === 0) throw new Error(`Text not found: ${heading}`);
  await el.scrollIntoViewIfNeeded();
  await page.waitForTimeout(400);
  await page.evaluate(() => window.scrollBy(0, -100));
  await page.waitForTimeout(600);
}

async function main() {
  const tmpDir = await mkdtemp(join(tmpdir(), "shelf-manager-role-"));
  console.log(`Working in: ${tmpDir}`);
  let browser;
  const shots = {};
  try {
    browser = await launchBrowser();
    const ctx = await createContext(browser);
    const page = await ctx.newPage();
    page.setDefaultTimeout(60000);
    await loginToShelf(page);

    // 1. Invite dialog with the role list open
    await navigateTo(page, "/settings/team/users");
    await page.getByText("Invite a user", { exact: true }).first().click();
    const dlg = page.locator('h4:has-text("Invite team members")').first();
    await dlg.waitFor({ state: "visible" });
    await page.waitForTimeout(800);
    const trigger = page.locator('button[role="combobox"]').filter({ hasText: /Select user role/ }).first();
    await trigger.waitFor({ state: "visible" });
    await trigger.click();
    await page.waitForTimeout(900);
    const listbox = page.locator('[role="listbox"]').first();
    await listbox.waitFor({ state: "visible" });
    const options = (await listbox.innerText()).replace(/\s+/g, " ");
    console.log("Role options:", options);
    if (!/Manager/.test(options)) throw new Error("Manager is NOT in the invite role list on prod: " + options);
    await initAnnotations(page);
    await caption(page, "Settings → Team → Invite a user: the role list now offers Manager, between Administrator and Self service.");
    shots.invite = await screenshot(page, join(tmpDir, "invite-role-list-manager.png"));
    await clearAll(page);
    await page.keyboard.press("Escape");
    await page.waitForTimeout(400);
    await page.keyboard.press("Escape");
    await page.waitForTimeout(500);

    // 2. Explicit check-out card
    await navigateTo(page, "/settings/bookings");
    await scrollToCard(page, "Check-out needs each item scanned or selected");
    const body = await page.locator("body").innerText();
    if (!/Admins and Managers/.test(body)) throw new Error("'Admins and Managers' switch label not found on /settings/bookings");
    await initAnnotations(page);
    await highlight(page, "textStartsWith:Removes the one-click check-out for Admins and Managers", { spotlight: true, padding: 10 });
    await callout(
      page,
      "textStartsWith:Removes the one-click check-out for Admins and Managers",
      "One switch covers Administrators and Managers together. The owner is never restricted.",
      { label: "Per role", side: "right" }
    );
    await caption(page, "Settings → Bookings: Check-out needs each item scanned or selected. Only the workspace owner can change it.");
    shots.checkout = await screenshot(page, join(tmpDir, "explicit-checkout-requirement-v3.png"));
    await clearAll(page);

    await scrollToCard(page, "Check-in needs each item scanned or selected");
    await initAnnotations(page);
    await caption(page, "The two requirements are twins: one governs handing gear out, the other governs taking it back.");
    shots.pair = await screenshot(page, join(tmpDir, "explicit-requirement-cards-v3.png"));
    await clearAll(page);

    // 3. Notification broadcast toggle (non-fatal)
    try {
      if (!/Notify all owners, administrators and managers on new booking requests/.test(body)) {
        throw new Error("Notification toggle label with managers not found on /settings/bookings");
      }
      await scrollToCard(page, "Notify all owners, administrators and managers on new booking requests");
      await initAnnotations(page);
      await highlight(page, "text:Notify all owners, administrators and managers on new booking requests", { spotlight: true, padding: 10 });
      await caption(page, "Settings → Bookings: a new reservation now reaches Managers as well as Owners and Administrators.");
      shots.notify = await screenshot(page, join(tmpDir, "notify-reservation-audience-managers.png"));
      await clearAll(page);
    } catch (e) {
      console.error("Shot 3 skipped:", e.message);
    }
    await ctx.close();

    const urls = {};
    urls.invite = await upload(toWebP(shots.invite), `${BUCKET_PREFIX}/invite-role-list-manager.webp`);
    urls.checkout = await upload(toWebP(shots.checkout), `${BUCKET_PREFIX}/explicit-checkout-requirement-v3.webp`);
    urls.pair = await upload(toWebP(shots.pair), `${BUCKET_PREFIX}/explicit-requirement-cards-v3.webp`);
    if (shots.notify) urls.notify = await upload(toWebP(shots.notify), `${BUCKET_PREFIX}/notify-reservation-audience-managers.webp`);
    Object.values(urls).forEach((u) => console.log(`  OK ${u}`));
  } finally {
    if (browser) await browser.close();
    if (!process.env.KEEP_DIR) await rm(tmpDir, { recursive: true, force: true }).catch(() => {});
  }
}

main().catch((err) => { console.error("Failed:", err); process.exit(1); });
