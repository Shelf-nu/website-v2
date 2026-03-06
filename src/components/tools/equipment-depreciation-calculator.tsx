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
    calculate,
    calculateAll,
    METHOD_LABELS,
    type DepreciationMethod,
} from "@/lib/depreciation";
import { SvgLineChart, type ChartSeries } from "./shared/svg-line-chart";
import { TrackedLink } from "@/components/analytics/tracked-link";

const METHODS: DepreciationMethod[] = [
    "straight-line",
    "declining-balance",
    "double-declining",
    "sum-of-years",
];

const LIFE_PRESETS = [3, 5, 7, 10, 15, 20];

const METHOD_COLORS: Record<DepreciationMethod, string> = {
    "straight-line": "#ea580c",
    "declining-balance": "#2563eb",
    "double-declining": "#16a34a",
    "sum-of-years": "#9333ea",
};

const DEFAULTS = {
    cost: 25000,
    salvage: 2500,
    life: 5,
    method: "straight-line" as string,
    compare: false,
};

export function EquipmentDepreciationCalculator() {
    const [state, update] = useUrlState(DEFAULTS);
    const [copied, setCopied] = useState(false);
    const [tracked, setTracked] = useState(false);

    const cost = Math.max(1, state.cost);
    const salvage = Math.max(0, Math.min(state.salvage, cost - 1));
    const life = Math.max(1, Math.min(state.life, 40));
    const method = state.method as DepreciationMethod;
    const compareAll = state.compare;

    // Track first meaningful interaction
    function trackOnce() {
        if (!tracked) {
            trackEvent("tool_calculate", { tool: "depreciation", method });
            setTracked(true);
        }
    }

    const schedule = useMemo(
        () => calculate(method, cost, salvage, life),
        [method, cost, salvage, life]
    );

    const allSchedules = useMemo(
        () => (compareAll ? calculateAll(cost, salvage, life) : null),
        [compareAll, cost, salvage, life]
    );

    const annualDepreciation = schedule[0]?.expense ?? 0;

    // Chart data for comparison mode
    const chartSeries = useMemo((): ChartSeries[] => {
        if (!allSchedules) return [];
        return METHODS.map((m) => ({
            label: METHOD_LABELS[m],
            color: METHOD_COLORS[m],
            data: allSchedules[m].map((r) => r.endingValue),
        }));
    }, [allSchedules]);

    const xLabels = useMemo(
        () => Array.from({ length: life }, (_, i) => `Yr ${i + 1}`),
        [life]
    );

    function generateSummary(): string {
        const lines = [
            "Equipment Depreciation Summary",
            "─".repeat(40),
            `Purchase Price: ${formatCurrency(cost)}`,
            `Salvage Value: ${formatCurrency(salvage)}`,
            `Method: ${METHOD_LABELS[method]}`,
            `Useful Life: ${life} years`,
            `Annual Depreciation (Year 1): ${formatCurrency(annualDepreciation)}`,
            `Total Depreciation: ${formatCurrency(cost - salvage)}`,
            "",
            "Year-by-Year Schedule:",
            ...schedule.map(
                (r) =>
                    `  Year ${r.year}: ${formatCurrency(r.expense)} depreciation → ${formatCurrency(r.endingValue)} book value`
            ),
            "",
            "Generated at shelf.nu/tools/equipment-depreciation-calculator",
        ];
        return lines.join("\n");
    }

    async function handleCopy() {
        await navigator.clipboard.writeText(generateSummary());
        setCopied(true);
        trackEvent("tool_share", { tool: "depreciation", action: "copy_summary" });
        setTimeout(() => setCopied(false), 2000);
    }

    return (
        <div className="grid lg:grid-cols-12 gap-8 items-start">
            {/* Inputs */}
            <div className="lg:col-span-5 space-y-6">
                <div>
                    <Label htmlFor="cost">Purchase Price</Label>
                    <div className="relative mt-1.5">
                        <span className="absolute left-3 top-1/2 -translate-y-1/2 text-muted-foreground text-sm">$</span>
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
                </div>

                <div>
                    <Label htmlFor="salvage">Salvage Value</Label>
                    <div className="relative mt-1.5">
                        <span className="absolute left-3 top-1/2 -translate-y-1/2 text-muted-foreground text-sm">$</span>
                        <Input
                            id="salvage"
                            type="number"
                            min={0}
                            max={cost - 1}
                            value={state.salvage}
                            onChange={(e) => {
                                update({ salvage: Number(e.target.value) });
                                trackOnce();
                            }}
                            className="pl-7"
                        />
                    </div>
                    <p className="text-xs text-muted-foreground mt-1">
                        Estimated value at end of useful life
                    </p>
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
                    <div className="flex flex-wrap gap-1.5 mt-2">
                        {LIFE_PRESETS.map((n) => (
                            <button
                                key={n}
                                onClick={() => {
                                    update({ life: n });
                                    trackOnce();
                                }}
                                className={`px-2.5 py-1 text-xs rounded-full border transition-colors ${
                                    state.life === n
                                        ? "bg-orange-600 text-white border-orange-600"
                                        : "bg-muted/50 text-muted-foreground border-border hover:border-orange-300"
                                }`}
                            >
                                {n} yr
                            </button>
                        ))}
                    </div>
                </div>

                <div>
                    <Label>Depreciation Method</Label>
                    <div className="grid grid-cols-1 gap-2 mt-1.5" role="radiogroup" aria-label="Depreciation method">
                        {METHODS.map((m) => (
                            <button
                                key={m}
                                role="radio"
                                aria-checked={method === m}
                                onClick={() => {
                                    update({ method: m });
                                    trackOnce();
                                }}
                                className={`px-3 py-2 text-sm text-left rounded-lg border transition-colors ${
                                    method === m
                                        ? "bg-orange-50 border-orange-300 text-orange-800 font-medium"
                                        : "bg-card border-border text-muted-foreground hover:border-orange-200"
                                }`}
                            >
                                {METHOD_LABELS[m]}
                            </button>
                        ))}
                    </div>
                </div>

                <div>
                    <label className="flex items-center gap-3 cursor-pointer">
                        <input
                            type="checkbox"
                            checked={compareAll}
                            onChange={(e) => {
                                update({ compare: e.target.checked });
                                if (e.target.checked) {
                                    trackEvent("tool_interact", {
                                        tool: "depreciation",
                                        action: "compare_methods",
                                    });
                                }
                            }}
                            className="h-4 w-4 rounded border-border text-orange-600 focus:ring-orange-500"
                        />
                        <span className="text-sm font-medium text-foreground">
                            Compare all methods
                        </span>
                    </label>
                </div>
            </div>

            {/* Outputs */}
            <div className="lg:col-span-7 space-y-6">
                {/* Hero metric */}
                <div className="rounded-xl border bg-card p-6">
                    <p className="text-sm font-medium text-muted-foreground mb-1">
                        Annual Depreciation (Year 1)
                    </p>
                    <p className="text-4xl font-bold text-foreground tracking-tight">
                        {formatCurrency(annualDepreciation)}
                    </p>
                    <div className="flex flex-wrap gap-x-6 gap-y-2 mt-4 text-sm">
                        <div>
                            <span className="text-muted-foreground">Total Depreciation: </span>
                            <span className="font-medium">{formatCurrency(cost - salvage)}</span>
                        </div>
                        <div>
                            <span className="text-muted-foreground">Book Value (End): </span>
                            <span className="font-medium">{formatCurrency(salvage)}</span>
                        </div>
                    </div>

                    {/* Visual bar */}
                    <div className="mt-4 h-3 rounded-full bg-muted/50 overflow-hidden flex">
                        <div
                            className="bg-orange-500 rounded-l-full transition-all duration-300"
                            style={{ width: `${((cost - salvage) / cost) * 100}%` }}
                            title={`Depreciation: ${formatCurrency(cost - salvage)}`}
                        />
                        <div
                            className="bg-emerald-400 rounded-r-full transition-all duration-300"
                            style={{ width: `${(salvage / cost) * 100}%` }}
                            title={`Salvage: ${formatCurrency(salvage)}`}
                        />
                    </div>
                    <div className="flex justify-between text-xs text-muted-foreground mt-1.5">
                        <span>Depreciation ({(((cost - salvage) / cost) * 100).toFixed(0)}%)</span>
                        <span>Salvage ({((salvage / cost) * 100).toFixed(0)}%)</span>
                    </div>
                </div>

                {/* Comparison chart */}
                {compareAll && chartSeries.length > 0 && (
                    <div className="rounded-xl border bg-card p-6">
                        <h3 className="font-semibold text-foreground mb-4">
                            Book Value by Method
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
                            {METHOD_LABELS[method]} Schedule
                        </h3>
                    </div>
                    <div className="overflow-x-auto">
                        <table className="w-full text-sm">
                            <thead>
                                <tr className="border-b border-border/50 text-muted-foreground">
                                    <th className="text-left py-3 px-4 font-medium sticky left-0 bg-card">Year</th>
                                    <th className="text-right py-3 px-4 font-medium">Beginning</th>
                                    <th className="text-right py-3 px-4 font-medium">Depreciation</th>
                                    <th className="text-right py-3 px-4 font-medium">Accumulated</th>
                                    <th className="text-right py-3 px-4 font-medium">Book Value</th>
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
                                            {formatCurrency(row.beginningValue)}
                                        </td>
                                        <td className="py-2.5 px-4 text-right font-medium text-orange-600">
                                            {formatCurrency(row.expense)}
                                        </td>
                                        <td className="py-2.5 px-4 text-right text-muted-foreground">
                                            {formatCurrency(row.accumulated)}
                                        </td>
                                        <td className="py-2.5 px-4 text-right">
                                            {formatCurrency(row.endingValue)}
                                        </td>
                                    </tr>
                                ))}
                            </tbody>
                        </table>
                    </div>
                </div>

                {/* Comparison summary cards */}
                {compareAll && allSchedules && (
                    <div className="grid grid-cols-2 gap-3">
                        {METHODS.map((m) => {
                            const rows = allSchedules[m];
                            const yr1 = rows[0]?.expense ?? 0;
                            return (
                                <div
                                    key={m}
                                    className={`rounded-lg border p-4 ${
                                        m === method
                                            ? "border-orange-300 bg-orange-50/50"
                                            : "border-border bg-card"
                                    }`}
                                >
                                    <div
                                        className="w-3 h-3 rounded-full mb-2"
                                        style={{ backgroundColor: METHOD_COLORS[m] }}
                                    />
                                    <p className="text-xs text-muted-foreground mb-0.5">
                                        {METHOD_LABELS[m]}
                                    </p>
                                    <p className="text-lg font-bold">
                                        {formatCurrency(yr1)}
                                        <span className="text-xs font-normal text-muted-foreground ml-1">
                                            /yr 1
                                        </span>
                                    </p>
                                </div>
                            );
                        })}
                    </div>
                )}

                {/* Copy & CTA */}
                <div className="flex flex-col sm:flex-row gap-3">
                    <Button variant="outline" onClick={handleCopy} className="gap-2">
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
                        Shelf gives each asset a QR code, custody trail, and booking calendar.
                        Know where every item is and who has it. Free forever for individuals.
                    </p>
                    <Button className="bg-orange-600 hover:bg-orange-700 text-white" asChild>
                        <TrackedLink
                            href="https://app.shelf.nu/join?utm_source=shelf_website&utm_medium=cta&utm_content=tool_depreciation"
                            eventName="tool_cta_click"
                            eventProps={{ tool: "depreciation", cta: "signup" }}
                        >
                            Start tracking free <ArrowRight className="ml-1 h-4 w-4" />
                        </TrackedLink>
                    </Button>
                </div>
            </div>
        </div>
    );
}
