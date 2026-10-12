import { Metadata } from 'next';
import type { ReactNode } from 'react';
import { BarcodeScanner } from '@/components/tools/barcode-scanner';
import { Container } from '@/components/ui/container';
import Link from 'next/link';
import { ArrowRight, Box, Tag, CheckCircle2, ScanLine, Camera, Download, WifiOff, QrCode } from 'lucide-react';
import { PagefindWrapper } from "@/components/search/pagefind-wrapper";
import { CTA } from "@/components/sections/cta";
import { TrustedBy } from "@/components/sections/trusted-by";
import { G2Badge } from "@/components/sections/g2-badge";
import { buildToolPageJsonLd } from "@/lib/tool-jsonld";

const TITLE = 'Free Online Barcode Scanner — Scan with Your Camera or an Image';
const DESCRIPTION =
    'Scan barcodes online with your phone camera, webcam or an image. Reads UPC, EAN, Code 128, QR, Data Matrix and more. Export scans to CSV. Free, no signup, nothing uploaded.';

export const metadata: Metadata = {
    title: TITLE,
    description: DESCRIPTION,
    alternates: {
        canonical: '/tools/barcode-scanner',
    },
    openGraph: {
        title: `${TITLE} | Shelf`,
        description: DESCRIPTION,
    },
};

type Faq = { question: string; answer: string; content?: ReactNode };

/** One list feeds both the visible FAQ and the FAQPage JSON-LD, so they can't drift apart. */
const FAQS: Faq[] = [
    {
        question: "What barcode formats does this scanner support?",
        answer: "It decodes both 2D barcodes (QR Code, Data Matrix, Aztec, PDF417) and 1D barcodes (UPC-A, UPC-E, EAN-8, EAN-13, Code 39, Code 93, Code 128, ITF, Codabar, RSS-14). One tool for almost every barcode you'll encounter.",
    },
    {
        question: "Can I scan with my phone or webcam?",
        answer: "Yes. Tap Start camera and allow camera access when your browser asks. On a phone the rear camera is used by default, and you can switch cameras if your device has more than one. It uses the browser's standard camera access, available in current versions of Safari, Chrome, Edge and Firefox. The camera only turns on when you tap the button, and it stops when you switch to images, leave the tab or close the page.",
    },
    {
        question: "Can I scan many barcodes and export them?",
        answer: "Yes. Point the camera at one code after another: each new code is added to a list with its format and the time it was scanned. Skip duplicates (on by default) ignores codes already in the list. You can also drop several images at once. Download CSV saves the list with code, format and scanned_at columns, ready for Excel, Google Sheets or Numbers.",
    },
    {
        question: "Does this upload my images or camera video?",
        answer: "No. Decoding happens in your browser. Images, camera video and the scanned values stay on your device, and the list is gone when you close the page unless you download or copy it.",
    },
    {
        question: "Does it work offline?",
        answer: "Partly. The page and the decoder need a connection to load, and the decoder loads the first time you start the camera or decode an image. After that, scanning keeps working without a connection as long as you keep the page open.",
    },
    {
        question: "Why can't it read my barcode?",
        answer: "Make sure the code is well lit, in focus and not damaged or covered. With a phone, move back a little if the picture is blurry: phone cameras can't focus very close. Hold the code flat and fill most of the frame. For images, the bars of a 1D barcode need to be clearly resolved, so very small or low-resolution photos may not work. Each image is read for one code.",
    },
    {
        question: "What's the difference between a barcode and a QR code?",
        answer: "A QR code is a type of barcode. 'Barcode' is the umbrella term covering both 1D barcodes (the parallel-line patterns on grocery items, like UPC and EAN) and 2D barcodes (square patterns that store data in two dimensions, like QR Code and Data Matrix). This tool reads all of them.",
    },
    {
        question: "Can I use this for asset tracking?",
        answer: "For a quick check, yes. To track equipment over time, Shelf gives every asset its own QR code. Scanning it in the Shelf web app or the free Shelf Companion app for iPhone and Android opens the asset, where you can see and update who has it, where it is and its history. You can start with a free Shelf account.",
        content: (
            <>
                For a quick check, yes. To track equipment over time, Shelf gives every asset its own QR code. Scanning it in the Shelf web app or the free{" "}
                <Link href="/knowledge-base/shelf-mobile-app" className="text-orange-600 hover:underline">Shelf Companion app</Link> for iPhone and Android
                opens the asset, where you can see and update who has it, where it is and its history. You can{" "}
                <Link href="/pricing" className="text-orange-600 hover:underline">start with a free Shelf account</Link>.
            </>
        ),
    },
];

