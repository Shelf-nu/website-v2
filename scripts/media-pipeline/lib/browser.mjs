import { getShelfCredentials } from "./env.mjs";

// Use Playwright from shelf-main where browsers are already installed
import { createRequire } from "node:module";
const require = createRequire("/Users/macwhale/Documents/shelf-main/package.json");
const { chromium } = require("playwright");

const VIEWPORT = { width: 1440, height: 900 };
const APP_URL = "https://app.shelf.nu";

export async function launchBrowser() {
  const browser = await chromium.launch({ headless: true });
  return browser;
}

export async function createContext(browser, options = {}) {
  const contextOptions = { viewport: VIEWPORT, ...options };
  return browser.newContext(contextOptions);
}

export async function loginToShelf(page) {
  const { email, password } = getShelfCredentials();

  await page.goto(`${APP_URL}/login`, {
    waitUntil: "domcontentloaded",
    timeout: 60000,
  });
  await page.waitForTimeout(2000);

  await page.fill('input[name="email"], input[type="email"]', email);
  await page.fill('input[name="password"], input[type="password"]', password);
  await page.click('button[type="submit"]');

  // Wait for redirect away from login
  await page.waitForURL((url) => !url.pathname.includes("/login"), {
    timeout: 30000,
  });
  await page.waitForTimeout(2000);
}

export async function navigateTo(page, path) {
  await page.goto(`${APP_URL}${path}`, {
    waitUntil: "domcontentloaded",
    timeout: 60000,
  });
  await page.waitForTimeout(2500);
}

export { VIEWPORT, APP_URL };
