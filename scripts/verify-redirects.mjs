#!/usr/bin/env node
// Guards public/_redirects against the Cloudflare Pages cutoff measured on 2026-10-05:
// rules past about the 135th rule / 11 KB were silently ignored in production (rule 134 at byte 10,895 still worked).
import { readFileSync } from "fs";
const MAX_RULES = 130, MAX_BYTES = 10800, CANARY = "/blog/redirect-canary";
const text = readFileSync(new URL("../public/_redirects", import.meta.url), "utf8");
const rules = text.split("\n").filter((l) => l.trim() && !l.startsWith("#"));
const problems = [];
for (const r of rules) {
  const parts = r.trim().split(/\s+/);
  if (parts.length < 2 || parts.length > 3 || !parts[0].startsWith("/") || (parts[2] && !/^(200|301|302|303|307|308|404|410)$/.test(parts[2])))
    problems.push(`malformed rule: ${r}`);
}
if (rules.length > MAX_RULES) problems.push(`${rules.length} rules, limit ${MAX_RULES}`);
if (Buffer.byteLength(text) > MAX_BYTES) problems.push(`${Buffer.byteLength(text)} bytes, limit ${MAX_BYTES}`);
if (!rules.at(-1)?.startsWith(CANARY + " ")) problems.push(`last rule must be the canary ${CANARY}`);
if (problems.length) { console.error("❌ public/_redirects:\n  " + problems.join("\n  ")); process.exit(1); }
console.log(`✓ _redirects: ${rules.length} rules, ${Buffer.byteLength(text)} bytes, canary last`);
