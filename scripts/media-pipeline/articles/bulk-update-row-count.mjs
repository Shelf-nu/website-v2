/**
 * shelf.nu#2927 — the mass-update upload check counts assets, not lines.
 *
 * Two shots, both read-only: the upload screen only reads the file the picker
 * hands it. Nothing is analysed, submitted or applied.
 *
 *  1. A CSV whose descriptions carry paragraph breaks reports 2 data rows.
 *  2. A CSV with a stray inches mark names the unbalanced quote.
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

const MULTILINE_CSV =
  '"id","title","description"\r\n' +
  '"a1","Chain hoist","Chain hoist\r\nEMTOP brand\r\nTwo identical units"\r\n' +
  '"a2","Impact mallet","IMPACT MALLET\r\n2 UNITS"\r\n';

const STRAY_QUOTE_CSV = 'id,title\r\n1,24" Monitor\r\n2,Laptop\r\n';

const UNBALANCED =
  'Unbalanced quote: a " is opened and never closed, so the rows after it run together.';

async function selectCsv(page, name, text) {
  await page.setInputFiles('input[type="file"]', {
    name,
    mimeType: "text/csv",
    buffer: Buffer.from(text, "utf8"),
  });
  await page.waitForTimeout(2500);
}

/** Throws unless the validation panel literally says `expected`. */
async function assertPanelSays(page, expected) {
  const panel = page.locator("form div.bg-gray-50").first();
  await panel.waitFor({ state: "visible", timeout: 15000 });
  // The panel sits below the fold on a 900px viewport, and `screenshot` shoots
  // the viewport. Without this the shot is of the page header and the caption
  // describes something that is not in the frame.
  await panel.scrollIntoViewIfNeeded();
  await page.waitForTimeout(600);
  const text = (await panel.innerText()).replace(/\s+/g, " ");
  if (!text.includes(expected)) {
    throw new Error(`panel does not say "${expected}" — it says: ${text}`);
  }
  console.log(`  ✓ panel says "${expected}"`);
  return text;
}

async function main() {
  const tmpDir = await mkdtemp(join(tmpdir(), "shelf-bulk-update-rows-"));
  let browser;
  try {
    browser = await launchBrowser();
    const ctx = await createContext(browser);
    const page = await ctx.newPage();
    page.setDefaultTimeout(60000);
    await loginToShelf(page);

    // ---- 1. Multi-line descriptions counted as their own records ----
    await navigateTo(page, "/assets/import-update");
    await selectCsv(page, "multiline-descriptions.csv", MULTILINE_CSV);
    await assertPanelSays(page, "2 data rows");
    await assertPanelSays(page, "3 columns");

    await initAnnotations(page);
    await highlight(page, "text:2 data rows", { spotlight: true, padding: 10 });
    await caption(
      page,
      "Two assets whose descriptions run to several lines each. The check reports two data rows, not the five lines they occupy."
    );
    const shot1 = await screenshot(page, join(tmpDir, "bulk-update-row-count.png"));
    await clearAll(page);

    // ---- 2. A stray quote is named rather than reported as an empty file ----
    await navigateTo(page, "/assets/import-update");
    await selectCsv(page, "stray-quote.csv", STRAY_QUOTE_CSV);
    await assertPanelSays(page, UNBALANCED);

    // `Analyze file` has to be disabled in the frame, or the caption's claim
    // that the file is refused is not visible anywhere in the image.
    const analyze = page.getByRole("button", { name: "Analyze file" });
    if (!(await analyze.isDisabled())) {
      throw new Error("Analyze file is still enabled — the refusal is not on screen");
    }
    console.log("  \u2713 Analyze file is disabled");

    await initAnnotations(page);
    await caption(
      page,
      'An inches mark typed straight into a cell opens a quote that never closes. The check names it, and Analyze file stays disabled until it is fixed.'
    );
    const shot2 = await screenshot(page, join(tmpDir, "bulk-update-unbalanced-quote.png"));
    await clearAll(page);
    await ctx.close();

    for (const [png, name] of [
      [shot1, "bulk-update-row-count.webp"],
      [shot2, "bulk-update-unbalanced-quote.webp"],
    ]) {
      const webp = toWebP(png);
      const url = await upload(webp, `${BUCKET_PREFIX}/${name}`);
      console.log(`  ✅ ${url}`);
    }
  } finally {
    if (browser) await browser.close();
    await rm(tmpDir, { recursive: true, force: true }).catch(() => {});
  }
}
main().catch((err) => { console.error("❌ Failed:", err); process.exit(1); });
