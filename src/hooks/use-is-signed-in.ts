"use client";

import { useState, useEffect } from "react";

/**
 * Detects whether the current browser likely has an active Shelf session
 * by checking for the `user-prefs` cookie set by app.shelf.nu.
 *
 * This cookie is set with `domain=.shelf.nu` so it's readable here.
 * We don't care if the session is actually valid — if it expired,
 * the app will handle the redirect to login.
 */
export function useIsSignedIn(): boolean | null {
  const [isSignedIn, setIsSignedIn] = useState<boolean | null>(null);

  useEffect(() => {
    setIsSignedIn(document.cookie.includes("user-prefs="));
  }, []);

  return isSignedIn;
}
