import { cn } from "@/lib/utils";

interface SummaryBoxProps {
    title?: string;
    children: React.ReactNode;
}

export function SummaryBox({ title = "In This Section", children }: SummaryBoxProps) {
    return (
        <div
            className={cn(
                "not-prose my-8 rounded-xl border border-border bg-card/60 shadow-sm overflow-hidden"
            )}
        >
            <div className="border-b border-border/60 bg-muted/40 px-5 py-3">
                <span className="text-sm font-semibold text-foreground uppercase tracking-wide">
                    {title}
                </span>
            </div>
            <div className="px-5 py-4 text-[0.95rem] leading-relaxed text-muted-foreground [&>p]:mt-2 [&>p:first-child]:mt-0 [&>ul]:mt-2 [&>ul]:ml-4 [&>ul]:list-disc [&>li]:mt-1.5 [&>li]:text-muted-foreground">
                {children}
            </div>
        </div>
    );
}
