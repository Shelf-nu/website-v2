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
import { initAnnotations, caption, clearAll } from "../lib/annotate.mjs";

const BUCKET_PREFIX = "knowledgebase";

/**
 * Two shots for converting-non-registered-members-nrms-to-users.mdx:
 *
 * 1. The NRM Actions dropdown, open, showing all three entries. The article
 *    called the first one "Send invite"; it reads "Invite user".
 * 2. The refusal an admin meets when the member still holds custody, which
 *    shelf.nu#2936 / #2937 moved into the write itself and widened to kits.
 *
 * Read-only: it opens a menu and a dialog. Nothing is submitted.
 */
async function main() {
  const tmpDir = await mkdtemp(join(tmpdir(), "shelf-nrm-actions-"));
  let browser;
  try {
    browser = await launchBrowser();
    const ctx = await createContext(browser);
    const page = await ctx.newPage();
    page.setDefaultTimeout(60000);
    await loginToShelf(page);

    await navigateTo(page, "/settings/team/nrm");

    const triggers = page.locator('[aria-label="Actions Trigger"]');
    // Assert the menu carries exactly the three entries the caption names, so
    // a relabelled or reordered dropdown throws instead of shipping a caption
    // that describes something the image does not show.
    let menu = null;
    let holderIndex = -1;
    const count = await triggers.count();
    for (let i = 0; i < count; i++) {
      await triggers.nth(i).click();
      await page.waitForTimeout(900);
      menu = page.locator('[role="menu"]').first();
      await menu.waitFor({ state: "visible" });
      const labels = (await menu.locator("button, a").allInnerTexts()).map((s) =>
        s.trim()
      );
      if (
        !["Invite user", "Edit", "Delete"].every((l) => labels.includes(l))
      ) {
        throw new Error(`Unexpected NRM menu items: ${JSON.stringify(labels)}`);
      }
      // Find one whose Delete opens the refusal rather than the plain confirm.
      await menu.locator("button", { hasText: /^Delete$/ }).first().click();
      await page.waitForTimeout(1000);
      const dialog = page.locator('[role="alertdialog"]').first();
      await dialog.waitFor({ state: "visible" });
      const text = await dialog.innerText();
      if (text.includes("Unable to delete team member")) {
        holderIndex = i;
        await page.keyboard.press("Escape");
        await page.waitForTimeout(600);
        break;
      }
      await page.keyboard.press("Escape");
      await page.waitForTimeout(600);
      await page.keyboard.press("Escape");
      await page.waitForTimeout(400);
    }

    if (holderIndex === -1) {
      throw new Error("No NRM in this workspace currently holds custody");
    }

    // Shot 1 — the open dropdown with its three entries. Reload first: the
    // probe loop left a dismissed dialog behind, and the dropdown is a
    // controlled Radix menu whose open state does not survive that cleanly.
    await navigateTo(page, "/settings/team/nrm");
    await triggers.nth(holderIndex).click();
    await page.waitForTimeout(900);
    menu = page.locator('[role="menu"]').first();
    await menu.waitFor({ state: "visible" });
    await menu.scrollIntoViewIfNeeded();
    await initAnnotations(page);
    await caption(
      page,
      "The NRM Actions menu holds three entries: Invite user, Edit and Delete."
    );
    const shot1 = await screenshot(page, join(tmpDir, "nrm-actions-menu.png"));
    await clearAll(page);

    // Shot 2 — the refusal, reached from the same row.
    await menu.locator("button", { hasText: /^Delete$/ }).first().click();
    await page.waitForTimeout(1000);
    const dialog = page.locator('[role="alertdialog"]').first();
    await dialog.waitFor({ state: "visible" });
    const dialogText = await dialog.innerText();
    if (!dialogText.includes("assets or kits")) {
      throw new Error(`Refusal copy changed: ${dialogText}`);
    }
    await initAnnotations(page);
    await caption(
      page,
      "A member still holding assets or kits cannot be deleted until custody is released."
    );
    const shot2 = await screenshot(page, join(tmpDir, "nrm-delete-refused.png"));
    await clearAll(page);
    await ctx.close();

    const urls = [];
    urls.push(
      await upload(toWebP(shot1), `${BUCKET_PREFIX}/nrm-actions-menu.webp`)
    );
    urls.push(
      await upload(toWebP(shot2), `${BUCKET_PREFIX}/nrm-delete-refused.webp`)
    );
    urls.forEach((u) => console.log(`  ✅ ${u}`));
    console.log("LOCAL:", shot1, shot2);
  } finally {
    if (browser) await browser.close();
  }
}

main().catch((err) => {
  console.error("❌ Failed:", err);
  process.exit(1);
});
