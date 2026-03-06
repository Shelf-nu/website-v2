"use client";

import { useMemo, useState } from "react";
import { Copy, Check, ArrowRight } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { useUrlState } from "@/lib/use-url-state";
import { formatCurrency } from "@/lib/utils";
import { trackEvent } from "@/lib/analytics";
import { calculateSalvage } from "@/lib/salvage";
import {
    SALVAGE_BENCHMARKS,
    CATEGORY_LABELS,
    type AssetCategory,
} from "@/data/salvage-benchmarks";
import { SvgLineChart, type ChartSeries } from "./shared/svg-line-chart";
import { TrackedLink } from "@/components/analytics/tracked-link";

const CATEGORIES: AssetCategory[] = [
    "computers",
    "vehicles",
    "furniture",
    "heavy-equipment",
    "medical",
    "lab",
    "av-media",
    "other",
];

const DEFAULTS = {
    price: 25000,
    life: 5,
    category: "computers" as string,
    rate: 25,
};

export function SalvageValueCalculator() {
    const [state, update] = useUrlState(DEFAULTS);
    const [copied, setCopied] = useState(false);
    const [tracked, setTracked] = useState(false);

    const price = Math.max(1, state.price);
    const life = Math.max(1, Math.min(state.life, 40));
    const category = state.category as AssetCategory;
    const rate = Math.max(1, Math.min(state.rate, 50));

    function trackOnce() {
        if (!tracked) {
            trackEvent("tool_calculate", { tool: "salvage", category });
            setTracked(true);
        }
    }

    // When category changes, auto-suggest rate and life
    function handleCategoryChange(cat: AssetCategory) {
        const bench = SALVAGE_BENCHMARKS[cat];
        update({
            category: cat,
            rate: Math.round(bench.annualRate * 100),
            life: bench.typicalLife,
        });
        trackOnce();
    }

    const result = useMemo(
        () => calculateSalvage(price, life, rate / 100),
        [price, life, rate]
    );

    const chartSeries = useMemo(
        (): ChartSeries[] => [
            {
                label: "Book Value",
                color: "#ea580c",
                data: result.yearlyValues,
            },
        ],
        [result.yearlyValues]
    );

    const xLabels = useMemo(
        () => Array.from({ length: life }, (_, i) => `Yr ${i + 1}`),
        [life]
    );

    // Benchmark comparison data
    const benchmarkComparison = useMemo(() => {
        return CATEGORIES.filter((c) => c !== "other").map((c) => {
            const bench = SALVAGE_BENCHMARKS[c];
            const r = calculateSalvage(price, life, bench.annualRate);
            return {
                category: c,
                label: bench.label,
                salvageValue: r.salvageValue,
                rate: bench.annualRate,
                isSelected: c === category,
            };
        });
    }, [price, life, category]);

    function generateSummary(): string {
        const lines = [
            "Salvage Value Estimate",
            "\u2500".repeat(40),
            `Purchase Price: ${formatCurrency(price)}`,
            `Useful Life: ${life} years`,
            `Asset Category: ${CATEGORY_LABELS[category]}`,
            `Annual Depreciation Rate: ${rate}%`,
            "",
            `Estimated Salvage Value: ${formatCurrency(result.salvageValue)}`,
            `Total Depreciation: ${formatCurrency(result.totalDepreciation)} (${result.depreciationPercent}%)`,
            "",
            "Value Timeline:",
            ...result.yearlyValues.map(
                (v, i) => `  Year ${i + 1}: ${formatCurrency(v)}`
            ),
            "",
            "Generated at shelf.nu/tools/salvage-value-calculator",
        ];
        return lines.join("\n");
    }

    async function handleCopy() {
        await navigator.clipboard.writeText(generateSummary());
        setCopied(true);
        trackEvent("tool_share", { tool: "salvage", action: "copy_summary" });
        setTimeout(() => setCopied(false), 2000);
    }

    return (
        <div className="grid lg:grid-cols-12 gap-8 items-start">
            {/* Inputs */}
            <div className="lg:col-span-5 space-y-6">
                <div>
                    <Label htmlFor="price">Purchase Price</Label>
                    <div className="relative mt-1.5">
                        <span className="absolute left-3 top-1/2 -translate-y-1/2 text-muted-foreground text-sm">
                            $
                        </span>
                        <Input
                            id="price"
                            type="number"
                            min={1}
                            max={10000000}
                            value={state.price}
                            onChange={(e) => {
                                update({ price: Number(e.target.value) });
                                trackOnce();
                            }}
                            className="pl-7"
                        />
                    </div>
                </div>

                <div>
                    <Label htmlFor="life">Useful Life (years)</Label>
                    <Input
                        id="life"
                        type="number"
                        min={1}
                        max={40}
                        value={state.life}
                        onChange={(e) => {
                            update({ life: Number(e.target.value) });
                            trackOnce();
                        }}
                        className="mt-1.5"
                    />
                </div>

                <div>
                    <Label>Asset Category</Label>
                    <div
                        className="grid grid-cols-1 gap-2 mt-1.5"
                        role="radiogroup"
                        aria-label="Asset category"
                    >
                        {CATEGORIES.map((c) => (
                            <button
                                key={c}
                                role="radio"
                                aria-checked={category === c}
                                onClick={() => handleCategoryChange(c)}
                                className={`px-3 py-2 text-sm text-left rounded-lg border transition-colors ${
                                    category === c
                                        ? "bg-orange-50 border-orange-300 text-orange-800 font-medium"
                                        : "bg-card border-border text-muted-foreground hover:border-orange-200"
                                }`}
                            >
                                {CATEGORY_LABELS[c]}
                                <span className="text-xs ml-1 opacity-70">
                                    ({Math.round(SALVAGE_BENCHMARKS[c].annualRate * 100)}%/yr)
                                </span>
                            </button>
                        ))}
                    </div>
                </div>

                <div>
                    <Label htmlFor="rate">Annual Depreciation Rate</Label>
                    <div className="relative mt-1.5">
                        <Input
                            id="rate"
                            type="number"
                            min={1}
                            max={50}
                            value={state.rate}
                            onChange={(e) => {
                                update({ rate: Number(e.target.value) });
                                trackOnce();
                            }}
                        />
                        <span className="absolute right-3 top-1/2 -translate-y-1/2 text-muted-foreground text-sm">
                            %
                        </span>
                    </div>
                    <p className="text-xs text-muted-foreground mt-1">
                        Auto-suggested based on category. Adjust to match your
                        specific situation.
                    </p>
                </div>
            </div>

            {/* Outputs */}
            <div className="lg:col-span-7 space-y-6">
                {/* Hero metric */}
                <div className="rounded-xl border bg-card p-6">
                    <p className="text-sm font-medium text-muted-foreground mb-1">
                        Estimated Salvage Value
                    </p>
                    <p className="text-4xl font-bold text-foreground tracking-tight">
                        {formatCurrency(result.salvageValue)}
                    </p>
                    <div className="flex flex-wrap gap-x-6 gap-y-2 mt-4 text-sm">
                        <div>
                            <span className="text-muted-foreground">
                                Total Depreciation:{" "}
                            </span>
                            <span className="font-medium">
                                {formatCurrency(result.totalDepreciation)}
                            </span>
                        </div>
                        <div>
                            <span className="text-muted-foreground">
                                Value Retained:{" "}
                            </span>
                            <span className="font-medium">
                                {(100 - result.depreciationPercent).toFixed(0)}%
                            </span>
                        </div>
                    </div>

                    {/* Visual bar */}
                    <div className="mt-4 h-3 rounded-full bg-muted/50 overflow-hidden flex">
                        <div
                            className="bg-orange-500 rounded-l-full transition-all duration-300"
                            style={{
                                width: `${result.depreciationPercent}%`,
                            }}
                            title={`Depreciation: ${formatCurrency(result.totalDepreciation)}`}
                        />
                        <div
                            className="bg-emerald-400 rounded-r-full transition-all duration-300"
                            style={{
                                width: `${100 - result.depreciationPercent}%`,
                            }}
                            title={`Salvage: ${formatCurrency(result.salvageValue)}`}
                        />
                    </div>
                    <div className="flex justify-between text-xs text-muted-foreground mt-1.5">
                        <span>
                            Depreciation ({result.depreciationPercent.toFixed(0)}%)
                        </span>
                        <span>
                            Salvage ({(100 - result.depreciationPercent).toFixed(0)}%)
                        </span>
                    </div>
                </div>

                {/* Value timeline chart */}
                <div className="rounded-xl border bg-card p-6">
                    <h3 className="font-semibold text-foreground mb-4">
                        Value Over Time
                    </h3>
                    <SvgLineChart
                        series={chartSeries}
                        xLabels={xLabels}
                        height={240}
                    />
                </div>

                {/* Benchmark comparison */}
                <div className="rounded-xl border bg-card overflow-hidden">
                    <div className="px-6 py-4 border-b bg-muted/30">
                        <h3 className="font-semibold text-foreground">
                            Industry Benchmark Comparison
                        </h3>
                        <p className="text-xs text-muted-foreground mt-0.5">
                            Salvage value of a {formatCurrency(price)} asset
                            after {life} years by category
                        </p>
                    </div>
                    <div className="overflow-x-auto">
                        <table className="w-full text-sm">
                            <thead>
                                <tr className="border-b border-border/50 text-muted-foreground">
                                    <th className="text-left py-3 px-4 font-medium sticky left-0 bg-card">
                                        Category
                                    </th>
                                    <th className="text-right py-3 px-4 font-medium">
                                        Annual Rate
                                    </th>
                                    <th className="text-right py-3 px-4 font-medium">
                                        Salvage Value
                                    </th>
                                </tr>
                            </thead>
                            <tbody>
                                {benchmarkComparison.map((b) => (
                                    <tr
                                        key={b.category}
                                        className={`border-b border-border/30 last:border-0 ${
                                            b.isSelected
                                                ? "bg-orange-50/50"
                                                : ""
                                        }`}
                                    >
                                        <td className="py-2.5 px-4 font-medium sticky left-0 bg-card">
                                            {b.isSelected && (
                                                <span className="inline-block w-2 h-2 rounded-full bg-orange-500 mr-2" />
                                            )}
                                            {b.label}
                                        </td>
                                        <td className="py-2.5 px-4 text-right text-muted-foreground">
                                            {(b.rate * 100).toFixed(0)}%
                                        </td>
                                        <td
                                            className={`py-2.5 px-4 text-right font-medium ${
                                                b.isSelected
                                                    ? "text-orange-600"
                                                    : ""
                                            }`}
                                        >
                                            {formatCurrency(b.salvageValue)}
                                        </td>
                                    </tr>
                                ))}
                            </tbody>
                        </table>
                    </div>
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
                        Know what your equipment is worth
                    </h3>
                    <p className="text-sm text-muted-foreground mb-4">
                        Shelf tracks every asset&apos;s value, location, and
                        custody with QR codes and automatic logs. Free forever
                        for individuals.
                    </p>
                    <Button
                        className="bg-orange-600 hover:bg-orange-700 text-white"
                        asChild
                    >
                        <TrackedLink
                            href="https://app.shelf.nu/join?utm_source=shelf_website&utm_medium=cta&utm_content=tool_salvage"
                            eventName="tool_cta_click"
                            eventProps={{ tool: "salvage", cta: "signup" }}
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
