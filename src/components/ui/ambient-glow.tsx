import { cn } from "@/lib/utils";

/**
 * Ambient light, in CSS only.
 *
 * HeroGlow: one soft wash of warm light from the top of a hero, breathing
 * very slowly. DarkGlow: a hairline of orange along the top edge of a dark
 * band with a small glow beneath it. Opacity-only animation, no blur
 * filters, no script; the global prefers-reduced-motion rule freezes it.
 *
 * Why not a shader library: one WebGPU effect costs 260 KB of gzipped
 * JavaScript (the homepage ships 301 KB today) and 18% of visitors,
 * mostly on Safari, cannot run WebGPU at all.
 */
export function HeroGlow({ className }: { className?: string }) {
    return (
        <div
            aria-hidden="true"
            className={cn(
                "glow-breathe pointer-events-none absolute inset-x-0 top-0 -z-10 h-[560px] bg-[radial-gradient(70%_60%_at_50%_0%,rgba(255,137,4,0.11)_0%,rgba(255,214,167,0.14)_32%,rgba(255,247,237,0)_72%)] dark:opacity-40",
                className,
            )}
        />
    );
}

export function DarkGlow({ className }: { className?: string }) {
    return (
        <div aria-hidden="true" className={cn("pointer-events-none absolute inset-0 overflow-hidden", className)}>
            <div className="absolute inset-x-0 top-0 h-px bg-gradient-to-r from-transparent via-orange-500/60 to-transparent" />
            <div className="glow-breathe absolute inset-x-0 top-0 h-[320px] bg-[radial-gradient(50%_55%_at_50%_0%,rgba(255,105,0,0.16)_0%,rgba(255,105,0,0)_70%)]" />
        </div>
    );
}
