#!/usr/bin/env node

/**
 * IndexNow — tells Bing (and Copilot) which pages changed, right after a
 * production deploy. The mapping rules live in scripts/lib/indexnow.mjs.
 *
 * Usage:
 *   node scripts/indexnow.mjs --changed <base-sha> <head-sha>   pages this push changed
 *   node scripts/indexnow.mjs --all                             every URL in the sitemap
 *   add --dry-run to print the list without sending it
 *
 * Reads the sitemap from out/sitemap.xml, so run it after `npm run build`.
 * Always exits 0: the deploy has already gone out by the time this runs.
 */

import { execFileSync } from "node:child_process";
import { readFileSync } from "node:fs";
import { parseSitemapUrls, parseNameStatus, urlsForChanges, submitToIndexNow } from "./lib/indexnow.mjs";

const ORIGIN = process.env.NEXT_PUBLIC_APP_URL || "https://www.shelf.nu";
const args = process.argv.slice(2);
const dryRun = args.includes("--dry-run");

function main() {
    let sitemapUrls;
    try {
        sitemapUrls = parseSitemapUrls(readFileSync("out/sitemap.xml", "utf8"));
    } catch (err) {
        console.log(`IndexNow skipped: cannot read out/sitemap.xml (${err.message})`);
        return null;
    }

    if (args.includes("--all")) return sitemapUrls;

    const i = args.indexOf("--changed");
    const [base, head] = i === -1 ? [] : args.slice(i + 1, i + 3);
    // A new branch or a force push reports an all-zero "before" sha.
    if (!base || !head || /^0+$/.test(base)) {
        console.log("IndexNow skipped: no base commit to compare with.");
        return null;
    }

    let diff;
    try {
        diff = execFileSync("git", ["diff", "--name-status", "-M", base, head], { encoding: "utf8" });
    } catch (err) {
        console.log(`IndexNow skipped: git diff ${base}..${head} failed (${err.message})`);
        return null;
    }
    return urlsForChanges(parseNameStatus(diff), sitemapUrls, ORIGIN);
}

const urls = main();
if (urls) {
    console.log(urls.length ? `IndexNow: ${urls.length} URL(s)\n  ${urls.join("\n  ")}` : "IndexNow: no page changed.");
    if (urls.length && !dryRun) {
        const { failed } = await submitToIndexNow(urls, { origin: ORIGIN });
        if (failed) console.log(`::warning::IndexNow did not accept ${failed} URL(s); search engines will still find them on their own schedule.`);
    }
}
