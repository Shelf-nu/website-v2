import { Container } from "@/components/ui/container";
import { Card, CardHeader, CardTitle, CardDescription, CardContent, CardFooter } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Check } from "lucide-react";
import { Metadata } from "next";

export const metadata: Metadata = {
    title: "Pricing - Shelf Asset Management",
    description: "Simple, transparent pricing for teams of all sizes.",
};

const tiers = [
    {
        name: "Starter",
        price: "$0",
        description: "Perfect for individuals and small hobby projects.",
        features: [
            "Up to 100 assets",
            "Basic QR code generation",
            "1 User",
            "Mobile App Access"
        ],
        cta: "Get Started",
        variant: "outline" as const
    },
    {
        name: "Pro",
        price: "$29",
        period: "/month",
        description: "For growing teams that need to track equipment seriously.",
        features: [
            "Unlimited assets",
            "Custom QR codes & branding",
            "Up to 5 Users",
            "Check-in / Check-out",
            "Maintenance Schedules",
            "Email Support"
        ],
        cta: "Start Free Trial",
        variant: "default" as const,
        popular: true
    },
    {
        name: "Enterprise",
        price: "Custom",
        description: "For large organizations with advanced security needs.",
        features: [
            "Unlimited Users",
            "SSO & SAML",
            "API Access",
            "Audit Logs",
            "Dedicated Account Manager",
            "SLA"
        ],
        cta: "Contact Sales",
        variant: "outline" as const
    }
];

export default function PricingPage() {
    return (
        <div className="flex min-h-screen flex-col">
            <Container className="py-20 md:py-32">
                <div className="mx-auto max-w-2xl text-center mb-16">
                    <Badge variant="secondary" className="mb-4">Pricing</Badge>
                    <h1 className="text-4xl font-bold tracking-tight sm:text-6xl mb-6">
                        Simple, transparent pricing
                    </h1>
                    <p className="text-xl text-muted-foreground">
                        No hidden fees. No credit card required to start.
                    </p>
                </div>

                <div className="grid gap-8 md:grid-cols-2 lg:grid-cols-3 lg:gap-12 max-w-7xl mx-auto">
                    {tiers.map((tier) => (
                        <Card key={tier.name} className={`flex flex-col ${tier.popular ? 'border-primary shadow-lg scale-105 z-10' : ''}`}>
                            <CardHeader>
                                {tier.popular && (
                                    <div className="mb-4">
                                        <Badge>Most Popular</Badge>
                                    </div>
                                )}
                                <CardTitle className="text-2xl">{tier.name}</CardTitle>
                                <CardDescription className="mt-2 text-base">
                                    {tier.description}
                                </CardDescription>
                            </CardHeader>
                            <CardContent className="flex-1">
                                <div className="mb-6">
                                    <span className="text-4xl font-bold">{tier.price}</span>
                                    {tier.period && (
                                        <span className="text-muted-foreground">{tier.period}</span>
                                    )}
                                </div>
                                <ul className="space-y-3">
                                    {tier.features.map((feature) => (
                                        <li key={feature} className="flex items-center text-sm">
                                            <Check className="mr-2 h-4 w-4 text-primary" />
                                            {feature}
                                        </li>
                                    ))}
                                </ul>
                            </CardContent>
                            <CardFooter>
                                <Button className="w-full" variant={tier.variant}>
                                    {tier.cta}
                                </Button>
                            </CardFooter>
                        </Card>
                    ))}
                </div>

                <div className="mt-20 text-center">
                    <p className="text-muted-foreground">
                        Have questions? <a href="/contact" className="underline underline-offset-4 text-primary">Contact our team</a>
                    </p>
                </div>
            </Container>
        </div>
    );
}
