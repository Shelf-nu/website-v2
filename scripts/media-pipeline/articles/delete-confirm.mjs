#!/usr/bin/env node
/** Capture for: deleting-items-in-shelf.mdx and delete-audits.mdx (shelf.nu#3173)
 * Shows: (1) the asset delete dialog with its consequence text and the
 * "To confirm, type <name>" field, Delete disabled; (2) the bulk delete
 * dialog for archived audits asking for the number selected.
 * Read-only: dialogs are opened, nothing is typed and nothing is submitted;
 * each dialog is closed with Escape. */
import { mkdtemp, rm } from "node:fs/promises";
import { join } from "node:path";
import { tmpdir } from "node:os";
import { launchBrowser, createContext, loginToShelf, navigateTo } from "../lib/browser.mjs";
import { screenshot } from "../lib/capture.mjs";
import { toWebP } from "../lib/convert.mjs";
import { upload } from "../lib/upload.mjs";

const BUCKET_PREFIX = "knowledgebase";
const ONLY = process.env.ONLY || "all";

async function main() {
  const tmpDir = await mkdtemp(join(tmpdir(), "shelf-delete-confirm-"));
  let browser;
  const out = {};
  try {
    browser = await launchBrowser();
    const ctx = await createContext(browser);
    const page = await ctx.newPage();
    page.setDefaultTimeout(60000);
    await loginToShelf(page);

    if (ONLY === "all" || ONLY === "asset") {
      await navigateTo(page, "/assets");
      const links = page.locator('table tbody tr a[href^="/assets/"]');
      const n = await links.count();
      let href = null;
      for (let i = 0; i < n; i++) {
        const t = (await links.nth(i).innerText()).trim();
        const h = await links.nth(i).getAttribute("href");
        if (t && !/^ZZ /.test(t) && /^\/assets\/[^/]+$/.test(h)) { href = h; break; }
      }
      if (!href) throw new Error("no asset row found");
      await navigateTo(page, href);
      await page.locator('[data-test-id="assetActionsButton"]').first().click();
      await page.waitForTimeout(900);
      const delBtn = page.locator('[data-test-id="deleteAssetButton"]').first();
      await delBtn.waitFor({ state: "visible" });
      if (await delBtn.isDisabled()) throw new Error("Delete disabled on " + href);
      await delBtn.click();
      const dlg = page.locator('[role="alertdialog"]').first();
      await dlg.waitFor({ state: "visible" });
      await page.waitForTimeout(800);
      const text = await dlg.innerText();
      if (!/To confirm, type/.test(text)) throw new Error("asset dialog has no type-to-confirm field: " + text);
      const del = dlg.getByRole("button", { name: /^Delete$/ });
      if (!(await del.isDisabled())) throw new Error("Delete is not disabled; refusing to capture");
      out.asset = await screenshot(page, join(tmpDir, "delete-asset-confirm.png"));
      await page.keyboard.press("Escape");
      await page.waitForTimeout(500);
    }

    if (ONLY === "all" || ONLY === "audit") {
      await navigateTo(page, "/audits?status=ARCHIVED");
      await page.waitForTimeout(1500);
      const boxes = page.locator("table tbody tr td:first-child");
      if ((await boxes.count()) < 2) throw new Error("fewer than 2 archived audits");
      await boxes.nth(0).click();
      await boxes.nth(1).click();
      await page.waitForTimeout(500);
      await page.locator('button:has-text("Actions")').first().click();
      await page.waitForTimeout(1000);
      await page.getByText("Delete", { exact: true }).first().click({ timeout: 15000 });
      await page.getByText(/Delete 2 audits/).first().waitFor({ state: "visible" });
      await page.waitForTimeout(800);
      const text = await page.locator("body").innerText();
      if (!/To confirm, type/.test(text)) throw new Error("audit dialog has no type-to-confirm field: " + text);
      out.audit = await screenshot(page, join(tmpDir, "delete-audits-2-count.png"));
      await page.keyboard.press("Escape");
    }
    await ctx.close();

    if (process.env.KEEP_DIR) {
      const { copyFile } = await import("node:fs/promises");
      for (const [k, f] of Object.entries(out)) await copyFile(f, join(process.env.KEEP_DIR, `${k}.png`));
      console.log("  kept in", process.env.KEEP_DIR);
      return;
    }
    if (out.asset) console.log(`  OK ${await upload(toWebP(out.asset), `${BUCKET_PREFIX}/delete-asset-confirm.webp`)}`);
    if (out.audit) console.log(`  OK ${await upload(toWebP(out.audit), `${BUCKET_PREFIX}/delete-audits-2-count.webp`)}`);
  } finally {
    if (browser) await browser.close();
    await rm(tmpDir, { recursive: true, force: true }).catch(() => {});
  }
}
main().catch((err) => { console.error("Failed:", err); process.exit(1); });
