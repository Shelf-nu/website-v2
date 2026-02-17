export interface PricingTier {
    id: "free" | "plus" | "team" | "enterprise";
    name: string;
    price: string;
    description: string;
    cta: string;
    popular?: boolean;
}

export const pricingTiers: PricingTier[] = [
    {
        id: "free",
        name: "Personal",
        price: "$0",
        description: "For private collectors or small businesses.",
        cta: "Start Free"
    },
    {
        id: "plus",
        name: "Plus",
        price: "$34",
        description: "Perfect for power users.",
        cta: "Buy Now"
    },
    {
        id: "team",
        name: "Team",
        price: "$67",
        description: "Perfect for businesses.",
        cta: "Start Free Trial",
        popular: true
    },
    {
        id: "enterprise",
        name: "Enterprise",
        price: "Custom",
        description: "Perfect for large organizations.",
        cta: "Contact Sales"
    }
];
