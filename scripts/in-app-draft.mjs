#!/usr/bin/env node
/**
 * Files website update entries as DRAFT posts in the Shelf app's Updates panel.
 *
 * Runs from `.github/workflows/in-app-draft.yml` on every push to `main` that
 * adds a `content/updates/*.mdx` entry, and by hand through the workflow's
 * manual trigger for a backfill. Only entries whose frontmatter says
 * `inApp: true` are filed; every other entry is reported as skipped. The app
 * endpoint can only create drafts, so a Shelf admin still edits and publishes
 * each post in Admin > Updates.
 *
 * What goes into the draft, all taken from the entry's frontmatter:
 *   title        -> title (at most 200 characters)
 *   description  -> content, the body of the in-app post
 *   image        -> imageUrl, only when it is an absolute https URL that loads
 *   readMoreUrl  -> url, made absolute against SITE_ORIGIN; the entry's own
 *                   /updates/<slug> page when the entry has no readMoreUrl
 *   appRoles     -> targetRoles (omitted means every role)
 *
 * Usage: node scripts/in-app-draft.mjs [--dry-run] <entry.mdx> [<entry.mdx> ...]
 *
 * Environment:
 *   UPDATE_DRAFTS_API_KEY   Bearer key of the app endpoint (required unless --dry-run)
 *   UPDATE_DRAFTS_AUTHOR    Email of the Shelf admin the draft is filed under (required)
 *   UPDATE_DRAFTS_ENDPOINT  Defaults to https://app.shelf.nu/api/update-drafts
 *   SITE_ORIGIN             Defaults to https://www.shelf.nu
 *
 * Exit code is 1 when any entry that should have been filed was not, so the
 * workflow run turns red and the entry can be re-filed by hand.
 */
import { readFile } from "node:fs/promises";
import path from "node:path";
import { pathToFileURL } from "node:url";
import matter from "gray-matter";

const TITLE_MAX = 200;
const CONTENT_MAX = 10_000;
const ROLES = new Set(["OWNER", "ADMIN", "BASE", "SELF_SERVICE"]);

/**
 * Builds the endpoint body for one entry, or returns null with a reason when
 * the entry is not meant for the app.
 *
 * @param {string} entryPath - Path of the `.mdx` file, used for the slug
 * @param {string} source - The file's contents
 * @param {{ siteOrigin: string, authorEmail: string }} options
 * @returns {{ body: object } | { skipped: string }}
 */
export function buildDraft(entryPath, source, { siteOrigin, authorEmail }) {
  const { data } = matter(source);

  if (data.inApp !== true) {
    return { skipped: "frontmatter has no `inApp: true`" };
  }

  const title = String(data.title ?? "").trim();
  const content = String(data.description ?? "").trim();
  if (!title) return { skipped: "frontmatter has no title" };
  if (!content) return { skipped: "frontmatter has no description" };
  if (title.length > TITLE_MAX) {
    return { skipped: `title is longer than ${TITLE_MAX} characters` };
  }
  if (content.length > CONTENT_MAX) {
    return { skipped: `description is longer than ${CONTENT_MAX} characters` };
  }

  const slug = path.basename(entryPath, path.extname(entryPath));
  const url = absoluteUrl(data.readMoreUrl, siteOrigin) ?? `${siteOrigin}/updates/${slug}`;

  const body = { title, content, url, authorEmail };

  const imageUrl = typeof data.image === "string" ? data.image.trim() : "";
  if (imageUrl.startsWith("https://")) body.imageUrl = imageUrl;

  if (Array.isArray(data.appRoles) && data.appRoles.length > 0) {
    const roles = [...new Set(data.appRoles.map((role) => String(role).toUpperCase()))];
    const unknown = roles.filter((role) => !ROLES.has(role));
    if (unknown.length > 0) {
      return { skipped: `appRoles has unknown role(s): ${unknown.join(", ")}` };
    }
    body.targetRoles = roles;
  }

  return { body };
}

/**
 * Turns a site-relative `readMoreUrl` into an absolute https URL. Returns null
 * for an empty value or a URL on another scheme, which the endpoint refuses.
 */
function absoluteUrl(value, siteOrigin) {
  const raw = typeof value === "string" ? value.trim() : "";
  if (!raw) return null;
  if (raw.startsWith("https://")) return raw;
  if (raw.startsWith("/")) return `${siteOrigin}${raw}`;
  return null;
}

/** True when the URL answers 200 with an image content type. */
async function imageLoads(url) {
  try {
    const response = await fetch(url, { method: "HEAD", redirect: "follow" });
    const type = response.headers.get("content-type") ?? "";
    return response.ok && type.startsWith("image/");
  } catch {
    return false;
  }
}

/**
 * Posts one draft. Resolves with the created id, or rejects with a message
 * that names the HTTP status and the endpoint's own error text.
 */
async function postDraft(endpoint, key, body) {
  const response = await fetch(endpoint, {
    method: "POST",
    headers: {
      Authorization: `Bearer ${key}`,
      "Content-Type": "application/json",
    },
    body: JSON.stringify(body),
  });

  const text = await response.text();
  if (response.status === 201) {
    return JSON.parse(text).update.id;
  }
  if (response.status === 404) {
    throw new Error(
      "404: the endpoint is off (UPDATE_DRAFTS_API_KEY not set on the app, or the app version without it is deployed)"
    );
  }
  let detail = text;
  try {
    detail = JSON.parse(text).error?.message ?? text;
  } catch {
    // The body was not JSON; the raw text is the best detail there is.
  }
  throw new Error(`${response.status}: ${detail}`);
}

async function main(argv) {
  const dryRun = argv.includes("--dry-run");
  const entries = argv.filter((arg) => arg !== "--dry-run");
  if (entries.length === 0) {
    console.log("No entries given, nothing to file.");
    return 0;
  }

  const endpoint =
    process.env.UPDATE_DRAFTS_ENDPOINT ?? "https://app.shelf.nu/api/update-drafts";
  const siteOrigin = (process.env.SITE_ORIGIN ?? "https://www.shelf.nu").replace(/\/$/, "");
  const authorEmail = process.env.UPDATE_DRAFTS_AUTHOR ?? "";
  const key = process.env.UPDATE_DRAFTS_API_KEY ?? "";

  if (!authorEmail) {
    console.error("UPDATE_DRAFTS_AUTHOR is not set.");
    return 1;
  }
  if (!dryRun && !key) {
    console.error("UPDATE_DRAFTS_API_KEY is not set.");
    return 1;
  }

  let failed = 0;
  for (const entryPath of entries) {
    const source = await readFile(entryPath, "utf8");
    const result = buildDraft(entryPath, source, { siteOrigin, authorEmail });

    if ("skipped" in result) {
      console.log(`skip  ${entryPath}: ${result.skipped}`);
      continue;
    }

    const { body } = result;
    if (body.imageUrl && !(await imageLoads(body.imageUrl))) {
      console.log(`note  ${entryPath}: image does not load, filing without it (${body.imageUrl})`);
      delete body.imageUrl;
    }

    if (dryRun) {
      console.log(`would file ${entryPath}:\n${JSON.stringify(body, null, 2)}`);
      continue;
    }

    try {
      const id = await postDraft(endpoint, key, body);
      console.log(`filed ${entryPath} as draft ${id}: "${body.title}"`);
    } catch (error) {
      failed += 1;
      console.error(`FAILED ${entryPath}: ${error.message}`);
    }
  }

  return failed > 0 ? 1 : 0;
}

if (import.meta.url === pathToFileURL(process.argv[1]).href) {
  process.exitCode = await main(process.argv.slice(2));
}
