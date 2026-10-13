import { Metadata } from 'next';
import type { ReactNode } from 'react';
import Link from 'next/link';
import {
    ArrowRight,
    Focus,
    Sun,
    Contrast,
    SunMoon,
    ZoomIn,
    Scissors,
    Square,
    Monitor,
    FlipHorizontal2,
    Wand2,
    Ruler,
    ShieldCheck,
    Tag,
} from 'lucide-react';
import { BarcodeScanner } from '@/components/tools/barcode-scanner';
import { Container } from '@/components/ui/container';
import { PagefindWrapper } from "@/components/search/pagefind-wrapper";
import { CTA } from "@/components/sections/cta";
import { TrustedBy } from "@/components/sections/trusted-by";
import { G2Badge } from "@/components/sections/g2-badge";
import { buildToolPageJsonLd } from "@/lib/tool-jsonld";

const TITLE = 'Blurry QR Code Reader — Read Blurry, Dark or Damaged QR Codes';
const DESCRIPTION =
    'Read a QR code from a blurry, dark, low-contrast or engraved photo. Free, in your browser, nothing uploaded. Plus why QR codes fail to scan and how to fix each cause.';

export const metadata: Metadata = {
    title: TITLE,
    description: DESCRIPTION,
    alternates: {
        canonical: 'https://www.shelf.nu/tools/blurry-qr-code-reader',
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
        question: "Can you fix a blurry QR code?",
        answer: "Sometimes. This reader inverts the colors, stretches the contrast, evens out the lighting, sharpens and resizes the photo, and tries each version until one reads. That rescues codes that are soft, dim or unevenly lit. If the blur has merged neighboring squares into one smear, the information is no longer in the photo, and no tool can bring it back. Take a new, sharper photo instead.",
    },
    {
        question: "Why won't my QR code scan?",
        answer: "The usual causes are blur, glare, low contrast, light-on-dark colors, a code that is too small or too far away, damage, a missing white border (quiet zone), or wavy moiré lines when photographing a screen. Each has a different fix; the section on this page goes through them one by one.",
    },
    {
        question: "Can a damaged QR code still be scanned?",
        answer: "Often, yes. QR codes carry error correction: depending on the level chosen when the code was made, a reader can rebuild roughly 7%, 15%, 25% or 30% of the data. A scratch or a torn corner is fine as long as the three large corner squares are still visible. Damage beyond that level, or to the corner squares, can't be read.",
    },
    {
        question: "Does it read light-on-dark or engraved QR codes?",
        answer: "Yes. Laser-engraved metal tags, white-on-black stickers and dark-mode codes have reversed colors, which many scanners skip. This reader tries the inverted image when a photo doesn't read as it is, and the camera tries an inverted frame every half second or so.",
    },
    {
        question: "Is my photo uploaded?",
        answer: "No. The photo is decoded and cleaned up in your browser. Images, camera video and the decoded text stay on your device, and the list is gone when you close the page unless you copy or download it.",
    },
    {
        question: "What if it still won't read?",
        answer: "Take a new photo: move closer or use your phone's macro mode, fill the frame with the code, light it from the side to avoid glare, hold steady and tap to focus, and crop out everything else. If the code itself is worn out, ask whoever made it for a new one. Codes printed with a higher error correction level last longer.",
    },
    {
        question: "Does it read other kinds of codes?",
        answer: "Yes. The clean-up pass works on QR codes, Data Matrix and Aztec codes. Sharp photos of 1D barcodes such as UPC, EAN and Code 128 read too, through the normal pass. The barcode scanner page covers those formats.",
        content: (
            <>
                Yes. The clean-up pass works on QR codes, Data Matrix and Aztec codes. Sharp photos of 1D barcodes such as UPC, EAN and Code 128 read too, through the normal pass. The{" "}
                <Link href="/tools/barcode-scanner" className="text-orange-600 hover:underline">barcode scanner</Link> page covers those formats.
            </>
        ),
    },
];

const STEPS = [
    {
        icon: FlipHorizontal2,
        title: "Inverts the colors",
        text: "Scanners look for dark corner squares on a light background. Engraved metal and white-on-black codes are the other way round.",
    },
    {
        icon: Contrast,
        title: "Stretches the contrast",
        text: "Grey-on-grey and faded print are spread over the full range from black to white.",
    },
    {
        icon: SunMoon,
        title: "Evens out the lighting",
        text: "Each part of the photo is compared with its own neighborhood, so a code that is bright on one side and shadowed on the other still splits into clean dark and light squares.",
    },
    {
        icon: Wand2,
        title: "Sharpens and resizes",
        text: "Soft edges between squares are steepened, small codes are enlarged and huge photos are shrunk, which also smooths out noise.",
    },
];

