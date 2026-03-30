"use client";

import { useState, useEffect } from "react";

/**
 * Detects whether the current browser has an active Shelf session
 * by reading the `shelf_is_signed_in` marker cookie set by the app.
 *
 * Returns `null` until hydration completes (to avoid flash of wrong CTA),
 * then `true` or `false`.
 */
export function useIsSignedIn(): boolean | null {
  const [isSignedIn, setIsSignedIn] = useState<boolean | null>(null);

  useEffect(() => {
    setIsSignedIn(document.cookie.includes("shelf_is_signed_in=1"));
  }, []);

  return isSignedIn;
}
