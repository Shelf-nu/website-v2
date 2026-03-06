"use client";

import { useState, useEffect, useCallback, useRef } from "react";

/**
 * Read URL search params and merge with defaults.
 * Called as lazy initializer for useState — no effect needed.
 */
function readUrlState<T extends Record<string, string | number | boolean>>(
    defaults: T
): T {
    if (typeof window === "undefined") return defaults;
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

    return merged;
}

/**
 * Syncs component state with URL search params so calculator results are linkable.
 * Reads from URL on mount (via lazy initializer), writes back via history.replaceState (no navigation).
 * Debounces URL writes by 300ms.
 */
export function useUrlState<T extends Record<string, string | number | boolean>>(
    defaults: T
): [T, (updates: Partial<T>) => void] {
    const [state, setState] = useState<T>(() => readUrlState(defaults));
    const initialized = useRef(false);
    const timeoutRef = useRef<ReturnType<typeof setTimeout> | null>(null);

    // Mark initialized after first render
    useEffect(() => {
        initialized.current = true;
    }, []);

    // Write to URL on state change (debounced)
    useEffect(() => {
        if (!initialized.current) return;
        if (timeoutRef.current) clearTimeout(timeoutRef.current);

        timeoutRef.current = setTimeout(() => {
            const params = new URLSearchParams();
            for (const [key, val] of Object.entries(state)) {
                if (val !== defaults[key as keyof T]) {
                    params.set(key, String(val));
                }
            }
            const search = params.toString();
            const url = search
                ? `${window.location.pathname}?${search}`
                : window.location.pathname;
            window.history.replaceState(null, "", url);
        }, 300);

        return () => {
            if (timeoutRef.current) clearTimeout(timeoutRef.current);
        };
    }, [state, defaults]);

    const update = useCallback((updates: Partial<T>) => {
        setState((prev) => ({ ...prev, ...updates }));
    }, []);

    return [state, update];
}
