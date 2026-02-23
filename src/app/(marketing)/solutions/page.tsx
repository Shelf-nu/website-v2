import { Container } from "@/components/ui/container";
import { Badge } from "@/components/ui/badge";
import { ScrollReveal } from "@/components/ui/scroll-reveal";
import { getAllContent } from "@/lib/mdx";
import { solutionIcons } from "@/data/solutions";
import { CTA } from "@/components/sections/cta";
import { Metadata } from "next";
import Image from "next/image";
import Link from "next/link";
import { ArrowRight, Layers } from "lucide-react";

export const metadata: Metadata = {
    title: "Solutions - Shelf Asset Management",
    description: "Tailored asset management workflows for your industry.",
};

export default function SolutionsPage() {
    const solutions = getAllContent("solutions");

    return (
        <div className="flex flex-col min-h-screen relative overflow-hidden">
            {/* Ambient Background */}
            <div className="absolute top-0 inset-x-0 h-[600px] -z-10 bg-[linear-gradient(to_right,#80808012_1px,transparent_1px),linear-gradient(to_bottom,#80808012_1px,transparent_1px)] bg-[size:24px_24px] [mask-image:radial-gradient(ellipse_60%_50%_at_50%_0%,#000_70%,transparent_100%)] pointer-events-none" />
            <div className="absolute top-0 inset-x-0 h-[600px] bg-[radial-gradient(ellipse_at_top,_var(--tw-gradient-stops))] from-orange-50/20 via-background to-background pointer-events-none" />

            <Container className="py-24 md:py-32 relative">
                <div className="max-w-3xl mx-auto text-center mb-20">
                    <ScrollReveal width="100%">
                        <Badge variant="secondary" className="mb-4 bg-orange-50 text-orange-700 border-orange-100/50">Solutions</Badge>
                        <h1 className="text-4xl font-bold tracking-tight sm:text-6xl mb-6">
                            Built for <span className="text-orange-600">every scale</span>
                        </h1>
                        <p className="text-xl text-muted-foreground leading-relaxed">
                            Whether you&apos;re managing a university campus, a construction fleet, or IT for a distributed team, Shelf adapts to your workflow.
                        </p>
                    </ScrollReveal>
                </div>

                {/* Solution Cards with Images */}
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                    {solutions.map(({ frontmatter, slug }, index) => {
                        const Icon = solutionIcons[slug] || Layers;
                        const solutionImage = frontmatter.image;

                        return (
                            <ScrollReveal key={slug} width="100%" delay={index * 0.05} className="h-full">
                                <Link href={`/solutions/${slug}`} className="group block h-full">
                                    <div className="h-full rounded-2xl bg-background border border-border/60 overflow-hidden hover:border-orange-500/30 hover:shadow-xl hover:shadow-orange-500/5 transition-all duration-300 flex flex-col">
                                        {/* Image Section */}
                                        <div className="relative aspect-[16/10] w-full overflow-hidden bg-muted">
                                            {solutionImage ? (
                                                <Image
                                                    src={solutionImage}
                                                    alt={frontmatter.title}
                                                    fill
                                                    className="object-cover object-top transition-transform duration-500 group-hover:scale-105"
                                                />
                                            ) : (
                                                <div className="absolute inset-0 bg-gradient-to-br from-orange-50 to-orange-100 flex items-center justify-center">
                                                    <Icon className="h-12 w-12 text-orange-300" />
                                                </div>
                                            )}
                                            {/* Gradient overlay at bottom for smooth transition */}
                                            <div className="absolute inset-x-0 bottom-0 h-16 bg-gradient-to-t from-background/80 to-transparent" />

                                            {/* Icon badge */}
                                            <div className="absolute top-4 left-4 flex h-10 w-10 items-center justify-center rounded-xl bg-white/90 backdrop-blur-sm border border-white/20 shadow-sm text-orange-600">
                                                <Icon className="h-5 w-5" />
                                            </div>
                                        </div>

                                        {/* Content Section */}
                                        <div className="p-6 flex flex-col flex-1">
                                            <h3 className="text-lg font-bold mb-2 text-foreground group-hover:text-orange-600 transition-colors">
                                                {frontmatter.title}
                                            </h3>
                                            <p className="text-sm text-muted-foreground leading-relaxed flex-1 line-clamp-3">
                                                {frontmatter.description}
                                            </p>
                                            <div className="mt-4 flex items-center text-sm font-medium text-orange-600 opacity-0 group-hover:opacity-100 transition-all duration-300 translate-x-[-8px] group-hover:translate-x-0">
                                                Explore solution <ArrowRight className="ml-1.5 h-3.5 w-3.5" />
                                            </div>
                                        </div>
                                    </div>
                                </Link>
                            </ScrollReveal>
                        );
                    })}
                </div>
            </Container>

            <CTA />
        </div>
    );
}
