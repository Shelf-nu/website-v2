import { Metadata } from "next";
import { pricingPlans } from "@/data/pricing";

// Interpolated rather than typed out, so a plan price change updates the meta
// description too. The rendered string is byte-identical to what shipped
// before — wording changes to this description belong in a tracked CTR
// experiment (data/seo-experiments.json), not in a refactor.
const team = pricingPlans.find((p) => p.id === "team")!;

export const metadata: Metadata = {
    title: "Pricing — Simple, Transparent Plans",
    description: `One flat price per workspace — unlimited assets on every plan, unlimited users on Team. Free plan available. Team plan ${team.priceMonthly}/month or ${team.priceYearly}/year. 7-day free trial, no credit card required.`,
    alternates: { canonical: "https://www.shelf.nu/pricing" },
};

export default function PricingLayout({
    children,
}: {
    children: React.ReactNode;
}) {
    return children;
}
