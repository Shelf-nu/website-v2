#!/usr/bin/env node

/**
 * Scrape Webflow Content → MDX + Supabase Images
 *
 * Crawls live Webflow pages, extracts article content as markdown,
 * downloads images to Supabase Storage, and updates MDX files
 * (keeping existing frontmatter, replacing body content).
 *
 * Usage:
 *   node scripts/scrape-webflow-content.mjs --type case-studies --dry-run
 *   node scripts/scrape-webflow-content.mjs --type blog
 *   node scripts/scrape-webflow-content.mjs --type all
 */

import { readFile, writeFile, readdir, mkdir } from "node:fs/promises";
import { join, extname, resolve, dirname } from "node:path";
import { existsSync } from "node:fs";
import { fileURLToPath } from "node:url";

// ── Config ──────────────────────────────────────────────────────────────────

const __filename = fileURLToPath(import.meta.url);
const __dirname = dirname(__filename);
const PROJECT_ROOT = resolve(__dirname, "..");
const TMP_DIR = join(PROJECT_ROOT, "scripts", ".tmp-scrape");
const DRY_RUN = process.argv.includes("--dry-run");
const SITE_BASE = "https://www.shelf.nu";

// Parse --type flags (can have multiple)
const typeArgs = [];
process.argv.forEach((arg, i) => {
  if (arg === "--type" && process.argv[i + 1]) {
    typeArgs.push(process.argv[i + 1]);
  }
});
if (typeArgs.length === 0) typeArgs.push("all");

// Load .env.local
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
  console.error("❌ Missing SUPABASE_URL or SUPABASE_SERVICE_KEY in .env.local");
  process.exit(1);
}

// ── Case study slug mapping (Webflow slug → local filename) ─────────────────

const CASE_STUDY_WEBFLOW_SLUGS = {
  "eastern-michigan-university.mdx": "eastern-michigan-university",
  "haarp.mdx": "haarp",
  "kcai.mdx": "kansas-city-art-institute-cheqroom-migration",
  "ces-70k-recovery.mdx": "how-ces-recovered-70k-of-field-equipment-using-shelf-qr-labels",
  "fabel-film-double-bookings.mdx": "from-memory-to-mastery-how-fabel-film-stopped-double-bookings-with-shelf",
  "resq-contact-center.mdx": "resq-contact-center-asset-management",
};

// ── HTML to Markdown converter ──────────────────────────────────────────────

