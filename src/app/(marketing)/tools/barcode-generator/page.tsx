import { Metadata } from 'next';
import Link from 'next/link';
import bwipjs from 'bwip-js/node';
import { ArrowRight, Printer, Ruler, ScanLine, Tag, Layers, Hash } from 'lucide-react';
import { BarcodeGenerator } from '@/components/tools/barcode-generator';
import { Container } from '@/components/ui/container';
import { PagefindWrapper } from "@/components/search/pagefind-wrapper";
import { CTA } from "@/components/sections/cta";
import { TrustedBy } from "@/components/sections/trusted-by";
import { G2Badge } from "@/components/sections/g2-badge";
import { buildToolPageJsonLd } from "@/lib/tool-jsonld";
import { renderSvg } from "@/lib/barcode-render";

const TITLE = 'Free Barcode Generator — Bulk, Code 128, EAN, UPC & Label Sheets';
const DESCRIPTION = 'Generate barcodes free in your browser: Code 128, Code 39, EAN-13, UPC-A, ITF-14, Data Matrix and QR. Bulk from a list, CSV or number sequence, then print on Avery label sheets. No signup, nothing uploaded.';

export const metadata: Metadata = {
    title: TITLE,
    description: DESCRIPTION,
    alternates: {
        canonical: 'https://www.shelf.nu/tools/barcode-generator',
    },
    openGraph: {
        title: `${TITLE} | Shelf`,
        description: DESCRIPTION,
    },
};

const FAQS = [
    {
        question: "Is this barcode generator free?",
        answer: "Yes. There is no signup, no watermark and no limit on how often you use it. Bulk runs are capped at 1,000 barcodes at a time to keep your browser responsive; split bigger lists into batches.",
    },
    {
        question: "Are my values uploaded anywhere?",
        answer: "No. The barcodes are drawn in your browser, and CSV files are read on your device. Nothing you type or upload is sent to a server.",
    },
    {
        question: "Can I make barcodes in bulk from Excel?",
        answer: "Yes. Save the sheet as CSV (comma or semicolon separated), upload it, and pick the column that holds your codes. You can print a second column, such as the asset name, under each barcode. Or paste the column straight into the list box, one value per line.",
    },
    {
        question: "How do I print barcodes on Avery labels?",
        answer: "Pick the matching template (Avery 5160/8160, 5163, L7160 or L7651), download the PDF and print it at 100% scale, called \"Actual size\" in most print dialogs. Turn off \"Fit to page\". Do a test print on plain paper first and hold it against a label sheet to check alignment.",
    },
    {
        question: "Can I use these EAN-13 or UPC barcodes to sell products in stores?",
        answer: "Only if the number is yours. Retail EAN and UPC numbers must be licensed from GS1 so they are unique worldwide. This tool will draw any valid number, but generating the image does not register the number for you. For internal labels, asset tags and shelves, use Code 128, Code 39, Data Matrix or QR instead.",
    },
    {
        question: "Which barcode type should I use for asset tags?",
        answer: "Code 128 for a classic barcode: it is compact and encodes letters, digits and punctuation. QR Code if people will scan with phones. Data Matrix if the label must be very small. Avoid EAN and UPC for internal tags; they are meant for retail products.",
    },
    {
        question: "What is a check digit and do I need one?",
        answer: "EAN-13, UPC-A, EAN-8 and ITF-14 end in a check digit that lets the scanner catch a misread. Enter the number without it and the tool calculates it; enter the full number and the tool verifies it and tells you if it is wrong. Code 128, Data Matrix and QR have error checking built into the symbol.",
    },
];

