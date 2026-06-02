import { Metadata } from "next";
import { Frontmatter } from "./content/schema";
import { ContentType } from "./mdx";
import type { PricingPlan } from "../data/pricing";

const BASE_URL = process.env.NEXT_PUBLIC_APP_URL || "https://www.shelf.nu";

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

/* ------------------------------------------------------------------ */
/*  SoftwareApplication JSON-LD                                        */
/* ------------------------------------------------------------------ */

/**
 * Renders a SoftwareApplication JSON-LD object for Shelf.
 * Use on alternatives pages, feature pages, or solution pages.
 * When `competitor` is provided, the page is positioned as a comparison
 * between Shelf and that competitor (without claiming Google attribution
 * for the competitor's name).
 */
export function shelfSoftwareApplicationJsonLd(
    competitor?: string,
): Record<string, unknown> {
    const baseDescription =
        "Open source asset tracking and inventory management software for modern distributed teams.";
    return {
        "@context": "https://schema.org",
        "@type": "SoftwareApplication",
        name: "Shelf",
        ...(competitor
            ? { alternateName: `Shelf — alternative to ${competitor}` }
            : {}),
        applicationCategory: "BusinessApplication",
        applicationSubCategory: "Asset Tracking Software",
        operatingSystem: "Web, iOS",
        url: BASE_URL,
        description: competitor
            ? `${baseDescription} A modern alternative to ${competitor}.`
            : baseDescription,
        offers: {
            "@type": "Offer",
            price: "0",
            priceCurrency: "USD",
            url: `${BASE_URL}/pricing`,
        },
        aggregateRating: {
            "@type": "AggregateRating",
            ratingValue: "5",
            ratingCount: "10",
        },
        featureList:
            "QR code asset tracking, Equipment check-in/check-out, Booking calendar, Custom fields, Multi-location support, Team collaboration, CSV import/export, Self-hosting option",
        downloadUrl: "https://app.shelf.nu",
    };
}

/* ------------------------------------------------------------------ */
/*  FAQ JSON-LD                                                        */
/* ------------------------------------------------------------------ */

export interface FaqItem {
    question: string;
    answer: string;
}

/**
 * Renders a FAQPage JSON-LD object for rich snippet eligibility.
 * Pass an array of { question, answer } pairs.
 */
export function faqJsonLd(items: FaqItem[]): Record<string, unknown> {
    return {
        "@context": "https://schema.org",
        "@type": "FAQPage",
        mainEntity: items.map((item) => ({
            "@type": "Question",
            name: item.question,
            acceptedAnswer: {
                "@type": "Answer",
                text: item.answer,
            },
        })),
    };
}

/**
 * Extracts FAQ question/answer pairs from MDX content.
 * Supports two patterns:
 *   1. ### Heading questions under a ## FAQ section
 *   2. **Bold** questions with answers on the next line(s)
 * Strips markdown formatting from answers for clean JSON-LD.
 */
export function extractFaqsFromMdx(mdxSource: string): FaqItem[] {
    const faqs: FaqItem[] = [];

    // Find the FAQ section (## FAQ, ## FAQs, ## Frequently Asked Questions)
    const faqSectionMatch = mdxSource.match(
        /^##\s+(?:FAQ|FAQs|Frequently Asked Questions)\s*$/m
    );
    if (!faqSectionMatch || faqSectionMatch.index === undefined) return faqs;

    // Get content from FAQ heading to the next ## heading or end of file
    const faqStart = faqSectionMatch.index + faqSectionMatch[0].length;
    const nextSectionMatch = mdxSource.slice(faqStart).match(/^## /m);
    const faqContent = nextSectionMatch
        ? mdxSource.slice(faqStart, faqStart + nextSectionMatch.index!)
        : mdxSource.slice(faqStart);

    // Pattern 1: ### Question heading followed by paragraph(s)
    const h3Pattern = /^###\s+(.+?)\s*\n([\s\S]*?)(?=\n###\s|\n---|\n## |$)/gm;
    let match;
    while ((match = h3Pattern.exec(faqContent)) !== null) {
        const question = match[1].trim();
        const answer = stripMarkdown(match[2].trim());
        if (question && answer) {
            faqs.push({ question, answer });
        }
    }

    // Pattern 2: **Bold question?** followed by answer text
    if (faqs.length === 0) {
        const boldPattern = /\*\*(.+?\?)\*\*\s*\n([\s\S]*?)(?=\n\*\*|\n---|\n## |$)/gm;
        while ((match = boldPattern.exec(faqContent)) !== null) {
            const question = match[1].trim();
            const answer = stripMarkdown(match[2].trim());
            if (question && answer) {
                faqs.push({ question, answer });
            }
        }
    }

    return faqs;
}

/** Strip markdown syntax for clean plain-text output in JSON-LD */
function stripMarkdown(text: string): string {
    return text
        .replace(/\[([^\]]*)\]\([^)]*\)/g, "$1") // [link text](url) → link text
        .replace(/!\[.*?\]\(.*?\)/g, "")           // images
        .replace(/#{1,6}\s/g, "")                  // headings
        .replace(/\*\*([^*]+)\*\*/g, "$1")         // bold
        .replace(/\*([^*]+)\*/g, "$1")             // italic
        .replace(/`([^`]+)`/g, "$1")               // inline code
        .replace(/\n{2,}/g, " ")                   // collapse paragraphs
        .replace(/\n/g, " ")                       // collapse line breaks
        .replace(/\s{2,}/g, " ")                   // collapse spaces
        .trim();
}

/* ------------------------------------------------------------------ */
/*  Site-wide identity JSON-LD                                         */
/* ------------------------------------------------------------------ */

/**
 * Renders the Organization JSON-LD object for Shelf. Emitted site-wide
 * from the root layout. Uses a stable @id so other schemas (publisher,
 * author references) can link to it without duplicating the entity.
 */
export function organizationJsonLd(): Record<string, unknown> {
    return {
        "@context": "https://schema.org",
        "@type": "Organization",
        "@id": `${BASE_URL}/#organization`,
        name: "Shelf Asset Management",
        url: BASE_URL,
        logo: { "@type": "ImageObject", url: `${BASE_URL}/logo.png` },
        sameAs: [
            "https://github.com/Shelf-nu/shelf.nu",
            "https://www.linkedin.com/company/shelf-inc/",
        ],
        contactPoint: {
            "@type": "ContactPoint",
            contactType: "customer support",
            url: `${BASE_URL}/contact`,
        },
    };
}

