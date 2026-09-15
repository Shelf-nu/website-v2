#!/usr/bin/env node

/**
 * Capture the booking header's Check out dropdown on a Reserved booking.
 *
 * Source of truth:
 * apps/webapp/app/components/booking/checkout-dropdown.tsx
 * (quick "Check out" while RESERVED + progressive "Scan to check out")
 *
 * Read-only: finds an existing Reserved booking in the demo workspace, opens
 * the dropdown, asserts both items, shoots a crop of the header, and closes
 * the menu with Escape. Nothing is checked out, created or submitted.
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
import { toWebP } from "../lib/convert.mjs";
import { upload } from "../lib/upload.mjs";

const BUCKET_PREFIX = "knowledgebase";
const EXPECTED_ITEMS = ["Check out", "Scan to check out"];

async function main() {
  const tmpDir = await mkdtemp(join(tmpdir(), "shelf-checkout-dropdown-"));
  let browser;
  try {
    browser = await launchBrowser();
    const ctx = await createContext(browser);
    const page = await ctx.newPage();
    page.setDefaultTimeout(60000);
    await loginToShelf(page);

    await navigateTo(page, "/bookings?status=RESERVED");
    await page.waitForTimeout(2500);
    const href = await page.evaluate(() =>
      Array.from(document.querySelectorAll('a[href^="/bookings/"]'))
        .map((a) => a.getAttribute("href"))
        .find((h) => /^\/bookings\/[a-z0-9]{20,}$/.test(h))
    );
    if (!href) throw new Error("No Reserved booking in the demo workspace");

    await navigateTo(page, href);
    await page.waitForTimeout(3000);

    const trigger = page
      .locator('button[aria-haspopup="menu"]')
      .filter({ hasText: /^\s*Check out\s*$/ });
    await trigger.first().waitFor({ state: "visible" });
    await trigger.first().click();

    const menu = page.locator('[role="menu"]');
    await menu.waitFor({ state: "visible" });
    await page.waitForTimeout(600);
    const items = await menu
      .locator('[role="menuitem"]')
      .evaluateAll((els) => els.map((e) => e.innerText.trim()));
    if (JSON.stringify(items) !== JSON.stringify(EXPECTED_ITEMS)) {
      throw new Error(`Unexpected menu items: ${JSON.stringify(items)}`);
    }

    const triggerBox = await trigger.first().boundingBox();
    const menuBox = await menu.boundingBox();
    const right = Math.max(triggerBox.x + triggerBox.width, menuBox.x + menuBox.width);
    const bottom = menuBox.y + menuBox.height;
    const clip = {
      x: Math.max(0, right - 440),
      y: 0,
      width: 440 + 16,
      height: bottom + 24,
    };
    const png = join(tmpDir, "progressive-checkout-dropdown.png");
    await page.screenshot({ path: png, clip });
    console.log(`  📸 ${png} (booking ${href})`);
    await page.keyboard.press("Escape");

    const url = await upload(
      toWebP(png),
      `${BUCKET_PREFIX}/progressive-checkout-dropdown.webp`
    );
    console.log(`  ✅ ${url}`);
    await ctx.close();
  } finally {
    if (browser) await browser.close();
    if (!process.env.KEEP_TMP) await rm(tmpDir, { recursive: true, force: true }).catch(() => {});
  }
}

main().catch((err) => {
  console.error("❌ Failed:", err);
  process.exit(1);
});
