import { Container } from "@/components/ui/container";
import { Button } from "@/components/ui/button";
import { Check } from "lucide-react";
import { Metadata } from "next";

export const metadata: Metadata = {
    title: "Pricing - Shelf",
    description: "Simple, transparent pricing for teams of all sizes.",
};

const tiers = [
    {
        name: "Starter",
        id: "starter",
        href: "/signup",
        priceMonthly: "$0",
        description: "Perfect for small teams just getting started.",
        features: [
            "Up to 100 assets",
            "Basic reporting",
            "Mobile app access",
            "Email support",
        ],
    },
    {
        name: "Pro",
        id: "pro",
        href: "/signup",
        priceMonthly: "$29",
        description: "For growing teams that need more power.",
        features: [
            "Unlimited assets",
            "Advanced analytics",
            "API access",
            "Priority support",
            "Custom fields",
        ],
    },
    {
        name: "Enterprise",
        id: "enterprise",
        href: "/contact",
        priceMonthly: "Custom",
        description: "Dedicated support and infrastructure for large orgs.",
        features: [
            "SSO / SAML",
            "Dedicated success manager",
            "SLA",
            "On-premise deployment",
            "Audit logs",
        ],
    },
];

export default function PricingPage() {
    return (
        <Container className="py-20">
            <div className="mx-auto max-w-2xl text-center mb-16">
                <h1 className="text-4xl font-bold tracking-tight sm:text-5xl mb-6">
                    Simple, transparent pricing
                </h1>
                <p className="text-xl text-muted-foreground">
                    Choose the plan that's right for your team.
                </p>
            </div>
            <div className="grid grid-cols-1 gap-8 lg:grid-cols-3">
                {tiers.map((tier) => (
                    <div
                        key={tier.id}
                        className="flex flex-col justify-between rounded-3xl bg-background p-8 ring-1 ring-gray-200 xl:p-10"
                    >
                        <div>
                            <div className="flex items-center justify-between gap-x-4">
                                <h3 className="text-lg font-semibold leading-8 text-foreground">
                                    {tier.name}
                                </h3>
                            </div>
                            <p className="mt-4 text-sm leading-6 text-muted-foreground">
                                {tier.description}
                            </p>
                            <p className="mt-6 flex items-baseline gap-x-1">
                                <span className="text-4xl font-bold tracking-tight text-foreground">
                                    {tier.priceMonthly}
                                </span>
                                {tier.priceMonthly !== "Custom" && (
                                    <span className="text-sm font-semibold leading-6 text-muted-foreground">
                                        /month
                                    </span>
                                )}
                            </p>
                            <ul
                                role="list"
                                className="mt-8 space-y-3 text-sm leading-6 text-muted-foreground"
                            >
                                {tier.features.map((feature) => (
                                    <li key={feature} className="flex gap-x-3">
                                        <Check
                                            className="h-6 w-5 flex-none text-primary"
                                            aria-hidden="true"
                                        />
                                        {feature}
                                    </li>
                                ))}
                            </ul>
                        </div>
                        <Button
                            asChild
                            className="mt-8"
                            variant={tier.id === "pro" ? "default" : "outline"}
                        >
                            <a href={tier.href}>
                                {tier.priceMonthly === "Custom" ? "Contact sales" : "Get started"}
                            </a>
                        </Button>
                    </div>
                ))}
            </div>
        </Container>
    );
}
