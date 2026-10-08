"use client";

import { useState } from "react";
import Image from "next/image";
import Link from "next/link";
import NumberFlow from "@number-flow/react";
import { Check, Smartphone } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Container } from "@/components/ui/container";
import { HeroGlow } from "@/components/ui/ambient-glow";
import { PagefindWrapper } from "@/components/search/pagefind-wrapper";
import { StructuredData } from "@/components/seo/structured-data";
import { AppStoreBadge } from "@/components/ui/app-store-badge";
import { PlayStoreBadge } from "@/components/ui/play-store-badge";
import { AddOnsSection } from "@/components/pricing/addons-section";
import { FeatureTable } from "@/components/pricing/feature-table";
import { G2Badge } from "@/components/sections/g2-badge";
import { QuestionsSection } from "@/components/sections/questions-section";
import { SectionHead } from "@/components/sections/home/section-head";
import { pricingPlans, type PricingPlan } from "@/data/pricing";
import { pricingFaqs } from "@/data/pricing-faq";
import { addOns, formatAddOnPrice } from "@/data/pricing.addons";
import { trackEvent } from "@/lib/analytics";
import { pricingSoftwareApplicationJsonLd } from "@/lib/seo";
import { cn } from "@/lib/utils";

// Curated social proof logos for pricing page (prestigious brands)
const pricingSocialProof = [
    { name: "Chicago Bulls", logo: "/logos/chicago-bulls.webp" },
    { name: "Kent State University", logo: "/logos/kent-state.webp" },
    { name: "UC Berkeley", logo: "/logos/berkeley.webp" },
    { name: "USS Midway Museum", logo: "/logos/uss-midway-museum.webp" },
    { name: "University of Missouri", logo: "/logos/university-of-missouri.webp" },
];

// Helper to convert structured data back to the list format for the card view.
// `isYearly` only affects the Team card's add-on bullets, which carry live
// prices derived from src/data/pricing.addons.ts — never hardcode them here.
function getDisplayFeatures(plan: PricingPlan, isYearly: boolean): string[] {
    switch (plan.id) {
        case "free":
            return [
                "Unlimited assets",
                "1 user (personal workspace)",
                "Locations & sublocations",
                "Assign custody",
                "Kits",
                "Advanced asset index",
                "3 custom fields"
            ];
        case "plus":
            return [
                "Everything in Personal",
                "Unlimited custom fields",
                "Custom field → category mapping",
                "CSV import & export",
                "Email support"
            ];
        case "team":
            return [
                "Everything in Plus",
                "Unlimited team members",
                "Bookings & reservations",
                "Booking calendar & availability",
                "Booking PDFs (pull lists)",
                "DIVIDER",
                ...addOns.map(
                    (addOn) =>
                        `${addOn.name} — ${formatAddOnPrice(addOn, isYearly)}`
                )
            ];
        case "enterprise":
            return [
                "Everything in Team",
                "SSO / SAML / SCIM included",
                "Custom agreement — MSA, DPA, SLA",
                "Dedicated single-tenant hosting available",
                "Compliance docs (HECVAT/VPAT for US education)",
                "Dedicated account manager & SLA",
                "Priority support & onboarding"
            ];
        default:
            return [];
    }
}

// Calculate max savings percentage
function calculateSavings(plans: PricingPlan[]): number {
    let maxSavings = 0;
    plans.forEach(plan => {
        if (plan.priceMonthly && plan.priceYearly && plan.priceMonthly !== "$0" && plan.priceYearly !== "Custom") {
            const monthly = parseInt(plan.priceMonthly.replace(/[^0-9]/g, ''));
            const yearly = parseInt(plan.priceYearly.replace(/[^0-9]/g, ''));
            if (monthly > 0 && yearly > 0) {
                const savings = Math.round((1 - (yearly / (monthly * 12))) * 100);
                if (savings > maxSavings) maxSavings = savings;
            }
        }
    });
    return maxSavings;
}

/** Stable ids for the `question_open` event, derived from the question text. */
const questionId = (q: string) => q.toLowerCase().replace(/[^a-z0-9]+/g, "-").replace(/(^-|-$)/g, "").slice(0, 48);
const pricingQuestions = pricingFaqs.map((faq) => ({ id: questionId(faq.question), question: faq.question, answer: faq.answer }));

