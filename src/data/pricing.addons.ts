/**
 * SINGLE SOURCE OF TRUTH for Shelf add-on pricing.
 *
 * Every surface that shows an add-on price — the pricing cards, the add-ons
 * section, the feature comparison table, the pricing FAQ, the JSON-LD offers,
 * and llms.txt — derives from this file. Do NOT hardcode a price string
 * anywhere else; `scripts/check-product-claims.mjs` fails CI if you do.
 *
 * Every price here was verified against the Stripe product catalogue on
 * 2026-08-04. Re-verify there when changing anything.
 *
 * THIS REPOSITORY IS PUBLIC. Do not add customer names, invoice numbers,
 * subscriber or revenue figures, or Stripe account/product/price identifiers
 * to this file or any other. Only prices we publish on the website belong
 * here. The unlimited-seat SSO licence is quoted per organization and its
 * price is deliberately absent from this repo — Stripe is the only source.
 *
 * Naming note: Stripe calls the barcode add-on "Universal Barcode Support".
 * The product UI (`app/config/addon-copy.ts`) and this site both call it
 * "Alternative Barcodes" — that is the customer-facing name and the one with
 * existing search equity, so it is what we publish. Invoices say the Stripe
 * name; aligning the two is a separate decision.
 *
 * Copy is kept in sync with the product's own `app/config/addon-copy.ts` so
 * the website says exactly what the in-app onboarding modal says.
 */

/** One band of a per-seat tiered price. Bands are CUMULATIVE — the first 15
 *  seats always bill at the tier-1 rate even when the workspace has 200. */
export interface AddOnPriceTier {
    /** Human label, e.g. "First 15 users" */
    label: string;
    /** First seat covered by this band (1-indexed, inclusive) */
    from: number;
    /** Last seat covered, or null for "and above" */
    to: number | null;
    /** Per-user, per-month cost when billed annually */
    yearlyPerUser: number;
    /** Per-user, per-month cost on monthly billing, or null if this band is
     *  annual-billing only (true for every band above tier 1). */
    monthlyPerUser: number | null;
}

export interface AddOn {
    id: string;
    /** Customer-facing name (matches the in-app label) */
    name: string;
    /** Stripe product name, when it differs from `name` */
    stripeProductName?: string;
    /** One-liner used on cards and in the plan bullets */
    tagline: string;
    /** Longer description for the add-ons section */
    description: string;
    /** Bullet points, mirroring the product's addon-copy.ts */
    features: string[];
    /** Flat monthly price in USD, or null if this add-on has no monthly price */
    priceMonthly: number | null;
    /** Flat annual price in USD, or null if priced per seat */
    priceYearly: number | null;
    /** Per-seat tiered pricing, for add-ons licensed per identity rather than
     *  per workspace. Mutually exclusive with priceMonthly/priceYearly. */
    tiers?: AddOnPriceTier[];
    /**
     * Seat count above which we invite an unlimited-licence conversation.
     *
     * The unlimited licence has a real flat price. It is not in this repo and
     * must not be added: the repository is public, and this module is also
     * compiled into the public client bundle, so an "isPublic: false" flag
     * would protect nothing on either count. Quote it from Stripe.
     *
     * This threshold is deliberately rounder than the true break-even, so the
     * exact crossover cannot be used to back-compute the price.
     */
    unlimitedEnquiryThreshold?: number;
    /** Which plan the add-on attaches to */
    availableOn: string;
    /** Can it be switched on free during the 7-day Team trial? */
    freeInTrial: boolean;
    /** Internal link to the feature page, when one exists */
    href?: string;
    /** Small pill shown on the card — positioning, not a popularity statistic */
    badge?: string;
    /**
     * Tools whose existing labels this add-on can take over. Rendered as links
     * to the matching /alternatives page, so the card earns internal links on
     * migration-intent terms rather than just sitting there as copy.
     *
     * Keep this to systems we can actually read: the add-on supports Code128,
     * Code39, EAN-13, DataMatrix and QR, which covers the tag formats these
     * tools issue. Do not add a tool here without checking its label format.
     */
    migrationFrom?: { name: string; slug: string }[];
    /** Shown when the add-on needs a conversation rather than a checkout */
    salesCta?: { label: string; href: string; location: string };
}

