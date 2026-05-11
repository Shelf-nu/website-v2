#!/usr/bin/env node

/**
 * Asserts every marketing route either wraps its content in <PagefindWrapper>
 * or is explicitly excluded. Catches the silent-omission bug where a new page
 * ships without being indexed by Pagefind.
 *
 * Background: Pagefind operates in site-wide selective mode once any page on
 * the site uses `data-pagefind-body` — pages without it are skipped from the
 * index entirely. The page-count verifier (`verify-pagefind.mjs`) only counts
 * total pages, so losing a few still passes. This script asserts *route-level*
 * coverage instead.
 *
 * Usage: node scripts/verify-search-coverage.mjs
 *        Exits 1 with a diff if any route is missing coverage.
 */

import { readdirSync, readFileSync, statSync } from "fs";
import { dirname, join, relative, resolve } from "path";
import { fileURLToPath } from "url";

const __dirname = dirname(fileURLToPath(import.meta.url));
const root = resolve(__dirname, "..");
const marketingDir = join(root, "src/app/(marketing)");

// Routes intentionally excluded from on-site search.
// Add an entry here with a reason if you are sure the page should not appear
// in search results — e.g. internal references, redirects, or noindex pages.
const EXCLUDED_ROUTES = new Set([
    "/design-system", // Internal UI reference, noindex
    "/product",       // Redirect to /features, not a real page
]);

function listPageFiles(dir) {
    const out = [];
    for (const entry of readdirSync(dir)) {
        const full = join(dir, entry);
        const s = statSync(full);
        if (s.isDirectory()) out.push(...listPageFiles(full));
        else if (entry === "page.tsx") out.push(full);
    }
    return out;
}

function routeFromPath(absPath) {
    const rel = relative(marketingDir, absPath).replace(/\/page\.tsx$/, "");
    if (rel === "page.tsx") return "/";
    return "/" + rel;
}

function hasPagefindWrapper(absPath) {
    const src = readFileSync(absPath, "utf8");
    // Require an actual opening JSX tag, not just an import or comment mention.
    // Without the `<`, a page that imports PagefindWrapper but never renders
    // it would pass the gate and ship unindexed.
    return /<\s*PagefindWrapper\b/.test(src);
}

const pages = listPageFiles(marketingDir);
const missing = [];

for (const p of pages) {
    const route = routeFromPath(p);
    // Dynamic [slug]/[term]/[vendor] routes are handled by their slug page.tsx,
    // which we already check directly.
    if (EXCLUDED_ROUTES.has(route)) continue;
    if (!hasPagefindWrapper(p)) missing.push({ route, file: relative(root, p) });
}

if (missing.length > 0) {
    console.error("❌ Pagefind coverage check failed.");
    console.error("");
    console.error("These routes do not wrap content in <PagefindWrapper> and are not in EXCLUDED_ROUTES:");
    for (const { route, file } of missing) {
        console.error(`   ${route.padEnd(40)} ${file}`);
    }
    console.error("");
    console.error("Fix: wrap the page's body in <PagefindWrapper type=\"...\" title=\"...\" keywords=\"...\">,");
    console.error("     OR add the route to EXCLUDED_ROUTES in scripts/verify-search-coverage.mjs with a reason.");
    process.exit(1);
}

console.log(`✅ Pagefind coverage OK — ${pages.length - EXCLUDED_ROUTES.size} routes wrapped, ${EXCLUDED_ROUTES.size} explicitly excluded.`);
