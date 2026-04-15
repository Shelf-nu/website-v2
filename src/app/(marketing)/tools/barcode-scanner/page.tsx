import { Metadata } from 'next';
import { BarcodeScanner } from '@/components/tools/barcode-scanner';
import { Container } from '@/components/ui/container';
import Link from 'next/link';
import { ArrowRight, Box, Tag, FileText, CheckCircle2, ScanLine } from 'lucide-react';
import { PagefindWrapper } from "@/components/search/pagefind-wrapper";
import { CTA } from "@/components/sections/cta";

export const metadata: Metadata = {
    title: 'Free Online Barcode Scanner — Scan QR, UPC, Code 128, EAN | Shelf',
    description: 'Scan and decode any barcode from an image directly in your browser. Supports QR Code, UPC, EAN, Code 39, Code 128, Data Matrix, PDF417 and more. Free, no signup, no upload — runs locally.',
    alternates: {
        canonical: '/tools/barcode-scanner',
    },
    openGraph: {
        title: 'Free Online Barcode Scanner — Scan QR, UPC, Code 128, EAN | Shelf',
        description: 'Scan and decode any barcode from an image directly in your browser. Supports QR Code, UPC, EAN, Code 39, Code 128, Data Matrix, PDF417 and more. Free, no signup, no upload — runs locally.',
    },
};

