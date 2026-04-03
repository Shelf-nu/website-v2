"use client";

import { cn } from "@/lib/utils";
import { Check, X, Minus, AlertTriangle } from "lucide-react";
import { useState } from "react";
import { trackEvent } from "@/lib/analytics";

type CellValue = string | boolean | { value: string; warning?: string; link?: string };

interface ComparisonTableProps {
    headers: string[];
    rows: {
        label: string;
        values: CellValue[];
    }[];
}

function WarningTooltip({ text }: { text: string }) {
    const [open, setOpen] = useState(false);

    return (
        <span className="relative inline-flex">
            <button
                type="button"
                className="inline-flex focus:outline-none focus-visible:ring-2 focus-visible:ring-orange-500 rounded-sm"
                aria-label="Pricing note"
                onClick={() => setOpen(!open)}
                onFocus={() => setOpen(true)}
                onBlur={() => setOpen(false)}
                onMouseEnter={() => setOpen(true)}
                onMouseLeave={() => setOpen(false)}
            >
                <AlertTriangle className="h-3.5 w-3.5 text-amber-500 flex-shrink-0 mt-0.5 cursor-help" />
            </button>
            {open && (
                <span className="absolute bottom-full left-1/2 -translate-x-1/2 mb-2 px-3 py-2 text-xs text-white bg-zinc-900 dark:bg-zinc-700 rounded-lg w-52 text-center z-10 shadow-lg" role="tooltip">
                    {text}
                </span>
            )}
        </span>
    );
}

function CellContent({ value }: { value: CellValue }) {
    if (typeof value === "boolean") {
        return value ? (
            <Check className="h-4 w-4 text-emerald-600 mx-auto" />
        ) : (
            <X className="h-4 w-4 text-zinc-300 dark:text-zinc-600 mx-auto" />
        );
    }

    if (typeof value === "object" && value !== null) {
        return (
            <span className="inline-flex items-start gap-1">
                {value.link ? (
                    <a
                        href={value.link}
                        className="text-orange-600 hover:underline"
                        onClick={() => trackEvent("comparison_link_click", { href: value.link })}
                    >
                        {value.value}
                    </a>
                ) : (
                    <span>{value.value}</span>
                )}
                {value.warning && <WarningTooltip text={value.warning} />}
            </span>
        );
    }

    if (value === "—") {
        return <Minus className="h-4 w-4 text-zinc-300 dark:text-zinc-600 mx-auto" />;
    }

    return <span>{value}</span>;
}

export function ComparisonTable({ headers, rows }: ComparisonTableProps) {
    return (
        <div className="not-prose my-8 overflow-x-auto rounded-xl border border-border shadow-sm">
            <table className="w-full text-sm">
                <thead>
                    <tr className="bg-muted/50">
                        <th className="text-left px-4 py-3 font-semibold text-foreground border-b border-border/60 sticky left-0 bg-muted/50 min-w-[140px]">
                            Feature
                        </th>
                        {headers.map((header, i) => (
                            <th
                                key={i}
                                className={cn(
                                    "px-4 py-3 font-semibold border-b border-border/60 text-center min-w-[120px]",
                                    i === 0
                                        ? "text-orange-600 bg-orange-50/40 dark:bg-orange-950/20"
                                        : "text-foreground"
                                )}
                            >
                                {header}
                            </th>
                        ))}
                    </tr>
                </thead>
                <tbody>
                    {rows.map((row, rowIdx) => (
                        <tr
                            key={rowIdx}
                            className={cn(
                                "border-b border-border/30",
                                rowIdx % 2 === 0
                                    ? "bg-transparent"
                                    : "bg-muted/20"
                            )}
                        >
                            <td className="px-4 py-3 font-medium text-foreground sticky left-0 bg-inherit">
                                {row.label}
                            </td>
                            {headers.map((_, colIdx) => {
                                const value = colIdx < row.values.length ? row.values[colIdx] : "—";
                                return (
                                    <td
                                        key={colIdx}
                                        className={cn(
                                            "px-4 py-3 text-center text-muted-foreground",
                                            colIdx === 0 &&
                                                "bg-orange-50/20 dark:bg-orange-950/10"
                                        )}
                                    >
                                        <CellContent value={value} />
                                    </td>
                                );
                            })}
                        </tr>
                    ))}
                </tbody>
            </table>
        </div>
    );
}
