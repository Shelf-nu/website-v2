import { Metadata } from "next";
import Link from "next/link";
import { Container } from "@/components/ui/container";
import { ArrowRight } from "lucide-react";
import { EquipmentDepreciationCalculator } from "@/components/tools/equipment-depreciation-calculator";
import { CTA } from "@/components/sections/cta";
import { PagefindWrapper } from "@/components/search/pagefind-wrapper";
import { buildToolPageJsonLd } from "@/lib/tool-jsonld";

const jsonLd = buildToolPageJsonLd({
    name: "Shelf Equipment Depreciation Calculator",
    applicationCategory: "FinanceApplication",
    url: "https://www.shelf.nu/tools/equipment-depreciation-calculator",
    description:
        "Free equipment depreciation calculator — compare 4 methods (straight-line, declining balance, double declining, sum-of-years-digits) with full schedules.",
    faqs: [
        {
            question: "Which depreciation method should I use?",
            answer: "It depends on how your asset loses value. Straight-line works for most cases. Use an accelerated method (declining balance or double declining) for assets that lose value quickly in early years, like technology or vehicles. Toggle 'Compare all methods' above to see the difference.",
        },
        {
            question: "What is salvage value?",
            answer: "Salvage value (also called residual value) is what you expect the equipment to be worth at the end of its useful life. It could be the resale price, scrap value, or trade-in amount. Total depreciation equals purchase price minus salvage value.",
        },
        {
            question: "Is this calculator for tax purposes?",
            answer: "This calculator uses standard accounting depreciation methods. For U.S. tax depreciation, the IRS requires MACRS (Modified Accelerated Cost Recovery System) with specific property classes and recovery periods. Always consult a tax professional for filing decisions.",
        },
        {
            question: "How do I determine useful life?",
            answer: "Useful life is how long you expect to use the equipment before replacing it. Common estimates: computers 3-5 years, vehicles 5-7 years, furniture 7-10 years, heavy equipment 10-15 years. The IRS publishes standard recovery periods for tax purposes.",
        },
    ],
});

export const metadata: Metadata = {
    title: "Free Equipment Depreciation Calculator — 4 Methods Compared | Shelf",
    description:
        "Calculate equipment depreciation using Straight-Line, Declining Balance, Double Declining, or Sum-of-Years methods. Full year-by-year schedule with comparison chart. Free, no signup.",
    alternates: {
        canonical: "https://www.shelf.nu/tools/equipment-depreciation-calculator",
    },
};

