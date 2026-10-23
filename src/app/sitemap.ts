import { MetadataRoute } from "next";
import { getAllContent, ContentType } from "@/lib/mdx";
import { contentModifiedDate } from "@/lib/seo";

export const dynamic = "force-static";

import { BASE_URL as baseUrl } from "@/lib/site-url";

/* ------------------------------------------------------------------ */
/*  Helper: build entries for a given MDX content type                 */
/* ------------------------------------------------------------------ */
function contentEntries(
    type: ContentType,
    urlPrefix: string,
    opts: { changeFrequency: MetadataRoute.Sitemap[number]["changeFrequency"]; priority: number },
): MetadataRoute.Sitemap {
    // A page marked `seo.noindex` asks search engines to skip it, so it stays out of the sitemap too.
    return getAllContent(type).filter((item) => !item.frontmatter.seo?.noindex).map((item) => {
        // The last real edit: `updated` when it is a valid date, else the
        // publish date, the same rule as the page's dateModified. With neither,
        // leave lastmod out rather than claim the page changed at build time.
        const lastMod = contentModifiedDate(item.frontmatter) ?? item.frontmatter.date;

        return {
            url: `${baseUrl}${urlPrefix}/${item.slug}`,
            ...(lastMod ? { lastModified: new Date(lastMod) } : {}),
            changeFrequency: opts.changeFrequency,
            priority: opts.priority,
        };
    });
}

/* ------------------------------------------------------------------ */
/*  Sitemap                                                            */
/* ------------------------------------------------------------------ */
export default function sitemap(): MetadataRoute.Sitemap {
    // 1. Static marketing pages.
    // No lastModified: these pages have no edit date to read, and stamping the
    // build time on every deploy told search engines they all changed daily,
    // which teaches them to ignore lastmod for the whole site.
    const staticRoutes: MetadataRoute.Sitemap = [
        { path: "", priority: 1.0 },
        { path: "/pricing", priority: 0.9 },
        { path: "/contact", priority: 0.7 },
        { path: "/migrate", priority: 0.7 },
        { path: "/demo", priority: 0.8 },
        { path: "/mobile-app", priority: 0.8 },
        { path: "/customers", priority: 0.7 },
        { path: "/resources", priority: 0.7 },
        { path: "/brand-assets", priority: 0.3 },
        // /design-system is an internal UI reference (noindex) — excluded from sitemap.
        // /get-app is the QR code's store redirect (noindex) — excluded from sitemap.
        // Index pages for content sections
        { path: "/features", priority: 0.9 },
        { path: "/solutions", priority: 0.9 },
        { path: "/case-studies", priority: 0.8 },
        { path: "/blog", priority: 0.8 },
        { path: "/updates", priority: 0.7 },
        { path: "/glossary", priority: 0.6 },
        { path: "/knowledge-base", priority: 0.7 },
        { path: "/industries", priority: 0.7 },
        { path: "/alternatives", priority: 0.7 },
        // Legal pages
        { path: "/terms", priority: 0.3 },
        { path: "/privacy", priority: 0.3 },
        { path: "/security", priority: 0.4 },
        // About
        { path: "/about", priority: 0.7 },
        // /product is a redirect to /features — not a real page, excluded from sitemap.
        // Tools
        { path: "/tools", priority: 0.6 },
        { path: "/tools/qr-code-generator", priority: 0.6 },
        { path: "/tools/barcode-scanner", priority: 0.6 },
        { path: "/tools/qr-code-scanner", priority: 0.6 },
        { path: "/tools/blurry-qr-code-reader", priority: 0.6 },
        { path: "/tools/barcode-generator", priority: 0.6 },
        { path: "/tools/asset-label-designer", priority: 0.5 },
        { path: "/tools/macrs-depreciation-calculator", priority: 0.7 },
        { path: "/tools/equipment-depreciation-calculator", priority: 0.7 },
        { path: "/tools/salvage-value-calculator", priority: 0.7 },
    ].map(({ path, priority }) => ({
        url: `${baseUrl}${path}`,
        changeFrequency: "monthly" as const,
        priority,
    }));

    // 2. All MDX-driven content types
    const features = contentEntries("features", "/features", { changeFrequency: "weekly", priority: 0.9 });
    const solutions = contentEntries("solutions", "/solutions", { changeFrequency: "weekly", priority: 0.9 });
    const blog = contentEntries("blog", "/blog", { changeFrequency: "weekly", priority: 0.7 });
    const caseStudies = contentEntries("case-studies", "/case-studies", { changeFrequency: "monthly", priority: 0.8 });
    const alternatives = contentEntries("alternatives", "/alternatives", { changeFrequency: "monthly", priority: 0.7 });
    const industries = contentEntries("industries", "/industries", { changeFrequency: "monthly", priority: 0.7 });
    const glossary = contentEntries("glossary", "/glossary", { changeFrequency: "monthly", priority: 0.6 });
    // Note: individual /updates/* pages are noindexed (thin changelog content)
    // so they are excluded from the sitemap. The /updates index page is still
    // included in staticRoutes above.
    const knowledgeBase = contentEntries("knowledge-base", "/knowledge-base", { changeFrequency: "monthly", priority: 0.6 });

    return [
        ...staticRoutes,
        ...features,
        ...solutions,
        ...blog,
        ...caseStudies,
        ...alternatives,
        ...industries,
        ...glossary,
        ...knowledgeBase,
    ];
}
