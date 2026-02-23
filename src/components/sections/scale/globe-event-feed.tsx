"use client";

import { useEffect, useState, startTransition } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { Archive, CalendarClock, CheckCircle2, RotateCcw } from "lucide-react";
import { cn } from "@/lib/utils";

interface Event {
    id: string;
    type: "asset_created" | "check_out" | "booking" | "overdue";
    location: string;
    flag: string; // Emoji flag
    timestamp: string;
}

const EVENT_TYPES = [
    { type: "asset_created", label: "Asset Created", icon: Archive, color: "text-blue-400" },
    { type: "check_out", label: "Asset Checked Out", icon: RotateCcw, color: "text-orange-400" },
    { type: "booking", label: "Booking Reserved", icon: CalendarClock, color: "text-purple-400" },
    { type: "overdue", label: "Booking Overdue", icon: CheckCircle2, color: "text-red-400" },
] as const;

const LOCATIONS = [
    { city: "San Francisco", country: "US", flag: "🇺🇸" },
    { city: "London", country: "UK", flag: "🇬🇧" },
    { city: "Berlin", country: "DE", flag: "🇩🇪" },
    { city: "Tokyo", country: "JP", flag: "🇯🇵" },
    { city: "Sydney", country: "AU", flag: "🇦🇺" },
    { city: "Singapore", country: "SG", flag: "🇸🇬" },
    { city: "New York", country: "US", flag: "🇺🇸" },
    { city: "Toronto", country: "CA", flag: "🇨🇦" },
    { city: "Paris", country: "FR", flag: "🇫🇷" },
    { city: "Amsterdam", country: "NL", flag: "🇳🇱" },
];

export function GlobeEventFeed({ className }: { className?: string }) {
    const [events, setEvents] = useState<Event[]>([]);

    useEffect(() => {
        // Initial population
        const initialEvents = Array.from({ length: 3 }).map((_, i) => generateEvent(i.toString()));
        startTransition(() => {
            setEvents(initialEvents);
        });

        const interval = setInterval(() => {
            setEvents((prev) => {
                const newEvent = generateEvent(Date.now().toString());
                const newEvents = [newEvent, ...prev.slice(0, 3)]; // Keep max 4 items
                return newEvents;
            });
        }, 2500); // Add new event every 2.5s

        return () => clearInterval(interval);
    }, []);

    return (
        <div className={cn("flex flex-col gap-3 w-full max-w-xs pointer-events-none select-none", className)}>
            <AnimatePresence mode="popLayout">
                {events.map((event) => {
                    const eventType = EVENT_TYPES.find(t => t.type === event.type)!;
                    const Icon = eventType.icon;

                    return (
                        <motion.div
                            key={event.id}
                            layout
                            initial={{ opacity: 0, x: 20, scale: 0.95 }}
                            animate={{ opacity: 1, x: 0, scale: 1 }}
                            exit={{ opacity: 0, x: 20, scale: 0.95, transition: { duration: 0.2 } }}
                            transition={{ duration: 0.4, type: "spring" }}
                            className="bg-white/80 backdrop-blur-md border border-zinc-200/50 p-3 rounded-xl shadow-xl flex items-center gap-3"
                        >
                            <div className={cn("p-2 rounded-lg bg-zinc-100", eventType.color)}>
                                <Icon className="w-4 h-4" />
                            </div>
                            <div className="flex-1 min-w-0">
                                <div className="flex items-center gap-2 mb-0.5">
                                    <span className="text-sm font-medium text-zinc-900 truncate">
                                        {eventType.label}
                                    </span>
                                </div>
                                <div className="flex items-center gap-1.5 text-xs text-zinc-500">
                                    <span>{event.flag}</span>
                                    <span className="truncate">{event.location}</span>
                                    <span className="text-zinc-400">•</span>
                                    <span>just now</span>
                                </div>
                            </div>
                        </motion.div>
                    );
                })}
            </AnimatePresence>
        </div>
    );
}

function generateEvent(id: string): Event {
    const type = EVENT_TYPES[Math.floor(Math.random() * EVENT_TYPES.length)];
    const location = LOCATIONS[Math.floor(Math.random() * LOCATIONS.length)];

    return {
        id,
        type: type.type,
        location: `${location.city}, ${location.country}`,
        flag: location.flag,
        timestamp: "just now"
    };
}
