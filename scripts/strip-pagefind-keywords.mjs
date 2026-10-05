#!/usr/bin/env node

/**
 * strip-pagefind-keywords.mjs
 * ---------------------------
 * Removes PagefindWrapper's hidden keyword block from the built site AFTER
 * Pagefind has indexed it.
 *
 * Why: PagefindWrapper renders each page's primary search terms as
 *   <div data-pagefind-weight="10" class="sr-only" aria-hidden="true">…</div>
 * so Cmd+K search ranks the page for them. Pagefind needs that text in the HTML
 * at index time, but nobody needs it afterwards: the index keeps the boosted
 * terms, and Pagefind never re-reads the HTML at query time. Leaving it in the
 * deployed HTML means shipping a keyword list that is invisible to visitors and
 * hidden from screen readers, which is the pattern Google's spam policy calls
 * "hidden text". Removing it keeps the search boost and drops that risk.
 *
 * The block lives in three places, and all three must go together:
 *   1. The HTML element itself.
 *   2. The inline React payload in the same HTML file
 *      (<script>self.__next_f.push([1,"…"])</script>), which React hydrates from.
 *      Removing only the HTML makes hydration fail, and React then re-renders the
 *      page on the client and puts the block back. The element is replaced with
 *      `null`, so the payload and the stripped HTML agree.
 *   3. The .txt payloads Next fetches for client-side navigation (__next.*.txt,
 *      <route>.txt), which would otherwise re-create the block after a soft nav.
 *
 * This only works when PagefindWrapper is rendered by a SERVER component. From a
 * client component the keywords sit in a JS chunk, and hydration renders the block
 * no matter what the HTML says. The script fails the build in that case, and when
 * any trace of the block is left anywhere in the output.
 *
 * Runs in `npm run build` after `search:index` and before `search:dev`, so the
 * index (and its copy in public/pagefind for dev) keeps the boost. `next dev`
 * still renders the block; nothing is stripped in development.
 *
 * The patterns below mirror the element in
 * src/components/search/pagefind-wrapper.tsx. Change one, change the other; the
 * leftover check fails the build if they drift.
 *
 * Usage: node scripts/strip-pagefind-keywords.mjs [out-dir]   (default: out)
 */

import { readdirSync, readFileSync, writeFileSync } from "node:fs";
import { join, relative, resolve } from "node:path";

const MARKER = "data-pagefind-weight";

// 1. The rendered element. React writes a single string child as escaped text,
//    so the body never contains "<".
const HTML_BLOCK_RE = /<div data-pagefind-weight="10" class="sr-only" aria-hidden="true">[^<]*<\/div>/g;

// 2 and 3. The same element in React's payload format: ["$", type, key, props].
//    The children string is JSON, so it may contain escaped quotes.
const PAYLOAD_ELEMENT_RE =
    /\["\$","div",null,\{"data-pagefind-weight":"10","className":"sr-only","aria-hidden":"true","children":"(?:[^"\\]|\\.)*"\}\]/g;
const PAYLOAD_REPLACEMENT = "null";

