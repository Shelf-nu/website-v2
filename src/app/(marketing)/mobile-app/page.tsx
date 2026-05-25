import { Metadata } from "next";
import { Suspense } from "react";
import Image from "next/image";
import { Container } from "@/components/ui/container";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { ScrollReveal } from "@/components/ui/scroll-reveal";
import { FAQSection } from "@/components/sections/faq";
import { WaitlistForm } from "@/components/forms/waitlist-form";
import { PagefindWrapper } from "@/components/search/pagefind-wrapper";
import { AppStoreBadge } from "@/components/ui/app-store-badge";
import { StructuredData } from "@/components/seo/structured-data";
import { ArrowRight, Check, Apple, Smartphone as AndroidIcon } from "lucide-react";
import {
    mobileAppFeatures,
    builtForApp,
    bestOnWeb,
    mobileAppFaqs,
} from "@/data/mobile-app";

const APP_STORE_URL = "https://apps.apple.com/app/id6765639874";

export const metadata: Metadata = {
    title: "Shelf Companion for iPhone — Scan, Audit, Manage Custody on the Floor",
    description:
        "The official iPhone companion for your Shelf workspace. Scan QR codes, run live audits, view assets, manage custody, and handle booking check-in/check-out. Free with any Shelf account.",
    keywords: [
        "shelf companion",
        "shelf ios app",
        "shelf app",
        "shelf mobile app",
        "asset tracking app",
        "qr scanner app",
        "audit app",
    ],
    alternates: { canonical: "https://www.shelf.nu/mobile-app" },
};

/**
 * MobileApplication JSON-LD for Shelf Companion.
 * Linked back to the Shelf SoftwareApplication entity via isPartOf so
 * the two entities are unambiguously related but distinct (the platform
 * vs. the iOS companion app).
 */
const mobileAppSchema = {
    "@context": "https://schema.org",
    "@type": "MobileApplication",
    "@id": "https://www.shelf.nu/mobile-app#shelf-companion-ios",
    name: "Shelf Companion",
    description:
        "Companion app for the Shelf asset management platform. Scan QR codes, run live audits, view assets, manage custody, and check bookings in/out from your iPhone. Requires an existing Shelf account.",
    applicationCategory: "BusinessApplication",
    applicationSubCategory: "Asset Tracking",
    operatingSystem: "iOS 16+",
    url: APP_STORE_URL,
    downloadUrl: APP_STORE_URL,
    softwareVersion: "1.0",
    publisher: { "@id": "https://www.shelf.nu/#organization" },
    isPartOf: { "@id": "https://www.shelf.nu/#shelf-software-application" },
    offers: {
        "@type": "Offer",
        price: "0",
        priceCurrency: "USD",
        url: APP_STORE_URL,
        availability: "https://schema.org/InStock",
    },
};

