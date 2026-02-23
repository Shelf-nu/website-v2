import { Metadata } from 'next';
import { QrCodeDecoder } from '@/components/tools/qr-code-decoder';
import { Container } from '@/components/ui/container';
import Link from 'next/link';
import { ArrowRight, Box, Tag, FileText, CheckCircle2 } from 'lucide-react';
import { PagefindWrapper } from "@/components/search/pagefind-wrapper";

export const metadata: Metadata = {
    title: 'Free QR Code Decoder for Asset Labels | Shelf',
    description: 'Decode QR codes from images directly in your browser. Free QR code decoder for asset labels, equipment tracking, and inventory management.',
    alternates: {
        canonical: '/tools/qr-code-decoder',
    },
    openGraph: {
        title: 'Free QR Code Decoder for Asset Labels | Shelf',
        description: 'Decode QR codes from images directly in your browser. Free QR code decoder for asset labels, equipment tracking, and inventory management.',
    },
};

export default function QrDecoderPage() {
    const jsonLd = {
        "@context": "https://schema.org",
        "@graph": [
            {
                "@type": "SoftwareApplication",
                "name": "Shelf QR Code Decoder",
                "applicationCategory": "UtilitiesApplication",
                "operatingSystem": "Any",
                "offers": {
                    "@type": "Offer",
                    "price": "0",
                    "priceCurrency": "USD"
                }
            },
            {
                "@type": "FAQPage",
                "mainEntity": [
                    {
                        "@type": "Question",
                        "name": "Does this upload my image?",
                        "acceptedAnswer": {
                            "@type": "Answer",
                            "text": "No. All decoding happens locally in your browser using JavaScript. Your images effectively never leave your device."
                        }
                    },
                    {
                        "@type": "Question",
                        "name": "What QR formats are supported?",
                        "acceptedAnswer": {
                            "@type": "Answer",
                            "text": "This tool supports standard QR codes (Model 2), which are most commonly used for asset labels and inventory tags."
                        }
                    },
                    {
                        "@type": "Question",
                        "name": "Why can’t it read my code?",
                        "acceptedAnswer": {
                            "@type": "Answer",
                            "text": "Ensure the image is well-lit, in focus, and the QR code is not damaged or obstructed. High contrast between the code and background helps."
                        }
                    },

                ]
            }
        ]
    };

    return (
        <PagefindWrapper type="Page" title="Free QR Code Decoder for Asset Labels" keywords="qr code decoder scan qr code read qr code">
            <script
                type="application/ld+json"
                dangerouslySetInnerHTML={{ __html: JSON.stringify(jsonLd) }}
            />

            <div className="min-h-screen font-sans">
                {/* Custom Header with Grid Pattern */}
                <section className="relative overflow-hidden pt-32 pb-20 md:pt-48 md:pb-32">
                    {/* Background Gradient - Exact Match from Features & Tools Page */}
                    <div className="absolute top-0 inset-x-0 h-[600px] -z-10 bg-[linear-gradient(to_right,#80808012_1px,transparent_1px),linear-gradient(to_bottom,#80808012_1px,transparent_1px)] bg-[size:24px_24px] [mask-image:radial-gradient(ellipse_60%_50%_at_50%_0%,#000_70%,transparent_100%)] pointer-events-none" />
                    <div className="absolute top-0 inset-x-0 h-[600px] bg-[radial-gradient(ellipse_at_top,_var(--tw-gradient-stops))] from-orange-50/20 via-background to-background pointer-events-none" />

                    <Container>
                        <div className="max-w-3xl mx-auto text-center">
                            <Link href="/tools" className="inline-flex items-center rounded-full border border-orange-200 bg-orange-50/50 px-3 py-1 text-sm font-medium text-orange-800 backdrop-blur-sm mb-6 hover:bg-orange-100 transition-colors">
                                <ArrowRight className="h-3 w-3 mr-1 rotate-180" /> Back to Tools
                            </Link>
                            <h1 className="text-4xl md:text-6xl font-bold tracking-tight mb-6 text-foreground">
                                Free QR Code Decoder for <span className="text-orange-600">Asset Labels</span>
                            </h1>
                            <p className="text-xl text-muted-foreground leading-relaxed max-w-2xl mx-auto">
                                Decode QR codes from images instantly in your browser. Nothing is uploaded to any server. Completely private and free.
                            </p>
                        </div>
                    </Container>
                </section>

                <QrCodeDecoder />

                {/* SEO / Education Content */}
                <section className="py-16 bg-muted/20 border-t border-border/50">
                    <Container className="max-w-4xl space-y-20">

                        {/* How it works */}
                        <div className="space-y-6">
                            <h2 className="text-3xl font-bold tracking-tight">How this QR decoder works</h2>
                            <div className="grid md:grid-cols-3 gap-6">
                                <div className="bg-card p-6 rounded-xl border border-border">
                                    <FileText className="h-8 w-8 text-orange-600 mb-4" />
                                    <h3 className="font-semibold mb-2">Client-side decoding</h3>
                                    <p className="text-sm text-muted-foreground">The processing logic runs entirely on your device using your browser&apos;s capabilities.</p>
                                </div>
                                <div className="bg-card p-6 rounded-xl border border-border">
                                    <CheckCircle2 className="h-8 w-8 text-orange-600 mb-4" />
                                    <h3 className="font-semibold mb-2">Privacy first</h3>
                                    <p className="text-sm text-muted-foreground">Your images are never uploaded to our servers or stored in any database.</p>
                                </div>
                                <div className="bg-card p-6 rounded-xl border border-border">
                                    <Tag className="h-8 w-8 text-orange-600 mb-4" />
                                    <h3 className="font-semibold mb-2">Works offline</h3>
                                    <p className="text-sm text-muted-foreground">Once the page loads, you can decode images even without an internet connection.</p>
                                </div>
                            </div>
                        </div>

                        {/* Common uses */}
                        <div className="space-y-6">
                            <h2 className="text-3xl font-bold tracking-tight">Common uses for QR codes in asset management</h2>
                            <ul className="grid sm:grid-cols-2 gap-4">
                                {[
                                    "Asset identification and labeling",
                                    "Equipment checkouts and returns",
                                    "Verifying custody trails",
                                    "Linking to maintenance records",
                                    "Faster inventory audits and reconciliation"
                                ].map((item, i) => (
                                    <li key={i} className="flex items-start gap-3 bg-card p-4 rounded-lg border border-border/50">
                                        <Box className="h-5 w-5 text-orange-600 shrink-0 mt-0.5" />
                                        <span className="text-sm font-medium">{item}</span>
                                    </li>
                                ))}
                            </ul>
                        </div>

                        {/* FAQ */}
                        <div className="space-y-8">
                            <h2 className="text-3xl font-bold tracking-tight">FAQ</h2>
                            <div className="grid gap-6 md:grid-cols-2">
                                <div className="space-y-2">
                                    <h3 className="font-semibold text-foreground">Does this upload my image?</h3>
                                    <p className="text-sm text-muted-foreground leading-relaxed">
                                        No. All decoding happens locally in your browser using JavaScript. Your images effectively never leave your device.
                                    </p>
                                </div>
                                <div className="space-y-2">
                                    <h3 className="font-semibold text-foreground">What QR formats are supported?</h3>
                                    <p className="text-sm text-muted-foreground leading-relaxed">
                                        This tool supports standard QR codes (Model 2), which are most commonly used for asset labels and inventory tags.
                                    </p>
                                </div>
                                <div className="space-y-2">
                                    <h3 className="font-semibold text-foreground">Why can’t it read my code?</h3>
                                    <p className="text-sm text-muted-foreground leading-relaxed">
                                        Ensure the image is well-lit, in focus, and the QR code is not damaged or obstructed. High contrast between the code and background helps.
                                    </p>
                                </div>

                            </div>
                        </div>

                        {/* Related Tools */}
                        <div className="space-y-6 pt-8 border-t border-border">
                            <h2 className="text-2xl font-bold tracking-tight">Related free tools</h2>
                            <div className="grid sm:grid-cols-3 gap-6">
                                {[
                                    "Free Asset Label Designer",
                                    "Free QR Code Generator",

                                ].map((tool, i) => (
                                    <div key={i} className="group block p-4 rounded-xl border border-dashed border-border bg-muted/10">
                                        <div className="font-semibold text-muted-foreground group-hover:text-foreground transition-colors mb-2">
                                            {tool}
                                        </div>
                                        <div className="text-xs text-orange-600 font-medium">Coming soon</div>
                                    </div>
                                ))}
                            </div>
                        </div>

                    </Container>
                </section>
            </div>
        </PagefindWrapper>
    );
}
