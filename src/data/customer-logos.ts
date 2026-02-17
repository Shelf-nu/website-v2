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
        logo: "/logos/ces-utility.jpeg",
        caseStudySlug: "ces-70k-recovery",
        showOnHomePage: true,
        showInTrustedBy: true,
        industry: "Utilities",
        priority: 1,
    },
    {
        id: "fabel-film",
        name: "Fabel Film",
        logo: "/logos/fabel-film.jpg",
        caseStudySlug: "fabel-film-double-bookings",
        showOnHomePage: true,
        showInTrustedBy: true,
        industry: "Media Production",
        priority: 2,
    },
    {
        id: "haarp",
        name: "HAARP",
        logo: "/logos/haarp.png",
        caseStudySlug: "haarp",
        showOnHomePage: true,
        showInTrustedBy: true,
        industry: "Scientific Research",
        priority: 3,
    },
    {
        id: "resq",
        name: "ResQ",
        logo: "/logos/resq.jpg",
        caseStudySlug: "resq-contact-center",
        showOnHomePage: true,
        showInTrustedBy: true,
        industry: "Contact Center Operations",
        priority: 4,
    },

    {
        id: "eastern-michigan-university",
        name: "Eastern Michigan University",
        logo: "/logos/eastern-michigan-university.png",
        caseStudySlug: "eastern-michigan-university",
        showOnHomePage: true,
        showInTrustedBy: true,
        industry: "Education",
        priority: 5,
    },

    // === Brand-name logos — Home page grid + marquee ===
    {
        id: "universal-music",
        name: "Universal Music",
        logo: "/logos/universal-music.png",
        showOnHomePage: true,
        showInTrustedBy: true,
        industry: "Entertainment",
        priority: 6,
    },
    {
        id: "nokia",
        name: "Nokia",
        logo: "/logos/nokia.png",
        showOnHomePage: true,
        showInTrustedBy: true,
        industry: "Telecommunications",
        priority: 7,
    },
    {
        id: "virgin-hyperloop",
        name: "Virgin Hyperloop",
        logo: "/logos/virgin-hyperloop.webp",
        showOnHomePage: true,
        showInTrustedBy: true,
        industry: "Transportation",
        priority: 8,
    },
    {
        id: "british-airways",
        name: "British Airways",
        logo: "/logos/british-airways.png",
        showOnHomePage: true,
        showInTrustedBy: true,
        industry: "Aviation",
        priority: 9,
    },
    {
        id: "chicago-bulls",
        name: "Chicago Bulls",
        logo: "/logos/chicago-bulls.png",
        showOnHomePage: true,
        showInTrustedBy: true,
        industry: "Sports",
        priority: 10,
    },
    {
        id: "arup",
        name: "Arup",
        logo: "/logos/arup.png",
        showOnHomePage: true,
        showInTrustedBy: true,
        industry: "Engineering",
        priority: 11,
    },
    {
        id: "feadship",
        name: "Feadship Royal Dutch Shipyards",
        logo: "/logos/feadship.jpg",
        showOnHomePage: true,
        showInTrustedBy: true,
        industry: "Maritime",
        priority: 12,
    },
    {
        id: "purdue-university",
        name: "Purdue University",
        logo: "/logos/purdue-university.png",
        showOnHomePage: true,
        showInTrustedBy: true,
        industry: "Education",
        priority: 13,
    },
    {
        id: "berkeley",
        name: "Berkeley University of California",
        logo: "/logos/berkeley.png",
        showOnHomePage: true,
        showInTrustedBy: true,
        industry: "Education",
        priority: 14,
    },
    {
        id: "florida-state",
        name: "Florida State University",
        logo: "/logos/florida-state.jpg",
        showOnHomePage: true,
        showInTrustedBy: true,
        industry: "Education",
        priority: 15,
    },
    {
        id: "sea-shepherd",
        name: "Sea Shepherd",
        logo: "/logos/sea-shepherd.jpg",
        showOnHomePage: true,
        showInTrustedBy: true,
        industry: "Conservation",
        priority: 16,
    },
    {
        id: "sunrun",
        name: "Sunrun",
        logo: "/logos/sunrun.jpg",
        showOnHomePage: true,
        showInTrustedBy: true,
        industry: "Renewable Energy",
        priority: 17,
    },
    {
        id: "laerdal-medical",
        name: "Laerdal Medical",
        logo: "/logos/laerdal-medical.png",
        showOnHomePage: true,
        showInTrustedBy: true,
        industry: "Medical Equipment",
        priority: 18,
    },

    // === Marquee-only logos (showInTrustedBy only) ===
    {
        id: "ak-film-it",
        name: "AK Film It!",
        logo: "/logos/ak-film-it.jpg",
        showOnHomePage: false,
        showInTrustedBy: true,
        industry: "Media Production",
    },
    {
        id: "arcca",
        name: "Arcca",
        logo: "/logos/arcca.png",
        showOnHomePage: false,
        showInTrustedBy: true,
        industry: "Engineering",
    },
    {
        id: "arrelano-associates",
        name: "Arellano Associates",
        logo: "/logos/arrelano-associates.png",
        caseStudySlug: "arellano-associates",
        showOnHomePage: true,
        showInTrustedBy: true,
        industry: "Community Outreach",
    },
    {
        id: "berkeys",
        name: "Berkeys",
        logo: "/logos/berkeys.png",
        showOnHomePage: false,
        showInTrustedBy: true,
        industry: "Home Services",
    },
    {
        id: "big-slate-media",
        name: "Big Slate Media",
        logo: "/logos/big-slate-media.png",
        showOnHomePage: false,
        showInTrustedBy: true,
        industry: "Media Production",
    },
    {
        id: "biltmore-church",
        name: "Biltmore Church",
        logo: "/logos/biltmore-church.png",
        showOnHomePage: false,
        showInTrustedBy: true,
        industry: "Religious Organization",
    },
    {
        id: "bl",
        name: "BL",
        logo: "/logos/bl.png",
        showOnHomePage: false,
        showInTrustedBy: true,
    },
    {
        id: "black-owl",
        name: "Black Owl",
        logo: "/logos/black-owl.png",
        showOnHomePage: false,
        showInTrustedBy: true,
        industry: "Media Production",
    },
    {
        id: "brunt-workwear",
        name: "Brunt Workwear",
        logo: "/logos/brunt-workwear.jpg",
        showOnHomePage: false,
        showInTrustedBy: true,
        industry: "Workwear",
    },
    {
        id: "capital-crewing",
        name: "Capital Crewing",
        logo: "/logos/capital-crewing.png",
        showOnHomePage: false,
        showInTrustedBy: true,
        industry: "Media Production",
    },
    {
        id: "cbi-consultants",
        name: "CBI Consultants",
        logo: "/logos/cbi-consultants.png",
        showOnHomePage: false,
        showInTrustedBy: true,
        industry: "Consulting",
    },
    {
        id: "classic-teleproductions",
        name: "Classic Teleproductions",
        logo: "/logos/classic-teleproductions.png",
        showOnHomePage: false,
        showInTrustedBy: true,
        industry: "Media Production",
    },
    {
        id: "data-plus-communications",
        name: "Data Plus Communications",
        logo: "/logos/data-plus-communications.png",
        showOnHomePage: false,
        showInTrustedBy: true,
        industry: "Telecommunications",
    },
    {
        id: "dbs-institute",
        name: "dBs Institute",
        logo: "/logos/dbs-institute.svg",
        showOnHomePage: false,
        showInTrustedBy: true,
        industry: "Education",
    },
    {
        id: "elements-studio",
        name: "Elements Studio",
        logo: "/logos/elements-studio.png",
        showOnHomePage: false,
        showInTrustedBy: true,
        industry: "Media Production",
    },
    {
        id: "funke",
        name: "Funke",
        logo: "/logos/funke.png",
        showOnHomePage: false,
        showInTrustedBy: true,
        industry: "Media",
    },
    {
        id: "fwht",
        name: "FWHT",
        logo: "/logos/fwht.png",
        showOnHomePage: false,
        showInTrustedBy: true,
        industry: "Legal",
    },
    {
        id: "houston-parks-board",
        name: "Houston Parks Board",
        logo: "/logos/houston-parks-board.png",
        showOnHomePage: false,
        showInTrustedBy: true,
        industry: "Government",
    },
    {
        id: "ideative",
        name: "Ideative",
        logo: "/logos/ideative.png",
        showOnHomePage: false,
        showInTrustedBy: true,
        industry: "Creative Agency",
    },
    {
        id: "kansas-city-art-institute",
        name: "Kansas City Art Institute",
        logo: "/logos/kcai.png",
        caseStudySlug: "kcai",
        showOnHomePage: true,
        showInTrustedBy: true,
        industry: "Education",
    },
    {
        id: "lifeway-mobility",
        name: "Lifeway Mobility",
        logo: "/logos/lifeway-mobility.png",
        showOnHomePage: false,
        showInTrustedBy: true,
        industry: "Healthcare",
    },
    {
        id: "london-mep",
        name: "London MEP",
        logo: "/logos/london-mep.png",
        showOnHomePage: false,
        showInTrustedBy: true,
        industry: "Engineering",
    },
    {
        id: "merit-street-media",
        name: "Merit Street Media",
        logo: "/logos/merit-street-media.png",
        showOnHomePage: false,
        showInTrustedBy: true,
        industry: "Media",
    },
    {
        id: "misti",
        name: "misti",
        logo: "/logos/misti.png",
        showOnHomePage: false,
        showInTrustedBy: true,
    },
    {
        id: "niche",
        name: "niche",
        logo: "/logos/niche.jpg",
        showOnHomePage: false,
        showInTrustedBy: true,
    },
    {
        id: "ocadu",
        name: "OCAD University",
        logo: "/logos/ocadu.png",
        showOnHomePage: false,
        showInTrustedBy: true,
        industry: "Education",
    },
    {
        id: "oral-roberts-university",
        name: "Oral Roberts University",
        logo: "/logos/oral-roberts-university.png",
        showOnHomePage: false,
        showInTrustedBy: true,
        industry: "Education",
    },
    {
        id: "ovoko",
        name: "Ovoko",
        logo: "/logos/ovoko.png",
        showOnHomePage: false,
        showInTrustedBy: true,
        industry: "Automotive",
    },
    {
        id: "project-vision",
        name: "Project Vision",
        logo: "/logos/project-vision.png",
        showOnHomePage: false,
        showInTrustedBy: true,
        industry: "Nonprofit",
    },
    {
        id: "reason-magazine",
        name: "Reason Magazine",
        logo: "/logos/reason-magazine.png",
        showOnHomePage: false,
        showInTrustedBy: true,
        industry: "Media",
    },
    {
        id: "rfd-tv-news",
        name: "RFD-TV News",
        logo: "/logos/rfd-tv-news.webp",
        showOnHomePage: false,
        showInTrustedBy: true,
        industry: "Media",
    },
    {
        id: "rise-exhibits",
        name: "Rise Exhibits",
        logo: "/logos/rise-exhibits.webp",
        showOnHomePage: false,
        showInTrustedBy: true,
        industry: "Events",
    },
    {
        id: "scape",
        name: "SCAPE Landscape Architecture",
        logo: "/logos/scape.png",
        showOnHomePage: false,
        showInTrustedBy: true,
        industry: "Architecture",
    },
    {
        id: "shirogumi",
        name: "Shirogumi",
        logo: "/logos/shirogumi.png",
        showOnHomePage: false,
        showInTrustedBy: true,
        industry: "Media Production",
    },
    {
        id: "smith-college",
        name: "Smith College",
        logo: "/logos/smith-college.jpg",
        showOnHomePage: false,
        showInTrustedBy: true,
        industry: "Education",
    },
    {
        id: "summit",
        name: "Summit",
        logo: "/logos/summit.png",
        showOnHomePage: false,
        showInTrustedBy: true,
    },
    {
        id: "sun-solar",
        name: "Sun Solar",
        logo: "/logos/sun-solar.png",
        showOnHomePage: false,
        showInTrustedBy: true,
        industry: "Renewable Energy",
    },
    {
        id: "the-visa",
        name: "The Visa",
        logo: "/logos/the-visa.png",
        showOnHomePage: false,
        showInTrustedBy: true,
    },
    {
        id: "truespeed",
        name: "Truespeed",
        logo: "/logos/truespeed.png",
        showOnHomePage: false,
        showInTrustedBy: true,
        industry: "Telecommunications",
    },
    {
        id: "university-of-melbourne",
        name: "University of Melbourne",
        logo: "/logos/university-of-melbourne.jpg",
        showOnHomePage: false,
        showInTrustedBy: true,
        industry: "Education",
    },
    {
        id: "university-of-windsor",
        name: "University of Windsor",
        logo: "/logos/university-of-windsor.svg",
        showOnHomePage: false,
        showInTrustedBy: true,
        industry: "Education",
    },
    {
        id: "up-to-you",
        name: "UP TO YOU",
        logo: "/logos/up-to-you.jpg",
        showOnHomePage: false,
        showInTrustedBy: true,
    },
    {
        id: "uss-midway-museum",
        name: "USS Midway Museum",
        logo: "/logos/uss-midway-museum.png",
        showOnHomePage: false,
        showInTrustedBy: true,
        industry: "Museum",
    },
    {
        id: "valuetainment",
        name: "Valuetainment",
        logo: "/logos/valuetainment.png",
        showOnHomePage: false,
        showInTrustedBy: true,
        industry: "Media",
    },
    {
        id: "village-cinemas",
        name: "Village Cinemas",
        logo: "/logos/village-cinemas.jpg",
        showOnHomePage: false,
        showInTrustedBy: true,
        industry: "Entertainment",
    },
    {
        id: "volstate",
        name: "Volstate Community College",
        logo: "/logos/volstate.png",
        showOnHomePage: false,
        showInTrustedBy: true,
        industry: "Education",
    },
    {
        id: "wagner-meinert",
        name: "Wagner Meinert",
        logo: "/logos/wagner-meinert.png",
        showOnHomePage: false,
        showInTrustedBy: true,
        industry: "Engineering",
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
