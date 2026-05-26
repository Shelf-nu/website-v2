import { getAllContent } from "@/lib/mdx";
import { Metadata } from "next";
import { Container } from "@/components/ui/container";
import { Badge } from "@/components/ui/badge";
import { ScrollReveal } from "@/components/ui/scroll-reveal";
import { PagefindWrapper } from "@/components/search/pagefind-wrapper";
import { StructuredData } from "@/components/seo/structured-data";
import { collectionPageJsonLd } from "@/lib/seo";
import Link from "next/link";
import { ArrowRight, FileText, Calendar } from "lucide-react";

export const metadata: Metadata = {
    title: "Reports — Shelf Industry Research",
    description:
        "Original data on how teams actually track equipment. Annual reports drawn from anonymized telemetry across thousands of Shelf workspaces. Free to read, share, and cite under CC BY 4.0.",
    alternates: { canonical: "https://www.shelf.nu/reports" },
};

export default function ReportsHubPage() {
    const reports = getAllContent("reports");
    const featured = reports.find((r) => r.frontmatter.featured) ?? reports[0];
    const archive = featured ? reports.filter((r) => r.slug !== featured.slug) : [];

    const collectionSchema = collectionPageJsonLd({
        name: "Shelf Reports",
        description:
            "Annual industry reports on equipment management drawn from Shelf's anonymized telemetry.",
        url: "/reports",
        items: reports.map((r) => ({
            name: r.frontmatter.title,
            url: `/reports/${r.slug}`,
            description: r.frontmatter.description,
        })),
    });

    return (
        <PagefindWrapper type="Page" title="Shelf Reports" keywords="reports research data state of equipment management industry">
            <StructuredData data={collectionSchema} />

            <div className="flex min-h-screen flex-col relative overflow-hidden">
                <div className="absolute top-0 inset-x-0 h-[600px] -z-10 bg-grid-pattern bg-[size:24px_24px] [mask-image:radial-gradient(ellipse_60%_50%_at_50%_0%,#000_70%,transparent_100%)] pointer-events-none" />
                <div className="absolute top-0 inset-x-0 h-[600px] bg-[radial-gradient(ellipse_at_top,_var(--tw-gradient-stops))] from-orange-50/20 via-background to-background pointer-events-none" />

                <Container className="py-24 md:py-32 relative">
                    {/* Hero */}
                    <div className="max-w-3xl mx-auto text-center mb-16">
                        <ScrollReveal width="100%">
                            <Badge
                                variant="secondary"
                                className="mb-4 bg-orange-50 text-orange-700 border-orange-100/50"
                            >
                                Industry Research
                            </Badge>
                            <h1 className="text-4xl font-bold tracking-tight sm:text-6xl mb-6">
                                Shelf <span className="text-orange-600">Reports</span>
                            </h1>
                            <p className="text-xl text-muted-foreground leading-relaxed">
                                Original data on how teams actually track equipment. Drawn from anonymized telemetry across thousands of Shelf workspaces. Free to read, share, and cite under CC BY 4.0.
                            </p>
                        </ScrollReveal>
                    </div>

                    {/* Featured report */}
                    {featured && (
                        <ScrollReveal width="100%">
                            <Link
                                href={`/reports/${featured.slug}`}
                                className="group block max-w-5xl mx-auto rounded-3xl border border-border-subtle bg-card hover:border-orange-200 hover:shadow-2xl hover:shadow-orange-500/10 transition-all duration-300 overflow-hidden"
                            >
                                <div className="grid grid-cols-1 lg:grid-cols-5 gap-0">
                                    {/* Cover */}
                                    <div className="relative aspect-[16/10] lg:aspect-auto lg:col-span-2 bg-gradient-to-br from-orange-50 to-orange-100 dark:from-orange-950/30 dark:to-orange-900/20">
                                        {featured.frontmatter.image ? (
                                            // eslint-disable-next-line @next/next/no-img-element
                                            <img
                                                src={featured.frontmatter.image}
                                                alt={featured.frontmatter.title}
                                                className="absolute inset-0 w-full h-full object-cover"
                                            />
                                        ) : (
                                            <div className="absolute inset-0 flex items-center justify-center">
                                                <FileText className="h-24 w-24 text-orange-300" />
                                            </div>
                                        )}
                                    </div>
                                    {/* Content */}
                                    <div className="p-8 md:p-10 lg:col-span-3 flex flex-col">
                                        <div className="flex items-center gap-2 text-xs text-muted-foreground mb-4 flex-wrap">
                                            <span className="rounded-full bg-orange-100 dark:bg-orange-950/50 px-2.5 py-0.5 font-semibold text-orange-700 dark:text-orange-400">
                                                Featured · {featured.frontmatter.reportYear ?? "Latest"}
                                            </span>
                                            {featured.frontmatter.date && (
                                                <>
                                                    <span className="opacity-30">·</span>
                                                    <Calendar className="h-3 w-3" />
                                                    {new Date(featured.frontmatter.date).toLocaleDateString(
                                                        "en-US",
                                                        { year: "numeric", month: "long" },
                                                    )}
                                                </>
                                            )}
                                            {featured.frontmatter.readingTime && (
                                                <>
                                                    <span className="opacity-30">·</span>
                                                    <span>{featured.frontmatter.readingTime} read</span>
                                                </>
                                            )}
                                        </div>
                                        <h2 className="text-2xl md:text-3xl font-bold tracking-tight text-foreground group-hover:text-orange-600 transition-colors mb-4 leading-tight">
                                            {featured.frontmatter.title}
                                        </h2>
                                        <p className="text-muted-foreground leading-relaxed flex-1">
                                            {featured.frontmatter.description}
                                        </p>
                                        <div className="mt-6 flex items-center text-sm font-semibold text-orange-600 group-hover:translate-x-0.5 transition-transform">
                                            Read the report <ArrowRight className="ml-1.5 h-4 w-4" />
                                        </div>
                                    </div>
                                </div>
                            </Link>
                        </ScrollReveal>
                    )}

                    {/* Archive grid */}
                    {archive.length > 0 && (
                        <div className="max-w-5xl mx-auto mt-20">
                            <h2 className="text-2xl font-bold tracking-tight mb-8 text-center">
                                Previous reports
                            </h2>
                            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                                {archive.map((r) => (
                                    <Link
                                        key={r.slug}
                                        href={`/reports/${r.slug}`}
                                        className="group block h-full rounded-2xl border border-border-subtle bg-card hover:border-orange-200 hover:shadow-lg transition-all p-6"
                                    >
                                        <div className="text-xs text-muted-foreground mb-3 font-semibold uppercase tracking-wider">
                                            {r.frontmatter.reportYear ?? "Report"}
                                        </div>
                                        <h3 className="text-lg font-bold text-foreground group-hover:text-orange-600 transition-colors mb-2 leading-tight">
                                            {r.frontmatter.title}
                                        </h3>
                                        <p className="text-sm text-muted-foreground leading-relaxed line-clamp-3">
                                            {r.frontmatter.description}
                                        </p>
                                        <div className="mt-4 flex items-center text-sm font-medium text-orange-600">
                                            Read <ArrowRight className="ml-1 h-3.5 w-3.5" />
                                        </div>
                                    </Link>
                                ))}
                            </div>
                        </div>
                    )}

                    {/* Methodology footer */}
                    <div className="max-w-2xl mx-auto mt-20 rounded-2xl border border-dashed border-border-subtle bg-muted/30 p-6 md:p-8 text-center">
                        <h3 className="text-lg font-semibold mb-2">About the data</h3>
                        <p className="text-sm text-muted-foreground leading-relaxed">
                            Reports are built from aggregated, anonymized data from Shelf workspaces. Individual customer data is never identifiable. Cohorts smaller than 20 are not reported. Methodology and data windows are disclosed on every report. Reuse encouraged under CC BY 4.0 — attribution to Shelf appreciated.
                        </p>
                    </div>
                </Container>
            </div>
        </PagefindWrapper>
    );
}
