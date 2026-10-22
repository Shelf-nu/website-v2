import type { ReactNode } from "react";
import Link from "next/link";

/**
 * A compact, wrapping row of text links. These rows exist for a reason beyond
 * navigation: they keep every page the old homepage linked to from its body
 * (see the SEO note in src/data/home.ts). A flex list, so it always wraps.
 */
export function LinkRow({ label, items, trailing }: { label: string; items: { label: string; href: string }[]; trailing?: ReactNode }) {
    return (
        <div className="mx-auto mt-10 flex max-w-5xl flex-wrap items-center justify-center gap-x-5 gap-y-2 text-center text-sm text-muted-foreground">
            <span>{label}</span>
            <ul className="contents">
                {items.map((item) => (
                    <li key={item.href} className="list-none">
                        <Link href={item.href} className="font-medium text-foreground underline decoration-border underline-offset-4 transition-colors hover:text-orange-600 hover:decoration-current">
                            {item.label}
                        </Link>
                    </li>
                ))}
            </ul>
            {trailing}
        </div>
    );
}
