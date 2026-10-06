import { Metadata } from "next";
import Image from "next/image";
import { Apple, Check, Download, Globe, Smartphone as AndroidIcon } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Container } from "@/components/ui/container";
import { PagefindWrapper } from "@/components/search/pagefind-wrapper";
import { StructuredData } from "@/components/seo/structured-data";
import { TrackedLink } from "@/components/analytics/tracked-link";
import { AppStoreBadge } from "@/components/ui/app-store-badge";
import { PlayStoreBadge } from "@/components/ui/play-store-badge";
import { QuestionsSection } from "@/components/sections/questions-section";
import { ScanToInstall } from "@/components/mobile/scan-to-install";
import { SectionHead } from "@/components/sections/home/section-head";
import { APP_STORE_URL, COMPANION_SCREENS, type CompanionScreen } from "@/data/companion-screens";
import { mobileAppFeatures, builtForApp, bestOnWeb, mobileAppFaqs } from "@/data/mobile-app";

export const metadata: Metadata = {
    title: "Shelf Companion for iPhone & Android — Scan, Audit, Manage Custody on the Floor",
    description:
        "The official iPhone and Android companion for your Shelf workspace. Optional — the Shelf web app still works in any phone browser, and can be installed as a PWA. Scan QR codes, run live audits, manage custody, and handle booking check-in/check-out. Free with any Shelf account.",
    keywords: [
        "shelf companion",
        "shelf ios app",
        "shelf android app",
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
        "Optional native companion app (iPhone and Android) for the Shelf asset management platform. Scan QR codes, run live audits, view assets, manage custody, and check bookings in/out from your phone. Requires an existing Shelf account. The Shelf web app remains fully usable in any phone browser.",
    applicationCategory: "BusinessApplication",
    applicationSubCategory: "Asset Tracking",
    operatingSystem: "iOS 15.1+, Android",
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

/** Stable ids for the `question_open` event, derived from the question text. */
const questionId = (q: string) => q.toLowerCase().replace(/[^a-z0-9]+/g, "-").replace(/(^-|-$)/g, "").slice(0, 48);
const appQuestions = mobileAppFaqs.map((faq) => ({ id: questionId(faq.question), question: faq.question, answer: faq.answer }));

/** Real app screens in the frame the homepage uses for them. */
function PhonePair({ screens, className }: { screens: CompanionScreen[]; className?: string }) {
    return (
        <div className={className}>
            {/* A single screen is shown at the width one phone takes in a pair, not the width of the pair. */}
            <div className={screens.length > 1 ? "grid grid-cols-2 gap-4 rounded-[28px] bg-surface p-4 ring-1 ring-border sm:gap-5 sm:p-5" : "mx-auto max-w-[260px] rounded-[28px] bg-surface p-4 ring-1 ring-border sm:p-5"}>
                {screens.map((screen) => (
                    <Image key={screen.src} src={screen.src} alt={screen.alt} width={screen.width} height={screen.height} sizes="(max-width: 640px) 45vw, 220px" className="h-auto w-full rounded-[14px] ring-1 ring-black/10" />
                ))}
            </div>
        </div>
    );
}

const moments = [
    { feature: mobileAppFeatures[0], claim: "Point the camera at a label. The asset opens.", screens: [COMPANION_SCREENS.scan, COMPANION_SCREENS.asset] },
    { feature: mobileAppFeatures[1], claim: "Walk the room, scan what is there, note what is not.", screens: [COMPANION_SCREENS.audit, COMPANION_SCREENS.inventory] },
    { feature: mobileAppFeatures[3], claim: "Check a booking out and back in where the gear is.", screens: [COMPANION_SCREENS.booking] },
];
const alsoInTheApp = [mobileAppFeatures[2], mobileAppFeatures[4], mobileAppFeatures[5]];

export default function MobileAppPage() {
    return (
        <PagefindWrapper
            type="Page"
            title="Shelf Companion for iPhone"
            keywords="shelf companion ios app mobile scanner audit custody field pwa browser"
        >
            <StructuredData data={mobileAppSchema} />

            {/* Hero: the real app, not a stock photo */}
            <section className="relative overflow-x-clip border-b border-border pt-24 sm:pt-32">
                <div className="absolute inset-0 -z-10 bg-grid-pattern bg-[size:24px_24px] [mask-image:radial-gradient(ellipse_60%_50%_at_50%_0%,#000_70%,transparent_100%)]" />
                <div className="pointer-events-none absolute inset-x-0 top-0 -z-10 h-[600px] bg-[radial-gradient(ellipse_at_top,_var(--tw-gradient-stops))] from-orange-50/30 via-background to-background dark:from-orange-950/20" />

                <Container className="relative">
                    <div className="grid grid-cols-1 items-center gap-12 pb-16 lg:grid-cols-[minmax(0,7fr)_minmax(0,5fr)] lg:gap-16 lg:pb-24">
                        <div className="mx-auto flex max-w-xl flex-col items-center text-center lg:mx-0 lg:items-start lg:text-left">
                            <span className="mb-6 inline-flex items-center gap-2 rounded-full border border-orange-200 bg-orange-50/50 px-4 py-1.5 text-sm font-medium text-orange-800 dark:border-orange-800 dark:bg-orange-950/30 dark:text-orange-200">
                                <Download className="h-3.5 w-3.5" aria-hidden="true" />
                                Now on the App Store &amp; Google Play
                            </span>
                            <h1 className="mb-6 text-3xl font-bold leading-[1.08] tracking-tight text-balance text-foreground sm:text-5xl md:text-6xl">
                                Scan it. Find it. <span className="text-orange-600">Done.</span>
                            </h1>
                            <p className="mb-8 text-lg leading-relaxed text-pretty text-muted-foreground">
                                Shelf Companion is a native app — for iPhone and Android — that pairs with your Shelf workspace. Scan QR codes, run audits, manage custody, and check bookings in or out — from wherever the work happens. Free with any Shelf account. Optional — the Shelf web app still works in any modern phone browser, with PWA install if you want a home-screen icon.
                            </p>

                            <div className="flex w-full flex-col items-center gap-3 sm:w-auto lg:items-start">
                                <div className="flex flex-col items-center gap-3 sm:flex-row">
                                    <AppStoreBadge location="mobile_app_hero" />
                                    <PlayStoreBadge location="mobile_app_hero" />
                                </div>
                                <a href="#three-ways" className="text-sm font-medium text-muted-foreground transition-colors hover:text-foreground">
                                    See all three options →
                                </a>
                            </div>

                            {/* Reading on a desktop? The store badges would open the store on the wrong device. */}
                            <ScanToInstall className="mt-8 hidden lg:flex" />

                            {/* Most visitors here already use Shelf and want the app or the login. */}
                            <p className="mt-6 text-sm text-muted-foreground">
                                Already using Shelf?{" "}
                                <a href="https://app.shelf.nu/login" className="font-medium text-orange-600 underline underline-offset-2 hover:text-orange-700">
                                    Log in to your workspace
                                </a>
                            </p>
                            <p className="mt-3 text-xs text-muted-foreground">
                                On iPhone (iOS 15.1+) and Android. Sign in with the credentials you already use on shelf.nu — including SSO.
                            </p>
                        </div>

                        <PhonePair screens={[COMPANION_SCREENS.scan, COMPANION_SCREENS.asset]} className="mx-auto w-full max-w-md" />
                    </div>
                </Container>
            </section>

            {/* Three ways: optional, not required */}
            <section id="three-ways" className="scroll-mt-24 border-b border-border bg-surface py-20 sm:py-24">
                <Container>
                    <SectionHead
                        eyebrow="Optional, not required"
                        title="Three ways to use Shelf on your phone"
                        lead="Shelf Companion is one option, not a requirement. The web app works in any modern phone browser, and you can install it as a Progressive Web App on your home screen. Pick whichever fits how your team works."
                    />

                    <div className="mx-auto mt-12 grid max-w-5xl grid-cols-1 gap-5 md:grid-cols-3">
                        <div className="flex h-full flex-col rounded-2xl bg-card p-6 ring-1 ring-border">
                            <span className="mb-4 flex h-10 w-10 items-center justify-center rounded-lg bg-blue-50 text-blue-700 dark:bg-blue-950/50 dark:text-blue-300">
                                <Globe className="h-5 w-5" aria-hidden="true" />
                            </span>
                            <h3 className="mb-2 font-semibold text-heading">In any phone browser</h3>
                            <p className="mb-4 flex-1 text-sm leading-relaxed text-body">
                                Open <strong>shelf.nu</strong> in your phone browser. Full Shelf — bookings, custody, audits, scanning. Nothing to install.
                            </p>
                            <p className="text-xs font-semibold uppercase tracking-widest text-muted-foreground">Always available</p>
                        </div>
                        <div className="flex h-full flex-col rounded-2xl bg-card p-6 ring-1 ring-border">
                            <span className="mb-4 flex h-10 w-10 items-center justify-center rounded-lg bg-purple-50 text-purple-700 dark:bg-purple-950/50 dark:text-purple-300">
                                <Download className="h-5 w-5" aria-hidden="true" />
                            </span>
                            <h3 className="mb-2 font-semibold text-heading">Install as a PWA</h3>
                            <p className="mb-4 flex-1 text-sm leading-relaxed text-body">
                                Add the Shelf web app to your home screen for a native-feeling icon and fullscreen experience. Same web app, app-like feel.
                            </p>
                            <p className="text-xs font-semibold uppercase tracking-widest text-muted-foreground">iOS and Android</p>
                        </div>
                        <div className="flex h-full flex-col rounded-2xl bg-card p-6 shadow-xl shadow-orange-500/10 ring-2 ring-orange-500">
                            <span className="mb-4 flex h-10 w-10 items-center justify-center rounded-lg bg-orange-100 text-orange-700 dark:bg-orange-900/50 dark:text-orange-200">
                                <AndroidIcon className="h-5 w-5" aria-hidden="true" />
                            </span>
                            <h3 className="mb-2 font-semibold text-heading">Shelf Companion app</h3>
                            <p className="mb-4 flex-1 text-sm leading-relaxed text-body">
                                Native iPhone and Android app focused on field scanning, audits, custody, and bookings. Faster on the floor than the browser.
                            </p>
                            <p className="text-xs font-semibold uppercase tracking-widest text-orange-700 dark:text-orange-400">iOS and Android</p>
                        </div>
                    </div>

                    <p className="mx-auto mt-8 max-w-xl text-center text-sm text-muted-foreground">
                        Many teams use a mix — admins on web, field crews on Shelf Companion. Same workspace, same data, same login.
                    </p>
                </Container>
            </section>

            {/* What it does, shown on the real screens */}
            <section className="py-20 sm:py-24">
                <Container>
                    <SectionHead
                        eyebrow="What it does"
                        title="Everything your field team needs. Nothing they don't."
                        lead="Shelf Companion is the field tool. The web app stays the source of truth for workspaces, configuration, and reporting."
                    />

                    <div className="mt-16 space-y-20">
                        {moments.map((moment, i) => (
                            <div key={moment.feature.title} className="grid grid-cols-1 items-center gap-10 lg:grid-cols-[minmax(0,5fr)_minmax(0,7fr)] lg:gap-16">
                                <PhonePair screens={moment.screens} className={i % 2 === 1 ? "mx-auto w-full max-w-md lg:order-2 lg:justify-self-end" : "mx-auto w-full max-w-md"} />
                                <div className={i % 2 === 1 ? "lg:order-1" : ""}>
                                    <p className="text-xs font-semibold uppercase tracking-[0.1em] text-orange-600">{moment.feature.title}</p>
                                    <h3 className="mt-3 text-2xl font-bold tracking-tight text-balance text-heading sm:text-3xl">{moment.claim}</h3>
                                    <p className="mt-4 text-base leading-relaxed text-body">{moment.feature.description}</p>
                                </div>
                            </div>
                        ))}
                    </div>

                    <div className="mt-20 grid grid-cols-1 gap-5 sm:grid-cols-3">
                        {alsoInTheApp.map((feature) => (
                            <div key={feature.title} className="rounded-2xl bg-card p-5 ring-1 ring-border">
                                <span className="flex h-10 w-10 items-center justify-center rounded-lg bg-orange-50 text-orange-600 dark:bg-orange-950/50">
                                    <feature.icon className="h-5 w-5" aria-hidden="true" />
                                </span>
                                <h3 className="mt-4 font-semibold text-heading">{feature.title}</h3>
                                <p className="mt-1.5 text-sm leading-relaxed text-body">{feature.description}</p>
                            </div>
                        ))}
                    </div>
                </Container>
            </section>

            {/* App or web: the same workspace, picked by the moment, not a ranking */}
            <section className="border-y border-border bg-surface py-20 sm:py-24">
                <Container>
                    <SectionHead
                        eyebrow="App or web?"
                        title="One workspace, two ways in."
                        lead="The web app is the whole product. Shelf Companion is the part of it you want in your hand. Same workspace, same data, same login."
                    />
                    <div className="mx-auto mt-12 grid max-w-4xl grid-cols-1 gap-5 md:grid-cols-2">
                        {[
                            { Icon: Globe, when: "At the desk", name: "Shelf web app", items: bestOnWeb },
                            { Icon: AndroidIcon, when: "On the floor", name: "Shelf Companion", items: builtForApp },
                        ].map((surface) => (
                            <div key={surface.name} className="rounded-2xl bg-card p-6 ring-1 ring-border sm:p-7">
                                <div className="flex items-center gap-3">
                                    <span className="flex h-10 w-10 items-center justify-center rounded-lg bg-orange-50 text-orange-600 dark:bg-orange-950/50 dark:text-orange-300">
                                        <surface.Icon className="h-5 w-5" aria-hidden="true" />
                                    </span>
                                    <div>
                                        <p className="text-xs font-semibold uppercase tracking-[0.1em] text-orange-600">{surface.when}</p>
                                        <h3 className="text-lg font-semibold text-heading">{surface.name}</h3>
                                    </div>
                                </div>
                                <ul className="mt-6 space-y-3">
                                    {surface.items.map((item) => (
                                        <li key={item} className="flex gap-3 text-sm leading-snug text-heading">
                                            <Check className="mt-0.5 h-4 w-4 shrink-0 text-orange-600" strokeWidth={2.5} aria-hidden="true" />
                                            {item}
                                        </li>
                                    ))}
                                </ul>
                            </div>
                        ))}
                    </div>
                </Container>
            </section>

            {/* iOS / Android */}
            <section className="py-20 sm:py-24">
                <Container>
                    <div className="mx-auto grid max-w-4xl grid-cols-1 gap-5 md:grid-cols-2">
                        {[
                            { Icon: Apple, name: "iPhone", text: "Available in the App Store. Free with any Shelf account. Sign in with your existing credentials — no separate account.", badge: <AppStoreBadge location="mobile_app_platforms" /> },
                            { Icon: AndroidIcon, name: "Android", text: "Available on Google Play. Free with any Shelf account. Sign in with your existing credentials — no separate account.", badge: <PlayStoreBadge location="mobile_app_platforms" /> },
                        ].map((platform) => (
                            <div key={platform.name} className="flex h-full flex-col rounded-2xl bg-card p-8 ring-1 ring-border">
                                <div className="mb-3 flex items-center gap-3">
                                    <platform.Icon className="h-6 w-6 text-foreground" aria-hidden="true" />
                                    <h3 className="text-xl font-bold text-heading">{platform.name}</h3>
                                    <span className="ml-auto inline-flex items-center rounded-full bg-green-100 px-2.5 py-0.5 text-xs font-semibold text-green-700 dark:bg-green-950/50 dark:text-green-400">Live</span>
                                </div>
                                <p className="mb-6 flex-1 text-sm text-muted-foreground">{platform.text}</p>
                                {platform.badge}
                            </div>
                        ))}
                    </div>

                    {/* The evaluator minority: the app needs a Shelf account first. */}
                    <div className="mx-auto mt-5 max-w-4xl rounded-2xl bg-surface px-8 py-8 text-center ring-1 ring-border">
                        <h2 className="text-2xl font-bold tracking-tight text-heading">New to Shelf?</h2>
                        <p className="mx-auto mt-3 max-w-xl text-muted-foreground">
                            Shelf Companion pairs with any Shelf workspace. Create an account first, then sign in on the app with the same credentials. Free for individuals, no credit card.
                        </p>
                        <Button size="lg" className="mt-6 bg-orange-600 text-white hover:bg-orange-700" asChild>
                            <TrackedLink href="https://app.shelf.nu/join?utm_source=shelf_website&utm_medium=cta&utm_content=mobile_app_signup" eventName="signup_click" eventProps={{ location: "mobile_app_page" }}>
                                Create your free account
                            </TrackedLink>
                        </Button>
                    </div>
                </Container>
            </section>

            <QuestionsSection
                page="mobile-app"
                eyebrow="Questions about the app"
                title="Questions about the app?"
                lead="Quick answers about Shelf Companion."
                items={appQuestions}
            />

            {/* Bottom CTA */}
            <section className="relative overflow-hidden bg-neutral-950 py-20 sm:py-24">
                <div className="pointer-events-none absolute inset-0 bg-gradient-to-t from-orange-500/10 to-transparent" />
                <Container className="relative text-center">
                    <h2 className="text-3xl font-bold tracking-tight text-balance text-white md:text-5xl">Bring Shelf to the floor.</h2>
                    <p className="mx-auto mt-4 max-w-lg text-lg text-neutral-400">
                        Download Shelf Companion for iPhone or Android — or keep using Shelf in any phone browser. Same workspace, same data, your choice.
                    </p>
                    <div className="mt-8 flex flex-col items-center justify-center gap-3 sm:flex-row">
                        <AppStoreBadge location="mobile_app_bottom" className="border-neutral-800 bg-neutral-900/50 text-white hover:bg-neutral-900 hover:text-white" variant="outline" />
                        <PlayStoreBadge location="mobile_app_bottom" className="border-neutral-800 bg-neutral-900/50 text-white hover:bg-neutral-900 hover:text-white" variant="outline" />
                    </div>
                    <p className="mt-6 text-sm text-neutral-500">
                        Prefer the App Store page? <a href={APP_STORE_URL} target="_blank" rel="noopener noreferrer" className="font-medium text-white underline decoration-white/35 underline-offset-4 hover:decoration-white">Shelf Companion on the App Store</a>
                    </p>
                </Container>
            </section>
        </PagefindWrapper>
    );
}
