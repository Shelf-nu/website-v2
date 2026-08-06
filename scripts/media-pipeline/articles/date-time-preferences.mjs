#!/usr/bin/env node

/**
 * Capture annotated screenshots for:
 * content/knowledge-base/date-time-and-timezone-preferences.mdx
 *
 * Source of truth for the UI:
 * apps/webapp/app/components/user/language-region/language-region-form.tsx
 * (card title "Language & region", rows "Date format", "Time format",
 * "Week starts on", "Time zone", live preview "Dates will look like:")
 */

import { mkdtemp } from "node:fs/promises";
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

async function main() {
  const tmpDir = await mkdtemp(join(tmpdir(), "shelf-dateprefs-"));
  console.log(`Working in: ${tmpDir}`);

  const browser = await launchBrowser();
  const urls = {};
  try {
    const context = await createContext(browser);
    const page = await context.newPage();
    page.setDefaultTimeout(60000);
    await loginToShelf(page);

    // ── Screenshot 1: the Language & region card ─────────────────────
    console.log("Capturing Language & region card...");
    await navigateTo(page, "/account-details/general");

    // Hard assertion: if this feature is not deployed the run must fail
    // loudly rather than publish a screenshot of the old settings page.
    await page
      .locator('text="Language & region"')
      .first()
      .waitFor({ state: "visible", timeout: 30000 });
    await page
      .locator('text="Dates will look like:"')
      .first()
      .waitFor({ state: "visible", timeout: 30000 });

    // The page scrolls inside an app container, not the document body, so
    // window.scrollTo is a no-op here. Anchor the card heading to the top of
    // its own scroll container instead; the whole card then fits the viewport.
    await page
      .locator('text="Language & region"')
      .first()
      .evaluate((el) => el.scrollIntoView({ block: "start" }));
    await page.waitForTimeout(1500);

    // Assert the last row and the Save control are actually on screen before
    // shooting, so a layout change fails the run instead of publishing a
    // half-cropped card.
    await page
      .locator('text="Dates will look like:"')
      .first()
      .waitFor({ state: "visible" });

    // Clean shot of the whole card, no annotation overlay to hide rows.
    const shot1 = await screenshot(
      page,
      join(tmpDir, "language-region-card.png")
    );

    // A second, spotlit shot of the "Dates will look like:" line was tried and
    // dropped: the ring clipped the preview value and the dim overlay muddied
    // the rows. The clean card above already shows the preview in context.

    await context.close();

    const webp1 = toWebP(shot1);
    urls.card = await upload(webp1, `${BUCKET_PREFIX}/language-region-card.webp`);
    Object.values(urls).forEach((u) => console.log(`  OK ${u}`));
  } finally {
    await browser.close();
  }
}

main().catch((err) => {
  console.error("Failed:", err);
  process.exit(1);
});
