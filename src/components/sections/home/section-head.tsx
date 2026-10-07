import { cn } from "@/lib/utils";

interface SectionHeadProps {
    eyebrow?: string;
    title: string;
    lead?: string;
    align?: "center" | "left";
    className?: string;
}

/** Shared heading block for the homepage sections: eyebrow, h2, lead. */
export function SectionHead({ eyebrow, title, lead, align = "center", className }: SectionHeadProps) {
    return (
        <div className={cn("flex max-w-3xl flex-col gap-3", align === "center" ? "mx-auto items-center text-center" : "items-start text-left", className)}>
            {eyebrow && <p className="text-xs font-semibold uppercase tracking-[0.1em] text-orange-600">{eyebrow}</p>}
            <h2 className="text-3xl font-bold tracking-tight text-balance text-heading sm:text-4xl">{title}</h2>
            {lead && <p className="text-base leading-relaxed text-pretty text-caption sm:text-lg">{lead}</p>}
        </div>
    );
}
