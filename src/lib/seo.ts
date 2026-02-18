import { Metadata } from "next";
import { Frontmatter } from "./content/schema";
import { ContentType } from "./mdx";

const BASE_URL = process.env.NEXT_PUBLIC_APP_URL || "https://shelf.nu";

/* ------------------------------------------------------------------ */
/*  Shared generateMetadata builder for every MDX content type         */
/* ------------------------------------------------------------------ */

type OgType = "article" | "website";

interface ContentSeoConfig {
    /** The ContentType (used for canonical fallback) */
    type: ContentType;
    /** URL path prefix, e.g. "/blog" */
    urlPrefix: string;
    /** OpenGraph type — "article" for editorial content, "website" for product pages */
    ogType: OgType;
    /** Title suffix shown after the | in the tab, e.g. "Shelf Blog" */
    titleSuffix?: string;
}

/** Central config per content type. */
export const CONTENT_SEO: Record<string, ContentSeoConfig> = {
    blog:             { type: "blog",           urlPrefix: "/blog",           ogType: "article", titleSuffix: "Shelf Blog" },
    "knowledge-base": { type: "knowledge-base", urlPrefix: "/knowledge-base", ogType: "article", titleSuffix: "Shelf Knowledge Base" },
    updates:          { type: "updates",        urlPrefix: "/updates",        ogType: "article", titleSuffix: "Shelf Updates" },
    features:         { type: "features",       urlPrefix: "/features",       ogType: "website" },
    solutions:        { type: "solutions",      urlPrefix: "/solutions",      ogType: "website" },
    "case-studies":   { type: "case-studies",    urlPrefix: "/case-studies",   ogType: "article", titleSuffix: "Shelf Case Studies" },
    alternatives:     { type: "alternatives",   urlPrefix: "/alternatives",   ogType: "website" },
    industries:       { type: "industries",     urlPrefix: "/industries",     ogType: "website" },
    "use-cases":      { type: "use-cases",      urlPrefix: "/use-cases",      ogType: "website" },
    concepts:         { type: "concepts",       urlPrefix: "/concepts",       ogType: "article" },
    glossary:         { type: "glossary",       urlPrefix: "/glossary",       ogType: "website" },
};

/**
 * Builds a complete Metadata object for an MDX content page.
 * Respects frontmatter.seo overrides, canonicalUrl, date, image, author.
 */
export function buildContentMetadata(
    slug: string,
    frontmatter: Frontmatter,
    configKey: string,
): Metadata {
    const cfg = CONTENT_SEO[configKey];
    if (!cfg) {
        // Fallback for unknown types
        return { title: frontmatter.title, description: frontmatter.description };
    }

    const title = frontmatter.seo?.title || frontmatter.title;
    const description = frontmatter.seo?.description || frontmatter.description;
    const canonical = frontmatter.canonicalUrl
        ? (frontmatter.canonicalUrl.startsWith("http") ? frontmatter.canonicalUrl : `${BASE_URL}${frontmatter.canonicalUrl}`)
        : `${BASE_URL}${cfg.urlPrefix}/${slug}`;
    const ogImage = frontmatter.image
        ? (frontmatter.image.startsWith("http") ? frontmatter.image : `${BASE_URL}${frontmatter.image}`)
        : `${BASE_URL}/og.webp`;

    const metadata: Metadata = {
        title,
        description,
        alternates: { canonical },
        openGraph: {
            title,
            description,
            url: canonical,
            type: cfg.ogType,
            siteName: "Shelf",
            images: [{ url: ogImage, width: 1200, height: 630 }],
            ...(cfg.ogType === "article" && frontmatter.date
                ? { publishedTime: frontmatter.date }
                : {}),
            ...(cfg.ogType === "article" && frontmatter.author
                ? { authors: [frontmatter.author] }
                : {}),
        },
        twitter: {
            card: "summary_large_image",
            title,
            description,
            images: [ogImage],
        },
    };

    // Respect noindex if frontmatter says so
    if (frontmatter.seo?.noindex) {
        metadata.robots = { index: false, follow: false };
    }

    // Add keywords if available
    if (frontmatter.seo?.keywords?.length) {
        metadata.keywords = frontmatter.seo.keywords;
    }

    return metadata;
}

/* ------------------------------------------------------------------ */
/*  JSON-LD helpers                                                    */
/* ------------------------------------------------------------------ */

interface BreadcrumbItem {
    name: string;
    href: string;
}

/**
 * Renders a BreadcrumbList JSON-LD script tag.
 */
export function breadcrumbJsonLd(items: BreadcrumbItem[]): Record<string, unknown> {
    return {
        "@context": "https://schema.org",
        "@type": "BreadcrumbList",
        itemListElement: items.map((item, i) => ({
            "@type": "ListItem",
            position: i + 1,
            name: item.name,
            item: item.href.startsWith("http") ? item.href : `${BASE_URL}${item.href}`,
        })),
    };
}

/**
 * Renders a BlogPosting JSON-LD object. Use for blog posts.
 */
export function blogPostingJsonLd(slug: string, fm: Frontmatter): Record<string, unknown> {
    return {
        "@context": "https://schema.org",
        "@type": "BlogPosting",
        headline: fm.title,
        description: fm.description,
        url: `${BASE_URL}/blog/${slug}`,
        ...(fm.date ? { datePublished: fm.date } : {}),
        ...(fm.image ? { image: fm.image.startsWith("http") ? fm.image : `${BASE_URL}${fm.image}` } : {}),
        author: {
            "@type": "Person",
            name: fm.author || "Shelf Team",
        },
        publisher: {
            "@type": "Organization",
            name: "Shelf",
            url: BASE_URL,
            logo: { "@type": "ImageObject", url: `${BASE_URL}/logo.png` },
        },
        mainEntityOfPage: {
            "@type": "WebPage",
            "@id": `${BASE_URL}/blog/${slug}`,
        },
    };
}

/**
 * Renders an Article JSON-LD object. Use for KB articles, updates, case studies, etc.
 */
export function articleJsonLd(
    urlPath: string,
    fm: Frontmatter,
): Record<string, unknown> {
    return {
        "@context": "https://schema.org",
        "@type": "Article",
        headline: fm.title,
        description: fm.description,
        url: `${BASE_URL}${urlPath}`,
        ...(fm.date ? { datePublished: fm.date } : {}),
        author: {
            "@type": "Organization",
            name: "Shelf",
            url: BASE_URL,
        },
        publisher: {
            "@type": "Organization",
            name: "Shelf",
            url: BASE_URL,
            logo: { "@type": "ImageObject", url: `${BASE_URL}/logo.png` },
        },
        mainEntityOfPage: {
            "@type": "WebPage",
            "@id": `${BASE_URL}${urlPath}`,
        },
    };
}
