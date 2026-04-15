#!/usr/bin/env node

/**
 * PR B1 — Visual enhancements for solutions/equipment-check-in.mdx.
 * 4 screenshots, no video.
 *
 * Env:
 *   DRY_RUN=1   skip Supabase upload
 *   KEEP_TMP=1  keep tmp dir after run
 */

import { mkdtemp, rm, cp } from "node:fs/promises";
import { join } from "node:path";
import { tmpdir } from "node:os";
import { launchBrowser, createContext, loginToShelf, navigateTo } from "../lib/browser.mjs";
import { screenshot } from "../lib/capture.mjs";
import { toWebP } from "../lib/convert.mjs";
import { upload } from "../lib/upload.mjs";

const BUCKET_PREFIX = "solutions";
const DRY_RUN = !!process.env.DRY_RUN;
const KEEP_TMP = !!process.env.KEEP_TMP;

// IDs captured during recon (2026-04-15). If demo data shifts, re-recon.
const KIT_ID = "clx3baakg001qu5dlfmcgreqj"; // Basic Video Production Kit (10 assets + QR)
const ASSET_ID = "clxegs5z300592gmoqiem28qy"; // Nikon D3200 (rich custody history)

async function clickText(page, selector, text) {
  const ok = await page.evaluate(
    ({ sel, t }) => {
      const el = Array.from(document.querySelectorAll(sel)).find(
        (e) => (e.innerText || "").trim().toLowerCase().startsWith(t.toLowerCase())
      );
      if (!el) return false;
      el.click();
      return true;
    },
    { sel: selector, t: text }
  );
  return ok;
}

async function captureScreenshots(page, tmpDir, pngs) {
  const shots = [
    // Hero: the QR scanner page with the action dropdown open — shows
    // "View asset / Assign custody / Release custody / Update location",
    // which is literally the check-in / check-out UX.
    {
      name: "equipment-check-in-scanner",
      go: async () => {
        await navigateTo(page, "/scanner");
        const ok = await clickText(page, "button", "Action:");
        if (!ok) throw new Error("Scanner Action dropdown button not found");
        await page.waitForTimeout(1500);
      },
    },
    // Custody activity log — Nikon D3200 activity tab shows scans + custody
    // changes + reminders over time. Proves the "permanent, timestamped,
    // searchable custody chain" claim in the article.
    {
      name: "equipment-check-in-custody-log",
      go: async () => navigateTo(page, `/assets/${ASSET_ID}/activity`),
    },
    // Kit detail with kit-level QR code — one scan checks out all 10 items
    // together. Section: "Kit-Aware Check-Out".
    {
      name: "equipment-check-in-kit",
      go: async () => navigateTo(page, `/kits/${KIT_ID}/assets`),
    },
    // Locations hierarchy with parent/child counts, asset counts per site.
    // Section: "Multi-Location Support".
    {
      name: "equipment-check-in-locations",
      go: async () => navigateTo(page, "/locations"),
    },
  ];

  for (const shot of shots) {
    console.log(`  📸 ${shot.name}`);
    await shot.go();
    await page.waitForTimeout(1500);
    const pngPath = join(tmpDir, `${shot.name}.png`);
    await screenshot(page, pngPath);
    pngs[shot.name] = pngPath;
  }
}

async function main() {
  const tmpDir = await mkdtemp(join(tmpdir(), "shelf-eq-checkin-"));
  console.log(`Working in: ${tmpDir}`);
  console.log(`Dry run: ${DRY_RUN ? "YES (no uploads)" : "no — will upload"}`);

  const pngs = {};
  const urls = {};

  let browser;
  try {
    browser = await launchBrowser();
    const ctx = await createContext(browser);
    const page = await ctx.newPage();
    page.setDefaultTimeout(60000);
    await loginToShelf(page);

    console.log("\n📸 Capturing screenshots...");
    await captureScreenshots(page, tmpDir, pngs);
    await ctx.close();

    console.log("\n🔄 Converting → WebP...");
    const webps = {};
    for (const [name, pngPath] of Object.entries(pngs)) {
      webps[name] = toWebP(pngPath);
    }

    if (DRY_RUN) {
      const reviewDir = join(tmpdir(), "eq-checkin-review");
      await rm(reviewDir, { recursive: true, force: true }).catch(() => {});
      await cp(tmpDir, reviewDir, { recursive: true });
      console.log(`\n🔍 DRY RUN — assets in ${reviewDir}`);
    } else {
      console.log("\n☁️  Uploading...");
      for (const [name, webpPath] of Object.entries(webps)) {
        urls[name] = await upload(webpPath, `${BUCKET_PREFIX}/${name}.webp`);
        console.log(`  ✅ ${name}.webp`);
      }

      console.log("\n" + "=".repeat(60));
      console.log(`COMPLETE: ${Object.keys(urls).length} assets uploaded`);
      console.log("=".repeat(60));
      for (const [name, url] of Object.entries(urls)) {
        console.log(`  ${name}: ${url}`);
      }
    }
  } finally {
    if (browser) await browser.close();
    if (!KEEP_TMP && !DRY_RUN) {
      await rm(tmpDir, { recursive: true, force: true }).catch(() => {});
    } else {
      console.log(`\n(tmp dir preserved: ${tmpDir})`);
    }
  }
}

main().catch((err) => { console.error("❌ Failed:", err); process.exit(1); });
