import { Metadata } from 'next';
import Link from 'next/link';
import { Container } from '@/components/ui/container';
import { Button } from '@/components/ui/button';
import { ArrowRight, Download, Layers, Printer, QrCode, Ruler, ScanLine, ShoppingBag, Tag } from 'lucide-react';
import { AssetLabelDesigner } from '@/components/tools/asset-label-designer';
import { CTA } from '@/components/sections/cta';
import { TrustedBy } from '@/components/sections/trusted-by';
import { G2Badge } from '@/components/sections/g2-badge';
import { PagefindWrapper } from "@/components/search/pagefind-wrapper";
import { TrackedLink } from "@/components/analytics/tracked-link";
import { buildToolPageJsonLd } from "@/lib/tool-jsonld";
import { pricingPlans } from "@/data/pricing";
import { getAddOn } from "@/data/pricing.addons";

const TITLE = 'Custom Asset Tags & QR Asset Labels — Free Maker, Print or Order';
const DESCRIPTION = 'Design QR asset tags free in your browser, print them yourself or order durable laminated labels, then track every tagged item in Shelf. No signup.';

export const metadata: Metadata = {
    title: TITLE,
    description: DESCRIPTION,
    alternates: {
        canonical: 'https://www.shelf.nu/tools/asset-label-designer'
    },
    openGraph: {
        title: `${TITLE} | Shelf`,
        description: DESCRIPTION,
    },
};

// Store facts verified against https://store.shelf.nu on 2026-10-14 (collection
// and product pages). The store sells laminated PVC QR labels only, no metal
// tags. Prices are left to the store so this page can't go stale on them.
const STORE_URL = "https://store.shelf.nu/?ref=label_designer";
const SIGNUP_URL = "https://app.shelf.nu/join?utm_source=shelf_website&utm_medium=cta&utm_content=tool_label_designer";

const freePlan = pricingPlans.find((p) => p.id === "free");
const freeAssets = freePlan?.limits.assets.toLowerCase() ?? "unlimited";
const freeUsers = freePlan?.limits.users.toLowerCase() ?? "1 user";
const barcodesPlan = getAddOn("alternative-barcodes")?.availableOn ?? "Team";

const FAQS = [
    {
        question: "What should an asset tag include?",
        answer: "A unique asset ID printed in plain text, a QR code or barcode that encodes that ID (or a link to the item's record), and your organization's name or \"Property of\" line. A short contact line, such as an email or phone number for returns, is optional but helps lost items find their way back. Keep anything that changes, like the user or the location, off the tag and in your records.",
    },
    {
        question: "What's the difference between an asset tag and an asset label?",
        answer: "In practice the words mean the same thing: a physical marker with a unique ID stuck or fixed to equipment you own. Some people use \"tag\" for durable metal or riveted plates and \"label\" for adhesive stickers, but search engines, suppliers and software use both terms for both.",
    },
    {
        question: "Can I print asset tags on a normal printer?",
        answer: "Yes. Print on adhesive label sheets with an office laser or inkjet printer, or use a thermal label printer such as a Dymo, Zebra or Brother. Print at 100% scale (\"Actual size\") with \"Fit to page\" turned off, and scan a test print before you print the whole batch. Plain paper labels wear quickly on equipment that is handled every day, so use synthetic label stock or laminated labels for those.",
    },
    {
        question: "What label material lasts longest?",
        answer: "Metal tags, such as anodized aluminium, last longest and survive heat, solvents and outdoor use. For laptops, cameras, tools and office equipment, laminated labels are usually enough: the clear layer protects the print from scratches, water and cleaning. Paper labels are the shortest-lived and suit boxes, shelves and low-handling items.",
    },
    {
        question: "Can I use QR codes for asset tags?",
        answer: "Yes, and for most teams they are the easiest choice: any phone camera can scan them, they still read when part of the code is scratched, and they can hold a link to the item's record. This designer always uses the highest error correction level. Keep the plain-text ID next to the code so people can type it when a scan fails.",
    },
    {
        question: "Can I keep the asset tags we already have?",
        answer: `Yes. If you track your equipment in Shelf, the Alternative Barcodes add-on (${barcodesPlan} plan) lets you attach the codes already on your equipment to each asset and scan them: Code 128, Code 39, EAN-13, Data Matrix and QR codes made outside Shelf. You don't have to re-tag anything.`,
    },
    {
        question: "Do I need software to use asset tags?",
        answer: `Not to print them. A tag with an ID and a spreadsheet works for a small, stable list. Software matters once you need to know who has an item, where it is and when it's due back, because the tag only identifies the item. Shelf's free plan covers ${freeAssets} assets for ${freeUsers}, and every asset gets its own QR code.`,
    },
];

