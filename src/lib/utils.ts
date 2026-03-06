import { type ClassValue, clsx } from "clsx";
import { twMerge } from "tailwind-merge";

export function cn(...inputs: ClassValue[]) {
    return twMerge(clsx(inputs));
}

const MONTHS = [
    "January", "February", "March", "April", "May", "June",
    "July", "August", "September", "October", "November", "December",
];

/** Timezone-safe date formatter. Parses YYYY-MM-DD without UTC shift. */
export function formatDate(input: string | number): string {
    const s = String(input);
    const parts = s.match(/^(\d{4})-(\d{2})-(\d{2})/);
    if (parts) {
        const [, year, month, day] = parts;
        return `${MONTHS[parseInt(month, 10) - 1]} ${parseInt(day, 10)}, ${year}`;
    }
    // Fallback for non-ISO strings
    const date = new Date(input);
    return date.toLocaleDateString("en-US", {
        month: "long",
        day: "numeric",
        year: "numeric",
    });
}

/** Format a number as USD currency. */
export function formatCurrency(value: number, decimals = 0): string {
    return new Intl.NumberFormat("en-US", {
        style: "currency",
        currency: "USD",
        minimumFractionDigits: decimals,
        maximumFractionDigits: decimals,
    }).format(value);
}

/** Convert a kebab-case category slug to a human-readable label.
 *  e.g. "asset-tracking-management" → "Asset Tracking Management" */
export function formatCategoryLabel(slug: string): string {
    return slug
        .split("-")
        .map((word) => word.charAt(0).toUpperCase() + word.slice(1))
        .join(" ");
}
