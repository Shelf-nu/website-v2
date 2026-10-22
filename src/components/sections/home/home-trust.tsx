import { Star } from "lucide-react";
import { Container } from "@/components/ui/container";
import { CUSTOMER_LOGOS } from "@/data/customer-logos";
import { TRUST_SEGMENTS } from "@/data/home";
import { TrustTabs, type TrustSegment } from "./trust-tabs";

const G2_URL = "https://www.g2.com/products/shelf-asset-management/reviews";

function buildSegments(): TrustSegment[] {
    const byId = new Map(CUSTOMER_LOGOS.map((logo) => [logo.id, logo]));
    return TRUST_SEGMENTS.map((segment) => {
        const source = byId.get(segment.quoteFrom);
        return {
            id: segment.id,
            label: segment.label,
            logos: segment.logos.flatMap((id) => {
                const logo = byId.get(id);
                // Shown greyscale, so tile-style logos use their one-colour version.
                return logo ? [{ id: logo.id, name: logo.name, logo: logo.logoMono ?? logo.logo }] : [];
            }),
            quote: source?.quote ? { text: source.quote, by: [source.quoteAuthor, source.quoteRole].filter(Boolean).join(", ") } : undefined,
        };
    });
}

/** Who already trusts it: scale numbers, the G2 rating, and proof by segment. */
export function HomeTrust() {
    return (
        <section className="border-b border-border bg-background py-10 sm:py-12">
            <Container className="flex flex-col items-center">
                <p className="flex flex-wrap items-center justify-center gap-x-2 gap-y-2 text-center text-sm text-muted-foreground">
                    <span className="text-balance">
                        Trusted by <b className="font-semibold text-foreground">20k+ active users</b> tracking <b className="font-semibold text-foreground">around 750k assets</b>
                    </span>
                    <a
                        href={G2_URL}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="inline-flex items-center gap-1.5 rounded-full bg-orange-50 py-0.5 pl-2 pr-2.5 text-xs font-semibold text-orange-800 transition-colors hover:bg-orange-100 dark:bg-orange-950/40 dark:text-orange-200 dark:hover:bg-orange-950/70"
                    >
                        <span className="flex gap-px text-orange-500" aria-label="5 out of 5 stars">
                            {[0, 1, 2, 3, 4].map((i) => (
                                <Star key={i} className="h-3 w-3 fill-current" aria-hidden="true" />
                            ))}
                        </span>
                        5.0 on G2
                    </a>
                </p>
                <TrustTabs segments={buildSegments()} />
            </Container>
        </section>
    );
}
