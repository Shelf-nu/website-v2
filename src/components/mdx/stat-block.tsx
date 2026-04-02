import { cn } from "@/lib/utils";

interface StatItem {
    value: string;
    label: string;
}

interface StatBlockProps {
    stats: StatItem[];
}

export function StatBlock({ stats }: StatBlockProps) {
    return (
        <div
            className={cn(
                "not-prose my-8 grid gap-4",
                stats.length === 2 && "grid-cols-2",
                stats.length === 3 && "grid-cols-1 sm:grid-cols-3",
                stats.length >= 4 && "grid-cols-2 sm:grid-cols-4",
                stats.length === 1 && "grid-cols-1 max-w-sm"
            )}
        >
            {stats.map((stat, i) => (
                <div
                    key={i}
                    className="rounded-xl border border-border bg-card p-5 text-center shadow-sm"
                >
                    <div className="text-3xl sm:text-4xl font-bold tracking-tight text-orange-600">
                        {stat.value}
                    </div>
                    <div className="mt-1.5 text-sm text-muted-foreground leading-snug">
                        {stat.label}
                    </div>
                </div>
            ))}
        </div>
    );
}
