import Link from "next/link";
import { getAllContent } from "@/lib/mdx";
import { Container } from "@/components/ui/container";
import { Metadata } from "next";
import { PageHeader } from "@/components/layouts/shared/page-header";
import { ScrollReveal } from "@/components/ui/scroll-reveal";

export const metadata: Metadata = {
    title: "Concepts - Shelf",
    description: "Learn about asset management concepts.",
};

export default function ConceptsIndexPage() {
    const concepts = getAllContent("concepts");

    return (
        <div className="flex min-h-screen flex-col">
            <PageHeader
                title="Concepts"
                description="Deep dives into core asset management ideas."
                heroTagline="Learn"
            />

            <Container className="py-16 md:py-24">
                <div className="grid grid-cols-1 gap-6 sm:grid-cols-2 lg:grid-cols-3">
                    {concepts.map((concept, index) => (
                        <ScrollReveal key={concept.slug} delay={index * 0.05}>
                            <Link href={`/concepts/${concept.slug}`} className="group block h-full">
                                <div className="h-full p-6 rounded-2xl border border-border/40 bg-background/50 backdrop-blur-sm transition-all hover:-translate-y-1 hover:shadow-lg hover:border-orange-500/20">
                                    <h3 className="text-xl font-bold group-hover:text-orange-600 transition-colors mb-3">
                                        {concept.frontmatter.title}
                                    </h3>
                                    <p className="text-muted-foreground text-sm leading-relaxed">
                                        {concept.frontmatter.description}
                                    </p>
                                </div>
                            </Link>
                        </ScrollReveal>
                    ))}
                </div>
            </Container>
        </div>
    );
}
