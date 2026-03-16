import { Metadata } from "next";

export const metadata: Metadata = {
    title: "Pricing — Simple, Transparent Plans",
    description:
        "Flat pricing for your whole team. No per-seat fees. Free plan with unlimited assets. Team plan from $67/month. No credit card required.",
    alternates: { canonical: "https://www.shelf.nu/pricing" },
};

export default function PricingLayout({
    children,
}: {
    children: React.ReactNode;
}) {
    return children;
}
