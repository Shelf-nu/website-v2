#!/usr/bin/env node

/**
 * Webflow CDN → Supabase Storage Migration Script
 *
 * Scans all .mdx and .tsx files for Webflow CDN URLs,
 * downloads the assets, uploads to Supabase Storage,
 * and replaces all URLs in the codebase.
 *
 * Usage:
 *   node scripts/migrate-images-to-supabase.mjs --dry-run   # Preview only
 *   node scripts/migrate-images-to-supabase.mjs              # Full migration
 *
 * Requires .env.local with:
 *   SUPABASE_URL, SUPABASE_SERVICE_KEY, SUPABASE_BUCKET
 */

import { readFile, writeFile, readdir, mkdir, stat } from "node:fs/promises";
import { join, extname, resolve, dirname } from "node:path";
import { existsSync } from "node:fs";

// ── Config ──────────────────────────────────────────────────────────────────

// Use fileURLToPath to correctly handle spaces in directory names
import { fileURLToPath } from "node:url";
const __filename = fileURLToPath(import.meta.url);
const __dirname = dirname(__filename);
const PROJECT_ROOT = resolve(__dirname, "..");
const TMP_DIR = join(PROJECT_ROOT, "scripts", ".tmp-migration");
const ERROR_LOG = join(PROJECT_ROOT, "scripts", "migration-errors.log");
const DRY_RUN = process.argv.includes("--dry-run");

// Load .env.local manually (no dotenv dependency)
const envPath = join(PROJECT_ROOT, ".env.local");
if (existsSync(envPath)) {
  const envContent = await readFile(envPath, "utf-8");
  for (const line of envContent.split("\n")) {
    const trimmed = line.trim();
    if (trimmed && !trimmed.startsWith("#")) {
      const eqIdx = trimmed.indexOf("=");
      if (eqIdx > 0) {
        const key = trimmed.slice(0, eqIdx).trim();
        const val = trimmed.slice(eqIdx + 1).trim();
        if (!process.env[key]) process.env[key] = val;
      }
    }
  }
}

const SUPABASE_URL = process.env.SUPABASE_URL;
const SUPABASE_KEY = process.env.SUPABASE_SERVICE_KEY;
const BUCKET = process.env.SUPABASE_BUCKET || "website-images";

if (!DRY_RUN && (!SUPABASE_URL || !SUPABASE_KEY)) {
  console.error(
    "❌ Missing SUPABASE_URL or SUPABASE_SERVICE_KEY in .env.local"
  );
  process.exit(1);
}

// Webflow URL regex — matches both CDN domains
const WEBFLOW_REGEX =
  /https:\/\/(uploads-ssl\.webflow\.com|cdn\.prod\.website-files\.com)\/[^\s\)"'>,]+/g;

// ── Helpers ─────────────────────────────────────────────────────────────────

async function getFilesRecursive(dir, extensions) {
  const results = [];
  let entries;
  try {
    entries = await readdir(dir, { withFileTypes: true });
  } catch {
    return results;
  }
  for (const entry of entries) {
    const fullPath = join(dir, entry.name);
    if (entry.isDirectory()) {
      // Skip node_modules, .next, .git, etc
      if (
        entry.name.startsWith(".") ||
        entry.name === "node_modules" ||
        entry.name === ".next"
      ) {
        continue;
      }
      results.push(...(await getFilesRecursive(fullPath, extensions)));
    } else if (extensions.some((ext) => entry.name.endsWith(ext))) {
      results.push(fullPath);
    }
  }
  return results;
}

function extractFilename(webflowUrl) {
  // Webflow URLs look like: .../641c35b7e5057648c76fa79f/642adf117e245fefb2138cb0_history-of-qr-codes.jpg
  // We want: history-of-qr-codes.jpg (the part after the first underscore in the last segment)
  try {
    const url = new URL(webflowUrl);
    const pathParts = url.pathname.split("/").filter(Boolean);
    const lastPart = pathParts[pathParts.length - 1];

    // Decode URL encoding
    const decoded = decodeURIComponent(lastPart);

    // The format is typically: <hex-id>_<filename>
    // Find the first underscore and take everything after it
    const underscoreIdx = decoded.indexOf("_");
    if (underscoreIdx > 0 && underscoreIdx < decoded.length - 1) {
      return decoded.slice(underscoreIdx + 1);
    }

    // Fallback: use the whole last segment
    return decoded;
  } catch {
    return `unknown-${Date.now()}`;
  }
}

function determineBucketPrefix(filePath) {
  const relative = filePath.replace(PROJECT_ROOT + "/", "");
  if (relative.includes("content/blog/") || relative.includes("blog/")) {
    // Check if the URL points to a CSV file
    return "blog";
  }
  if (
    relative.includes("content/case-studies/") ||
    relative.includes("case-studies/")
  ) {
    return "case-studies";
  }
  if (relative.includes("about/")) return "about";
  if (relative.includes("content/features/")) return "features";
  if (relative.includes("content/solutions/")) return "solutions";
  if (relative.includes("content/industries/")) return "industries";
  if (relative.includes("content/alternatives/")) return "alternatives";
  // Default for component files
  return "general";
}

