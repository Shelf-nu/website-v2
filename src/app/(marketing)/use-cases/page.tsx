import Link from "next/link";
import { getAllContent } from "@/lib/mdx";
import { Container } from "@/components/ui/container";
import { Metadata } from "next";
import { Badge } from "@/components/ui/badge";
import { ScrollReveal } from "@/components/ui/scroll-reveal";
import { CTA } from "@/components/sections/cta";
import { ArrowRight, Video, Monitor, Wrench, Layers } from "lucide-react";
import { LucideIcon } from "lucide-react";

export const metadata: Metadata = {
    title: "Use Cases - Shelf",
    description: "Explore real-world examples of Shelf in action across teams and workflows.",
};

const useCaseIcons: Record<string, LucideIcon> = {
    "av-equipment-management": Video,
    "it-asset-management": Monitor,
    "tool-tracking": Wrench,
};

export default function UseCasesIndexPage() {
    const useCases = getAllContent("use-cases");

    return (
        <div className="flex min-h-screen flex-col relative overflow-hidden">
            {/* Ambient Background */}
            <div className="absolute top-0 inset-x-0 h-[600px] -z-10 bg-[linear-gradient(to_right,#80808012_1px,transparent_1px),linear-gradient(to_bottom,#80808012_1px,transparent_1px)] bg-[size:24px_24px] [mask-image:radial-gradient(ellipse_60%_50%_at_50%_0%,#000_70%,transparent_100%)] pointer-events-none" />
            <div className="absolute top-0 inset-x-0 h-[600px] bg-[radial-gradient(ellipse_at_top,_var(--tw-gradient-stops))] from-orange-50/20 via-background to-background pointer-events-none" />

            <Container className="py-24 md:py-32 relative">
                <div className="max-w-3xl mx-auto text-center mb-20">
                    <ScrollReveal width="100%">
                        <Badge variant="secondary" className="mb-4 bg-orange-50 text-orange-700 border-orange-100/50">Use Cases</Badge>
                        <h1 className="text-4xl font-bold tracking-tight sm:text-6xl mb-6">
                            Shelf <span className="text-orange-600">in action</span>
                        </h1>
                        <p className="text-xl text-muted-foreground leading-relaxed">
                            See how teams use Shelf to solve real-world asset tracking challenges across different workflows.
                        </p>
                    </ScrollReveal>
                </div>

                <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6 max-w-5xl mx-auto">
                    {useCases.map((useCase, index) => {
                        const Icon = useCaseIcons[useCase.slug] || Layers;
                        return (
                            <ScrollReveal key={useCase.slug} delay={index * 0.05} width="100%" className="h-full">
                                <Link href={`/use-cases/${useCase.slug}`} className="group block h-full">
                                    <div className="h-full p-8 rounded-2xl bg-background border border-border/60 hover:border-orange-500/30 hover:shadow-xl hover:shadow-orange-500/5 transition-all duration-300 flex flex-col">
                                        <div className="mb-5 flex h-12 w-12 items-center justify-center rounded-xl bg-orange-50 text-orange-600 group-hover:bg-orange-100 transition-colors">
                                            <Icon className="h-6 w-6" />
                                        </div>
                                        <h3 className="text-xl font-bold mb-3 text-foreground group-hover:text-orange-600 transition-colors">
                                            {useCase.frontmatter.title}
                                        </h3>
                                        <p className="text-muted-foreground text-sm leading-relaxed flex-1 line-clamp-3">
                                            {useCase.frontmatter.description}
                                        </p>
                                        <div className="mt-5 flex items-center text-sm font-medium text-orange-600 opacity-0 group-hover:opacity-100 transition-all duration-300 translate-x-[-8px] group-hover:translate-x-0">
                                            Explore use case <ArrowRight className="ml-1.5 h-3.5 w-3.5" />
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
