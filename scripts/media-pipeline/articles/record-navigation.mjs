import { mkdtemp, rm } from "node:fs/promises";
import { join } from "node:path";
import { tmpdir } from "node:os";
import { launchBrowser, createContext, loginToShelf, navigateTo } from "../lib/browser.mjs";
import { screenshot } from "../lib/capture.mjs";
import { toWebP } from "../lib/convert.mjs";
import { upload } from "../lib/upload.mjs";
import { initAnnotations, highlight, callout, clearAll } from "../lib/annotate.mjs";

// shelf.nu #3212: previous and next arrows on a record opened from its list.
const BUCKET_PREFIX = "updates";

async function main() {
  const tmpDir = await mkdtemp(join(tmpdir(), "shelf-record-navigation-"));
  let browser;
  try {
    browser = await launchBrowser();
    const ctx = await createContext(browser);
    const page = await ctx.newPage();
    page.setDefaultTimeout(60000);
    await loginToShelf(page);

    // Open an asset from the list, so the page carries the list context.
    await navigateTo(page, "/assets");
    const rowLink = page.locator('a[href*="/assets/"][href$="/overview"]').first();
    await rowLink.waitFor();
    const firstHref = await rowLink.getAttribute("href");
    // The next asset of the list is the second distinct asset the list links to.
    const rowHrefs = await page
      .locator('a[href*="/assets/"][href$="/overview"]')
      .evaluateAll((links) => [...new Set(links.map((a) => new URL(a.href).pathname))]);
    const expectedNext = rowHrefs[1];
    if (!expectedNext) throw new Error("the list needs at least two assets");
    await rowLink.click();
    await page.waitForURL((u) => u.pathname.endsWith("/overview"));
    const next = page.locator('button[aria-label="Next in list"]:visible');
    await next.waitFor();
    // The header renders twice (narrow and wide layouts); tag the visible one.
    await page.waitForFunction(
      () => [...document.querySelectorAll('button[aria-label="Next in list"]')].some(
        (b) => b.offsetParent !== null && !b.disabled
      ),
      null,
      { timeout: 20000 }
    );
    await page.evaluate(() => {
      const b = [...document.querySelectorAll('button[aria-label="Next in list"]')].find((x) => x.offsetParent !== null);
      b.parentElement.setAttribute("data-shot", "record-nav");
    });
    console.log("opened", firstHref, "next enabled");

    await initAnnotations(page);
    await highlight(page, '[data-shot="record-nav"]', { spotlight: true, padding: 6 });
    await callout(page, '[data-shot="record-nav"]', "Step to the previous or next asset in the list, or press [ and ]", { label: "New", side: "bottom" });
    const shot = await screenshot(page, join(tmpDir, "record-navigation-arrows.png"));
    await clearAll(page);

    // Prove the key works: ] opens the next asset of the same list.
    const before = page.url();
    await page.keyboard.press("]");
    await page.waitForURL((u) => u.pathname === expectedNext, { timeout: 20000 });
    console.log("] moved", before, "->", page.url(), "(expected", expectedNext + ")");

    // A direct link has no list context: both arrows are disabled.
    const direct = new URL(page.url()).pathname;
    const page2 = await ctx.newPage();
    await navigateTo(page2, direct);
    await page2.locator('button[aria-label="Next in list"]:visible').waitFor();
    await page2.waitForTimeout(4000);
    console.log("fresh tab next disabled:", await page2.locator('button[aria-label="Next in list"]:visible').isDisabled());
    await page.reload({ waitUntil: "domcontentloaded" });
    await page.waitForTimeout(5000);
    await page.locator('button[aria-label="Next in list"]:visible').waitFor();
    const disabled = await page.locator('button[aria-label="Next in list"]:visible').isDisabled();
    console.log("direct link next disabled:", disabled);

    await ctx.close();
    const webp = toWebP(shot);
    console.log(`  ✅ ${await upload(webp, `${BUCKET_PREFIX}/record-navigation-arrows.webp`)}`);
    console.log("local", webp);
  } finally {
    if (browser) await browser.close();
  }
}
main().catch((err) => { console.error("❌ Failed:", err); process.exit(1); });
