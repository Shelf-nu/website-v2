import { Metadata } from 'next';
import Link from 'next/link';
import { Container } from '@/components/ui/container';
import { ArrowRight } from 'lucide-react';
import { QrCodeGenerator } from '@/components/tools/qr-code-generator';
import { CTA } from '@/components/sections/cta';
import { PagefindWrapper } from "@/components/search/pagefind-wrapper";

export const metadata: Metadata = {
    // ... existing metadata ...
};

export default function QrCodeGeneratorPage() {
    // ... existing logic ...

    return (
        <PagefindWrapper type="Page" title="Free QR Code Generator (PNG & SVG)" keywords="qr code generator create qr code free qr generator">
        <div className="min-h-screen font-sans">
            {/* ... script ... */}

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
                            Free QR Code Generator <span className="text-orange-600">(PNG & SVG)</span>
                        </h1>
                        <p className="text-xl text-muted-foreground leading-relaxed max-w-2xl mx-auto">
                            Create professional, high-resolution QR codes directly in your browser. Perfect for asset tags, inventory labels, and equipment tracking.
                        </p>
                    </div>
                </Container>
            </section>

            {/* Tool Section */}
            <section className="pb-20 md:pb-32 -mt-12 relative z-10">
                <Container>
                    <div className="bg-background rounded-2xl border shadow-xl p-6 md:p-10">
                        <QrCodeGenerator />
                    </div>
                </Container>
            </section>

            {/* Content & SEO Section */}
            <section className="pb-24 border-t bg-muted/20">
                <Container className="pt-24">
                    <div className="grid md:grid-cols-2 gap-16">
                        <div>
                            <h2 className="text-2xl font-bold mb-6">Expert Tips for Asset Tagging</h2>
                            <div className="prose prose-sm text-muted-foreground">
                                <p>
                                    When creating QR codes for physical assets, durability and readability are key.
                                    Here are some best practices from our experience managing thousands of devices:
                                </p>
                                <ul className="mt-4 space-y-2 list-disc list-inside">
                                    <li><strong>Include human-readable text:</strong> Always print the generic ID below the code in case the scan fails.</li>
                                    <li><strong>High Contrast:</strong> Ensure high contrast between the code (black) and background (white). Avoid inverted colors if possible.</li>
                                    <li><strong>Material Matters:</strong> For metal assets, use polyester or vinyl labels that resist heat and abrasion.</li>
                                </ul>
                                <p className="mt-6">
                                    Need to track more than just a few items? Check out our <Link href="/glossary" className="text-orange-600 hover:underline">Asset Management Glossary</Link> to learn about comprehensive tracking strategies.
                                </p>
                            </div>
                        </div>

                        <div>
                            <h2 className="text-2xl font-bold mb-6">Frequently Asked Questions</h2>
                            <div className="space-y-6">
                                <div>
                                    <h3 className="font-semibold text-foreground mb-2">PNG vs SVG: Which should I choose?</h3>
                                    <p className="text-sm text-muted-foreground">
                                        Use <strong>SVG</strong> for printing (posters, labels) as it stays sharp at any size. Use <strong>PNG</strong> for digital use (websites, emails) or quick office printing.
                                    </p>
                                </div>
                                <div>
                                    <h3 className="font-semibold text-foreground mb-2">What data can I encode?</h3>
                                    <p className="text-sm text-muted-foreground">
                                        You can encode text, URLs, Wi-Fi credentials, or vCards. For assets, we recommend encoding a unique URL (e.g., <code>https://shelf.nu/a/123</code>) so scanners open the item&apos;s details immediately.
                                    </p>
                                </div>
                                <div>
                                    <h3 className="font-semibold text-foreground mb-2">Need a scanner?</h3>
                                    <p className="text-sm text-muted-foreground">
                                        Try our free <Link href="/tools/qr-code-decoder" className="text-orange-600 hover:underline">QR Code Decoder</Link> to test your generated codes directly in the browser.
                                    </p>
                                </div>
                            </div>
                        </div>
                    </div>

                </Container>
            </section>

            {/* Standard Premium CTA */}
            <CTA />
        </div>
        </PagefindWrapper>
    );
}
