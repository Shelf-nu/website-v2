#!/usr/bin/env node
/**
 * Capture the Team page header for:
 * content/knowledge-base/transfer-workspace-ownership.mdx
 *
 * Source of truth for the UI:
 * apps/webapp/app/components/settings/transfer-ownership-button.tsx and
 * apps/webapp/app/routes/_layout+/settings.team.users.tsx - the button renders
 * next to "Import Users" / "Invite a user" as a page-level action.
 *
 * Read-only: navigates and shoots. Nothing is created, submitted or deleted.
 */
import { mkdtemp, rm } from "node:fs/promises";
import { join } from "node:path";
import { tmpdir } from "node:os";
import { launchBrowser, createContext, loginToShelf, navigateTo } from "../lib/browser.mjs";
import { screenshot } from "../lib/capture.mjs";
import { toWebP } from "../lib/convert.mjs";
import { upload } from "../lib/upload.mjs";
import { initAnnotations, highlight, caption, clearAll } from "../lib/annotate.mjs";

const BUCKET_PREFIX = "knowledgebase";

async function main() {
  const tmpDir = await mkdtemp(join(tmpdir(), "shelf-transfer-header-"));
  const browser = await launchBrowser();
  try {
    const ctx = await createContext(browser);
    const page = await ctx.newPage();
    page.setDefaultTimeout(60000);
    await loginToShelf(page);

    await navigateTo(page, "/settings/team/users");

    // Assert the shipped placement before shooting, so selector drift throws
    // instead of publishing a caption the image does not show.
    const btn = page.locator('text="Transfer ownership"').first();
    await btn.waitFor({ state: "visible", timeout: 30000 });
    await page.locator('text="Invite a user"').first().waitFor({ state: "visible" });
    const inRow = await btn.evaluate((el) => !!el.closest("tr"));
    if (inRow) throw new Error("Transfer ownership is still inside a table row");

    await initAnnotations(page);
    await highlight(page, 'text:Transfer ownership', { spotlight: true, padding: 8 });
    await caption(page, "Transfer ownership sits in the Team page header, next to Import Users and Invite a user");
    const shot = await screenshot(page, join(tmpDir, "transfer-ownership-team-header.png"));
    await clearAll(page);
    await ctx.close();

    const url = await upload(toWebP(shot), `${BUCKET_PREFIX}/transfer-ownership-team-header.webp`);
    console.log(`  OK ${url}`);
  } finally {
    await browser.close();
    await rm(tmpDir, { recursive: true, force: true }).catch(() => {});
  }
}
main().catch((err) => { console.error("Failed:", err); process.exit(1); });
