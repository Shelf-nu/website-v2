import { Metadata } from "next";
import Link from "next/link";
import { Container } from "@/components/ui/container";
import { ArrowRight } from "lucide-react";
import { MacrsDepreciationCalculator } from "@/components/tools/macrs-depreciation-calculator";
import { CTA } from "@/components/sections/cta";
import { PagefindWrapper } from "@/components/search/pagefind-wrapper";

export const metadata: Metadata = {
    title: "Free MACRS Depreciation Calculator — IRS Tables & Tax Savings | Shelf",
    description:
        "Calculate MACRS tax depreciation with official IRS Publication 946 rates. GDS and ADS systems, all property classes (3–20 year), estimated tax savings. Free, no signup.",
    alternates: {
        canonical: "https://www.shelf.nu/tools/macrs-depreciation-calculator",
    },
};

export default function MacrsDepreciationCalculatorPage() {
    const jsonLd = {
        "@context": "https://schema.org",
        "@graph": [
            {
                "@type": "SoftwareApplication",
                "name": "Shelf MACRS Depreciation Calculator",
                "applicationCategory": "FinanceApplication",
                "operatingSystem": "Any",
                "url": "https://www.shelf.nu/tools/macrs-depreciation-calculator",
                "description": "Calculate MACRS tax depreciation with official IRS Publication 946 rates. GDS and ADS systems, all property classes (3–20 year), estimated tax savings.",
                "offers": {
                    "@type": "Offer",
                    "price": "0",
                    "priceCurrency": "USD"
                }
            },
            {
                "@type": "FAQPage",
                "mainEntity": [
                    {
                        "@type": "Question",
                        "name": "Which property class should I choose?",
                        "acceptedAnswer": {
                            "@type": "Answer",
                            "text": "The IRS assigns each type of property to a class. The most common are: 5-year (computers, vehicles, office equipment) and 7-year (office furniture, fixtures, most machinery). See IRS Publication 946 for the complete list."
                        }
                    },
                    {
                        "@type": "Question",
                        "name": "Why does a 5-year property have 6 years of depreciation?",
                        "acceptedAnswer": {
                            "@type": "Answer",
                            "text": "Because of the half-year convention. MACRS assumes the asset was placed in service at the midpoint of Year 1, so you get a half-year of depreciation in Year 1 and the remaining half in Year 6."
                        }
                    },
                    {
                        "@type": "Question",
                        "name": "GDS or ADS — which should I use?",
                        "acceptedAnswer": {
                            "@type": "Answer",
                            "text": "Most businesses should use GDS — it gives you faster deductions. ADS is required in specific situations (listed property used ≤50% for business, tax-exempt property, property used outside the U.S.). If you're unsure, consult your tax advisor."
                        }
                    },
                    {
                        "@type": "Question",
                        "name": "What about Section 179 and bonus depreciation?",
                        "acceptedAnswer": {
                            "@type": "Answer",
                            "text": "Section 179 and bonus depreciation allow you to deduct more in Year 1 (potentially the full cost). This calculator shows standard MACRS schedules without these elections. Consult a tax professional to determine if Section 179 or bonus depreciation applies to your situation."
                        }
                    }
                ]
            }
        ]
    };

    return (
        <PagefindWrapper
            type="Page"
            title="Free MACRS Depreciation Calculator"
            keywords="MACRS depreciation calculator IRS depreciation table tax depreciation MACRS schedule"
        >
            <script
                type="application/ld+json"
                dangerouslySetInnerHTML={{ __html: JSON.stringify(jsonLd) }}
            />
            <div className="min-h-screen font-sans">
                {/* Hero with Grid Pattern */}
                <section className="relative overflow-hidden pt-32 pb-20 md:pt-48 md:pb-32">
                    <div className="absolute top-0 inset-x-0 h-[600px] -z-10 bg-grid-pattern bg-[size:24px_24px] [mask-image:radial-gradient(ellipse_60%_50%_at_50%_0%,#000_70%,transparent_100%)] pointer-events-none" />
                    <div className="absolute top-0 inset-x-0 h-[600px] bg-[radial-gradient(ellipse_at_top,_var(--tw-gradient-stops))] from-orange-50/20 via-background to-background pointer-events-none" />

                    <Container>
                        <div className="max-w-3xl mx-auto text-center">
                            <Link
                                href="/tools"
                                className="inline-flex items-center rounded-full border border-orange-200 bg-orange-50/50 px-3 py-1 text-sm font-medium text-orange-800 backdrop-blur-sm mb-6 hover:bg-orange-100 transition-colors"
                            >
                                <ArrowRight className="h-3 w-3 mr-1 rotate-180" />{" "}
                                Back to Tools
                            </Link>
                            <h1 className="text-4xl md:text-5xl font-bold tracking-tight mb-6 text-foreground">
                                MACRS Depreciation{" "}
                                <span className="text-orange-600">
                                    Calculator
                                </span>
                            </h1>
                            <p className="text-xl text-muted-foreground leading-relaxed max-w-2xl mx-auto">
                                Calculate IRS tax depreciation using MACRS with
                                official Publication 946 rates. See the full
                                recovery schedule and estimated tax savings.
                            </p>
                        </div>
                    </Container>
                </section>

                {/* Tool Section */}
                <section className="pb-20 md:pb-32 -mt-12 relative z-10">
                    <Container>
                        <div className="bg-background rounded-2xl border shadow-xl p-6 md:p-10">
                            <MacrsDepreciationCalculator />
                        </div>
                    </Container>
                </section>

                {/* Educational Content */}
                <section className="pb-24 border-t bg-muted/20">
                    <Container className="pt-24">
                        <div className="grid md:grid-cols-2 gap-16">
                            <div>
                                <h2 className="text-2xl font-bold mb-6">
                                    Understanding MACRS Depreciation
                                </h2>
                                <div className="prose prose-sm text-muted-foreground">
                                    <p>
                                        MACRS (Modified Accelerated Cost
                                        Recovery System) is the standard method
                                        for depreciating business property on
                                        U.S. tax returns. It assigns each asset
                                        to a property class that determines the
                                        recovery period and depreciation rates.
                                    </p>
                                    <ul className="mt-4 space-y-3 list-disc list-inside">
                                        <li>
                                            <strong>GDS</strong> (General
                                            Depreciation System) uses 200%
                                            declining balance switching to
                                            straight-line. This is the default
                                            and gives you faster deductions.
                                        </li>
                                        <li>
                                            <strong>ADS</strong> (Alternative
                                            Depreciation System) uses
                                            straight-line over a longer period.
                                            Required for listed property used
                                            50% or less for business, and for
                                            certain international assets.
                                        </li>
                                        <li>
                                            <strong>Half-year convention</strong>
                                            : MACRS treats all property as
                                            placed in service at the midpoint of
                                            the year, so Year 1 and the final
                                            year each get a half-year of
                                            depreciation.
                                        </li>
                                    </ul>
                                    <p className="mt-6">
                                        For book depreciation methods
                                        (straight-line, declining balance, etc.),
                                        see our{" "}
                                        <Link
                                            href="/tools/equipment-depreciation-calculator"
                                            className="text-orange-600 hover:underline"
                                        >
                                            Equipment Depreciation Calculator
                                        </Link>
                                        .
                                    </p>
                                </div>
                            </div>

                            <div>
                                <h2 className="text-2xl font-bold mb-6">
                                    Frequently Asked Questions
                                </h2>
                                <div className="space-y-6">
                                    <div>
                                        <h3 className="font-semibold text-foreground mb-2">
                                            Which property class should I
                                            choose?
                                        </h3>
                                        <p className="text-sm text-muted-foreground">
                                            The IRS assigns each type of
                                            property to a class. The most common
                                            are: 5-year (computers, vehicles,
                                            office equipment) and 7-year (office
                                            furniture, fixtures, most machinery).
                                            See IRS Publication 946 for the
                                            complete list.
                                        </p>
                                    </div>
                                    <div>
                                        <h3 className="font-semibold text-foreground mb-2">
                                            Why does a 5-year property have 6
                                            years of depreciation?
                                        </h3>
                                        <p className="text-sm text-muted-foreground">
                                            Because of the half-year convention.
                                            MACRS assumes the asset was placed
                                            in service at the midpoint of Year
                                            1, so you get a half-year of
                                            depreciation in Year 1 and the
                                            remaining half in Year 6.
                                        </p>
                                    </div>
                                    <div>
                                        <h3 className="font-semibold text-foreground mb-2">
                                            GDS or ADS — which should I use?
                                        </h3>
                                        <p className="text-sm text-muted-foreground">
                                            Most businesses should use GDS — it
                                            gives you faster deductions. ADS is
                                            required in specific situations
                                            (listed property used ≤50% for
                                            business, tax-exempt property,
                                            property used outside the U.S.). If
                                            you&apos;re unsure, consult your tax
                                            advisor.
                                        </p>
                                    </div>
                                    <div>
                                        <h3 className="font-semibold text-foreground mb-2">
                                            What about Section 179 and bonus
                                            depreciation?
                                        </h3>
                                        <p className="text-sm text-muted-foreground">
                                            Section 179 and bonus depreciation
                                            allow you to deduct more in Year 1
                                            (potentially the full cost). This
                                            calculator shows standard MACRS
                                            schedules without these elections.
                                            Consult a tax professional to
                                            determine if Section 179 or bonus
                                            depreciation applies to your
                                            situation.
                                        </p>
                                    </div>
                                </div>
                            </div>
                        </div>
                    </Container>
                </section>

                {/* Related Solutions */}
                <section className="py-16 border-t border-border/40">
                    <Container>
                        <div className="max-w-3xl mx-auto">
                            <h2 className="text-2xl font-bold text-foreground mb-4">Related Solutions</h2>
                            <p className="text-muted-foreground mb-8">Track the fixed assets you are depreciating with Shelf.</p>
                            <div className="grid sm:grid-cols-2 gap-4">
                                <Link href="/solutions/fixed-asset-tracking" className="group rounded-xl border border-border/50 p-5 hover:border-orange-200 hover:shadow-sm transition-all">
                                    <h3 className="font-semibold text-foreground group-hover:text-orange-600 transition-colors mb-1">Fixed Asset Tracking Software</h3>
                                    <p className="text-sm text-muted-foreground">Track high-value equipment across locations with custody logs and service reminders.</p>
                                </Link>
                                <Link href="/solutions/equipment-management" className="group rounded-xl border border-border/50 p-5 hover:border-orange-200 hover:shadow-sm transition-all">
                                    <h3 className="font-semibold text-foreground group-hover:text-orange-600 transition-colors mb-1">Equipment Management Software</h3>
                                    <p className="text-sm text-muted-foreground">Track, schedule, and maintain equipment across teams and locations.</p>
                                </Link>
                            </div>
                        </div>
                    </Container>
                </section>

                <CTA />
            </div>
        </PagefindWrapper>
    );
}
