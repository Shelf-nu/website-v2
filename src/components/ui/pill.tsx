import Link from "next/link";
import { cn } from "@/lib/utils";

interface PillProps {
    children: React.ReactNode;
    href?: string;
    className?: string;
    icon?: React.ReactNode; // Optional prefix icon or text (like "New |")
}

export function Pill({ children, href, className, icon }: PillProps) {
    const baseStyles = "inline-flex items-center rounded-full border border-orange-200 bg-orange-50/50 px-3 py-1 text-sm font-medium text-orange-800 backdrop-blur-sm transition-colors hover:bg-orange-100/50";

    const content = (
        <>
            {icon && <span className="mr-2 flex items-center">{icon}</span>}
            {children}
        </>
    );

    if (href) {
        return (
            <Link href={href} className={cn(baseStyles, className)}>
                {content}
            </Link>
        );
    }

    return (
        <div className={cn(baseStyles, className)}>
            {content}
        </div>
    );
}