/**
 * Renders the WebSite JSON-LD object for shelf.nu. Emitted site-wide
 * from the root layout. Stable @id for cross-schema references.
 */
export function websiteJsonLd(): Record<string, unknown> {
    return {
        "@context": "https://schema.org",
        "@type": "WebSite",
        "@id": `${BASE_URL}/#website`,
        url: BASE_URL,
        name: "Shelf",
        publisher: { "@id": `${BASE_URL}/#organization` },
    };
}

/* ------------------------------------------------------------------ */
/*  Pricing JSON-LD                                                    */
/* ------------------------------------------------------------------ */

/**
 * Renders a SoftwareApplication JSON-LD object with an Offer per priced
 * plan, sourced from the canonical pricing data in src/data/pricing.ts.
 *
 * Plans whose billing is "custom" (i.e. Enterprise) are omitted from the
 * offers array because they have no fixed price; they are described in
 * the page content and reachable via the demo CTA.
 *
 * Shares its @id with the homepage SoftwareApplication entity so the
 * AggregateRating emitted from the homepage applies to the same product.
 */
export function pricingSoftwareApplicationJsonLd(
    plans: PricingPlan[]
): Record<string, unknown> {
    const offers = plans
        .filter((plan) => plan.billing !== "custom")
        .map((plan) => {
            const monthly = parseInt(plan.priceMonthly.replace(/[^0-9]/g, ""), 10);
            const url = plan.href.startsWith("http") ? plan.href : `${BASE_URL}${plan.href}`;
            return {
                "@type": "Offer",
                name: plan.name,
                description: plan.description,
                price: String(monthly),
                priceCurrency: "USD",
                url,
                category: monthly === 0 ? "Free" : "Subscription",
                availability: "https://schema.org/InStock",
            };
        });

    return {
        "@context": "https://schema.org",
        "@type": "SoftwareApplication",
        "@id": `${BASE_URL}/#shelf-software-application`,
        name: "Shelf",
        description:
            "Open source asset tracking and inventory management software for modern distributed teams.",
        applicationCategory: "BusinessApplication",
        applicationSubCategory: "Asset Tracking Software",
        operatingSystem: "Web, iOS",
        url: BASE_URL,
        downloadUrl: "https://app.shelf.nu",
        offers,
    };
}

/* ------------------------------------------------------------------ */
/*  CollectionPage / ItemList JSON-LD                                  */
/* ------------------------------------------------------------------ */

export interface CollectionItem {
    name: string;
    url: string;
    description?: string;
}

/**
 * Renders a CollectionPage JSON-LD object with an embedded ItemList of
 * its children. Use on index pages (/features, /solutions, etc.) to
 * communicate site hierarchy to crawlers and LLMs.
 *
 * Cap items at a reasonable count (~30) when the index is large.
 */
export function collectionPageJsonLd(opts: {
    name: string;
    description: string;
    url: string;
    items: CollectionItem[];
}): Record<string, unknown> {
    const pageUrl = opts.url.startsWith("http") ? opts.url : `${BASE_URL}${opts.url}`;
    return {
        "@context": "https://schema.org",
        "@type": "CollectionPage",
        name: opts.name,
        description: opts.description,
        url: pageUrl,
        isPartOf: { "@id": `${BASE_URL}/#website` },
        mainEntity: {
            "@type": "ItemList",
            numberOfItems: opts.items.length,
            itemListElement: opts.items.map((item, i) => ({
                "@type": "ListItem",
                position: i + 1,
                url: item.url.startsWith("http") ? item.url : `${BASE_URL}${item.url}`,
                name: item.name,
                ...(item.description ? { description: item.description } : {}),
            })),
        },
    };
}
