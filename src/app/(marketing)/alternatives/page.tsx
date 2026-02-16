import Link from "next/link";
import { getAllContent } from "@/lib/mdx";
import { Container } from "@/components/ui/container";
import { Metadata } from "next";
import { PageHeader } from "@/components/layouts/shared/page-header";
import { ScrollReveal } from "@/components/ui/scroll-reveal";

export const metadata: Metadata = {
    title: "Alternatives - Shelf",
    description: "Compare Shelf to other solutions.",
};

export default function AlternativesIndexPage() {
    const alternatives = getAllContent("alternatives");

    return (
        <div className="flex min-h-screen flex-col">
            <PageHeader
                title="Alternatives"
                description="See why teams switch to Shelf."
                heroTagline="Compare"
            />

            <Container className="py-16 md:py-24">
                <div className="grid grid-cols-1 gap-6 sm:grid-cols-2 lg:grid-cols-3">
                    {alternatives.map((alt, index) => (
                        <ScrollReveal key={alt.slug} delay={index * 0.05}>
                            <Link href={`/alternatives/${alt.slug}`} className="group block h-full">
                                <div className="h-full p-6 rounded-2xl border border-border/40 bg-background/50 backdrop-blur-sm transition-all hover:-translate-y-1 hover:shadow-lg hover:border-orange-500/20">
                                    <h3 className="text-xl font-bold group-hover:text-orange-600 transition-colors mb-3">
                                        {alt.frontmatter.title}
                                    </h3>
                                    <p className="text-muted-foreground text-sm leading-relaxed">
                                        {alt.frontmatter.description}
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
