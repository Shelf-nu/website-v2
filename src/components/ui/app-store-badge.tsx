"use client";

import Link from "next/link";
import { cn } from "@/lib/utils";

const APP_STORE_URL = "https://apps.apple.com/app/id6765639874";

interface AppStoreBadgeProps {
    className?: string;
    label?: string;
}

/**
 * App Store CTA. Plain styled link — does NOT render Apple's branded
 * "Download on the App Store" badge graphic. Until Apple's official SVG
 * is uploaded to /public/images/mobile-app/app-store-badge.svg, this
 * component renders a text link. Once the official asset is in place,
 * swap to <Image src="/images/mobile-app/app-store-badge.svg" /> per
 * Apple's brand guidelines.
 *
 * Do NOT ship a custom imitation of Apple's branded mark.
 */
export function AppStoreBadge({
    className,
    label = "Download on the App Store",
}: AppStoreBadgeProps) {
    return (
        <Link
            href={APP_STORE_URL}
            target="_blank"
            rel="noopener noreferrer"
            className={cn(
                "inline-flex items-center gap-2 rounded-md border border-border bg-background px-5 py-3 text-sm font-semibold text-foreground transition-colors hover:bg-muted/50 hover:border-foreground/30",
                className,
            )}
            aria-label="Download Shelf Companion on the App Store"
        >
            {label}
            <span aria-hidden="true">→</span>
        </Link>
    );
}
