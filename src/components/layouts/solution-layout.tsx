import { Frontmatter } from "@/lib/content/schema";
import { HeroWithSocialProof } from "./shared/hero-with-social-proof";
import { RelatedContent } from "./shared/related-content";
import { SeoHead } from "./shared/seo-head";
import { Container } from "@/components/ui/container";
import { CTA } from "@/components/sections/cta";
import { getAllContent } from "@/lib/mdx";
import Link from "next/link";
import Image from "next/image";
import { ArrowRight } from "lucide-react";

// Map solution slugs to their most relevant case study slugs
const solutionCaseStudyMap: Record<string, string[]> = {
    "asset-tracking": ["ces-70k-recovery", "resq-contact-center", "haarp"],
    "camera-equipment-check-out": ["fabel-film-double-bookings", "kcai", "arellano-associates"],
    "educational-resource-management": ["kcai", "eastern-michigan-university", "haarp"],
    "equipment-check-in": ["fabel-film-double-bookings", "eastern-michigan-university", "arellano-associates"],
    "equipment-reservations": ["fabel-film-double-bookings", "arellano-associates", "eastern-michigan-university"],
    "fixed-asset-tracking": ["ces-70k-recovery", "haarp", "resq-contact-center"],
    "it-asset-management": ["resq-contact-center", "kcai"],
    "mobile-asset-auditing": ["ces-70k-recovery", "haarp", "resq-contact-center"],
    "tool-tracking": ["ces-70k-recovery", "arellano-associates"],
    "open-source-asset-management": ["ces-70k-recovery", "kcai", "haarp"],
    "equipment-management": ["ces-70k-recovery", "fabel-film-double-bookings", "resq-contact-center"],
};

interface LayoutProps {
    frontmatter: Frontmatter;
    children: React.ReactNode;
}

export function SolutionLayout({ frontmatter, children }: LayoutProps) {
    // Load relevant case studies
    const allCaseStudies = getAllContent("case-studies");
    const relevantSlugs = solutionCaseStudyMap[frontmatter.slug] || [];
    const relevantStudies = relevantSlugs
        .map(slug => allCaseStudies.find(cs => cs.slug === slug))
        .filter(Boolean)
        .slice(0, 2);

    return (
        <>
            <SeoHead frontmatter={frontmatter} />
            <div className="flex min-h-screen flex-col">
                <HeroWithSocialProof
                    title={frontmatter.title}
                    description={frontmatter.description}
                    tagline={frontmatter.heroTagline || "Solution"}
                />

                {frontmatter.problemStatements && (
                    <section className="bg-muted py-16">
                        <Container>
                            <h2 className="text-2xl font-bold mb-6">The Challenge</h2>
                            <ul className="grid gap-4 md:grid-cols-2">
                                {frontmatter.problemStatements.map((prob, i) => (
                                    <li key={i} className="bg-background p-6 rounded-lg border">{prob}</li>
                                ))}
                            </ul>
                        </Container>
                    </section>
                )}

                <main className="flex-1">
                    <Container className="py-16">
                        <div className="prose prose-lg dark:prose-invert max-w-3xl mx-auto">
                            {children}
                        </div>
                    </Container>
                </main>

                {/* Related Case Studies */}
                {relevantStudies.length > 0 && (
                    <section className="border-t border-border/40 bg-muted/20 py-16">
                        <Container>
                            <h2 className="text-2xl font-bold text-foreground mb-2">See it in action</h2>
                            <p className="text-muted-foreground mb-8">Real teams using Shelf for {frontmatter.title.toLowerCase()}.</p>
                            <div className="grid md:grid-cols-2 gap-6 max-w-4xl">
                                {relevantStudies.map((study) => (
                                    <Link
                                        key={study!.slug}
                                        href={`/case-studies/${study!.slug}`}
                                        className="group flex flex-col rounded-2xl border border-border/50 bg-card overflow-hidden hover:shadow-lg hover:border-orange-200/50 transition-all duration-300"
                                    >
                                        {study!.frontmatter.coverImage && (
                                            <div className="relative aspect-[16/9] w-full bg-muted overflow-hidden">
                                                <Image
                                                    src={study!.frontmatter.coverImage}
                                                    alt={typeof study!.frontmatter.customer === "string" ? study!.frontmatter.customer : study!.frontmatter.customer?.name || ""}
                                                    fill
                                                    className="object-cover transition-transform duration-500 group-hover:scale-105"
                                                />
                                            </div>
                                        )}
                                        <div className="p-6">
                                            <div className="text-xs font-medium text-orange-600 mb-2">
                                                {typeof study!.frontmatter.customer === "string" ? study!.frontmatter.customer : study!.frontmatter.customer?.name}
                                            </div>
                                            <h3 className="font-bold text-foreground group-hover:text-orange-600 transition-colors line-clamp-2 mb-2">
                                                {study!.frontmatter.title}
                                            </h3>
                                            <span className="inline-flex items-center gap-1 text-sm font-medium text-muted-foreground group-hover:text-orange-600 transition-colors">
                                                Read story <ArrowRight className="h-3.5 w-3.5 transition-transform group-hover:translate-x-0.5" />
                                            </span>
                                        </div>
                                    </Link>
                                ))}
                            </div>
                        </Container>
                    </section>
                )}

                <CTA />

                {frontmatter.related && <RelatedContent related={frontmatter.related} />}
            </div>
        </>
    );
}
