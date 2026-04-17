import type { CSSProperties, ReactNode } from "react";
import { cn } from "@/lib/utils";

type LogoMarqueeProps = {
    /** Pre-rendered logo items. They'll be duplicated into a second aria-hidden
     *  copy internally, so each caller's `items` only needs to render the
     *  single logical set once. */
    items: ReactNode[];
    /** CSS `animation-duration` value (e.g., "25s" or `${N * 3}s`). */
    duration: string;
    /** Gap + trailing padding classes for each half-group (e.g.,
     *  "gap-12 sm:gap-16 pr-12 sm:pr-16"). The trailing `pr-*` must equal
     *  the gap so that `translateX(-50%)` seams exactly between copies —
     *  this is what prevents the Safari seam-jump bug. */
    groupClassName: string;
    /** Optional classes applied to the outer fade-mask wrapper. */
    containerClassName?: string;
};

export function LogoMarquee({
    items,
    duration,
    groupClassName,
    containerClassName,
}: LogoMarqueeProps) {
    return (
        <div
            className={cn(
                "relative overflow-hidden [mask-image:linear-gradient(to_right,transparent,black_10%,black_90%,transparent)]",
                containerClassName
            )}
        >
            <div
                className="flex flex-nowrap animate-marquee"
                style={{ "--marquee-duration": duration } as CSSProperties}
            >
                {[0, 1].map((copy) => (
                    <div
                        key={copy}
                        className={cn("flex flex-nowrap flex-shrink-0", groupClassName)}
                        {...(copy === 1 ? { "aria-hidden": true } : {})}
                    >
                        {items}
                    </div>
                ))}
            </div>
        </div>
    );
}