export default function PricingPage() {
    // ~88% of visitors never touch the billing toggle, so this default
    // decides which price nearly everyone sees (Team: $30.83/mo yearly
    // vs $67/mo monthly).
    const [isYearly, setIsYearly] = useState(true);
    const maxSavings = calculateSavings(pricingPlans);
    const billing = isYearly ? "yearly" : "monthly";

    return (
        <PagefindWrapper type="Page" title="Pricing - Simple, transparent pricing" keywords="pricing pricing plans shelf pricing plans and pricing price cost how much does shelf cost subscription free plan team plan enterprise plan monthly yearly annual billing">
        <StructuredData data={pricingSoftwareApplicationJsonLd(pricingPlans)} />

        {/* Plans */}
        <section className="relative overflow-x-clip pb-20 pt-24 sm:pb-24 sm:pt-32">
            <div className="absolute inset-x-0 top-0 -z-10 h-[600px] bg-grid-pattern bg-[size:24px_24px] [mask-image:radial-gradient(ellipse_60%_50%_at_50%_0%,#000_70%,transparent_100%)]" />
            <HeroGlow />

            <Container className="relative">
                <div className="mx-auto max-w-2xl text-center">
                    <p className="text-xs font-semibold uppercase tracking-[0.1em] text-orange-600">Pricing</p>
                    <h1 className="mt-3 text-4xl font-bold tracking-tight text-balance text-heading sm:text-6xl">
                        Simple, transparent <span className="text-orange-600">pricing</span>
                    </h1>
                    <p className="mt-5 text-lg leading-relaxed text-pretty text-muted-foreground sm:text-xl">
                        One flat price per workspace — unlimited assets on every plan, unlimited users on Team. Try Team free for 7 days, no credit card required.
                    </p>
                </div>

                {/* Social proof */}
                <div className="mt-10 flex flex-col items-center gap-4">
                    <p className="text-xs font-semibold uppercase tracking-[0.1em] text-muted-foreground">Trusted by innovative teams</p>
                    <div className="flex flex-wrap items-center justify-center gap-8 md:gap-12">
                        {pricingSocialProof.map((brand) => (
                            <Image
                                key={brand.name}
                                src={brand.logo}
                                alt={brand.name}
                                width={100}
                                height={32}
                                className="h-7 w-auto object-contain opacity-60 grayscale transition-all duration-300 hover:opacity-100 hover:grayscale-0 dark:invert dark:brightness-200"
                            />
                        ))}
                    </div>
                    <G2Badge className="mt-2" />
                </div>

                {/* Billing period */}
                <div className="mt-12 flex justify-center">
                    <div role="group" aria-label="Billing period" className="inline-flex items-center gap-1 rounded-full bg-muted/70 p-1 ring-1 ring-border/70">
                        {(["monthly", "yearly"] as const).map((period) => {
                            const selected = (period === "yearly") === isYearly;
                            return (
                                <button
                                    key={period}
                                    type="button"
                                    aria-pressed={selected}
                                    onClick={() => setIsYearly(period === "yearly")}
                                    className={cn(
                                        "inline-flex h-9 items-center rounded-full px-4 text-sm font-medium transition-[background-color,color,box-shadow] duration-150 active:scale-[0.96]",
                                        selected ? "bg-background text-foreground shadow-sm ring-1 ring-border/60" : "text-muted-foreground hover:text-foreground",
                                    )}
                                >
                                    {period === "monthly" ? "Monthly" : "Yearly"}
                                    {period === "yearly" && (
                                        <span className="ml-2 rounded-full bg-orange-100 px-2 py-0.5 text-xs font-semibold text-orange-700 dark:bg-orange-950/50 dark:text-orange-400">
                                            Save up to {maxSavings}%
                                        </span>
                                    )}
                                </button>
                            );
                        })}
                    </div>
                </div>

                {/* Plan cards */}
                <div className="mx-auto mt-10 grid max-w-[1400px] grid-cols-1 gap-5 md:grid-cols-2 xl:grid-cols-4">
                    {pricingPlans.map((plan) => (
                        <div
                            key={plan.id}
                            className={cn(
                                "relative flex flex-col rounded-2xl bg-card p-6",
                                plan.popular ? "shadow-xl shadow-orange-500/10 ring-2 ring-orange-500" : "ring-1 ring-border",
                            )}
                        >
                            {plan.popular && (
                                <span className="absolute -top-3 left-6 rounded-full bg-orange-600 px-3 py-1 text-[11px] font-semibold uppercase tracking-wider text-white shadow-sm">
                                    Most popular
                                </span>
                            )}

                            <h2 className="text-lg font-semibold text-heading">{plan.name}</h2>
                            <p className="mt-1 min-h-10 text-sm leading-snug text-caption">{plan.description}</p>

                            <div className="mt-5 border-b border-border-subtle pb-5">
                                <div className="flex items-baseline gap-1">
                                    {plan.price === "Custom" ? (
                                        <span className="text-4xl font-extrabold tracking-tight text-heading">Custom</span>
                                    ) : (
                                        <>
                                            {/* locales is pinned: without it NumberFlow formats with the
                                                visitor's browser locale, so en-GB saw "US$67", de-DE
                                                "67 $" and fr-FR "67 $US". formatUSD pins en-US for the
                                                same reason. */}
                                            <NumberFlow
                                                value={isYearly ? parseInt(plan.priceYearly.replace('$', '')) / 12 : parseInt(plan.priceMonthly.replace('$', ''))}
                                                locales="en-US"
                                                format={{ style: 'currency', currency: 'USD', maximumFractionDigits: isYearly ? 2 : 0, trailingZeroDisplay: 'stripIfInteger' }}
                                                className="text-4xl font-extrabold tracking-tight text-heading"
                                            />
                                            <span className="ml-1 text-xs font-semibold uppercase tracking-wide text-caption">/mo</span>
                                        </>
                                    )}
                                </div>
                                <p className="mt-1.5 min-h-4 text-xs text-caption">
                                    {plan.price !== "Custom" && isYearly && plan.priceYearly !== "$0" ? `billed annually as ${plan.priceYearly}/yr` : ""}
                                </p>
                            </div>

                            <ul className="mt-5 flex-1 space-y-3">
                                {getDisplayFeatures(plan, isYearly).map((feature, idx) => (
                                    feature === "DIVIDER" ? (
                                        <li key={`divider-${idx}`} className="mt-3 border-t border-border-subtle pt-3">
                                            <span className="block text-[10px] font-bold uppercase tracking-widest text-subtle">Add-ons</span>
                                        </li>
                                    ) : (
                                        <li key={feature} className="flex items-start text-[13px] font-medium leading-snug text-body">
                                            <Check className="mr-2.5 mt-0.5 h-3.5 w-3.5 shrink-0 stroke-[3px] text-orange-600" aria-hidden="true" />
                                            <span>{feature}</span>
                                        </li>
                                    )
                                ))}
                            </ul>

                            <div className="mt-6 flex flex-col gap-3">
                                <Button className={cn("h-12 w-full text-base font-semibold", plan.popular && "bg-orange-600 text-white shadow-md shadow-orange-500/25 hover:bg-orange-700")} variant={plan.popular ? "default" : "outline"} asChild>
                                    <Link href={plan.href} onClick={() => trackEvent("pricing_cta", { plan: plan.id, cta: plan.cta, billing })}>
                                        {plan.cta}
                                    </Link>
                                </Button>
                                {plan.secondaryCta && (
                                    <Button className="h-12 w-full text-base font-semibold" variant="outline" asChild>
                                        <Link href={plan.secondaryCta.href} onClick={() => trackEvent("pricing_cta", { plan: plan.id, cta: plan.secondaryCta!.text, billing })}>
                                            {plan.secondaryCta.text}
                                        </Link>
                                    </Button>
                                )}
                                {/* Trial terms microcopy — Team only; other plans have no trial */}
                                {plan.id === "team" && (
                                    <p className="text-center text-xs text-muted-foreground">7-day free trial · No credit card</p>
                                )}
                            </div>
                        </div>
                    ))}
                </div>

                {/* Add-ons — prices derive from src/data/pricing.addons.ts, which is
                    verified against Stripe. Sits directly under the plan cards because
                    add-ons attach to Team and are where expansion revenue lives. */}
                <AddOnsSection isYearly={isYearly} />

                {/* The app callout earns its place on the store buttons: 47 store clicks
                    in the 90 days to 2026-10-07, against 10 on its text link. One line on
                    desktop; the title stays a link to /mobile-app (a live body link). */}
                <div className="mx-auto mt-12 max-w-5xl">
                    <div className="flex flex-col items-center gap-4 rounded-2xl bg-card p-5 text-center ring-1 ring-border sm:p-6 lg:flex-row lg:gap-6 lg:text-left">
                        <span className="flex h-11 w-11 shrink-0 items-center justify-center rounded-xl bg-orange-50 text-orange-600 dark:bg-orange-950/50">
                            <Smartphone className="h-5 w-5" aria-hidden="true" />
                        </span>
                        <div className="min-w-0 flex-1">
                            <Link href="/mobile-app" className="text-sm font-semibold text-heading transition-colors hover:text-orange-600">
                                Shelf Companion is included with every plan
                            </Link>
                            <p className="mt-0.5 text-sm text-muted-foreground">Scan, audit and check gear in and out on iPhone or Android.</p>
                        </div>
                        <div className="flex shrink-0 flex-col items-center gap-2 sm:flex-row">
                            <AppStoreBadge variant="outline" size="sm" location="pricing_callout" />
                            <PlayStoreBadge variant="outline" size="sm" location="pricing_callout" />
                        </div>
                    </div>
                </div>
            </Container>
        </section>

        {/* Feature comparison */}
        <section className="border-t border-border py-20 sm:py-24">
            <Container>
                <SectionHead eyebrow="Compare" title="Compare all features" lead="Detailed breakdown of what is included in each plan." />
                {/* Out of on-site search: 60-odd rows of feature names made the page so long that
                    "pricing" ranked /pricing #3, behind two blog posts about other tools' pricing.
                    Without the table it is #2 again, and no other suite query moves. */}
                <div className="mx-auto mt-12 max-w-[1400px]" data-pagefind-ignore="all">
                    <FeatureTable />
                </div>
            </Container>
        </section>

        {pricingQuestions.length > 0 && (
            <QuestionsSection
                page="pricing"
                eyebrow="Pricing questions"
                title="Frequently asked questions"
                lead="Plans, add-ons, invoices, discounts and the fine print."
                items={pricingQuestions}
            />
        )}

        <section className="border-t border-border py-12">
            <Container>
                <p className="text-center text-muted-foreground">
                    Have questions? <Link href="/contact" className="font-medium text-foreground underline decoration-border underline-offset-4 hover:text-orange-600 hover:decoration-current">Contact our team</Link>
                </p>
            </Container>
        </section>
        </PagefindWrapper>
    );
}