function htmlToMarkdown(html) {
  let md = html;

  // Remove srcset and sizes attributes (we just want src)
  md = md.replace(/\s+srcset="[^"]*"/g, "");
  md = md.replace(/\s+sizes="[^"]*"/g, "");
  md = md.replace(/\s+loading="[^"]*"/g, "");

  // Helper: encode parentheses in URLs for markdown compatibility
  const mdSafeSrc = (src) => src.replace(/\(/g, "%28").replace(/\)/g, "%29");

  // Handle figures with images
  md = md.replace(/<figure[^>]*>\s*<div>\s*<img\s+src="([^"]*)"[^>]*\/?\s*>\s*<\/div>\s*(?:<figcaption>([^<]*)<\/figcaption>\s*)?<\/figure>/gi, (_, src, caption) => {
    if (caption) return `\n\n![${caption}](${mdSafeSrc(src)})\n\n`;
    return `\n\n![](${mdSafeSrc(src)})\n\n`;
  });

  // Handle standalone images
  md = md.replace(/<img\s+src="([^"]*)"[^>]*\/?>/gi, (_, src) => `\n\n![](${mdSafeSrc(src)})\n\n`);

  // Headings
  md = md.replace(/<h1[^>]*>(.*?)<\/h1>/gi, "\n\n# $1\n\n");
  md = md.replace(/<h2[^>]*>(.*?)<\/h2>/gi, "\n\n## $1\n\n");
  md = md.replace(/<h3[^>]*>(.*?)<\/h3>/gi, "\n\n### $1\n\n");
  md = md.replace(/<h4[^>]*>(.*?)<\/h4>/gi, "\n\n#### $1\n\n");

  // Blockquotes
  md = md.replace(/<blockquote[^>]*>(.*?)<\/blockquote>/gis, (_, content) => {
    const text = content.replace(/<[^>]+>/g, "").trim();
    return "\n\n> " + text.split("\n").join("\n> ") + "\n\n";
  });

  // Bold and italic
  md = md.replace(/<strong>(.*?)<\/strong>/gi, "**$1**");
  md = md.replace(/<b>(.*?)<\/b>/gi, "**$1**");
  md = md.replace(/<em>(.*?)<\/em>/gi, "*$1*");
  md = md.replace(/<i>(.*?)<\/i>/gi, "*$1*");

  // Links
  md = md.replace(/<a\s+href="([^"]*)"[^>]*>(.*?)<\/a>/gi, "[$2]($1)");

  // Lists
  md = md.replace(/<ul[^>]*>/gi, "\n");
  md = md.replace(/<\/ul>/gi, "\n");
  md = md.replace(/<ol[^>]*>/gi, "\n");
  md = md.replace(/<\/ol>/gi, "\n");
  md = md.replace(/<li>(.*?)<\/li>/gi, "- $1\n");

  // Paragraphs
  md = md.replace(/<p[^>]*>(.*?)<\/p>/gis, "\n\n$1\n\n");

  // Line breaks
  md = md.replace(/<br\s*\/?>/gi, "\n");

  // Horizontal rules
  md = md.replace(/<hr[^>]*\/?>/gi, "\n\n---\n\n");

  // Remove remaining HTML tags
  md = md.replace(/<[^>]+>/g, "");

  // Decode HTML entities
  md = md.replace(/&amp;/g, "&");
  md = md.replace(/&lt;/g, "<");
  md = md.replace(/&gt;/g, ">");
  md = md.replace(/&quot;/g, '"');
  md = md.replace(/&#x27;/g, "'");
  md = md.replace(/&#39;/g, "'");
  md = md.replace(/&nbsp;/g, " ");

  // Clean up excessive whitespace
  md = md.replace(/\n{3,}/g, "\n\n");
  md = md.trim();

  return md;
}

// ── Extract content from Webflow HTML ───────────────────────────────────────

function extractArticleContent(html, type) {
  let contentHtml = "";

  if (type === "case-studies") {
    // Case studies: content is inside <div class="... w-richtext">
    const richTextMatch = html.match(/<div[^>]*class="[^"]*w-richtext[^"]*"[^>]*>([\s\S]*?)<\/div>\s*<\/div>\s*<div[^>]*class="cs_sidebar/);
    if (richTextMatch) {
      contentHtml = richTextMatch[1];
    } else {
      // Fallback: try to find w-richtext div
      const fallback = html.match(/<div[^>]*class="[^"]*w-richtext[^"]*"[^>]*>([\s\S]*?)<\/div>/);
      if (fallback) contentHtml = fallback[1];
    }
  } else if (type === "blog") {
    // Blog posts: also use w-richtext
    const richTextMatch = html.match(/<div[^>]*class="[^"]*w-richtext[^"]*"[^>]*>([\s\S]*?)<\/div>/);
    if (richTextMatch) contentHtml = richTextMatch[1];
  } else {
    // Features, solutions, etc: try w-richtext first, then broader content
    const richTextMatch = html.match(/<div[^>]*class="[^"]*w-richtext[^"]*"[^>]*>([\s\S]*?)<\/div>/);
    if (richTextMatch) contentHtml = richTextMatch[1];
  }

  return contentHtml;
}

// ── Supabase upload helpers ─────────────────────────────────────────────────

function getMimeType(filename) {
  const ext = extname(filename).toLowerCase();
  const mimes = {
    ".jpg": "image/jpeg", ".jpeg": "image/jpeg", ".png": "image/png",
    ".gif": "image/gif", ".svg": "image/svg+xml", ".webp": "image/webp",
  };
  return mimes[ext] || "application/octet-stream";
}

function extractFilename(url) {
  try {
    const urlObj = new URL(url);
    const pathParts = urlObj.pathname.split("/").filter(Boolean);
    const lastPart = pathParts[pathParts.length - 1];
    const decoded = decodeURIComponent(lastPart);
    const underscoreIdx = decoded.indexOf("_");
    if (underscoreIdx > 0 && underscoreIdx < decoded.length - 1) {
      return decoded.slice(underscoreIdx + 1);
    }
    return decoded;
  } catch {
    return `unknown-${Date.now()}`;
  }
}

async function downloadAndUpload(imageUrl, bucketPrefix) {
  const filename = extractFilename(imageUrl);
  const bucketPath = `${bucketPrefix}/${filename}`;

  // Download
  const resp = await fetch(imageUrl);
  if (!resp.ok) throw new Error(`Download failed: ${resp.status} for ${imageUrl}`);
  const buffer = Buffer.from(await resp.arrayBuffer());

  // Upload
  const uploadUrl = `${SUPABASE_URL}/storage/v1/object/${BUCKET}/${bucketPath}`;
  const upResp = await fetch(uploadUrl, {
    method: "POST",
    headers: {
      Authorization: `Bearer ${SUPABASE_KEY}`,
      "Content-Type": getMimeType(filename),
      "x-upsert": "true",
    },
    body: buffer,
  });
  if (!upResp.ok) {
    const text = await upResp.text();
    throw new Error(`Upload failed: ${upResp.status} ${text}`);
  }

  return `${SUPABASE_URL}/storage/v1/object/public/${BUCKET}/${bucketPath}`;
}

// ── Process a single page ───────────────────────────────────────────────────

async function processPage(mdxPath, webflowUrl, type, bucketPrefix) {
  const filename = mdxPath.split("/").pop();

  // Read existing MDX
  const mdxContent = await readFile(mdxPath, "utf-8");

  // Extract frontmatter
  const frontmatterMatch = mdxContent.match(/^---\n([\s\S]*?)\n---/);
  if (!frontmatterMatch) {
    console.log(`   ⚠️  No frontmatter found in ${filename}, skipping`);
    return { success: false, reason: "no-frontmatter" };
  }
  const frontmatter = frontmatterMatch[0]; // includes the --- delimiters

  // Validate URL
  try {
    new URL(webflowUrl);
  } catch {
    console.log(`   ❌ Invalid URL: ${webflowUrl}`);
    return { success: false, reason: "invalid-url" };
  }

  // Fetch live Webflow page
  console.log(`   🌐 Fetching ${webflowUrl}`);
  let resp;
  try {
    resp = await fetch(webflowUrl);
  } catch (err) {
    console.log(`   ❌ Fetch error for ${webflowUrl}: ${err.message}`);
    return { success: false, reason: "fetch-error" };
  }
  if (!resp.ok) {
    console.log(`   ❌ HTTP ${resp.status} for ${webflowUrl}`);
    return { success: false, reason: `http-${resp.status}` };
  }
  const html = await resp.text();

  // Extract article content
  const contentHtml = extractArticleContent(html, type);
  if (!contentHtml || contentHtml.length < 50) {
    console.log(`   ⚠️  Could not extract content from ${webflowUrl}`);
    return { success: false, reason: "no-content" };
  }

  // Convert to markdown
  let markdown = htmlToMarkdown(contentHtml);

  // Find all Webflow image URLs from the original HTML (before markdown conversion)
  // This avoids issues with parentheses in filenames being confused with markdown syntax
  const htmlImageRegex = /src="(https:\/\/(?:uploads-ssl\.webflow\.com|cdn\.prod\.website-files\.com)\/[^"]+)"/g;
  const imageUrls = [];
  let htmlMatch;
  while ((htmlMatch = htmlImageRegex.exec(contentHtml)) !== null) {
    const url = htmlMatch[1];
    // Skip responsive variants (-p-500, -p-800, etc.)
    if (/-p-\d+\.\w+$/.test(url)) continue;
    if (!imageUrls.includes(url)) imageUrls.push(url);
  }

  if (DRY_RUN) {
    console.log(`   📄 ${filename} → ${imageUrls.length} images found`);
    console.log(`   📝 Content: ${markdown.length} chars`);
    for (const url of imageUrls) {
      console.log(`      🖼️  ${extractFilename(url)}`);
    }
    return { success: true, dryRun: true, images: imageUrls.length };
  }

  // Download and upload each image, replace URLs
  let uploadedCount = 0;
  for (const imageUrl of imageUrls) {
    try {
      const newUrl = await downloadAndUpload(imageUrl, bucketPrefix);
      // Replace both the raw URL and the percent-encoded version (for parentheses in filenames)
      const encodedUrl = imageUrl.replace(/\(/g, "%28").replace(/\)/g, "%29");
      markdown = markdown.replaceAll(imageUrl, newUrl);
      markdown = markdown.replaceAll(encodedUrl, newUrl);
      uploadedCount++;
    } catch (err) {
      console.log(`   ❌ Failed: ${extractFilename(imageUrl)} — ${err.message}`);
    }
  }

  // Also check for -p-500, -p-800 etc responsive variants that might have snuck in
  markdown = markdown.replace(/https:\/\/(uploads-ssl\.webflow\.com|cdn\.prod\.website-files\.com)\/[^\s\)"']+/g, (match) => {
    // If there's still a Webflow URL, it's likely a responsive variant we missed
    console.log(`   ⚠️  Residual Webflow URL found and removed from responsive srcset: ${match.slice(0, 60)}...`);
    return "";
  });

  // Write updated MDX
  const newMdx = `${frontmatter}\n\n${markdown}\n`;
  await writeFile(mdxPath, newMdx, "utf-8");

  console.log(`   ✅ ${filename} — ${uploadedCount} images uploaded, content replaced`);
  return { success: true, images: uploadedCount };
}

