#!/usr/bin/env node
/**
 * Capture the kit code chip on the Location detail's Kits tab, for
 * content/knowledge-base/asset-identifiers-qr-id-sam-id-property-id.mdx.
 *
 * The chip is the shared <AssetCodeBadge>, and until shelf.nu#2903 this tab
 * carried no code at all: `getLocationKits` selected only category and custody.
 *
 * Source of truth:
 *   apps/webapp/app/routes/_layout+/locations.$locationId.kits.tsx
 *   apps/webapp/app/modules/location/service.server.ts (getLocationKits)
 *
 * Read-only: navigates and screenshots. Submits nothing.
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
/** Studio B — holds three kits. */
const LOCATION = "clx2zkqpp000c102kx32goa83";

async function main() {
  const tmpDir = await mkdtemp(join(tmpdir(), "shelf-kitchips-"));
  console.log(`Working in: ${tmpDir}`);
  const browser = await launchBrowser();
  try {
    const context = await createContext(browser);
    const page = await context.newPage();
    page.setDefaultTimeout(60000);
    await loginToShelf(page);

    await navigateTo(page, `/locations/${LOCATION}/kits`);
    await page.waitForTimeout(3000);

    /**
     * Assert every kit row on screen carries a code, so a regression that
     * drops the relation from the loader throws here instead of publishing a
     * caption the image does not support.
     */
    const rows = await page.evaluate(() =>
      Array.from(document.querySelectorAll("tbody tr")).map((r) =>
        r.innerText.replace(/\s+/g, " ").trim()
      )
    );
    if (rows.length === 0) throw new Error("no kit rows on the Kits tab");
    const withoutCode = rows.filter((r) => !/[a-z0-9]{10,}/.test(r));
    if (withoutCode.length > 0) {
      throw new Error(`kit row with no code chip: ${withoutCode[0]}`);
    }
    console.log(`rows OK: ${rows.length} kits, all carrying a code`);

    await initAnnotations(page);
    await caption(
      page,
      "A location's Kits tab carries the same code chip as the Kits page, so a label on the shelf matches the row on screen."
    );
    const shot = await screenshot(page, join(tmpDir, "kit-code-chip-location.png"));
    await clearAll(page);
    await context.close();

    const url = await upload(
      toWebP(shot),
      `${BUCKET_PREFIX}/kit-code-chip-location.webp`
    );
    console.log(`  ✅ ${url}`);
  } finally {
    await browser.close();
    await rm(tmpDir, { recursive: true, force: true }).catch(() => {});
  }
}
main().catch((err) => {
  console.error("❌ Failed:", err);
  process.exit(1);
});
