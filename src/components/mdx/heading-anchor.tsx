"use client";

import { Link2 } from "lucide-react";
import type { ReactNode } from "react";

interface HeadingAnchorProps {
    id: string;
    as: "h2" | "h3";
    className: string;
    children: ReactNode;
}

export function HeadingAnchor({ id, as: Tag, className, children }: HeadingAnchorProps) {
    const handleClick = () => {
        const url = new URL(window.location.href);
        url.hash = id;
        window.history.replaceState(null, "", url.toString());
        navigator.clipboard?.writeText(url.toString());
    };

    return (
        <Tag id={id} className={`${className} group cursor-pointer`} onClick={handleClick}>
            <span>{children}</span>
            <Link2
                className="inline-block ml-2 h-4 w-4 text-muted-foreground/0 group-hover:text-muted-foreground/60 transition-colors align-middle"
                aria-hidden="true"
            />
        </Tag>
    );
}