export default function AssetLabelDesignerPage() {
    const jsonLd = buildToolPageJsonLd({
        name: "Shelf Asset Label Designer",
        url: "https://www.shelf.nu/tools/asset-label-designer",
        description:
            "Free in-browser designer for custom QR asset tags and labels. Exports PNG, SVG and a size-accurate PDF for label printers.",
        faqs: FAQS,
    });

    return (
        <PagefindWrapper
            type="Page"
            title="Custom Asset Tags and QR Labels — Free Asset Tag Maker"
            keywords="custom asset tags, asset tags, asset labels, asset tag labels, qr code asset labels, asset tag stickers, print asset tags, asset tag maker, asset label designer"
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
                        <h1 className="text-4xl md:text-5xl font-bold tracking-tight mb-6 text-foreground">
                            Custom Asset Tags and <span className="text-orange-600">QR Labels</span>
                        </h1>
                        <p className="text-xl text-muted-foreground leading-relaxed max-w-2xl mx-auto">
                            Free asset tag maker: design a scan-safe QR asset tag in your browser and download it as PNG, SVG or PDF. Print it yourself or order durable printed labels, then track every tagged item in Shelf. No signup.
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

            {/* Landing content */}
            <section className="py-16 md:py-24 border-t bg-muted/20">
                <Container className="max-w-4xl space-y-20">

                    {/* 1. Three ways */}
                    <div className="space-y-6">
                        <h2 className="text-3xl font-bold tracking-tight">Three ways to get asset tags</h2>
                        <p className="text-muted-foreground max-w-2xl">
                            Pick by how many items you have, how hard they are used, and whether you already have labels on them.
                        </p>
                        <div className="grid md:grid-cols-3 gap-6">
                            <div className="bg-card p-6 rounded-xl border border-border flex flex-col">
                                <Download className="h-8 w-8 text-orange-600 mb-4" />
                                <h3 className="font-semibold mb-2">1. Design and print them here</h3>
                                <p className="text-sm text-muted-foreground">
                                    Use the designer above: enter an asset ID and, if you like, a name; choose 25, 40 or 60&nbsp;mm; download a PNG, an SVG or a size-accurate PDF for a label printer. It makes one tag at a time. For a full sheet of numbered labels, use the <Link href="/tools/barcode-generator" className="text-orange-600 hover:underline">Barcode Generator</Link>, which does QR codes in bulk on Avery sheets.
                                </p>
                            </div>
                            <div className="bg-card p-6 rounded-xl border border-border flex flex-col">
                                <ShoppingBag className="h-8 w-8 text-orange-600 mb-4" />
                                <h3 className="font-semibold mb-2">2. Order printed labels</h3>
                                <p className="text-sm text-muted-foreground">
                                    The Shelf store sells laminated PVC QR labels, unbranded or with your logo. Each carries a unique Shelf QR code that is linked to nothing until you scan it in Shelf and attach it to a new or existing asset. They are made for Shelf and work only with Shelf.
                                </p>
                                <TrackedLink
                                    href={STORE_URL}
                                    target="_blank"
                                    rel="noopener"
                                    eventName="store_click"
                                    eventProps={{ location: "label_designer" }}
                                    className="mt-auto pt-4 inline-flex items-center text-sm font-medium text-orange-600 hover:underline"
                                >
                                    Visit the label store <ArrowRight className="ml-1 h-4 w-4" />
                                </TrackedLink>
                            </div>
                            <div className="bg-card p-6 rounded-xl border border-border flex flex-col">
                                <Tag className="h-8 w-8 text-orange-600 mb-4" />
                                <h3 className="font-semibold mb-2">3. Keep the tags you have</h3>
                                <p className="text-sm text-muted-foreground">
                                    Moving from a spreadsheet or another system? You don&apos;t have to re-tag. Shelf&apos;s <Link href="/knowledge-base/alternative-barcodes" className="text-orange-600 hover:underline">Alternative Barcodes add-on</Link> ({barcodesPlan} plan) attaches the codes already on your equipment to each asset and scans them: Code 128, Code 39, EAN-13, Data Matrix and QR codes made elsewhere, including tags printed with this designer.
                                </p>
                            </div>
                        </div>
                    </div>

                    {/* 2. What to put on a tag */}
                    <div className="space-y-6">
                        <h2 className="text-3xl font-bold tracking-tight">What to put on an asset tag</h2>
                        <div className="grid md:grid-cols-2 gap-8">
                            <ul className="space-y-3 text-sm text-muted-foreground list-disc pl-5">
                                <li><strong className="text-foreground">A unique ID</strong> in plain text, such as AST-0042. It is what people read out, type into a search, or write on a form when a scan fails.</li>
                                <li><strong className="text-foreground">A QR code or barcode</strong> that encodes that ID, or a link to the item&apos;s record. Black on white, with a clear margin around the code.</li>
                                <li><strong className="text-foreground">Your organization&apos;s name</strong> or a &ldquo;Property of&rdquo; line, so a found item can be returned and nobody mistakes it for personal property.</li>
                                <li><strong className="text-foreground">Optional: a contact line</strong>, such as an IT or facilities email address.</li>
                            </ul>
                            <p className="text-sm text-muted-foreground leading-relaxed">
                                Leave off anything that changes: who has the item, where it lives, its value. That belongs in your records, where you can update it without reprinting. For a numbering scheme that scales, what government property tags need, and where to put a tag on a laptop, camera or tool, read our <Link href="/blog/asset-tags-guide" className="text-orange-600 hover:underline">guide to asset tags</Link>.
                            </p>
                        </div>
                    </div>

                    {/* 3. Choosing a label */}
                    <div className="space-y-6">
                        <h2 className="text-3xl font-bold tracking-tight">Choosing a label: sticker, laminated or metal</h2>
                        <div className="grid md:grid-cols-3 gap-6">
                            <div className="bg-card p-6 rounded-xl border border-border">
                                <h3 className="font-semibold mb-2">Paper stickers</h3>
                                <p className="text-sm text-muted-foreground">
                                    The cheapest option, printed on label sheets in an office printer. Fine for boxes, shelves, bins and items that are rarely touched. On anything handled or wiped daily, paper scuffs, smudges and peels within months. Synthetic label stock (polyester or vinyl) lasts much longer and runs through the same printers.
                                </p>
                            </div>
                            <div className="bg-card p-6 rounded-xl border border-border">
                                <h3 className="font-semibold mb-2">Laminated labels</h3>
                                <p className="text-sm text-muted-foreground">
                                    A clear layer over the print protects it from scratches, water, cleaning and sunlight. The right choice for laptops, cameras, AV gear, tools and lab equipment. This is what the Shelf store sells: laminated PVC QR labels, resistant to UV, water and scratches.
                                </p>
                            </div>
                            <div className="bg-card p-6 rounded-xl border border-border">
                                <h3 className="font-semibold mb-2">Metal tags</h3>
                                <p className="text-sm text-muted-foreground">
                                    Anodized aluminium or stainless steel tags survive heat, solvents, outdoor weather and heavy machinery, and are hard to remove. They cost more and come from specialist makers; the Shelf store does not sell them. Choose metal when a laminated label would be scraped off or eaten by chemicals, not for office equipment.
                                </p>
                            </div>
                        </div>
                        <p className="text-sm text-muted-foreground">
                            For a material-by-environment breakdown, see <Link href="/blog/asset-tags-guide" className="text-orange-600 hover:underline">choosing a material in the asset tags guide</Link>.
                        </p>
                    </div>

                    {/* Store CTA */}
                    <div className="bg-orange-50/50 dark:bg-orange-950/10 border border-orange-100 dark:border-orange-900/40 rounded-xl p-6 md:p-8">
                        <div className="flex flex-col md:flex-row md:items-center gap-6">
                            <div className="flex-1 space-y-2">
                                <h2 className="text-2xl font-bold tracking-tight flex items-center gap-2">
                                    <QrCode className="h-6 w-6 text-orange-600 shrink-0" /> Rather not print them yourself?
                                </h2>
                                <p className="text-sm text-muted-foreground leading-relaxed">
                                    Order laminated PVC QR asset labels from the Shelf store: square 15, 20 or 25&nbsp;mm, or rectangular 15&nbsp;&times;&nbsp;30&nbsp;mm, in sheets of 35 to 96. Choose unbranded labels or add your logo. They work with Shelf: scan a label to create an asset or link it to one you already have.
                                </p>
                            </div>
                            <Button size="lg" className="shrink-0" asChild>
                                <TrackedLink
                                    href={STORE_URL}
                                    target="_blank"
                                    rel="noopener"
                                    eventName="store_click"
                                    eventProps={{ location: "label_designer" }}
                                >
                                    Shop asset labels <ArrowRight className="ml-2 h-4 w-4" />
                                </TrackedLink>
                            </Button>
                        </div>
                    </div>

                    {/* 4. Printing yourself */}
                    <div className="space-y-6">
                        <h2 className="text-3xl font-bold tracking-tight">Printing asset tags yourself</h2>
                        <div className="grid md:grid-cols-3 gap-6">
                            <div className="bg-card p-6 rounded-xl border border-border">
                                <Printer className="h-8 w-8 text-orange-600 mb-4" />
                                <h3 className="font-semibold mb-2">Thermal label printers</h3>
                                <p className="text-sm text-muted-foreground">
                                    Dymo, Zebra and Brother printers print one label at a time from a roll. Use <strong className="text-foreground">Label Printer PDF</strong> in the designer: it is a page exactly the size of the label. Direct thermal labels fade in sun and heat; thermal transfer printing with a ribbon lasts much longer.
                                </p>
                            </div>
                            <div className="bg-card p-6 rounded-xl border border-border">
                                <Layers className="h-8 w-8 text-orange-600 mb-4" />
                                <h3 className="font-semibold mb-2">Office printers and label sheets</h3>
                                <p className="text-sm text-muted-foreground">
                                    Any laser or inkjet printer works with adhesive label sheets; laser print resists smudging better. Place the PNG or SVG in your label software, or let the <Link href="/tools/barcode-generator" className="text-orange-600 hover:underline">Barcode Generator</Link> lay out a whole Avery sheet of QR codes from a number sequence or a CSV.
                                </p>
                            </div>
                            <div className="bg-card p-6 rounded-xl border border-border">
                                <ScanLine className="h-8 w-8 text-orange-600 mb-4" />
                                <h3 className="font-semibold mb-2">Test before the batch</h3>
                                <p className="text-sm text-muted-foreground">
                                    Print at 100% (&ldquo;Actual size&rdquo;) with &ldquo;Fit to page&rdquo; off. Print one label, then scan it with a phone camera or our <Link href="/tools/qr-code-scanner" className="text-orange-600 hover:underline">QR Code Scanner</Link> from a normal distance before you print and stick a hundred.
                                </p>
                            </div>
                        </div>
                        <div className="grid md:grid-cols-2 gap-8 pt-2">
                            <div>
                                <h3 className="font-semibold text-foreground mb-3 flex items-center gap-2"><Ruler className="h-5 w-5 text-orange-600" /> Which size?</h3>
                                <ul className="space-y-2 text-sm text-muted-foreground list-disc pl-5">
                                    <li><strong className="text-foreground">25&nbsp;mm:</strong> phones, hand tools and small peripherals. Tight for long IDs.</li>
                                    <li><strong className="text-foreground">40&nbsp;mm:</strong> the common choice for laptops, monitors, furniture and office equipment.</li>
                                    <li><strong className="text-foreground">60&nbsp;mm:</strong> flight cases, server racks, machinery and shelving, where people scan from further away.</li>
                                </ul>
                            </div>
                            <div>
                                <h3 className="font-semibold text-foreground mb-3">Rules the designer follows</h3>
                                <ul className="space-y-2 text-sm text-muted-foreground list-disc pl-5">
                                    <li><strong className="text-foreground">Black on white only.</strong> Scanners read high contrast best.</li>
                                    <li><strong className="text-foreground">A clear margin</strong> around the code, so nearby text or an edge doesn&apos;t confuse the scanner. Don&apos;t crop it.</li>
                                    <li><strong className="text-foreground">The ID in plain text</strong> under the code, for when a scan fails.</li>
                                </ul>
                                <p className="text-sm text-muted-foreground mt-3">
                                    Need colours or a different pixel size? Try the <Link href="/tools/qr-code-generator" className="text-orange-600 hover:underline">QR Code Generator</Link>.
                                </p>
                            </div>
                        </div>
                    </div>

                    {/* 5. Track what you tag */}
                    <div className="space-y-6">
                        <h2 className="text-3xl font-bold tracking-tight">Track what you tag</h2>
                        <div className="bg-card p-6 md:p-8 rounded-xl border border-border space-y-4">
                            <p className="text-muted-foreground leading-relaxed">
                                A tag tells you what an item is. It can&apos;t tell you who has it, where it is or when it&apos;s due back. In <Link href="/" className="text-orange-600 hover:underline">Shelf</Link>, every asset gets its own QR code the moment you add it: scan it with a phone to open the asset&apos;s page and see who has it, where it is kept and its history. Download one label from an asset&apos;s page, or many at once from the asset list.
                            </p>
                            <p className="text-muted-foreground leading-relaxed">
                                Shelf&apos;s free plan includes {freeAssets} assets for {freeUsers}. Labels from the Shelf store link to your assets the first time you scan them.
                            </p>
                            <div className="flex flex-col sm:flex-row gap-3 pt-2">
                                <Button size="lg" asChild>
                                    <TrackedLink
                                        href={SIGNUP_URL}
                                        eventName="signup_click"
                                        eventProps={{ location: "tool_label_designer" }}
                                    >
                                        Start tracking for free <ArrowRight className="ml-2 h-4 w-4" />
                                    </TrackedLink>
                                </Button>
                                <Button size="lg" variant="outline" asChild>
                                    <Link href="/pricing">See plans</Link>
                                </Button>
                            </div>
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
                            <Link href="/tools/barcode-generator" className="group block p-4 rounded-xl border border-border hover:border-orange-300 hover:bg-orange-50/30 transition-colors">
                                <div className="font-semibold text-foreground group-hover:text-orange-600 transition-colors mb-1">
                                    Free Barcode Generator
                                </div>
                                <div className="text-sm text-muted-foreground">
                                    Bulk QR codes and barcodes on Avery label sheets.
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
                            <Link href="/tools/qr-code-scanner" className="group block p-4 rounded-xl border border-border hover:border-orange-300 hover:bg-orange-50/30 transition-colors">
                                <div className="font-semibold text-foreground group-hover:text-orange-600 transition-colors mb-1">
                                    Free QR Code Scanner
                                </div>
                                <div className="text-sm text-muted-foreground">
                                    Check that a printed tag scans before you print the batch.
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
