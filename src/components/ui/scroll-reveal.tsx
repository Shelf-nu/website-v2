"use client";

import { motion, useInView } from "framer-motion";
import { useRef } from "react";

interface ScrollRevealProps {
    children: React.ReactNode;
    width?: "fit-content" | "100%";
    delay?: number;
    duration?: number;
    className?: string;
    threshold?: number;
}

export const ScrollReveal = ({
    children,
    width = "fit-content",
    delay = 0,
    duration = 0.5,
    className = "",
    threshold = 0.2,
}: ScrollRevealProps) => {
    const ref = useRef(null);
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    const isInView = useInView(ref, { once: true, margin: `0px 0px -${threshold * 100}px 0px` as any });

    return (
        <div ref={ref} style={{ width }} className={className}>
            <motion.div
                variants={{
                    hidden: { opacity: 0, y: 20 },
                    visible: { opacity: 1, y: 0 },
                }}
                initial="hidden"
                animate={isInView ? "visible" : "hidden"}
                transition={{ duration, delay, ease: "easeOut" }}
            >
                {children}
            </motion.div>
        </div>
    );
};
