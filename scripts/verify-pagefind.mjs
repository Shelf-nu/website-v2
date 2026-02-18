#!/usr/bin/env node

/**
 * verify-pagefind.mjs
 * -------------------
 * Post-build assertion: ensures the Pagefind index was generated correctly.
 *
 * Checks:
 *  1. pagefind-entry.json exists in the output directory
 *  2. The JSON is parseable and contains a valid structure
 *  3. The total indexed page count meets the minimum threshold
 *
 * Threshold justification:
 *  - Current indexed pages: 194 (as of Feb 2026)
 *  - Content only grows; deletions are rare
 *  - 150 is ~77% of current count — catches catastrophic breakage
 *    (e.g. Next.js changes .next/server/app/ path) while allowing
 *    some content churn without false positives
 *
 * Exit code 1 on failure → breaks `npm run build` in CI.
 *
 * Usage:
 *   node scripts/verify-pagefind.mjs [output-dir]
 *   Defaults to public/pagefind if no argument is given.
 */

import { readFileSync, existsSync } from "node:fs";
import { resolve, join } from "node:path";

const MIN_INDEXED_PAGES = 150;

const outputDir = process.argv[2] || "public/pagefind";
const entryPath = resolve(process.cwd(), join(outputDir, "pagefind-entry.json"));

/* ── 1. File existence ─────────────────────────────────────── */

if (!existsSync(entryPath)) {
    console.error(
        `\n❌  Pagefind verification FAILED\n` +
        `   pagefind-entry.json not found at: ${entryPath}\n` +
        `   This usually means Pagefind found no HTML files to index.\n` +
        `   Check that the --site directory contains .html files.\n`,
    );
    process.exit(1);
}

/* ── 2. Parse and validate structure ───────────────────────── */

let entry;
try {
    entry = JSON.parse(readFileSync(entryPath, "utf-8"));
} catch (err) {
    console.error(
        `\n❌  Pagefind verification FAILED\n` +
        `   Could not parse ${entryPath}: ${err.message}\n`,
    );
    process.exit(1);
}

if (!entry.languages || typeof entry.languages !== "object") {
    console.error(
        `\n❌  Pagefind verification FAILED\n` +
        `   pagefind-entry.json has no "languages" object.\n` +
        `   File contents: ${JSON.stringify(entry).slice(0, 200)}\n`,
    );
    process.exit(1);
}

/* ── 3. Count indexed pages across all languages ───────────── */

let totalPages = 0;
for (const [lang, meta] of Object.entries(entry.languages)) {
    const count = meta?.page_count ?? 0;
    totalPages += count;
    console.log(`   Pagefind: language "${lang}" → ${count} pages`);
}

console.log(`   Pagefind: total indexed pages = ${totalPages}`);

if (totalPages < MIN_INDEXED_PAGES) {
    console.error(
        `\n❌  Pagefind verification FAILED\n` +
        `   Indexed ${totalPages} pages, but minimum threshold is ${MIN_INDEXED_PAGES}.\n` +
        `   This likely means Pagefind's --site directory is wrong or empty.\n` +
        `   If content was intentionally removed, lower MIN_INDEXED_PAGES in\n` +
        `   scripts/verify-pagefind.mjs.\n`,
    );
    process.exit(1);
}

/* ── Done ──────────────────────────────────────────────────── */

console.log(`\n✅  Pagefind verification passed (${totalPages} pages ≥ ${MIN_INDEXED_PAGES} minimum)\n`);
