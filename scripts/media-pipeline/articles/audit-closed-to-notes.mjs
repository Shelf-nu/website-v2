#!/usr/bin/env node
/**
 * Capture a finished audit's Activity tab, where the note box is replaced by
 * the closed-record message, for content/knowledge-base/run-your-first-audit.mdx.
 *
 * Source of truth (shelf.nu#3038):
 *   apps/webapp/app/modules/audit/comment-policy.ts (AUDIT_CLOSED_TO_COMMENTS_MESSAGE)
 *   apps/webapp/app/components/audit/notes/index.tsx (renders it instead of NewNote)
 *
 * Read-only: navigates and screenshots. Submits nothing.
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
const MESSAGE = "This audit is finished and no longer accepts notes.";
/** A completed audit in the demo workspace (also used by audit-findings.mjs). */
const AUDIT = "cmszyaj4j004oqbi56s9jgc4h";

async function main() {
  const tmpDir = await mkdtemp(join(tmpdir(), "shelf-auditclosed-"));
  const browser = await launchBrowser();
  try {
    const context = await createContext(browser);
    const page = await context.newPage();
    page.setDefaultTimeout(60000);
    await loginToShelf(page);

    await navigateTo(page, `/audits/${AUDIT}/activity`);
    await page.waitForTimeout(3000);

    const msg = page.getByText(MESSAGE, { exact: true }).first();
    await msg.waitFor({ state: "visible" });
    if ((await page.locator("textarea").count()) > 0) {
      throw new Error("a note textarea is still on the page");
    }
    const status = await page.locator("body").innerText();
    if (!/completed|cancelled|archived/i.test(status)) {
      throw new Error("no finished status visible on the page");
    }
    console.log("closed-to-notes message OK, no note box");

    await msg.scrollIntoViewIfNeeded();
    await page.waitForTimeout(600);
    await initAnnotations(page);
    await highlight(page, `text:${MESSAGE}`, { spotlight: true, padding: 10 });
    await caption(page, "A completed audit is a closed record: its Activity tab no longer offers a note box.");
    const shot = await screenshot(page, join(tmpDir, "audit-closed-to-notes.png"));
    await clearAll(page);
    await context.close();

    if (process.env.NO_UPLOAD) { console.log(`LOCAL ${shot}`); return; }
    const webp = toWebP(shot);
    const url = await upload(webp, `${BUCKET_PREFIX}/audit-closed-to-notes.webp`);
    console.log(`  ✅ ${url}`);
  } finally {
    await browser.close();
    if (!process.env.NO_UPLOAD) await rm(tmpDir, { recursive: true, force: true }).catch(() => {});
  }
}
main().catch((err) => { console.error("❌ Failed:", err); process.exit(1); });
