import { Metadata } from 'next';
import Link from 'next/link';
import { Container } from '@/components/ui/container';
import { ArrowRight } from 'lucide-react';
import { AssetLabelDesigner } from '@/components/tools/asset-label-designer';
import { CTA } from '@/components/sections/cta';
import { PagefindWrapper } from "@/components/search/pagefind-wrapper";
import { buildToolPageJsonLd } from "@/lib/tool-jsonld";

export const metadata: Metadata = {
    title: 'Free Asset Label Designer & Tag Maker | Shelf',
    description: 'Create and print professional asset labels and tags with QR codes. Free online label designer — exports to PNG, SVG, and PDF. No signup required.',
    alternates: {
        canonical: 'https://www.shelf.nu/tools/asset-label-designer'
    }
};

export default function AssetLabelDesignerPage() {
    const jsonLd = buildToolPageJsonLd({
        name: "Shelf Asset Label Designer",
        applicationCategory: "BusinessApplication",
        url: "https://www.shelf.nu/tools/asset-label-designer",
        description:
            "Create and print professional asset labels and tags with QR codes. Exports to PNG, SVG, and PDF.",
    });

    return (
        <PagefindWrapper type="Page" title="Free Asset Label Designer & Tag Maker" keywords="asset label designer asset tag maker asset tags label generator create labels create tags">
        <script
            type="application/ld+json"
            dangerouslySetInnerHTML={{ __html: JSON.stringify(jsonLd) }}
        />
        <div className="min-h-screen font-sans">
            {/* Custom Header with Grid Pattern */}
            <section className="relative overflow-hidden pt-32 pb-20 md:pt-48 md:pb-32">
                {/* Background Gradient */}
                <div className="absolute top-0 inset-x-0 h-[600px] -z-10 bg-grid-pattern bg-[size:24px_24px] [mask-image:radial-gradient(ellipse_60%_50%_at_50%_0%,#000_70%,transparent_100%)] pointer-events-none" />
                <div className="absolute top-0 inset-x-0 h-[600px] bg-[radial-gradient(ellipse_at_top,_var(--tw-gradient-stops))] from-orange-50/20 via-background to-background pointer-events-none" />

                <Container>
                    <div className="max-w-3xl mx-auto text-center">
                        <Link href="/tools" className="inline-flex items-center rounded-full border border-orange-200 bg-orange-50/50 px-3 py-1 text-sm font-medium text-orange-800 backdrop-blur-sm mb-6 hover:bg-orange-100 transition-colors">
                            <ArrowRight className="h-3 w-3 mr-1 rotate-180" /> Back to Tools
                        </Link>
                        <h1 className="text-4xl md:text-5xl font-bold tracking-tight mb-6 text-foreground">
                            Free Asset Tag Maker
                        </h1>
                        <p className="text-xl text-muted-foreground leading-relaxed max-w-2xl mx-auto">
                            Create durable, scan-safe QR asset tags for your equipment. Free online generator — no signup required. Export to PNG, SVG, or PDF.
                        </p>
                    </div>
                </Container>
            </section>

            {/* Tool Section */}
            <section className="pb-20 md:pb-32 -mt-12 relative z-10">
                <Container>
                    <div className="bg-background rounded-2xl border shadow-xl p-6 md:p-10">
                        <AssetLabelDesigner />
                    </div>
                </Container>
            </section>

            {/* Content & SEO Section */}
            <section className="pb-24 border-t bg-muted/20">
                <Container className="pt-24">
                    <div className="grid md:grid-cols-2 gap-16">
                        <div>
                            <h2 className="text-2xl font-bold mb-6">Why standard labels matter</h2>
                            <div className="prose prose-sm text-muted-foreground">
                                <p>
                                    In asset management, a label isn&apos;t just a sticker—it&apos;s the digital twin&apos;s physical anchor.
                                    This tool enforces best practices that we&apos;ve learned from tracking millions of dollars of equipment:
                                </p>
                                <ul className="mt-4 space-y-2 list-disc list-inside">
                                    <li><strong>High Contrast Only:</strong> Aesthetics take a backseat to readability. Black on white is the gold standard for scanners.</li>
                                    <li><strong>Sufficient Quiet Zone:</strong> We enforce margins so scanners don&apos;t get confused by nearby text or bezel edges.</li>
                                    <li><strong>Human Readable Backup:</strong> Every label should have the ID printed in plain text for when technology fails.</li>
                                </ul>
                            </div>
                        </div>

                        <div>
                            <h2 className="text-2xl font-bold mb-6">Choosing the right size</h2>
                            <div className="space-y-6">
                                <div>
                                    <h3 className="font-semibold text-foreground mb-2">Small (25mm)</h3>
                                    <p className="text-sm text-muted-foreground">
                                        Ideal for mobile devices, hand tools, and small peripherals. Can be tight for long Asset IDs.
                                    </p>
                                </div>
                                <div>
                                    <h3 className="font-semibold text-foreground mb-2">Medium (40mm)</h3>
                                    <p className="text-sm text-muted-foreground">
                                        The industry standard. Perfect for laptops, monitors, furniture, and office equipment.
                                    </p>
                                </div>
                                <div>
                                    <h3 className="font-semibold text-foreground mb-2">Large (60mm)</h3>
                                    <p className="text-sm text-muted-foreground">
                                        Max visibility. Use for flight cases, server racks, heavy machinery, or warehouse shelving.
                                    </p>
                                </div>
                            </div>
                        </div>
                    </div>
                </Container>
            </section>

            <CTA />
        </div>
        </PagefindWrapper>
    );
}
