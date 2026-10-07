/**
 * Homepage content.
 *
 * Every image the homepage shows is declared here, so swapping in a sharper
 * capture is a one-line change. Product shots come from the demo workspace via
 * `node scripts/media-pipeline/run.mjs homepage-refresh` (2x captures).
 *
 * SEO: the links in this file are the homepage's body links. The mega menu is
 * not in the static HTML, so feature, solution and case-study pages get their
 * homepage link equity from here. Do not drop one without replacing it.
 */

const SUPABASE = "https://qliecghuzfchfjwaisyx.supabase.co/storage/v1/object/public/website-images";

export interface HomeShot {
    /** Fallback / 1x file */
    src: string;
    /** Optional `srcset`, e.g. "/images/home/assets-1280.webp 1280w, /images/home/assets-2560.webp 2560w" */
    srcSet?: string;
    width: number;
    height: number;
    alt: string;
}

/* ------------------------------------------------------------------ */
/*  Hero                                                               */
/* ------------------------------------------------------------------ */

/**
 * The hero tabs prove the line above them ("track it, book it, know who has
 * it") and follow the demand data (90 days to 2026-09-29): check-in/check-out
 * is searched ~24k times vs nothing for "asset page", homepage visitors open
 * custody 120 times vs asset pages 46, and "inventory" is the word people use
 * (48k impressions), not "asset index". The app tab exists on phones only:
 * there the Companion card beside the stage is hidden, and /mobile-app is the
 * page homepage visitors open most (677 in 90 days).
 */
export const HERO_VIEWS: { id: string; label: string; shot: HomeShot; phoneOnly?: boolean }[] = [
    {
        id: "inventory",
        label: "Inventory",
        shot: { src: "/images/home/inventory-1x.webp", srcSet: "/images/home/inventory-1x.webp 1200w, /images/home/inventory-2x.webp 2400w", width: 2400, height: 1500, alt: "Shelf Asset Management — asset index with QR codes and labels" },
    },
    {
        id: "bookings",
        label: "Bookings",
        shot: { src: "/images/home/bookings-view.webp", width: 1280, height: 853, alt: "Availability view: assets across a week of bookings" },
    },
    {
        id: "checkout",
        label: "Check-out",
        shot: { src: "/images/home/checkout-1x.webp", srcSet: "/images/home/checkout-1x.webp 1200w, /images/home/checkout-2x.webp 2400w", width: 2400, height: 1500, alt: "A booking in Shelf with its check-in progress, assets and kits" },
    },
    {
        id: "app",
        label: "App",
        shot: { src: "/images/home/companion-scan.webp", width: 1000, height: 2100, alt: "Shelf Companion: scanning a QR label to open an asset" },
        phoneOnly: true,
    },
];

/** The Companion app screens live in src/data/companion-screens.ts (shared with /mobile-app and /pricing). */
export { COMPANION_SCREENS as COMPANION } from "./companion-screens";

/* ------------------------------------------------------------------ */
/*  Trust band: logos and one quote per segment                        */
/* ------------------------------------------------------------------ */

/** `logos` and `quoteFrom` are ids from src/data/customer-logos.ts. */
export const TRUST_SEGMENTS: { id: string; label: string; logos: string[]; quoteFrom: string }[] = [
    { id: "all", label: "All teams", logos: ["nokia", "british-airways", "chicago-bulls", "berkeley", "universal-music", "arup", "virgin-hyperloop"], quoteFrom: "arrelano-associates" },
    { id: "edu", label: "Universities", logos: ["berkeley", "purdue-satt", "eastern-michigan-university", "florida-state", "university-of-melbourne", "kent-state-university", "smith-college"], quoteFrom: "purdue-satt" },
    { id: "media", label: "Film & media", logos: ["universal-music", "fabel-film", "ak-film-it", "classic-teleproductions", "big-slate-media", "village-cinemas", "merit-street-media"], quoteFrom: "ak-film-it" },
    { id: "field", label: "Field & industry", logos: ["ces-utility", "arup", "nokia", "berkeys", "wagner-meinert", "virgin-hyperloop", "london-mep"], quoteFrom: "berkeys" },
];

/* ------------------------------------------------------------------ */
/*  Why teams switch                                                   */
/* ------------------------------------------------------------------ */

export const WHY_SWITCH = {
    before: [
        "“Who has the camera?” asked in the group chat, again",
        "A double booking discovered on the morning of the shoot",
        "A sheet that is out of date by Friday",
        "No record of who returned what, or when",
        "Per-user pricing that punishes a growing team",
    ],
    after: [
        "Scan a label and see who has it and where it is",
        "Availability checked before a booking is confirmed",
        "Every asset updated from the field, on a phone",
        "A full history on every asset page",
        "One flat price per workspace, unlimited users on Team",
    ],
};