function getMimeType(filename) {
  const ext = extname(filename).toLowerCase();
  const mimes = {
    ".jpg": "image/jpeg",
    ".jpeg": "image/jpeg",
    ".png": "image/png",
    ".gif": "image/gif",
    ".svg": "image/svg+xml",
    ".webp": "image/webp",
    ".avif": "image/avif",
    ".csv": "text/csv",
    ".pdf": "application/pdf",
  };
  return mimes[ext] || "application/octet-stream";
}

async function downloadFile(url, destPath) {
  const response = await fetch(url);
  if (!response.ok) {
    throw new Error(`HTTP ${response.status} for ${url}`);
  }
  const buffer = Buffer.from(await response.arrayBuffer());
  await writeFile(destPath, buffer);
  return buffer;
}

async function uploadToSupabase(buffer, bucketPath, mimeType) {
  const uploadUrl = `${SUPABASE_URL}/storage/v1/object/${BUCKET}/${bucketPath}`;

  const response = await fetch(uploadUrl, {
    method: "POST",
    headers: {
      Authorization: `Bearer ${SUPABASE_KEY}`,
      "Content-Type": mimeType,
      "x-upsert": "true", // Overwrite if exists
    },
    body: buffer,
  });

  if (!response.ok) {
    const text = await response.text();
    throw new Error(`Upload failed (${response.status}): ${text}`);
  }

  // Return the public URL
  return `${SUPABASE_URL}/storage/v1/object/public/${BUCKET}/${bucketPath}`;
}

async function processBatch(items, batchSize, fn) {
  const results = [];
  for (let i = 0; i < items.length; i += batchSize) {
    const batch = items.slice(i, i + batchSize);
    const batchResults = await Promise.allSettled(batch.map(fn));
    results.push(...batchResults);
  }
  return results;
}

// ── Phase 1: Scan ───────────────────────────────────────────────────────────

console.log("\n🔍 Phase 1: Scanning for Webflow URLs...\n");

const scanDirs = [
  join(PROJECT_ROOT, "content"),
  join(PROJECT_ROOT, "src"),
];
const extensions = [".mdx", ".tsx", ".ts"];

let allFiles = [];
for (const dir of scanDirs) {
  allFiles.push(...(await getFilesRecursive(dir, extensions)));
}

// Map: url -> { files: Set<filePath>, firstFilePrefix: string }
const urlMap = new Map();

for (const filePath of allFiles) {
  const content = await readFile(filePath, "utf-8");
  const matches = content.match(WEBFLOW_REGEX);
  if (matches) {
    for (const url of matches) {
      // Clean up any trailing characters that might have been captured
      const cleanUrl = url.replace(/[)\]}>'"]+$/, "");
      if (!urlMap.has(cleanUrl)) {
        urlMap.set(cleanUrl, {
          files: new Set(),
          prefix: determineBucketPrefix(filePath),
        });
      }
      urlMap.get(cleanUrl).files.add(filePath);
    }
  }
}

console.log(`   Found ${urlMap.size} unique Webflow URLs across ${allFiles.length} scanned files`);

// Track which files need URL replacements
const affectedFiles = new Set();
for (const [, data] of urlMap) {
  for (const f of data.files) affectedFiles.add(f);
}
console.log(`   Affected files: ${affectedFiles.size}`);

if (DRY_RUN) {
  console.log("\n📋 DRY RUN — URLs that would be migrated:\n");
  const byPrefix = {};
  for (const [url, data] of urlMap) {
    const prefix = data.prefix;
    if (!byPrefix[prefix]) byPrefix[prefix] = [];
    const filename = extractFilename(url);
    const isCSV = filename.endsWith(".csv");
    byPrefix[prefix].push({
      url,
      filename,
      type: isCSV ? "CSV" : "Image",
      referencedIn: data.files.size,
    });
  }

  for (const [prefix, items] of Object.entries(byPrefix).sort()) {
    console.log(`\n  📁 ${prefix}/`);
    for (const item of items) {
      console.log(
        `     ${item.type === "CSV" ? "📄" : "🖼️ "} ${item.filename} (used in ${item.referencedIn} file${item.referencedIn > 1 ? "s" : ""})`
      );
    }
  }

  console.log(`\n✅ Dry run complete. Run without --dry-run to execute.\n`);
  process.exit(0);
}

// ── Phase 2: Download ───────────────────────────────────────────────────────

console.log("\n⬇️  Phase 2: Downloading assets...\n");

await mkdir(TMP_DIR, { recursive: true });

const errors = [];
const filenameCount = new Map(); // Track filename collisions
const urlToLocalPath = new Map();

