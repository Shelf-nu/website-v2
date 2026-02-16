#!/usr/bin/env node
/**
 * Upload blog featured images from Webflow CDN to Supabase Storage
 * and add `image:` field to each blog MDX frontmatter.
 *
 * Strategy:
 * 1. For each local blog MDX file, try fetching its Webflow counterpart
 * 2. Extract the og:image or first content image from the Webflow page
 * 3. Upload to Supabase under blog/ prefix
 * 4. Add image: field to MDX frontmatter
 * 5. For posts with no Webflow page, use first inline image from MDX body
 */
import { readFile, writeFile, readdir } from "node:fs/promises";
import { join, extname, dirname, resolve } from "node:path";
import { fileURLToPath } from "node:url";

const __dirname = dirname(fileURLToPath(import.meta.url));
const PROJECT_ROOT = resolve(__dirname, "..");
const BLOG_DIR = join(PROJECT_ROOT, "content", "blog");

// Load env
const envContent = await readFile(join(PROJECT_ROOT, ".env.local"), "utf-8");
const env = {};
for (const line of envContent.split("\n")) {
  const t = line.trim();
  if (t && !t.startsWith("#")) {
    const eq = t.indexOf("=");
    if (eq > 0) env[t.slice(0, eq).trim()] = t.slice(eq + 1).trim();
  }
}
const SUPABASE_URL = env.SUPABASE_URL;
const SUPABASE_KEY = env.SUPABASE_SERVICE_KEY;
const BUCKET = env.SUPABASE_BUCKET;
const BASE_PUBLIC = `${SUPABASE_URL}/storage/v1/object/public/${BUCKET}`;

const mimes = {
  ".jpg": "image/jpeg",
  ".jpeg": "image/jpeg",
  ".png": "image/png",
  ".webp": "image/webp",
  ".gif": "image/gif",
};

// ─── Helpers ──────────────────────────────────────────

function sleep(ms) {
  return new Promise((r) => setTimeout(r, ms));
}

/** Upload a remote image to Supabase, return the public URL or null */
async function uploadImage(sourceUrl, storagePath) {
  try {
    const resp = await fetch(sourceUrl);
    if (!resp.ok) throw new Error("HTTP " + resp.status);
    const buf = Buffer.from(await resp.arrayBuffer());

    const ext = extname(storagePath).toLowerCase();
    const mime = mimes[ext] || "application/octet-stream";

    const upResp = await fetch(
      `${SUPABASE_URL}/storage/v1/object/${BUCKET}/${storagePath}`,
      {
        method: "POST",
        headers: {
          Authorization: `Bearer ${SUPABASE_KEY}`,
          "Content-Type": mime,
          "x-upsert": "true",
        },
        body: buf,
      }
    );
    if (!upResp.ok)
      throw new Error("Upload " + upResp.status + ": " + (await upResp.text()));

    return `${BASE_PUBLIC}/${storagePath}`;
  } catch (e) {
    console.log(`  ⚠️  Upload failed for ${storagePath}: ${e.message}`);
    return null;
  }
}

/** Fetch a Webflow blog page and extract the og:image URL */
async function getWebflowOgImage(slug) {
  const url = `https://www.shelf.nu/blog/${slug}`;
  try {
    const resp = await fetch(url, { redirect: "follow" });
    if (!resp.ok) return null;
    const html = await resp.text();

    // Try og:image meta tag first
    const ogMatch = html.match(/<meta\s+(?:property|name)="og:image"\s+content="([^"]+)"/i)
      || html.match(/content="([^"]+)"\s+(?:property|name)="og:image"/i);
    if (ogMatch && ogMatch[1]) {
      const ogUrl = ogMatch[1];
      // Skip if it's a generic shelf logo/social image
      if (ogUrl.includes("shelf-logo") || ogUrl.includes("open-graph") || ogUrl.includes("social-share")) {
        return null;
      }
      return ogUrl;
    }

    // Fallback: find first large content image in the page body
    const imgMatches = [...html.matchAll(/<img[^>]+src="(https:\/\/cdn\.prod\.website-files\.com[^"]+)"/gi)];
    for (const m of imgMatches) {
      const src = m[1];
      // Skip logos, icons, svgs
      if (src.includes("shelf-logo") || src.endsWith(".svg") || src.includes("ossc-logo")) continue;
      return src;
    }

    return null;
  } catch {
    return null;
  }
}

