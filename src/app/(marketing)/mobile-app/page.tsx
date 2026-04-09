import { Metadata } from "next";
import { Suspense } from "react";
import Image from "next/image";
import { Container } from "@/components/ui/container";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { ScrollReveal } from "@/components/ui/scroll-reveal";
import { FAQSection } from "@/components/sections/faq";
import { TrackedLink } from "@/components/analytics/tracked-link";
import { QuickWaitlistForm, WaitlistForm } from "@/components/forms/waitlist-form";
import { PagefindWrapper } from "@/components/search/pagefind-wrapper";
import { ArrowRight, Check, Apple, Smartphone as AndroidIcon } from "lucide-react";
import {
    mobileAppFeatures,
    builtForApp,
    bestOnWeb,
    mobileAppFaqs,
} from "@/data/mobile-app";

export const metadata: Metadata = {
    title: "Shelf App — Asset Scanning, Audits & Custody on the Go",
    description:
        "Scan QR codes, run field audits, and manage asset custody right from your phone. Join the beta waitlist to get early access to the Shelf mobile app for iOS & Android.",
    keywords: [
        "shelf app",
        "shelf mobile app",
        "asset tracking app",
        "inventory scanner app",
        "shelf app android",
        "shelf app ios",
    ],
    alternates: { canonical: "https://www.shelf.nu/mobile-app" },
};

