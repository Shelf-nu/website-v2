"use client";

import Link from "next/link";
import { trackEvent } from "@/lib/analytics";
import type { ComponentPropsWithoutRef } from "react";

type TrackedLinkProps = ComponentPropsWithoutRef<typeof Link> & {
    /** Event name to fire on click (e.g. "signup_click") */
    eventName: string;
    /** Optional properties to attach to the event */
    eventProps?: Record<string, string>;
};

/**
 * A `Link` that fires a trackEvent on click.
 * Use in server components where inline onClick handlers aren't available.
 */
export function TrackedLink({
    eventName,
    eventProps,
    onClick,
    ...props
}: TrackedLinkProps) {
    return (
        <Link
            {...props}
            onClick={(e) => {
                trackEvent(eventName, eventProps);
                onClick?.(e);
            }}
        />
    );
}