// First pass: determine filenames and handle collisions
for (const [url] of urlMap) {
  let filename = extractFilename(url);
  const isCsv = filename.toLowerCase().endsWith(".csv");

  // Handle collisions: if same filename already used by a different URL
  const count = filenameCount.get(filename) || 0;
  if (count > 0) {
    const ext = extname(filename);
    const base = filename.slice(0, -ext.length);
    filename = `${base}-${count}${ext}`;
  }
  filenameCount.set(extractFilename(url), count + 1);

  // Override prefix for CSV files
  if (isCsv) {
    urlMap.get(url).prefix = "downloads";
  }

  urlMap.get(url).filename = filename;
  urlToLocalPath.set(url, join(TMP_DIR, filename));
}

// Download in batches of 10
const urls = [...urlMap.keys()];
let downloaded = 0;
let failed = 0;

const downloadResults = await processBatch(urls, 10, async (url) => {
  const localPath = urlToLocalPath.get(url);
  try {
    const buffer = await downloadFile(url, localPath);
    urlMap.get(url).buffer = buffer;
    downloaded++;
    process.stdout.write(`\r   Downloaded: ${downloaded}/${urls.length}`);
    return { url, success: true };
  } catch (err) {
    failed++;
    const msg = `DOWNLOAD FAILED: ${url} — ${err.message}`;
    errors.push(msg);
    console.error(`\n   ❌ ${msg}`);
    return { url, success: false };
  }
});

console.log(`\n   ✅ Downloaded: ${downloaded} | ❌ Failed: ${failed}\n`);

// ── Phase 3: Upload to Supabase ─────────────────────────────────────────────

console.log("⬆️  Phase 3: Uploading to Supabase Storage...\n");

const replacementMap = new Map(); // old URL -> new URL
let uploaded = 0;
let uploadFailed = 0;

const successfulUrls = urls.filter((url) => urlMap.get(url).buffer);

const uploadResults = await processBatch(successfulUrls, 5, async (url) => {
  const data = urlMap.get(url);
  const bucketPath = `${data.prefix}/${data.filename}`;
  const mimeType = getMimeType(data.filename);

  try {
    const newUrl = await uploadToSupabase(data.buffer, bucketPath, mimeType);
    replacementMap.set(url, newUrl);
    uploaded++;
    process.stdout.write(`\r   Uploaded: ${uploaded}/${successfulUrls.length}`);
    return { url, success: true, newUrl };
  } catch (err) {
    uploadFailed++;
    const msg = `UPLOAD FAILED: ${url} → ${bucketPath} — ${err.message}`;
    errors.push(msg);
    console.error(`\n   ❌ ${msg}`);
    return { url, success: false };
  }
});

console.log(`\n   ✅ Uploaded: ${uploaded} | ❌ Failed: ${uploadFailed}\n`);

// ── Phase 4: Replace URLs ───────────────────────────────────────────────────

console.log("🔄 Phase 4: Replacing URLs in source files...\n");

let filesModified = 0;
let replacementsMade = 0;

for (const filePath of affectedFiles) {
  let content = await readFile(filePath, "utf-8");
  let modified = false;

  for (const [oldUrl, newUrl] of replacementMap) {
    if (content.includes(oldUrl)) {
      content = content.replaceAll(oldUrl, newUrl);
      modified = true;
      replacementsMade++;
    }
  }

  if (modified) {
    await writeFile(filePath, content, "utf-8");
    filesModified++;
    const relative = filePath.replace(PROJECT_ROOT + "/", "");
    console.log(`   ✏️  ${relative}`);
  }
}

console.log(
  `\n   ✅ Modified ${filesModified} files with ${replacementsMade} URL replacements\n`
);

// ── Summary ─────────────────────────────────────────────────────────────────

if (errors.length > 0) {
  await writeFile(ERROR_LOG, errors.join("\n") + "\n", "utf-8");
  console.log(`⚠️  ${errors.length} errors logged to: scripts/migration-errors.log`);
}

console.log("─".repeat(60));
console.log("📊 Migration Summary");
console.log("─".repeat(60));
console.log(`   URLs found:       ${urlMap.size}`);
console.log(`   Downloaded:       ${downloaded}`);
console.log(`   Uploaded:         ${uploaded}`);
console.log(`   Files modified:   ${filesModified}`);
console.log(`   Replacements:     ${replacementsMade}`);
console.log(`   Errors:           ${errors.length}`);
console.log("─".repeat(60));

if (errors.length === 0) {
  console.log("\n🎉 Migration complete! Next steps:");
  console.log("   1. Update next.config.ts to add Supabase hostname to remotePatterns");
  console.log("   2. Run 'npm run build' to verify");
  console.log("   3. Commit and push\n");
} else {
  console.log("\n⚠️  Migration complete with errors. Review migration-errors.log\n");
}

// Cleanup tmp directory
import { rm } from "node:fs/promises";
try {
  await rm(TMP_DIR, { recursive: true });
} catch {
  // ignore cleanup errors
}
