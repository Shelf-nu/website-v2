"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { ChevronRight, Home } from "lucide-react";
import { Fragment } from "react";
import { cn } from "@/lib/utils";

// Map common paths to nicer labels
const LABEL_MAP: Record<string, string> = {
    "features": "Features",
    "solutions": "Solutions",
    "case-studies": "Case Studies",
    "blog": "Blog",
    "pricing": "Pricing",
    "contact": "Contact",
    "demo": "Book a Demo",
    "migrate": "Migrate",
    "resources": "Resources",
    // Add specific sub-path overrides if needed, though dynamic capitalization usually handles it
};

// Function to prettify slugs (e.g., "asset-tracking" -> "Asset Tracking")
function formatLabel(slug: string): string {
    if (LABEL_MAP[slug]) return LABEL_MAP[slug];
    return slug
        .split("-")
        .map(word => word.charAt(0).toUpperCase() + word.slice(1))
        .join(" ");
}

export function Breadcrumbs({ className }: { className?: string }) {
    const pathname = usePathname();

    // Don't show on homepage
    if (pathname === "/") return null;

    const segments = pathname.split("/").filter(Boolean);

    // Generate JSON-LD Schema
    const structuredData = {
        "@context": "https://schema.org",
        "@type": "BreadcrumbList",
        "itemListElement": [
            {
                "@type": "ListItem",
                "position": 1,
                "name": "Home",
                "item": "https://shelf.nu"
            },
            ...segments.map((segment, index) => ({
                "@type": "ListItem",
                "position": index + 2,
                "name": formatLabel(segment),
                "item": `https://shelf.nu/${segments.slice(0, index + 1).join("/")}`
            }))
        ]
    };

    return (
        <nav aria-label="Breadcrumb" className={cn("flex items-center text-[13px] text-zinc-500 mb-6", className)}>
            <script
                type="application/ld+json"
                dangerouslySetInnerHTML={{ __html: JSON.stringify(structuredData) }}
            />

            <ol className="flex items-center gap-1.5 flex-wrap">
                <li>
                    <Link
                        href="/"
                        className="flex items-center hover:text-zinc-900 transition-colors"
                        aria-label="Home"
                    >
                        <Home className="h-3.5 w-3.5" />
                    </Link>
                </li>

                {segments.map((segment, index) => {
                    const href = `/${segments.slice(0, index + 1).join("/")}`;
                    const isLast = index === segments.length - 1;
                    const label = formatLabel(segment);

                    return (
                        <Fragment key={href}>
                            <li aria-hidden="true" className="text-zinc-300">
                                <ChevronRight className="h-3 w-3" />
                            </li>
                            <li>
                                {isLast ? (
                                    <span className="font-medium text-orange-600" aria-current="page">
                                        {label}
                                    </span>
                                ) : (
                                    <Link
                                        href={href}
                                        className="hover:text-zinc-900 transition-colors"
                                    >
                                        {label}
                                    </Link>
                                )}
                            </li>
                        </Fragment>
                    );
                })}
            </ol>
        </nav>
    );
}
