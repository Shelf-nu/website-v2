import { test } from "node:test";
import assert from "node:assert/strict";
import {
    parseSitemapUrls,
    pathsForFile,
    parseNameStatus,
    urlsForChanges,
    submitToIndexNow,
    INDEXNOW_KEY,
} from "./indexnow.mjs";

const ORIGIN = "https://www.shelf.nu";
const SITEMAP = [
    "",
    "/blog",
    "/blog/asset-tags-guide",
    "/solutions",
    "/solutions/it-asset-management",
    "/knowledge-base",
    "/knowledge-base/kits",
    "/updates",
    "/terms",
    "/tools/barcode-scanner",
    "/pricing",
].map((p) => `${ORIGIN}${p}`);

test("parseSitemapUrls reads every <loc>", () => {
    const xml = `<urlset><url><loc>https://www.shelf.nu</loc></url><url><loc>
      https://www.shelf.nu/blog</loc></url></urlset>`;
    assert.deepEqual(parseSitemapUrls(xml), ["https://www.shelf.nu", "https://www.shelf.nu/blog"]);
});

test("content files map to their page and their section index", () => {
    assert.deepEqual(pathsForFile("content/blog/asset-tags-guide.mdx"), ["/blog/asset-tags-guide", "/blog"]);
    assert.deepEqual(pathsForFile("content/knowledge-base/kits.mdx"), ["/knowledge-base/kits", "/knowledge-base"]);
    assert.deepEqual(pathsForFile("content/pages/terms.mdx"), ["/terms"]);
    assert.deepEqual(pathsForFile("content/updates/some-update.mdx"), ["/updates"]);
    assert.deepEqual(pathsForFile("content/unknown/x.mdx"), []);
});

test("static route folders map to their URL, dynamic ones and shared code do not", () => {
    assert.deepEqual(pathsForFile("src/app/(marketing)/page.tsx"), [""]);
    assert.deepEqual(pathsForFile("src/app/(marketing)/pricing/page.tsx"), ["/pricing"]);
    assert.deepEqual(pathsForFile("src/app/(marketing)/tools/barcode-scanner/scanner.tsx"), ["/tools/barcode-scanner"]);
    assert.deepEqual(pathsForFile("src/app/(marketing)/blog/[slug]/page.tsx"), []);
    assert.deepEqual(pathsForFile("src/components/layout/navbar.tsx"), []);
    assert.deepEqual(pathsForFile("data/seo-experiments.json"), []);
});

test("parseNameStatus handles adds, edits, deletes and renames", () => {
    const out = "M\tcontent/blog/a.mdx\nD\tcontent/blog/b.mdx\nR092\tcontent/blog/c.mdx\tcontent/blog/d.mdx\n";
    assert.deepEqual(parseNameStatus(out), [
        { status: "M", path: "content/blog/a.mdx" },
        { status: "D", path: "content/blog/b.mdx" },
        { status: "R", path: "content/blog/d.mdx", oldPath: "content/blog/c.mdx" },
    ]);
});

test("urlsForChanges sends listed pages only, plus deleted and renamed-away pages", () => {
    const changes = [
        { status: "M", path: "content/solutions/it-asset-management.mdx" },
        { status: "M", path: "src/app/(marketing)/pricing/page.tsx" },
        { status: "M", path: "src/components/layout/footer.tsx" },
        { status: "D", path: "content/blog/old-post.mdx" },
        { status: "R", path: "content/knowledge-base/kits.mdx", oldPath: "content/knowledge-base/kit-basics.mdx" },
        // In the diff but noindexed, so not in the sitemap: skipped.
        { status: "A", path: "content/blog/noindexed-post.mdx" },
    ];
    assert.deepEqual(urlsForChanges(changes, SITEMAP, ORIGIN), [
        `${ORIGIN}/blog`,
        `${ORIGIN}/blog/old-post`,
        `${ORIGIN}/knowledge-base`,
        `${ORIGIN}/knowledge-base/kit-basics`,
        `${ORIGIN}/knowledge-base/kits`,
        `${ORIGIN}/pricing`,
        `${ORIGIN}/solutions`,
        `${ORIGIN}/solutions/it-asset-management`,
    ]);
});

test("urlsForChanges returns nothing for a push that touches no page", () => {
    assert.deepEqual(urlsForChanges([{ status: "M", path: "README.md" }], SITEMAP, ORIGIN), []);
});

test("submitToIndexNow posts host, key, key location and the URL list", async () => {
    const calls = [];
    const fetch = async (url, init) => {
        calls.push({ url, body: JSON.parse(init.body) });
        return { status: 202, text: async () => "" };
    };
    const result = await submitToIndexNow([`${ORIGIN}/pricing`], { origin: ORIGIN, fetch, log: () => {} });
    assert.deepEqual(result, { sent: 1, failed: 0 });
    assert.equal(calls[0].url, "https://api.indexnow.org/indexnow");
    assert.deepEqual(calls[0].body, {
        host: "www.shelf.nu",
        key: INDEXNOW_KEY,
        keyLocation: `${ORIGIN}/${INDEXNOW_KEY}.txt`,
        urlList: [`${ORIGIN}/pricing`],
    });
});

test("submitToIndexNow reports refusals and network errors without throwing", async () => {
    const refused = async () => ({ status: 403, text: async () => "key not valid" });
    assert.deepEqual(await submitToIndexNow(["u"], { origin: ORIGIN, fetch: refused, log: () => {} }), { sent: 0, failed: 1 });
    const broken = async () => {
        throw new Error("ECONNRESET");
    };
    assert.deepEqual(await submitToIndexNow(["u"], { origin: ORIGIN, fetch: broken, log: () => {} }), { sent: 0, failed: 1 });
});
