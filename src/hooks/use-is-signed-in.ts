"use client";

import { useSyncExternalStore } from "react";

/**
 * Detects whether the current browser likely has an active Shelf session
 * by checking for the `user-prefs` cookie set by app.shelf.nu.
 *
 * This cookie is set with `domain=.shelf.nu` so it's readable here.
 * We don't care if the session is actually valid — if it expired,
 * the app will handle the redirect to login.
 */

const noop = () => () => {};
const getSnapshot = () => document.cookie.includes("user-prefs=");
const getServerSnapshot = () => false;

export function useIsSignedIn(): boolean {
  return useSyncExternalStore(noop, getSnapshot, getServerSnapshot);
}
