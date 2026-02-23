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