// The inline payload chunks. Next writes each as
// self.__next_f.push(htmlEscapeJsonString(JSON.stringify([1, chunk]))).
const INLINE_CHUNK_RE = /(<script[^>]*>self\.__next_f\.push\(\[1,)("(?:[^"\\]|\\.)*")(\]\)<\/script>)/g;

// Mirrors Next's htmlEscapeJsonString (next/dist/server/htmlescape).
const HTML_ESCAPES = { "&": "\\u0026", ">": "\\u003e", "<": "\\u003c", "\u2028": "\\u2028", "\u2029": "\\u2029" };
const encodeChunk = (text) => JSON.stringify(text).replace(/[&><\u2028\u2029]/g, (c) => HTML_ESCAPES[c]);

function listFiles(dir) {
    const files = [];
    for (const entry of readdirSync(dir, { withFileTypes: true })) {
        const full = join(dir, entry.name);
        if (entry.isDirectory()) files.push(...listFiles(full));
        else if (entry.isFile()) files.push(full);
    }
    return files;
}

/** Replaces every payload element with `null`. Returns the new text, the count and the removed ranges. */
function stripPayloadText(text) {
    const ranges = [];
    const out = text.replace(PAYLOAD_ELEMENT_RE, (match, offset) => {
        ranges.push({ start: offset, end: offset + match.length });
        return PAYLOAD_REPLACEMENT;
    });
    return { text: out, count: ranges.length, ranges };
}

/**
 * Strips the element from a page's inline payload. React can split one element
 * across two push() chunks, so the chunks are joined, stripped, and cut back
 * into the same number of chunks at shifted boundaries. Scripts whose chunk did
 * not change are left byte-for-byte as they were.
 */
function stripInlinePayload(html, file) {
    const scripts = [...html.matchAll(INLINE_CHUNK_RE)];
    if (scripts.length === 0) return { html, count: 0 };

    const chunks = scripts.map((m) => JSON.parse(m[2]));
    const joined = chunks.join("");
    const { text: stripped, count, ranges } = stripPayloadText(joined);
    if (count === 0) return { html, count: 0 };

    // Map an offset in the joined text to its offset after stripping. A chunk
    // boundary that fell inside a removed element moves to just after its `null`.
    const mapOffset = (pos) => {
        let shift = 0;
        for (const { start, end } of ranges) {
            if (pos <= start) break;
            if (pos < end) return start - shift + PAYLOAD_REPLACEMENT.length;
            shift += end - start - PAYLOAD_REPLACEMENT.length;
        }
        return pos - shift;
    };

    let pos = 0;
    const replacements = new Map(); // script index -> new script tag
    chunks.forEach((chunk, i) => {
        const from = mapOffset(pos);
        pos += chunk.length;
        const next = stripped.slice(from, mapOffset(pos));
        if (next === chunk) return;
        const m = scripts[i];
        // Re-encoding must reproduce Next's encoding exactly, or the rest of the
        // chunk would change too. Check it on the original before trusting it.
        if (encodeChunk(chunk) !== m[2]) {
            throw new Error(`${file}: inline payload chunk ${i} does not round-trip through Next's encoding`);
        }
        replacements.set(m.index, m[1] + encodeChunk(next) + m[3]);
    });

    let result = "";
    let last = 0;
    for (const m of scripts) {
        if (!replacements.has(m.index)) continue;
        result += html.slice(last, m.index) + replacements.get(m.index);
        last = m.index + m[0].length;
    }
    return { html: result + html.slice(last), count };
}

const outDir = resolve(process.cwd(), process.argv[2] || "out");
const files = listFiles(outDir);
const errors = [];
let pagesStripped = 0;
let navPayloadsStripped = 0;

for (const file of files) {
    const rel = relative(outDir, file);

    if (file.endsWith(".html")) {
        const original = readFileSync(file, "utf8");
        if (!original.includes(MARKER)) continue;

        let htmlBlocks = 0;
        const withoutBlocks = original.replace(HTML_BLOCK_RE, () => {
            htmlBlocks++;
            return "";
        });
        const { html, count: payloadElements } = stripInlinePayload(withoutBlocks, rel);

        // One block in the HTML must match one element in the payload. Otherwise
        // the page and the data React hydrates it from disagree, which usually
        // means PagefindWrapper was rendered by a client component.
        if (htmlBlocks !== payloadElements) {
            errors.push(
                `${rel}: removed ${htmlBlocks} keyword block(s) from the HTML but ${payloadElements} from the inline ` +
                    `React payload. If PagefindWrapper is rendered by a "use client" component on this page, render it ` +
                    `from the server page.tsx instead (see src/app/(marketing)/pricing/page.tsx).`,
            );
            continue;
        }
        if (htmlBlocks > 0) {
            writeFileSync(file, html);
            pagesStripped++;
        }
    } else if (file.endsWith(".txt")) {
        const original = readFileSync(file, "utf8");
        if (!original.includes(MARKER)) continue;
        const { text, count } = stripPayloadText(original);
        if (count > 0) {
            writeFileSync(file, text);
            navPayloadsStripped++;
        }
    }
}

// Nothing may be left anywhere in the output: HTML, payloads, JS chunks.
const leftovers = errors.length ? [] : files.filter((f) => readFileSync(f).includes(MARKER)).map((f) => relative(outDir, f));

if (errors.length || leftovers.length) {
    console.error("\n❌  Stripping the Pagefind keyword blocks FAILED\n");
    for (const e of errors) console.error(`   ${e}`);
    if (leftovers.length) {
        console.error(`   "${MARKER}" is still present in ${leftovers.length} file(s):`);
        for (const f of leftovers.slice(0, 20)) console.error(`     ${f}`);
        console.error(
            "\n   A match in a .js chunk means a client component renders PagefindWrapper; render it from a server\n" +
                "   component. A match in .html/.txt means the element no longer matches the patterns in this script;\n" +
                "   update them to mirror src/components/search/pagefind-wrapper.tsx.",
        );
    }
    console.error("");
    process.exit(1);
}

console.log(
    `✅  Stripped the Pagefind keyword block from ${pagesStripped} pages and ${navPayloadsStripped} navigation payloads ` +
        `(the search index keeps the boost)`,
);
