/**
 * Booking approval settings card (shelf.nu#3322).
 * Read-only: opens Settings > Bookings, asserts the card and both switch
 * labels are on screen, and shoots the card. Changes no setting.
 */
import { mkdir, mkdtemp } from "node:fs/promises";
import { tmpdir } from "node:os";
import { join } from "node:path";
import {
  launchBrowser,
  createContext,
  loginToShelf,
  navigateTo,
} from "../lib/browser.mjs";
import { screenshot } from "../lib/capture.mjs";
import { toWebP } from "../lib/convert.mjs";
import { upload } from "../lib/upload.mjs";

// A fresh directory per run, so two runs never share a PNG.
const OUT_BASE = process.env.OUT_DIR || tmpdir();
const LABELS = [
  "Booking approval",
  "Base users request bookings",
  "Self service users request bookings",
];

async function main() {
  await mkdir(OUT_BASE, { recursive: true });
  const OUT = await mkdtemp(join(OUT_BASE, "booking-approval-"));
  const browser = await launchBrowser();
  try {
    const ctx = await createContext(browser);
    const page = await ctx.newPage();
    page.setDefaultTimeout(60000);
    await loginToShelf(page);
    await navigateTo(page, "/settings/bookings");

    const heading = page.getByRole("heading", { name: "Booking approval" });
    await heading.waitFor({ state: "visible" });
    const body = await page.locator("body").innerText();
    for (const label of LABELS) {
      if (!body.includes(label)) throw new Error(`Missing on page: ${label}`);
    }
    const states = [];
    for (const title of LABELS.slice(1)) {
      const sw = page.locator(`[title="${title}"]`).first();
      const state =
        (await sw.getAttribute("aria-checked")) ??
        (await sw.getAttribute("data-state"));
      console.log(`switch "${title}":`, state);
      states.push(state);
    }

    // Shoot the card alone: the cards around it carry workspace data that
    // has nothing to do with this article.
    await heading.scrollIntoViewIfNeeded();
    const tagged = await page.evaluate(() => {
      const h = [...document.querySelectorAll("h3")].find(
        (el) => el.textContent.trim() === "Booking approval"
      );
      const card = h?.parentElement?.parentElement;
      if (!card) return false;
      card.setAttribute("data-shot", "booking-approval");
      return [
        "Base users request bookings",
        "Self service users request bookings",
      ].every((t) => card.textContent.includes(t));
    });
    if (!tagged) throw new Error("Card does not hold both switches");
    await page.waitForTimeout(500);

    const shot = await screenshot(page, join(OUT, "booking-approval-settings.png"), {
      selector: '[data-shot="booking-approval"]',
    });
    console.log("shot:", shot);
    if (process.env.UPLOAD === "1") {
      // The published image is captioned "both off": refuse to replace it
      // with any other state. This script never changes the setting.
      if (!states.every((s) => s === "false" || s === "unchecked")) {
        throw new Error(`Not uploading: switches are ${states.join(", ")}`);
      }
      const url = await upload(toWebP(shot), "knowledgebase/booking-approval-settings.webp");
      console.log("uploaded:", url);
    }
    await ctx.close();
  } finally {
    await browser.close();
  }
}

await main();
