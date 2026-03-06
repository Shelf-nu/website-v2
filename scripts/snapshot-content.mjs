#!/usr/bin/env node

/**
 * Content Snapshot — runs after `next build` to detect title/meta changes.
 *
 * 1. Scans all HTML files in `out/`
 * 2. Extracts <title> and <meta name="description"> from each page
 * 3. Compares against the latest snapshot stored in Supabase
 * 4. Logs any changes to the `content_changelog` table
 *
 * This lets you ask Claude: "Did our title change affect traffic?" and get
 * a before/after comparison with Cloudflare data.
 *
 * Usage:
 *   SUPABASE_URL=... SUPABASE_SERVICE_KEY=... node scripts/snapshot-content.mjs
 *
 * Requires:
 *   - `out/` directory from a `next build`
 *   - SUPABASE_URL + SUPABASE_SERVICE_KEY env vars
 */

import fs from "fs";
import path from "path";
import { config } from "dotenv";
import { dirname, resolve } from "path";
import { fileURLToPath } from "url";
const __dirname = dirname(fileURLToPath(import.meta.url));
const root = resolve(__dirname, "..");
config({ path: resolve(root, ".env.local") });
config({ path: resolve(root, ".env") }); // fallback

const OUT_DIR = "out";
const SUPABASE_URL = process.env.SUPABASE_URL;
const SUPABASE_SERVICE_KEY = process.env.SUPABASE_SERVICE_KEY;

if (!SUPABASE_URL || !SUPABASE_SERVICE_KEY) {
    console.log("⚠️  SUPABASE_URL and SUPABASE_SERVICE_KEY required. Skipping content snapshot.");
    process.exit(0);
}

/* ------------------------------------------------------------------ */
/*  Scan HTML files                                                    */
/* ------------------------------------------------------------------ */

function walkDir(dir, ext) {
    const results = [];
    for (const entry of fs.readdirSync(dir, { withFileTypes: true })) {
        const full = path.join(dir, entry.name);
        if (entry.isDirectory()) results.push(...walkDir(full, ext));
        else if (entry.name.endsWith(ext)) results.push(full);
    }
    return results;
}

function extractMeta(html) {
    const titleMatch = html.match(/<title[^>]*>([^<]*)<\/title>/i);
    const descMatch = html.match(/<meta\s+name=["']description["']\s+content=["']([^"']*)["']/i)
        || html.match(/<meta\s+content=["']([^"']*)["']\s+name=["']description["']/i);

    return {
        title: titleMatch?.[1]?.trim() || "",
        description: descMatch?.[1]?.trim() || "",
    };
}

function fileToPath(file) {
    // out/pricing/index.html → /pricing
    // out/index.html → /
    let p = file
        .replace(OUT_DIR, "")
        .replace(/\/index\.html$/, "")
        .replace(/\.html$/, "");
    return p || "/";
}

/* ------------------------------------------------------------------ */
/*  Supabase helpers                                                   */
/* ------------------------------------------------------------------ */

async function supabaseFetch(endpoint, options = {}) {
    const res = await fetch(`${SUPABASE_URL}/rest/v1/${endpoint}`, {
        headers: {
            apikey: SUPABASE_SERVICE_KEY,
            Authorization: `Bearer ${SUPABASE_SERVICE_KEY}`,
            "Content-Type": "application/json",
            Prefer: options.prefer || "return=minimal",
            ...options.headers,
        },
        method: options.method || "GET",
        body: options.body ? JSON.stringify(options.body) : undefined,
    });
    if (!res.ok && options.method !== "GET") {
        console.error(`Supabase error: ${res.status} ${await res.text()}`);
    }
    return res;
}

async function getLatestSnapshot() {
    // Get the most recent change for each page_path + field combo
    const res = await supabaseFetch(
        "content_changelog?select=page_path,field,new_value&order=created_at.desc&limit=5000"
    );
    if (!res.ok) return {};

    const rows = await res.json();
    const snapshot = {};
    for (const row of rows) {
        const key = `${row.page_path}::${row.field}`;
        if (!snapshot[key]) {
            snapshot[key] = row.new_value;
        }
    }
    return snapshot;
}

async function logChange(pagePath, field, oldValue, newValue) {
    await supabaseFetch("content_changelog", {
        method: "POST",
        body: {
            page_path: pagePath,
            field,
            old_value: oldValue || null,
            new_value: newValue,
        },
    });
}

/* ------------------------------------------------------------------ */
/*  Main                                                               */
/* ------------------------------------------------------------------ */

async function main() {
    if (!fs.existsSync(OUT_DIR)) {
        console.log(`⚠️  ${OUT_DIR}/ not found. Run \`npm run build\` first.`);
        process.exit(0);
    }

    const htmlFiles = walkDir(OUT_DIR, ".html");
    console.log(`📸 Scanning ${htmlFiles.length} HTML files for content changes...`);

    // Get the last known state
    const lastSnapshot = await getLatestSnapshot();
    let changesLogged = 0;

    for (const file of htmlFiles) {
        const html = fs.readFileSync(file, "utf8");
        const meta = extractMeta(html);
        const pagePath = fileToPath(file);

        // Compare title
        const titleKey = `${pagePath}::title`;
        const lastTitle = lastSnapshot[titleKey];
        if (lastTitle !== undefined && lastTitle !== meta.title) {
            console.log(`  ✏️  ${pagePath} [title]: "${lastTitle}" → "${meta.title}"`);
            await logChange(pagePath, "title", lastTitle, meta.title);
            changesLogged++;
        } else if (lastTitle === undefined && meta.title) {
            // First time seeing this page — record initial state (no "old" value)
            await logChange(pagePath, "title", null, meta.title);
        }

        // Compare description
        const descKey = `${pagePath}::description`;
        const lastDesc = lastSnapshot[descKey];
        if (lastDesc !== undefined && lastDesc !== meta.description) {
            console.log(`  ✏️  ${pagePath} [description]: changed`);
            await logChange(pagePath, "description", lastDesc, meta.description);
            changesLogged++;
        } else if (lastDesc === undefined && meta.description) {
            await logChange(pagePath, "description", null, meta.description);
        }
    }

    if (changesLogged > 0) {
        console.log(`\n✅ ${changesLogged} content change(s) logged to Supabase.`);
    } else {
        console.log("✅ No content changes detected.");
    }
}

main().catch((err) => {
    console.error("Content snapshot failed:", err);
    // Non-fatal — don't break the build
    process.exit(0);
});
