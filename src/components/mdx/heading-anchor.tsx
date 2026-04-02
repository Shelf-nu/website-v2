"use client";

import { Link2 } from "lucide-react";
import type { KeyboardEvent, ReactNode } from "react";

interface HeadingAnchorProps {
    id: string;
    as: "h2" | "h3";
    className: string;
    children: ReactNode;
}

export function HeadingAnchor({ id, as: Tag, className, children }: HeadingAnchorProps) {
    const copyLink = () => {
        const url = new URL(window.location.href);
        url.hash = id;
        window.history.replaceState(null, "", url.toString());
        navigator.clipboard?.writeText(url.toString());
    };

    const handleKeyDown = (e: KeyboardEvent) => {
        if (e.key === "Enter" || e.key === " ") {
            e.preventDefault();
            copyLink();
        }
    };

    return (
        <Tag id={id} className={`${className} group`}>
            <span>{children}</span>
            <a
                href={`#${id}`}
                onClick={(e) => { e.preventDefault(); copyLink(); }}
                onKeyDown={handleKeyDown}
                className="inline-block ml-2 align-middle"
                aria-label={`Copy link to "${typeof children === 'string' ? children : 'this section'}"`}
            >
                <Link2
                    className="h-4 w-4 text-muted-foreground/0 group-hover:text-muted-foreground/60 focus-visible:text-muted-foreground/60 transition-colors"
                    aria-hidden="true"
                />
            </a>
        </Tag>
    );
}
