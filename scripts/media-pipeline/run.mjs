#!/usr/bin/env node

/**
 * CLI runner for the media pipeline.
 *
 * Usage:
 *   node scripts/media-pipeline/run.mjs export-workspace-data
 *   node scripts/media-pipeline/run.mjs all
 */

import { resolve, dirname } from "node:path";
import { fileURLToPath } from "node:url";

const __dirname = dirname(fileURLToPath(import.meta.url));

const ARTICLES = {
  "export-workspace-data": "articles/export-workspace-data.mjs",
  // Future articles:
  // "understanding-custom-property-ids": "articles/understanding-custom-property-ids.mjs",
  // "understanding-pdf-agreements": "articles/understanding-pdf-agreements.mjs",
  // "how-to-add-assets": "articles/how-to-add-assets.mjs",
  // "how-to-upgrade-to-team": "articles/how-to-upgrade-to-team.mjs",
};

const slug = process.argv[2];

if (!slug) {
  console.log("Usage: node scripts/media-pipeline/run.mjs <article-slug|all>\n");
  console.log("Available articles:");
  for (const [name] of Object.entries(ARTICLES)) {
    console.log(`  ${name}`);
  }
  process.exit(0);
}

const articlesToRun =
  slug === "all" ? Object.entries(ARTICLES) : [[slug, ARTICLES[slug]]];

for (const [name, scriptPath] of articlesToRun) {
  if (!scriptPath) {
    console.error(`Unknown article: ${name}`);
    console.log("Available:", Object.keys(ARTICLES).join(", "));
    process.exit(1);
  }

  console.log(`\n${"=".repeat(60)}`);
  console.log(`Running: ${name}`);
  console.log(`${"=".repeat(60)}\n`);

  await import(resolve(__dirname, scriptPath));
}
