import React from "react";
import Link from "next/link";
import { Check, Minus, Info } from "lucide-react";
import { pricingFeatures, PricingFeature, AvailabilityState } from "@/data/pricing.features";
import { pricingTiers } from "@/data/pricing.tiers";
import { Tooltip, TooltipContent, TooltipProvider, TooltipTrigger } from "@/components/ui/tooltip";

import { Button } from "@/components/ui/button";

const tierLinks: Record<string, string> = {
    free: "https://app.shelf.nu/join?utm_source=shelf_website&utm_medium=cta&utm_content=pricing_table_free",
    plus: "https://app.shelf.nu/join?plan=plus&utm_source=shelf_website&utm_medium=cta&utm_content=pricing_table_plus",
    team: "https://app.shelf.nu/join?plan=team&trial=true&utm_source=shelf_website&utm_medium=cta&utm_content=pricing_table_team",
    enterprise: "/demo?utm_source=shelf_website&utm_medium=cta&utm_content=pricing_table_enterprise",
};

function AvailabilityIcon({ state, metadata }: { state: AvailabilityState, metadata?: string }) {
    if (metadata) {
        return <span className="text-sm font-medium text-muted-foreground">{metadata}</span>;
    }

    switch (state) {
        case "included":
            return <Check className="h-5 w-5 text-primary mx-auto" />;
        case "not-included":
            return <Minus className="h-5 w-5 text-muted-foreground/30 mx-auto" />;
        case "limited":
            return <span className="text-sm text-muted-foreground">Limited</span>;
        case "available-on-request":
            return <span className="text-xs uppercase font-medium text-muted-foreground">On Request</span>;
        case "unknown":
            return <span className="text-xs font-mono text-orange-600">?</span>;
        default:
            return null;
    }
}

export function FeatureTable() {
    // Group features by category
    const featuresByCategory = pricingFeatures.reduce((acc, feature) => {
        if (!acc[feature.category]) {
            acc[feature.category] = [];
        }
        acc[feature.category].push(feature);
        return acc;
    }, {} as Record<string, PricingFeature[]>);

    const categories = Object.keys(featuresByCategory);

    return (
        <TooltipProvider delayDuration={100}>
        <div className="mt-24 rounded-xl border bg-background shadow-none lg:overflow-visible">
            {/* 
                We use overflow-x-auto for mobile responsiveness.
                However, for sticky headers to work relative to the WINDOW on desktop, 
                we must have overflow-visible. 
                
                The table is roughly 800px wide. On 'lg' (1024px) screens, it fits comfortably.
            */}
            <div className="overflow-x-auto lg:overflow-visible rounded-xl">
                <table className="w-full text-left border-collapse">
                    <thead>
                        <tr className="border-b border-border bg-background lg:sticky lg:top-[64px] z-40 shadow-sm">
                            <th className="p-6 text-sm font-semibold text-muted-foreground w-1/3 min-w-[200px] sticky left-0 bg-background z-50 border-r border-border">
                                Feature
                            </th>
                            {pricingTiers.map((tier) => (
                                <th key={tier.id} className="p-6 text-center min-w-[140px] bg-background">
                                    <div className="flex flex-col gap-3 items-center">
                                        <span className="text-sm font-semibold text-foreground">{tier.name}</span>
                                        <Button
                                            size="sm"
                                            variant={tier.popular ? "default" : "outline"}
                                            className="w-full max-w-[120px] h-8 text-xs"
                                            asChild
                                        >
                                            <Link href={tierLinks[tier.id]}>
                                                {tier.cta}
                                            </Link>
                                        </Button>
                                    </div>
                                </th>
                            ))}
                        </tr>
                    </thead>
                    <tbody className="divide-y divide-border/40">
                        {categories.map((category) => (
                            <React.Fragment key={category}>
                                <tr className="bg-muted/50 border-b border-border/40">
                                    <td colSpan={5} className="py-3 px-6 text-xs font-bold uppercase tracking-widest text-muted-foreground/80 sticky left-0 z-30 bg-muted/50">
                                        {category}
                                    </td>
                                </tr>
                                {featuresByCategory[category].map((feature) => {
                                    // Adapter logic to resolve display availability
                                    const displayAvailability = {
                                        free: feature.internalAvailability?.free ?? feature.availability.free,
                                        plus: feature.internalAvailability?.tier_1 ?? feature.availability.plus,
                                        team: feature.internalAvailability?.tier_2 ?? feature.availability.team,
                                        enterprise: feature.internalAvailability?.custom ?? feature.availability.enterprise,
                                    };

                                    return (
                                        <tr key={feature.id} className="group hover:bg-muted/50 transition-colors border-b border-border/40 last:border-0">
                                            <td className="p-6 sticky left-0 bg-background z-30 border-r border-border group-hover:bg-muted/50 transition-colors">
                                                <div className="flex flex-col gap-1">
                                                    <div className="flex items-center gap-2">
                                                        <span className="text-sm font-medium text-foreground">{feature.name}</span>
                                                        {feature.description && (
                                                            <Tooltip>
                                                                <TooltipTrigger asChild>
                                                                    <button type="button" className="cursor-help">
                                                                        <Info className="h-4 w-4 text-muted-foreground/50 hover:text-muted-foreground transition-colors" />
                                                                    </button>
                                                                </TooltipTrigger>
                                                                <TooltipContent side="top" className="max-w-xs">
                                                                    <p>{feature.description}</p>
                                                                </TooltipContent>
                                                            </Tooltip>
                                                        )}
                                                    </div>
                                                    {feature.requiresTeamOrg && (
                                                        <span className="text-[10px] font-medium text-orange-600/80">
                                                            Requires Team workspace
                                                        </span>
                                                    )}
                                                </div>
                                            </td>

                                            <td className="p-6 text-center">
                                                <AvailabilityIcon state={displayAvailability.free} metadata={feature.metadata?.free} />
                                            </td>
                                            <td className="p-6 text-center">
                                                <AvailabilityIcon state={displayAvailability.plus} metadata={feature.metadata?.plus} />
                                            </td>
                                            <td className="p-6 text-center">
                                                <AvailabilityIcon state={displayAvailability.team} metadata={feature.metadata?.team} />
                                            </td>
                                            <td className="p-6 text-center">
                                                <AvailabilityIcon state={displayAvailability.enterprise} metadata={feature.metadata?.enterprise} />
                                            </td>
                                        </tr>
                                    );
                                })}
                            </React.Fragment>
                        ))}
                    </tbody>
                </table>
            </div>
        </div>
        </TooltipProvider>
    );
}
