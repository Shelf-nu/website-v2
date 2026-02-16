import { Container } from "@/components/ui/container";
import Link from "next/link";
import { ArrowRight } from "lucide-react";
import { ScrollReveal } from "@/components/ui/scroll-reveal";

interface RelatedContentProps {
    related: {
        solutions?: string[];
        features?: string[];
        case_studies?: string[];
        glossary?: string[];
    };
}

export function RelatedContent({ related }: RelatedContentProps) {
    const hasRelated = Object.values(related).some(arr => arr && arr.length > 0);
    if (!hasRelated) return null;

    return (
        <section className="bg-muted/20 py-16 border-t border-border/40">
            <Container>
                <ScrollReveal width="100%">
                    <div className="max-w-2xl">
                        <h2 className="text-2xl font-bold mb-8 text-foreground">Related Resources</h2>
                        <div className="space-y-8">
                            {related.solutions && related.solutions.length > 0 && (
                                <div>
                                    <h3 className="text-sm font-semibold uppercase text-orange-600 mb-4 tracking-wide">Solutions</h3>
                                    <ul className="space-y-3">
                                        {related.solutions.map(slug => (
                                            <li key={slug}>
                                                <Link href={`/solutions/${slug}`} className="text-foreground hover:text-orange-600 transition-colors flex items-center group">
                                                    Read Solution <ArrowRight className="ml-2 h-4 w-4 group-hover:translate-x-1 transition-transform" />
                                                </Link>
                                            </li>
                                        ))}
                                    </ul>
                                </div>
                            )}
                            {related.features && related.features.length > 0 && (
                                <div>
                                    <h3 className="text-sm font-semibold uppercase text-orange-600 mb-4 tracking-wide">Features</h3>
                                    <ul className="space-y-3">
                                        {related.features.map(slug => (
                                            <li key={slug}>
                                                <Link href={`/features/${slug}`} className="text-foreground hover:text-orange-600 transition-colors flex items-center group">
                                                    Explore Feature <ArrowRight className="ml-2 h-4 w-4 group-hover:translate-x-1 transition-transform" />
                                                </Link>
                                            </li>
                                        ))}
                                    </ul>
                                </div>
                            )}
                        </div>
                    </div>
                </ScrollReveal>
            </Container>
        </section>
    );
}
