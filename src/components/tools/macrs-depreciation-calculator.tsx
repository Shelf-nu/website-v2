"use client";

import { useMemo, useState } from "react";
import { Copy, Check, ArrowRight } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { useUrlState } from "@/lib/use-url-state";
import { formatCurrency } from "@/lib/utils";
import { trackEvent } from "@/lib/analytics";
import { calculateMacrs, type DepSystem } from "@/lib/macrs";
import {
    PROPERTY_CLASS_LABELS,
    PROPERTY_CLASS_EXAMPLES,
    type PropertyClass,
} from "@/data/macrs-tables";
import { SvgLineChart, type ChartSeries } from "./shared/svg-line-chart";
import { TrackedLink } from "@/components/analytics/tracked-link";

const PROPERTY_CLASSES: PropertyClass[] = ["3", "5", "7", "10", "15", "20"];

const DEFAULTS = {
    cost: 15000,
    class: "5" as string,
    system: "gds" as string,
    taxRate: 0,
};

export function MacrsDepreciationCalculator() {
    const [state, update] = useUrlState(DEFAULTS);
    const [copied, setCopied] = useState(false);
    const [tracked, setTracked] = useState(false);

    const cost = Math.max(1, state.cost);
    const propertyClass = state.class as PropertyClass;
    const system = state.system as DepSystem;
    const taxRate = Math.max(0, Math.min(state.taxRate, 50));
    const showTax = taxRate > 0;

    function trackOnce() {
        if (!tracked) {
            trackEvent("tool_calculate", {
                tool: "macrs",
                class: propertyClass,
                system,
            });
            setTracked(true);
        }
    }

    const schedule = useMemo(
        () => calculateMacrs(cost, propertyClass, system, showTax ? taxRate : undefined),
        [cost, propertyClass, system, showTax, taxRate]
    );

    const yr1Depreciation = schedule[0]?.depreciation ?? 0;
    const totalTaxSavings = showTax
        ? schedule.reduce((sum, r) => sum + (r.taxSavings ?? 0), 0)
        : null;

    const chartSeries = useMemo((): ChartSeries[] => {
        const series: ChartSeries[] = [
            {
                label: "Book Value",
                color: "#ea580c",
                data: schedule.map((r) => r.bookValue),
            },
        ];
        if (showTax) {
            series.push({
                label: "Cumulative Tax Savings",
                color: "#16a34a",
                data: schedule.reduce<number[]>((acc, r) => {
                    const prev = acc.length > 0 ? acc[acc.length - 1] : 0;
                    acc.push(prev + (r.taxSavings ?? 0));
                    return acc;
                }, []),
            });
        }
        return series;
    }, [schedule, showTax]);

    const xLabels = useMemo(
        () => schedule.map((r) => `Yr ${r.year}`),
        [schedule]
    );

    function generateSummary(): string {
        const lines = [
            "MACRS Depreciation Summary",
            "\u2500".repeat(40),
            `Cost Basis: ${formatCurrency(cost)}`,
            `Property Class: ${PROPERTY_CLASS_LABELS[propertyClass]}`,
            `System: ${system.toUpperCase()}`,
            `Year 1 Depreciation: ${formatCurrency(yr1Depreciation)}`,
            `Total Recovery: ${formatCurrency(cost)}`,
            ...(showTax
                ? [
                      `Tax Rate: ${taxRate}%`,
                      `Total Tax Savings: ${formatCurrency(totalTaxSavings ?? 0)}`,
                  ]
                : []),
            "",
            "Year-by-Year Schedule:",
            ...schedule.map(
                (r) =>
                    `  Year ${r.year}: ${r.rate.toFixed(2)}% → ${formatCurrency(r.depreciation)} depreciation → ${formatCurrency(r.bookValue)} book value${r.taxSavings != null ? ` (${formatCurrency(r.taxSavings)} tax savings)` : ""}`
            ),
            "",
            "Generated at shelf.nu/tools/macrs-depreciation-calculator",
        ];
        return lines.join("\n");
    }

    async function handleCopy() {
        await navigator.clipboard.writeText(generateSummary());
        setCopied(true);
        trackEvent("tool_share", { tool: "macrs", action: "copy_summary" });
        setTimeout(() => setCopied(false), 2000);
    }

    return (
        <div className="grid lg:grid-cols-12 gap-8 items-start">
            {/* Inputs */}
            <div className="lg:col-span-5 space-y-6">
                <div>
                    <Label htmlFor="cost">Cost Basis</Label>
                    <div className="relative mt-1.5">
                        <span className="absolute left-3 top-1/2 -translate-y-1/2 text-muted-foreground text-sm">
                            $
                        </span>
                        <Input
                            id="cost"
                            type="number"
                            min={1}
                            max={10000000}
                            value={state.cost}
                            onChange={(e) => {
                                update({ cost: Number(e.target.value) });
                                trackOnce();
                            }}
                            className="pl-7"
                        />
                    </div>
                    <p className="text-xs text-muted-foreground mt-1">
                        Original cost of the asset (before any deductions)
                    </p>
                </div>

                <div>
                    <Label>Property Class</Label>
                    <div
                        className="grid grid-cols-3 gap-2 mt-1.5"
                        role="radiogroup"
                        aria-label="Property class"
                    >
                        {PROPERTY_CLASSES.map((c) => (
                            <button
                                key={c}
                                role="radio"
                                aria-checked={propertyClass === c}
                                onClick={() => {
                                    update({ class: c });
                                    trackOnce();
                                }}
                                className={`px-3 py-2.5 text-sm text-center rounded-lg border transition-colors ${
                                    propertyClass === c
                                        ? "bg-orange-50 border-orange-300 text-orange-800 font-medium"
                                        : "bg-card border-border text-muted-foreground hover:border-orange-200"
                                }`}
                            >
                                {c}-Year
                            </button>
                        ))}
                    </div>
                    <p className="text-xs text-muted-foreground mt-2">
                        {PROPERTY_CLASS_EXAMPLES[propertyClass]}
                    </p>
                </div>

                <div>
                    <Label>Depreciation System</Label>
                    <div
                        className="grid grid-cols-2 gap-2 mt-1.5"
                        role="radiogroup"
                        aria-label="Depreciation system"
                    >
                        {(["gds", "ads"] as DepSystem[]).map((s) => (
                            <button
                                key={s}
                                role="radio"
                                aria-checked={system === s}
                                onClick={() => {
                                    update({ system: s });
                                    trackOnce();
                                }}
                                className={`px-3 py-2.5 text-sm text-center rounded-lg border transition-colors ${
                                    system === s
                                        ? "bg-orange-50 border-orange-300 text-orange-800 font-medium"
                                        : "bg-card border-border text-muted-foreground hover:border-orange-200"
                                }`}
                            >
                                {s.toUpperCase()}
                            </button>
                        ))}
                    </div>
                    <p className="text-xs text-muted-foreground mt-1">
                        {system === "gds"
                            ? "General Depreciation System (200% DB switching to SL) — most common"
                            : "Alternative Depreciation System (straight-line over longer period)"}
                    </p>
                </div>

                <div>
                    <Label htmlFor="taxRate">
                        Tax Rate (optional)
                    </Label>
                    <div className="relative mt-1.5">
                        <Input
                            id="taxRate"
                            type="number"
                            min={0}
                            max={50}
                            value={state.taxRate}
                            onChange={(e) => {
                                update({ taxRate: Number(e.target.value) });
                                trackOnce();
                            }}
                        />
                        <span className="absolute right-3 top-1/2 -translate-y-1/2 text-muted-foreground text-sm">
                            %
                        </span>
                    </div>
                    <p className="text-xs text-muted-foreground mt-1">
                        Enter your marginal tax rate to see estimated tax
                        savings per year
                    </p>
                </div>
            </div>

            {/* Outputs */}
            <div className="lg:col-span-7 space-y-6">
                {/* Hero metric */}
                <div className="rounded-xl border bg-card p-6">
                    <p className="text-sm font-medium text-muted-foreground mb-1">
                        Year 1 Depreciation
                    </p>
                    <p className="text-4xl font-bold text-foreground tracking-tight">
                        {formatCurrency(yr1Depreciation)}
                    </p>
                    <div className="flex flex-wrap gap-x-6 gap-y-2 mt-4 text-sm">
                        <div>
                            <span className="text-muted-foreground">
                                Total Recovery:{" "}
                            </span>
                            <span className="font-medium">
                                {formatCurrency(cost)}
                            </span>
                        </div>
                        <div>
                            <span className="text-muted-foreground">
                                Recovery Period:{" "}
                            </span>
                            <span className="font-medium">
                                {schedule.length} years
                            </span>
                        </div>
                        {showTax && totalTaxSavings != null && (
                            <div>
                                <span className="text-muted-foreground">
                                    Total Tax Savings:{" "}
                                </span>
                                <span className="font-medium text-emerald-600">
                                    {formatCurrency(totalTaxSavings)}
                                </span>
                            </div>
                        )}
                    </div>

                    {/* Visual bar — shows % recovered in year 1 */}
                    <div className="mt-4 h-3 rounded-full bg-muted/50 overflow-hidden">
                        <div
                            className="bg-orange-500 rounded-full transition-all duration-300 h-full"
                            style={{
                                width: `${(yr1Depreciation / cost) * 100}%`,
                            }}
                            title={`Year 1: ${((yr1Depreciation / cost) * 100).toFixed(1)}% recovered`}
                        />
                    </div>
                    <p className="text-xs text-muted-foreground mt-1.5">
                        {((yr1Depreciation / cost) * 100).toFixed(1)}% recovered
                        in Year 1
                    </p>
                </div>

                {/* Chart */}
                {chartSeries.length > 0 && (
                    <div className="rounded-xl border bg-card p-6">
                        <h3 className="font-semibold text-foreground mb-4">
                            {showTax
                                ? "Book Value & Tax Savings"
                                : "Book Value Over Time"}
                        </h3>
                        <SvgLineChart
                            series={chartSeries}
                            xLabels={xLabels}
                            height={260}
                        />
                    </div>
                )}

                {/* Schedule table */}
                <div className="rounded-xl border bg-card overflow-hidden">
                    <div className="px-6 py-4 border-b bg-muted/30">
                        <h3 className="font-semibold text-foreground">
                            {system.toUpperCase()} Schedule —{" "}
                            {PROPERTY_CLASS_LABELS[propertyClass]}
                        </h3>
                    </div>
                    <div className="overflow-x-auto">
                        <table className="w-full text-sm">
                            <thead>
                                <tr className="border-b border-border/50 text-muted-foreground">
                                    <th className="text-left py-3 px-4 font-medium sticky left-0 bg-card">
                                        Year
                                    </th>
                                    <th className="text-right py-3 px-4 font-medium">
                                        Rate
                                    </th>
                                    <th className="text-right py-3 px-4 font-medium">
                                        Depreciation
                                    </th>
                                    <th className="text-right py-3 px-4 font-medium">
                                        Accumulated
                                    </th>
                                    <th className="text-right py-3 px-4 font-medium">
                                        Book Value
                                    </th>
                                    {showTax && (
                                        <th className="text-right py-3 px-4 font-medium">
                                            Tax Savings
                                        </th>
                                    )}
                                </tr>
                            </thead>
                            <tbody>
                                {schedule.map((row) => (
                                    <tr
                                        key={row.year}
                                        className="border-b border-border/30 last:border-0"
                                    >
                                        <td className="py-2.5 px-4 font-medium sticky left-0 bg-card">
                                            {row.year}
                                        </td>
                                        <td className="py-2.5 px-4 text-right text-muted-foreground">
                                            {row.rate.toFixed(2)}%
                                        </td>
                                        <td className="py-2.5 px-4 text-right font-medium text-orange-600">
                                            {formatCurrency(row.depreciation)}
                                        </td>
                                        <td className="py-2.5 px-4 text-right text-muted-foreground">
                                            {formatCurrency(row.accumulated)}
                                        </td>
                                        <td className="py-2.5 px-4 text-right">
                                            {formatCurrency(row.bookValue)}
                                        </td>
                                        {showTax && (
                                            <td className="py-2.5 px-4 text-right text-emerald-600">
                                                {formatCurrency(
                                                    row.taxSavings ?? 0
                                                )}
                                            </td>
                                        )}
                                    </tr>
                                ))}
                            </tbody>
                        </table>
                    </div>
                </div>

                {/* Copy & CTA */}
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
                        Track every asset you&apos;re depreciating
                    </h3>
                    <p className="text-sm text-muted-foreground mb-4">
                        Shelf gives each asset a QR code, custody trail, and
                        booking calendar. Know where every item is and who has
                        it. Free forever for individuals.
                    </p>
                    <Button
                        className="bg-orange-600 hover:bg-orange-700 text-white"
                        asChild
                    >
                        <TrackedLink
                            href="https://app.shelf.nu/join?utm_source=shelf_website&utm_medium=cta&utm_content=tool_macrs"
                            eventName="tool_cta_click"
                            eventProps={{ tool: "macrs", cta: "signup" }}
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
