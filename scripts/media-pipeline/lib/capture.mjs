import { mkdtemp } from "node:fs/promises";
import { join } from "node:path";
import { tmpdir } from "node:os";
import { launchBrowser, createContext, loginToShelf, VIEWPORT } from "./browser.mjs";

/**
 * Take a screenshot of the current page or a specific element.
 * @param {import('playwright').Page} page
 * @param {string} outputPath - Where to save the PNG
 * @param {object} [options]
 * @param {string} [options.selector] - CSS selector to screenshot a specific element
 * @param {boolean} [options.fullPage] - Capture full scrollable page
 */
export async function screenshot(page, outputPath, options = {}) {
  if (options.selector) {
    const el = await page.$(options.selector);
    if (el) {
      await el.screenshot({ path: outputPath });
      return outputPath;
    }
  }
  await page.screenshot({ path: outputPath, fullPage: options.fullPage || false });
  return outputPath;
}

/**
 * Record a short video clip by running actions in a fresh context with recordVideo.
 * @param {import('playwright').Browser} browser
 * @param {function(import('playwright').Page): Promise<void>} actionFn - Actions to perform during recording
 * @returns {Promise<string>} Path to the recorded .webm file
 */
export async function recordClip(browser, actionFn) {
  const tmpDir = await mkdtemp(join(tmpdir(), "shelf-clip-"));

  const context = await createContext(browser, {
    recordVideo: { dir: tmpDir, size: VIEWPORT },
  });

  const page = await context.newPage();
  page.setDefaultTimeout(60000);

  await loginToShelf(page);
  await actionFn(page);

  // Must close context to finalize the video file
  const videoPath = await page.video().path();
  await context.close();

  return videoPath;
}
