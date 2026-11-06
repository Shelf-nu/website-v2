#!/usr/bin/env node
/**
 * Screenshots for three shelf.nu PRs merged 2026-11-03:
 *  - #3306 Managers "Add and edit assets and kits" switch (Settings > General > Permissions)
 *  - #3259 asset model "Default custom field values" (Settings > Asset models > edit)
 *  - #3325 bookings list Quick actions column and its ⋯ menu
 * STEP=probe : print what each page holds
 * STEP=shot  : capture, annotate and upload (UPLOAD=1)
 */
import { mkdtemp } from "node:fs/promises";
import { join } from "node:path";
import { tmpdir } from "node:os";
import { launchBrowser, createContext, loginToShelf, navigateTo } from "../lib/browser.mjs";
import { screenshot } from "../lib/capture.mjs";
import { toWebP } from "../lib/convert.mjs";
import { upload } from "../lib/upload.mjs";
import { initAnnotations, highlight, clearAll } from "../lib/annotate.mjs";

const STEP = process.env.STEP || "probe";
const ONLY = process.env.ONLY || "all";
const OUT = process.env.OUT || "/tmp";
const UPLOAD = process.env.UPLOAD === "1";

async function managers(page, tmpDir) {
  await navigateTo(page, "/settings/general");
  const heading = page.getByRole("heading", { name: "Managers", exact: true }).first();
  await heading.evaluate((el) => el.scrollIntoView({ block: "start" }));
  await page.evaluate(() => window.scrollBy(0, -120));
  await page.waitForTimeout(800);
  await page.screenshot({ path: join(OUT, "managers-raw.png") });
  console.log("MANAGERS TEXT:", (await heading.evaluate((el) => el.closest("form")?.innerText ?? "")).slice(0, 800));
  if (STEP === "shot") {
    await initAnnotations(page);
    await heading.evaluate((el) => el.closest("form").setAttribute("data-shot", "managers"));
    await highlight(page, '[data-shot="managers"]', { spotlight: true, padding: 8 });
    const shot = await screenshot(page, join(tmpDir, "managers-edit-assets-switch.png"));
    await clearAll(page);
    if (UPLOAD) console.log("  ✅", await upload(toWebP(shot), "knowledgebase/managers-edit-assets-switch.webp"));
  }
}

async function modelDefaults(page, tmpDir) {
  await navigateTo(page, "/settings/asset-models");
  const hrefs = await page.locator('a[href*="/settings/asset-models/"]').evaluateAll((els) => els.map((e) => e.getAttribute("href")));
  console.log("MODEL LINKS:", JSON.stringify(hrefs.slice(0, 10)));
  const id = process.env.MODEL_ID || (hrefs.find((h) => /asset-models\/[^/]+/.test(h) && !/new/.test(h)) || "").split("/")[3];
  await navigateTo(page, `/settings/asset-models/${id}/edit`);
  const h = page.getByRole("heading", { name: "Default custom field values" }).first();
  await h.evaluate((el) => el.scrollIntoView({ block: "start" }));
  await page.evaluate(() => window.scrollBy(0, -80));
  await page.waitForTimeout(800);
  await page.screenshot({ path: join(OUT, "model-defaults-raw.png") });
  console.log("MODEL", id, "SECTION:", (await h.evaluate((el) => el.parentElement?.innerText ?? "")).slice(0, 900));
  if (STEP === "shot") {
    await initAnnotations(page);
    await h.evaluate((el) => el.parentElement.setAttribute("data-shot", "defaults"));
    await highlight(page, '[data-shot="defaults"]', { spotlight: true, padding: 8 });
    const shot = await screenshot(page, join(tmpDir, "asset-model-default-field-values.png"));
    await clearAll(page);
    if (UPLOAD) console.log("  ✅", await upload(toWebP(shot), "knowledgebase/asset-model-default-field-values.webp"));
  }
}

async function quickActions(page, tmpDir) {
  await navigateTo(page, `/bookings?status=${process.env.BSTATUS || "ONGOING"}`);
  await page.waitForTimeout(4000);
  await page.screenshot({ path: join(OUT, "bookings-list-raw.png") });
  console.log("ROWS:", await page.locator("table tbody tr").count());
  const more = page.locator('button[aria-label="More actions"]');
  console.log("MORE BUTTONS:", await more.count());
  await more.first().click();
  await page.waitForTimeout(800);
  await page.screenshot({ path: join(OUT, "quick-actions-raw.png") });
  const menu = page.locator('[role="menu"], [data-radix-popper-content-wrapper], [role="dialog"]').last();
  console.log("MENU:", (await menu.innerText().catch(() => "?")).slice(0, 500));
  if (STEP === "shot") {
    const shot = await screenshot(page, join(tmpDir, "bookings-list-quick-actions-menu.png"));
    if (UPLOAD) console.log("  ✅", await upload(toWebP(shot), "knowledgebase/bookings-list-quick-actions-menu.webp"));
  }
}

async function main() {
  const tmpDir = await mkdtemp(join(tmpdir(), "shelf-3pr-"));
  const browser = await launchBrowser();
  try {
    const ctx = await createContext(browser, { viewport: { width: Number(process.env.VW || 1600), height: 950 } });
    const page = await ctx.newPage();
    page.setDefaultTimeout(45000);
    await loginToShelf(page);
    for (const [name, fn] of [["managers", managers], ["models", modelDefaults], ["quick", quickActions]]) {
      if (ONLY !== "all" && ONLY !== name) continue;
      try { await fn(page, tmpDir); } catch (e) { console.error(`❌ ${name}:`, e.message.split("\n")[0]); }
    }
    await ctx.close();
  } finally {
    await browser.close();
  }
}
main().catch((err) => { console.error("❌ Failed:", err); process.exit(1); });
