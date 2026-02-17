/**
 * Centralized customer logo registry.
 *
 * This is the single source of truth for customer logos displayed
 * across the marketing site (home page grid, trusted-by marquee).
 *
 * To add a new logo:
 * 1. Place the image in /public/logos/<company-slug>.svg (or .png, .avif, .webp)
 * 2. Add an entry to the CUSTOMER_LOGOS array below
 * 3. Set showOnHomePage and/or showInTrustedBy to true
 * 4. Optionally link to a case study via caseStudySlug
 */

export interface CustomerLogo {
    /** Unique identifier (kebab-case, e.g. "ces-utility") */
    id: string;

    /** Display name (e.g. "CES Utility Solutions") */
    name: string;

    /** Path to logo in /public/logos/ (e.g. "/logos/ces-utility.svg") — supports SVG, PNG, JPG, WebP, AVIF */
    logo: string;

    /** If this customer has a published case study, the MDX file slug */
    caseStudySlug?: string;

    /** Show in the logo grid on the home page */
    showOnHomePage: boolean;

    /** Show in the infinite-scroll marquee (pricing, hero layouts) */
    showInTrustedBy: boolean;

    /** Optional industry tag for future filtering/grouping */
    industry?: string;

    /** Controls ordering: lower number = appears first */
    priority?: number;
}

export const CUSTOMER_LOGOS: CustomerLogo[] = [
    // === Logos WITH case studies ===
    {
        id: "ces-utility",
        name: "CES Utility Solutions",
        logo: "/logos/ces-utility.svg",
        caseStudySlug: "ces-70k-recovery",
        showOnHomePage: true,
        showInTrustedBy: true,
        industry: "Utilities",
        priority: 1,
    },
    {
        id: "fabel-film",
        name: "Fabel Film",
        logo: "/logos/fabel-film.svg",
        caseStudySlug: "fabel-film-double-bookings",
        showOnHomePage: true,
        showInTrustedBy: true,
        industry: "Media Production",
        priority: 2,
    },
    {
        id: "haarp",
        name: "HAARP",
        logo: "/logos/haarp.svg",
        caseStudySlug: "haarp",
        showOnHomePage: true,
        showInTrustedBy: false,
        industry: "Scientific Research",
        priority: 3,
    },
    {
        id: "resq",
        name: "ResQ",
        logo: "/logos/resq.svg",
        caseStudySlug: "resq-contact-center",
        showOnHomePage: true,
        showInTrustedBy: false,
        industry: "Contact Center Operations",
        priority: 4,
    },

    // === Brand-name logos (no case studies yet) ===
    {
        id: "universal-music",
        name: "Universal Music",
        logo: "/logos/universal-music.svg",
        showOnHomePage: true,
        showInTrustedBy: true,
        industry: "Entertainment",
        priority: 5,
    },
    {
        id: "nokia",
        name: "Nokia",
        logo: "/logos/nokia.svg",
        showOnHomePage: true,
        showInTrustedBy: true,
        industry: "Telecommunications",
        priority: 6,
    },
    {
        id: "virgin-hyperloop",
        name: "Virgin Hyperloop",
        logo: "/logos/virgin-hyperloop.svg",
        showOnHomePage: true,
        showInTrustedBy: true,
        industry: "Transportation",
        priority: 7,
    },
    {
        id: "brabant",
        name: "Brabant",
        logo: "/logos/brabant.svg",
        showOnHomePage: true,
        showInTrustedBy: true,
        industry: "Government",
        priority: 8,
    },
];

// === Helper selectors ===

/** Logos for the home page grid (LogoGrid component) */
export function getHomePageLogos() {
    return CUSTOMER_LOGOS
        .filter((l) => l.showOnHomePage)
        .sort((a, b) => (a.priority ?? 99) - (b.priority ?? 99));
}

/** Logos for the trusted-by marquee (TrustedBy component) */
export function getTrustedByLogos() {
    return CUSTOMER_LOGOS
        .filter((l) => l.showInTrustedBy)
        .sort((a, b) => (a.priority ?? 99) - (b.priority ?? 99));
}

/** Home page logos pre-mapped to LogoGrid's {id, name, logo, slug?} shape */
export function getHomePageLogosForGrid() {
    return getHomePageLogos().map((l) => ({
        id: l.id,
        name: l.name,
        logo: l.logo,
        slug: l.caseStudySlug,
    }));
}
