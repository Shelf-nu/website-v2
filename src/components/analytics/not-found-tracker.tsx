"use client";

import { useEffect } from "react";
import { trackEvent } from "@/lib/analytics";

/**
 * Fires a `404_hit` analytics event when mounted.
 * Captures the path and referrer so we can find broken inbound links.
 */
export function NotFoundTracker() {
    useEffect(() => {
        trackEvent("404_hit", {
            path: window.location.pathname,
            referrer: document.referrer || "",
        });
    }, []);

    return null;
}