export default function BarcodeScannerPage() {
    const jsonLd = buildToolPageJsonLd({
        name: "Shelf Barcode Scanner",
        url: "https://www.shelf.nu/tools/barcode-scanner",
        description:
            "Free online barcode scanner. Scan with your phone camera or webcam, or decode images. Reads QR Code, UPC, EAN, Code 39, Code 128, Data Matrix, Aztec, PDF417 and more, locally on your device, with CSV export.",
        faqs: FAQS.map(({ question, answer }) => ({ question, answer })),
    });

    return (
        <PagefindWrapper
            type="Page"
            title="Free Online Barcode Scanner — Camera or Image"
            keywords="barcode scanner online barcode reader scan barcode qr code scanner upc scanner ean scanner code 128 reader, online barcode scanner, barcode scanner online, scan barcode online, barcode reader online, webcam barcode scanner, scan barcode with camera"
        >
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
                                Scan barcodes with your phone or laptop camera, or from images. Reads QR codes, UPC, EAN, Code 128, Data Matrix and more, and collects every scan into a list you can export as CSV. It runs in your browser: nothing is uploaded.
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
                            <p className="text-sm text-muted-foreground">
                                Mostly scanning QR codes? The{" "}
                                <Link href="/tools/qr-code-scanner" className="text-orange-600 hover:underline">free QR code scanner</Link>{" "}
                                lays out links, Wi-Fi details and contact cards so you can check them before opening anything.
                            </p>
                        </div>

                        {/* How it works */}
                        <div className="space-y-6">
                            <h2 className="text-3xl font-bold tracking-tight">How this scanner works</h2>
                            <div className="grid sm:grid-cols-2 gap-6">
                                <div className="bg-card p-6 rounded-xl border border-border">
                                    <Camera className="h-8 w-8 text-orange-600 mb-4" />
                                    <h3 className="font-semibold mb-2">Camera or image</h3>
                                    <p className="text-sm text-muted-foreground">Scan live with your phone&apos;s rear camera or a laptop webcam, or drop in one or more photos and screenshots. The camera only turns on when you tap Start camera.</p>
                                </div>
                                <div className="bg-card p-6 rounded-xl border border-border">
                                    <CheckCircle2 className="h-8 w-8 text-orange-600 mb-4" />
                                    <h3 className="font-semibold mb-2">Decoded on your device</h3>
                                    <p className="text-sm text-muted-foreground">The decoder runs in your browser. Camera video, images and the codes you scan are never uploaded to our servers or stored anywhere.</p>
                                </div>
                                <div className="bg-card p-6 rounded-xl border border-border">
                                    <Download className="h-8 w-8 text-orange-600 mb-4" />
                                    <h3 className="font-semibold mb-2">A list you can export</h3>
                                    <p className="text-sm text-muted-foreground">Every new code joins a list with its format and time. Skip duplicates, copy one or all, or download a CSV that opens in Excel or Google Sheets.</p>
                                </div>
                                <div className="bg-card p-6 rounded-xl border border-border">
                                    <WifiOff className="h-8 w-8 text-orange-600 mb-4" />
                                    <h3 className="font-semibold mb-2">Keeps going offline</h3>
                                    <p className="text-sm text-muted-foreground">Once the page and the decoder have loaded (after your first scan), scanning keeps working if your connection drops, as long as the page stays open.</p>
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
                                    "Collecting a list of serial-number barcodes into a spreadsheet",
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
                                {FAQS.map((faq, i) => (
                                    <div key={faq.question} className={i === FAQS.length - 1 && FAQS.length % 2 === 1 ? "space-y-2 md:col-span-2" : "space-y-2"}>
                                        <h3 className="font-semibold text-foreground">{faq.question}</h3>
                                        <p className="text-sm text-muted-foreground leading-relaxed">{faq.content ?? faq.answer}</p>
                                    </div>
                                ))}
                            </div>
                        </div>

                        {/* Related Tools */}
                        <div className="space-y-6 pt-8 border-t border-border">
                            <h2 className="text-2xl font-bold tracking-tight">Related free tools</h2>
                            <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-6">
                                <Link href="/tools/qr-code-scanner" className="group block p-4 rounded-xl border border-border hover:border-orange-300 hover:bg-orange-50/30 transition-colors">
                                    <div className="font-semibold text-foreground group-hover:text-orange-600 transition-colors mb-1 flex items-center gap-2">
                                        <QrCode className="h-4 w-4" /> Free QR Code Scanner
                                    </div>
                                    <div className="text-sm text-muted-foreground">
                                        Read QR codes from your camera or a screenshot, with links and Wi-Fi details laid out.
                                    </div>
                                </Link>
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

                {/* Social proof */}
                <div className="flex justify-center pt-12">
                    <G2Badge />
                </div>
                <TrustedBy showTitle={false} />

                <CTA />
            </div>
        </PagefindWrapper>
    );
}
