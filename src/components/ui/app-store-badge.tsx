"use client";

import Link from "next/link";
import { Apple } from "lucide-react";
import { Button, type ButtonProps } from "@/components/ui/button";

const APP_STORE_URL = "https://apps.apple.com/app/id6765639874";

interface AppStoreBadgeProps {
    className?: string;
    variant?: ButtonProps["variant"];
    size?: ButtonProps["size"];
}

/**
 * App Store download CTA — built on the shared <Button> primitive so it
 * inherits the design system (brand tokens, sizing, focus ring, icon styling).
 * NOT Apple's official badge graphic: the lucide apple glyph is a generic
 * platform indicator, not Apple's trademarked mark. If Apple's official
 * "Download on the App Store" artwork is added to /public/images/mobile-app/,
 * swap to an <Image> per Apple's brand guidelines (used unmodified).
 */
export function AppStoreBadge({
    className,
    variant = "default",
    size = "lg",
}: AppStoreBadgeProps) {
    return (
        <Button asChild variant={variant} size={size} className={className}>
            <Link
                href={APP_STORE_URL}
                target="_blank"
                rel="noopener noreferrer"
                aria-label="Download Shelf Companion on the App Store"
            >
                <Apple aria-hidden="true" />
                Download on the App Store
            </Link>
        </Button>
    );
}
