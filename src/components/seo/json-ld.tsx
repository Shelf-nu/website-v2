import React from "react";
import { interactionStats } from "@/data/interaction-stats";

/**
 * Homepage-specific SoftwareApplication JSON-LD.
 *
 * Organization and WebSite schemas are emitted site-wide from the root
 * layout (see src/app/layout.tsx), so this component only emits the
 * product entity. The shared @id ties this entity to the
 * pricingSoftwareApplicationJsonLd emitted on /pricing.
 */
export function JsonLd() {
    const schema = {
        "@context": "https://schema.org",
        "@type": "SoftwareApplication",
        "@id": "https://www.shelf.nu/#shelf-software-application",
        "name": "Shelf",
        "applicationCategory": "BusinessApplication",
        "applicationSubCategory": "Asset Tracking Software",
        "operatingSystem": "Web, iOS",
        "url": "https://www.shelf.nu",
        "description": "Open source asset tracking and inventory management software for modern distributed teams.",
        "offers": {
            "@type": "Offer",
            "price": "0",
            "priceCurrency": "USD",
            "url": "https://www.shelf.nu/pricing"
        },
        "aggregateRating": {
            "@type": "AggregateRating",
            "ratingValue": "4.8",
            "ratingCount": "120"
        },
        "interactionStatistic": interactionStats.map((stat) => ({
            "@type": "InteractionCounter",
            "interactionType": stat.interactionType,
            "userInteractionCount": stat.userInteractionCount,
            "name": stat.name
        })),
        "author": {
            "@id": "https://www.shelf.nu/#organization"
        },
        "featureList": "QR code asset tracking, Equipment check-in/check-out, Booking calendar, Custom fields, Multi-location support, Team collaboration, CSV import/export, Self-hosting option",
        "downloadUrl": "https://app.shelf.nu"
    };

    return (
        <script
            type="application/ld+json"
            dangerouslySetInnerHTML={{ __html: JSON.stringify(schema) }}
        />
    );
}
