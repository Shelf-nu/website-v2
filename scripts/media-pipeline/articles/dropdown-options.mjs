#!/usr/bin/env node

/**
 * Capture the Option field editor added in shelf.nu#3211: drag handles,
 * Sort A-Z, "Used on N assets" and (when present) Merge duplicates. Opens the
 * demo workspace's "Brand" Option field and never saves it.
 *
 * Source of truth:
 * apps/webapp/app/components/forms/option-builder.tsx
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
const FIELD_NAME = "Brand";

async function main() {
  const tmpDir = await mkdtemp(join(tmpdir(), "shelf-dropdown-options-"));
  console.log(`Working in: ${tmpDir}`);

  const browser = await launchBrowser();
  try {
    const context = await createContext(browser);
    const page = await context.newPage();
    page.setDefaultTimeout(60000);
    await loginToShelf(page);

    await navigateTo(page, "/settings/custom-fields");
    await page
      .locator("tr", { hasText: FIELD_NAME })
      .first()
      .locator('a[href$="/edit"]')
      .first()
      .click();
    await page.waitForURL(/custom-fields\/[^/]+\/edit/, { timeout: 30000 });
    const sortBtn = page.getByRole("button", { name: "Sort A-Z" });
    await sortBtn.waitFor({ state: "visible", timeout: 30000 });
    await sortBtn.scrollIntoViewIfNeeded();
    await page.waitForTimeout(1200);

    await initAnnotations(page);
    await highlight(page, "text:Sort A-Z", { padding: 6 });
    await caption(
      page,
      "Drag, sort A-Z, rename or merge an Option field's choices; each shows how many assets use it"
    );
    const shot = await screenshot(page, join(tmpDir, "dropdown-options-editor.png"));
    await clearAll(page);
    await context.close();

    if (process.env.UPLOAD === "0") {
      console.log(`  Kept for review: ${shot}`);
      return;
    }
    const url = await upload(
      toWebP(shot),
      `${BUCKET_PREFIX}/dropdown-options-editor.webp`
    );
    console.log(`  OK ${url}`);
  } finally {
    await browser.close();
    if (process.env.UPLOAD !== "0") {
      await rm(tmpDir, { recursive: true, force: true }).catch(() => {});
    }
  }
}

main().catch((err) => {
  console.error("Failed:", err);
  process.exit(1);
});
