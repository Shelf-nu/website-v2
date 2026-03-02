import Link from "next/link";
import { getAllContent } from "@/lib/mdx";
import { Container } from "@/components/ui/container";
import { Metadata } from "next";
import { Badge } from "@/components/ui/badge";
import { ScrollReveal } from "@/components/ui/scroll-reveal";
import { CTA } from "@/components/sections/cta";
import { ArrowRight, HardHat, GraduationCap, Monitor, Video, Layers } from "lucide-react";
import { LucideIcon } from "lucide-react";

export const metadata: Metadata = {
    title: "Industries - Shelf",
    description: "Shelf for every industry — tailored asset management solutions for your sector.",
};

const industryIcons: Record<string, LucideIcon> = {
    "construction": HardHat,
    "education": GraduationCap,
    "it": Monitor,
    "media-production": Video,
};

export default function IndustriesIndexPage() {
    const industries = getAllContent("industries");

    return (
        <div className="flex min-h-screen flex-col relative overflow-hidden">
            {/* Ambient Background */}
            <div className="absolute top-0 inset-x-0 h-[600px] -z-10 bg-grid-pattern bg-[size:24px_24px] [mask-image:radial-gradient(ellipse_60%_50%_at_50%_0%,#000_70%,transparent_100%)] pointer-events-none" />
            <div className="absolute top-0 inset-x-0 h-[600px] bg-[radial-gradient(ellipse_at_top,_var(--tw-gradient-stops))] from-orange-50/20 via-background to-background pointer-events-none" />

            <Container className="py-24 md:py-32 relative">
                <div className="max-w-3xl mx-auto text-center mb-20">
                    <ScrollReveal width="100%">
                        <Badge variant="secondary" className="mb-4 bg-orange-50 text-orange-700 border-orange-100/50">By Industry</Badge>
                        <h1 className="text-4xl font-bold tracking-tight sm:text-6xl mb-6">
                            Built for <span className="text-orange-600">your sector</span>
                        </h1>
                        <p className="text-xl text-muted-foreground leading-relaxed">
                            From construction sites to university campuses, Shelf adapts to the way your industry works.
                        </p>
                    </ScrollReveal>
                </div>

                <div className="grid grid-cols-1 sm:grid-cols-2 gap-6 max-w-4xl mx-auto">
                    {industries.map((industry, index) => {
                        const Icon = industryIcons[industry.slug] || Layers;
                        return (
                            <ScrollReveal key={industry.slug} delay={index * 0.05} width="100%" className="h-full">
                                <Link href={`/industries/${industry.slug}`} className="group block h-full">
                                    <div className="h-full p-8 rounded-2xl bg-background border border-border/60 hover:border-orange-500/30 hover:shadow-xl hover:shadow-orange-500/5 transition-all duration-300 flex flex-col">
                                        <div className="mb-5 flex h-12 w-12 items-center justify-center rounded-xl bg-orange-50 text-orange-600 group-hover:bg-orange-100 transition-colors">
                                            <Icon className="h-6 w-6" />
                                        </div>
                                        <h3 className="text-xl font-bold mb-3 text-foreground group-hover:text-orange-600 transition-colors">
                                            {industry.frontmatter.title}
                                        </h3>
                                        <p className="text-muted-foreground text-sm leading-relaxed flex-1 line-clamp-3">
                                            {industry.frontmatter.description}
                                        </p>
                                        <div className="mt-5 flex items-center text-sm font-medium text-orange-600 opacity-0 group-hover:opacity-100 transition-all duration-300 translate-x-[-8px] group-hover:translate-x-0">
                                            Explore industry <ArrowRight className="ml-1.5 h-3.5 w-3.5" />
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
