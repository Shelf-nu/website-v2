export interface PricingTier {
    id: "free" | "plus" | "team" | "enterprise";
    name: string;
    price: string | "unknown";
    description: string | "unknown";
    cta: string;
    popular?: boolean;
}

export const pricingTiers: PricingTier[] = [
    {
        id: "free",
        name: "Free",
        price: "unknown",
        description: "unknown",
        cta: "Start Free"
    },
    {
        id: "plus",
        name: "Plus",
        price: "unknown",
        description: "unknown",
        cta: "Start Trial",
        popular: true
    },
    {
        id: "team",
        name: "Team",
        price: "unknown",
        description: "unknown",
        cta: "Start Trial"
    },
    {
        id: "enterprise",
        name: "Enterprise",
        price: "unknown",
        description: "unknown",
        cta: "Contact Sales"
    }
];
