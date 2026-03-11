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

    /** Optional customer testimonial quote */
    quote?: string;

    /** Quote author name */
    quoteAuthor?: string;

    /** Quote author role/title */
    quoteRole?: string;
}

export const CUSTOMER_LOGOS: CustomerLogo[] = [
    // === Logos WITH case studies ===
    {
        id: "ces-utility",
        name: "CES Utility Solutions",
        logo: "/logos/ces-utility.webp",
        caseStudySlug: "ces-70k-recovery",
        showOnHomePage: true,
        showInTrustedBy: true,
        industry: "Utilities",
        priority: 1,
    },
    {
        id: "fabel-film",
        name: "Fabel Film",
        logo: "/logos/fabel-film.webp",
        caseStudySlug: "fabel-film-double-bookings",
        showOnHomePage: true,
        showInTrustedBy: true,
        industry: "Media Production",
        priority: 2,
        quote: "Double bookings is the reason I wanted to use Shelf. The moment I had to arrange a last-minute extra camera, I knew we needed a system.",
        quoteAuthor: "Erik Stakenborg",
        quoteRole: "Producer, Fabel Film",
    },
    {
        id: "haarp",
        name: "HAARP",
        logo: "/logos/haarp.webp",
        caseStudySlug: "haarp",
        showOnHomePage: true,
        showInTrustedBy: true,
        industry: "Scientific Research",
        priority: 3,
    },
    {
        id: "resq",
        name: "ResQ",
        logo: "/logos/resq.webp",
        caseStudySlug: "resq-contact-center",
        showOnHomePage: true,
        showInTrustedBy: true,
        industry: "Contact Center Operations",
        priority: 4,
    },

    {
        id: "eastern-michigan-university",
        name: "Eastern Michigan University",
        logo: "/logos/eastern-michigan-university.webp",
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
        logo: "/logos/universal-music.webp",
        showOnHomePage: true,
        showInTrustedBy: true,
        industry: "Entertainment",
        priority: 6,
    },
    {
        id: "nokia",
        name: "Nokia",
        logo: "/logos/nokia.webp",
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
        logo: "/logos/british-airways.webp",
        showOnHomePage: true,
        showInTrustedBy: true,
        industry: "Aviation",
        priority: 9,
    },
    {
        id: "chicago-bulls",
        name: "Chicago Bulls",
        logo: "/logos/chicago-bulls.webp",
        showOnHomePage: true,
        showInTrustedBy: true,
        industry: "Sports",
        priority: 10,
    },
    {
        id: "arup",
        name: "Arup",
        logo: "/logos/arup.webp",
        showOnHomePage: true,
        showInTrustedBy: true,
        industry: "Engineering",
        priority: 11,
    },
    {
        id: "feadship",
        name: "Feadship Royal Dutch Shipyards",
        logo: "/logos/feadship.webp",
        showOnHomePage: true,
        showInTrustedBy: true,
        industry: "Maritime",
        priority: 12,
    },
    {
        id: "purdue-university",
        name: "Purdue University",
        logo: "/logos/purdue-university.webp",
        showOnHomePage: true,
        showInTrustedBy: true,
        industry: "Education",
        priority: 13,
    },
    {
        id: "berkeley",
        name: "Berkeley University of California",
        logo: "/logos/berkeley.webp",
        showOnHomePage: true,
        showInTrustedBy: true,
        industry: "Education",
        priority: 14,
    },
    {
        id: "florida-state",
        name: "Florida State University",
        logo: "/logos/florida-state.webp",
        showOnHomePage: true,
        showInTrustedBy: true,
        industry: "Education",
        priority: 15,
    },
    {
        id: "sea-shepherd",
        name: "Sea Shepherd",
        logo: "/logos/sea-shepherd.webp",
        showOnHomePage: true,
        showInTrustedBy: true,
        industry: "Conservation",
        priority: 16,
    },
    {
        id: "sunrun",
        name: "Sunrun",
        logo: "/logos/sunrun.webp",
        showOnHomePage: true,
        showInTrustedBy: true,
        industry: "Renewable Energy",
        priority: 17,
    },
    {
        id: "laerdal-medical",
        name: "Laerdal Medical",
        logo: "/logos/laerdal-medical.webp",
        showOnHomePage: true,
        showInTrustedBy: true,
        industry: "Medical Equipment",
        priority: 18,
    },

    // === Marquee-only logos (showInTrustedBy only) ===
    {
        id: "ak-film-it",
        name: "AK Film It!",
        logo: "/logos/ak-film-it.webp",
        showOnHomePage: false,
        showInTrustedBy: true,
        industry: "Media Production",
        quote: "I've been using Shelf for our filming equipment management, and it has been a game-changer. The personal support is exceptional. Shelf has made our operations smoother and more efficient.",
        quoteAuthor: "AK",
        quoteRole: "Founder, AK Film It!",
    },
    {
        id: "arcca",
        name: "Arcca",
        logo: "/logos/arcca.webp",
        showOnHomePage: false,
        showInTrustedBy: true,
        industry: "Engineering",
    },
    {
        id: "arrelano-associates",
        name: "Arellano Associates",
        logo: "/logos/arrelano-associates.webp",
        caseStudySlug: "arellano-associates",
        showOnHomePage: true,
        showInTrustedBy: true,
        industry: "Community Outreach",
        quote: "If you're still relying on spreadsheets or memory, you're making things harder than they need to be. A system like Shelf keeps everything organized, visible, and easy to manage.",
        quoteAuthor: "Jacky",
        quoteRole: "Office & Events Coordinator, Arellano Associates",
    },
    {
        id: "berkeys",
        name: "Berkeys",
        logo: "/logos/berkeys.webp",
        showOnHomePage: false,
        showInTrustedBy: true,
        industry: "Home Services",
        quote: "We primarily use Shelf for keeping track of roughly 400 assets in the field and 120 within our office. The system for assigning devices to team members is easy to learn.",
        quoteAuthor: "Operations Team",
        quoteRole: "Berkeys",
    },
    {
        id: "big-slate-media",
        name: "Big Slate Media",
        logo: "/logos/big-slate-media.webp",
        showOnHomePage: false,
        showInTrustedBy: true,
        industry: "Media Production",
    },
    {
        id: "biltmore-church",
        name: "Biltmore Church",
        logo: "/logos/biltmore-church.webp",
        showOnHomePage: false,
        showInTrustedBy: true,
        industry: "Religious Organization",
    },
    {
        id: "bl",
        name: "BL",
        logo: "/logos/bl.webp",
        showOnHomePage: false,
        showInTrustedBy: true,
    },
    {
        id: "black-owl",
        name: "Black Owl",
        logo: "/logos/black-owl.webp",
        showOnHomePage: false,
        showInTrustedBy: true,
        industry: "Media Production",
    },
    {
        id: "brunt-workwear",
        name: "Brunt Workwear",
        logo: "/logos/brunt-workwear.webp",
        showOnHomePage: false,
        showInTrustedBy: true,
        industry: "Workwear",
    },
    {
        id: "capital-crewing",
        name: "Capital Crewing",
        logo: "/logos/capital-crewing.webp",
        showOnHomePage: false,
        showInTrustedBy: true,
        industry: "Media Production",
    },
    {
        id: "cbi-consultants",
        name: "CBI Consultants",
        logo: "/logos/cbi-consultants.webp",
        showOnHomePage: false,
        showInTrustedBy: true,
        industry: "Consulting",
    },
    {
        id: "classic-teleproductions",
        name: "Classic Teleproductions",
        logo: "/logos/classic-teleproductions.webp",
        showOnHomePage: false,
        showInTrustedBy: true,
        industry: "Media Production",
    },
    {
        id: "data-plus-communications",
        name: "Data Plus Communications",
        logo: "/logos/data-plus-communications.webp",
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
        logo: "/logos/elements-studio.webp",
        showOnHomePage: false,
        showInTrustedBy: true,
        industry: "Media Production",
    },
    {
        id: "funke",
        name: "Funke",
        logo: "/logos/funke.webp",
        showOnHomePage: false,
        showInTrustedBy: true,
        industry: "Media",
    },
    {
        id: "fwht",
        name: "FWHT",
        logo: "/logos/fwht.webp",
        showOnHomePage: false,
        showInTrustedBy: true,
        industry: "Legal",
    },
    {
        id: "houston-parks-board",
        name: "Houston Parks Board",
        logo: "/logos/houston-parks-board.webp",
        showOnHomePage: false,
        showInTrustedBy: true,
        industry: "Government",
    },
    {
        id: "ideative",
        name: "Ideative",
        logo: "/logos/ideative.webp",
        showOnHomePage: false,
        showInTrustedBy: true,
        industry: "Creative Agency",
    },
    {
        id: "kansas-city-art-institute",
        name: "Kansas City Art Institute",
        logo: "/logos/kcai.webp",
        caseStudySlug: "kcai",
        showOnHomePage: true,
        showInTrustedBy: true,
        industry: "Education",
    },
    {
        id: "lifeway-mobility",
        name: "Lifeway Mobility",
        logo: "/logos/lifeway-mobility.webp",
        showOnHomePage: false,
        showInTrustedBy: true,
        industry: "Healthcare",
    },
    {
        id: "london-mep",
        name: "London MEP",
        logo: "/logos/london-mep.webp",
        showOnHomePage: false,
        showInTrustedBy: true,
        industry: "Engineering",
    },
    {
        id: "merit-street-media",
        name: "Merit Street Media",
        logo: "/logos/merit-street-media.webp",
        showOnHomePage: false,
        showInTrustedBy: true,
        industry: "Media",
    },
    {
        id: "misti",
        name: "misti",
        logo: "/logos/misti.webp",
        showOnHomePage: false,
        showInTrustedBy: true,
    },
    {
        id: "niche",
        name: "niche",
        logo: "/logos/niche.webp",
        showOnHomePage: false,
        showInTrustedBy: true,
    },
    {
        id: "ocadu",
        name: "OCAD University",
        logo: "/logos/ocadu.webp",
        showOnHomePage: false,
        showInTrustedBy: true,
        industry: "Education",
    },
    {
        id: "oral-roberts-university",
        name: "Oral Roberts University",
        logo: "/logos/oral-roberts-university.webp",
        showOnHomePage: false,
        showInTrustedBy: true,
        industry: "Education",
    },
    {
        id: "ovoko",
        name: "Ovoko",
        logo: "/logos/ovoko.webp",
        showOnHomePage: false,
        showInTrustedBy: true,
        industry: "Automotive",
    },
    {
        id: "project-vision",
        name: "Project Vision",
        logo: "/logos/project-vision.webp",
        showOnHomePage: false,
        showInTrustedBy: true,
        industry: "Nonprofit",
    },
    {
        id: "reason-magazine",
        name: "Reason Magazine",
        logo: "/logos/reason-magazine.webp",
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
        logo: "/logos/scape.webp",
        showOnHomePage: false,
        showInTrustedBy: true,
        industry: "Architecture",
    },
    {
        id: "shirogumi",
        name: "Shirogumi",
        logo: "/logos/shirogumi.webp",
        showOnHomePage: false,
        showInTrustedBy: true,
        industry: "Media Production",
    },
    {
        id: "smith-college",
        name: "Smith College",
        logo: "/logos/smith-college.webp",
        showOnHomePage: false,
        showInTrustedBy: true,
        industry: "Education",
    },
    {
        id: "summit",
        name: "Summit",
        logo: "/logos/summit.webp",
        showOnHomePage: false,
        showInTrustedBy: true,
    },
    {
        id: "sun-solar",
        name: "Sun Solar",
        logo: "/logos/sun-solar.webp",
        showOnHomePage: false,
        showInTrustedBy: true,
        industry: "Renewable Energy",
    },
    {
        id: "the-visa",
        name: "The Visa",
        logo: "/logos/the-visa.webp",
        showOnHomePage: false,
        showInTrustedBy: true,
    },
    {
        id: "truespeed",
        name: "Truespeed",
        logo: "/logos/truespeed.webp",
        showOnHomePage: false,
        showInTrustedBy: true,
        industry: "Telecommunications",
    },
    {
        id: "university-of-melbourne",
        name: "University of Melbourne",
        logo: "/logos/university-of-melbourne.webp",
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
        logo: "/logos/up-to-you.webp",
        showOnHomePage: false,
        showInTrustedBy: true,
    },
    {
        id: "kent-state-university",
        name: "Kent State University",
        logo: "/logos/kent-state.webp",
        showOnHomePage: false,
        showInTrustedBy: true,
        industry: "Education",
    },
    {
        id: "university-of-missouri",
        name: "University of Missouri",
        logo: "/logos/university-of-missouri.webp",
        showOnHomePage: false,
        showInTrustedBy: true,
        industry: "Education",
    },
    {
        id: "uss-midway-museum",
        name: "USS Midway Museum",
        logo: "/logos/uss-midway-museum.webp",
        showOnHomePage: false,
        showInTrustedBy: true,
        industry: "Museum",
    },
    {
        id: "valuetainment",
        name: "Valuetainment",
        logo: "/logos/valuetainment.webp",
        showOnHomePage: false,
        showInTrustedBy: true,
        industry: "Media",
    },
    {
        id: "village-cinemas",
        name: "Village Cinemas",
        logo: "/logos/village-cinemas.webp",
        showOnHomePage: false,
        showInTrustedBy: true,
        industry: "Entertainment",
    },
    {
        id: "volstate",
        name: "Volstate Community College",
        logo: "/logos/volstate.webp",
        showOnHomePage: false,
        showInTrustedBy: true,
        industry: "Education",
    },
    {
        id: "wagner-meinert",
        name: "Wagner Meinert",
        logo: "/logos/wagner-meinert.webp",
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

/** Logos that have customer testimonial quotes */
export function getTestimonialLogos() {
    return CUSTOMER_LOGOS.filter((l) => l.quote);
}

/** Curated high-recognition logos for the hero section logo strip */
export function getHeroLogos() {
    const heroIds = [
        "nokia",
        "british-airways",
        "chicago-bulls",
        "berkeley",
        "universal-music",
        "virgin-hyperloop",
        "purdue-university",
        "arup",
    ];
    return heroIds
        .map((id) => CUSTOMER_LOGOS.find((l) => l.id === id))
        .filter(Boolean) as CustomerLogo[];
}

/** All logos grouped by industry */
export function getLogosByIndustry() {
    const grouped: Record<string, CustomerLogo[]> = {};
    for (const logo of CUSTOMER_LOGOS) {
        const industry = logo.industry || "Other";
        if (!grouped[industry]) grouped[industry] = [];
        grouped[industry].push(logo);
    }
    return grouped;
}
