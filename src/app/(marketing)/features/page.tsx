import { Container } from "@/components/ui/container";
import { Badge } from "@/components/ui/badge";
import { ScrollReveal } from "@/components/ui/scroll-reveal";
import { getAllContent } from "@/lib/mdx";
import { featureIcons } from "@/data/features";
import { CTA } from "@/components/sections/cta";
import { Metadata } from "next";
import Image from "next/image";
import Link from "next/link";
import { ArrowRight, Layers, Smartphone } from "lucide-react";
import { PagefindWrapper } from "@/components/search/pagefind-wrapper";
import { StructuredData } from "@/components/seo/structured-data";
import { collectionPageJsonLd } from "@/lib/seo";

export const metadata: Metadata = {
    title: "Features - Shelf Asset Management",
    description: "The complete operating system for physical asset management. Track, manage, and scale your equipment operations.",
    alternates: { canonical: "https://www.shelf.nu/features" },
};

export default function FeaturesPage() {
    const features = getAllContent("features");

    const collectionSchema = collectionPageJsonLd({
        name: "Shelf Features",
        description:
            "The complete operating system for physical asset management. Track, manage, and scale your equipment operations.",
        url: "/features",
        items: features.slice(0, 30).map((f) => ({
            name: f.frontmatter.title,
            url: `/features/${f.slug}`,
            description: f.frontmatter.description,
        })),
    });

    return (
        <PagefindWrapper type="Page" title="Features — Shelf Asset Management" keywords="features capabilities asset tracking equipment management">
            <StructuredData data={collectionSchema} />
            <div className="flex flex-col min-h-screen relative overflow-hidden">
                {/* Ambient Background */}
                <div className="absolute top-0 inset-x-0 h-[600px] -z-10 bg-grid-pattern bg-[size:24px_24px] [mask-image:radial-gradient(ellipse_60%_50%_at_50%_0%,#000_70%,transparent_100%)] pointer-events-none" />
                <div className="absolute top-0 inset-x-0 h-[600px] bg-[radial-gradient(ellipse_at_top,_var(--tw-gradient-stops))] from-orange-50/20 via-background to-background pointer-events-none" />

                <Container className="py-24 md:py-32 relative">
                <div className="max-w-3xl mx-auto text-center mb-16">
                    <ScrollReveal width="100%">
                        <Badge variant="secondary" className="mb-4 bg-orange-50 text-orange-700 border-orange-100/50">Features</Badge>
                        <h1 className="text-4xl font-bold tracking-tight sm:text-6xl mb-6">
                            The All-in-One <span className="text-orange-600">Asset OS</span>
                        </h1>
                        <p className="text-xl text-muted-foreground leading-relaxed">
                            Everything you need to track, manage, and scale your physical operations.
                            From procurement to disposal, Shelf has you covered.
                        </p>
                    </ScrollReveal>
                </div>

                {/* iOS Companion announcement strip */}
                <ScrollReveal width="100%">
                    <div className="max-w-3xl mx-auto mb-12">
                        <Link
                            href="/mobile-app"
                            className="group flex flex-col sm:flex-row items-center gap-4 rounded-2xl border border-orange-200 dark:border-orange-900/40 bg-orange-50/40 dark:bg-orange-950/20 px-6 py-4 transition-colors hover:bg-orange-50 dark:hover:bg-orange-950/30"
                        >
                            <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-xl bg-orange-100 text-orange-700 dark:bg-orange-900/50 dark:text-orange-200">
                                <Smartphone className="h-5 w-5" />
                            </div>
                            <div className="flex-1 text-center sm:text-left">
                                <p className="text-sm font-semibold text-foreground">
                                    Shelf Companion is now on the App Store and Google Play
                                </p>
                                <p className="text-xs text-muted-foreground">
                                    Scan, audit, and manage assets in the field. Free with any Shelf account. On iPhone and Android.
                                </p>
                            </div>
                            <span className="flex items-center text-sm font-semibold text-orange-600 group-hover:translate-x-0.5 transition-transform">
                                Learn more <ArrowRight className="ml-1 h-4 w-4" />
                            </span>
                        </Link>
                    </div>
                </ScrollReveal>

                {/* Feature Cards with Images */}
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                    {features.map(({ frontmatter, slug }, index) => {
                        const Icon = featureIcons[slug] || Layers;
                        const featureImage = frontmatter.image;

                        return (
                            <ScrollReveal key={slug} width="100%" delay={index * 0.05} className="h-full">
                                <Link href={`/features/${slug}`} className="group block h-full">
                                    <div className="h-full rounded-2xl bg-background border border-border/60 overflow-hidden hover:border-orange-500/30 hover:shadow-xl hover:shadow-orange-500/5 transition-all duration-300 flex flex-col">
                                        {/* Image Section */}
                                        <div className="relative aspect-[16/10] w-full overflow-hidden bg-muted">
                                            {featureImage ? (
                                                <Image
                                                    src={featureImage}
                                                    alt={frontmatter.title}
                                                    fill
                                                    className="object-cover object-top transition-transform duration-500 group-hover:scale-105 dark:brightness-90 dark:contrast-105"
                                                />
                                            ) : (
                                                <div className="absolute inset-0 bg-gradient-to-br from-orange-50 to-orange-100 dark:from-orange-950/30 dark:to-orange-900/20 flex items-center justify-center">
                                                    <Icon className="h-12 w-12 text-orange-300" />
                                                </div>
                                            )}
                                            {/* Gradient overlay at bottom for smooth transition */}
                                            <div className="absolute inset-x-0 bottom-0 h-16 bg-gradient-to-t from-background/80 to-transparent" />

                                            {/* Icon badge */}
                                            <div className="absolute top-4 left-4 flex h-10 w-10 items-center justify-center rounded-xl bg-white/90 dark:bg-card/90 backdrop-blur-sm border border-white/20 dark:border-border/30 shadow-sm text-orange-600">
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
                                            <div className="mt-4 flex items-center text-sm font-medium text-orange-600 transition-all duration-300 group-hover:translate-x-0.5">
                                                Learn more <ArrowRight className="ml-1.5 h-3.5 w-3.5" />
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
        </PagefindWrapper>
    );
}
