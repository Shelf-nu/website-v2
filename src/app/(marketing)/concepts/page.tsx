import Link from "next/link";
import { getAllContent } from "@/lib/mdx";
import { Container } from "@/components/ui/container";
import { Metadata } from "next";
import { Badge } from "@/components/ui/badge";
import { ScrollReveal } from "@/components/ui/scroll-reveal";
import { CTA } from "@/components/sections/cta";
import { ArrowRight, RotateCcw, TrendingUp, BookOpen } from "lucide-react";
import { LucideIcon } from "lucide-react";

export const metadata: Metadata = {
    title: "Asset Management Concepts | Shelf",
    description: "Explore core frameworks like the asset lifecycle and circular economy — and how they apply to modern equipment management.",
};

const conceptData: Record<string, {
    icon: LucideIcon;
    gradient: string;
    iconBg: string;
    keyPoints: string[];
    related: { label: string; href: string }[];
}> = {
    "asset-lifecycle": {
        icon: TrendingUp,
        gradient: "from-orange-50 to-amber-50",
        iconBg: "bg-orange-100 text-orange-700",
        keyPoints: [
            "Planning & procurement",
            "Deployment & active use",
            "Maintenance & optimization",
            "Retirement & replacement",
        ],
        related: [
            { label: "Asset Tracking", href: "/solutions/asset-tracking" },
            { label: "Asset Reminders", href: "/features/asset-reminders" },
            { label: "Custody", href: "/features/custody" },
            { label: "Bookings", href: "/features/bookings" },
        ],
    },
    "circular-economy": {
        icon: RotateCcw,
        gradient: "from-emerald-50 to-teal-50",
        iconBg: "bg-emerald-100 text-emerald-700",
        keyPoints: [
            "Design for longevity",
            "Optimize utilization",
            "Extend lifespan via maintenance",
            "Recover value through reuse",
        ],
        related: [
            { label: "Preventive Maintenance", href: "/glossary/preventive-maintenance" },
            { label: "Dashboard", href: "/features/dashboard" },
            { label: "Asset Reminders", href: "/features/asset-reminders" },
        ],
    },
};

export default function ConceptsIndexPage() {
    const concepts = getAllContent("concepts");

    return (
        <div className="flex min-h-screen flex-col relative overflow-hidden">
            {/* Ambient Background */}
            <div className="absolute top-0 inset-x-0 h-[600px] -z-10 bg-grid-pattern bg-[size:24px_24px] [mask-image:radial-gradient(ellipse_60%_50%_at_50%_0%,#000_70%,transparent_100%)] pointer-events-none" />
            <div className="absolute top-0 inset-x-0 h-[600px] bg-[radial-gradient(ellipse_at_top,_var(--tw-gradient-stops))] from-orange-50/20 via-background to-background pointer-events-none" />

            <Container className="py-24 md:py-32 relative">
                <div className="max-w-3xl mx-auto text-center mb-16">
                    <ScrollReveal width="100%">
                        <Badge variant="secondary" className="mb-4 bg-orange-50 text-orange-700 border-orange-100/50">Learn</Badge>
                        <h1 className="text-4xl font-bold tracking-tight sm:text-6xl mb-6">
                            Core <span className="text-orange-600">Concepts</span>
                        </h1>
                        <p className="text-xl text-muted-foreground leading-relaxed">
                            The frameworks and ideas behind effective physical asset management.
                        </p>
                    </ScrollReveal>
                </div>

                {/* Concept Cards — editorial layout */}
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6 max-w-5xl mx-auto">
                    {concepts.map((concept, index) => {
                        const data = conceptData[concept.slug];
                        const Icon = data?.icon || BookOpen;
                        const gradient = data?.gradient || "from-orange-50 to-amber-50";
                        const iconBg = data?.iconBg || "bg-orange-100 text-orange-700";
                        const keyPoints = data?.keyPoints || [];
                        const related = data?.related || [];

                        return (
                            <ScrollReveal key={concept.slug} delay={index * 0.1} width="100%" className="h-full">
                                <div className="group h-full rounded-2xl border border-border/60 bg-background overflow-hidden hover:border-orange-500/30 hover:shadow-xl hover:shadow-orange-500/5 transition-all duration-300 flex flex-col">
                                    {/* Colored header band */}
                                    <div className={`bg-gradient-to-br ${gradient} p-8 pb-6`}>
                                        <div className={`inline-flex h-14 w-14 items-center justify-center rounded-2xl ${iconBg} mb-5`}>
                                            <Icon className="h-7 w-7" />
                                        </div>
                                        <Link href={`/concepts/${concept.slug}`}>
                                            <h2 className="text-2xl font-bold text-foreground group-hover:text-orange-600 transition-colors mb-2">
                                                {concept.frontmatter.title}
                                            </h2>
                                        </Link>
                                        <p className="text-muted-foreground text-[15px] leading-relaxed">
                                            {concept.frontmatter.description}
                                        </p>
                                    </div>

                                    {/* Body */}
                                    <div className="p-8 pt-6 flex flex-col flex-1">
                                        {/* Key points */}
                                        {keyPoints.length > 0 && (
                                            <div className="mb-6">
                                                <p className="text-xs font-semibold text-muted-foreground/70 uppercase tracking-wider mb-3">Key stages</p>
                                                <ul className="space-y-2.5">
                                                    {keyPoints.map((point, i) => (
                                                        <li key={i} className="flex items-center gap-3 text-sm text-foreground">
                                                            <span className="shrink-0 flex h-6 w-6 items-center justify-center rounded-full bg-orange-50 text-orange-600 text-xs font-bold">
                                                                {i + 1}
                                                            </span>
                                                            {point}
                                                        </li>
                                                    ))}
                                                </ul>
                                            </div>
                                        )}

                                        {/* Related features */}
                                        {related.length > 0 && (
                                            <div className="mb-6 flex-1">
                                                <p className="text-xs font-semibold text-muted-foreground/70 uppercase tracking-wider mb-3">Related in Shelf</p>
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
                                            </div>
                                        )}

                                        {/* Read more */}
                                        <Link
                                            href={`/concepts/${concept.slug}`}
                                            className="inline-flex items-center text-sm font-medium text-orange-600 hover:text-orange-700 transition-colors mt-auto pt-5 border-t border-border/40"
                                        >
                                            Read full guide <ArrowRight className="ml-1.5 h-3.5 w-3.5" />
                                        </Link>
                                    </div>
                                </div>
                            </ScrollReveal>
                        );
                    })}
                </div>

                {/* Cross-link to glossary */}
                <div className="max-w-5xl mx-auto mt-16">
                    <ScrollReveal width="100%">
                        <div className="rounded-2xl border border-dashed border-border/60 bg-muted/20 p-8 md:p-10 text-center">
                            <BookOpen className="h-8 w-8 text-muted-foreground/40 mx-auto mb-4" />
                            <h3 className="text-lg font-semibold text-foreground mb-2">Need a quick definition?</h3>
                            <p className="text-sm text-muted-foreground mb-5 max-w-md mx-auto">
                                Our glossary covers terms like asset tagging, check-in/check-out, ghost assets, and preventive maintenance.
                            </p>
                            <Link
                                href="/glossary"
                                className="inline-flex items-center text-sm font-medium text-orange-600 hover:text-orange-700 transition-colors"
                            >
                                Browse glossary <ArrowRight className="ml-1.5 h-3.5 w-3.5" />
                            </Link>
                        </div>
                    </ScrollReveal>
                </div>
            </Container>

            <CTA />
        </div>
    );
}
