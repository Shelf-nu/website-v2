import React from "react";

export function JsonLd() {
    const schema = {
        "@context": "https://schema.org",
        "@graph": [
            {
                "@type": "Organization",
                "@id": "https://www.shelf.nu/#organization",
                "name": "Shelf Asset Management",
                "url": "https://www.shelf.nu",
                "logo": {
                    "@type": "ImageObject",
                    "url": "https://www.shelf.nu/logo.png"
                },
                "sameAs": [
                    "https://github.com/Shelf-nu/shelf.nu",
                    "https://www.linkedin.com/company/shelf-inc/"
                ],
                "contactPoint": {
                    "@type": "ContactPoint",
                    "contactType": "customer support",
                    "url": "https://www.shelf.nu/contact"
                }
            },
            {
                "@type": "SoftwareApplication",
                "name": "Shelf",
                "applicationCategory": "BusinessApplication",
                "operatingSystem": "Web, iOS, Android",
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
                "interactionStatistic": [
                    {
                        "@type": "InteractionCounter",
                        "interactionType": "https://schema.org/LikeAction",
                        "userInteractionCount": 2562,
                        "name": "GitHub stars"
                    },
                    {
                        "@type": "InteractionCounter",
                        "interactionType": "https://schema.org/FollowAction",
                        "userInteractionCount": 286,
                        "name": "GitHub forks"
                    },
                    {
                        "@type": "InteractionCounter",
                        "interactionType": "https://schema.org/RegisterAction",
                        "userInteractionCount": 15910,
                        "name": "Registered users"
                    }
                ],
                "author": {
                    "@id": "https://www.shelf.nu/#organization"
                },
                "description": "Open source asset tracking and inventory management software for modern distributed teams.",
                "applicationSubCategory": "Asset Tracking Software",
                "featureList": "QR code asset tracking, Equipment check-in/check-out, Booking calendar, Custom fields, Multi-location support, Team collaboration, CSV import/export, API access, Self-hosting option",
                "downloadUrl": "https://app.shelf.nu"
            },
            {
                "@type": "WebSite",
                "@id": "https://www.shelf.nu/#website",
                "url": "https://www.shelf.nu",
                "name": "Shelf",
                "publisher": {
                    "@id": "https://www.shelf.nu/#organization"
                }
            }
        ]
    };

    return (
        <script
            type="application/ld+json"
            dangerouslySetInnerHTML={{ __html: JSON.stringify(schema) }}
        />
    );
}
