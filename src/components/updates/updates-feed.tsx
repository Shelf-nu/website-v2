"use client";

import Image from "next/image";
import Link from "next/link";
import { Container } from "@/components/ui/container";
import { Badge } from "@/components/ui/badge";
import { ArrowRight, ExternalLink, Sparkles } from "lucide-react";
import { ScrollReveal } from "@/components/ui/scroll-reveal";
import { MDXContent } from "@/lib/mdx";
import { Button } from "@/components/ui/button";
import { Breadcrumbs } from "@/components/ui/breadcrumbs";

interface UpdatesFeedProps {
    updates: MDXContent[];
}

function formatDate(dateStr: string) {
    return new Date(dateStr).toLocaleDateString("en-US", {
        year: "numeric",
        month: "long",
        day: "numeric",
    });
}

function groupByYear(updates: MDXContent[]): Record<string, MDXContent[]> {
    const groups: Record<string, MDXContent[]> = {};
    for (const update of updates) {
        const year = new Date(update.frontmatter.date || "").getFullYear().toString();
        if (!groups[year]) groups[year] = [];
        groups[year].push(update);
    }
    return groups;
}

function isExternalUrl(url: string) {
    return url.startsWith("http://") || url.startsWith("https://");
}

export function UpdatesFeed({ updates }: UpdatesFeedProps) {
    const yearGroups = groupByYear(updates);
    const years = Object.keys(yearGroups).sort((a, b) => Number(b) - Number(a));

    return (
        <div className="flex min-h-screen flex-col relative">
            {/* Background */}
            <div className="absolute top-0 inset-x-0 h-[600px] -z-10 bg-[radial-gradient(ellipse_at_top,_var(--tw-gradient-stops))] from-orange-50/30 via-background to-background pointer-events-none" />
            <div className="absolute top-0 inset-x-0 h-[600px] -z-10 bg-[linear-gradient(to_right,#80808012_1px,transparent_1px),linear-gradient(to_bottom,#80808012_1px,transparent_1px)] bg-[size:24px_24px] [mask-image:radial-gradient(ellipse_60%_50%_at_50%_0%,#000_70%,transparent_100%)] pointer-events-none" />

            {/* Hero */}
            <Container className="pt-32 pb-12 md:pt-48 md:pb-16 text-center relative z-10">
                <div className="flex justify-center mb-8">
                    <Breadcrumbs />
                </div>

                <Badge variant="secondary" className="mb-8 bg-orange-50 text-orange-700 border-orange-100/50 px-4 py-1 text-sm">
                    <Sparkles className="h-3.5 w-3.5 mr-1.5" />
                    Product Updates
                </Badge>

                <h1 className="text-4xl md:text-6xl lg:text-7xl font-bold tracking-tight text-foreground mb-6 max-w-4xl mx-auto leading-[1.1]">
                    What&apos;s new in Shelf
                </h1>

                <p className="text-xl md:text-2xl text-muted-foreground mb-8 max-w-2xl mx-auto leading-relaxed">
                    A timeline of every feature, improvement, and milestone since day one.
                </p>

                <div className="inline-flex items-center gap-2 text-sm text-muted-foreground bg-muted/50 border border-border/50 rounded-full px-4 py-2">
                    <span className="h-2 w-2 rounded-full bg-green-500 animate-pulse" />
                    {updates.length} updates shipped
                </div>
            </Container>

            {/* Divider */}
            <div className="border-b border-border/40" />

            {/* Timeline */}
            <Container className="py-16 md:py-24">
                <div className="max-w-3xl mx-auto">
                    {years.map((year) => (
                        <div key={year} className="relative">
                            {/* Year Header */}
                            <ScrollReveal width="100%">
                                <div className="flex items-center gap-4 mb-10">
                                    <div className="h-px flex-1 bg-border/60" />
                                    <span className="text-2xl md:text-3xl font-bold text-foreground tracking-tight">
                                        {year}
                                    </span>
                                    <div className="h-px flex-1 bg-border/60" />
                                </div>
                            </ScrollReveal>

                            {/* Entries for this year */}
                            <div className="relative pl-8 md:pl-12 space-y-12 mb-16">
                                {/* Timeline Line */}
                                <div className="absolute left-[11px] md:left-[19px] top-2 bottom-0 w-px bg-gradient-to-b from-orange-300 via-border to-transparent" />

                                {yearGroups[year].map((update, i) => (
                                    <ScrollReveal key={update.slug} width="100%" delay={i * 0.05}>
                                        <div className="relative group">
                                            {/* Timeline Dot */}
                                            <div className="absolute -left-8 md:-left-12 top-1.5 z-10">
                                                <div className="h-[10px] w-[10px] rounded-full bg-orange-500 border-2 border-background ring-4 ring-background group-hover:ring-orange-50 transition-all" />
                                            </div>

                                            {/* Card */}
                                            <article className="bg-card/40 border border-border/40 rounded-2xl overflow-hidden hover:bg-card/80 hover:border-border/60 hover:shadow-lg hover:shadow-black/5 transition-all duration-300">
                                                {/* Image */}
                                                {update.frontmatter.image && (
                                                    <div className="relative aspect-video w-full bg-muted border-b border-border/40 overflow-hidden">
                                                        <Image
                                                            src={update.frontmatter.image}
                                                            alt={update.frontmatter.title}
                                                            fill
                                                            className="object-cover transition-transform duration-500 group-hover:scale-[1.02]"
                                                        />
                                                    </div>
                                                )}

                                                {/* Content */}
                                                <div className="p-6 md:p-8">
                                                    {/* Date */}
                                                    <time
                                                        dateTime={update.frontmatter.date}
                                                        className="text-sm font-medium text-orange-600"
                                                    >
                                                        {formatDate(update.frontmatter.date || "")}
                                                    </time>

                                                    {/* Title */}
                                                    <h3 className="text-xl md:text-2xl font-bold text-foreground mt-2 mb-3 tracking-tight leading-tight">
                                                        <Link href={`/updates/${update.slug}`} className="hover:text-orange-600 transition-colors">
                                                            {update.frontmatter.title}
                                                        </Link>
                                                    </h3>

                                                    {/* Description */}
                                                    <p className="text-muted-foreground leading-relaxed">
                                                        {update.frontmatter.description}
                                                    </p>

                                                    {/* Read More Link */}
                                                    {update.frontmatter.readMoreUrl && (
                                                        <div className="mt-4 pt-4 border-t border-border/30">
                                                            {isExternalUrl(update.frontmatter.readMoreUrl) ? (
                                                                <a
                                                                    href={update.frontmatter.readMoreUrl}
                                                                    target="_blank"
                                                                    rel="noopener noreferrer"
                                                                    className="inline-flex items-center text-sm font-medium text-orange-600 hover:text-orange-700 transition-colors"
                                                                >
                                                                    Learn more
                                                                    <ExternalLink className="ml-1.5 h-3.5 w-3.5" />
                                                                </a>
                                                            ) : (
                                                                <Link
                                                                    href={update.frontmatter.readMoreUrl}
                                                                    className="inline-flex items-center text-sm font-medium text-orange-600 hover:text-orange-700 transition-colors"
                                                                >
                                                                    Learn more
                                                                    <ArrowRight className="ml-1.5 h-3.5 w-3.5" />
                                                                </Link>
                                                            )}
                                                        </div>
                                                    )}
                                                </div>
                                            </article>
                                        </div>
                                    </ScrollReveal>
                                ))}
                            </div>
                        </div>
                    ))}

                    {/* Timeline End */}
                    <ScrollReveal width="100%">
                        <div className="flex items-center justify-center gap-3 py-8 text-muted-foreground">
                            <div className="h-px w-12 bg-border/60" />
                            <span className="text-sm font-medium">The beginning</span>
                            <div className="h-px w-12 bg-border/60" />
                        </div>
                    </ScrollReveal>
                </div>

                {/* Bottom CTA */}
                <div className="max-w-3xl mx-auto mt-16">
                    <div className="bg-orange-50 border border-orange-100 rounded-2xl p-8 md:p-12 text-center md:text-left md:flex items-center justify-between gap-8">
                        <div className="max-w-xl">
                            <h3 className="text-2xl md:text-3xl font-bold text-orange-950 mb-3">
                                Ready to get organized?
                            </h3>
                            <p className="text-orange-800/80 text-lg">
                                Join thousands of teams who track their assets with Shelf.
                            </p>
                        </div>
                        <div className="flex flex-col sm:flex-row gap-3 mt-6 md:mt-0 shrink-0">
                            <Button size="lg" className="bg-orange-600 hover:bg-orange-700 text-white shadow-lg shadow-orange-900/10" asChild>
                                <Link href="https://app.shelf.nu/register?utm_source=shelf_website&utm_medium=cta&utm_content=updates_bottom_cta_signup">Get Started Free</Link>
                            </Button>
                            <Button size="lg" variant="outline" className="border-orange-200 text-orange-800 hover:bg-orange-100" asChild>
                                <Link href="/demo?utm_source=shelf_website&utm_medium=cta&utm_content=updates_bottom_cta_demo">Book Demo</Link>
                            </Button>
                        </div>
                    </div>
                </div>
            </Container>
        </div>
    );
}
