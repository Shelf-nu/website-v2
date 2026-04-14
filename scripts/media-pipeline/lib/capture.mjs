import { mkdtemp } from "node:fs/promises";
import { join } from "node:path";
import { tmpdir } from "node:os";
import { launchBrowser, createContext, loginToShelf, VIEWPORT } from "./browser.mjs";

/**
 * Take a screenshot of the current page or a specific element.
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
 * Record a short video clip. Login happens OFF-camera by saving browser
 * state from a non-recording context, then replaying it into the recording
 * context so the video starts on the first real page, not the login screen.
 */
export async function recordClip(browser, actionFn) {
  const tmpDir = await mkdtemp(join(tmpdir(), "shelf-clip-"));

  // Step 1: Login in a throwaway context and capture cookies
  const authContext = await createContext(browser);
  let storageState;
  try {
    const authPage = await authContext.newPage();
    authPage.setDefaultTimeout(60000);
    await loginToShelf(authPage);
    storageState = await authContext.storageState();
  } finally {
    await authContext.close();
  }

  // Step 2: Create recording context with auth cookies pre-loaded (no login on camera)
  const context = await createContext(browser, {
    recordVideo: { dir: tmpDir, size: VIEWPORT },
    storageState,
  });

  const page = await context.newPage();
  page.setDefaultTimeout(60000);

  await actionFn(page);

  // Must close context to finalize the video file
  const videoPath = await page.video().path();
  await context.close();

  return videoPath;
}
