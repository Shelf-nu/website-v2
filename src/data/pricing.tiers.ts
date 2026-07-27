// NOTE: This file only drives the feature-table column headers (name, CTA, popular).
// Prices and plan descriptions live in pricing.ts — the single source of truth —
// and are intentionally NOT duplicated here so they cannot silently drift.
export interface PricingTier {
    id: "free" | "plus" | "team" | "enterprise";
    name: string;
    cta: string;
    popular?: boolean;
}

export const pricingTiers: PricingTier[] = [
    {
        id: "free",
        name: "Personal",
        cta: "Start Free"
    },
    {
        id: "plus",
        name: "Plus",
        cta: "Buy Now"
    },
    {
        id: "team",
        name: "Team",
        cta: "Start Free Trial",
        popular: true
    },
    {
        id: "enterprise",
        name: "Enterprise",
        cta: "Get a demo"
    }
];
