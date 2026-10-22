/**
 * Shelf Companion screens, shared by the homepage, the pricing page and
 * /mobile-app.
 *
 * These are the official App Store screenshots (itunes lookup id
 * 6765639874), cropped to the device screen at 1000x2100 so they are sharp
 * on retina. Real screens only: never mock or illustrate the app UI.
 */
export interface CompanionScreen {
    src: string;
    width: number;
    height: number;
    alt: string;
}

export const COMPANION_SCREENS = {
    scan: { src: "/images/home/companion-scan.webp", width: 1000, height: 2100, alt: "Shelf Companion: scanning a QR label to open an asset" },
    asset: { src: "/images/home/companion-asset.webp", width: 1000, height: 2100, alt: "Shelf Companion: an asset page with custody and location" },
    audit: { src: "/images/home/companion-audit.webp", width: 1000, height: 2100, alt: "Shelf Companion: an asset condition audit in progress" },
    booking: { src: "/images/home/companion-booking.webp", width: 1000, height: 2100, alt: "Shelf Companion: checking a booking's assets back in" },
    inventory: { src: "/images/home/companion-inventory.webp", width: 1000, height: 2100, alt: "Shelf Companion: the searchable asset list" },
} satisfies Record<string, CompanionScreen>;

export const APP_STORE_URL = "https://apps.apple.com/app/id6765639874";
export const PLAY_STORE_URL = "https://play.google.com/store/apps/details?id=com.shelf.companion";