const TYPES = [
    { name: "Code 128", chars: "Letters, digits, punctuation (all of ASCII)", use: "Asset tags, shipping and warehouse labels, internal IDs. The default choice." },
    { name: "Code 39", chars: "A–Z, 0–9, space and - . $ / + %", use: "Older scanners and systems that ask for it. Wider than Code 128 for the same value." },
    { name: "EAN-13 / UPC-A", chars: "Digits only: 13 / 12, check digit included", use: "Retail products at checkout. Numbers come from GS1." },
    { name: "EAN-8", chars: "Digits only: 8", use: "Small retail packs with no room for EAN-13." },
    { name: "ITF-14", chars: "Digits only: 14", use: "Outer cartons and cases of retail products." },
    { name: "Data Matrix", chars: "Any text; up to 2,335 letters and digits in one symbol", use: "Very small labels: electronics, tools, parts." },
    { name: "QR Code", chars: "Any text or URL; up to 4,296 letters and digits in one symbol", use: "Anything people scan with a phone camera, such as a link to an asset's page." },
];

export default function BarcodeGeneratorPage() {
    // Rendered at build time so the default preview shows without loading
    // the 1 MB barcode engine; the engine loads when someone uses the tool.
    const initialSvg = renderSvg(bwipjs, { symbology: "code128", showText: true }, "ASSET-0001");

    const jsonLd = buildToolPageJsonLd({
        name: "Shelf Barcode Generator",
        url: "https://www.shelf.nu/tools/barcode-generator",
        description:
            "Free in-browser barcode generator for Code 128, Code 39, EAN-13, UPC-A, EAN-8, ITF-14, Data Matrix and QR Code, with bulk generation and printable Avery label sheets.",
        faqs: FAQS,
    });

    return (
        <PagefindWrapper
            type="Page"
            title="Free Barcode Generator — Bulk, Code 128, EAN, UPC & Label Sheets"
            keywords="barcode generator, bulk barcode generator, barcode label generator, code 128 generator, code 39 generator, ean 13 generator, upc generator, free barcode generator, barcode generator for inventory, batch barcode generator, barcode label sheet, avery barcode labels"
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
                                Free <span className="text-orange-600">Barcode Generator</span>
                            </h1>
                            <p className="text-xl text-muted-foreground leading-relaxed max-w-2xl mx-auto">
                                Make one barcode or a thousand. Code 128, Code 39, EAN-13, UPC-A, ITF-14, Data Matrix and QR, from a list, a CSV file or a number sequence, printed on Avery label sheets. Free, no signup, nothing uploaded.
                            </p>
                        </div>
                    </Container>
                </section>

                {/* Tool */}
                <section className="pb-20 md:pb-32 -mt-12 relative z-10">
                    <Container>
                        <div className="bg-background rounded-2xl border shadow-xl p-4 sm:p-6 md:p-10">
                            <BarcodeGenerator initialSvg={initialSvg} />
                        </div>
                    </Container>
                </section>

                {/* SEO / Education Content */}
                <section className="py-16 bg-muted/20 border-t border-border/50">
                    <Container className="max-w-4xl space-y-20">

                        {/* Which type */}
                        <div className="space-y-6">
                            <h2 className="text-3xl font-bold tracking-tight">Which barcode type should you choose?</h2>
                            <p className="text-muted-foreground max-w-2xl">
                                Start from what will scan the label and what the value looks like. For internal labels, Code 128 or a QR Code covers almost every case.
                            </p>
                            <div className="overflow-x-auto rounded-xl border border-border bg-card">
                                <table className="w-full min-w-[560px] text-sm">
                                    <thead className="bg-muted/50 text-left">
                                        <tr>
                                            <th scope="col" className="p-3 font-semibold">Type</th>
                                            <th scope="col" className="p-3 font-semibold">What it can hold</th>
                                            <th scope="col" className="p-3 font-semibold">Use it for</th>
                                        </tr>
                                    </thead>
                                    <tbody>
                                        {TYPES.map((t) => (
                                            <tr key={t.name} className="border-t border-border align-top">
                                                <th scope="row" className="p-3 font-semibold text-left whitespace-nowrap">{t.name}</th>
                                                <td className="p-3 text-muted-foreground">{t.chars}</td>
                                                <td className="p-3 text-muted-foreground">{t.use}</td>
                                            </tr>
                                        ))}
                                    </tbody>
                                </table>
                            </div>
                            <p className="text-sm text-muted-foreground">
                                <strong className="text-foreground">Selling products in stores?</strong> EAN-13 and UPC-A numbers for retail must be licensed from <a href="https://www.gs1.org/" className="text-orange-600 hover:underline" target="_blank" rel="noopener noreferrer">GS1</a>, so that no two products in the world share one. This tool draws a correct barcode for any number you enter, but it can&apos;t give you a registered number.
                            </p>
                        </div>

                        {/* How to print */}
                        <div className="space-y-6">
                            <h2 className="text-3xl font-bold tracking-tight">How to print barcode labels</h2>
                            <div className="grid md:grid-cols-3 gap-6">
                                <div className="bg-card p-6 rounded-xl border border-border">
                                    <Layers className="h-8 w-8 text-orange-600 mb-4" />
                                    <h3 className="font-semibold mb-2">1. Match the sheet</h3>
                                    <p className="text-sm text-muted-foreground">
                                        The product number is on the label box. Avery 5160 and 8160 share a layout (30 per US Letter sheet); L7160 and L7651 are A4. Using another brand? Measure one label and the page margins and enter them under Custom grid.
                                    </p>
                                </div>
                                <div className="bg-card p-6 rounded-xl border border-border">
                                    <Printer className="h-8 w-8 text-orange-600 mb-4" />
                                    <h3 className="font-semibold mb-2">2. Print at 100%</h3>
                                    <p className="text-sm text-muted-foreground">
                                        In the print dialog choose &ldquo;Actual size&rdquo; or 100% scale and turn off &ldquo;Fit to page&rdquo;. Scaling shifts every label and can shrink bars below what scanners read. Set the paper type to labels if your printer offers it.
                                    </p>
                                </div>
                                <div className="bg-card p-6 rounded-xl border border-border">
                                    <Ruler className="h-8 w-8 text-orange-600 mb-4" />
                                    <h3 className="font-semibold mb-2">3. Test on plain paper</h3>
                                    <p className="text-sm text-muted-foreground">
                                        Turn on label outlines, print one page on plain paper and hold it against a label sheet up to the light. If it lines up, print the real sheets. Scan a couple of labels before you stick them all on.
                                    </p>
                                </div>
                            </div>
                            <ul className="space-y-2 text-sm text-muted-foreground list-disc pl-5">
                                <li><strong className="text-foreground">Keep the white margin.</strong> Scanners need a blank &ldquo;quiet zone&rdquo; on both sides of the bars. The PDF and images include it; don&apos;t crop it away.</li>
                                <li><strong className="text-foreground">Mind the size.</strong> Long values on small labels make thin bars. The tool warns you when bars get too narrow to scan reliably; shorten the value, choose a bigger label, or switch to Data Matrix or QR.</li>
                                <li><strong className="text-foreground">Partly used sheet?</strong> Set &ldquo;Skip used labels&rdquo; to start printing further down the first sheet.</li>
                            </ul>
                        </div>

                        {/* Asset tracking */}
                        <div className="space-y-6">
                            <h2 className="text-3xl font-bold tracking-tight">Barcodes for asset tracking</h2>
                            <div className="grid md:grid-cols-2 gap-6">
                                <div className="bg-card p-6 rounded-xl border border-border">
                                    <Hash className="h-8 w-8 text-orange-600 mb-4" />
                                    <h3 className="font-semibold mb-2">Number assets in sequence</h3>
                                    <p className="text-sm text-muted-foreground">
                                        Use the Sequence option to print ASSET-0001 to ASSET-0500 in one go. Pad the numbers to a fixed width so they sort correctly, and keep a prefix per site or category if that helps people read them (for example, NYC-LAP-0001).
                                    </p>
                                </div>
                                <div className="bg-card p-6 rounded-xl border border-border">
                                    <Tag className="h-8 w-8 text-orange-600 mb-4" />
                                    <h3 className="font-semibold mb-2">Use labels that last</h3>
                                    <p className="text-sm text-muted-foreground">
                                        Paper labels are fine for boxes and shelves. Laptops, tools and anything handled daily need polyester or vinyl labels, and a laminate if they get wiped or scratched. A barcode that can&apos;t be scanned is just a sticker.
                                    </p>
                                </div>
                            </div>
                            <div className="bg-orange-50/50 dark:bg-orange-950/10 border border-orange-100 dark:border-orange-900/40 rounded-xl p-6">
                                <h3 className="font-semibold mb-2 flex items-center gap-2"><ScanLine className="h-5 w-5 text-orange-600" /> Tracking the equipment, not just labelling it</h3>
                                <p className="text-sm text-muted-foreground leading-relaxed">
                                    A label tells you what an item is; a system tells you who has it, where it is and when it&apos;s due back. In <Link href="/" className="text-orange-600 hover:underline">Shelf</Link>, every asset gets its own QR code the moment you add it. If your equipment already carries barcodes, the <Link href="/knowledge-base/alternative-barcodes" className="text-orange-600 hover:underline">Alternative Barcodes add-on</Link> lets you attach those to your assets and scan them: Code 128, Code 39, EAN-13, Data Matrix and QR codes made elsewhere. Want a full asset tag with your logo and the asset name? Use the <Link href="/tools/asset-label-designer" className="text-orange-600 hover:underline">Asset Label Designer</Link>. To check what you printed, try the <Link href="/tools/barcode-scanner" className="text-orange-600 hover:underline">Barcode Scanner</Link>.
                                </p>
                            </div>
                        </div>

                        {/* FAQ */}
                        <div className="space-y-8">
                            <h2 className="text-3xl font-bold tracking-tight">FAQ</h2>
                            <div className="grid gap-6 md:grid-cols-2">
                                {FAQS.map((f, i) => (
                                    <div key={f.question} className={i === FAQS.length - 1 && FAQS.length % 2 === 1 ? "space-y-2 md:col-span-2" : "space-y-2"}>
                                        <h3 className="font-semibold text-foreground">{f.question}</h3>
                                        <p className="text-sm text-muted-foreground leading-relaxed">{f.answer}</p>
                                    </div>
                                ))}
                            </div>
                        </div>

                        {/* Related Tools */}
                        <div className="space-y-6 pt-8 border-t border-border">
                            <h2 className="text-2xl font-bold tracking-tight">Related free tools</h2>
                            <div className="grid sm:grid-cols-3 gap-6">
                                <Link href="/tools/barcode-scanner" className="group block p-4 rounded-xl border border-border hover:border-orange-300 hover:bg-orange-50/30 transition-colors">
                                    <div className="font-semibold text-foreground group-hover:text-orange-600 transition-colors mb-1">
                                        Free Barcode Scanner
                                    </div>
                                    <div className="text-sm text-muted-foreground">
                                        Decode a barcode from a photo to check your labels.
                                    </div>
                                </Link>
                                <Link href="/tools/asset-label-designer" className="group block p-4 rounded-xl border border-border hover:border-orange-300 hover:bg-orange-50/30 transition-colors">
                                    <div className="font-semibold text-foreground group-hover:text-orange-600 transition-colors mb-1">
                                        Free Asset Label Designer
                                    </div>
                                    <div className="text-sm text-muted-foreground">
                                        Design and print asset tags with a QR code and name.
                                    </div>
                                </Link>
                                <Link href="/tools/qr-code-generator" className="group block p-4 rounded-xl border border-border hover:border-orange-300 hover:bg-orange-50/30 transition-colors">
                                    <div className="font-semibold text-foreground group-hover:text-orange-600 transition-colors mb-1">
                                        Free QR Code Generator
                                    </div>
                                    <div className="text-sm text-muted-foreground">
                                        QR codes with colours, error correction and size control.
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
