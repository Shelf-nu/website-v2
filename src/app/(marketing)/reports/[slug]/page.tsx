import { getContentBySlug, getContentSlugs } from "@/lib/mdx";
import { notFound } from "next/navigation";
import { MDXContent } from "@/components/mdx-content";
import { Container } from "@/components/ui/container";
import type { Frontmatter } from "@/lib/content/schema";
import { PagefindWrapper } from "@/components/search/pagefind-wrapper";
import { StructuredData } from "@/components/seo/structured-data";
import {
    buildContentMetadata,
    breadcrumbJsonLd,
    reportJsonLd,
    datasetJsonLd,
} from "@/lib/seo";
import { Button } from "@/components/ui/button";
import Link from "next/link";
import Image from "next/image";
import { Calendar, Download, FileText, ArrowLeft } from "lucide-react";
import type { Metadata } from "next";

interface PageProps {
    params: Promise<{ slug: string }>;
}

export async function generateStaticParams() {
    return getContentSlugs("reports").map((file) => ({
        slug: file.replace(/\.mdx$/, ""),
    }));
}

export async function generateMetadata({ params }: PageProps): Promise<Metadata> {
    const { slug } = await params;
    try {
        const { frontmatter } = getContentBySlug("reports", slug);
        return buildContentMetadata(slug, frontmatter, "reports");
    } catch {
        return { title: "Report not found" };
    }
}

