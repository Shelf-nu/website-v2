import { Metadata } from "next";

export const metadata: Metadata = {
    title: "Pricing — Simple, Transparent Plans",
    description:
        "One flat price per workspace — unlimited assets on every plan, unlimited users on Team. Free plan available. Team plan $67/month or $370/year. 7-day free trial, no credit card required.",
    alternates: { canonical: "https://www.shelf.nu/pricing" },
};

export default function PricingLayout({
    children,
}: {
    children: React.ReactNode;
}) {
    return children;
}
