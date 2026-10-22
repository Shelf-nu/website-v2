import type { HomeShot } from "@/data/home";

interface ShotProps {
    shot: HomeShot;
    /** Rendered width hint for the browser, e.g. "(max-width: 1024px) 100vw, 940px" */
    sizes: string;
    className?: string;
    /** Only for the image that is the LCP element */
    eager?: boolean;
}

/**
 * A product screenshot with a real srcset.
 *
 * The site exports with `images.unoptimized`, so next/image would serve one
 * file to every screen. Product shots are captured at 2x (2560px) so they are
 * sharp on retina; phones get the 1280px file instead of paying for the big
 * one. Width and height are set, so there is no layout shift.
 */
export function Shot({ shot, sizes, className, eager }: ShotProps) {
    return (
        // eslint-disable-next-line @next/next/no-img-element
        <img
            src={shot.src}
            srcSet={shot.srcSet}
            sizes={shot.srcSet ? sizes : undefined}
            width={shot.width}
            height={shot.height}
            alt={shot.alt}
            loading={eager ? "eager" : "lazy"}
            fetchPriority={eager ? "high" : undefined}
            decoding="async"
            className={className}
        />
    );
}
