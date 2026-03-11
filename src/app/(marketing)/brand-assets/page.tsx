import { Container } from "@/components/ui/container";
import { ScrollReveal } from "@/components/ui/scroll-reveal";
import { ColorPalette } from "@/components/brand/color-palette";
import Image from "next/image";
import { Download, Check, X, ExternalLink } from "lucide-react";
import { CopyButton } from "@/components/brand/copy-button";
import { AnchorNav } from "@/components/brand/anchor-nav";

export const metadata = {
    title: "Brand Center - Shelf Asset Management",
    description: "Official Shelf logos, colors, typography, and usage guidelines. Everything you need to represent Shelf correctly.",
};

const LOGO_VARIANTS = [
    {
        label: "Light",
        sublabel: "For light backgrounds",
        src: "/logo-light.png",
        download: "/logo-light.png",
        bgClass: "bg-white",
        borderClass: "border",
        labelClass: "text-muted-foreground",
        linkClass: "text-orange-600 hover:text-orange-700",
        footerBgClass: "border-t bg-zinc-50/50 dark:bg-zinc-900/30",
    },
    {
        label: "Dark",
        sublabel: "For dark backgrounds",
        src: "/logo-dark.png",
        download: "/logo-dark.png",
        bgClass: "bg-zinc-950",
        borderClass: "border border-zinc-800",
        labelClass: "text-zinc-500",
        linkClass: "text-orange-400 hover:text-orange-300",
        footerBgClass: "border-t border-zinc-800 bg-zinc-900/50",
    },
];

const DOS = [
    "Use the official logo files provided on this page",
    "Maintain clear space around the logo (at least the height of the icon mark)",
    "Use the light logo on dark backgrounds and vice versa",
    "Link the logo back to shelf.nu when used on external sites",
];

const DONTS = [
    "Alter the logo colors, proportions, or orientation",
    "Add effects like shadows, gradients, or outlines to the logo",
    "Place the logo on busy backgrounds that reduce legibility",
    "Use the logo to imply endorsement or partnership without permission",
];

const BOILERPLATE_SHORT = "Shelf is the open-source equipment management platform trusted by 3,000+ teams worldwide. Track assets, manage bookings, and prevent double-bookings — all without per-user pricing.";

const BOILERPLATE_LONG = "Shelf is the modern, open-source asset management platform that helps teams of all sizes track physical equipment, manage bookings, and generate QR-coded labels. Unlike legacy tools with per-user pricing and complex setups, Shelf offers transparent flat-rate plans, a fast and intuitive interface, and the flexibility of open source. Trusted by 3,000+ organizations — from startups to universities to Fortune 500 companies — Shelf is built for the teams that actually use it.";