/* ------------------------------------------------------------------ */
/*  Platform                                                           */
/* ------------------------------------------------------------------ */

export const PLATFORM_BOOKINGS: HomeShot = { src: "/images/home/bookings-view.webp", width: 1280, height: 853, alt: "Availability view: assets across a week of bookings" };

export const PLATFORM_TILES: { title: string; text: string; link: string; href: string; shot: HomeShot }[] = [
    {
        title: "Check-in & custody",
        text: "Hand gear over with a scan and know who has it, since when.",
        link: "Custody",
        href: "/features/custody",
        shot: { src: "/images/home/check-in.webp", width: 1590, height: 1075, alt: "Booking page with quick and explicit check-in" },
    },
    {
        title: "Kits",
        text: "Bundle a body, lenses and batteries into one bookable unit.",
        link: "Kits",
        href: "/features/kits",
        shot: { src: "/images/home/kits-1x.webp", srcSet: "/images/home/kits-1x.webp 680w, /images/home/kits-2x.webp 1360w", width: 1360, height: 850, alt: "The kits list: drone, interview, broadcast and video production kits" },
    },
    {
        title: "Labels & barcodes",
        text: "Order QR sheets, print your own, or keep the labels and scanners you already have.",
        link: "Labels",
        href: "/solutions/qr-code-asset-tracking",
        shot: { src: "/images/home/labels.webp", width: 1440, height: 792, alt: "A handheld scanner reading a QR label on a laptop" },
    },
    {
        title: "One page per asset",
        text: "A searchable asset database with a page for every item: history, custodian, location and a QR code.",
        link: "Asset pages",
        href: "/features/asset-pages",
        shot: { src: "/images/updates/improved-asset-page.jpg", width: 1280, height: 853, alt: "An asset page with history, QR code and location map" },
    },
];

/** Keeps every feature page the old homepage linked to. See the SEO note above. */
export const ALSO_IN_SHELF: { label: string; href: string }[] = [
    { label: "Audits", href: "/features/audits" },
    { label: "Calendar", href: "/features/calendar" },
    { label: "Consumables tracking", href: "/features/consumables-tracking" },
    { label: "Dashboard", href: "/features/dashboard" },
    { label: "Asset search", href: "/features/asset-search" },
    { label: "Asset reminders", href: "/features/asset-reminders" },
    { label: "Workspaces", href: "/features/workspaces" },
    { label: "Location tracking", href: "/features/location-tracking" },
    { label: "Reports", href: "/features/reports" },
    { label: "Which tracking method fits? Take the quiz", href: "/knowledge-base/how-to-choose-a-tracking-method" },
];

/* ------------------------------------------------------------------ */
/*  Questions we get every week                                        */
/* ------------------------------------------------------------------ */

/**
 * Every answer is checked against the site's own sources (KB articles,
 * pricing data, the open-source solutions page). Paid add-ons say so in the
 * answer itself. There is no API question on purpose: the honest answer today
 * is "no documented public API", and that belongs on its own page.
 */
