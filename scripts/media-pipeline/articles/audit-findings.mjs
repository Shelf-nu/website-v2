#!/usr/bin/env node
/**
 * Capture the audit Findings section and the per-row evidence chip, for
 * content/features/audits.mdx and content/knowledge-base/run-your-first-audit.mdx.
 *
 * Source of truth:
 *   apps/webapp/app/routes/_layout+/audits.$auditId.overview.tsx ("Findings",
 *     "About this audit", "Nothing was recorded during this audit")
 *   apps/webapp/app/components/audit/audit-asset-list-item.tsx (the chip, whose
 *     aria-label reads "<n> notes, <n> photos on <Asset>")
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
import { initAnnotations, highlight, caption, clearAll } from "../lib/annotate.mjs";

const BUCKET_PREFIX = "features";
/** Carries a completion note, closing photos, and three assets with evidence. */
const AUDIT = "cmszyaj4j004oqbi56s9jgc4h";

async function main() {
  const tmpDir = await mkdtemp(join(tmpdir(), "shelf-auditfindings-"));
  console.log(`Working in: ${tmpDir}`);
  const browser = await launchBrowser();
  const urls = {};
  try {
    const context = await createContext(browser);
    const page = await context.newPage();
    page.setDefaultTimeout(60000);
    await loginToShelf(page);

    await navigateTo(page, `/audits/${AUDIT}/overview`);
    await page.waitForTimeout(3000);

    // Assert every claim the captions make is actually on screen, so selector
    // drift throws instead of publishing an image that contradicts its caption.
    await page.locator('text="Findings"').first().waitFor({ state: "visible" });
    await page
      .locator('text="About this audit"')
      .first()
      .waitFor({ state: "visible" });

    const chip = page.locator('a[href*="/scan/"][href$="/details"]').first();
    await chip.waitFor({ state: "visible" });
    const chipLabel = await chip.getAttribute("aria-label");
    if (!/\d+\s+(note|photo)/.test(chipLabel || "")) {
      throw new Error(`chip label is not an evidence count: ${chipLabel}`);
    }
    console.log(`chip OK: ${chipLabel}`);

    // Shot 1 — the Findings column: the audit-wide block, then one card per asset.
    await page.locator('text="Findings"').first().scrollIntoViewIfNeeded();
    await page.waitForTimeout(600);
    await initAnnotations(page);
    await highlight(page, "text:Findings", { spotlight: true, padding: 10 });
    await caption(
      page,
      "Findings collects the notes and photos people recorded, grouped by the asset they were recorded against."
    );
    const shot1 = await screenshot(page, join(tmpDir, "audit-findings.png"));
    await clearAll(page);

    // Shot 2 — the evidence chip on an asset row.
    await chip.scrollIntoViewIfNeeded();
    await page.waitForTimeout(600);
    await initAnnotations(page);
    await highlight(page, 'a[href*="/scan/"][href$="/details"]', {
      spotlight: true,
      padding: 8,
    });
    await caption(
      page,
      `A chip on the row counts what was recorded against that asset, and opens it: ${chipLabel}`
    );
    const shot2 = await screenshot(page, join(tmpDir, "audit-evidence-chip.png"));
    await clearAll(page);

    // Shot 3 — one asset's card inside Findings: the note and the photo together.
    const card = page.locator('text="Arri Fresnel 650 Plus"').nth(0);
    await card.scrollIntoViewIfNeeded();
    await page.mouse.wheel(0, -120);
    await page.waitForTimeout(800);
    await initAnnotations(page);
    await caption(
      page,
      "Each asset somebody recorded something about gets its own card, with the notes and the photographs together."
    );
    const shot3 = await screenshot(page, join(tmpDir, "audit-findings-asset.png"));
    await clearAll(page);
    await context.close();

    urls.findings = await upload(
      toWebP(shot1),
      `${BUCKET_PREFIX}/audit-findings.webp`
    );
    urls.chip = await upload(
      toWebP(shot2),
      `${BUCKET_PREFIX}/audit-evidence-chip.webp`
    );
    urls.card = await upload(
      toWebP(shot3),
      `${BUCKET_PREFIX}/audit-findings-asset.webp`
    );
    Object.values(urls).forEach((u) => console.log(`  ✅ ${u}`));
  } finally {
    await browser.close();
    await rm(tmpDir, { recursive: true, force: true }).catch(() => {});
  }
}
main().catch((err) => {
  console.error("❌ Failed:", err);
  process.exit(1);
});
