import Image from "next/image";
import { Star } from "lucide-react";
import { cn } from "@/lib/utils";

/**
 * Reusable "5.0/5 on G2" trust badge. Extracted from the pricing page so the
 * same badge can be dropped onto tool pages and other conversion surfaces.
 */
export function G2Badge({ className }: { className?: string }) {
    return (
        <a
            href="https://www.g2.com/products/shelf-asset-management/reviews"
            target="_blank"
            rel="noopener noreferrer"
            className={cn(
                "inline-flex items-center gap-2 px-4 py-2 rounded-full bg-background border border-border/50 hover:bg-muted/50 transition-colors group",
                className,
            )}
        >
            <div className="relative h-5 w-5">
                <Image src="/logos/g2-logo.webp" alt="G2 Logo" fill sizes="20px" className="object-contain" />
            </div>
            <div className="flex gap-0.5">
                {[1, 2, 3, 4, 5].map((i) => (
                    <Star key={i} className="h-3 w-3 fill-orange-500 text-orange-500" />
                ))}
            </div>
            <span className="text-xs font-medium text-muted-foreground group-hover:text-foreground transition-colors">
                5.0/5 on G2
            </span>
        </a>
    );
}
