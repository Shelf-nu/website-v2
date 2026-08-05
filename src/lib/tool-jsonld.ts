/**
 * Shared JSON-LD builder for tool pages.
 *
 * WHY THERE IS NO SoftwareApplication SCHEMA HERE
 *
 * Google's Software App rich result requires `name`, `offers.price`, AND
 * either `aggregateRating` or `review`:
 * https://developers.google.com/search/docs/appearance/structured-data/software-app
 *
 * These are free calculators with no reviews. We will not invent an
 * aggregateRating — self-declared ratings without real reviews breach
 * Google's guidelines, and Shelf's G2 score belongs to the platform, not to
 * a barcode scanner. Without a rating the markup can never produce the rich
 * result it exists for, and it emitted a permanent "invalid item" on all
 * seven tool pages in Search Console and Ahrefs, which buries genuine
 * structured-data problems. So it is gone rather than faked.
 *
 * FAQPage stays. FAQ rich results were retired in May 2026, so it wins no
 * SERP feature, but it is valid markup and the Q&A pairs are directly
 * useful to answer engines — which is the traffic these pages actually get.
 */

type FaqEntry = { question: string; answer: string };

export type ToolPageJsonLdInput = {
    /** Display name, e.g. "Shelf MACRS Depreciation Calculator". */
    name: string;
    /** Absolute canonical URL for the tool page. */
    url: string;
    /** One-sentence description of the tool. */
    description: string;
    /** Optional — omit if the page doesn't have an FAQ. */
    faqs?: FaqEntry[];
};

export function buildToolPageJsonLd({
    name,
    url,
    description,
    faqs,
}: ToolPageJsonLdInput) {
    // WebPage rather than SoftwareApplication: it describes the page
    // truthfully, carries no unmeetable required-property contract, and so
    // validates cleanly. See the note at the top of this file.
    const graph: Record<string, unknown>[] = [
        {
            "@type": "WebPage",
            name,
            url,
            description,
            isAccessibleForFree: true,
        },
    ];

    if (faqs && faqs.length > 0) {
        graph.push({
            "@type": "FAQPage",
            mainEntity: faqs.map(({ question, answer }) => ({
                "@type": "Question",
                name: question,
                acceptedAnswer: {
                    "@type": "Answer",
                    text: answer,
                },
            })),
        });
    }

    return {
        "@context": "https://schema.org",
        "@graph": graph,
    };
}
