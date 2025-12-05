import { Container } from "@/components/ui/container";
import Link from "next/link";
import { ArrowRight } from "lucide-react";

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
        <section className="bg-muted/30 py-16 border-t">
            <Container>
                <div className="max-w-2xl">
                    <h2 className="text-2xl font-bold mb-6">Related Resources</h2>
                    <div className="space-y-6">
                        {related.solutions && related.solutions.length > 0 && (
                            <div>
                                <h3 className="text-sm font-semibold uppercase text-muted-foreground mb-3">Solutions</h3>
                                <ul className="space-y-2">
                                    {related.solutions.map(slug => (
                                        <li key={slug}>
                                            <Link href={`/solutions/${slug}`} className="text-primary hover:underline flex items-center">
                                                Read Solution <ArrowRight className="ml-1 h-3 w-3" />
                                            </Link>
                                        </li>
                                    ))}
                                </ul>
                            </div>
                        )}
                        {related.features && related.features.length > 0 && (
                            <div>
                                <h3 className="text-sm font-semibold uppercase text-muted-foreground mb-3">Features</h3>
                                <ul className="space-y-2">
                                    {related.features.map(slug => (
                                        <li key={slug}>
                                            <Link href={`/features/${slug}`} className="text-primary hover:underline flex items-center">
                                                Explore Feature <ArrowRight className="ml-1 h-3 w-3" />
                                            </Link>
                                        </li>
                                    ))}
                                </ul>
                            </div>
                        )}
                    </div>
                </div>
            </Container>
        </section>
    );
}