export const HOME_QUESTIONS: { id: string; question: string; answer: string; href: string; linkLabel: string }[] = [
    {
        id: "user-limit",
        question: "Is there a limit to how many users I can add?",
        answer: "Our Team and Enterprise plans allow for unlimited users. We believe asset management works best when everyone is accountable, so we don't penalize you for growing your team. The Free plan is for one person.",
        href: "/pricing",
        linkLabel: "Compare plans",
    },
    {
        id: "self-checkout",
        question: "Can people check gear out themselves?",
        answer: "Yes, and you decide who. Self-service users book equipment for themselves and check it out and back in on their own. Base users, often students or occasional borrowers, send a booking request that an admin approves and hands over. Bookings are part of the Team plan.",
        href: "/knowledge-base/user-roles-and-their-permissions",
        linkLabel: "User roles and permissions",
    },
    {
        id: "barcodes",
        question: "Can we keep the barcodes already on our equipment?",
        answer: "Yes. The Alternative Barcodes add-on works with Code 128, Code 39, EAN-13, DataMatrix and QR codes, so you can move over from another system without re-tagging a single item. It is a paid add-on. Shelf's own QR codes come with every asset, on every plan.",
        href: "/knowledge-base/alternative-barcodes",
        linkLabel: "How alternative barcodes work",
    },
    {
        id: "late-booking",
        question: "What happens when a booking runs late?",
        answer: "It is marked overdue and turns red on the calendar, and the people on the booking get an overdue notice by email. Overdue items also show on the dashboard and in the Overdue Items report, so a late return is caught before it hits the next reservation. If the gear is simply needed longer, extend the booking's end date.",
        href: "/knowledge-base/extending-booking-end-dates-in-shelf",
        linkLabel: "Extending a booking",
    },
    {
        id: "import",
        question: "Can I import my existing data?",
        answer: "Yes. We offer a simple CSV importer that lets you bring in thousands of assets, contacts, and locations in minutes. We provide templates to make the process seamless.",
        href: "/knowledge-base/importing-assets-to-shelf-csv-guide",
        linkLabel: "CSV import guide",
    },
    {
        id: "hardware",
        question: "Do I need special hardware?",
        answer: "No. Shelf works with any smartphone or tablet. Our Shelf Companion app for iPhone and Android lets you scan QR codes using your phone camera, and the web app also works in any modern phone browser. You can also use standard USB scanners if you prefer.",
        href: "/knowledge-base/using-external-barcode-scanners-with-shelf",
        linkLabel: "Using external barcode scanners",
    },
    {
        id: "sso",
        question: "Do you support single sign-on (SSO)?",
        answer: "Yes. Single sign-on over SAML 2.0 works with Microsoft Entra, Google Workspace, Okta and other providers that support the protocol. It is a paid add-on for the Team plan, priced per person who signs in with SSO, and we set it up together with you.",
        href: "/pricing",
        linkLabel: "See add-on pricing",
    },
    {
        id: "self-host",
        question: "Can we self-host Shelf?",
        answer: "Yes, if your organization requires it. Self-hosting needs Docker, PostgreSQL and Supabase, and the open-source software is free under the AGPL license. Setup documentation is in the GitHub repository. One thing is licensed separately: connecting the Shelf Companion mobile app to your own server. Most teams choose Shelf Cloud and are running within the hour.",
        href: "/knowledge-base/connect-shelf-companion-to-your-own-server",
        linkLabel: "Companion app on your own server",
    },
    {
        id: "open-source",
        question: "How does the open source part work?",
        answer: "Shelf is open source, meaning our code is publicly available for audit and contribution. We host the managed version (SaaS) so you don't have to worry about servers, updates, or security, but you never lose control of your data.",
        href: "/solutions/open-source-asset-management",
        linkLabel: "Open source asset management",
    },
];

/* ------------------------------------------------------------------ */
/*  Segments                                                           */
/* ------------------------------------------------------------------ */

export type SegmentIcon = "camera" | "graduation" | "scan" | "wrench" | "laptop" | "calendar";

export const HOME_SEGMENTS: {
    id: string;
    icon: SegmentIcon;
    title: string;
    text: string;
    href: string;
    link: string;
    /** Customer-logo ids shown as proof chips */
    logos?: string[];
    note?: string;
}[] = [
    { id: "camera", icon: "camera", title: "Camera & production gear", text: "Cameras, lenses and accessories as complete kits, from the cage to the set and back.", href: "/solutions/camera-equipment-check-out", link: "Camera check-out", logos: ["fabel-film", "ak-film-it"] },
    { id: "education", icon: "graduation", title: "Universities & schools", text: "Built for higher education: cameras, laptops, AV and lab gear across departments. SSO and procurement docs for campus IT.", href: "/solutions/educational-resource-management", link: "Shelf for education", logos: ["purdue-satt", "eastern-michigan-university", "kansas-city-art-institute"] },
    { id: "checkout", icon: "scan", title: "Equipment check-in & check-out", text: "Replace sign-out sheets with a QR scan. Custody logs, bookings and real-time availability.", href: "/solutions/equipment-check-in", link: "Equipment checkout", logos: ["arrelano-associates"], note: "Community outreach events" },
    { id: "tools", icon: "wrench", title: "Tools & job sites", text: "Tools across trucks, crews and sites, with custody chains that hold up in the field.", href: "/solutions/tool-tracking", link: "Tool tracking", logos: ["ces-utility"], note: "$70K of equipment recovered" },
    { id: "it", icon: "laptop", title: "IT & laptops", text: "Laptops, tablets and chargers with a custody history, for offices and hybrid teams.", href: "/solutions/it-asset-management", link: "IT asset tracking", note: "Sequential IDs, custom fields, CSV import" },
    { id: "reservations", icon: "calendar", title: "Equipment reservations", text: "Let people book gear ahead, with an availability view that stops double bookings before they happen. Bookings are on the Team plan.", href: "/solutions/equipment-reservations", link: "Equipment reservations", note: "Calendar, availability view, kits booked as one" },
];

