/**
 * Report a problem (shelf.nu#3434): the asset page's Actions menu and the dialog.
 *
 * Read-only: opens the menu and the dialog, asserts their text, shoots the
 * dialog and closes it with Cancel. Nothing is sent, so nobody is emailed.
 *
 * OUT_DIR=<dir> keeps the PNG there for a look before uploading.
 * UPLOAD=1 converts to WebP and uploads it.
 */
import { mkdtemp, rm, copyFile } from "node:fs/promises";
import { join } from "node:path";
import { tmpdir } from "node:os";
import { launchBrowser, createContext, loginToShelf, navigateTo } from "../lib/browser.mjs";
import { screenshot } from "../lib/capture.mjs";
import { toWebP } from "../lib/convert.mjs";
import { upload } from "../lib/upload.mjs";

const BUCKET_PREFIX = "knowledgebase";
const RESERVED = new Set(["new", "import", "import-update", "advanced"]);

async function main() {
  const tmpDir = await mkdtemp(join(tmpdir(), "shelf-report-a-problem-"));
  let browser;
  try {
    browser = await launchBrowser();
    const ctx = await createContext(browser);
    const page = await ctx.newPage();
    page.setDefaultTimeout(60000);
    await loginToShelf(page);

    await navigateTo(page, "/assets");
    await page.waitForSelector('a[href^="/assets/"]');
    const href = await page.evaluate((reserved) => {
      const links = Array.from(document.querySelectorAll('a[href^="/assets/"]'));
      // Skip the demo workspace's own test rows so the shot shows real gear.
      const hit = links
        .filter((a) => !/\b(zz|test|qa)\b/i.test(a.closest("tr")?.innerText ?? a.innerText))
        .map((a) => (a.getAttribute("href") ?? "").split("?")[0].split("/")[2] ?? "")
        .find((id) => id.length > 6 && !reserved.includes(id));
      return hit ?? null;
    }, [...RESERVED]);
    if (!href) throw new Error("no asset link found on /assets");

    await navigateTo(page, `/assets/${href}/overview`);
    const actions = page.getByRole("button", { name: /Actions/ }).first();
    await actions.waitFor({ state: "visible" });
    await page.waitForTimeout(1500);
    await actions.click();

    // The menu is a Radix popper without role="menu" on the wrapper.
    const menu = page.locator("[data-radix-popper-content-wrapper]").first();
    await menu.waitFor({ state: "visible" });
    const item = menu.getByText("Report a problem", { exact: true });
    await item.waitFor({ state: "visible", timeout: 15000 });
    console.log("menu item visible: Report a problem");
    console.log("menu:", JSON.stringify((await menu.innerText()).split("\n")));
    await item.click();

    const dialog = page.getByRole("alertdialog");
    await dialog.waitFor({ state: "visible" });
    const text = await dialog.innerText();
    console.log("dialog text:", JSON.stringify(text));
    for (const expected of [
      "Report a problem",
      "owners, administrators and managers",
      "What is wrong?",
      "Cancel",
      "Send",
    ]) {
      if (!text.includes(expected)) throw new Error(`dialog is missing "${expected}"`);
    }
    const placeholder = await dialog.locator("textarea").getAttribute("placeholder");
    console.log("placeholder:", placeholder);

    await dialog.evaluate((el) => el.setAttribute("data-shot", "report-a-problem"));
    await page.waitForTimeout(600);
    const shot = await screenshot(page, join(tmpDir, "report-a-problem-dialog.png"), {
      selector: '[data-shot="report-a-problem"]',
    });
    if (process.env.OUT_DIR) {
      await copyFile(shot, join(process.env.OUT_DIR, "report-a-problem-dialog.png"));
    }

    await dialog.getByRole("button", { name: "Cancel" }).click();
    await dialog.waitFor({ state: "hidden" });
    await ctx.close();

    if (process.env.UPLOAD === "1") {
      const webp = toWebP(shot);
      const url = await upload(webp, `${BUCKET_PREFIX}/report-a-problem-dialog.webp`);
      console.log(`  ✅ ${url}`);
    }
  } finally {
    if (browser) await browser.close();
    await rm(tmpDir, { recursive: true, force: true }).catch(() => {});
  }
}

main().catch((err) => {
  console.error("❌ Failed:", err);
  process.exit(1);
});
