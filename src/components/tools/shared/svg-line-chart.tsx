"use client";

import { formatCurrency } from "@/lib/utils";

export interface ChartSeries {
    label: string;
    color: string;
    dashArray?: string;
    data: number[];
}

interface SvgLineChartProps {
    series: ChartSeries[];
    xLabels?: string[];
    yPrefix?: string;
    height?: number;
    className?: string;
}

const PADDING = { top: 20, right: 20, bottom: 40, left: 70 };
const WIDTH = 600;

export function SvgLineChart({
    series,
    xLabels,
    yPrefix = "$",
    height = 300,
    className,
}: SvgLineChartProps) {
    if (series.length === 0 || series[0].data.length === 0) return null;

    const dataLen = series[0].data.length;
    const allValues = series.flatMap((s) => s.data);
    const maxY = Math.max(...allValues) * 1.1 || 1;
    const minY = 0;

    const chartW = WIDTH - PADDING.left - PADDING.right;
    const chartH = height - PADDING.top - PADDING.bottom;

    function x(i: number) {
        return PADDING.left + (i / Math.max(dataLen - 1, 1)) * chartW;
    }
    function y(val: number) {
        return PADDING.top + chartH - ((val - minY) / (maxY - minY)) * chartH;
    }

    // Y-axis ticks (4-5 ticks)
    const tickCount = 4;
    const yTicks = Array.from({ length: tickCount + 1 }, (_, i) =>
        minY + (i / tickCount) * (maxY - minY)
    );

    // X-axis ticks
    const xTickStep = dataLen <= 10 ? 1 : Math.ceil(dataLen / 6);
    const xTicks = Array.from({ length: dataLen }, (_, i) => i).filter(
        (i) => i % xTickStep === 0 || i === dataLen - 1
    );

    function formatYLabel(v: number) {
        if (yPrefix === "$") {
            if (v >= 1_000_000) return `${formatCurrency(v / 1_000_000, 1)}M`;
            if (v >= 1_000) return `${formatCurrency(v / 1_000, 0)}K`;
            return formatCurrency(v, 0);
        }
        if (v >= 1_000_000) return `${(v / 1_000_000).toFixed(1)}M`;
        if (v >= 1_000) return `${(v / 1_000).toFixed(0)}K`;
        return v.toFixed(0);
    }

    return (
        <div className={className}>
            <svg
                viewBox={`0 0 ${WIDTH} ${height}`}
                width="100%"
                preserveAspectRatio="xMidYMid meet"
                role="img"
                aria-label="Line chart comparing values over time"
            >
                {/* Grid lines */}
                {yTicks.map((tick) => (
                    <line
                        key={tick}
                        x1={PADDING.left}
                        y1={y(tick)}
                        x2={WIDTH - PADDING.right}
                        y2={y(tick)}
                        stroke="currentColor"
                        strokeOpacity={0.08}
                        strokeWidth={1}
                    />
                ))}

                {/* Y-axis labels */}
                {yTicks.map((tick) => (
                    <text
                        key={tick}
                        x={PADDING.left - 8}
                        y={y(tick) + 4}
                        textAnchor="end"
                        className="fill-muted-foreground"
                        fontSize={11}
                    >
                        {formatYLabel(tick)}
                    </text>
                ))}

                {/* X-axis labels */}
                {xTicks.map((i) => (
                    <text
                        key={i}
                        x={x(i)}
                        y={height - 8}
                        textAnchor="middle"
                        className="fill-muted-foreground"
                        fontSize={11}
                    >
                        {xLabels ? xLabels[i] : `${i + 1}`}
                    </text>
                ))}

                {/* Data lines */}
                {series.map((s) => {
                    const points = s.data
                        .map((val, i) => `${x(i)},${y(val)}`)
                        .join(" ");
                    return (
                        <polyline
                            key={s.label}
                            points={points}
                            fill="none"
                            stroke={s.color}
                            strokeWidth={2.5}
                            strokeLinecap="round"
                            strokeLinejoin="round"
                            strokeDasharray={s.dashArray}
                        />
                    );
                })}

                {/* Data points (dots on each series endpoint) */}
                {series.map((s) => (
                    <circle
                        key={`${s.label}-end`}
                        cx={x(s.data.length - 1)}
                        cy={y(s.data[s.data.length - 1])}
                        r={4}
                        fill={s.color}
                    />
                ))}
            </svg>

            {/* Legend */}
            {series.length > 1 && (
                <div className="flex flex-wrap gap-4 mt-3 justify-center">
                    {series.map((s) => (
                        <div key={s.label} className="flex items-center gap-2 text-sm text-muted-foreground">
                            <span
                                className="inline-block w-4 h-0.5 rounded"
                                style={{ backgroundColor: s.color }}
                            />
                            {s.label}
                        </div>
                    ))}
                </div>
            )}
        </div>
    );
}
