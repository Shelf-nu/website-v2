"use client";

import { useState } from "react";
import { Container } from "@/components/ui/container";
import { Card, CardHeader, CardTitle, CardDescription, CardContent, CardFooter } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Switch } from "@/components/ui/switch";
import { Label } from "@/components/ui/label";
import { Check } from "lucide-react";
import { FAQSection } from "@/components/sections/faq";
import { pricingPlans, PricingPlan } from "@/data/pricing";
import { pricingFaqs } from "@/data/pricing-faq";
import { FeatureTable } from "@/components/pricing/feature-table";
import Link from "next/link";
import NumberFlow from '@number-flow/react';
import { TrustedBy } from "@/components/sections/trusted-by";
import { ArrowRight, Quote } from "lucide-react";
import Image from "next/image";

// Curated social proof logos for pricing page (prestigious brands)
const pricingSocialProof = [
    { name: "Chicago Bulls", logo: "/logos/chicago-bulls.png" },
    { name: "Kent State University", logo: "/logos/kent-state.png" },
    { name: "UC Berkeley", logo: "/logos/berkeley.png" },
    { name: "USS Midway Museum", logo: "/logos/uss-midway-museum.png" },
    { name: "University of Missouri", logo: "/logos/university-of-missouri.png" },
];

// Helper to convert structured data back to the list format for the card view
function getDisplayFeatures(plan: PricingPlan): string[] {
    switch (plan.id) {
        case "free":
            return [
                "Unlimited assets",
                "1 user",
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
                "Unlimited user seats",
                "Bookings & reservations",
                "Booking calendar",
                "Fixed checkout & return dates",
                "DIVIDER",
                "External barcode import (add-on)",
                "SSO available (add-on)"
            ];
        case "enterprise":
            return [
                "Everything in Team",
                "Custom agreement",
                "SSO / SAML included",
                "Dedicated hosting (cloud or private)",
                "On-prem / private deployment option",
                "Dedicated account manager & SLA"
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

export default function PricingPage() {
    const [isYearly, setIsYearly] = useState(false);
    const maxSavings = calculateSavings(pricingPlans);

    return (
        <div className="flex min-h-screen flex-col relative overflow-hidden">
            {/* Ambient Background Gradient & Grid */}
            <div className="absolute top-0 inset-x-0 h-[600px] -z-10 bg-[linear-gradient(to_right,#80808012_1px,transparent_1px),linear-gradient(to_bottom,#80808012_1px,transparent_1px)] bg-[size:24px_24px] [mask-image:radial-gradient(ellipse_60%_50%_at_50%_0%,#000_70%,transparent_100%)] pointer-events-none" />
            <div className="absolute top-0 inset-x-0 h-[600px] bg-[radial-gradient(ellipse_at_top,_var(--tw-gradient-stops))] from-orange-50/20 via-background to-background pointer-events-none" />

            <Container className="py-24 md:py-40 relative">
                <div className="mx-auto max-w-2xl text-center mb-10">
                    <Badge variant="secondary" className="mb-4 bg-orange-50 text-orange-700 border-orange-100/50">Pricing</Badge>
                    <h1 className="text-4xl font-bold tracking-tight sm:text-6xl mb-6">
                        Simple, transparent <span className="text-orange-600">pricing</span>
                    </h1>
                    <p className="text-xl text-muted-foreground">
                        No hidden fees. No credit card required to start.
                    </p>
                </div>

                {/* Social Proof Logos */}
                <div className="flex flex-col items-center gap-4 mb-12">
                    <p className="text-xs font-medium text-muted-foreground uppercase tracking-widest">Trusted by innovative teams</p>
                    <div className="flex items-center justify-center gap-8 md:gap-12 flex-wrap">
                        {pricingSocialProof.map((brand) => (
                            <Image
                                key={brand.name}
                                src={brand.logo}
                                alt={brand.name}
                                width={100}
                                height={32}
                                className="h-7 w-auto object-contain grayscale opacity-50 hover:grayscale-0 hover:opacity-100 transition-all duration-300"
                            />
                        ))}
                    </div>
                </div>

                {/* Billing Toggle */}
                <div className="flex items-center justify-center gap-4 mb-16">
                    <Label htmlFor="billing-toggle" className={`text-sm font-medium cursor-pointer ${!isYearly ? 'text-foreground' : 'text-muted-foreground'}`} onClick={() => setIsYearly(false)}>
                        Monthly
                    </Label>
                    <Switch
                        id="billing-toggle"
                        checked={isYearly}
                        onCheckedChange={setIsYearly}
                    />
                    <Label htmlFor="billing-toggle" className={`text-sm font-medium cursor-pointer ${isYearly ? 'text-foreground' : 'text-muted-foreground'}`} onClick={() => setIsYearly(true)}>
                        Yearly <span className="ml-1.5 inline-flex items-center rounded-full bg-orange-100 px-2 py-0.5 text-xs font-semibold text-orange-700">Save {maxSavings}%</span>
                    </Label>
                </div>

                <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4 lg:gap-4 max-w-[1400px] mx-auto pt-8">
                    {pricingPlans.map((plan) => (
                        <Card key={plan.id} className={`flex flex-col relative transition-all duration-300 ${plan.popular ? 'border-orange-500 shadow-2xl shadow-orange-500/10 z-10 bg-white ring-1 ring-orange-500/20' : 'border-zinc-200 hover:border-zinc-300 hover:shadow-lg bg-white/50 hover:bg-white'} rounded-xl overflow-visible`}>

                            {/* Absolute Badge for perfect alignment of cards */}
                            {plan.popular && (
                                <div className="absolute -top-3 left-0 right-0 flex justify-center z-20">
                                    <Badge className="bg-orange-600 text-white border-0 shadow-sm px-4 py-0.5 text-xs font-semibold uppercase tracking-wider rounded-full">
                                        Most Popular
                                    </Badge>
                                </div>
                            )}

                            <CardHeader className="pb-3 pt-6 px-5 space-y-0">
                                <CardTitle className="text-xl font-bold tracking-tight text-zinc-900 leading-tight">
                                    {plan.name}
                                </CardTitle>
                                <CardDescription className="mt-2 text-sm text-zinc-500 leading-normal min-h-[40px] flex items-center">
                                    {plan.description}
                                </CardDescription>
                            </CardHeader>

                            <CardContent className="flex-1 pt-0 px-5">
                                <div className="mb-6 pt-2 pb-2 border-b border-zinc-100">
                                    <div className="flex items-baseline gap-1">
                                        {plan.price === "Custom" ? (
                                            <span className="text-4xl font-extrabold tracking-tight text-zinc-900">Custom</span>
                                        ) : (
                                            <>
                                                <NumberFlow
                                                    value={isYearly ? parseInt(plan.priceYearly.replace('$', '')) : parseInt(plan.priceMonthly.replace('$', ''))}
                                                    format={{ style: 'currency', currency: 'USD', trailingZeroDisplay: 'stripIfInteger' }}
                                                    className="text-4xl font-extrabold tracking-tight text-zinc-900"
                                                />
                                                <span className="text-zinc-500 text-xs font-semibold uppercase ml-1 tracking-wide">
                                                    /{isYearly ? 'year' : 'mo'}
                                                </span>
                                            </>
                                        )}
                                    </div>
                                </div>

                                <ul className="space-y-3">
                                    {getDisplayFeatures(plan).map((feature, idx) => (
                                        feature === "DIVIDER" ? (
                                            <li key={`divider-${idx}`} className="pt-3 border-t border-zinc-200/80 mt-3">
                                                <span className="text-[10px] font-bold text-zinc-400 uppercase tracking-widest block mb-2">Add-ons</span>
                                            </li>
                                        ) : (
                                            <li key={feature} className="flex items-start text-[13px] text-zinc-700 font-medium leading-snug">
                                                <Check className="mr-2.5 h-3.5 w-3.5 text-orange-600 mt-0.5 flex-shrink-0 stroke-[3px]" />
                                                <span>{feature}</span>
                                            </li>
                                        )
                                    ))}
                                </ul>
                            </CardContent>

                            <CardFooter className="pt-2 pb-5 px-5 mt-auto flex flex-col gap-3">
                                <Button className={`w-full h-12 text-base font-semibold shadow-sm ${plan.popular ? 'shadow-orange-500/25' : ''}`} variant={plan.popular ? "default" : "outline"} asChild>
                                    <Link href={plan.href}>
                                        {plan.cta}
                                    </Link>
                                </Button>
                                {plan.secondaryCta && (
                                    <Button className="w-full h-12 text-base font-semibold shadow-sm" variant="outline" asChild>
                                        <Link href={plan.secondaryCta.href}>
                                            {plan.secondaryCta.text}
                                        </Link>
                                    </Button>
                                )}
                            </CardFooter>
                        </Card>
                    ))}
                </div>

                {/* Trusted By Section */}
                <div className="mt-20 mb-20">
                    <TrustedBy />
                </div>

                {/* Testimonial */}
                <div className="mx-auto max-w-2xl text-center mb-20">
                    <Quote className="h-8 w-8 text-orange-500/20 mx-auto mb-4" />
                    <blockquote className="text-lg md:text-xl font-medium text-foreground leading-relaxed tracking-tight mb-4">
                        &ldquo;If you are still using Excel for assets management, you are missing out a lot by not choosing Shelf.&rdquo;
                    </blockquote>
                    <div className="text-sm text-muted-foreground">
                        <span className="font-semibold text-foreground">Tadas Andriuska</span> · IT Administrator at Ovoko
                    </div>
                </div>

                {/* Conversion CTA */}
                <div className="mx-auto max-w-4xl text-center bg-gradient-to-b from-orange-50/50 to-transparent p-12 rounded-3xl border border-orange-100 mb-20">
                    <h3 className="text-3xl font-bold mb-4">Join innovative teams around the world</h3>
                    <p className="text-lg text-muted-foreground mb-8 max-w-2xl mx-auto">
                        Stop using spreadsheets and start tracking your assets with a modern tool that your team will actually enjoy using.
                    </p>
                    <div className="flex flex-col sm:flex-row gap-4 justify-center">
                        <Button size="lg" className="bg-orange-600 hover:bg-orange-700 text-white h-12 px-8 text-base shadow-lg shadow-orange-600/20" asChild>
                            <Link href="https://app.shelf.nu/register">
                                Get Started for Free <ArrowRight className="ml-2 h-5 w-5" />
                            </Link>
                        </Button>
                        <Button size="lg" variant="outline" className="h-12 px-8 text-base" asChild>
                            <Link href="/demo">
                                Book a Demo
                            </Link>
                        </Button>
                    </div>
                </div>

                <div className="max-w-[1400px] mx-auto mt-24">
                    <div className="text-center mb-12">
                        <h2 className="text-3xl font-bold tracking-tight">Compare all features</h2>
                        <p className="mt-4 text-lg text-muted-foreground">Detailed breakdown of what is included in each plan. Learn <Link href="/blog/what-counts-as-an-asset" className="underline underline-offset-4 decoration-muted-foreground/50 hover:text-foreground">how we count assets</Link> or <Link href="/features/integrity" className="underline underline-offset-4 decoration-muted-foreground/50 hover:text-foreground">why audit logs matter</Link>.</p>
                    </div>
                    <FeatureTable />
                </div>

                {/* FAQ Section */}
                {pricingFaqs.length > 0 && (
                    <div className="mt-32">
                        <FAQSection
                            title="Frequently Asked Questions"
                            description="" // Empty description as per original
                            items={pricingFaqs}
                            className="bg-transparent border-none py-0 sm:py-0"
                        />
                    </div>
                )}

                <div className="mt-20 text-center">
                    <p className="text-muted-foreground">
                        Have questions? <Link href="/contact" className="underline underline-offset-4 text-primary">Contact our team</Link>
                    </p>
                </div>
            </Container>
        </div>
    );
}
