import Link from "next/link";
import { getAllContent } from "@/lib/mdx";
import { Container } from "@/components/ui/container";
import { Metadata } from "next";
import { Badge } from "@/components/ui/badge";
import { ScrollReveal } from "@/components/ui/scroll-reveal";
import { CTA } from "@/components/sections/cta";
import { ArrowRight, BookOpen, Tag, ScanLine, Ghost, Wrench } from "lucide-react";
import { LucideIcon } from "lucide-react";

export const metadata: Metadata = {
    title: "Asset Management Glossary | Shelf",
    description: "Clear definitions for asset tagging, check-in/check-out, ghost assets, preventive maintenance, and other key equipment management terms.",
};

const termIcons: Record<string, LucideIcon> = {
    "asset-tagging": Tag,
    "check-in-check-out": ScanLine,
    "ghost-assets": Ghost,
    "preventive-maintenance": Wrench,
};

const termRelated: Record<string, { label: string; href: string }[]> = {
    "asset-tagging": [
        { label: "Asset Tracking", href: "/solutions/asset-tracking" },
        { label: "Location Tracking", href: "/features/location-tracking" },
        { label: "Custody", href: "/features/custody" },
    ],
    "check-in-check-out": [
        { label: "Custody", href: "/features/custody" },
        { label: "Bookings", href: "/features/bookings" },
        { label: "Kits", href: "/features/kits" },
    ],
    "ghost-assets": [
        { label: "Asset Tracking", href: "/solutions/asset-tracking" },
        { label: "Dashboard", href: "/features/dashboard" },
        { label: "Asset Reminders", href: "/features/asset-reminders" },
    ],
    "preventive-maintenance": [
        { label: "Asset Reminders", href: "/features/asset-reminders" },
        { label: "Dashboard", href: "/features/dashboard" },
    ],
};

export default function GlossaryIndexPage() {
    const terms = getAllContent("glossary");

    const sorted = [...terms].sort((a, b) =>
        a.frontmatter.title.localeCompare(b.frontmatter.title)
    );

    return (
        <div className="flex min-h-screen flex-col relative overflow-hidden">
            {/* Ambient Background */}
            <div className="absolute top-0 inset-x-0 h-[600px] -z-10 bg-[linear-gradient(to_right,#80808012_1px,transparent_1px),linear-gradient(to_bottom,#80808012_1px,transparent_1px)] bg-[size:24px_24px] [mask-image:radial-gradient(ellipse_60%_50%_at_50%_0%,#000_70%,transparent_100%)] pointer-events-none" />
            <div className="absolute top-0 inset-x-0 h-[600px] bg-[radial-gradient(ellipse_at_top,_var(--tw-gradient-stops))] from-orange-50/20 via-background to-background pointer-events-none" />

            <Container className="py-24 md:py-32 relative">
                <div className="max-w-3xl mx-auto text-center mb-16">
                    <ScrollReveal width="100%">
                        <Badge variant="secondary" className="mb-4 bg-orange-50 text-orange-700 border-orange-100/50">Reference</Badge>
                        <h1 className="text-4xl font-bold tracking-tight sm:text-6xl mb-6">
                            Asset Management <span className="text-orange-600">Glossary</span>
                        </h1>
                        <p className="text-xl text-muted-foreground leading-relaxed">
                            Key terms and definitions every equipment manager should know.
                        </p>
                    </ScrollReveal>
                </div>

                {/* Term Cards */}
                <div className="max-w-4xl mx-auto space-y-6">
                    {sorted.map((term, index) => {
                        const Icon = termIcons[term.slug] || BookOpen;
                        const related = termRelated[term.slug] || [];

                        return (
                            <ScrollReveal key={term.slug} delay={index * 0.08} width="100%">
                                <div className="group rounded-2xl border border-border/60 bg-background overflow-hidden hover:border-orange-500/30 hover:shadow-xl hover:shadow-orange-500/5 transition-all duration-300">
                                    <div className="p-8 md:p-10">
                                        {/* Header row */}
                                        <div className="flex items-start gap-5 mb-5">
                                            <div className="shrink-0 flex h-12 w-12 items-center justify-center rounded-xl bg-orange-50 text-orange-600">
                                                <Icon className="h-6 w-6" />
                                            </div>
                                            <div className="flex-1 min-w-0">
                                                <Link href={`/glossary/${term.slug}`} className="hover:text-orange-600 transition-colors">
                                                    <h2 className="text-2xl font-bold text-foreground mb-1 group-hover:text-orange-600 transition-colors">
                                                        {term.frontmatter.title}
                                                    </h2>
                                                </Link>
                                            </div>
                                        </div>

                                        {/* Definition */}
                                        <p className="text-muted-foreground leading-relaxed mb-6 text-[15px]">
                                            {term.frontmatter.definition || term.frontmatter.description}
                                        </p>

                                        {/* Related features + Read more */}
                                        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 pt-5 border-t border-border/40">
                                            {related.length > 0 && (
                                                <div className="flex flex-wrap gap-2">
                                                    {related.map((r) => (
                                                        <Link
                                                            key={r.href}
                                                            href={r.href}
                                                            className="inline-flex items-center rounded-full bg-orange-50/70 px-3 py-1 text-xs font-medium text-orange-700 hover:bg-orange-100 transition-colors"
                                                        >
                                                            {r.label}
                                                        </Link>
                                                    ))}
                                                </div>
                                            )}
                                            <Link
                                                href={`/glossary/${term.slug}`}
                                                className="inline-flex items-center text-sm font-medium text-orange-600 hover:text-orange-700 transition-colors shrink-0"
                                            >
                                                Full definition <ArrowRight className="ml-1.5 h-3.5 w-3.5" />
                                            </Link>
                                        </div>
                                    </div>
                                </div>
                            </ScrollReveal>
                        );
                    })}
                </div>

                {/* Explore more section */}
                <div className="max-w-4xl mx-auto mt-16">
                    <ScrollReveal width="100%">
                        <div className="rounded-2xl border border-dashed border-border/60 bg-muted/20 p-8 md:p-10 text-center">
                            <BookOpen className="h-8 w-8 text-muted-foreground/40 mx-auto mb-4" />
                            <h3 className="text-lg font-semibold text-foreground mb-2">Looking for more?</h3>
                            <p className="text-sm text-muted-foreground mb-5 max-w-md mx-auto">
                                Explore core concepts like asset lifecycle management and circular economy frameworks.
                            </p>
                            <Link
                                href="/concepts"
                                className="inline-flex items-center text-sm font-medium text-orange-600 hover:text-orange-700 transition-colors"
                            >
                                Browse concepts <ArrowRight className="ml-1.5 h-3.5 w-3.5" />
                            </Link>
                        </div>
                    </ScrollReveal>
                </div>
            </Container>

            <CTA />
        </div>
    );
}
