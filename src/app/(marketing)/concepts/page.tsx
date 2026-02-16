import Link from "next/link";
import { getAllContent } from "@/lib/mdx";
import { Container } from "@/components/ui/container";
import { Metadata } from "next";
import { Badge } from "@/components/ui/badge";
import { ScrollReveal } from "@/components/ui/scroll-reveal";
import { CTA } from "@/components/sections/cta";
import { ArrowRight, BookOpen } from "lucide-react";

export const metadata: Metadata = {
    title: "Concepts - Shelf",
    description: "Deep dives into core asset management ideas and frameworks.",
};

export default function ConceptsIndexPage() {
    const concepts = getAllContent("concepts");

    return (
        <div className="flex min-h-screen flex-col relative overflow-hidden">
            {/* Ambient Background */}
            <div className="absolute top-0 inset-x-0 h-[600px] -z-10 bg-[linear-gradient(to_right,#80808012_1px,transparent_1px),linear-gradient(to_bottom,#80808012_1px,transparent_1px)] bg-[size:24px_24px] [mask-image:radial-gradient(ellipse_60%_50%_at_50%_0%,#000_70%,transparent_100%)] pointer-events-none" />
            <div className="absolute top-0 inset-x-0 h-[600px] bg-[radial-gradient(ellipse_at_top,_var(--tw-gradient-stops))] from-orange-50/20 via-background to-background pointer-events-none" />

            <Container className="py-24 md:py-32 relative">
                <div className="max-w-3xl mx-auto text-center mb-20">
                    <ScrollReveal width="100%">
                        <Badge variant="secondary" className="mb-4 bg-orange-50 text-orange-700 border-orange-100/50">Learn</Badge>
                        <h1 className="text-4xl font-bold tracking-tight sm:text-6xl mb-6">
                            Core <span className="text-orange-600">Concepts</span>
                        </h1>
                        <p className="text-xl text-muted-foreground leading-relaxed">
                            Deep dives into the ideas and frameworks behind effective asset management.
                        </p>
                    </ScrollReveal>
                </div>

                <div className="max-w-4xl mx-auto">
                    <div className="divide-y divide-border/60">
                        {concepts.map((concept, index) => (
                            <ScrollReveal key={concept.slug} delay={index * 0.03} width="100%">
                                <Link href={`/concepts/${concept.slug}`} className="group flex items-start gap-6 py-6 first:pt-0 last:pb-0">
                                    <span className="shrink-0 mt-1 flex h-10 w-10 items-center justify-center rounded-lg bg-orange-50 text-orange-600 group-hover:bg-orange-100 transition-colors">
                                        <BookOpen className="h-5 w-5" />
                                    </span>
                                    <div className="flex-1 min-w-0">
                                        <h3 className="text-lg font-bold text-foreground group-hover:text-orange-600 transition-colors mb-1">
                                            {concept.frontmatter.title}
                                        </h3>
                                        <p className="text-sm text-muted-foreground leading-relaxed line-clamp-2">
                                            {concept.frontmatter.description}
                                        </p>
                                    </div>
                                    <ArrowRight className="shrink-0 mt-2 h-4 w-4 text-muted-foreground/40 group-hover:text-orange-600 group-hover:translate-x-1 transition-all" />
                                </Link>
                            </ScrollReveal>
                        ))}
                    </div>
                </div>
            </Container>

            <CTA />
        </div>
    );
}
