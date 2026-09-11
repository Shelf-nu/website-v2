"use client";

import { useEffect, useState, useSyncExternalStore } from "react";

type UrlStateValue = string | number | boolean;

/**
 * Read URL search params and merge with defaults.
 * Returns `defaults` itself when no param changes a value.
 */
function readUrlState<T extends Record<string, UrlStateValue>>(
    defaults: T
): T {
    const params = new URLSearchParams(window.location.search);
    const merged = { ...defaults };

    for (const key of Object.keys(defaults) as (keyof T)[]) {
        const urlVal = params.get(key as string);
        if (urlVal !== null) {
            const defaultVal = defaults[key];
            if (typeof defaultVal === "number") {
                const num = Number(urlVal);
                if (!isNaN(num)) {
                    (merged as Record<string, unknown>)[key as string] = num;
                }
            } else if (typeof defaultVal === "boolean") {
                (merged as Record<string, unknown>)[key as string] =
                    urlVal === "true";
            } else {
                (merged as Record<string, unknown>)[key as string] = urlVal;
            }
        }
    }

    const changed = Object.keys(defaults).some(
        (key) => merged[key] !== defaults[key]
    );
    return changed ? merged : defaults;
}

/** Write non-default values to the URL via history.replaceState (no navigation). */
function writeUrlState<T extends Record<string, UrlStateValue>>(
    state: T,
    defaults: T
) {
    const params = new URLSearchParams();
    for (const [key, val] of Object.entries(state)) {
        if (val !== defaults[key]) {
            params.set(key, String(val));
        }
    }
    const search = params.toString();
    const url = search
        ? `${window.location.pathname}?${search}`
        : window.location.pathname;
    window.history.replaceState(null, "", url);
}

/**
 * Holds calculator state outside React so the URL is applied after hydration,
 * not during it. The page is prerendered with `defaults` (there is no query
 * string at build time), so the hydration render has to use them too: if it
 * renders the URL values instead, React throws a hydration mismatch (#418) and
 * discards the server HTML.
 */
function createUrlStateStore<T extends Record<string, UrlStateValue>>(
    defaults: T
) {
    let state = defaults;
    let loaded = false;
    let writeTimeout: ReturnType<typeof setTimeout> | undefined;
    const listeners = new Set<() => void>();

    // Only called after mount: during a client-side navigation render,
    // window.location still holds the previous page's URL.
    function load() {
        if (loaded) return;
        loaded = true;
        state = readUrlState(defaults);
    }

    function emit() {
        listeners.forEach((listener) => listener());
    }

    return {
        subscribe(listener: () => void) {
            listeners.add(listener);
            return () => {
                listeners.delete(listener);
            };
        },
        getSnapshot: () => state,
        getServerSnapshot: () => defaults,
        loadFromUrl() {
            const before = state;
            load();
            if (state !== before) emit();
        },
        update(updates: Partial<T>) {
            load(); // in case an edit lands before the mount effect has run
            state = { ...state, ...updates };
            emit();
            clearTimeout(writeTimeout);
            writeTimeout = setTimeout(
                () => writeUrlState(state, defaults),
                300
            );
        },
        cancelPendingWrite() {
            clearTimeout(writeTimeout);
        },
    };
}

/**
 * Syncs component state with URL search params so calculator results are linkable.
 * Renders `defaults` first, matching the prerendered HTML, then applies the URL right after mount.
 * Writes back via history.replaceState (no navigation), debounced by 300ms, and only
 * after the user changes a value, so opening a link never rewrites it.
 */
export function useUrlState<T extends Record<string, UrlStateValue>>(
    defaults: T
): [T, (updates: Partial<T>) => void] {
    const [store] = useState(() => createUrlStateStore(defaults));
    const state = useSyncExternalStore(
        store.subscribe,
        store.getSnapshot,
        store.getServerSnapshot
    );

    useEffect(() => {
        store.loadFromUrl();
        return store.cancelPendingWrite;
    }, [store]);

    return [state, store.update];
}
