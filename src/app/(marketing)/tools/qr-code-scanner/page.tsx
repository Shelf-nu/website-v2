import { Metadata } from 'next';
import type { ReactNode } from 'react';
import Link from 'next/link';
import { ArrowRight, Link2, Wifi, Contact, Mail, MapPin, ScanLine, Smartphone, Laptop, ShieldCheck } from 'lucide-react';
import { BarcodeScanner } from '@/components/tools/barcode-scanner';
import { Container } from '@/components/ui/container';
import { PagefindWrapper } from "@/components/search/pagefind-wrapper";
import { CTA } from "@/components/sections/cta";
import { TrustedBy } from "@/components/sections/trusted-by";
import { G2Badge } from "@/components/sections/g2-badge";
import { buildToolPageJsonLd } from "@/lib/tool-jsonld";

const TITLE = 'Free QR Code Scanner Online — Scan from Camera or Image';
const DESCRIPTION =
    'Scan QR codes online with your phone camera, webcam or a screenshot. See links, Wi-Fi passwords and contacts before opening anything. Free, no app, nothing uploaded.';

export const metadata: Metadata = {
    title: TITLE,
    description: DESCRIPTION,
    alternates: {
        canonical: 'https://www.shelf.nu/tools/qr-code-scanner',
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
        question: "How do I scan a QR code online?",
        answer: "Open this page, tap Start camera, allow camera access and point the camera at the QR code. The result appears in the list next to the camera. To read a QR code from a screenshot or photo instead, switch to Image and choose or drop the file.",
    },
    {
        question: "Can I scan a QR code from an image or screenshot?",
        answer: "Yes. Switch to Image and choose or drag in one or more PNG, JPG or WebP files. Each image is read for one code, and every result is added to the same list.",
    },
    {
        question: "Is it free, and do I need an app?",
        answer: "It's free, with no signup and no app to install. It runs in your web browser on iPhone, Android, Mac, Windows or Linux.",
    },
    {
        question: "Is my data uploaded anywhere?",
        answer: "No. The QR code is decoded in your browser. Camera video, images and the decoded text stay on your device, and the list is gone when you close the page unless you copy or download it.",
    },
    {
        question: "Can it read Wi-Fi QR codes?",
        answer: "Yes. For a Wi-Fi QR code it shows the network name, the security type and the password, which stays hidden until you tap Show. A web page can't join a Wi-Fi network for you, so copy the password and paste it into your Wi-Fi settings.",
    },
    {
        question: "Why won't my QR code scan?",
        answer: "Glare, blur and distance cause most failures. Hold the code flat, fill most of the frame and move back a little if the picture is blurry, since phone cameras can't focus very close. A damaged or partly covered code, or a very small code in a large photo, may not read at all; crop the photo around the code and try again.",
    },
    {
        question: "Can I scan many QR codes and export them?",
        answer: "Yes. Keep pointing the camera at one code after another; each new code is added to the list with its format and time. Skip duplicates (on by default) ignores codes already in the list. Download CSV saves code, format and scanned_at columns for Excel or Google Sheets.",
    },
    {
        question: "Does it read other barcodes too?",
        answer: "Yes. Besides QR codes it reads Data Matrix, Aztec and PDF417, plus 1D barcodes such as UPC, EAN, Code 39, Code 128 and ITF. The barcode scanner page covers those formats in more detail.",
        content: (
            <>
                Yes. Besides QR codes it reads Data Matrix, Aztec and PDF417, plus 1D barcodes such as UPC, EAN, Code 39, Code 128 and ITF. The{" "}
                <Link href="/tools/barcode-scanner" className="text-orange-600 hover:underline">barcode scanner</Link> page covers those formats in more detail.
            </>
        ),
    },
];

const PAYLOADS = [
    {
        icon: Link2,
        title: "Links",
        text: "The domain is shown large, with the full address underneath. Links open only when you click Open link.",
    },
    {
        icon: Wifi,
        title: "Wi-Fi",
        text: "Network name, security type and password. The password stays hidden until you tap Show, and has its own Copy button.",
    },
    {
        icon: Contact,
        title: "Contacts",
        text: "vCard and MECARD contact codes are laid out as name, company, phone numbers and email addresses.",
    },
    {
        icon: Mail,
        title: "Email, phone and SMS",
        text: "See the address or number (and any subject or message) first, then use Write email or Call if you want to.",
    },
    {
        icon: MapPin,
        title: "Locations",
        text: "Map codes (geo:) show the latitude and longitude rather than jumping into a maps app.",
    },
    {
        icon: ScanLine,
        title: "Plain text and other codes",
        text: "Anything else is shown as text you can copy, including serial numbers on asset tags and 1D barcodes.",
    },
];

