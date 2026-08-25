/**
 * shelf.nu#2928 (D056) — a location's asset list resolves custody again.
 *
 * One read-only shot: a location page whose Custodian column names the people
 * holding assets stored there, including a pooled asset under partial custody.
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
const STUDIO_B = "/locations/clx2zkqpp000c102kx32goa83/assets";

async function main() {
  const tmpDir = await mkdtemp(join(tmpdir(), "shelf-custody-location-"));
  let browser;
  try {
    browser = await launchBrowser();
    const ctx = await createContext(browser);
    const page = await ctx.newPage();
    page.setDefaultTimeout(60000);
    await loginToShelf(page);

    await navigateTo(page, STUDIO_B);

    // The caption claims the Custodian column names real people. Assert that a
    // Custodian header exists AND that at least two rows carry a name under it,
    // so a regression back to the blank column throws instead of shipping.
    const named = await page.evaluate(() => {
      const ths = Array.from(document.querySelectorAll("th")).map((t) => t.innerText.trim());
      const ci = ths.indexOf("Custodian");
      if (ci === -1) return { ci, names: [], ths };
      const names = [];
      for (const row of document.querySelectorAll("tbody tr")) {
        const cell = row.querySelectorAll("td")[ci];
        const text = cell?.innerText.trim();
        if (text && text !== "—" && !/no data/i.test(text)) names.push(text);
      }
      return { ci, names, ths };
    });
    if (named.ci === -1) {
      throw new Error(`no Custodian column on the location page — headers: ${named.ths.join(", ")}`);
    }
    if (named.names.length < 2) {
      throw new Error(`Custodian column is empty (${named.names.length} named rows) — nothing to show`);
    }
    console.log(`  ✓ Custodian column names ${named.names.length} rows: ${named.names.join(", ")}`);

    await initAnnotations(page);
    await caption(
      page,
      "A location's asset list names who holds each item, including a pooled asset that is only partly in custody."
    );
    const shot = await screenshot(page, join(tmpDir, "custody-on-location-page.png"));
    await clearAll(page);
    await ctx.close();

    const url = await upload(toWebP(shot), `${BUCKET_PREFIX}/custody-on-location-page.webp`);
    console.log(`  ✅ ${url}`);
  } finally {
    if (browser) await browser.close();
    await rm(tmpDir, { recursive: true, force: true }).catch(() => {});
  }
}
main().catch((err) => { console.error("❌ Failed:", err); process.exit(1); });