export default async function ReportPage({ params }: PageProps) {
    const { slug } = await params;

    let content: string;
    let frontmatter: Frontmatter;

    try {
        const result = getContentBySlug("reports", slug);
        content = result.content;
        frontmatter = result.frontmatter;
    } catch {
        notFound();
    }

    const urlPath = `/reports/${slug}`;

    const breadcrumb = breadcrumbJsonLd([
        { name: "Home", href: "/" },
        { name: "Reports", href: "/reports" },
        { name: frontmatter.title, href: urlPath },
    ]);

    const reportSchema = reportJsonLd({
        title: frontmatter.title,
        description: frontmatter.description,
        urlPath,
        datePublished: frontmatter.date,
        image: frontmatter.image,
        keywords: frontmatter.seo?.keywords,
        authors: frontmatter.author ? [frontmatter.author] : undefined,
        pdfUrl: frontmatter.pdfUrl,
    });

    const datasetSchema = datasetJsonLd({
        name: `${frontmatter.title} — underlying aggregates`,
        description:
            `Aggregated, anonymized telemetry from Shelf workspaces underlying "${frontmatter.title}". ${frontmatter.sampleSize?.notes ?? ""}`.trim(),
        urlPath,
        datePublished: frontmatter.date,
        keywords: frontmatter.seo?.keywords,
        dataWindowStart: frontmatter.dataWindowStart,
        dataWindowEnd: frontmatter.dataWindowEnd,
        csvUrl: frontmatter.csvUrl,
        methodologyUrl: frontmatter.methodologyUrl ?? `${urlPath}#methodology`,
        datasetKey: frontmatter.datasetKey,
    });

    const formattedDate = frontmatter.date
        ? new Date(frontmatter.date).toLocaleDateString("en-US", {
              year: "numeric",
              month: "long",
              day: "numeric",
          })
        : undefined;

    return (
        <PagefindWrapper type="Report" title={frontmatter.title} keywords="report state of equipment management industry research data">
            <StructuredData data={[breadcrumb, reportSchema, datasetSchema]} />

            {/* ====================================================== */}
            {/*  HERO                                                    */}
            {/* ====================================================== */}
            <section className="relative pt-28 pb-12 sm:pt-36 sm:pb-16 border-b border-border-subtle">
                <div className="absolute inset-0 -z-10 bg-grid-pattern bg-[size:24px_24px] [mask-image:radial-gradient(ellipse_60%_50%_at_50%_0%,#000_70%,transparent_100%)]" />
                <div className="absolute top-0 inset-x-0 h-[400px] bg-[radial-gradient(ellipse_at_top,_var(--tw-gradient-stops))] from-orange-50/30 dark:from-orange-950/20 via-background to-background pointer-events-none" />

                <Container className="relative">
                    <div className="max-w-4xl mx-auto">
                        {/* Breadcrumb + eyebrow */}
                        <div className="flex items-center gap-3 mb-6 flex-wrap">
                            <Link
                                href="/reports"
                                className="inline-flex items-center gap-1.5 text-sm text-muted-foreground hover:text-foreground transition-colors"
                            >
                                <ArrowLeft className="h-3.5 w-3.5" />
                                All Reports
                            </Link>
                            {frontmatter.reportYear && (
                                <span className="inline-flex items-center gap-1.5 rounded-full bg-orange-100 dark:bg-orange-950/50 px-3 py-1 text-xs font-semibold text-orange-700 dark:text-orange-400">
                                    Annual Report · {frontmatter.reportYear}
                                </span>
                            )}
                        </div>

                        {/* Title */}
                        <h1 className="text-4xl font-bold tracking-tight text-foreground sm:text-5xl md:text-6xl mb-6 leading-[1.05]">
                            {frontmatter.title}
                        </h1>

                        {/* Description / standfirst */}
                        <p className="text-xl text-muted-foreground leading-relaxed mb-8 max-w-3xl">
                            {frontmatter.description}
                        </p>

                        {/* Byline + metadata */}
                        <div className="flex items-center gap-x-4 gap-y-2 text-sm text-muted-foreground flex-wrap mb-8">
                            {frontmatter.author && (
                                <span>
                                    By <strong className="text-foreground">{frontmatter.author}</strong>
                                </span>
                            )}
                            {formattedDate && (
                                <>
                                    <span className="opacity-30">·</span>
                                    <span className="inline-flex items-center gap-1.5">
                                        <Calendar className="h-3.5 w-3.5" />
                                        Published {formattedDate}
                                    </span>
                                </>
                            )}
                            {frontmatter.readingTime && (
                                <>
                                    <span className="opacity-30">·</span>
                                    <span>{frontmatter.readingTime} read</span>
                                </>
                            )}
                        </div>

                        {/* Sample-size hero stats */}
                        {frontmatter.sampleSize &&
                            (frontmatter.sampleSize.workspaces ||
                                frontmatter.sampleSize.assets ||
                                frontmatter.sampleSize.countries) && (
                                <div className="grid grid-cols-1 sm:grid-cols-3 gap-3 mb-8 max-w-2xl">
                                    {frontmatter.sampleSize.workspaces ? (
                                        <div className="rounded-xl border border-border-subtle bg-card p-4">
                                            <p className="text-2xl font-bold text-foreground">
                                                {frontmatter.sampleSize.workspaces.toLocaleString()}
                                            </p>
                                            <p className="text-[10px] text-muted-foreground uppercase tracking-widest mt-1 font-semibold">
                                                Workspaces
                                            </p>
                                        </div>
                                    ) : null}
                                    {frontmatter.sampleSize.assets ? (
                                        <div className="rounded-xl border border-border-subtle bg-card p-4">
                                            <p className="text-2xl font-bold text-foreground">
                                                {frontmatter.sampleSize.assets.toLocaleString()}
                                            </p>
                                            <p className="text-[10px] text-muted-foreground uppercase tracking-widest mt-1 font-semibold">
                                                Assets analyzed
                                            </p>
                                        </div>
                                    ) : null}
                                    {frontmatter.sampleSize.countries ? (
                                        <div className="rounded-xl border border-border-subtle bg-card p-4">
                                            <p className="text-2xl font-bold text-foreground">
                                                {frontmatter.sampleSize.countries.toLocaleString()}
                                            </p>
                                            <p className="text-[10px] text-muted-foreground uppercase tracking-widest mt-1 font-semibold">
                                                Countries
                                            </p>
                                        </div>
                                    ) : null}
                                </div>
                            )}

                        {/* Download CTAs */}
                        {(frontmatter.pdfUrl || frontmatter.csvUrl) && (
                            <div className="flex flex-col sm:flex-row gap-3 items-stretch sm:items-center">
                                {frontmatter.pdfUrl && (
                                    <Button size="lg" asChild>
                                        <a href={frontmatter.pdfUrl} download>
                                            <Download className="mr-2 h-4 w-4" />
                                            Download PDF
                                        </a>
                                    </Button>
                                )}
                                {frontmatter.csvUrl && (
                                    <Button size="lg" variant="outline" asChild>
                                        <a href={frontmatter.csvUrl} download>
                                            <FileText className="mr-2 h-4 w-4" />
                                            Download CSV (aggregated data)
                                        </a>
                                    </Button>
                                )}
                            </div>
                        )}
                    </div>
                </Container>
            </section>

            {/* ====================================================== */}
            {/*  BODY                                                    */}
            {/* ====================================================== */}
            <Container className="py-16 md:py-20">
                <article className="max-w-3xl mx-auto">
                    <MDXContent source={content} />
                </article>
            </Container>

            {/* ====================================================== */}
            {/*  FOOTER — cross-link + about                             */}
            {/* ====================================================== */}
            <section className="border-t border-border-subtle bg-card/50 py-16">
                <Container>
                    <div className="max-w-3xl mx-auto text-center">
                        <Image
                            src="/logo.png"
                            alt="Shelf"
                            width={40}
                            height={40}
                            className="mx-auto mb-4"
                        />
                        <h2 className="text-2xl font-bold tracking-tight mb-3">
                            About Shelf
                        </h2>
                        <p className="text-muted-foreground leading-relaxed mb-6">
                            Shelf is an open-source asset management platform used by thousands of teams to track physical equipment with QR codes, conflict-free bookings, and audit-ready reporting. This report is built from the anonymized aggregate of that activity — returned to the industry for free.
                        </p>
                        <div className="flex flex-col sm:flex-row gap-3 items-center justify-center">
                            <Button asChild>
                                <Link href="https://app.shelf.nu/join">Try Shelf free</Link>
                            </Button>
                            <Button variant="outline" asChild>
                                <Link href="/reports">See all reports</Link>
                            </Button>
                        </div>
                    </div>
                </Container>
            </section>
        </PagefindWrapper>
    );
}
