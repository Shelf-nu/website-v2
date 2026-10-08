"use client";

import { useEffect, useRef, useState } from "react";
import { motion, AnimatePresence, useInView, useReducedMotion } from "framer-motion";
import { Archive, CalendarClock, ClipboardCheck, LogIn, LogOut, UserCheck } from "lucide-react";
import { cn } from "@/lib/utils";

/**
 * Illustrative activity beside the globe: hard-coded event types and cities,
 * not live data. Times are staggered, the same city or action never repeats
 * back to back, and it only ticks while the globe is on screen.
 */

interface FeedEvent {
    id: number;
    type: (typeof EVENT_TYPES)[number]["type"];
    city: string;
    flag: string;
    minutesAgo: number;
}

const EVENT_TYPES = [
    { type: "check_out", label: "Asset checked out", icon: LogOut, color: "text-orange-500" },
    { type: "check_in", label: "Asset checked in", icon: LogIn, color: "text-emerald-500" },
    { type: "booking", label: "Booking reserved", icon: CalendarClock, color: "text-violet-500" },
    { type: "custody", label: "Custody assigned", icon: UserCheck, color: "text-sky-500" },
    { type: "audit", label: "Audit completed", icon: ClipboardCheck, color: "text-teal-500" },
    { type: "asset_created", label: "Asset added", icon: Archive, color: "text-blue-500" },
] as const;

const LOCATIONS = [
    { city: "Chicago, US", flag: "🇺🇸" },
    { city: "Los Angeles, US", flag: "🇺🇸" },
    { city: "New York, US", flag: "🇺🇸" },
    { city: "Austin, US", flag: "🇺🇸" },
    { city: "Kansas City, US", flag: "🇺🇸" },
    { city: "Toronto, CA", flag: "🇨🇦" },
    { city: "Montréal, CA", flag: "🇨🇦" },
    { city: "London, UK", flag: "🇬🇧" },
    { city: "Bristol, UK", flag: "🇬🇧" },
    { city: "Amsterdam, NL", flag: "🇳🇱" },
    { city: "Berlin, DE", flag: "🇩🇪" },
    { city: "Zürich, CH", flag: "🇨🇭" },
    { city: "Copenhagen, DK", flag: "🇩🇰" },
    { city: "Oslo, NO", flag: "🇳🇴" },
    { city: "Paris, FR", flag: "🇫🇷" },
    { city: "Dubai, AE", flag: "🇦🇪" },
    { city: "Singapore, SG", flag: "🇸🇬" },
    { city: "Melbourne, AU", flag: "🇦🇺" },
    { city: "Sydney, AU", flag: "🇦🇺" },
] as const;

const MAX_ITEMS = 4;

function pick<T>(list: readonly T[], avoid?: T): T {
    let item = list[Math.floor(Math.random() * list.length)];
    while (list.length > 1 && item === avoid) item = list[Math.floor(Math.random() * list.length)];
    return item;
}

function nextEvent(id: number, previous?: FeedEvent, minutesAgo = 0): FeedEvent {
    const prevType = previous && EVENT_TYPES.find((t) => t.type === previous.type);
    const prevLocation = previous && LOCATIONS.find((l) => l.city === previous.city);
    const type = pick(EVENT_TYPES, prevType);
    const location = pick(LOCATIONS, prevLocation);
    return { id, type: type.type, city: location.city, flag: location.flag, minutesAgo };
}

function timeLabel(minutes: number) {
    return minutes === 0 ? "just now" : `${minutes} min ago`;
}

export function GlobeEventFeed({ className }: { className?: string }) {
    const ref = useRef<HTMLDivElement>(null);
    const inView = useInView(ref, { margin: "100px" });
    const reduceMotion = useReducedMotion();
    const [events, setEvents] = useState<FeedEvent[]>([]);

    // Filled after mount: random events in the static HTML would not match the browser's (hydration error).
    useEffect(() => {
        const first = nextEvent(3, undefined, 2);
        const second = nextEvent(2, first, 6);
        const third = nextEvent(1, second, 11);
        // eslint-disable-next-line react-hooks/set-state-in-effect -- one-time client-only seed
        setEvents([first, second, third]);
    }, []);

    useEffect(() => {
        if (!inView || reduceMotion) return;
        let timer: ReturnType<typeof setTimeout>;
        const tick = () => {
            setEvents((prev) => {
                // Everything already listed gets a little older, so the times keep moving.
                const aged = prev.map((e) => ({ ...e, minutesAgo: e.minutesAgo + 1 + Math.floor(Math.random() * 3) }));
                return [nextEvent(Date.now(), prev[0]), ...aged].slice(0, MAX_ITEMS);
            });
            timer = setTimeout(tick, 3500 + Math.random() * 3000);
        };
        timer = setTimeout(tick, 2500);
        return () => clearTimeout(timer);
    }, [inView, reduceMotion]);

    return (
        <div ref={ref} aria-hidden="true" className={cn("pointer-events-none flex w-full max-w-xs select-none flex-col gap-3", className)}>
            <AnimatePresence mode="popLayout" initial={false}>
                {events.map((event) => {
                    const eventType = EVENT_TYPES.find((t) => t.type === event.type)!;
                    const Icon = eventType.icon;
                    return (
                        <motion.div
                            key={event.id}
                            layout
                            initial={{ opacity: 0, x: 20, scale: 0.95 }}
                            animate={{ opacity: 1, x: 0, scale: 1 }}
                            exit={{ opacity: 0, x: 20, scale: 0.95, transition: { duration: 0.2 } }}
                            transition={{ duration: 0.4, type: "spring" }}
                            // Solid, not backdrop-blur: a blur over the animating canvas is re-composited every frame.
                            className="flex items-center gap-3 rounded-xl border border-border-subtle/60 bg-card/95 p-3 shadow-xl"
                        >
                            <div className={cn("rounded-lg bg-surface p-2", eventType.color)}>
                                <Icon className="h-4 w-4" />
                            </div>
                            <div className="min-w-0 flex-1">
                                <div className="mb-0.5 truncate text-sm font-medium text-heading">{eventType.label}</div>
                                <div className="flex items-center gap-1.5 text-xs text-caption">
                                    <span>{event.flag}</span>
                                    <span className="truncate">{event.city}</span>
                                    <span className="text-subtle">•</span>
                                    <span className="shrink-0">{timeLabel(event.minutesAgo)}</span>
                                </div>
                            </div>
                        </motion.div>
                    );
                })}
            </AnimatePresence>
        </div>
    );
}
