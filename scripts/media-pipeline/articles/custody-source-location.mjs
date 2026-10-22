/**
 * Custody source location (shelf.nu #3099) and check-out source location (#3100).
 *
 * Live captures on the demo workspace's pool placed at two locations
 * ("Sandbag (Counterweight) 24x45cm"): the Placements + Custody Breakdown
 * cards, the Assign Quantity Custody dialog with its From location field, and
 * the Adjust Quantity dialog with its At location field. Dialogs are opened and
 * closed only; nothing is submitted.
 *
 * The check-out dialog, booking row and location row (#3100) need a booking
 * holding such a pool, which the pipeline must not create in the shared demo
 * workspace, so those three are the PR's own QA captures (same code, dev
 * server), passed in via GIST_DIR and uploaded as they are.
 */
import { mkdtemp, rm } from "node:fs/promises";
import { join } from "node:path";
import { tmpdir } from "node:os";
import { launchBrowser, createContext, loginToShelf, navigateTo } from "../lib/browser.mjs";
import { screenshot } from "../lib/capture.mjs";
import { toWebP } from "../lib/convert.mjs";
import { upload } from "../lib/upload.mjs";
import { initAnnotations, highlight, callout, caption, clearAll } from "../lib/annotate.mjs";

const BUCKET_PREFIX = "knowledgebase";
const ASSET_ID = "cmr91tea000abndi749v99g3g"; // Sandbag (Counterweight) 24x45cm, placed at 2 locations
const GIST_DIR = process.env.GIST_DIR;

async function main() {
  const tmpDir = await mkdtemp(join(tmpdir(), "shelf-custody-source-"));
  let browser;
  const urls = {};
  try {
    browser = await launchBrowser();
    const ctx = await createContext(browser);
    const page = await ctx.newPage();
    page.setDefaultTimeout(60000);
    await loginToShelf(page);

    // 1. Asset page cards: Placed at locations + Custody Breakdown
    await navigateTo(page, `/assets/${ASSET_ID}/overview`);
    await page.getByText("Placed at locations").first().waitFor({ state: "visible" });
    await initAnnotations(page);
    await highlight(page, "text:Placed at locations", { spotlight: true, padding: 10 });
    await caption(page, "A pool kept at two locations: each location shows its units, and custody lines say which location they came from");
    const cards = await screenshot(page, join(tmpDir, "custody-source-asset-cards.png"));
    await clearAll(page);

    // 2. Assign Quantity Custody dialog with From location
    await page.getByRole("button", { name: /^Assign$/ }).first().click();
    const assignTitle = page.getByText("Assign Quantity Custody").first();
    await assignTitle.waitFor({ state: "visible" });
    await page.getByText("From location").first().waitFor({ state: "visible" });
    await page.waitForTimeout(400);
    await initAnnotations(page);
    await highlight(page, "text:From location", { spotlight: true, padding: 10 });
    await callout(page, "text:From location", "Pre-filled with the location that has the most units left; the quantity is capped at what that location has", { label: "New field", side: "left" });
    const assign = await screenshot(page, join(tmpDir, "custody-source-assign-dialog.png"));
    await clearAll(page);
    await page.keyboard.press("Escape");
    await assignTitle.waitFor({ state: "hidden" }).catch(() => {});

    // 3. Adjust Quantity dialog with At location
    await page.getByRole("button", { name: /^Adjust$/ }).first().click();
    const adjustTitle = page.getByText("Adjust Quantity").first();
    await adjustTitle.waitFor({ state: "visible" });
    await page.getByText("At location").first().waitFor({ state: "visible" });
    await page.waitForTimeout(400);
    await initAnnotations(page);
    await highlight(page, "text:At location", { spotlight: true, padding: 10 });
    await callout(page, "text:At location", "A restock lands at this location; a loss comes off it, within what it has left", { label: "New field", side: "left" });
    const adjust = await screenshot(page, join(tmpDir, "custody-source-adjust-dialog.png"));
    await clearAll(page);
    await page.keyboard.press("Escape");
    await ctx.close();

    urls.cards = await upload(toWebP(cards), `${BUCKET_PREFIX}/custody-source-asset-cards.webp`);
    urls.assign = await upload(toWebP(assign), `${BUCKET_PREFIX}/custody-source-assign-dialog.webp`);
    urls.adjust = await upload(toWebP(adjust), `${BUCKET_PREFIX}/custody-source-adjust-dialog.webp`);

    if (GIST_DIR) {
      urls.dialog = await upload(join(GIST_DIR, "3100-after-dialog.webp"), `${BUCKET_PREFIX}/checkout-source-dialog.webp`);
      urls.row = await upload(join(GIST_DIR, "3100-after-booking-row.webp"), `${BUCKET_PREFIX}/checkout-source-booking-row.webp`);
      urls.loc = await upload(join(GIST_DIR, "3100-after-location-onbooking.webp"), `${BUCKET_PREFIX}/checkout-source-location-row.webp`);
    }
    Object.values(urls).forEach((u) => console.log(`  ✅ ${u}`));
  } finally {
    if (browser) await browser.close();
    await rm(tmpDir, { recursive: true, force: true }).catch(() => {});
  }
}
main().catch((err) => { console.error("❌ Failed:", err); process.exit(1); });
