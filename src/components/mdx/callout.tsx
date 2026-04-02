import { Lightbulb, AlertTriangle, Info, CheckCircle2 } from "lucide-react";
import { cn } from "@/lib/utils";

const variants = {
    takeaway: {
        icon: Lightbulb,
        border: "border-orange-500",
        bg: "bg-orange-50/60 dark:bg-orange-950/20",
        iconColor: "text-orange-600",
        title: "Key Takeaway",
    },
    info: {
        icon: Info,
        border: "border-blue-500",
        bg: "bg-blue-50/60 dark:bg-blue-950/20",
        iconColor: "text-blue-600",
        title: "Note",
    },
    warning: {
        icon: AlertTriangle,
        border: "border-amber-500",
        bg: "bg-amber-50/60 dark:bg-amber-950/20",
        iconColor: "text-amber-600",
        title: "Important",
    },
    success: {
        icon: CheckCircle2,
        border: "border-emerald-500",
        bg: "bg-emerald-50/60 dark:bg-emerald-950/20",
        iconColor: "text-emerald-600",
        title: "Tip",
    },
} as const;

interface CalloutProps {
    type?: keyof typeof variants;
    title?: string;
    children: React.ReactNode;
}

export function Callout({ type = "takeaway", title, children }: CalloutProps) {
    const v = variants[type];
    const Icon = v.icon;

    return (
        <div
            className={cn(
                "not-prose my-8 rounded-xl border-l-4 p-5 sm:p-6",
                v.border,
                v.bg
            )}
        >
            <div className="flex items-center gap-2.5 mb-3">
                <Icon className={cn("h-5 w-5 flex-shrink-0", v.iconColor)} />
                <span className="font-semibold text-foreground text-sm uppercase tracking-wide">
                    {title || v.title}
                </span>
            </div>
            <div className="text-[0.95rem] leading-relaxed text-foreground/80 [&>p]:mt-2 [&>p:first-child]:mt-0 [&>ul]:mt-2 [&>ul]:ml-4 [&>ul]:list-disc [&>li]:mt-1">
                {children}
            </div>
        </div>
    );
}
