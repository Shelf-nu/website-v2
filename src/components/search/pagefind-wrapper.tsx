/**
 * Wraps content pages with Pagefind attributes for indexing and filtering.
 *
 * - `data-pagefind-body` tells Pagefind to index only this section (skipping nav/footer).
 * - `data-pagefind-filter="type:Blog"` enables filtering by content type.
 * - `data-pagefind-meta="title:…"` gives Pagefind the correct display title.
 */
export function PagefindWrapper({
    type,
    title,
    children,
}: {
    type: string;
    title: string;
    children: React.ReactNode;
}) {
    return (
        <div data-pagefind-body data-pagefind-filter={`type:${type}`} data-pagefind-meta={`title:${title}`}>
            {children}
        </div>
    );
}
