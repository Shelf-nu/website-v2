/**
 * Booking Compliance report: the "How it's calculated" explainer, the headline
 * rate, and the Return Status column, which all fit one viewport at All time.
 * Read-only — navigates and reads, submits nothing.
 *
 * Asserts the shipped wording of the 15-minute rule before shooting, so a
 * relabelled explainer throws instead of publishing a caption that describes
 * something the image does not show.
 */
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
  const tmpDir = await mkdtemp(join(tmpdir(), "shelf-compliance-"));
  let browser;
  try {
    browser = await launchBrowser();
    const ctx = await createContext(browser);
    const page = await ctx.newPage();
    page.setDefaultTimeout(60000);
    await loginToShelf(page);

    await navigateTo(page, "/reports/booking-compliance?timeframe=all_time");

    // Assert the shipped explainer, not just any text. This is the wording the
    // caption describes and the deploy check for the planned-end fix.
    const explainer = page.getByText(/How it's calculated/i).first();
    await explainer.waitFor({ state: "visible" });
    const body = await page.evaluate(() => document.body.innerText);
    for (const needle of [
      "within 15 minutes of the scheduled end",
      "overdue bookings always count as late",
      "On-Time Return Rate",
      "Return Status",
    ]) {
      if (!body.includes(needle)) {
        throw new Error(`Expected copy not on the page: ${needle}`);
      }
    }
    console.log("assert OK: the 15-minute rule and Return Status are on the page");

    // screenshot() shoots the viewport, so bring the explainer into frame.
    await explainer.scrollIntoViewIfNeeded();
    await page.waitForTimeout(800);

    await initAnnotations(page);
    await caption(
      page,
      "Booking Compliance states its own rule: a return inside 15 minutes of the scheduled end is on time"
    );
    const shot = await screenshot(page, join(tmpDir, "booking-compliance-calculation.png"));
    await clearAll(page);

    await ctx.close();

    const url = await upload(toWebP(shot), `${BUCKET_PREFIX}/booking-compliance-calculation.webp`);
    console.log(`  OK ${url}`);
    console.log(`PNGs kept for inspection at: ${tmpDir}`);
  } finally {
    if (browser) await browser.close();
  }
}
main().catch((err) => { console.error("Failed:", err); process.exit(1); });