export default function MobileAppPage() {
    return (
        <PagefindWrapper
            type="Page"
            title="Shelf Companion for iPhone"
            keywords="shelf companion ios app mobile scanner audit custody field"
        >
            <StructuredData data={mobileAppSchema} />

            {/* ============================================================ */}
            {/*  HERO                                                          */}
            {/* ============================================================ */}
            <section className="pt-28 pb-0 sm:pt-36 relative overflow-hidden">
                <div className="absolute inset-0 -z-10 bg-grid-pattern bg-[size:24px_24px] [mask-image:radial-gradient(ellipse_60%_50%_at_50%_0%,#000_70%,transparent_100%)]" />
                <div className="absolute top-0 inset-x-0 h-[600px] bg-[radial-gradient(ellipse_at_top,_var(--tw-gradient-stops))] from-orange-50/30 dark:from-orange-950/20 via-background to-background pointer-events-none" />

                {/* Hand image — absolute, reaches in from top-right on desktop */}
                <div className="hidden lg:block absolute top-0 right-0 w-[560px] xl:w-[650px] 2xl:w-[700px] -translate-y-[8%] translate-x-[12%] pointer-events-none">
                    <div className="relative rotate-[8deg] origin-top-right">
                        <Image
                            src="/images/mobile-app/hero-hand.png"
                            alt="Hand holding an iPhone running Shelf Companion"
                            width={1200}
                            height={1800}
                            className="w-full h-auto"
                            priority
                            unoptimized
                            sizes="(max-width: 1280px) 480px, 550px"
                        />
                    </div>

                    {/* Floating detail elements */}
                    <div className="absolute bottom-[32%] -left-[10%] flex-col gap-3 rotate-[-8deg] hidden xl:flex">
                        <div className="flex items-center gap-2.5 rounded-xl bg-card/80 backdrop-blur-sm border border-border-subtle shadow-lg px-4 py-2.5">
                            <div className="flex h-8 w-8 items-center justify-center rounded-lg bg-green-100 dark:bg-green-950/50">
                                <Check className="h-4 w-4 text-green-600" />
                            </div>
                            <div>
                                <p className="text-xs font-semibold text-heading">Asset scanned</p>
                                <p className="text-[10px] text-muted-foreground">MacBook Pro #0847</p>
                            </div>
                        </div>
                        <div className="flex items-center gap-2.5 rounded-xl bg-card/80 backdrop-blur-sm border border-border-subtle shadow-lg px-4 py-2.5 ml-6">
                            <div className="flex h-8 w-8 items-center justify-center rounded-lg bg-orange-100 dark:bg-orange-950/50">
                                <ArrowRight className="h-4 w-4 text-orange-600" />
                            </div>
                            <div>
                                <p className="text-xs font-semibold text-heading">Custody assigned</p>
                                <p className="text-[10px] text-muted-foreground">→ Sarah Chen</p>
                            </div>
                        </div>
                    </div>
                </div>

                <Container className="relative z-10">
                    <div className="max-w-xl mx-auto lg:mx-0 py-16 lg:py-28 lg:min-h-[75vh] flex flex-col justify-center text-center lg:text-left items-center lg:items-start">
                        <div className="mb-6 inline-flex items-center gap-2 rounded-full border border-orange-200 bg-orange-50/50 px-4 py-1.5 text-sm font-medium text-orange-800 dark:border-orange-800 dark:bg-orange-950/50 dark:text-orange-200">
                            <Apple className="h-3.5 w-3.5" aria-hidden="true" />
                            Now on the App Store
                        </div>
                        <h1 className="text-3xl font-bold tracking-tight text-foreground sm:text-5xl md:text-6xl mb-6 leading-[1.08]">
                            Scan it. Find it. <span className="text-orange-600">Done.</span>
                        </h1>
                        <p className="text-lg leading-relaxed text-muted-foreground mb-8">
                            Shelf Companion is the iPhone app for your Shelf workspace. Scan QR codes, run audits, manage custody, and check bookings in or out — from wherever the work happens. Free with any Shelf account.
                        </p>

                        <div className="flex flex-col sm:flex-row items-center gap-4 w-full sm:w-auto">
                            <AppStoreBadge />
                            <a
                                href="#android-notify"
                                className="text-sm font-medium text-muted-foreground hover:text-foreground transition-colors"
                            >
                                Android? Get notified →
                            </a>
                        </div>

                        <p className="text-xs text-muted-foreground/60 mt-4">
                            Requires iOS 16+. Sign in with the credentials you already use on shelf.nu.
                        </p>

                        {/* Platform indicator — mobile only */}
                        <div className="flex items-center gap-6 mt-8 text-sm text-muted-foreground/70 lg:hidden">
                            <div className="flex items-center gap-2">
                                <Apple className="h-5 w-5" />
                                <span>iPhone — Live</span>
                            </div>
                            <span className="opacity-30">|</span>
                            <div className="flex items-center gap-2">
                                <AndroidIcon className="h-5 w-5" />
                                <span>Android — In development</span>
                            </div>
                        </div>
                    </div>
                </Container>
            </section>

            {/* ============================================================ */}
            {/*  WHAT IT DOES                                                  */}
            {/* ============================================================ */}
            <section className="py-20 sm:py-28 border-t border-border-subtle">
                <Container>
                    <ScrollReveal width="100%">
                        <p className="text-center text-sm font-semibold uppercase tracking-widest text-orange-600 mb-3">
                            What it does
                        </p>
                        <h2 className="text-3xl font-bold tracking-tight text-heading sm:text-4xl text-center mb-4">
                            Everything your field team needs. Nothing they don&apos;t.
                        </h2>
                        <p className="text-center text-muted-foreground max-w-xl mx-auto mb-16">
                            Shelf Companion is the field tool. The web app stays the source of truth for workspaces, configuration, and reporting.
                        </p>
                    </ScrollReveal>

                    <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
                        {mobileAppFeatures.map((feature, i) => (
                            <ScrollReveal key={feature.title} width="100%" delay={0.05 * i} className="h-full">
                                <div className="group relative bg-card border border-border-subtle rounded-xl p-5 h-full hover:border-orange-200 hover:shadow-lg hover:shadow-orange-500/5 transition-all duration-300">
                                    <div className="flex items-start gap-4">
                                        <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-lg bg-orange-50 text-orange-600 dark:bg-orange-950/50 group-hover:bg-orange-100 dark:group-hover:bg-orange-950/80 transition-colors">
                                            <feature.icon className="h-5 w-5" />
                                        </div>
                                        <div>
                                            <h3 className="font-semibold text-heading mb-1">
                                                {feature.title}
                                            </h3>
                                            <p className="text-sm text-body leading-relaxed">
                                                {feature.description}
                                            </p>
                                        </div>
                                    </div>
                                </div>
                            </ScrollReveal>
                        ))}
                    </div>
                </Container>
            </section>

            {/* ============================================================ */}
            {/*  APP vs WEB                                                    */}
            {/* ============================================================ */}
            <section className="py-20 sm:py-28 bg-card border-t border-b border-border-subtle">
                <Container>
                    <ScrollReveal width="100%">
                        <div className="text-center mb-12">
                            <h2 className="text-3xl font-bold tracking-tight text-heading sm:text-4xl mb-4">
                                Designed for the field, not the back office
                            </h2>
                            <p className="text-muted-foreground max-w-xl mx-auto">
                                The companion is a focused field client. Admin work stays on the web, where it belongs.
                            </p>
                        </div>
                    </ScrollReveal>

                    <div className="grid grid-cols-1 md:grid-cols-2 gap-5 max-w-3xl mx-auto">
                        <ScrollReveal width="100%" delay={0.1}>
                            <div className="rounded-xl border border-green-200 dark:border-green-800 bg-green-50/30 dark:bg-green-950/20 p-5">
                                <p className="text-xs font-semibold uppercase tracking-widest text-green-700 dark:text-green-400 mb-4">
                                    Shelf Companion (iOS)
                                </p>
                                <ul className="space-y-2.5">
                                    {builtForApp.map((item) => (
                                        <li key={item} className="flex items-start gap-2.5 text-sm text-body">
                                            <Check className="h-4 w-4 text-green-600 mt-0.5 shrink-0" />
                                            {item}
                                        </li>
                                    ))}
                                </ul>
                            </div>
                        </ScrollReveal>

                        <ScrollReveal width="100%" delay={0.2}>
                            <div className="rounded-xl border border-border-subtle bg-muted/30 p-5">
                                <p className="text-xs font-semibold uppercase tracking-widest text-muted-foreground mb-4">
                                    Shelf web app
                                </p>
                                <ul className="space-y-2.5">
                                    {bestOnWeb.map((item) => (
                                        <li key={item} className="flex items-start gap-2.5 text-sm text-muted-foreground">
                                            <ArrowRight className="h-4 w-4 mt-0.5 shrink-0 opacity-40" />
                                            {item}
                                        </li>
                                    ))}
                                </ul>
                            </div>
                        </ScrollReveal>
                    </div>
                </Container>
            </section>

            {/* ============================================================ */}
            {/*  iOS / Android STATUS                                          */}
            {/* ============================================================ */}
            <section className="py-16 sm:py-24">
                <Container>
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-6 max-w-4xl mx-auto">
                        <ScrollReveal delay={0.1}>
                            <div className="rounded-2xl border border-border bg-card p-8 h-full flex flex-col">
                                <div className="flex items-center gap-3 mb-3">
                                    <Apple className="h-6 w-6 text-foreground" aria-hidden="true" />
                                    <h3 className="text-xl font-bold text-heading">iPhone</h3>
                                    <span className="ml-auto inline-flex items-center rounded-full bg-green-100 dark:bg-green-950/50 px-2.5 py-0.5 text-xs font-semibold text-green-700 dark:text-green-400">
                                        Live
                                    </span>
                                </div>
                                <p className="text-sm text-muted-foreground mb-6 flex-1">
                                    Available in the App Store. Free with any Shelf account. Sign in with your existing credentials — no separate account.
                                </p>
                                <AppStoreBadge />
                            </div>
                        </ScrollReveal>

                        <ScrollReveal delay={0.2}>
                            <div className="rounded-2xl border border-border bg-card p-8 h-full flex flex-col">
                                <div className="flex items-center gap-3 mb-3">
                                    <AndroidIcon className="h-6 w-6 text-foreground" aria-hidden="true" />
                                    <h3 className="text-xl font-bold text-heading">Android</h3>
                                    <span className="ml-auto inline-flex items-center rounded-full bg-muted px-2.5 py-0.5 text-xs font-semibold text-muted-foreground">
                                        In development
                                    </span>
                                </div>
                                <p className="text-sm text-muted-foreground mb-6 flex-1">
                                    We&apos;re building it. No release date yet — we&apos;ll announce it when it&apos;s ready.
                                </p>
                                <Button variant="outline" asChild>
                                    <a href="#android-notify">
                                        Get notified <ArrowRight className="ml-2 h-4 w-4" />
                                    </a>
                                </Button>
                            </div>
                        </ScrollReveal>
                    </div>
                </Container>
            </section>

            {/* ============================================================ */}
            {/*  ANDROID NOTIFY-ME FORM                                        */}
            {/* ============================================================ */}
            <section
                id="android-notify"
                className="py-20 sm:py-28 bg-card border-t border-border-subtle scroll-mt-24"
            >
                <Container>
                    <div className="max-w-2xl mx-auto">
                        <ScrollReveal width="100%">
                            <div className="text-center mb-10">
                                <p className="text-sm font-semibold uppercase tracking-widest text-orange-600 mb-3">
                                    Android
                                </p>
                                <h2 className="text-3xl font-bold tracking-tight text-heading sm:text-4xl mb-4">
                                    Get notified when Shelf for Android lands
                                </h2>
                                <p className="text-muted-foreground leading-relaxed">
                                    The Android companion is in development. No date promised — we&apos;ll email you when it&apos;s ready.
                                </p>
                            </div>
                        </ScrollReveal>

                        <ScrollReveal width="100%" delay={0.1}>
                            <Card className="border-border shadow-lg bg-background">
                                <CardContent className="pt-6">
                                    <Suspense fallback={<div className="h-[300px] animate-pulse rounded-lg bg-muted/50" />}>
                                        <WaitlistForm />
                                    </Suspense>
                                </CardContent>
                            </Card>
                        </ScrollReveal>
                    </div>
                </Container>
            </section>

            {/* ============================================================ */}
            {/*  FAQ                                                          */}
            {/* ============================================================ */}
            <FAQSection
                title="Questions about the app?"
                description="Quick answers about Shelf Companion."
                items={mobileAppFaqs}
            />

            {/* ============================================================ */}
            {/*  BOTTOM CTA                                                    */}
            {/* ============================================================ */}
            <section className="py-24 bg-neutral-950 relative overflow-hidden">
                <div className="absolute inset-0 bg-[url('/noise.png')] opacity-20 mix-blend-overlay" />
                <div className="absolute inset-0 bg-gradient-to-t from-orange-500/10 to-transparent pointer-events-none" />
                <Container className="relative text-center">
                    <ScrollReveal width="100%">
                        <h2 className="text-3xl md:text-5xl font-bold text-white mb-4">
                            Bring Shelf to the floor.
                        </h2>
                        <p className="text-neutral-400 text-lg mb-8 max-w-lg mx-auto">
                            Download Shelf Companion for iPhone. Free with any Shelf account.
                        </p>
                        <AppStoreBadge className="border-white/20 bg-white text-neutral-900 hover:bg-neutral-200 hover:border-white/40" />
                    </ScrollReveal>
                </Container>
            </section>
        </PagefindWrapper>
    );
}
