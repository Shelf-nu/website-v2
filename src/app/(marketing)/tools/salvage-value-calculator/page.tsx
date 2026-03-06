import { Metadata } from "next";
import Link from "next/link";
import { Container } from "@/components/ui/container";
import { ArrowRight } from "lucide-react";
import { SalvageValueCalculator } from "@/components/tools/salvage-value-calculator";
import { CTA } from "@/components/sections/cta";
import { PagefindWrapper } from "@/components/search/pagefind-wrapper";

export const metadata: Metadata = {
    title: "Free Salvage Value Calculator — Equipment Residual Value Estimator | Shelf",
    description:
        "Estimate equipment salvage value with industry benchmarks for computers, vehicles, furniture, medical equipment, and more. Visual timeline and category comparison. Free, no signup.",
    alternates: {
        canonical: "https://shelf.nu/tools/salvage-value-calculator",
    },
};

export default function SalvageValueCalculatorPage() {
    return (
        <PagefindWrapper
            type="Page"
            title="Free Salvage Value Calculator"
            keywords="salvage value calculator residual value calculator equipment salvage value scrap value"
        >
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
                                Salvage Value{" "}
                                <span className="text-orange-600">
                                    Calculator
                                </span>
                            </h1>
                            <p className="text-xl text-muted-foreground leading-relaxed max-w-2xl mx-auto">
                                Estimate what your equipment will be worth at
                                end of life. Compare across asset categories
                                with industry benchmark rates.
                            </p>
                        </div>
                    </Container>
                </section>

                {/* Tool Section */}
                <section className="pb-20 md:pb-32 -mt-12 relative z-10">
                    <Container>
                        <div className="bg-background rounded-2xl border shadow-xl p-6 md:p-10">
                            <SalvageValueCalculator />
                        </div>
                    </Container>
                </section>

                {/* Educational Content */}
                <section className="pb-24 border-t bg-muted/20">
                    <Container className="pt-24">
                        <div className="grid md:grid-cols-2 gap-16">
                            <div>
                                <h2 className="text-2xl font-bold mb-6">
                                    Understanding Salvage Value
                                </h2>
                                <div className="prose prose-sm text-muted-foreground">
                                    <p>
                                        Salvage value (also called residual
                                        value or scrap value) is the estimated
                                        worth of an asset at the end of its
                                        useful life. It affects how much
                                        depreciation you can claim over the
                                        asset&apos;s lifetime.
                                    </p>
                                    <ul className="mt-4 space-y-3 list-disc list-inside">
                                        <li>
                                            <strong>
                                                Higher salvage value
                                            </strong>{" "}
                                            means lower total depreciation
                                            expense — the asset retains more
                                            value.
                                        </li>
                                        <li>
                                            <strong>Factors that affect it</strong>:
                                            condition, maintenance history,
                                            market demand, technological
                                            obsolescence, and brand reputation.
                                        </li>
                                        <li>
                                            <strong>For tax purposes</strong>,
                                            MACRS assumes zero salvage value —
                                            you recover the full cost. See our{" "}
                                            <Link
                                                href="/tools/macrs-depreciation-calculator"
                                                className="text-orange-600 hover:underline"
                                            >
                                                MACRS Calculator
                                            </Link>
                                            .
                                        </li>
                                        <li>
                                            <strong>For book purposes</strong>,
                                            salvage value reduces the
                                            depreciable base. Use our{" "}
                                            <Link
                                                href="/tools/equipment-depreciation-calculator"
                                                className="text-orange-600 hover:underline"
                                            >
                                                Equipment Depreciation Calculator
                                            </Link>{" "}
                                            for full schedules.
                                        </li>
                                    </ul>
                                </div>
                            </div>

                            <div>
                                <h2 className="text-2xl font-bold mb-6">
                                    Frequently Asked Questions
                                </h2>
                                <div className="space-y-6">
                                    <div>
                                        <h3 className="font-semibold text-foreground mb-2">
                                            How do I estimate salvage value?
                                        </h3>
                                        <p className="text-sm text-muted-foreground">
                                            Check resale markets for similar
                                            equipment at the age you plan to
                                            retire it. Factor in condition,
                                            maintenance, and market demand. Our
                                            category benchmarks provide a
                                            starting point based on industry
                                            averages.
                                        </p>
                                    </div>
                                    <div>
                                        <h3 className="font-semibold text-foreground mb-2">
                                            Can salvage value be zero?
                                        </h3>
                                        <p className="text-sm text-muted-foreground">
                                            Yes. Some assets (especially
                                            technology) may have zero or near-zero
                                            salvage value if they become
                                            obsolete. For MACRS tax
                                            depreciation, salvage value is
                                            always treated as zero.
                                        </p>
                                    </div>
                                    <div>
                                        <h3 className="font-semibold text-foreground mb-2">
                                            What&apos;s the difference between
                                            salvage and scrap value?
                                        </h3>
                                        <p className="text-sm text-muted-foreground">
                                            Salvage value is what the asset is
                                            worth if sold as a working item.
                                            Scrap value is what the raw
                                            materials are worth if the asset is
                                            dismantled. Scrap value is typically
                                            much lower.
                                        </p>
                                    </div>
                                    <div>
                                        <h3 className="font-semibold text-foreground mb-2">
                                            Should I use these benchmarks for
                                            accounting?
                                        </h3>
                                        <p className="text-sm text-muted-foreground">
                                            These benchmarks are estimates based
                                            on general industry data. For
                                            financial statements and tax
                                            filings, consult your accountant who
                                            can consider your specific
                                            equipment, usage patterns, and
                                            applicable standards.
                                        </p>
                                    </div>
                                </div>
                            </div>
                        </div>
                    </Container>
                </section>

                <CTA />
            </div>
        </PagefindWrapper>
    );
}