/**
 * Formats a USD amount the way we display it: no trailing ".00", but cents
 * preserved where they exist ($37, $18.50, $1,860).
 */
export function formatUSD(amount: number): string {
    const hasCents = Math.round(amount * 100) % 100 !== 0;
    return `$${amount.toLocaleString("en-US", {
        minimumFractionDigits: hasCents ? 2 : 0,
        maximumFractionDigits: 2,
    })}`;
}

/**
 * The effective per-month cost of an annual price, matching how the plan
 * cards render yearly pricing ($370/yr shown as $30.83/mo).
 */
export function yearlyAsMonthly(yearly: number): number {
    return Math.round((yearly / 12) * 100) / 100;
}

export const addOns: AddOn[] = [
    {
        id: "audits",
        name: "Audits",
        tagline: "Verify what you actually have, on a schedule",
        description:
            "Create audits, assign auditors, scan QR codes, and track asset verification in real-time. Shelf compares what was scanned against what should be there and flags found, missing, and unexpected items automatically.",
        features: [
            "Create audits and assign auditors to verify your assets",
            "Set due dates and track progress in real-time",
            "Use QR code scanning for quick asset verification",
            "Generate detailed audit reports",
        ],
        priceMonthly: 37,
        priceYearly: 205,
        availableOn: "Team",
        freeInTrial: true,
        href: "/features/audits",
    },
    {
        id: "alternative-barcodes",
        name: "Alternative Barcodes",
        stripeProductName: "Universal Barcode Support",
        tagline: "Keep the labels already on your assets",
        description:
            "Generate new barcodes or use your existing ones. Supports Code128, Code39, EAN-13, DataMatrix & QR codes — ideal for migrations, so you can bring assets across from another system without re-tagging a single item.",
        features: [
            "Supports Code128, Code39, EAN-13, DataMatrix & QR codes",
            "Generate new barcode labels or use your existing ones",
            "Print barcode labels for your assets",
            "Built-in barcode scanner for quick asset lookups",
        ],
        priceMonthly: 18.5,
        priceYearly: 170,
        availableOn: "Team",
        freeInTrial: true,
        badge: "Popular for migrations",
        migrationFrom: [
            { name: "Cheqroom", slug: "cheqroom" },
            { name: "Snipe-IT", slug: "snipe-it" },
            { name: "Asset Panda", slug: "asset-panda" },
            { name: "EZOfficeInventory", slug: "ezofficeinventory" },
            { name: "Wasp", slug: "wasp" },
        ],
    },
    {
        id: "sso",
        name: "SSO / SAML",
        tagline: "Sign in with your existing identity provider",
        description:
            "Single Sign-On over SAML 2.0, working with Microsoft Entra, Google Workspace, Okta, and other providers that support the protocol. Automatic user provisioning (SCIM) is included at no extra charge. Your Team plan is licensed per workspace with unlimited users — SSO is the one deliberate exception, licensed per identity that signs in.",
        features: [
            "SAML 2.0 — works with Entra, Google Workspace, Okta and more",
            "Automatic user provisioning (SCIM) included",
            "Applies to every user in the workspace",
            "Regular username/password users stay unlimited and included",
        ],
        priceMonthly: null,
        priceYearly: null,
        tiers: [
            { label: "First 15 users", from: 1, to: 15, yearlyPerUser: 9, monthlyPerUser: 15 },
            { label: "Users 16–50", from: 16, to: 50, yearlyPerUser: 4, monthlyPerUser: null },
            { label: "Users 51–250", from: 51, to: 250, yearlyPerUser: 1, monthlyPerUser: null },
            { label: "Users 251 and above", from: 251, to: null, yearlyPerUser: 0.05, monthlyPerUser: null },
        ],
        unlimitedEnquiryThreshold: 100,
        availableOn: "Team",
        // SSO is configured together with our team on a paid plan, so it is the
        // one add-on that cannot be self-enabled during the trial.
        freeInTrial: false,
        salesCta: {
            label: "Get an SSO quote",
            href: "/contact",
            location: "pricing_addons_sso_quote",
        },
    },
];

