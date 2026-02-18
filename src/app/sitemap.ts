import { MetadataRoute } from "next";
import { getAllContent, ContentType } from "@/lib/mdx";

export const dynamic = "force-static";

const baseUrl = process.env.NEXT_PUBLIC_APP_URL || "https://shelf.nu";

/* ------------------------------------------------------------------ */
/*  Helper: build entries for a given MDX content type                 */
/* ------------------------------------------------------------------ */
function contentEntries(
    type: ContentType,
    urlPrefix: string,
    opts: { changeFrequency: MetadataRoute.Sitemap[number]["changeFrequency"]; priority: number },
): MetadataRoute.Sitemap {
    return getAllContent(type).map((item) => {
        // Prefer frontmatter date → updated → fall back to now
        const lastMod = item.frontmatter.date
            ? new Date(item.frontmatter.date)
            : new Date();

        return {
            url: `${baseUrl}${urlPrefix}/${item.slug}`,
            lastModified: lastMod,
            changeFrequency: opts.changeFrequency,
            priority: opts.priority,
        };
    });
}

/* ------------------------------------------------------------------ */
/*  Sitemap                                                            */
/* ------------------------------------------------------------------ */
export default function sitemap(): MetadataRoute.Sitemap {
    // 1. Static marketing pages
    const staticRoutes: MetadataRoute.Sitemap = [
        { path: "", priority: 1.0 },
        { path: "/pricing", priority: 0.9 },
        { path: "/contact", priority: 0.7 },
        { path: "/migrate", priority: 0.7 },
        { path: "/demo", priority: 0.8 },
        { path: "/customers", priority: 0.7 },
        { path: "/resources", priority: 0.7 },
        { path: "/brand-assets", priority: 0.3 },
        { path: "/design-system", priority: 0.2 },
        // Index pages for content sections
        { path: "/features", priority: 0.9 },
        { path: "/solutions", priority: 0.9 },
        { path: "/case-studies", priority: 0.8 },
        { path: "/blog", priority: 0.8 },
        { path: "/updates", priority: 0.7 },
        { path: "/glossary", priority: 0.6 },
        { path: "/knowledge-base", priority: 0.7 },
        { path: "/industries", priority: 0.7 },
        { path: "/use-cases", priority: 0.7 },
        { path: "/concepts", priority: 0.5 },
        { path: "/alternatives", priority: 0.7 },
        // Legal pages
        { path: "/terms", priority: 0.3 },
        { path: "/privacy", priority: 0.3 },
        { path: "/security", priority: 0.4 },
        // Tools
        { path: "/tools", priority: 0.6 },
        { path: "/tools/qr-code-generator", priority: 0.6 },
        { path: "/tools/qr-code-decoder", priority: 0.5 },
        { path: "/tools/asset-label-designer", priority: 0.5 },
    ].map(({ path, priority }) => ({
        url: `${baseUrl}${path}`,
        lastModified: new Date(),
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
    const useCases = contentEntries("use-cases", "/use-cases", { changeFrequency: "monthly", priority: 0.7 });
    const concepts = contentEntries("concepts", "/concepts", { changeFrequency: "monthly", priority: 0.5 });
    const glossary = contentEntries("glossary", "/glossary", { changeFrequency: "monthly", priority: 0.6 });
    const updates = contentEntries("updates", "/updates", { changeFrequency: "weekly", priority: 0.6 });
    const knowledgeBase = contentEntries("knowledge-base", "/knowledge-base", { changeFrequency: "monthly", priority: 0.6 });

    return [
        ...staticRoutes,
        ...features,
        ...solutions,
        ...blog,
        ...caseStudies,
        ...alternatives,
        ...industries,
        ...useCases,
        ...concepts,
        ...glossary,
        ...updates,
        ...knowledgeBase,
    ];
}
