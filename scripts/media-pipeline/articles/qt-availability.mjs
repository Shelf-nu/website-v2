/**
 * Media article: quantity-tracked availability (shelf.nu#2770).
 *
 * Captures the Quantity Overview card on a real QUANTITY_TRACKED asset so the
 * KB section that explains the "Available" headline has a matching visual.
 *
 * The asset is discovered at run time (no hardcoded id): walk /assets, open
 * each overview, keep the first one whose sidebar renders "Quantity Overview".
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
import { initAnnotations, caption, clearAll } from "../lib/annotate.mjs";

const BUCKET_PREFIX = "knowledgebase";

async function findQuantityTrackedAsset(page) {
  await navigateTo(page, "/assets?per_page=100");
  const ids = await page.evaluate(() => {
    const reserved = new Set(["import", "new", "advanced", "scan-assets"]);
    return [
      ...new Set(
        Array.from(document.querySelectorAll('a[href^="/assets/"]'))
          .map((a) => a.getAttribute("href").split("/")[2])
          .filter((id) => id && id.length > 6 && !reserved.has(id))
      ),
    ];
  });

  for (const id of ids) {
    await navigateTo(page, `/assets/${id}/overview`);
    const isQt = await page
      .getByText("Quantity Overview", { exact: true })
      .first()
      .isVisible()
      .catch(() => false);
    if (isQt) return id;
  }
  throw new Error("No QUANTITY_TRACKED asset found in the demo workspace");
}

async function main() {
  const tmpDir = await mkdtemp(join(tmpdir(), "shelf-qt-availability-"));
  let browser;
  try {
    browser = await launchBrowser();
    const ctx = await createContext(browser);
    const page = await ctx.newPage();
    page.setDefaultTimeout(60000);
    await loginToShelf(page);

    const assetId = await findQuantityTrackedAsset(page);
    console.log(`  Using quantity-tracked asset ${assetId}`);

    // Assert the rows we are about to caption are actually on screen, so
    // selector drift throws instead of publishing a mismatched screenshot.
    await page
      .getByText("Total quantity", { exact: true })
      .first()
      .waitFor({ state: "visible" });
    await page
      .getByText("Available", { exact: true })
      .first()
      .waitFor({ state: "visible" });
    await page
      .getByText("In custody", { exact: true })
      .first()
      .waitFor({ state: "visible" });

    await initAnnotations(page);
    await caption(
      page,
      "Quantity Overview: Available is what is physically on the shelf right now"
    );
    const shot = await screenshot(
      page,
      join(tmpDir, "quantity-overview-card.png")
    );
    await clearAll(page);
    await ctx.close();

    const webp = toWebP(shot);
    const url = await upload(
      webp,
      `${BUCKET_PREFIX}/quantity-overview-card.webp`
    );
    console.log(`  OK ${url}`);
  } finally {
    if (browser) await browser.close();
    await rm(tmpDir, { recursive: true, force: true }).catch(() => {});
  }
}

main().catch((err) => {
  console.error("Failed:", err);
  process.exit(1);
});
