import Link from "next/link";
import { getAllContent } from "@/lib/mdx";
import { Container } from "@/components/ui/container";
import { Metadata } from "next";
import { PageHeader } from "@/components/layouts/shared/page-header";
import { ScrollReveal } from "@/components/ui/scroll-reveal";

export const metadata: Metadata = {
    title: "Glossary - Shelf",
    description: "Asset management terms explained.",
};

export default function GlossaryIndexPage() {
    const terms = getAllContent("glossary");

    return (
        <div className="flex min-h-screen flex-col">
            <PageHeader
                title="Glossary"
                description="Common terms and definitions."
                heroTagline="Reference"
            />

            <Container className="py-16 md:py-24">
                <div className="grid grid-cols-1 gap-6 sm:grid-cols-2 lg:grid-cols-3">
                    {terms.map((term, index) => (
                        <ScrollReveal key={term.slug} delay={index * 0.05}>
                            <Link href={`/glossary/${term.slug}`} className="group block h-full">
                                <div className="h-full p-6 rounded-2xl border border-border/40 bg-background/50 backdrop-blur-sm transition-all hover:-translate-y-1 hover:shadow-lg hover:border-orange-500/20">
                                    <h3 className="text-xl font-bold group-hover:text-orange-600 transition-colors mb-3">
                                        {term.frontmatter.title}
                                    </h3>
                                    <p className="text-muted-foreground text-sm leading-relaxed">
                                        {term.frontmatter.description}
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
