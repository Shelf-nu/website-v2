"use client";

import { useMemo, useState } from "react";
import { Copy, Check, ArrowRight } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { useUrlState } from "@/lib/use-url-state";
import { formatCurrency } from "@/lib/utils";
import { trackEvent } from "@/lib/analytics";
import {
    calculateRoi,
    calculateShelfComparison,
    SHELF_PLANS,
    type ShelfPlan,
} from "@/lib/roi-calculator";
import { SvgLineChart, type ChartSeries } from "./shared/svg-line-chart";
import { TrackedLink } from "@/components/analytics/tracked-link";

const DEFAULTS = {
    assets: 500,
    avgValue: 1200,
    team: 10,
    hourly: 35,
    ghost: 15,
    search: 5,
    shrinkage: 3,
    duplicate: 5,
    compare: false,
    plan: "team" as string,
};

export function AssetRoiCalculator() {
    const [state, update] = useUrlState(DEFAULTS);
    const [copied, setCopied] = useState(false);
    const [tracked, setTracked] = useState(false);

    const assets = Math.max(1, state.assets);
    const avgValue = Math.max(1, state.avgValue);
    const team = Math.max(1, state.team);
    const hourly = Math.max(1, state.hourly);
    const ghost = Math.max(0, Math.min(state.ghost, 50));
    const search = Math.max(0, Math.min(state.search, 40));
    const shrinkage = Math.max(0, Math.min(state.shrinkage, 20));
    const duplicate = Math.max(0, Math.min(state.duplicate, 20));
    const showCompare = state.compare;
    const plan = state.plan as ShelfPlan;

    function trackOnce() {
        if (!tracked) {
            trackEvent("tool_calculate", { tool: "roi" });
            setTracked(true);
        }
    }

    const breakdown = useMemo(
        () =>
            calculateRoi({
                totalAssets: assets,
                avgValue,
                teamSize: team,
                hourlyCost: hourly,
                ghostRate: ghost,
                searchHours: search,
                shrinkageRate: shrinkage,
                duplicateRate: duplicate,
            }),
        [assets, avgValue, team, hourly, ghost, search, shrinkage, duplicate]
    );

    const comparison = useMemo(
        () => (showCompare ? calculateShelfComparison(breakdown, plan) : null),
        [showCompare, breakdown, plan]
    );

    const chartSeries = useMemo((): ChartSeries[] => {
        const series: ChartSeries[] = [
            {
                label: "Cost Without Tracking",
                color: "#dc2626",
                data: [
                    breakdown.totalAnnualCost,
                    breakdown.totalAnnualCost * 2,
                    breakdown.totalAnnualCost * 3,
                ],
            },
        ];
        if (comparison) {
            series.push({
                label: "Cost With Shelf",
                color: "#16a34a",
                data: [
                    comparison.annualShelfCost,
                    comparison.annualShelfCost * 2,
                    comparison.annualShelfCost * 3,
                ],
            });
        }
        return series;
    }, [breakdown, comparison]);

    const xLabels = ["Year 1", "Year 2", "Year 3"];

    const costCards = [
        {
            label: "Ghost Assets",
            value: breakdown.ghostAssetCost,
            description: "Assets on the books that can't be found",
            color: "bg-red-500",
        },
        {
            label: "Productivity Loss",
            value: breakdown.productivityLoss,
            description: `${search}h/wk × ${team} people searching for equipment`,
            color: "bg-amber-500",
        },
        {
            label: "Shrinkage",
            value: breakdown.shrinkageCost,
            description: "Lost, stolen, or broken beyond repair",
            color: "bg-orange-500",
        },
        {
            label: "Duplicate Purchases",
            value: breakdown.duplicateCost,
            description: "Buying what you already own but can't find",
            color: "bg-purple-500",
        },
    ];

    function generateSummary(): string {
        const lines = [
            "Asset Tracking ROI Analysis",
            "\u2500".repeat(40),
            `Total Assets: ${assets.toLocaleString()}`,
            `Average Value: ${formatCurrency(avgValue)}`,
            `Team Size: ${team}`,
            `Hourly Labor Cost: ${formatCurrency(hourly)}`,
            "",
            "Annual Cost Breakdown:",
            `  Ghost Assets (${ghost}%): ${formatCurrency(breakdown.ghostAssetCost)}`,
            `  Productivity Loss (${search}h/wk): ${formatCurrency(breakdown.productivityLoss)}`,
            `  Shrinkage (${shrinkage}%): ${formatCurrency(breakdown.shrinkageCost)}`,
            `  Duplicate Purchases (${duplicate}%): ${formatCurrency(breakdown.duplicateCost)}`,
            "",
            `  TOTAL ANNUAL COST: ${formatCurrency(breakdown.totalAnnualCost)}`,
        ];
        if (comparison) {
            lines.push(
                "",
                `Shelf ${SHELF_PLANS[plan].label} Plan: ${formatCurrency(comparison.annualShelfCost)}/yr`,
                `Net Annual Savings: ${formatCurrency(comparison.netSavings)}`,
                `ROI: ${comparison.roi}%`,
                `Payback Period: ${comparison.paybackMonths} months`,
                `3-Year Savings: ${formatCurrency(comparison.threeYearSavings)}`
            );
        }
        lines.push("", "Generated at shelf.nu/tools/asset-roi-calculator");
        return lines.join("\n");
    }

    async function handleCopy() {
        await navigator.clipboard.writeText(generateSummary());
        setCopied(true);
        trackEvent("tool_share", { tool: "roi", action: "copy_summary" });
        setTimeout(() => setCopied(false), 2000);
    }

    return (
        <div className="grid lg:grid-cols-12 gap-8 items-start">
            {/* Inputs */}
            <div className="lg:col-span-5 space-y-6">
                <div className="grid grid-cols-2 gap-4">
                    <div>
                        <Label htmlFor="assets">Total Assets</Label>
                        <Input
                            id="assets"
                            type="number"
                            min={1}
                            max={100000}
                            value={state.assets}
                            onChange={(e) => {
                                update({ assets: Number(e.target.value) });
                                trackOnce();
                            }}
                            className="mt-1.5"
                        />
                    </div>
                    <div>
                        <Label htmlFor="avgValue">Avg. Value</Label>
                        <div className="relative mt-1.5">
                            <span className="absolute left-3 top-1/2 -translate-y-1/2 text-muted-foreground text-sm">
                                $
                            </span>
                            <Input
                                id="avgValue"
                                type="number"
                                min={1}
                                max={1000000}
                                value={state.avgValue}
                                onChange={(e) => {
                                    update({
                                        avgValue: Number(e.target.value),
                                    });
                                    trackOnce();
                                }}
                                className="pl-7"
                            />
                        </div>
                    </div>
                </div>

                <div className="grid grid-cols-2 gap-4">
                    <div>
                        <Label htmlFor="team">Team Size</Label>
                        <Input
                            id="team"
                            type="number"
                            min={1}
                            max={10000}
                            value={state.team}
                            onChange={(e) => {
                                update({ team: Number(e.target.value) });
                                trackOnce();
                            }}
                            className="mt-1.5"
                        />
                    </div>
                    <div>
                        <Label htmlFor="hourly">Hourly Cost</Label>
                        <div className="relative mt-1.5">
                            <span className="absolute left-3 top-1/2 -translate-y-1/2 text-muted-foreground text-sm">
                                $
                            </span>
                            <Input
                                id="hourly"
                                type="number"
                                min={1}
                                max={500}
                                value={state.hourly}
                                onChange={(e) => {
                                    update({
                                        hourly: Number(e.target.value),
                                    });
                                    trackOnce();
                                }}
                                className="pl-7"
                            />
                        </div>
                    </div>
                </div>

                <div className="space-y-4 pt-2">
                    <p className="text-sm font-medium text-foreground">
                        Estimated Waste Rates
                    </p>

                    <div>
                        <div className="flex justify-between items-center">
                            <Label htmlFor="ghost">Ghost Asset Rate</Label>
                            <span className="text-sm text-muted-foreground">
                                {state.ghost}%
                            </span>
                        </div>
                        <Input
                            id="ghost"
                            type="range"
                            min={0}
                            max={50}
                            value={state.ghost}
                            onChange={(e) => {
                                update({ ghost: Number(e.target.value) });
                                trackOnce();
                            }}
                            className="mt-1.5 accent-orange-600"
                        />
                        <p className="text-xs text-muted-foreground mt-0.5">
                            Assets on the books but can&apos;t be located
                        </p>
                    </div>

                    <div>
                        <div className="flex justify-between items-center">
                            <Label htmlFor="search">
                                Hours/Week Searching
                            </Label>
                            <span className="text-sm text-muted-foreground">
                                {state.search}h
                            </span>
                        </div>
                        <Input
                            id="search"
                            type="range"
                            min={0}
                            max={40}
                            value={state.search}
                            onChange={(e) => {
                                update({ search: Number(e.target.value) });
                                trackOnce();
                            }}
                            className="mt-1.5 accent-orange-600"
                        />
                        <p className="text-xs text-muted-foreground mt-0.5">
                            Per person, looking for or tracking down equipment
                        </p>
                    </div>

                    <div>
                        <div className="flex justify-between items-center">
                            <Label htmlFor="shrinkage">Shrinkage Rate</Label>
                            <span className="text-sm text-muted-foreground">
                                {state.shrinkage}%
                            </span>
                        </div>
                        <Input
                            id="shrinkage"
                            type="range"
                            min={0}
                            max={20}
                            value={state.shrinkage}
                            onChange={(e) => {
                                update({
                                    shrinkage: Number(e.target.value),
                                });
                                trackOnce();
                            }}
                            className="mt-1.5 accent-orange-600"
                        />
                        <p className="text-xs text-muted-foreground mt-0.5">
                            Annual loss from theft, damage, or misplacement
                        </p>
                    </div>

                    <div>
                        <div className="flex justify-between items-center">
                            <Label htmlFor="duplicate">
                                Duplicate Purchase Rate
                            </Label>
                            <span className="text-sm text-muted-foreground">
                                {state.duplicate}%
                            </span>
                        </div>
                        <Input
                            id="duplicate"
                            type="range"
                            min={0}
                            max={20}
                            value={state.duplicate}
                            onChange={(e) => {
                                update({
                                    duplicate: Number(e.target.value),
                                });
                                trackOnce();
                            }}
                            className="mt-1.5 accent-orange-600"
                        />
                        <p className="text-xs text-muted-foreground mt-0.5">
                            Re-buying items you already own but can&apos;t find
                        </p>
                    </div>
                </div>
            </div>

            {/* Outputs */}
            <div className="lg:col-span-7 space-y-6">
                {/* Hero metric */}
                <div className="rounded-xl border bg-card p-6">
                    <p className="text-sm font-medium text-muted-foreground mb-1">
                        Annual Cost of Poor Asset Tracking
                    </p>
                    <p className="text-4xl font-bold text-red-600 tracking-tight">
                        {formatCurrency(breakdown.totalAnnualCost)}
                    </p>
                    <p className="text-sm text-muted-foreground mt-2">
                        Based on{" "}
                        {assets.toLocaleString()} assets worth{" "}
                        {formatCurrency(assets * avgValue)} total
                    </p>
                </div>

                {/* Cost breakdown cards */}
                <div className="grid grid-cols-2 gap-3">
                    {costCards.map((card) => (
                        <div
                            key={card.label}
                            className="rounded-lg border bg-card p-4"
                        >
                            <div className="flex items-center gap-2 mb-2">
                                <div
                                    className={`w-2.5 h-2.5 rounded-full ${card.color}`}
                                />
                                <p className="text-xs font-medium text-muted-foreground">
                                    {card.label}
                                </p>
                            </div>
                            <p className="text-lg font-bold text-foreground">
                                {formatCurrency(card.value)}
                            </p>
                            <p className="text-xs text-muted-foreground mt-1">
                                {card.description}
                            </p>
                        </div>
                    ))}
                </div>

                {/* Compare toggle */}
                <div className="rounded-xl border bg-card p-4">
                    <label className="flex items-center gap-3 cursor-pointer">
                        <input
                            type="checkbox"
                            checked={showCompare}
                            onChange={(e) => {
                                update({ compare: e.target.checked });
                                if (e.target.checked) {
                                    trackEvent("tool_interact", {
                                        tool: "roi",
                                        action: "compare_shelf",
                                    });
                                }
                            }}
                            className="h-4 w-4 rounded border-border text-orange-600 focus:ring-orange-500"
                        />
                        <div>
                            <span className="text-sm font-medium text-foreground">
                                Compare with Shelf
                            </span>
                            <p className="text-xs text-muted-foreground">
                                See estimated savings with asset tracking
                                software
                            </p>
                        </div>
                    </label>

                    {showCompare && (
                        <div className="mt-4 pt-4 border-t">
                            <Label className="text-xs">Select Plan</Label>
                            <div
                                className="grid grid-cols-2 gap-2 mt-1.5"
                                role="radiogroup"
                                aria-label="Shelf plan"
                            >
                                {(
                                    Object.keys(SHELF_PLANS) as ShelfPlan[]
                                ).map((p) => (
                                    <button
                                        key={p}
                                        role="radio"
                                        aria-checked={plan === p}
                                        onClick={() => update({ plan: p })}
                                        className={`px-3 py-2 text-sm text-center rounded-lg border transition-colors ${
                                            plan === p
                                                ? "bg-orange-50 border-orange-300 text-orange-800 font-medium"
                                                : "bg-card border-border text-muted-foreground hover:border-orange-200"
                                        }`}
                                    >
                                        {SHELF_PLANS[p].label}{" "}
                                        <span className="text-xs opacity-70">
                                            ${SHELF_PLANS[p].yearlyPrice}/yr
                                        </span>
                                    </button>
                                ))}
                            </div>
                        </div>
                    )}
                </div>

                {/* Comparison results */}
                {showCompare && comparison && (
                    <div className="grid grid-cols-3 gap-3">
                        <div className="rounded-lg border bg-card p-4 text-center">
                            <p className="text-xs text-muted-foreground mb-1">
                                Net Annual Savings
                            </p>
                            <p className="text-xl font-bold text-emerald-600">
                                {formatCurrency(comparison.netSavings)}
                            </p>
                        </div>
                        <div className="rounded-lg border bg-card p-4 text-center">
                            <p className="text-xs text-muted-foreground mb-1">
                                ROI
                            </p>
                            <p className="text-xl font-bold text-emerald-600">
                                {comparison.roi.toLocaleString()}%
                            </p>
                        </div>
                        <div className="rounded-lg border bg-card p-4 text-center">
                            <p className="text-xs text-muted-foreground mb-1">
                                Payback
                            </p>
                            <p className="text-xl font-bold text-foreground">
                                {comparison.paybackMonths} mo
                            </p>
                        </div>
                    </div>
                )}

                {/* 3-year projection chart */}
                <div className="rounded-xl border bg-card p-6">
                    <h3 className="font-semibold text-foreground mb-4">
                        3-Year Cost Projection
                    </h3>
                    <SvgLineChart
                        series={chartSeries}
                        xLabels={xLabels}
                        height={240}
                    />
                    {showCompare && comparison && (
                        <p className="text-sm text-emerald-600 font-medium mt-3">
                            3-year savings:{" "}
                            {formatCurrency(comparison.threeYearSavings)}
                        </p>
                    )}
                </div>

                {/* Copy */}
                <div className="flex flex-col sm:flex-row gap-3">
                    <Button
                        variant="outline"
                        onClick={handleCopy}
                        className="gap-2"
                    >
                        {copied ? (
                            <Check className="h-4 w-4 text-emerald-600" />
                        ) : (
                            <Copy className="h-4 w-4" />
                        )}
                        {copied ? "Copied!" : "Copy Summary"}
                    </Button>
                </div>

                {/* Contextual CTA */}
                <div className="rounded-xl border border-orange-200/60 bg-orange-50/50 p-6">
                    <h3 className="font-bold text-foreground mb-1">
                        Recover{" "}
                        {formatCurrency(breakdown.totalAnnualCost)} this year
                    </h3>
                    <p className="text-sm text-muted-foreground mb-4">
                        Shelf gives every asset a QR code, custody trail, and
                        booking calendar. Know where every item is and who has
                        it. Free forever for individuals.
                    </p>
                    <Button
                        className="bg-orange-600 hover:bg-orange-700 text-white"
                        asChild
                    >
                        <TrackedLink
                            href="https://app.shelf.nu/join?utm_source=shelf_website&utm_medium=cta&utm_content=tool_roi"
                            eventName="tool_cta_click"
                            eventProps={{ tool: "roi", cta: "signup" }}
                        >
                            Start tracking free{" "}
                            <ArrowRight className="ml-1 h-4 w-4" />
                        </TrackedLink>
                    </Button>
                </div>
            </div>
        </div>
    );
}
