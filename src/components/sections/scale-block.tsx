"use client";

import { Container } from "@/components/ui/container";
import { Globe } from "@/components/ui/globe";
import NumberFlow from '@number-flow/react';
import { GlobeEventFeed } from "@/components/sections/scale/globe-event-feed";

import { useRef, useState, useEffect, startTransition } from "react";
import { useInView } from "framer-motion";

export function ScaleBlock() {
    const ref = useRef(null);
    const isInView = useInView(ref, { once: true, margin: "-100px" });
    const [hasStarted, setHasStarted] = useState(false);

    useEffect(() => {
        if (isInView) {
            startTransition(() => {
                setHasStarted(true);
            });
        }
    }, [isInView]);

    const metrics = [
        { value: 450000, suffix: "+", label: "assets tracked" },
        { value: 13000, suffix: "+", label: "active users" },
        { value: 50, suffix: "+", label: "countries" },
        { value: 99.999, suffix: "%", label: "historical uptime", decimalPlaces: 3 },
    ];

    return (
        <section className="py-24 bg-surface text-foreground overflow-hidden relative">
            {/* Background Gradient - Light & Warm */}
            <div className="absolute top-0 inset-x-0 h-full bg-[radial-gradient(ellipse_at_top_right,_var(--tw-gradient-stops))] from-orange-100/40 via-surface to-surface pointer-events-none" />

            <Container className="relative z-10">
                <div className="grid lg:grid-cols-2 gap-12 items-center">

                    {/* Left Column: Copy & Metrics */}
                    <div className="space-y-12 relative z-20">
                        <div className="space-y-6">
                            <h2 className="text-sm font-semibold text-orange-600 uppercase tracking-wider">
                                Built for real-world scale
                            </h2>
                            <h3 className="text-3xl md:text-4xl lg:text-5xl font-bold tracking-tight leading-tight text-heading">
                                Shelf runs in production for teams managing thousands of assets.
                            </h3>
                            <p className="text-lg text-caption leading-relaxed max-w-xl">
                                High booking volume and large user bases — without performance or data integrity tradeoffs.
                            </p>
                        </div>

                        <div ref={ref} className="grid grid-cols-2 gap-y-10 gap-x-8 border-t border-border-subtle pt-10">
                            {metrics.map((metric, index) => (
                                <div key={index}>
                                    <div className="text-3xl font-bold text-heading mb-1 flex items-baseline">
                                        <NumberFlow
                                            value={hasStarted ? metric.value : 0}
                                            format={{ useGrouping: true, maximumFractionDigits: metric.decimalPlaces || 0 }}
                                        />
                                        <span>{metric.suffix}</span>
                                    </div>
                                    <div className="text-sm text-caption font-medium">{metric.label}</div>
                                </div>
                            ))}
                        </div>

                        <div className="pt-2">
                            <p className="text-lg font-medium text-heading italic">
                                &quot;When Shelf scales, your workflows stay the same.&quot;
                            </p>
                        </div>
                    </div>

                    {/* Right Column: Globe - Offset & Large */}
                    <div className="relative h-[600px] lg:h-[800px] w-full lg:w-[140%] lg:-ml-[20%] lg:-mr-[20%] flex items-center justify-center lg:translate-x-32 perspective-1000 -my-24 lg:-my-32">
                        {/* Globe Glow - Warm Orange/White */}
                        <div className="absolute inset-0 bg-orange-500/5 blur-[120px] rounded-full transform scale-50" />

                        <Globe
                            className="w-full h-full"
                            config={{
                                width: 1200,
                                height: 1200,
                                devicePixelRatio: 2,
                                phi: 0,
                                theta: 0.25,
                                diffuse: 1.2,
                                mapSamples: 24000,
                                markerColor: [0.96, 0.5, 0.2],
                            }}
                        />

                        {/* Event Feed Overlay */}
                        <div className="absolute right-4 bottom-32 lg:right-32 lg:bottom-48 z-10 hidden md:block">
                            <GlobeEventFeed />
                        </div>
                    </div>

                </div>
            </Container>
        </section>
    );
}
