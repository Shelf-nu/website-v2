"use client";

import Link from "next/link";
import { Smartphone, Wrench, X } from "lucide-react";
import { useSyncExternalStore } from "react";
import { Container } from "@/components/ui/container";

/* ------------------------------------------------------------------ */
/*  Planned maintenance window — single source of truth.               */
/*  Times below are in UTC. The window is Monday June 29, 2026,         */
/*  09:00–13:00 EEST (Europe/Sofia, UTC+3) => 06:00–10:00 UTC.          */
/*  To change the window, edit only these constants.                   */
/* ------------------------------------------------------------------ */

const MAINTENANCE_START = Date.UTC(2026, 5, 29, 6, 0, 0); // 09:00 EEST
const MAINTENANCE_END = Date.UTC(2026, 5, 29, 10, 0, 0); // 13:00 EEST (communicated end)
// Keep the banner up a little past the stated end as a safety margin
// (CTO said "at least half a day"). Banner auto-hides after this time.
const MAINTENANCE_HIDE = Date.UTC(2026, 5, 29, 12, 0, 0); // 15:00 EEST

const STATUS_URL = "https://shelf.openstatus.dev";
const DISMISS_KEY = "shelf-maint-2026-06-29";

type Phase = "none" | "scheduled" | "inProgress";

/* ------------------------------------------------------------------ */
/*  Time/dismiss store — read browser-only state in a hydration-safe   */
/*  way. Server renders "none" (normal banner); the client swaps in    */
/*  the maintenance bar after hydration if the window is active.        */
/* ------------------------------------------------------------------ */

const subscribers = new Set<() => void>();
let timer: ReturnType<typeof setInterval> | null = null;

function subscribe(cb: () => void) {
    subscribers.add(cb);
    if (timer === null) {
        // Re-check the clock periodically so "scheduled" flips to
        // "inProgress" (and eventually hides) while the page stays open.
        timer = setInterval(() => subscribers.forEach((c) => c()), 30_000);
    }
    const onStorage = () => cb();
    window.addEventListener("storage", onStorage);
    return () => {
        subscribers.delete(cb);
        window.removeEventListener("storage", onStorage);
        if (subscribers.size === 0 && timer !== null) {
            clearInterval(timer);
            timer = null;
        }
    };
}

function getSnapshot(): Phase {
    try {
        if (localStorage.getItem(DISMISS_KEY) === "1") return "none";
    } catch {
        /* localStorage unavailable — keep showing the notice */
    }
    const now = Date.now();
    if (now >= MAINTENANCE_HIDE) return "none";
    if (now >= MAINTENANCE_START) return "inProgress";
    return "scheduled";
}

function getServerSnapshot(): Phase {
    return "none";
}

function notify() {
    subscribers.forEach((c) => c());
}

/** Visitor-local time, e.g. "2:00 AM". */
function fmtTime(ms: number) {
    return new Date(ms).toLocaleTimeString(undefined, {
        hour: "numeric",
        minute: "2-digit",
    });
}

/** Visitor-local date, e.g. "Mon, Jun 29". */
function fmtDate(ms: number) {
    return new Date(ms).toLocaleDateString(undefined, {
        weekday: "short",
        month: "short",
        day: "numeric",
    });
}

export function TopBanner() {
    const phase = useSyncExternalStore(
        subscribe,
        getSnapshot,
        getServerSnapshot
    );

    if (phase === "none") {
        return <NormalBanner />;
    }

    function dismiss() {
        try {
            localStorage.setItem(DISMISS_KEY, "1");
        } catch {
            /* ignore */
        }
        notify();
    }

    const inProgress = phase === "inProgress";

    return (
        <div className="bg-orange-50 dark:bg-orange-950/40 border-b border-orange-200/70 dark:border-orange-900/50 text-orange-900 dark:text-orange-100 text-[11px] font-medium py-1.5 relative z-50 transition-colors duration-300">
            <Container className="flex items-center justify-between gap-3">
                <div
                    className="flex min-w-0 items-center gap-2"
                    title="Maintenance window: 09:00–13:00 EEST (Europe/Sofia)"
                >
                    <Wrench
                        className="h-3 w-3 shrink-0 text-orange-600 dark:text-orange-400"
                        aria-hidden="true"
                    />
                    {inProgress ? (
                        <span className="truncate">
                            <span className="font-semibold">
                                Maintenance in progress
                            </span>
                            <span className="hidden sm:inline font-normal opacity-90">
                                {" "}
                                — app.shelf.nu is briefly offline, back by ~
                                {fmtTime(MAINTENANCE_END)} your time.
                            </span>
                        </span>
                    ) : (
                        <span className="truncate">
                            <span className="font-semibold">
                                Planned maintenance
                            </span>
                            <span className="font-normal opacity-90">
                                {" "}
                                — {fmtDate(MAINTENANCE_START)},{" "}
                                {fmtTime(MAINTENANCE_START)}–
                                {fmtTime(MAINTENANCE_END)} your time.
                            </span>
                            <span className="hidden md:inline font-normal opacity-90">
                                {" "}
                                app.shelf.nu will be briefly offline.
                            </span>
                        </span>
                    )}
                </div>

                <div className="flex shrink-0 items-center gap-3 sm:gap-4">
                    <Link
                        href={STATUS_URL}
                        target="_blank"
                        className="flex items-center gap-2 font-semibold hover:underline underline-offset-2 group"
                    >
                        <span className="relative flex h-2 w-2">
                            <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-orange-500 opacity-75"></span>
                            <span className="relative inline-flex rounded-full h-2 w-2 bg-orange-500"></span>
                        </span>
                        <span>Live status</span>
                    </Link>

                    <button
                        type="button"
                        onClick={dismiss}
                        aria-label="Dismiss maintenance notice"
                        className="rounded p-0.5 opacity-70 hover:opacity-100 transition-opacity"
                    >
                        <X className="h-3 w-3" aria-hidden="true" />
                    </button>
                </div>
            </Container>
        </div>
    );
}

/* ------------------------------------------------------------------ */
/*  Default site banner (shown when no maintenance is active)          */
/* ------------------------------------------------------------------ */

function NormalBanner() {
    return (
        <div className="bg-muted border-b border-border text-muted-foreground text-[11px] font-medium py-1.5 relative z-50 transition-colors duration-300">
            <Container className="flex items-center justify-between">
                <div className="flex items-center gap-2">
                    <span className="font-bold text-foreground tracking-tight">Shelf™</span>
                    <span className="opacity-40">|</span>
                    <span className="opacity-90 hidden sm:inline font-normal">everything has a place.</span>
                </div>

                <div className="flex items-center gap-4 sm:gap-6">
                    <Link
                        href="/mobile-app"
                        className="flex items-center gap-1.5 hover:text-foreground transition-colors"
                    >
                        <Smartphone className="h-3 w-3 text-orange-500" aria-hidden="true" />
                        <span className="hidden sm:inline">Now on Android</span>
                        <span className="sm:hidden">Android</span>
                    </Link>

                    <Link href="/migrate" className="hover:text-foreground transition-colors">
                        Migrate
                    </Link>

                    <Link
                        href={STATUS_URL}
                        target="_blank"
                        className="flex items-center gap-2 hover:text-foreground transition-colors group"
                    >
                        <div className="relative flex h-2 w-2">
                            <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-emerald-500 opacity-75"></span>
                            <span className="relative inline-flex rounded-full h-2 w-2 bg-emerald-500"></span>
                        </div>
                        <span className="hidden sm:inline">Status</span>
                    </Link>
                </div>
            </Container>
        </div>
    );
}
