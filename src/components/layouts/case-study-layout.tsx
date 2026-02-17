import { Frontmatter } from "@/lib/content/schema";
import { RelatedContent } from "./shared/related-content";
import { SeoHead } from "./shared/seo-head";
import { Container } from "@/components/ui/container";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import Link from "next/link";
import { ArrowRight, ArrowLeft, MapPin, Users, ExternalLink } from "lucide-react";
import Image from "next/image";

interface LayoutProps {
    frontmatter: Frontmatter;
    children: React.ReactNode;
}

export function CaseStudyLayout({ frontmatter, children }: LayoutProps) {
    const customer = typeof frontmatter.customer === "object" ? frontmatter.customer : null;
    const industryDisplay = Array.isArray(frontmatter.industry)
        ? frontmatter.industry
        : frontmatter.industry
            ? [frontmatter.industry]
            : [];

    return (
        <>
            <SeoHead frontmatter={frontmatter} />
            <div className="flex min-h-screen flex-col">
                {/* ================================================================
                    CASE STUDY HERO — Custom header (not generic PageHeader)
                    ================================================================ */}
                <section className="relative overflow-hidden">
                    {/* Background */}
                    <div className="absolute top-0 inset-x-0 h-[600px] -z-10 bg-[radial-gradient(ellipse_at_top,_var(--tw-gradient-stops))] from-orange-50/30 via-background to-background pointer-events-none" />
                    <div className="absolute top-0 inset-x-0 h-[600px] -z-10 bg-[linear-gradient(to_right,#80808012_1px,transparent_1px),linear-gradient(to_bottom,#80808012_1px,transparent_1px)] bg-[size:24px_24px] [mask-image:radial-gradient(ellipse_60%_50%_at_50%_0%,#000_70%,transparent_100%)] pointer-events-none" />

                    <Container className="pt-32 pb-12 md:pt-44 md:pb-16 relative">
                        {/* Back link */}
                        <div className="flex items-center gap-4 mb-10">
                            <Link
                                href="/case-studies"
                                className="inline-flex items-center text-sm text-muted-foreground hover:text-orange-600 transition-colors"
                            >
                                <ArrowLeft className="h-4 w-4 mr-1.5" />
                                All case studies
                            </Link>
                        </div>

                        {/* Logo + Org Name Row */}
                        <div className="flex items-center gap-4 mb-8">
                            {frontmatter.logo && (
                                <div className="h-14 w-14 rounded-xl bg-white border border-border/60 p-2 shadow-sm flex items-center justify-center flex-shrink-0">
                                    <Image
                                        src={frontmatter.logo}
                                        alt={frontmatter.organization || "Company logo"}
                                        width={48}
                                        height={48}
                                        className="h-full w-full object-contain"
                                    />
                                </div>
                            )}
                            <div>
                                <p className="text-orange-600 font-semibold text-sm uppercase tracking-widest">
                                    Case Study
                                </p>
                                {frontmatter.organization && (
                                    <p className="text-lg font-semibold text-foreground">
                                        {frontmatter.organization}
                                    </p>
                                )}
                            </div>
                        </div>

                        {/* Title */}
                        <h1 className="text-3xl md:text-5xl lg:text-6xl font-bold tracking-tight text-foreground mb-6 leading-[1.1] max-w-4xl">
                            {frontmatter.title}
                        </h1>

                        {/* Description */}
                        <p className="text-xl md:text-2xl text-muted-foreground leading-relaxed mb-10 max-w-3xl">
                            {frontmatter.description}
                        </p>

                        {/* Metadata Chips */}
                        <div className="flex flex-wrap items-center gap-3 mb-10">
                            {industryDisplay.slice(0, 3).map((tag) => (
                                <Badge key={tag} variant="secondary" className="bg-orange-50 text-orange-700 border-orange-100/50 text-xs px-3 py-1">
                                    {tag}
                                </Badge>
                            ))}
                            {frontmatter.location && (
                                <span className="inline-flex items-center gap-1.5 text-sm text-muted-foreground">
                                    <MapPin className="h-3.5 w-3.5" />
                                    {frontmatter.location}
                                </span>
                            )}
                            {customer?.size && (
                                <span className="inline-flex items-center gap-1.5 text-sm text-muted-foreground">
                                    <Users className="h-3.5 w-3.5" />
                                    {customer.size}
                                </span>
                            )}
                            {customer?.website && (
                                <a
                                    href={customer.website}
                                    target="_blank"
                                    rel="noopener noreferrer"
                                    className="inline-flex items-center gap-1.5 text-sm text-orange-600 hover:text-orange-700 font-medium transition-colors"
                                >
                                    <ExternalLink className="h-3.5 w-3.5" />
                                    Website
                                </a>
                            )}
                        </div>
                    </Container>

                    {/* Cover Image — full-bleed below hero text */}
                    {frontmatter.coverImage && (
                        <Container className="pb-8">
                            <div className="relative w-full aspect-[21/9] max-h-[420px] overflow-hidden rounded-2xl border border-border/50 shadow-lg shadow-black/5">
                                <Image
                                    src={frontmatter.coverImage}
                                    alt={frontmatter.title}
                                    fill
                                    className="object-cover"
                                    priority
                                />
                            </div>
                        </Container>
                    )}

                    {/* Divider */}
                    <div className="border-b border-border/40" />
                </section>

                {/* ================================================================
                    MAIN CONTENT
                    ================================================================ */}
                <main className="flex-1">
                    <Container className="py-16 md:py-24">
                        {/* Key Results - High Impact Grid */}
                        {frontmatter.featured_metrics && frontmatter.featured_metrics.length > 0 && (
                            <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-20">
                                {frontmatter.featured_metrics.map((metric, i) => (
                                    <div key={i} className="flex flex-col items-center justify-center p-8 bg-muted/30 rounded-2xl border border-border/50 text-center">
                                        <div className="text-4xl md:text-5xl font-bold tracking-tight text-orange-600 mb-2">
                                            {metric.value || "—"}
                                        </div>
                                        <div className="text-sm font-medium text-muted-foreground uppercase tracking-wide">
                                            {metric.label}
                                        </div>
                                    </div>
                                ))}
                            </div>
                        )}

                        {/* Main Content - Centered */}
                        <div className="mx-auto max-w-3xl font-normal">
                            <div className="prose prose-lg dark:prose-invert prose-headings:font-semibold prose-headings:tracking-tight prose-p:leading-relaxed prose-img:rounded-2xl prose-img:border prose-img:border-border/50">
                                {children}
                            </div>

                            {/* Featured Quote — Closing Highlight */}
                            {frontmatter.quotes && frontmatter.quotes.length > 0 && (
                                <blockquote className="relative mt-20 mb-16 pl-8 border-l-4 border-orange-500 italic">
                                    <p className="text-2xl font-medium leading-relaxed text-foreground mb-4">
                                        &ldquo;{typeof frontmatter.quotes[0] === 'string' ? frontmatter.quotes[0] : frontmatter.quotes[0].quote}&rdquo;
                                    </p>
                                    {typeof frontmatter.quotes[0] !== 'string' && frontmatter.quotes[0].author && (
                                        <footer className="text-base not-italic text-muted-foreground">
                                            <span className="font-semibold text-foreground">{frontmatter.quotes[0].author}</span>
                                            {frontmatter.quotes[0].role && <span> — {frontmatter.quotes[0].role}</span>}
                                        </footer>
                                    )}
                                </blockquote>
                            )}

                            {/* Read Next Flow */}
                            {frontmatter.nextStudy && (
                                <div className="mt-24 pt-12 border-t border-border/40">
                                    <p className="text-sm font-semibold uppercase text-muted-foreground tracking-widest mb-6">Read Next</p>
                                    <Link href={`/case-studies/${frontmatter.nextStudy.slug}`} className="group block">
                                        <div className="relative overflow-hidden rounded-2xl bg-muted/30 border border-border/50 p-8 md:p-12 transition-all duration-300 hover:bg-orange-50/50 hover:border-orange-200 hover:shadow-lg hover:shadow-orange-500/5">
                                            <div className="relative z-10 flex flex-col md:flex-row md:items-center justify-between gap-6">
                                                <div>
                                                    <h3 className="text-2xl md:text-3xl font-bold text-foreground mb-2 group-hover:text-orange-900 transition-colors">
                                                        {frontmatter.nextStudy.organization || frontmatter.nextStudy.title}
                                                    </h3>
                                                    <p className="text-lg text-muted-foreground group-hover:text-orange-900/70 transition-colors line-clamp-2 max-w-xl">
                                                        {frontmatter.nextStudy.description}
                                                    </p>
                                                </div>
                                                <div className="flex-shrink-0">
                                                    <div className="h-12 w-12 rounded-full bg-white border border-border/50 flex items-center justify-center text-orange-600 shadow-sm group-hover:scale-110 group-hover:bg-orange-600 group-hover:text-white group-hover:border-orange-600 transition-all duration-300">
                                                        <ArrowRight className="h-6 w-6" />
                                                    </div>
                                                </div>
                                            </div>
                                            {/* Decorative Background */}
                                            <div className="absolute -right-20 -bottom-20 w-64 h-64 bg-orange-100/40 rounded-full blur-[80px] group-hover:bg-orange-200/40 transition-colors duration-500" />
                                        </div>
                                    </Link>
                                </div>
                            )}
                        </div>

                        {/* Bottom CTA */}
                        <div className="mx-auto max-w-3xl mt-24">
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
                                        <Link href="https://app.shelf.nu/register">Get Started Free</Link>
                                    </Button>
                                    <Button size="lg" variant="outline" className="border-orange-200 text-orange-800 hover:bg-orange-100" asChild>
                                        <Link href="/demo">Book Demo</Link>
                                    </Button>
                                </div>
                            </div>
                        </div>
                    </Container>
                </main>

                {frontmatter.related && <RelatedContent related={frontmatter.related} />}
            </div>
        </>
    );
}
