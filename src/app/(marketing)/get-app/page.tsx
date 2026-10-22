import type { Metadata } from "next";
import { Container } from "@/components/ui/container";
import { GetAppRedirect } from "@/components/mobile/get-app-redirect";

/**
 * Target of the "scan to install" QR code (public/images/mobile-app/get-app-qr.svg).
 * A utility page, not content: no index, no search, no sitemap entry.
 */
export const metadata: Metadata = {
    title: "Get Shelf Companion",
    description: "Opens Shelf Companion in the App Store or on Google Play, whichever fits your phone.",
    robots: { index: false, follow: false },
    alternates: { canonical: "https://www.shelf.nu/get-app" },
};

export default function GetAppPage() {
    return (
        <section className="py-24 sm:py-32">
            <Container>
                <GetAppRedirect />
            </Container>
        </section>
    );
}