export default function BrandAssetsPage() {
    return (
        <>
            {/* Hero */}
            <div className="relative">
                <div className="absolute top-0 inset-x-0 h-[600px] -z-10 bg-grid-pattern bg-[size:24px_24px] [mask-image:radial-gradient(ellipse_60%_50%_at_50%_0%,#000_70%,transparent_100%)] pointer-events-none" />
                <div className="absolute top-0 inset-x-0 h-[600px] bg-[radial-gradient(ellipse_at_top,_var(--tw-gradient-stops))] from-orange-50/20 via-background to-background pointer-events-none" />

                <section className="border-b border-border/40">
                    <Container className="pt-28 pb-14 md:pt-36 md:pb-20">
                        <div className="flex flex-col md:flex-row justify-between items-center gap-6 md:gap-12">
                            {/* Text */}
                            <div className="max-w-xl text-center md:text-left">
                                <p className="text-orange-600 font-semibold mb-4 text-sm uppercase tracking-widest">
                                    Brand Center
                                </p>
                                <h1 className="text-4xl font-bold tracking-tight sm:text-5xl mb-4">
                                    Brand Assets
                                </h1>
                                <p className="text-lg text-muted-foreground">
                                    Official logos, colors, and guidelines for representing Shelf. Use these assets when writing about us, integrating with us, or featuring us on your site.
                                </p>
                            </div>

                            {/* Label images composition */}
                            <div className="relative w-64 h-56 md:w-80 md:h-64 flex-shrink-0 hidden sm:block">
                                {/* Square branded label — back, tilted left */}
                                <div className="absolute top-0 left-0 w-36 md:w-44 drop-shadow-lg -rotate-6">
                                    <Image
                                        src="/images/labels/custom-rectangle.png"
                                        alt="Shelf custom branded QR label"
                                        width={400}
                                        height={400}
                                        className="w-full h-auto"
                                    />
                                </div>
                                {/* Horizontal branded label — front, tilted right */}
                                <div className="absolute bottom-2 right-0 w-48 md:w-56 drop-shadow-xl rotate-3">
                                    <Image
                                        src="/images/labels/custom-label.png"
                                        alt="Shelf asset label with QR code"
                                        width={321}
                                        height={216}
                                        className="w-full h-auto"
                                    />
                                </div>
                            </div>
                        </div>
                    </Container>
                </section>
            </div>

            <Container className="py-16 sm:py-24">
                {/* Quick Nav */}
                <AnchorNav />

                {/* ─── Logos ─── */}
                <section id="logos" className="mb-14 sm:mb-20 scroll-mt-32">
                    <ScrollReveal width="100%">
                        <div className="mb-8">
                            <h2 className="text-2xl font-bold mb-2">Logos</h2>
                            <p className="text-muted-foreground">Download official logo files. Right-click and save, or use the download buttons.</p>
                        </div>

                        <div className="grid md:grid-cols-2 gap-6 md:gap-8">
                            {LOGO_VARIANTS.map((variant) => (
                                <div key={variant.label} className={`${variant.borderClass} rounded-xl overflow-hidden`}>
                                    <div className={`${variant.bgClass} flex items-center justify-center py-14 px-8`}>
                                        <Image
                                            src={variant.src}
                                            alt={`Shelf logo — ${variant.label}`}
                                            width={180}
                                            height={56}
                                            className="h-12 w-auto object-contain"
                                        />
                                    </div>
                                    <div className={`${variant.footerBgClass} px-5 py-3 flex items-center justify-between`}>
                                        <span className={`text-xs ${variant.labelClass}`}>{variant.sublabel}</span>
                                        <a
                                            href={variant.download}
                                            download
                                            className={`inline-flex items-center gap-1.5 text-xs font-medium ${variant.linkClass} transition-colors`}
                                        >
                                            <Download className="h-3 w-3" />
                                            PNG
                                        </a>
                                    </div>
                                </div>
                            ))}
                        </div>
                    </ScrollReveal>
                </section>

                {/* ─── Colors ─── */}
                <section id="colors" className="mb-14 sm:mb-20 scroll-mt-32">
                    <ScrollReveal width="100%">
                        <div className="mb-8">
                            <h2 className="text-2xl font-bold mb-2">Colors</h2>
                            <p className="text-muted-foreground">Click any swatch to copy its hex code.</p>
                        </div>
                        <ColorPalette />
                    </ScrollReveal>
                </section>

                {/* ─── Typography ─── */}
                <section id="typography" className="mb-14 sm:mb-20 scroll-mt-32">
                    <ScrollReveal width="100%">
                        <div className="mb-8">
                            <h2 className="text-2xl font-bold mb-2">Typography</h2>
                            <p className="text-muted-foreground">Our type system uses Geist by Vercel — a modern, geometric sans-serif built for interfaces.</p>
                        </div>

                        <div className="grid md:grid-cols-2 gap-6 md:gap-8">
                            {/* Geist Sans */}
                            <div className="border rounded-xl p-6 sm:p-8">
                                <div className="mb-6">
                                    <p className="text-xs uppercase tracking-widest text-muted-foreground/60 mb-3 font-semibold">Sans Serif</p>
                                    <p className="text-4xl sm:text-5xl font-bold tracking-tight leading-tight">Geist Sans</p>
                                </div>
                                <div className="space-y-3 border-t pt-5">
                                    <p className="text-sm"><span className="text-muted-foreground w-16 inline-block">Regular</span> <span className="font-normal">The quick brown fox jumps over the lazy dog</span></p>
                                    <p className="text-sm"><span className="text-muted-foreground w-16 inline-block">Medium</span> <span className="font-medium">The quick brown fox jumps over the lazy dog</span></p>
                                    <p className="text-sm"><span className="text-muted-foreground w-16 inline-block">Semibold</span> <span className="font-semibold">The quick brown fox jumps over the lazy dog</span></p>
                                    <p className="text-sm"><span className="text-muted-foreground w-16 inline-block">Bold</span> <span className="font-bold">The quick brown fox jumps over the lazy dog</span></p>
                                </div>
                                <div className="mt-5 pt-4 border-t">
                                    <a
                                        href="https://vercel.com/font"
                                        target="_blank"
                                        rel="noopener noreferrer"
                                        className="inline-flex items-center gap-1.5 text-xs font-medium text-orange-600 hover:text-orange-700 transition-colors"
                                    >
                                        <ExternalLink className="h-3 w-3" />
                                        Download from Vercel
                                    </a>
                                </div>
                            </div>

                            {/* Geist Mono */}
                            <div className="border rounded-xl p-6 sm:p-8">
                                <div className="mb-6">
                                    <p className="text-xs uppercase tracking-widest text-muted-foreground/60 mb-3 font-semibold">Monospace</p>
                                    <p className="text-4xl sm:text-5xl font-bold tracking-tight leading-tight font-mono">Geist Mono</p>
                                </div>
                                <div className="space-y-3 border-t pt-5 font-mono">
                                    <p className="text-sm"><span className="text-muted-foreground font-sans w-16 inline-block">Regular</span> <span className="font-normal">The quick brown fox jumps over the lazy dog</span></p>
                                    <p className="text-sm"><span className="text-muted-foreground font-sans w-16 inline-block">Medium</span> <span className="font-medium">The quick brown fox jumps over the lazy dog</span></p>
                                    <p className="text-sm"><span className="text-muted-foreground font-sans w-16 inline-block">Bold</span> <span className="font-bold">The quick brown fox jumps over the lazy dog</span></p>
                                </div>
                                <div className="mt-5 pt-4 border-t text-sm text-muted-foreground">
                                    Used for code snippets, data labels, and technical content.
                                </div>
                            </div>
                        </div>
                    </ScrollReveal>
                </section>

                {/* ─── Usage Guidelines ─── */}
                <section id="usage" className="mb-14 sm:mb-20 scroll-mt-32">
                    <ScrollReveal width="100%">
                        <div className="mb-8">
                            <h2 className="text-2xl font-bold mb-2">Usage Guidelines</h2>
                            <p className="text-muted-foreground">Keep the brand looking sharp. Follow these simple rules when using our assets.</p>
                        </div>

                        <div className="grid md:grid-cols-2 gap-6 md:gap-8">
                            {/* Do */}
                            <div className="border border-emerald-200/60 dark:border-emerald-800/30 rounded-xl p-6 sm:p-8 bg-emerald-50/30 dark:bg-emerald-950/10">
                                <div className="flex items-center gap-2 mb-5">
                                    <div className="flex items-center justify-center w-6 h-6 rounded-full bg-emerald-600 text-white">
                                        <Check className="h-3.5 w-3.5" />
                                    </div>
                                    <h3 className="font-semibold text-emerald-900 dark:text-emerald-300">Do</h3>
                                </div>
                                <ul className="space-y-3">
                                    {DOS.map((item) => (
                                        <li key={item} className="flex items-start gap-2.5 text-sm text-emerald-900/80 dark:text-emerald-200/70">
                                            <Check className="h-4 w-4 text-emerald-600 dark:text-emerald-400 flex-shrink-0 mt-0.5" />
                                            {item}
                                        </li>
                                    ))}
                                </ul>
                            </div>

                            {/* Don't */}
                            <div className="border border-red-200/60 dark:border-red-800/30 rounded-xl p-6 sm:p-8 bg-red-50/30 dark:bg-red-950/10">
                                <div className="flex items-center gap-2 mb-5">
                                    <div className="flex items-center justify-center w-6 h-6 rounded-full bg-red-600 text-white">
                                        <X className="h-3.5 w-3.5" />
                                    </div>
                                    <h3 className="font-semibold text-red-900 dark:text-red-300">Don&apos;t</h3>
                                </div>
                                <ul className="space-y-3">
                                    {DONTS.map((item) => (
                                        <li key={item} className="flex items-start gap-2.5 text-sm text-red-900/80 dark:text-red-200/70">
                                            <X className="h-4 w-4 text-red-600 dark:text-red-400 flex-shrink-0 mt-0.5" />
                                            {item}
                                        </li>
                                    ))}
                                </ul>
                            </div>
                        </div>
                    </ScrollReveal>
                </section>

                {/* ─── Boilerplate ─── */}
                <section id="boilerplate" className="scroll-mt-32">
                    <ScrollReveal width="100%">
                        <div className="mb-8">
                            <h2 className="text-2xl font-bold mb-2">Company Boilerplate</h2>
                            <p className="text-muted-foreground">Copy-ready descriptions for press mentions, partner pages, and directories.</p>
                        </div>

                        <div className="grid md:grid-cols-2 gap-6 md:gap-8">
                            <BoilerplateCard label="Short" wordCount="~30 words" text={BOILERPLATE_SHORT} />
                            <BoilerplateCard label="Long" wordCount="~60 words" text={BOILERPLATE_LONG} />
                        </div>

                        <div className="mt-12 rounded-xl border border-border/60 bg-muted/20 p-6 sm:p-8 text-center">
                            <p className="text-sm text-muted-foreground mb-1">Need something specific?</p>
                            <p className="text-sm text-muted-foreground">
                                For custom assets, co-branding requests, or press inquiries, reach out at{" "}
                                <a href="mailto:hello@shelf.nu" className="text-orange-600 hover:text-orange-700 font-medium transition-colors">
                                    hello@shelf.nu
                                </a>
                            </p>
                        </div>
                    </ScrollReveal>
                </section>
            </Container>
        </>
    );
}

function BoilerplateCard({ label, wordCount, text }: { label: string; wordCount: string; text: string }) {
    return (
        <div className="border rounded-xl p-6 sm:p-8 relative group">
            <div className="flex items-center justify-between mb-4">
                <div>
                    <p className="text-sm font-semibold text-foreground">{label}</p>
                    <p className="text-xs text-muted-foreground">{wordCount}</p>
                </div>
                <CopyButton text={text} />
            </div>
            <p className="text-sm text-muted-foreground leading-relaxed">
                {text}
            </p>
        </div>
    );
}