export default function MobileAppPage() {
    return (
        <PagefindWrapper
            type="Page"
            title="Shelf Mobile App — Asset Scanning, Audits & Custody on the Go"
            keywords="shelf app mobile app ios android scanner audit custody field"
        >
            {/* ============================================================ */}
            {/*  HERO — Split layout, hand reaches in from top-right          */}
            {/* ============================================================ */}
            <section className="pt-28 pb-0 sm:pt-36 relative overflow-hidden">
                <div className="absolute inset-0 -z-10 bg-grid-pattern bg-[size:24px_24px] [mask-image:radial-gradient(ellipse_60%_50%_at_50%_0%,#000_70%,transparent_100%)]" />
                <div className="absolute top-0 inset-x-0 h-[600px] bg-[radial-gradient(ellipse_at_top,_var(--tw-gradient-stops))] from-orange-50/30 dark:from-orange-950/20 via-background to-background pointer-events-none" />

                {/* Hand image — absolutely positioned, reaches in from top-right */}
                <div className="hidden lg:block absolute top-0 right-0 w-[560px] xl:w-[650px] 2xl:w-[700px] -translate-y-[8%] translate-x-[12%] pointer-events-none">
                    <div className="relative rotate-[8deg] origin-top-right">
                        <Image
                            src="/images/mobile-app/hero-hand.png"
                            alt="Hand holding a smartphone"
                            width={1200}
                            height={1800}
                            className="w-full h-auto"
                            priority
                            unoptimized
                            sizes="(max-width: 1280px) 480px, 550px"
                        />
                    </div>

                    {/* Floating detail elements alongside the phone */}
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
                            <span className="relative flex h-2 w-2">
                                <span className="absolute inline-flex h-full w-full animate-ping rounded-full bg-orange-400 opacity-75" />
                                <span className="relative inline-flex h-2 w-2 rounded-full bg-orange-500" />
                            </span>
                            Beta testing starting soon
                        </div>
                        <h1 className="text-3xl font-bold tracking-tight text-foreground sm:text-5xl md:text-6xl mb-6 leading-[1.08]">
                            Shelf is coming to{" "}
                            <span className="text-orange-600">your pocket.</span>
                        </h1>
                        <p className="text-lg leading-relaxed text-muted-foreground mb-8">
                            Scan assets, run audits, manage custody — from the field.
                            Be the first to test the Shelf mobile app and help us shape it.
                        </p>
                        <div className="w-full max-w-md">
                            <Suspense fallback={<div className="h-12 animate-pulse rounded-lg bg-muted/50" />}>
                                <QuickWaitlistForm />
                            </Suspense>
                            <p className="text-xs text-muted-foreground/60 mt-3">
                                iOS &amp; Android. Free for beta testers. No spam, ever.
                            </p>
                        </div>

                        {/* Platform badges — mobile only (desktop sees the hand image) */}
                        <div className="flex items-center gap-6 mt-8 text-sm text-muted-foreground/70 lg:hidden">
                            <div className="flex items-center gap-2">
                                <Apple className="h-5 w-5" />
                                <span>iPhone</span>
                            </div>
                            <span className="opacity-30">|</span>
                            <div className="flex items-center gap-2">
                                <AndroidIcon className="h-5 w-5" />
                                <span>Android</span>
                            </div>
                        </div>
                    </div>
                </Container>
            </section>

            {/* ============================================================ */}
            {/*  WHAT YOU CAN DO — Tight feature strip                       */}
            {/* ============================================================ */}
            <section className="py-20 sm:py-28 border-t border-border-subtle">
                <Container>
                    <ScrollReveal width="100%">
                        <p className="text-center text-sm font-semibold uppercase tracking-widest text-orange-600 mb-3">
                            What you can do
                        </p>
                        <h2 className="text-3xl font-bold tracking-tight text-heading sm:text-4xl text-center mb-4">
                            Everything your field team needs. Nothing they don&apos;t.
                        </h2>
                        <p className="text-center text-muted-foreground max-w-xl mx-auto mb-16">
                            The Shelf app is your field tool. The web app is your command center.
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
            {/*  EXPECTATIONS — Compact comparison                            */}
            {/* ============================================================ */}
            <section className="py-20 sm:py-28 bg-card border-t border-b border-border-subtle">
                <Container>
                    <ScrollReveal width="100%">
                        <div className="text-center mb-12">
                            <h2 className="text-3xl font-bold tracking-tight text-heading sm:text-4xl mb-4">
                                Designed for the field, not the back office
                            </h2>
                        </div>
                    </ScrollReveal>

                    <div className="grid grid-cols-1 md:grid-cols-2 gap-5 max-w-3xl mx-auto">
                        <ScrollReveal width="100%" delay={0.1}>
                            <div className="rounded-xl border border-green-200 dark:border-green-800 bg-green-50/30 dark:bg-green-950/20 p-5">
                                <p className="text-xs font-semibold uppercase tracking-widest text-green-700 dark:text-green-400 mb-4">
                                    The app
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
                                    The web app
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
            {/*  PLATFORMS — App Store & Play Store with timeline              */}
            {/* ============================================================ */}
            <section className="py-16 sm:py-24">
                <Container>
                    <ScrollReveal width="100%">
                        <div className="text-center mb-10">
                            <h2 className="text-2xl font-bold text-heading sm:text-3xl mb-3">
                                Yes, it&apos;s coming to Android too.
                            </h2>
                            <p className="text-muted-foreground leading-relaxed max-w-lg mx-auto">
                                We know &quot;when is Shelf coming to Android&quot; is one of our most searched questions.
                                Available for iPhone and Android devices.
                            </p>
                        </div>
                    </ScrollReveal>

                    <div className="flex flex-col sm:flex-row items-center justify-center gap-4 sm:gap-5">
                        <ScrollReveal delay={0.1}>
                            <div className="relative group">
                                <Image
                                    src="/images/mobile-app/app-store-badge.svg"
                                    alt="Download on the App Store"
                                    width={150}
                                    height={50}
                                    className="h-[50px] w-auto opacity-80 grayscale-[30%] group-hover:opacity-100 group-hover:grayscale-0 transition-all duration-300"
                                    unoptimized
                                />
                                <span className="absolute -top-2 -right-2 rounded-full bg-orange-600 px-2 py-0.5 text-[9px] font-bold text-white shadow-sm">
                                    BETA SOON
                                </span>
                            </div>
                        </ScrollReveal>

                        <ScrollReveal delay={0.2}>
                            <div className="relative group">
                                <Image
                                    src="/images/mobile-app/google-play-badge.svg"
                                    alt="Get it on Google Play"
                                    width={168}
                                    height={50}
                                    className="h-[50px] w-auto opacity-80 grayscale-[30%] group-hover:opacity-100 group-hover:grayscale-0 transition-all duration-300"
                                    unoptimized
                                />
                                <span className="absolute -top-2 -right-2 rounded-full bg-muted border border-border-subtle px-2 py-0.5 text-[9px] font-bold text-muted-foreground shadow-sm">
                                    COMING NEXT
                                </span>
                            </div>
                        </ScrollReveal>
                    </div>
                </Container>
            </section>

            {/* ============================================================ */}
            {/*  FOUNDING TESTER — Full form with framing                     */}
            {/* ============================================================ */}
            <section id="waitlist" className="py-20 sm:py-28 bg-card border-t border-border-subtle scroll-mt-24">
                <Container>
                    <div className="max-w-5xl mx-auto">
                        <div className="grid grid-cols-1 lg:grid-cols-2 gap-12 lg:gap-16 items-start">
                            {/* Left — Why join */}
                            <ScrollReveal width="100%">
                                <div className="lg:sticky lg:top-32">
                                    <p className="text-sm font-semibold uppercase tracking-widest text-orange-600 mb-3">
                                        Founding testers
                                    </p>
                                    <h2 className="text-3xl font-bold tracking-tight text-heading sm:text-4xl mb-6">
                                        Help us build the app you&apos;ll actually use.
                                    </h2>
                                    <p className="text-muted-foreground leading-relaxed mb-8">
                                        We&apos;re not just launching an app — we&apos;re building it with our users.
                                        As a founding tester, you get early access, a direct line to the team,
                                        and your feedback shapes what ships.
                                    </p>

                                    <ul className="space-y-4">
                                        {[
                                            { title: "Early access", desc: "Be first to test new features before anyone else." },
                                            { title: "Direct feedback", desc: "Report issues and request features — we're listening." },
                                            { title: "Shape the product", desc: "Your real-world usage drives what we build next." },
                                        ].map((item) => (
                                            <li key={item.title} className="flex items-start gap-3">
                                                <div className="flex h-6 w-6 shrink-0 items-center justify-center rounded-full bg-orange-100 dark:bg-orange-950/50 mt-0.5">
                                                    <Check className="h-3.5 w-3.5 text-orange-600" />
                                                </div>
                                                <div>
                                                    <span className="font-medium text-heading">{item.title}</span>
                                                    <span className="text-muted-foreground"> — {item.desc}</span>
                                                </div>
                                            </li>
                                        ))}
                                    </ul>
                                </div>
                            </ScrollReveal>

                            {/* Right — Full form */}
                            <ScrollReveal width="100%" delay={0.1}>
                                <Card className="border-border shadow-2xl bg-background">
                                    <CardContent className="pt-6">
                                        <Suspense fallback={<div className="h-[400px] animate-pulse rounded-lg bg-muted/50" />}>
                                            <WaitlistForm />
                                        </Suspense>
                                    </CardContent>
                                </Card>
                            </ScrollReveal>
                        </div>
                    </div>
                </Container>
            </section>

            {/* ============================================================ */}
            {/*  FAQ                                                          */}
            {/* ============================================================ */}
            <FAQSection
                title="Questions?"
                description="Quick answers about the Shelf mobile app."
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
                            Ready to take Shelf to the field?
                        </h2>
                        <p className="text-neutral-400 text-lg mb-8 max-w-lg mx-auto">
                            Join the founding testers. Get early access. Help us build it right.
                        </p>
                        <Button
                            size="lg"
                            variant="secondary"
                            className="bg-white text-neutral-900 hover:bg-neutral-200 h-12 px-8"
                            asChild
                        >
                            <TrackedLink
                                href="#waitlist"
                                eventName="signup_click"
                                eventProps={{ location: "mobile_app_bottom_cta" }}
                            >
                                Become a Founding Tester <ArrowRight className="ml-2 h-4 w-4" />
                            </TrackedLink>
                        </Button>
                    </ScrollReveal>
                </Container>
            </section>
        </PagefindWrapper>
    );
}
