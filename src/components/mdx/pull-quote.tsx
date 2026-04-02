import { Quote } from "lucide-react";

interface PullQuoteProps {
    attribution?: string;
    role?: string;
    children: React.ReactNode;
}

export function PullQuote({ attribution, role, children }: PullQuoteProps) {
    return (
        <figure className="not-prose my-10 relative">
            <Quote className="absolute -top-2 -left-1 h-8 w-8 text-orange-200 dark:text-orange-800 -z-10" />
            <blockquote className="pl-6 text-xl sm:text-2xl font-medium leading-relaxed text-foreground/90 italic">
                {children}
            </blockquote>
            {attribution && (
                <figcaption className="mt-4 pl-6 text-sm text-muted-foreground">
                    <span className="font-semibold text-foreground">{attribution}</span>
                    {role && <span className="before:content-['_—_']">{role}</span>}
                </figcaption>
            )}
        </figure>
    );
}