/** Extract the first inline image URL from MDX body content */
function getFirstInlineImage(mdxContent) {
  // Remove frontmatter
  const body = mdxContent.replace(/^---[\s\S]*?---/, "");
  const match = body.match(/!\[.*?\]\((https?:\/\/[^)]+)\)/);
  return match ? match[1] : null;
}

/** Get file extension from URL */
function getExtFromUrl(url) {
  try {
    const pathname = new URL(url).pathname;
    const ext = extname(pathname).toLowerCase().split("?")[0];
    if ([".jpg", ".jpeg", ".png", ".webp", ".gif"].includes(ext)) return ext;
    // Check content type hints in URL
    if (url.includes(".jpg") || url.includes(".jpeg")) return ".jpg";
    if (url.includes(".png")) return ".png";
    if (url.includes(".webp")) return ".webp";
    return ".jpg"; // default
  } catch {
    return ".jpg";
  }
}

/** Add image: field to MDX frontmatter */
function addImageToFrontmatter(mdxContent, imageUrl) {
  // Find the closing --- of frontmatter
  const firstDash = mdxContent.indexOf("---");
  if (firstDash === -1) return mdxContent;
  const secondDash = mdxContent.indexOf("---", firstDash + 3);
  if (secondDash === -1) return mdxContent;

  const frontmatter = mdxContent.slice(firstDash + 3, secondDash);

  // Check if image: already exists
  if (/^image:/m.test(frontmatter)) {
    // Replace existing image field
    const updated = frontmatter.replace(/^image:.*$/m, `image: "${imageUrl}"`);
    return mdxContent.slice(0, firstDash + 3) + updated + mdxContent.slice(secondDash);
  }

  // Insert image: before the closing ---
  // Find a good place — after date or after layout
  const insertPoint = secondDash;
  const before = mdxContent.slice(0, insertPoint);
  const after = mdxContent.slice(insertPoint);

  // Make sure there's a newline before image:
  const needsNewline = !before.endsWith("\n");
  return before + (needsNewline ? "\n" : "") + `image: "${imageUrl}"\n` + after;
}

// ─── Main ──────────────────────────────────────────

const files = (await readdir(BLOG_DIR)).filter((f) => f.endsWith(".mdx"));
console.log(`Found ${files.length} blog MDX files\n`);

let uploaded = 0;
let fromInline = 0;
let noImage = 0;
let alreadyHas = 0;

for (const file of files) {
  const slug = file.replace(".mdx", "");
  const filePath = join(BLOG_DIR, file);
  const content = await readFile(filePath, "utf-8");

  // Check if already has image: in frontmatter
  const fmEnd = content.indexOf("---", content.indexOf("---") + 3);
  const fm = content.slice(0, fmEnd);
  if (/^image:/m.test(fm)) {
    console.log(`⏭️  ${slug} — already has image field`);
    alreadyHas++;
    continue;
  }

  // Try Webflow og:image first
  console.log(`🔍 ${slug} — checking Webflow...`);
  const ogImage = await getWebflowOgImage(slug);
  await sleep(200); // Be nice to Webflow

  if (ogImage) {
    const ext = getExtFromUrl(ogImage);
    const storagePath = `blog/${slug}${ext}`;
    const publicUrl = await uploadImage(ogImage, storagePath);

    if (publicUrl) {
      const updated = addImageToFrontmatter(content, publicUrl);
      await writeFile(filePath, updated);
      console.log(`✅ ${slug} — uploaded from Webflow`);
      uploaded++;
      continue;
    }
  }

  // Fallback: use first inline image from MDX body
  const inlineImage = getFirstInlineImage(content);
  if (inlineImage) {
    const updated = addImageToFrontmatter(content, inlineImage);
    await writeFile(filePath, updated);
    console.log(`📎 ${slug} — using inline image from body`);
    fromInline++;
    continue;
  }

  console.log(`❌ ${slug} — no image found`);
  noImage++;
}

console.log(`\n── Summary ──`);
console.log(`${uploaded} uploaded from Webflow`);
console.log(`${fromInline} using inline body images`);
console.log(`${alreadyHas} already had image field`);
console.log(`${noImage} with no image (will use fallback)`);
