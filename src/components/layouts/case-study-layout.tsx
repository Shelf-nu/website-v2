import { Frontmatter } from "@/lib/content/schema";
import { PageHeader } from "./shared/page-header";
import { RelatedContent } from "./shared/related-content";
import { SeoHead } from "./shared/seo-head";
import { Container } from "@/components/ui/container";
import Link from "next/link";
import { ArrowRight } from "lucide-react";

interface LayoutProps {
    frontmatter: Frontmatter;
    children: React.ReactNode;
}

export function CaseStudyLayout({ frontmatter, children }: LayoutProps) {
    return (
        <>
            <SeoHead frontmatter={frontmatter} />
            <div className="flex min-h-screen flex-col">
                <PageHeader
                    title={frontmatter.title}
                    description={frontmatter.description}
                    heroTagline={frontmatter.organization ? `Case Study: ${frontmatter.organization}` : "Case Study"}
                >
                    <div className="flex flex-wrap items-center justify-center gap-x-8 gap-y-4 text-sm text-muted-foreground mt-8 border-t border-white/10 pt-8 max-w-2xl mx-auto">
                        {frontmatter.industry && (
                            <div className="flex items-center gap-2">
                                <span className="font-semibold text-foreground">Industry:</span> {frontmatter.industry}
                            </div>
                        )}
                        {frontmatter.location && (
                            <div className="flex items-center gap-2">
                                <span className="font-semibold text-foreground">Location:</span> {frontmatter.location}
                            </div>
                        )}
                        {frontmatter.personas && frontmatter.personas.length > 0 && (
                            <div className="flex items-center gap-2">
                                <span className="font-semibold text-foreground">Team:</span> {frontmatter.personas.map(p => p.charAt(0).toUpperCase() + p.slice(1)).join(", ")}
                            </div>
                        )}
                    </div>
                </PageHeader>

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
                            {/* Large Quote Breakout */}
                            {frontmatter.quotes && frontmatter.quotes.length > 0 && (
                                <blockquote className="relative my-16 pl-8 border-l-4 border-orange-500 italic">
                                    <p className="text-2xl font-medium leading-relaxed text-foreground mb-4">
                                        "{typeof frontmatter.quotes[0] === 'string' ? frontmatter.quotes[0] : frontmatter.quotes[0].quote}"
                                    </p>
                                    {typeof frontmatter.quotes[0] !== 'string' && frontmatter.quotes[0].author && (
                                        <footer className="text-base not-italic text-muted-foreground">
                                            <span className="font-semibold text-foreground">{frontmatter.quotes[0].author}</span>
                                            {frontmatter.quotes[0].role && <span> — {frontmatter.quotes[0].role}</span>}
                                        </footer>
                                    )}
                                </blockquote>
                            )}

                            <div className="prose prose-lg dark:prose-invert prose-headings:font-semibold prose-headings:tracking-tight prose-p:leading-relaxed prose-img:rounded-2xl prose-img:border prose-img:border-border/50">
                                {children}
                            </div>

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
                    </Container>
                </main>

                {frontmatter.related && <RelatedContent related={frontmatter.related} />}
            </div>
        </>
    );
}