const CAUSES: { icon: typeof Focus; cause: string; why: string; fix: string }[] = [
    {
        icon: Focus,
        cause: "Blurry or out of focus",
        why: "Phone cameras can't focus very close, and a moving hand smears the squares together.",
        fix: "Move back a little or use macro mode, tap the code to focus, hold steady. Mild blur often reads here; heavy blur needs a new photo.",
    },
    {
        icon: Sun,
        cause: "Glare or reflections",
        why: "A bright patch on glossy labels, laminate or metal wipes out part of the code.",
        fix: "Light from the side, tilt the code or the phone until the glare moves off it, and turn off the flash.",
    },
    {
        icon: Contrast,
        cause: "Low contrast",
        why: "Faded print, grey on grey, or a dark room leaves too little difference between squares.",
        fix: "Add light, and try this reader: it stretches the contrast before decoding.",
    },
    {
        icon: FlipHorizontal2,
        cause: "Light-on-dark (inverted) colors",
        why: "Engraved metal, white-on-black stickers and dark-mode codes reverse the usual colors, and many scanners don't check for that.",
        fix: "Use a scanner that tries inverted codes, like this one. On metal, tilt until the engraving contrasts with the surface.",
    },
    {
        icon: ZoomIn,
        cause: "Too small or too far away",
        why: "Each square needs a few pixels in the photo. A small code across the room is only a handful of pixels wide.",
        fix: "Move closer or zoom in optically, then crop the photo to the code.",
    },
    {
        icon: Scissors,
        cause: "Damaged, scratched or dirty",
        why: "Scratches, peeling and grime remove parts of the code.",
        fix: "Clean it. Error correction covers some damage, but if the corner squares are damaged, the code needs replacing.",
    },
    {
        icon: Square,
        cause: "Missing quiet zone",
        why: "QR codes need an empty border four squares wide. Codes printed edge to edge, or with text crowding them, can't be located.",
        fix: "Include the border in the photo. If the code was printed without one, reprint it with the border.",
    },
    {
        icon: Monitor,
        cause: "Wavy lines on a screen (moiré)",
        why: "Photographing a screen makes the screen's pixel grid clash with the camera's, adding wavy bands.",
        fix: "Take a screenshot instead and drop it on this page, or change the angle and distance.",
    },
];

const EC_LEVELS = [
    { level: "L", recovers: "about 7%", use: "Clean environments, the smallest code for the data" },
    { level: "M", recovers: "about 15%", use: "The usual default for print" },
    { level: "Q", recovers: "about 25%", use: "Labels that get handled" },
    { level: "H", recovers: "about 30%", use: "Labels on equipment that wears, or codes with a logo in the middle" },
];

