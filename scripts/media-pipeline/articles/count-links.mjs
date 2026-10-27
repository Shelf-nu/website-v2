#!/usr/bin/env node

/**
 * Capture the Tags list with its new Assets and Bookings count columns and
 * the Categories list with its linked asset counts (shelf.nu #3254, #3261)
 * for:
 * content/knowledge-base/what-is-a-tag-in-shelf-and-what-can-they-be-used-for.mdx
 * content/knowledge-base/using-categories-to-organize-your-asset-inventory.mdx
 * content/updates/counts-and-chips-open-the-lists-they-describe.mdx
 *
 * Read-only: it only opens list pages. It also counts the count links and
 * chip links on /assets, /locations, /audits and the dashboard and prints
 * them, as proof the links are live before the pages are described.
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
import {
  initAnnotations,
  highlight,
  callout,
  caption,
  clearAll,
} from "../lib/annotate.mjs";

const BUCKET_PREFIX = "knowledgebase";

async function countLinks(page, label, selectors) {
  const counts = await page.evaluate((sels) => {
    const out = {};
    for (const [name, sel] of Object.entries(sels)) {
      out[name] = document.querySelectorAll(sel).length;
    }
    return out;
  }, selectors);
  console.log(`  ${label}: ${JSON.stringify(counts)}`);
  return counts;
}

async function main() {
  const tmpDir = await mkdtemp(join(tmpdir(), "shelf-count-links-"));
  const browser = await launchBrowser();
  try {
    const context = await createContext(browser);
    const page = await context.newPage();
    page.setDefaultTimeout(60000);
    await loginToShelf(page);

    // Tags list: new Assets and Bookings columns, counts are links
    await navigateTo(page, "/tags");
    await page.locator("table").first().waitFor({ state: "visible" });
    await page.locator('th:has-text("Bookings")').first().waitFor({ state: "visible" });
    await page.waitForTimeout(800);
    const tagCounts = await countLinks(page, "/tags", {
      assetCountLinks: 'table a[href*="/assets?tag="]',
      bookingCountLinks: 'table a[href*="/bookings?tag="]',
    });
    await initAnnotations(page);
    if (tagCounts.assetCountLinks > 0) {
      await highlight(page, 'table a[href*="/assets?tag="]', { padding: 6 });
      await callout(
        page,
        'table a[href*="/assets?tag="]',
        "Opens the asset list filtered to this tag",
        { label: "Assets", side: "right" }
      );
    }
    await caption(
      page,
      "Tags: the Assets and Bookings columns count what carries each tag, and each count opens that list"
    );
    const tagsShot = await screenshot(page, join(tmpDir, "tags-list-counts.png"));
    await clearAll(page);

    // Categories list: the asset count is a link to the filtered index
    await navigateTo(page, "/categories");
    await page.locator("table").first().waitFor({ state: "visible" });
    await page.waitForTimeout(800);
    const catCounts = await countLinks(page, "/categories", {
      assetCountLinks: 'table a[href*="/assets?category="]',
    });
    await initAnnotations(page);
    if (catCounts.assetCountLinks > 0) {
      await highlight(page, 'table a[href*="/assets?category="]', { padding: 6 });
      await callout(
        page,
        'table a[href*="/assets?category="]',
        "Opens the asset list filtered to this category",
        { label: "Assets", side: "right" }
      );
    }
    await caption(
      page,
      "Categories: click an asset count to open the asset list filtered to that category"
    );
    const catShot = await screenshot(page, join(tmpDir, "categories-count-links.png"));
    await clearAll(page);

    // Proof only, no screenshots: chips and counts elsewhere
    await navigateTo(page, "/assets");
    await page.locator("table").first().waitFor({ state: "visible" });
    await page.waitForTimeout(800);
    await countLinks(page, "/assets", {
      categoryChipLinks: 'table a[href*="/assets?category="]',
      tagChipLinks: 'table a[href*="/assets?tag="]',
      custodianLinks: 'table a[href*="/assets?teamMember="], table a[href*="/settings/team/users/"]',
    });
    await navigateTo(page, "/locations");
    await page.locator("table").first().waitFor({ state: "visible" });
    await page.waitForTimeout(800);
    await countLinks(page, "/locations", {
      assetsCountLinks: 'table a[href$="/assets"]',
      kitsCountLinks: 'table a[href$="/kits"]',
    });
    await navigateTo(page, "/audits");
    await page.waitForTimeout(1500);
    await countLinks(page, "/audits", {
      auditStatusLinks: 'a[href*="auditStatus="]',
    });
    await navigateTo(page, "/");
    await page.waitForTimeout(2500);
    await countLinks(page, "/ (dashboard)", {
      statusLegendLinks: 'a[href*="/assets?status="]',
    });

    await context.close();

    const urls = [];
    urls.push(await upload(toWebP(tagsShot), `${BUCKET_PREFIX}/tags-list-counts.webp`));
    urls.push(await upload(toWebP(catShot), `${BUCKET_PREFIX}/categories-count-links.webp`));
    urls.forEach((u) => console.log(`  ✅ ${u}`));
  } finally {
    await browser.close();
    await rm(tmpDir, { recursive: true, force: true }).catch(() => {});
  }
}

main().catch((err) => {
  console.error("❌ Failed:", err);
  process.exit(1);
});
