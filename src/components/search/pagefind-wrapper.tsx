import { Frontmatter } from "@/lib/content/schema";

/**
 * Builds the weighted keyword string for an MDX content page from its frontmatter.
 *
 * Without this, MDX pages get no Pagefind keyword boost, so a long flagship page
 * (e.g. /features/audits) can rank below short, tangential pages for its own topic.
 * Feeding the title + curated SEO keywords into PagefindWrapper's 10x-weighted block
 * lifts each page for the terms it's meant to own. Falls back to the title alone when
 * a page has no `seo.keywords`.
 */
export function frontmatterKeywords(frontmatter: Pick<Frontmatter, "title" | "seo">): string {
    return [frontmatter.title, ...(frontmatter.seo?.keywords ?? [])].filter(Boolean).join(" ");
}

/**
 * Wraps content pages with Pagefind attributes for indexing and filtering.
 *
 * - `data-pagefind-body` tells Pagefind to index only this section (skipping nav/footer).
 * - `data-pagefind-filter="type:Blog"` enables filtering by content type.
 * - `data-pagefind-meta="title:…"` gives Pagefind the correct display title.
 * - `keywords` adds hidden, highly-weighted search terms so pages rank for
 *    their primary topic (e.g. the Demo page ranks first for "demo").
 */
export function PagefindWrapper({
    type,
    title,
    keywords,
    children,
}: {
    type: string;
    title: string;
    keywords?: string;
    children: React.ReactNode;
}) {
    return (
        <div data-pagefind-body data-pagefind-filter={`type:${type}`} data-pagefind-meta={`title:${title}`}>
            {keywords && (
                <div data-pagefind-weight="10" className="sr-only" aria-hidden="true">
                    {keywords}
                </div>
            )}
            {children}
        </div>
    );
}