export default function BlurryQrCodeReaderPage() {
    const jsonLd = buildToolPageJsonLd({
        name: "Shelf Blurry QR Code Reader",
        url: "https://www.shelf.nu/tools/blurry-qr-code-reader",
        description:
            "Free online reader for blurry, dark, low-contrast, light-on-dark and engraved QR codes. When a photo won't read as it is, it inverts, contrast-stretches, evens out the lighting and sharpens it in the browser, and gives retake advice when the photo holds too little detail.",
        faqs: FAQS.map(({ question, answer }) => ({ question, answer })),
    });

    return (
        <PagefindWrapper
            type="Page"
            title="Blurry QR Code Reader — Read Blurry, Dark or Damaged QR Codes"
            keywords="blurry qr code, read blurry qr code, qr code not scanning, qr code won't scan, why won't my qr code scan, damaged qr code, scan damaged qr code, inverted qr code, engraved qr code"
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
                                Read a <span className="text-orange-600">Blurry QR Code</span>
                            </h1>
                            <p className="text-xl text-muted-foreground leading-relaxed max-w-2xl mx-auto">
                                Drop in a photo of a QR code that won&apos;t scan: blurry, dark, low-contrast, unevenly lit or engraved on metal. If it doesn&apos;t read as it is, the photo is cleaned up in your browser and tried again. Nothing is uploaded.
                            </p>
                        </div>
                    </Container>
                </section>

                <BarcodeScanner variant="blurry" />

                {/* SEO / Education Content */}
                <section className="py-16 bg-muted/20 border-t border-border/50">
                    <Container className="max-w-4xl space-y-20">

                        {/* What it does */}
                        <div className="space-y-6">
                            <h2 className="text-3xl font-bold tracking-tight">What the reader does to your photo</h2>
                            <p className="text-muted-foreground max-w-2xl">
                                First it reads the photo as it is. If that fails, it builds cleaned-up versions and tries each one until a code reads, then tells you what it took. It stops after a few seconds.
                            </p>
                            <div className="grid sm:grid-cols-2 gap-6">
                                {STEPS.map(({ icon: Icon, title, text }) => (
                                    <div key={title} className="bg-card p-6 rounded-xl border border-border">
                                        <Icon className="h-8 w-8 text-orange-600 mb-4" />
                                        <h3 className="font-semibold mb-2">{title}</h3>
                                        <p className="text-sm text-muted-foreground">{text}</p>
                                    </div>
                                ))}
                            </div>
                            <p className="text-sm text-muted-foreground max-w-2xl">
                                None of this adds detail the camera didn&apos;t capture. It removes what stops a decoder from seeing detail that is there. When the squares of the code have blurred into each other, the only fix is a better photo.
                            </p>
                        </div>

                        {/* Causes and fixes */}
                        <div className="space-y-6">
                            <h2 className="text-3xl font-bold tracking-tight">Why a QR code won&apos;t scan, and how to fix it</h2>
                            <div className="grid md:grid-cols-2 gap-6">
                                {CAUSES.map(({ icon: Icon, cause, why, fix }) => (
                                    <div key={cause} className="bg-card p-6 rounded-xl border border-border space-y-2">
                                        <div className="flex items-center gap-3">
                                            <Icon className="h-6 w-6 text-orange-600 shrink-0" />
                                            <h3 className="font-semibold">{cause}</h3>
                                        </div>
                                        <p className="text-sm text-muted-foreground">{why}</p>
                                        <p className="text-sm text-foreground"><span className="font-medium">Fix:</span> {fix}</p>
                                    </div>
                                ))}
                            </div>
                        </div>

                        {/* Error correction */}
                        <div className="space-y-6">
                            <h2 className="text-3xl font-bold tracking-tight">How QR error correction works</h2>
                            <div className="bg-card p-6 rounded-xl border border-border space-y-4">
                                <ShieldCheck className="h-8 w-8 text-orange-600" />
                                <p className="text-muted-foreground">
                                    A QR code stores its data together with extra recovery data (Reed-Solomon error correction). Whoever makes the code picks one of four levels. The higher the level, the more of the code can be missing or misread and still be rebuilt, and the denser the code gets for the same data.
                                </p>
                                <div className="overflow-x-auto">
                                    <table className="w-full text-sm text-left">
                                        <thead>
                                            <tr className="border-b border-border">
                                                <th className="py-2 pr-4 font-semibold">Level</th>
                                                <th className="py-2 pr-4 font-semibold">Can recover</th>
                                                <th className="py-2 font-semibold">Good for</th>
                                            </tr>
                                        </thead>
                                        <tbody>
                                            {EC_LEVELS.map((row) => (
                                                <tr key={row.level} className="border-b border-border/50 last:border-0">
                                                    <td className="py-2 pr-4 font-mono font-medium">{row.level}</td>
                                                    <td className="py-2 pr-4 text-muted-foreground whitespace-nowrap">{row.recovers} of the codewords</td>
                                                    <td className="py-2 text-muted-foreground">{row.use}</td>
                                                </tr>
                                            ))}
                                        </tbody>
                                    </table>
                                </div>
                                <p className="text-sm text-muted-foreground">
                                    That is why a scratched or partly covered code can still scan: the damage hits a limited number of codewords and the rest rebuild them. Two things error correction can&apos;t handle. The three large corner squares are how a scanner finds the code at all, so they need to be intact. And blur is not local damage: it softens every square at once, so past a point there is nothing left for error correction to work with.
                                </p>
                            </div>
                        </div>

                        {/* Better photo */}
                        <div className="space-y-6">
                            <h2 className="text-3xl font-bold tracking-tight">How to take a photo that scans</h2>
                            <ol className="space-y-3 text-muted-foreground list-decimal pl-5 max-w-2xl">
                                <li><span className="text-foreground font-medium">Get close, but stay in focus.</span> Most phones can&apos;t focus nearer than about 10 cm. Use the macro or close-up mode if your phone has one, or step back and zoom in.</li>
                                <li><span className="text-foreground font-medium">Fill the frame with the code.</span> Keep the white border in the shot and crop out everything else before uploading.</li>
                                <li><span className="text-foreground font-medium">Light from the side.</span> Glare from straight on hides squares. On engraved or metal tags, tilt the tag until the code stands out from the surface.</li>
                                <li><span className="text-foreground font-medium">Hold steady and tap to focus.</span> Brace your elbows, tap the code on screen, and take two or three shots.</li>
                                <li><span className="text-foreground font-medium">Clean the surface.</span> Dust, grease and fingerprints on a label or its cover blur it as much as a shaky hand.</li>
                                <li><span className="text-foreground font-medium">For a code on a screen, take a screenshot.</span> It is always sharper than a photo of the screen.</li>
                            </ol>
                        </div>

                        {/* For makers */}
                        <div className="space-y-6">
                            <h2 className="text-3xl font-bold tracking-tight">Making QR codes that keep scanning</h2>
                            <p className="text-muted-foreground max-w-2xl">
                                If you print QR codes for equipment, signs or tags, most scanning problems can be avoided when the code is made.
                            </p>
                            <div className="grid sm:grid-cols-2 gap-6">
                                <div className="bg-card p-6 rounded-xl border border-border">
                                    <Ruler className="h-8 w-8 text-orange-600 mb-4" />
                                    <h3 className="font-semibold mb-2">Size for the scanning distance</h3>
                                    <p className="text-sm text-muted-foreground">A common rule of thumb is a code at least one tenth as wide as the distance it is scanned from, and not much under 2 cm for close-up scanning. Shorter content makes a less dense code with bigger squares.</p>
                                </div>
                                <div className="bg-card p-6 rounded-xl border border-border">
                                    <ShieldCheck className="h-8 w-8 text-orange-600 mb-4" />
                                    <h3 className="font-semibold mb-2">Error correction H for labels that wear</h3>
                                    <p className="text-sm text-muted-foreground">Level H rebuilds about 30% of the code, so scuffs and scratches matter less. Make the code a little larger to keep the squares the same size.</p>
                                </div>
                                <div className="bg-card p-6 rounded-xl border border-border">
                                    <Contrast className="h-8 w-8 text-orange-600 mb-4" />
                                    <h3 className="font-semibold mb-2">Strong contrast and a quiet zone</h3>
                                    <p className="text-sm text-muted-foreground">Dark squares on a light background read everywhere. Leave an empty border four squares wide on every side, and keep text and edges out of it.</p>
                                </div>
                                <div className="bg-card p-6 rounded-xl border border-border">
                                    <Tag className="h-8 w-8 text-orange-600 mb-4" />
                                    <h3 className="font-semibold mb-2">Durable labels for equipment</h3>
                                    <p className="text-sm text-muted-foreground">Paper labels fade and peel. On tools and gear that get handled, use laminated, polyester or metal labels and place them where they won&apos;t rub.</p>
                                </div>
                            </div>
                            <p className="text-sm text-muted-foreground">
                                Make codes with the{" "}
                                <Link href="/tools/qr-code-generator" className="text-orange-600 hover:underline">free QR code generator</Link>{" "}
                                and lay out printable labels with the{" "}
                                <Link href="/tools/asset-label-designer" className="text-orange-600 hover:underline">free asset label designer</Link>.
                            </p>
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

                        {/* Shelf tie-in */}
                        <div className="bg-card p-6 rounded-xl border border-border space-y-2">
                            <h2 className="text-xl font-bold tracking-tight">QR codes for your equipment</h2>
                            <p className="text-sm text-muted-foreground">
                                Shelf gives every asset its own QR code. When a tag is too worn to scan, the asset isn&apos;t lost: type the ID printed under the code or search for the asset by name, then link a new label to it. See{" "}
                                <Link href="/knowledge-base/troubleshooting-qr-code-not-scanning" className="text-orange-600 hover:underline">QR code not scanning in Shelf</Link>.
                            </p>
                        </div>

                        {/* Related Tools */}
                        <div className="space-y-6 pt-8 border-t border-border">
                            <h2 className="text-2xl font-bold tracking-tight">Related free tools</h2>
                            <div className="grid sm:grid-cols-2 gap-6">
                                <Link href="/tools/qr-code-scanner" className="group block p-4 rounded-xl border border-border hover:border-orange-300 hover:bg-orange-50/30 transition-colors">
                                    <div className="font-semibold text-foreground group-hover:text-orange-600 transition-colors mb-1">
                                        Free QR Code Scanner
                                    </div>
                                    <div className="text-sm text-muted-foreground">
                                        Scan QR codes live with your camera, with links and Wi-Fi details laid out.
                                    </div>
                                </Link>
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