/**
 * One-time professional services. Deliberately NOT in `addOns` — these are
 * quoted engagements, not subscription line items that appear in workspace
 * settings, and mixing them into the add-on grid would misrepresent both.
 */
export const services = [
    {
        id: "migration-support",
        name: "Migration Support",
        description:
            "We move your data, images, and codes into Shelf for you. Self-serve CSV import is included on Plus and above — this is for teams who would rather hand the whole migration over.",
        priceFrom: 175,
        availableOn: "Any plan",
    },
] as const;

export function getAddOn(id: string): AddOn | undefined {
    return addOns.find((a) => a.id === id);
}

/**
 * Renders an add-on's price for a given billing period.
 * Per-seat add-ons return their entry rate, prefixed with "from".
 */
export function formatAddOnPrice(addOn: AddOn, isYearly: boolean): string {
    if (addOn.tiers && addOn.tiers.length > 0) {
        const entry = addOn.tiers[0];
        const rate = isYearly ? entry.yearlyPerUser : entry.monthlyPerUser;
        // Tiers above the first are annual-only, and on monthly billing only
        // tier 1 has a rate at all — so fall back to the annual entry rate.
        if (rate === null) return `from ${formatUSD(entry.yearlyPerUser)}/user/mo`;
        return `from ${formatUSD(rate)}/user/mo`;
    }

    if (isYearly) {
        if (addOn.priceYearly === null) return "Contact us";
        return `${formatUSD(yearlyAsMonthly(addOn.priceYearly))}/mo`;
    }

    if (addOn.priceMonthly === null) {
        // No monthly price exists — show the annual figure rather than hiding
        // the add-on entirely from anyone on the monthly toggle.
        return addOn.priceYearly !== null ? `${formatUSD(addOn.priceYearly)}/yr` : "Contact us";
    }
    return `${formatUSD(addOn.priceMonthly)}/mo`;
}

/**
 * Total annual cost of N SSO seats, applying the cumulative bands.
 * Used for the worked example in the pricing FAQ so it can never drift from
 * the band table (20 seats = 15 x $9 + 5 x $4, per month, x12 = $1,860/yr).
 */
export function ssoAnnualCost(users: number): number {
    const sso = getAddOn("sso");
    if (!sso?.tiers) return 0;

    const perMonth = sso.tiers.reduce((total, tier) => {
        const upper = tier.to ?? Infinity;
        const seatsInBand = Math.max(0, Math.min(users, upper) - tier.from + 1);
        return total + seatsInBand * tier.yearlyPerUser;
    }, 0);

    return perMonth * 12;
}

/**
 * Renders a tier band for use mid-sentence. The stored labels are title-case
 * for UI use ("First 15 users"); in prose the leading band needs an article
 * so the sentence reads "for the first 15 users", not "for first 15 users".
 */
export function tierProse(tier: AddOnPriceTier, index: number): string {
    const lower = tier.label.toLowerCase();
    return index === 0 ? `the ${lower}` : lower;
}

// The unlimited-licence price and its break-even calculation deliberately do
// NOT live here — this module ships to the browser. See pricing.addons.internal.ts.

/** Plain-text price summary used by the FAQ, feature table, and llms.txt. */
export function addOnPriceSummary(addOn: AddOn): string {
    if (addOn.tiers && addOn.tiers.length > 0) {
        const bands = addOn.tiers
            .map((t, i) => `${formatUSD(t.yearlyPerUser)}/user/mo for ${tierProse(t, i)}`)
            .join(", ");
        // No trailing period — callers append their own sentence punctuation.
        return `${bands} (annual billing); monthly billing is ${formatUSD(
            addOn.tiers[0].monthlyPerUser ?? addOn.tiers[0].yearlyPerUser
        )}/user/mo for the first ${addOn.tiers[0].to} users`;
    }

    const parts: string[] = [];
    if (addOn.priceMonthly !== null) parts.push(`${formatUSD(addOn.priceMonthly)}/mo`);
    if (addOn.priceYearly !== null) parts.push(`${formatUSD(addOn.priceYearly)}/yr`);
    return parts.join(" or ");
}