// ── Check if MDX has inline images ──────────────────────────────────────────

async function hasInlineImages(mdxPath) {
  const content = await readFile(mdxPath, "utf-8");
  // Check for markdown image syntax in body (after frontmatter)
  const bodyMatch = content.match(/^---\n[\s\S]*?\n---\n([\s\S]*)/);
  if (!bodyMatch) return false;
  const body = bodyMatch[1];
  return /!\[.*?\]\(.*?\)/.test(body);
}

// ── Get canonical URL from frontmatter ──────────────────────────────────────

async function getCanonicalUrl(mdxPath) {
  const content = await readFile(mdxPath, "utf-8");
  const match = content.match(/canonicalUrl:\s*["']?([^\s"'\n>]+)/);
  if (match && match[1] && !match[1].startsWith(">") && match[1].length > 3) {
    return match[1];
  }

  // Fallback: use the filename as slug
  const filename = mdxPath.split("/").pop().replace(".mdx", "");
  if (mdxPath.includes("/blog/")) return `/blog/${filename}`;
  if (mdxPath.includes("/case-studies/")) return `/case-studies/${filename}`;
  if (mdxPath.includes("/features/")) return `/features/${filename}`;
  if (mdxPath.includes("/solutions/")) return `/solutions/${filename}`;
  if (mdxPath.includes("/industries/")) return `/industries/${filename}`;
  if (mdxPath.includes("/alternatives/")) return `/alternatives/${filename}`;
  if (mdxPath.includes("/use-cases/")) return `/use-cases/${filename}`;
  return null;
}

// ── Main ────────────────────────────────────────────────────────────────────

const shouldProcess = (type) => typeArgs.includes("all") || typeArgs.includes(type);

console.log(`\n🔄 Webflow Content Scraper`);
console.log(`   Mode: ${DRY_RUN ? "DRY RUN" : "LIVE"}`);
console.log(`   Types: ${typeArgs.join(", ")}\n`);

let totalProcessed = 0;
let totalImages = 0;
let totalFailed = 0;

// ── Process Case Studies ────────────────────────────────────────────────────

if (shouldProcess("case-studies")) {
  console.log("📁 Case Studies\n");
  const csDir = join(PROJECT_ROOT, "content", "case-studies");
  const files = (await readdir(csDir)).filter((f) => f.endsWith(".mdx"));

  for (const file of files) {
    const webflowSlug = CASE_STUDY_WEBFLOW_SLUGS[file];
    if (!webflowSlug) {
      console.log(`   ⚠️  No Webflow mapping for ${file}, skipping`);
      continue;
    }
    const webflowUrl = `${SITE_BASE}/case-studies/${webflowSlug}`;
    const result = await processPage(
      join(csDir, file),
      webflowUrl,
      "case-studies",
      "case-studies"
    );
    if (result.success) {
      totalProcessed++;
      totalImages += result.images || 0;
    } else {
      totalFailed++;
    }
  }
  console.log("");
}

// ── Process Blog Posts ──────────────────────────────────────────────────────

if (shouldProcess("blog")) {
  console.log("📁 Blog Posts (only those missing inline images)\n");
  const blogDir = join(PROJECT_ROOT, "content", "blog");
  const files = (await readdir(blogDir)).filter((f) => f.endsWith(".mdx"));

  for (const file of files) {
    const mdxPath = join(blogDir, file);

    // Skip posts that already have inline images
    if (await hasInlineImages(mdxPath)) {
      continue;
    }

    const canonicalUrl = await getCanonicalUrl(mdxPath);
    if (!canonicalUrl) {
      console.log(`   ⚠️  No canonical URL for ${file}, skipping`);
      continue;
    }

    // Build full Webflow URL
    const webflowUrl = canonicalUrl.startsWith("http")
      ? canonicalUrl
      : `${SITE_BASE}${canonicalUrl}`;

    const result = await processPage(mdxPath, webflowUrl, "blog", "blog");
    if (result.success) {
      totalProcessed++;
      totalImages += result.images || 0;
    } else {
      totalFailed++;
    }
  }
  console.log("");
}

// ── Process Other Content Types ─────────────────────────────────────────────

const otherTypes = [
  { type: "features", dir: "content/features", prefix: "features", webflowBase: "/features" },
  { type: "solutions", dir: "content/solutions", prefix: "solutions", webflowBase: "/solutions" },
  { type: "industries", dir: "content/industries", prefix: "industries", webflowBase: "/industries" },
  { type: "alternatives", dir: "content/alternatives", prefix: "alternatives", webflowBase: "/alternatives" },
  { type: "use-cases", dir: "content/use-cases", prefix: "use-cases", webflowBase: "/use-cases" },
];

for (const { type, dir, prefix, webflowBase } of otherTypes) {
  if (!shouldProcess(type)) continue;

  const fullDir = join(PROJECT_ROOT, dir);
  if (!existsSync(fullDir)) continue;

  console.log(`📁 ${type}\n`);
  const files = (await readdir(fullDir)).filter((f) => f.endsWith(".mdx"));

  for (const file of files) {
    const mdxPath = join(fullDir, file);
    const canonicalUrl = await getCanonicalUrl(mdxPath);
    const slug = file.replace(".mdx", "");
    const webflowUrl = canonicalUrl
      ? (canonicalUrl.startsWith("http") ? canonicalUrl : `${SITE_BASE}${canonicalUrl}`)
      : `${SITE_BASE}${webflowBase}/${slug}`;

    const result = await processPage(mdxPath, webflowUrl, type, prefix);
    if (result.success) {
      totalProcessed++;
      totalImages += result.images || 0;
    } else {
      totalFailed++;
    }
  }
  console.log("");
}

// ── Summary ─────────────────────────────────────────────────────────────────

console.log("─".repeat(60));
console.log("📊 Summary");
console.log("─".repeat(60));
console.log(`   Pages processed:  ${totalProcessed}`);
console.log(`   Images uploaded:  ${totalImages}`);
console.log(`   Failed:           ${totalFailed}`);
console.log("─".repeat(60));

if (DRY_RUN) {
  console.log("\n✅ Dry run complete. Run without --dry-run to execute.\n");
} else {
  console.log("\n🎉 Done! Next steps:");
  console.log("   1. Check pages visually on localhost");
  console.log("   2. npm run build");
  console.log("   3. Commit and push\n");
}
