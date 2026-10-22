"use client";

import Link from "next/link";
import { Play } from "lucide-react";
import { trackEvent } from "@/lib/analytics";
import { Button, type ButtonProps } from "@/components/ui/button";

const PLAY_STORE_URL =
    "https://play.google.com/store/apps/details?id=com.shelf.companion";

interface PlayStoreBadgeProps {
    className?: string;
    /** Where this badge renders, e.g. "mobile_app_hero". Sent as the `location` of `app_store_click`, so every placement is attributable. */
    location: string;
    variant?: ButtonProps["variant"];
    size?: ButtonProps["size"];
}

/**
 * Google Play download CTA — built on the shared <Button> primitive so it
 * inherits the design system (brand tokens, sizing, focus ring, icon styling).
 * NOT Google's official badge graphic: the lucide play glyph is a generic
 * platform indicator, not Google Play's trademarked mark. If Google's official
 * "Get it on Google Play" artwork is added to /public/images/mobile-app/,
 * swap to an <Image> per Google Play's brand guidelines (used unmodified).
 */
export function PlayStoreBadge({
    className,
    location,
    variant = "default",
    size = "lg",
}: PlayStoreBadgeProps) {
    return (
        <Button asChild variant={variant} size={size} className={className}>
            <Link
                href={PLAY_STORE_URL}
                target="_blank"
                rel="noopener noreferrer"
                onClick={() => trackEvent("app_store_click", { platform: "android", location })}
                aria-label="Get Shelf Companion on Google Play"
            >
                <Play className="fill-current" aria-hidden="true" />
                Get it on Google Play
            </Link>
        </Button>
    );
}
