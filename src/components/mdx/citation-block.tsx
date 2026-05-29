import { cn } from "@/lib/utils";

interface CitationBlockProps {
    title: string;
    /**
     * Authors of the report. For an organization byline, use the org name;
     * for individual researchers, list each name. Format matters for APA/MLA
     * machine parsing.
     */
    authors?: string[];
    publisher?: string;
    year?: number;
    /** Canonical URL of the report (used in all citation formats). */
    url: string;
    className?: string;
}

function formatAuthors(authors: string[], style: "apa" | "mla" | "chicago"): string {
    if (authors.length === 0) return "Shelf Asset Management";
    if (authors.length === 1) return authors[0];
    if (style === "mla" || style === "chicago") {
        // Last names with et al. for 3+
        if (authors.length === 2) return `${authors[0]}, and ${authors[1]}`;
        return `${authors[0]}, et al.`;
    }
    // APA: list all up to 20 with comma separation
    return authors.join(", ");
}

/**
 * Renders the three most-requested citation formats (APA, MLA, Chicago)
 * for the report. Designed to be the last block on a report page so
 * journalists, students, and Wikipedia editors can grab a clean citation
 * without leaving the page.
 *
 * For Wikipedia specifically: the publisher under CC-BY-4.0 license
 * makes the dataset / report reuseable; the JSON-LD `Dataset` block in
 * the page head carries the license.
 */
export function CitationBlock({
    title,
    authors = ["Shelf Research Team"],
    publisher = "Shelf Asset Management, Inc.",
    year = new Date().getFullYear(),
    url,
    className,
}: CitationBlockProps) {
    const apaAuthors = formatAuthors(authors, "apa");
    const mlaAuthors = formatAuthors(authors, "mla");
    const chicagoAuthors = formatAuthors(authors, "chicago");

    const apa = `${apaAuthors}. (${year}). ${title}. ${publisher}. ${url}`;
    const mla = `${mlaAuthors}. “${title}.” ${publisher}, ${year}, ${url}.`;
    const chicago = `${chicagoAuthors}. “${title}.” ${publisher}. ${year}. ${url}.`;

    return (
        <aside
            className={cn(
                "not-prose my-12 rounded-2xl border border-border-subtle bg-card/50 p-6 md:p-8",
                className,
            )}
            aria-label="How to cite this report"
        >
            <h3 className="text-xs font-semibold uppercase tracking-widest text-muted-foreground mb-5">
                How to cite this report
            </h3>
            <dl className="space-y-5">
                <div>
                    <dt className="text-[10px] font-bold uppercase tracking-wider text-orange-700 dark:text-orange-400 mb-1.5">
                        APA
                    </dt>
                    <dd className="text-sm text-foreground font-mono leading-relaxed break-words">
                        {apa}
                    </dd>
                </div>
                <div>
                    <dt className="text-[10px] font-bold uppercase tracking-wider text-orange-700 dark:text-orange-400 mb-1.5">
                        MLA
                    </dt>
                    <dd className="text-sm text-foreground font-mono leading-relaxed break-words">
                        {mla}
                    </dd>
                </div>
                <div>
                    <dt className="text-[10px] font-bold uppercase tracking-wider text-orange-700 dark:text-orange-400 mb-1.5">
                        Chicago
                    </dt>
                    <dd className="text-sm text-foreground font-mono leading-relaxed break-words">
                        {chicago}
                    </dd>
                </div>
            </dl>
            <p className="mt-6 text-xs text-muted-foreground">
                Report content and underlying aggregates are released under the{" "}
                <a
                    href="https://creativecommons.org/licenses/by/4.0/"
                    target="_blank"
                    rel="noopener noreferrer"
                    className="underline decoration-orange-500/40 decoration-2 underline-offset-4 hover:decoration-orange-500"
                >
                    CC BY 4.0 license
                </a>
                {" "}— reuse, remix, and republish with attribution.
            </p>
        </aside>
    );
}