export default function BarcodeScannerPage() {
    const jsonLd = {
        "@context": "https://schema.org",
        "@graph": [
            {
                "@type": "SoftwareApplication",
                "name": "Shelf Barcode Scanner",
                "applicationCategory": "UtilitiesApplication",
                "operatingSystem": "Any",
                "url": "https://www.shelf.nu/tools/barcode-scanner",
                "description": "Free in-browser barcode scanner. Decodes QR Code, UPC, EAN, Code 39, Code 128, Data Matrix, Aztec, PDF417 and more — all locally on your device.",
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
                        "name": "What barcode formats does this scanner support?",
                        "acceptedAnswer": {
                            "@type": "Answer",
                            "text": "It decodes both 2D barcodes (QR Code, Data Matrix, Aztec, PDF417) and 1D barcodes (UPC-A, UPC-E, EAN-8, EAN-13, Code 39, Code 93, Code 128, ITF, Codabar, RSS-14). One tool for almost every barcode you'll encounter."
                        }
                    },
                    {
                        "@type": "Question",
                        "name": "Does this upload my image to a server?",
                        "acceptedAnswer": {
                            "@type": "Answer",
                            "text": "No. All decoding happens locally in your browser using JavaScript. Your images effectively never leave your device — perfect for sensitive inventory or regulated environments."
                        }
                    },
                    {
                        "@type": "Question",
                        "name": "Why can't it read my barcode?",
                        "acceptedAnswer": {
                            "@type": "Answer",
                            "text": "Ensure the image is well-lit, in focus, and the barcode is not damaged or obstructed. High contrast between the bars (or QR modules) and the background helps. For 1D barcodes, the bars need to be clearly resolved — very low resolution images may not work."
                        }
                    },
                    {
                        "@type": "Question",
                        "name": "What's the difference between a barcode and a QR code?",
                        "acceptedAnswer": {
                            "@type": "Answer",
                            "text": "A QR code is a type of barcode. 'Barcode' is the umbrella term covering both 1D barcodes (the parallel-line patterns on grocery items, like UPC and EAN) and 2D barcodes (square patterns that store data in two dimensions, like QR Code and Data Matrix). This tool reads all of them."
                        }
                    },
                    {
                        "@type": "Question",
                        "name": "Can I use this for asset tracking?",
                        "acceptedAnswer": {
                            "@type": "Answer",
                            "text": "Yes. This is the same scanning engine used inside Shelf, our asset management platform. For full asset tracking — inventory, custody, bookings, audit trails — sign up for a free Shelf account and use our mobile and web apps to scan codes and update records in real time."
                        }
                    }
                ]
            }
        ]
    };

    return (
        <PagefindWrapper type="Page" title="Free Online Barcode Scanner — QR, UPC, Code 128, EAN" keywords="barcode scanner online barcode reader scan barcode qr code scanner upc scanner ean scanner code 128 reader">
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
                            <h1 className="text-4xl md:text-6xl font-bold tracking-tight mb-6 text-foreground">
                                Free Online <span className="text-orange-600">Barcode Scanner</span>
                            </h1>
                            <p className="text-xl text-muted-foreground leading-relaxed max-w-2xl mx-auto">
                                Decode QR codes, UPC, EAN, Code 128, Data Matrix and more — all from an image, right in your browser. Nothing is uploaded. Completely private and free.
                            </p>
                        </div>
                    </Container>
                </section>

                <BarcodeScanner />

                {/* SEO / Education Content */}
                <section className="py-16 bg-muted/20 border-t border-border/50">
                    <Container className="max-w-4xl space-y-20">

                        {/* Supported formats */}
                        <div className="space-y-6">
                            <h2 className="text-3xl font-bold tracking-tight">Supported barcode formats</h2>
                            <p className="text-muted-foreground max-w-2xl">
                                One scanner for almost every barcode you&apos;ll encounter — from grocery UPC labels to QR codes on asset tags.
                            </p>
                            <div className="grid md:grid-cols-2 gap-6">
                                <div className="bg-card p-6 rounded-xl border border-border">
                                    <ScanLine className="h-8 w-8 text-orange-600 mb-4" />
                                    <h3 className="font-semibold mb-2">2D barcodes</h3>
                                    <ul className="text-sm text-muted-foreground space-y-1 list-disc list-inside">
                                        <li>QR Code (Model 1 &amp; 2)</li>
                                        <li>Data Matrix</li>
                                        <li>Aztec</li>
                                        <li>PDF417</li>
                                    </ul>
                                </div>
                                <div className="bg-card p-6 rounded-xl border border-border">
                                    <Tag className="h-8 w-8 text-orange-600 mb-4" />
                                    <h3 className="font-semibold mb-2">1D barcodes</h3>
                                    <ul className="text-sm text-muted-foreground space-y-1 list-disc list-inside">
                                        <li>UPC-A, UPC-E</li>
                                        <li>EAN-8, EAN-13</li>
                                        <li>Code 39, Code 93, Code 128</li>
                                        <li>ITF, Codabar, RSS-14</li>
                                    </ul>
                                </div>
                            </div>
                        </div>

                        {/* How it works */}
                        <div className="space-y-6">
                            <h2 className="text-3xl font-bold tracking-tight">How this scanner works</h2>
                            <div className="grid md:grid-cols-3 gap-6">
                                <div className="bg-card p-6 rounded-xl border border-border">
                                    <FileText className="h-8 w-8 text-orange-600 mb-4" />
                                    <h3 className="font-semibold mb-2">Client-side decoding</h3>
                                    <p className="text-sm text-muted-foreground">All processing runs entirely on your device using your browser&apos;s capabilities — no server round-trip.</p>
                                </div>
                                <div className="bg-card p-6 rounded-xl border border-border">
                                    <CheckCircle2 className="h-8 w-8 text-orange-600 mb-4" />
                                    <h3 className="font-semibold mb-2">Privacy first</h3>
                                    <p className="text-sm text-muted-foreground">Your images are never uploaded to our servers or stored anywhere. Safe for sensitive or regulated inventory.</p>
                                </div>
                                <div className="bg-card p-6 rounded-xl border border-border">
                                    <Box className="h-8 w-8 text-orange-600 mb-4" />
                                    <h3 className="font-semibold mb-2">Works offline</h3>
                                    <p className="text-sm text-muted-foreground">Once the page loads, you can decode images even without an internet connection.</p>
                                </div>
                            </div>
                        </div>

                        {/* Common uses */}
                        <div className="space-y-6">
                            <h2 className="text-3xl font-bold tracking-tight">Common uses for barcode scanning</h2>
                            <ul className="grid sm:grid-cols-2 gap-4">
                                {[
                                    "Verifying asset tag QR codes during audits",
                                    "Reading UPC/EAN codes from receipts and packaging",
                                    "Decoding Code 128 labels on warehouse shelving",
                                    "Validating product batch numbers via Data Matrix",
                                    "Checking custody trails on equipment",
                                    "Reconciling inventory faster than manual lookup",
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
                                    <h3 className="font-semibold text-foreground">What barcode formats does this scanner support?</h3>
                                    <p className="text-sm text-muted-foreground leading-relaxed">
                                        It decodes both 2D barcodes (QR Code, Data Matrix, Aztec, PDF417) and 1D barcodes (UPC-A, UPC-E, EAN-8, EAN-13, Code 39, Code 93, Code 128, ITF, Codabar, RSS-14). One tool for almost every barcode you&apos;ll encounter.
                                    </p>
                                </div>
                                <div className="space-y-2">
                                    <h3 className="font-semibold text-foreground">Does this upload my image to a server?</h3>
                                    <p className="text-sm text-muted-foreground leading-relaxed">
                                        No. All decoding happens locally in your browser using JavaScript. Your images effectively never leave your device — perfect for sensitive inventory or regulated environments.
                                    </p>
                                </div>
                                <div className="space-y-2">
                                    <h3 className="font-semibold text-foreground">Why can&apos;t it read my barcode?</h3>
                                    <p className="text-sm text-muted-foreground leading-relaxed">
                                        Ensure the image is well-lit, in focus, and the barcode is not damaged or obstructed. High contrast between the bars (or QR modules) and the background helps. For 1D barcodes, the bars need to be clearly resolved — very low resolution images may not work.
                                    </p>
                                </div>
                                <div className="space-y-2">
                                    <h3 className="font-semibold text-foreground">What&apos;s the difference between a barcode and a QR code?</h3>
                                    <p className="text-sm text-muted-foreground leading-relaxed">
                                        A QR code is a type of barcode. &ldquo;Barcode&rdquo; is the umbrella term covering both 1D barcodes (the parallel-line patterns on grocery items, like UPC and EAN) and 2D barcodes (square patterns that store data in two dimensions, like QR Code and Data Matrix). This tool reads all of them.
                                    </p>
                                </div>
                                <div className="space-y-2 md:col-span-2">
                                    <h3 className="font-semibold text-foreground">Can I use this for asset tracking?</h3>
                                    <p className="text-sm text-muted-foreground leading-relaxed">
                                        Yes. This is the same scanning engine used inside Shelf, our asset management platform. For full asset tracking — inventory, custody, bookings, audit trails — <Link href="/pricing" className="text-orange-600 hover:underline">sign up for a free Shelf account</Link> and use our mobile and web apps to scan codes and update records in real time.
                                    </p>
                                </div>
                            </div>
                        </div>

                        {/* Related Tools */}
                        <div className="space-y-6 pt-8 border-t border-border">
                            <h2 className="text-2xl font-bold tracking-tight">Related free tools</h2>
                            <div className="grid sm:grid-cols-2 gap-6">
                                <Link href="/tools/asset-label-designer" className="group block p-4 rounded-xl border border-border hover:border-orange-300 hover:bg-orange-50/30 transition-colors">
                                    <div className="font-semibold text-foreground group-hover:text-orange-600 transition-colors mb-1">
                                        Free Asset Label Designer
                                    </div>
                                    <div className="text-sm text-muted-foreground">
                                        Design and print custom asset labels with QR codes.
                                    </div>
                                </Link>
                                <Link href="/tools/qr-code-generator" className="group block p-4 rounded-xl border border-border hover:border-orange-300 hover:bg-orange-50/30 transition-colors">
                                    <div className="font-semibold text-foreground group-hover:text-orange-600 transition-colors mb-1">
                                        Free QR Code Generator
                                    </div>
                                    <div className="text-sm text-muted-foreground">
                                        Generate QR codes in PNG or SVG format for any URL.
                                    </div>
                                </Link>
                            </div>
                        </div>

                    </Container>
                </section>

                <CTA />
            </div>
        </PagefindWrapper>
    );
}
