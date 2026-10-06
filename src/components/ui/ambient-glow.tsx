import { cn } from "@/lib/utils";

/**
 * Ambient glow layers, in CSS only.
 *
 * Three soft blobs drift slowly behind a hero (HeroGlow) or a dark band
 * (DarkGlow). They animate transform only, so the compositor does the work
 * and the main thread and GPU stay quiet; there is no blur filter and no
 * script. The global prefers-reduced-motion rule freezes them.
 *
 * Why not a shader library: one WebGPU effect costs 260 KB of gzipped
 * JavaScript (the homepage ships 301 KB today) and 18% of visitors,
 * mostly on Safari, cannot run WebGPU at all.
 */
export function HeroGlow({ className }: { className?: string }) {
    return (
        <div aria-hidden="true" className={cn("pointer-events-none absolute inset-x-0 top-0 -z-10 h-[680px] overflow-hidden [mask-image:linear-gradient(to_bottom,#000_50%,transparent)] dark:opacity-50", className)}>
            <div className="glow-blob glow-drift-a left-[4%] top-[-160px] h-[560px] w-[560px] bg-[radial-gradient(circle_at_center,rgba(255,105,0,0.14),transparent_62%)]" />
            <div className="glow-blob glow-drift-b right-[2%] top-[-120px] h-[640px] w-[640px] bg-[radial-gradient(circle_at_center,rgba(255,214,167,0.55),transparent_60%)]" />
            <div className="glow-blob glow-drift-c left-[34%] top-[80px] h-[460px] w-[460px] bg-[radial-gradient(circle_at_center,rgba(255,237,212,0.9),transparent_60%)]" />
        </div>
    );
}

export function DarkGlow({ className }: { className?: string }) {
    return (
        <div aria-hidden="true" className={cn("pointer-events-none absolute inset-0 overflow-hidden", className)}>
            <div className="glow-blob glow-drift-a bottom-[-120px] left-[6%] h-[520px] w-[760px] bg-[radial-gradient(ellipse_at_center,rgba(255,105,0,0.28),transparent_60%)]" />
            <div className="glow-blob glow-drift-c bottom-[-160px] right-[2%] h-[560px] w-[820px] bg-[radial-gradient(ellipse_at_center,rgba(255,137,4,0.18),transparent_62%)]" />
            <div className="grain absolute inset-0 opacity-[0.07]" />
        </div>
    );
}
