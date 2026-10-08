#!/usr/bin/env node

/**
 * Capture the "Code images on PDFs" row on Settings → General for:
 * content/knowledge-base/how-to-generate-a-pdf-overview-of-your-reserved-assets-bookings.mdx
 *
 * Ships with shelf.nu #3125 (renamed from #2993): the switch removes the code picture from the booking
 * checklist and the audit receipt. The printed code stays either way.
 */

import { mkdtemp } from "node:fs/promises";
import { join } from "node:path";
import { tmpdir } from "node:os";
import { launchBrowser, createContext, loginToShelf, navigateTo } from "../lib/browser.mjs";
import { screenshot } from "../lib/capture.mjs";
import { toWebP } from "../lib/convert.mjs";
import { upload } from "../lib/upload.mjs";
import { initAnnotations, highlight, caption, clearAll } from "../lib/annotate.mjs";

const BUCKET_PREFIX = "knowledgebase";

async function main() {
  const tmpDir = await mkdtemp(join(tmpdir(), "shelf-code-images-pdfs-"));
  console.log(`Working in: ${tmpDir}`);

  const browser = await launchBrowser();
  try {
    const context = await createContext(browser);
    const page = await context.newPage();
    page.setDefaultTimeout(60000);
    await loginToShelf(page);

    console.log("📸 Capturing Settings → General → Code images on PDFs...");
    await navigateTo(page, "/settings/general");

    const heading = page.locator("text=Code images on PDFs").first();
    if ((await heading.count()) > 0) {
      await heading.scrollIntoViewIfNeeded();
      await page.waitForTimeout(400);
      await page.evaluate(() => window.scrollBy(0, -100));
      await page.waitForTimeout(600);
    } else {
      console.warn("⚠️  'Code images on PDFs' row not found — capturing page as-is");
    }

    await initAnnotations(page);
    await highlight(page, "text:Print code images on PDFs", { spotlight: true, padding: 10 });
    await caption(page, "Settings → General → Code images on PDFs");
    const shot = await screenshot(page, join(tmpDir, "code-images-on-pdfs-setting.png"));
    await clearAll(page);
    await context.close();

    console.log("🔄 Converting...");
    const webp = toWebP(shot);

    console.log("☁️  Uploading...");
    const url = await upload(webp, `${BUCKET_PREFIX}/code-images-on-pdfs-setting.webp`);
    console.log(`  ✅ ${url}`);
  } finally {
    await browser.close();
  }
}

main().catch((err) => {
  console.error("❌ Failed:", err);
  process.exit(1);
});
