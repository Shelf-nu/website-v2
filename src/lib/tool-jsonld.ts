/**
 * Shared JSON-LD builder for tool pages.
 *
 * Keeps the SoftwareApplication + FAQPage schemas consistent across every
 * /tools/* page. When the schema shape needs to change, do it here once.
 */

type FaqEntry = { question: string; answer: string };

export type ToolPageJsonLdInput = {
    /** Display name, e.g. "Shelf MACRS Depreciation Calculator". */
    name: string;
    /** Absolute canonical URL for the tool page. */
    url: string;
    /** One-sentence description used in the SoftwareApplication schema. */
    description: string;
    /**
     * Schema.org applicationCategory. Examples: "FinanceApplication",
     * "BusinessApplication", "UtilitiesApplication".
     */
    applicationCategory: string;
    /** Optional — omit if the page doesn't have an FAQ. */
    faqs?: FaqEntry[];
};

export function buildToolPageJsonLd({
    name,
    url,
    description,
    applicationCategory,
    faqs,
}: ToolPageJsonLdInput) {
    const graph: Record<string, unknown>[] = [
        {
            "@type": "SoftwareApplication",
            name,
            applicationCategory,
            operatingSystem: "Any",
            url,
            description,
            offers: {
                "@type": "Offer",
                price: "0",
                priceCurrency: "USD",
            },
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