/** The solutions pages the previous homepage's picker linked to that have no card above. See the SEO note. */
export const MORE_SOLUTIONS: { label: string; href: string }[] = [
    { label: "Asset tracking", href: "/solutions/asset-tracking" },
    { label: "Equipment management", href: "/solutions/equipment-management" },
    { label: "Fixed asset tracking", href: "/solutions/fixed-asset-tracking" },
    { label: "Maintenance tracking", href: "/solutions/maintenance-tracking" },
    { label: "Open source & self-hosting", href: "/solutions/open-source-asset-management" },
];

/* ------------------------------------------------------------------ */
/*  Stories                                                            */
/* ------------------------------------------------------------------ */

export const FEATURED_STORIES = [
    {
        id: "industrial-artifacts",
        href: "/case-studies/industrial-artifacts",
        shot: { src: `${SUPABASE}/case-studies/industrial-artifacts/hero-poster.jpg`, width: 1200, height: 675, alt: "Inside Industrial Artifacts, an antique mall in DeKalb, Illinois" } as HomeShot,
        credit: "Video courtesy of Industrial Artifacts",
        isVideo: true,
        logo: `${SUPABASE}/case-studies/industrial-artifacts/logo.png`,
        company: "Industrial Artifacts",
        descriptor: "Antique mall and auction house, DeKalb, Illinois",
        quote: "If I were starting again, I'd find a dedicated IMS much sooner.",
        author: "Al Ferris",
        role: "Chief Growth Officer",
        numbers: [
            { value: "10,000+", label: "one-of-a-kind items tracked" },
            { value: "360–400", label: "lots pulled per auction close" },
            { value: "8,860", label: "items migrated in under two weeks" },
        ],
    },
    {
        id: "purdue",
        href: "/case-studies/purdue-university",
        shot: { src: "/images/case-studies/purdue-uas.jpg", width: 1920, height: 960, alt: "Purdue University's unmanned aircraft program in the field" } as HomeShot,
        credit: undefined,
        isVideo: false,
        logo: "/logos/purdue-university.webp",
        company: "Purdue University",
        descriptor: "School of Aviation and Transportation Technology",
        quote: "We use Shelf as a teaching tool as much as a tracking tool. Our students are heading into an industry built on compliance, so my colleagues and I lecture on the importance of asset tracking while using Shelf to give live demonstrations of immutable asset records — where it flew, when it flew, who it was flown by, and all maintenance requests and records.",
        author: "Nathan Rose",
        role: "Clinical Assistant Professor",
        numbers: undefined,
    },
];

export const MINI_STORIES: { id: string; href: string; logo: string; company: string; descriptor: string; result: [string, string, string]; text: string; by?: string }[] = [
    { id: "ces", href: "/case-studies/ces-70k-recovery", logo: "/logos/ces-utility.webp", company: "CES Utility Solutions", descriptor: "Utility infrastructure", result: ["", "$70K", " of equipment recovered"], text: "A lost $70,000 drone kit was recovered because someone scanned its Shelf QR label, preventing project delays." },
    { id: "fabel", href: "/case-studies/fabel-film-double-bookings", logo: "/logos/fabel-film.webp", company: "Fabel Film", descriptor: "Video production", result: ["", "Zero", " double bookings after moving to Shelf"], text: "“Double bookings is the reason I wanted to use Shelf. The moment I had to arrange a last-minute extra camera.”", by: "Johannes van Beeck, Technical Director" },
    { id: "emu", href: "/case-studies/eastern-michigan-university", logo: "/logos/eastern-michigan-university.webp", company: "Eastern Michigan University", descriptor: "Theatre and media departments", result: ["Theatre and media equipment, ", "streamlined", ""], text: "“Shelf's platform checked all the boxes when it came to our needs.”", by: "Dustin D. Miller, Technical Director & Production Manager" },
];

/** Keeps the case studies the old homepage linked to. See the SEO note above. */
export const MORE_STORIES: { label: string; href: string }[] = [
    { label: "HAARP, research in the Alaskan Arctic", href: "/case-studies/haarp" },
    { label: "ResQ, 4,000+ contact center assets", href: "/case-studies/resq-contact-center" },
    { label: "Arellano Associates, event equipment", href: "/case-studies/arellano-associates" },
    { label: "Kansas City Art Institute, moved from Cheqroom", href: "/case-studies/kcai" },
];
