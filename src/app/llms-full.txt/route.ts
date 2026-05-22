import { getAllContent, type ContentType, type MDXContent } from "@/lib/mdx";

export const dynamic = "force-static";

// Sections bundled into llms-full.txt. Ordered by LLM-reading priority:
// product capabilities first, then use cases, competitive comparisons,
// definitions, and conceptual content. Volatile content (blog, updates,
// case-studies) and high-volume reference content (knowledge-base) are
// intentionally excluded — they remain linked from llms.txt with stable
// URLs that agents can fetch individually.
const SECTIONS: { type: ContentType; heading: string }[] = [
    { type: "features", heading: "Features" },
    { type: "solutions", heading: "Solutions" },
    { type: "industries", heading: "Industries" },
    { type: "use-cases", heading: "Use Cases" },
    { type: "alternatives", heading: "Comparisons" },
    { type: "glossary", heading: "Glossary" },
    { type: "concepts", heading: "Concepts" },
];

function renderEntry({ frontmatter, content }: MDXContent): string {
    const lines: string[] = [
        `## ${frontmatter.title}`,
        "",
        `URL: ${frontmatter.canonicalUrl}`,
    ];

    if (frontmatter.description) {
        lines.push("", frontmatter.description);
    }

    lines.push("", content.trim());
    return lines.join("\n");
}

function renderSection(type: ContentType, heading: string): string {
    const entries = getAllContent(type);
    if (entries.length === 0) return "";

    const parts = [`# ${heading}`, ""];
    for (const entry of entries) {
        parts.push(renderEntry(entry), "", "---", "");
    }
    return parts.join("\n");
}

export function GET() {
    const header = [
        "# Shelf — Full Content Bundle",
        "",
        "> Consolidated bundle of Shelf's marketing site content for LLM ingestion.",
        "> See https://www.shelf.nu/llms.txt for the structured index with link descriptions.",
        "",
        "This file concatenates Features, Solutions, Industries, Use Cases,",
        "Comparisons, Glossary, and Concepts. Knowledge base articles, blog posts,",
        "product updates, and case studies are linked from llms.txt with stable URLs.",
        "",
    ].join("\n");

    const body = SECTIONS
        .map(({ type, heading }) => renderSection(type, heading))
        .filter(Boolean)
        .join("\n");

    return new Response(header + "\n" + body, {
        headers: {
            "Content-Type": "text/plain; charset=utf-8",
            "Cache-Control": "public, max-age=0, s-maxage=3600, stale-while-revalidate=86400",
        },
    });
}