export default function EquipmentDepreciationCalculatorPage() {
    return (
        <PagefindWrapper
            type="Page"
            title="Free Equipment Depreciation Calculator"
            keywords="equipment depreciation calculator straight line depreciation declining balance depreciation schedule"
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
                                Equipment Depreciation{" "}
                                <span className="text-orange-600">
                                    Calculator
                                </span>
                            </h1>
                            <p className="text-xl text-muted-foreground leading-relaxed max-w-2xl mx-auto">
                                Calculate how your equipment loses value over
                                time. Compare four depreciation methods
                                side-by-side with a full year-by-year schedule.
                            </p>
                        </div>
                    </Container>
                </section>

                {/* Tool Section */}
                <section className="pb-20 md:pb-32 -mt-12 relative z-10">
                    <Container>
                        <div className="bg-background rounded-2xl border shadow-xl p-6 md:p-10">
                            <EquipmentDepreciationCalculator />
                        </div>
                    </Container>
                </section>

                {/* Educational Content */}
                <section className="pb-24 border-t bg-muted/20">
                    <Container className="pt-24">
                        <div className="grid md:grid-cols-2 gap-16">
                            <div>
                                <h2 className="text-2xl font-bold mb-6">
                                    Understanding Equipment Depreciation
                                </h2>
                                <div className="prose prose-sm text-muted-foreground">
                                    <p>
                                        Depreciation allocates the cost of a
                                        physical asset over its useful life. The
                                        method you choose affects your annual
                                        expense and tax deductions.
                                    </p>
                                    <ul className="mt-4 space-y-3 list-disc list-inside">
                                        <li>
                                            <strong>Straight-Line</strong> is
                                            the simplest: equal expense each
                                            year. Best for assets that lose
                                            value evenly (furniture, fixtures).
                                        </li>
                                        <li>
                                            <strong>Declining Balance</strong>{" "}
                                            front-loads depreciation. Higher
                                            expense in early years, lower later.
                                            Common for vehicles and machinery.
                                        </li>
                                        <li>
                                            <strong>
                                                Double Declining Balance
                                            </strong>{" "}
                                            is the most aggressive accelerated
                                            method. Useful when assets lose
                                            value quickly (computers, phones).
                                        </li>
                                        <li>
                                            <strong>
                                                Sum-of-Years&apos; Digits
                                            </strong>{" "}
                                            is another accelerated method that
                                            falls between straight-line and
                                            double declining in aggressiveness.
                                        </li>
                                    </ul>
                                    <p className="mt-6">
                                        For U.S. tax depreciation, see our{" "}
                                        <Link
                                            href="/tools/macrs-depreciation-calculator"
                                            className="text-orange-600 hover:underline"
                                        >
                                            MACRS Depreciation Calculator
                                        </Link>{" "}
                                        which uses IRS Publication 946 rates.
                                    </p>
                                    <p className="mt-3">
                                        Need to estimate what your equipment
                                        will be worth at end of life? Try our{" "}
                                        <Link
                                            href="/tools/salvage-value-calculator"
                                            className="text-orange-600 hover:underline"
                                        >
                                            Salvage Value Calculator
                                        </Link>{" "}
                                        with industry benchmarks.
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
                                            Which depreciation method should I
                                            use?
                                        </h3>
                                        <p className="text-sm text-muted-foreground">
                                            It depends on how your asset loses
                                            value. Straight-line works for most
                                            cases. Use an accelerated method
                                            (declining balance or double
                                            declining) for assets that lose
                                            value quickly in early years, like
                                            technology or vehicles. Toggle
                                            &ldquo;Compare all methods&rdquo;
                                            above to see the difference.
                                        </p>
                                    </div>
                                    <div>
                                        <h3 className="font-semibold text-foreground mb-2">
                                            What is salvage value?
                                        </h3>
                                        <p className="text-sm text-muted-foreground">
                                            Salvage value (also called residual
                                            value) is what you expect the
                                            equipment to be worth at the end of
                                            its useful life. It could be the
                                            resale price, scrap value, or
                                            trade-in amount. Total depreciation
                                            equals purchase price minus salvage
                                            value.
                                        </p>
                                    </div>
                                    <div>
                                        <h3 className="font-semibold text-foreground mb-2">
                                            Is this calculator for tax
                                            purposes?
                                        </h3>
                                        <p className="text-sm text-muted-foreground">
                                            This calculator uses standard
                                            accounting depreciation methods. For
                                            U.S. tax depreciation, the IRS
                                            requires{" "}
                                            <Link
                                                href="/tools/macrs-depreciation-calculator"
                                                className="text-orange-600 hover:underline"
                                            >
                                                MACRS
                                            </Link>{" "}
                                            (Modified Accelerated Cost Recovery
                                            System) with specific property
                                            classes and recovery periods. Always
                                            consult a tax professional for
                                            filing decisions.
                                        </p>
                                    </div>
                                    <div>
                                        <h3 className="font-semibold text-foreground mb-2">
                                            How do I determine useful life?
                                        </h3>
                                        <p className="text-sm text-muted-foreground">
                                            Useful life is how long you expect
                                            to use the equipment before
                                            replacing it. Common estimates:
                                            computers 3-5 years, vehicles 5-7
                                            years, furniture 7-10 years, heavy
                                            equipment 10-15 years. The IRS
                                            publishes standard recovery periods
                                            for tax purposes.
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
                            <p className="text-muted-foreground mb-8">Track the equipment you are depreciating with Shelf.</p>
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
