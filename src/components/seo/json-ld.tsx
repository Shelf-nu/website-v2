import React from "react";

export function JsonLd() {
    const schema = {
        "@context": "https://schema.org",
        "@graph": [
            {
                "@type": "Organization",
                "@id": "https://shelf.nu/#organization",
                "name": "Shelf Asset Management",
                "url": "https://shelf.nu",
                "logo": {
                    "@type": "ImageObject",
                    "url": "https://shelf.nu/logo.png"
                },
                "sameAs": [
                    "https://github.com/Shelf-nu/shelf.nu",
                    "https://www.linkedin.com/company/shelf-inc/"
                ],
                "contactPoint": {
                    "@type": "ContactPoint",
                    "contactType": "customer support",
                    "url": "https://shelf.nu/contact"
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
                    "url": "https://shelf.nu/pricing"
                },
                "aggregateRating": {
                    "@type": "AggregateRating",
                    "ratingValue": "4.8",
                    "ratingCount": "120"
                },
                "author": {
                    "@id": "https://shelf.nu/#organization"
                },
                "description": "Open source asset tracking and inventory management software for modern distributed teams."
            },
            {
                "@type": "WebSite",
                "@id": "https://shelf.nu/#website",
                "url": "https://shelf.nu",
                "name": "Shelf",
                "publisher": {
                    "@id": "https://shelf.nu/#organization"
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
