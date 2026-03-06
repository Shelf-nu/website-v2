import { Metadata } from "next";
import Link from "next/link";
import { Container } from "@/components/ui/container";
import { ArrowRight } from "lucide-react";
import { AssetRoiCalculator } from "@/components/tools/asset-roi-calculator";
import { CTA } from "@/components/sections/cta";
import { PagefindWrapper } from "@/components/search/pagefind-wrapper";

export const metadata: Metadata = {
    title: "Free Asset Tracking ROI Calculator — Cost of Poor Equipment Management | Shelf",
    description:
        "Calculate the annual cost of poor asset tracking: ghost assets, productivity loss, shrinkage, and duplicate purchases. Compare with Shelf to see your ROI. Free, no signup.",
    alternates: {
        canonical: "https://shelf.nu/tools/asset-roi-calculator",
    },
};

export default function AssetRoiCalculatorPage() {
    return (
        <PagefindWrapper
            type="Page"
            title="Asset Tracking ROI Calculator"
            keywords="asset tracking ROI calculator equipment tracking savings cost of lost equipment"
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
                                Asset Tracking{" "}
                                <span className="text-orange-600">
                                    ROI Calculator
                                </span>
                            </h1>
                            <p className="text-xl text-muted-foreground leading-relaxed max-w-2xl mx-auto">
                                Quantify the cost of poor asset management. See
                                how much your organization loses to ghost
                                assets, searching, shrinkage, and duplicate
                                purchases.
                            </p>
                        </div>
                    </Container>
                </section>

                {/* Tool Section */}
                <section className="pb-20 md:pb-32 -mt-12 relative z-10">
                    <Container>
                        <div className="bg-background rounded-2xl border shadow-xl p-6 md:p-10">
                            <AssetRoiCalculator />
                        </div>
                    </Container>
                </section>

                {/* Educational Content */}
                <section className="pb-24 border-t bg-muted/20">
                    <Container className="pt-24">
                        <div className="grid md:grid-cols-2 gap-16">
                            <div>
                                <h2 className="text-2xl font-bold mb-6">
                                    The Hidden Cost of Poor Asset Tracking
                                </h2>
                                <div className="prose prose-sm text-muted-foreground">
                                    <p>
                                        Most organizations underestimate how
                                        much they lose to poor equipment
                                        management. The costs are spread across
                                        four categories that compound over time.
                                    </p>
                                    <ul className="mt-4 space-y-3 list-disc list-inside">
                                        <li>
                                            <strong>Ghost assets</strong> are
                                            items on your books that no longer
                                            exist or can&apos;t be found.
                                            Industry studies put the rate at
                                            10-30% for organizations without
                                            tracking systems.
                                        </li>
                                        <li>
                                            <strong>Productivity loss</strong>{" "}
                                            from searching for equipment adds up
                                            fast. Even 15 minutes per person per
                                            day across a team becomes thousands
                                            of hours annually.
                                        </li>
                                        <li>
                                            <strong>Shrinkage</strong> — theft,
                                            loss, and unreported damage — is
                                            often invisible until audit time.
                                        </li>
                                        <li>
                                            <strong>
                                                Duplicate purchases
                                            </strong>{" "}
                                            happen when teams can&apos;t verify what
                                            they already own. The same drill,
                                            adapter, or cable gets bought three
                                            times.
                                        </li>
                                    </ul>
                                    <p className="mt-6">
                                        Want to track equipment value over time?
                                        See our{" "}
                                        <Link
                                            href="/tools/equipment-depreciation-calculator"
                                            className="text-orange-600 hover:underline"
                                        >
                                            Equipment Depreciation Calculator
                                        </Link>{" "}
                                        and{" "}
                                        <Link
                                            href="/tools/salvage-value-calculator"
                                            className="text-orange-600 hover:underline"
                                        >
                                            Salvage Value Calculator
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
                                            Are these default rates realistic?
                                        </h3>
                                        <p className="text-sm text-muted-foreground">
                                            The defaults are conservative
                                            industry benchmarks. Many
                                            organizations find their actual
                                            rates are higher once they do a
                                            proper audit. Adjust the sliders to
                                            match your situation — every
                                            assumption is transparent and
                                            editable.
                                        </p>
                                    </div>
                                    <div>
                                        <h3 className="font-semibold text-foreground mb-2">
                                            How does the Shelf comparison work?
                                        </h3>
                                        <p className="text-sm text-muted-foreground">
                                            The comparison assumes Shelf helps
                                            recover 60% of your tracking-related
                                            losses (a conservative estimate). It
                                            then subtracts the annual cost of
                                            the selected Shelf plan to show net
                                            savings, ROI, and payback period.
                                        </p>
                                    </div>
                                    <div>
                                        <h3 className="font-semibold text-foreground mb-2">
                                            What is a ghost asset?
                                        </h3>
                                        <p className="text-sm text-muted-foreground">
                                            A ghost asset is any item that
                                            appears in your records but
                                            can&apos;t be physically located.
                                            Common causes include
                                            unrecorded disposals, theft,
                                            transfers between locations without
                                            updating records, and items that
                                            broke and were discarded without
                                            being written off.
                                        </p>
                                    </div>
                                    <div>
                                        <h3 className="font-semibold text-foreground mb-2">
                                            Can I share this analysis?
                                        </h3>
                                        <p className="text-sm text-muted-foreground">
                                            Yes. All inputs are saved in the
                                            URL, so you can copy the page link
                                            to share your exact scenario. You
                                            can also use the &ldquo;Copy
                                            Summary&rdquo; button to get a plain
                                            text version for emails or reports.
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
                            <p className="text-muted-foreground mb-8">Explore how Shelf helps teams track and manage equipment.</p>
                            <div className="grid sm:grid-cols-2 gap-4">
                                <Link href="/solutions/asset-tracking" className="group rounded-xl border border-border/50 p-5 hover:border-orange-200 hover:shadow-sm transition-all">
                                    <h3 className="font-semibold text-foreground group-hover:text-orange-600 transition-colors mb-1">Asset Tracking Software</h3>
                                    <p className="text-sm text-muted-foreground">Track who has what, where it is, and when it is due back.</p>
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
