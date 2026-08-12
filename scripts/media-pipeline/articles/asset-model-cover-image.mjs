#!/usr/bin/env node
/** Screenshots for shelf.nu#2774 — asset model cover images.
 *
 * One shot, read-only: nothing is submitted and no image is uploaded into the
 * demo workspace. It captures the Asset model form's Image row with its
 * "uploaded once" subheading. The blast-radius hint ("Used by N assets that
 * don't have an image of their own") is deliberately not captured; see the
 * note in main().
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
import { initAnnotations, highlight, caption, clearAll } from "../lib/annotate.mjs";

const BUCKET_PREFIX = "knowledgebase";

async function main() {
  const tmpDir = await mkdtemp(join(tmpdir(), "shelf-asset-model-image-"));
  console.log(`Working in: ${tmpDir}`);
  let browser;
  const urls = {};
  try {
    browser = await launchBrowser();
    const ctx = await createContext(browser);
    const page = await ctx.newPage();
    page.setDefaultTimeout(60000);
    await loginToShelf(page);

    console.log("📸 Asset model form, Image row...");
    await navigateTo(page, "/settings/asset-models/new");
    // Assert the field is actually deployed before shooting it.
    await page
      .locator(
        'text="Uploaded once and shown on every asset of this model that has no image of its own."'
      )
      .first()
      .waitFor({ state: "visible" });
    await page.waitForTimeout(800);
    await initAnnotations(page);
    await highlight(page, "text:Accepts PNG, JPG, JPEG, or WebP (max.8 MB)", { padding: 10 });
    await caption(
      page,
      "One Image on the model. Every asset of that model with no image of its own shows it."
    );
    const shot1 = await screenshot(
      page,
      join(tmpDir, "asset-model-image-field.png")
    );
    await clearAll(page);

    /**
     * The "Used by N assets that don't have an image of their own" hint is
     * deliberately NOT captured. It only renders for a model that already has
     * inheriting assets, and the demo workspace's models have none. Forcing it
     * would mean creating assets in a workspace other people use.
     */
    await ctx.close();

    urls.field = await upload(
      toWebP(shot1),
      `${BUCKET_PREFIX}/asset-model-image-field.webp`
    );
    Object.values(urls).forEach((u) => console.log(`  ✅ ${u}`));
  } finally {
    if (browser) await browser.close();
    await rm(tmpDir, { recursive: true, force: true }).catch(() => {});
  }
}

main().catch((err) => {
  console.error("❌ Failed:", err);
  process.exit(1);
});