export default function QrCodeScannerPage() {
    const jsonLd = buildToolPageJsonLd({
        name: "Shelf QR Code Scanner",
        url: "https://www.shelf.nu/tools/qr-code-scanner",
        description:
            "Free online QR code scanner. Scan with your phone camera or webcam, or from a screenshot or photo. Shows links, Wi-Fi details and contacts readably, never opens links automatically, and decodes everything locally on your device.",
        faqs: FAQS.map(({ question, answer }) => ({ question, answer })),
    });

    return (
        <PagefindWrapper
            type="Page"
            title="Free QR Code Scanner Online — Camera or Image"
            keywords="qr code scanner, qr scanner, qr code reader, qr code scanner online, qr code reader online, scan qr code from image, scan qr code online, qr scanner webcam"
        >
            <script
                type="application/ld+json"
                dangerouslySetInnerHTML={{ __html: JSON.stringify(jsonLd) }}
            />

            <div className="min-h-screen font-sans">
                {/* Custom Header with Grid Pattern */}
                <section className="relative overflow-hidden pt-32 pb-20 md:pt-48 md:pb-32">
                    <div className="absolute top-0 inset-x-0 h-[600px] -z-10 bg-grid-pattern bg-[size:24px_24px] [mask-image:radial-gradient(ellipse_60%_50%_at_50%_0%,#000_70%,transparent_100%)] pointer-events-none" />
                    <div className="absolute top-0 inset-x-0 h-[600px] bg-[radial-gradient(ellipse_at_top,_var(--tw-gradient-stops))] from-orange-50/20 via-background to-background pointer-events-none" />

                    <Container>
                        <div className="max-w-3xl mx-auto text-center">
                            <Link href="/tools" className="inline-flex items-center rounded-full border border-orange-200 bg-orange-50/50 px-3 py-1 text-sm font-medium text-orange-800 backdrop-blur-sm mb-6 hover:bg-orange-100 transition-colors">
                                <ArrowRight className="h-3 w-3 mr-1 rotate-180" /> Back to Tools
                            </Link>
                            <h1 className="text-4xl md:text-6xl font-bold tracking-tight mb-6 text-foreground">
                                Free <span className="text-orange-600">QR Code Scanner</span> Online
                            </h1>
                            <p className="text-xl text-muted-foreground leading-relaxed max-w-2xl mx-auto">
                                Scan a QR code with your phone or laptop camera, or from a screenshot or photo. Links, Wi-Fi passwords and contact cards are laid out so you can read them first. Nothing opens automatically and nothing is uploaded.
                            </p>
                        </div>
                    </Container>
                </section>

                <BarcodeScanner variant="qr" />

                {/* SEO / Education Content */}
                <section className="py-16 bg-muted/20 border-t border-border/50">
                    <Container className="max-w-4xl space-y-20">

                        {/* What it shows */}
                        <div className="space-y-6">
                            <h2 className="text-3xl font-bold tracking-tight">What the scanner shows you</h2>
                            <p className="text-muted-foreground max-w-2xl">
                                A QR code is just text. The scanner works out what kind of text it is and lays it out, so you know what a code does before you act on it.
                            </p>
                            <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-6">
                                {PAYLOADS.map(({ icon: Icon, title, text }) => (
                                    <div key={title} className="bg-card p-6 rounded-xl border border-border">
                                        <Icon className="h-8 w-8 text-orange-600 mb-4" />
                                        <h3 className="font-semibold mb-2">{title}</h3>
                                        <p className="text-sm text-muted-foreground">{text}</p>
                                    </div>
                                ))}
                            </div>
                        </div>

                        {/* How to scan on each device */}
                        <div className="space-y-6">
                            <h2 className="text-3xl font-bold tracking-tight">How to scan a QR code on iPhone, Android or a laptop</h2>
                            <div className="grid md:grid-cols-3 gap-6">
                                <div className="bg-card p-6 rounded-xl border border-border">
                                    <Smartphone className="h-8 w-8 text-orange-600 mb-4" />
                                    <h3 className="font-semibold mb-2">iPhone</h3>
                                    <p className="text-sm text-muted-foreground">
                                        The built-in Camera app reads QR codes: point it at the code and tap the link that appears. To see what a code contains before opening it, or to read one from a screenshot, open this page in Safari and use Start camera or Image.
                                    </p>
                                </div>
                                <div className="bg-card p-6 rounded-xl border border-border">
                                    <Smartphone className="h-8 w-8 text-orange-600 mb-4" />
                                    <h3 className="font-semibold mb-2">Android</h3>
                                    <p className="text-sm text-muted-foreground">
                                        Many Android phones read QR codes from the camera app or Google Lens. In Chrome, open this page and tap Start camera, or switch to Image to read a screenshot or a photo from your gallery.
                                    </p>
                                </div>
                                <div className="bg-card p-6 rounded-xl border border-border">
                                    <Laptop className="h-8 w-8 text-orange-600 mb-4" />
                                    <h3 className="font-semibold mb-2">Laptop or desktop</h3>
                                    <p className="text-sm text-muted-foreground">
                                        Click Start camera, allow webcam access and hold the code up to the webcam. For a QR code on your screen, such as in an email or a PDF, take a screenshot and drop it on the Image tab.
                                    </p>
                                </div>
                            </div>
                        </div>

                        {/* Safety */}
                        <div className="space-y-6">
                            <h2 className="text-3xl font-bold tracking-tight">Is it safe to open a QR code link?</h2>
                            <div className="bg-card p-6 rounded-xl border border-border space-y-4">
                                <ShieldCheck className="h-8 w-8 text-orange-600" />
                                <p className="text-muted-foreground">
                                    Scanning a QR code is harmless; the risk is where the link sends you. Fake codes stuck on parking meters, posters or sent in emails can lead to look-alike login or payment pages. Before you open a link:
                                </p>
                                <ul className="text-sm text-muted-foreground space-y-2 list-disc list-inside">
                                    <li>Check the domain (shown in bold above the full address) is the site you expect.</li>
                                    <li>Look for misspellings, extra words or unusual endings in the domain.</li>
                                    <li>Be careful with shortened links, which hide the real destination.</li>
                                    <li>Don&apos;t enter a password or card details on a page you reached from a code you don&apos;t trust.</li>
                                </ul>
                                <p className="text-sm text-muted-foreground">
                                    This scanner never opens a link by itself. You see the full address first and open it only by clicking Open link. Domains written with international characters, which can imitate familiar names, get a warning.
                                </p>
                            </div>
                        </div>

                        {/* FAQ */}
                        <div className="space-y-8">
                            <h2 className="text-3xl font-bold tracking-tight">FAQ</h2>
                            <div className="grid gap-6 md:grid-cols-2">
                                {FAQS.map((faq) => (
                                    <div key={faq.question} className="space-y-2">
                                        <h3 className="font-semibold text-foreground">{faq.question}</h3>
                                        <p className="text-sm text-muted-foreground leading-relaxed">{faq.content ?? faq.answer}</p>
                                    </div>
                                ))}
                            </div>
                        </div>

                        {/* Shelf tie-in */}
                        <div className="bg-card p-6 rounded-xl border border-border space-y-2">
                            <h2 className="text-xl font-bold tracking-tight">QR codes for your equipment</h2>
                            <p className="text-sm text-muted-foreground">
                                Shelf gives every asset its own QR code. Scanning it in the Shelf web app or the free{" "}
                                <Link href="/knowledge-base/shelf-mobile-app" className="text-orange-600 hover:underline">Shelf Companion app</Link>{" "}
                                opens the asset, so your team can see who has it and where it is. Print the codes with the{" "}
                                <Link href="/tools/asset-label-designer" className="text-orange-600 hover:underline">free asset label designer</Link>.
                            </p>
                        </div>

                        {/* Related Tools */}
                        <div className="space-y-6 pt-8 border-t border-border">
                            <h2 className="text-2xl font-bold tracking-tight">Related free tools</h2>
                            <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-6">
                                <Link href="/tools/barcode-scanner" className="group block p-4 rounded-xl border border-border hover:border-orange-300 hover:bg-orange-50/30 transition-colors">
                                    <div className="font-semibold text-foreground group-hover:text-orange-600 transition-colors mb-1">
                                        Free Online Barcode Scanner
                                    </div>
                                    <div className="text-sm text-muted-foreground">
                                        Scan UPC, EAN, Code 128 and more with your camera, and export to CSV.
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
                                <Link href="/tools/asset-label-designer" className="group block p-4 rounded-xl border border-border hover:border-orange-300 hover:bg-orange-50/30 transition-colors">
                                    <div className="font-semibold text-foreground group-hover:text-orange-600 transition-colors mb-1">
                                        Free Asset Label Designer
                                    </div>
                                    <div className="text-sm text-muted-foreground">
                                        Design and print custom asset labels with QR codes.
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
