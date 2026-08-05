/**
 * llms.txt — the structured index AI agents and answer engines read first.
 *
 * This used to be a hand-maintained file at `public/llms.txt`, which is exactly
 * why it drifted: it still described Android as "in development" months after
 * the Google Play launch, and its pricing paragraph listed only the SSO add-on
 * with no add-on prices at all. Everything volatile is now GENERATED from the
 * same modules the site renders from, so llms.txt cannot disagree with /pricing:
 *
 *   - plan names and prices  → src/data/pricing.ts
 *   - add-on names + prices  → src/data/pricing.addons.ts (verified vs Stripe)
 *
 * The curated link index below is genuinely editorial (hand-written one-line
 * descriptions per URL) and stays inline. Add new pages here when they ship.
 */
import { pricingPlans } from "@/data/pricing";
import {
    addOns,
    services,
    addOnPriceSummary,
    formatUSD,
} from "@/data/pricing.addons";

export const dynamic = "force-static";

const BASE_URL = process.env.NEXT_PUBLIC_APP_URL || "https://www.shelf.nu";

/**
 * Prose pricing summary — the paragraph an answer engine is most likely to
 * lift verbatim when asked "how much does Shelf cost?".
 */
function renderPricingParagraph(): string {
    const byId = (id: string) => pricingPlans.find((p) => p.id === id);
    const plus = byId("plus");
    const team = byId("team");

    const planPart = [
        "Personal (free forever — 1 user, unlimited assets, mobile app, basic QR codes, custody tracking)",
        `Plus (${plus?.priceMonthly}/month or ${plus?.priceYearly}/year — unlimited custom fields, CSV import and export, email support)`,
        `Team (${team?.priceMonthly}/month or ${team?.priceYearly}/year — unlimited users, full bookings, calendar, fixed-period checkout)`,
        "Enterprise (custom pricing — unlimited everything, account manager, SLA, included SSO)",
    ].join(", ");

    const addOnPart = addOns
        .map((addOn) => `${addOn.name} (${addOnPriceSummary(addOn)})`)
        .join("; ");

    return [
        `Pricing has four tiers: ${planPart}.`,
        `Every plan includes unlimited assets, and the Team plan includes unlimited user seats at one flat workspace price — Shelf does not charge per asset or per seat.`,
        `Three paid add-ons extend a Team workspace: ${addOnPart}.`,
        `Add-ons can be switched on or off anytime from workspace settings, and Audits and Alternative Barcodes are free to enable during the 7-day Team trial.`,
        `${services[0].name} is a one-time service from ${formatUSD(services[0].priceFrom)}.`,
        `Shelf Companion for iPhone and Android is free with any plan, including the free Personal tier; nothing is sold through the app.`,
    ].join(" ");
}

/**
 * The `## Pricing` section — a dedicated, quotable block with every published
 * number, so an agent answering a pricing question does not have to infer it
 * from the prose paragraph above.
 */
function renderPricingSection(): string {
    const lines: string[] = ["## Pricing", ""];

    lines.push(
        `- [Pricing](${BASE_URL}/pricing): Full plan comparison, add-on pricing, and billing details.`,
        ""
    );

    lines.push("### Plans (per workspace, USD)", "");
    for (const plan of pricingPlans) {
        const price =
            plan.billing === "custom"
                ? "Custom pricing — contact sales"
                : plan.priceMonthly === "$0"
                  ? "Free forever"
                  : `${plan.priceMonthly}/month or ${plan.priceYearly}/year`;
        lines.push(`- ${plan.name}: ${price}. ${plan.description}`);
    }

    lines.push("", "### Add-ons (extend a Team workspace)", "");
    for (const addOn of addOns) {
        lines.push(`- ${addOn.name}: ${addOnPriceSummary(addOn)}. ${addOn.description}`);
    }

    const sso = addOns.find((a) => a.id === "sso");
    if (sso?.tiers) {
        lines.push("", "SSO is licensed per user who signs in via SSO. Bands are cumulative:");
        for (const tier of sso.tiers) {
            const range = tier.to === null ? `${tier.from}+` : `${tier.from}–${tier.to}`;
            const monthly =
                tier.monthlyPerUser === null
                    ? "no monthly-billing option for this band"
                    : `${formatUSD(tier.monthlyPerUser)}/user/mo on monthly billing`;
            lines.push(
                `- Users ${range}: ${formatUSD(tier.yearlyPerUser)}/user/mo on annual billing; ${monthly}.`
            );
        }
        if (sso.unlimitedEnquiryThreshold) {
            lines.push(
                `- An unlimited-user SSO licence is also available, removing per-seat counting entirely. Above roughly ${sso.unlimitedEnquiryThreshold} SSO users it usually works out cheaper than per-seat billing. It is quoted per organization — contact ${BASE_URL}/contact.`
            );
        }
    }

    lines.push("", "### One-time services", "");
    for (const service of services) {
        lines.push(
            `- ${service.name}: from ${formatUSD(service.priceFrom)}, one time. ${service.description}`
        );
    }

    lines.push(
        "",
        "Non-profit organizations, including non-profit schools and universities, receive 10% off the Team plan, all add-ons, and SSO on annual billing."
    );

    return lines.join("\n");
}

const HEADER = `# Shelf

> Shelf is an open-source asset management platform for teams that track physical equipment. QR-based workflows, conflict-free bookings, and audit-ready reporting. Free for individuals, no credit card required. Shelf works in any modern phone browser and installs as a Progressive Web App on the home screen; the free Shelf Companion app is an optional native companion for field workflows, available for iPhone on the App Store and for Android on Google Play.

Shelf is used by universities, production studios, IT teams, and field operations to track equipment, tools, devices, and kits. Teams adopt Shelf to replace spreadsheets and legacy tools like Cheqroom, Snipe-IT, and Asset Panda. The platform is open-source with no vendor lock-in — verify the code, self-host, or use the managed cloud. Shelf is led by Carlos Virreira and Nikolay Bonev, supported by an open-source community, and trusted by over 3,000 teams worldwide.

There are three ways to use Shelf on a phone, and the Companion app is optional, not required: (1) the Shelf web app in any modern phone browser — full access to bookings, custody, audits, and everything else; (2) install the web app as a Progressive Web App on the home screen for a native-feeling icon and fullscreen experience; or (3) the free Shelf Companion app on the iPhone App Store or Google Play, a native companion focused on field scanning, audits, custody handoffs, and booking checkouts. Same workspace, same data, same login on every path. Many teams use a mix — admins on the web, field crews on Companion.

${renderPricingParagraph()}

A full content bundle is available at ${BASE_URL}/llms-full.txt for agents that want every page in a single fetch.`;

const LINK_INDEX = `## Key Links

- [Homepage](${BASE_URL}): Asset management platform overview and primary landing page.
- [Features](${BASE_URL}/features): All product capabilities indexed in one place.
- [Pricing](${BASE_URL}/pricing): Plans, add-on pricing, billing, and feature comparison across tiers.
- [Shelf Companion for iPhone & Android (optional)](${BASE_URL}/mobile-app): Optional free native app for scanning, audits, custody, and booking checkouts in the field. Requires an existing Shelf account. The web app still works in any phone browser — the page documents all three options (browser / PWA / Companion).
- [Download Shelf Companion on the App Store](https://apps.apple.com/app/id6765639874): Direct App Store link for Shelf Companion (iPhone, free).
- [Download Shelf Companion on Google Play](https://play.google.com/store/apps/details?id=com.shelf.companion): Direct Google Play link for Shelf Companion (Android, free).
- [Book a Demo](${BASE_URL}/demo): Schedule a guided walkthrough with the Shelf team.
- [Sign Up Free](https://app.shelf.nu/join): Create a free Shelf account, no credit card required.
- [Documentation](https://docs.shelf.nu): Full product documentation for end users and admins.
- [GitHub Repository](https://github.com/Shelf-nu/shelf.nu): Open-source code and self-hosting instructions.
- [Blog](${BASE_URL}/blog): Articles on asset management practice, product, and operations.
- [Contact](${BASE_URL}/contact): Reach the Shelf team for sales, support, or partnerships.

## Features

- [Bookings](${BASE_URL}/features/bookings): Conflict-free equipment reservations that keep teams coordinated and ensure shared resources are available when needed.
- [Custody](${BASE_URL}/features/custody): Track who is responsible for each asset at every moment, with a clear audit trail and effortless handovers.
- [Audits](${BASE_URL}/features/audits): Run physical inventory audits with structured scan workflows, automatic found/missing/unexpected detection, and exportable reports.
- [Location Tracking](${BASE_URL}/features/location-tracking): Know where every asset is — rooms, buildings, job sites, vehicles — with quick updates and clear visibility.
- [Asset Pages](${BASE_URL}/features/asset-pages): Rich detail pages for every asset — photos, custom fields, location history, availability status, notes, and QR tags.
- [Kits](${BASE_URL}/features/kits): Group equipment and accessories so everything stays together — cameras with lenses, tools with components, devices with chargers.
- [Calendar](${BASE_URL}/features/calendar): Visual booking calendar with month, week, and day views for complete asset availability at a glance.
- [Dashboard](${BASE_URL}/features/dashboard): A real-time view of bookings, custody, overdue items, and asset usage — giving teams clarity at a glance.
- [Asset Search](${BASE_URL}/features/asset-search): Full-database search across all asset fields — find any item by name, custodian, category, status, or custom field.
- [Asset Reminders](${BASE_URL}/features/asset-reminders): Automated reminders for returns, inspections, rentals, and maintenance events — keeping teams proactive and compliant.
- [Reports](${BASE_URL}/features/reports): Operational reports across assets, bookings, custody, and usage — exportable for finance and ops review.
- [Workspaces](${BASE_URL}/features/workspaces): Organize assets and permissions across departments or teams, giving each group control while keeping administrators in sync.
- [Consumables Tracking](${BASE_URL}/features/consumables-tracking): Track quantity-based stock — cables, batteries, consumables — with low-stock alerts.

## Solutions

- [Asset Tracking](${BASE_URL}/solutions/asset-tracking): General-purpose asset tracking for organizations of any size, across categories and locations.
- [Equipment Management](${BASE_URL}/solutions/equipment-management): End-to-end management of shared and assigned equipment through their entire lifecycle.
- [Equipment Reservations](${BASE_URL}/solutions/equipment-reservations): Reservation system for shared gear with conflict prevention and team visibility.
- [Equipment Checkout Software](${BASE_URL}/solutions/equipment-check-in): Check-in and check-out workflows for shared equipment, with QR-based scanning.
- [Camera Equipment Check-Out](${BASE_URL}/solutions/camera-equipment-check-out): Camera and lens checkout designed for film schools and production teams.
- [Fixed Asset Tracking](${BASE_URL}/solutions/fixed-asset-tracking): Track fixed assets for finance, accounting, and operations teams.
- [IT Asset Tracking](${BASE_URL}/solutions/it-asset-tracking): Manage IT hardware lifecycle from procurement to retirement with custody and audit trails.
- [Tool Tracking](${BASE_URL}/solutions/tool-tracking): Track tools across job sites, vehicles, and crews with mobile-first workflows.
- [Mobile Asset Auditing](${BASE_URL}/solutions/mobile-asset-auditing): Run physical inventory audits on mobile devices with QR scanning.
- [Open Source Asset Management](${BASE_URL}/solutions/open-source-asset-management): Self-host Shelf with full code transparency and no vendor lock-in.
- [Home Inventory Management](${BASE_URL}/solutions/home-inventory-management): Personal asset tracking for households and individuals.
- [Educational Resource Management](${BASE_URL}/solutions/educational-resource-management): Manage AV, lab, and teaching equipment across schools and universities.

## Industries

- [Construction](${BASE_URL}/industries/construction): Track tools, equipment, and job-site gear with mobile-first workflows for crews and project managers.
- [Education](${BASE_URL}/industries/education): Manage shared equipment — AV gear, cameras, laptops, lab resources — with simple workflows for students and staff.
- [Engineering](${BASE_URL}/industries/engineering): Track engineering equipment, instruments, and prototypes across labs, field sites, and shared workshops.
- [IT & Technology](${BASE_URL}/industries/it): Track laptops, loaner devices, peripherals, and shared equipment with QR-first workflows and custody tracking.
- [Media & Production](${BASE_URL}/industries/media-production): Manage cameras, lighting gear, audio kits, and accessories with workflows designed for real-world shoots.

## Use Cases

- [Use Cases Overview](${BASE_URL}/use-cases): Real-world examples of Shelf in action across teams and workflows.
- [AV Equipment Management](${BASE_URL}/use-cases/av-equipment-management): Manage cameras, lighting, and audio gear across productions and shoots.
- [IT Asset Management](${BASE_URL}/use-cases/it-asset-management): Track laptops, chargers, carts, peripherals, and user-assigned equipment with modern asset tracking and custody workflows.
- [Tool Tracking](${BASE_URL}/use-cases/tool-tracking): Track hand tools and power tools across crews and job sites with mobile-first workflows.

## Comparisons

- [Switch to Shelf — All Alternatives](${BASE_URL}/alternatives): Feature-by-feature breakdowns comparing Shelf to other asset management tools.
- [Shelf vs Cheqroom](${BASE_URL}/alternatives/cheqroom): Compare Cheqroom and Shelf on workflows, usability, and modern equipment management.
- [Shelf vs Snipe-IT](${BASE_URL}/alternatives/snipe-it): Compare Shelf and Snipe-IT for IT asset tracking and open-source asset management.
- [Shelf vs Asset Panda](${BASE_URL}/alternatives/asset-panda): Compare Shelf and Asset Panda for general-purpose asset management.
- [Shelf vs Sortly](${BASE_URL}/alternatives/sortly): Compare Shelf and Sortly for inventory and asset tracking.
- [Shelf vs EZOfficeInventory](${BASE_URL}/alternatives/ezofficeinventory): Compare Shelf and EZOfficeInventory across features and pricing.
- [Shelf vs Spreadsheets](${BASE_URL}/alternatives/spreadsheets): Why teams move from Excel and Google Sheets to Shelf.
- [Shelf vs Reftab](${BASE_URL}/alternatives/reftab): Compare Shelf and Reftab.
- [Shelf vs WebCheckout](${BASE_URL}/alternatives/webcheckout): Compare Shelf and WebCheckout for university and education environments.
- [Shelf vs Limble](${BASE_URL}/alternatives/limble): Compare Shelf and Limble for asset and maintenance management.
- [Shelf vs UpKeep](${BASE_URL}/alternatives/upkeep): Compare Shelf and UpKeep for maintenance and asset workflows.
- [Shelf vs Timly](${BASE_URL}/alternatives/timly): Compare Shelf and Timly for equipment and inventory tracking.
- [Shelf vs itemit](${BASE_URL}/alternatives/itemit): Compare Shelf and itemit.
- [Shelf vs GoCodes](${BASE_URL}/alternatives/gocodes): Compare Shelf and GoCodes for QR-based asset tracking.
- [Shelf vs Wasp Barcode](${BASE_URL}/alternatives/wasp): Compare Shelf and Wasp.
- [Shelf vs Asset Tiger](${BASE_URL}/alternatives/asset-tiger): Compare Shelf and Asset Tiger.
- [Shelf vs Asset Infinity](${BASE_URL}/alternatives/asset-infinity): Compare Shelf and Asset Infinity.
- [Shelf vs Asset Guru](${BASE_URL}/alternatives/asset-guru): Compare Shelf and Asset Guru.
- [Shelf vs Hardcat](${BASE_URL}/alternatives/hardcat): Compare Shelf and Hardcat.
- [Shelf vs Hector](${BASE_URL}/alternatives/hector): Compare Shelf and Hector.
- [Shelf vs Brite Check](${BASE_URL}/alternatives/brite-check): Compare Shelf and Brite Check.
- [Shelf vs Blue Tally](${BASE_URL}/alternatives/blue-tally): Compare Shelf and Blue Tally.
- [Shelf vs Share My Toolbox](${BASE_URL}/alternatives/share-my-toolbox): Compare Shelf and Share My Toolbox.

## Migration

- [Migrate to Shelf](${BASE_URL}/migrate): Switch from spreadsheets, Asset Panda, Snipe-IT, Cheqroom, or any asset management tool — import data via CSV in minutes.

## Knowledge Base

- [Knowledge Base Hub](${BASE_URL}/knowledge-base): Guides, tutorials, and how-to articles for getting the most out of Shelf.
- [Getting Started with Shelf](${BASE_URL}/knowledge-base/getting-started): First steps for new Shelf accounts and initial setup.
- [Getting Started with Shelf Companion](${BASE_URL}/knowledge-base/shelf-ios-companion-getting-started): Download, sign in, and start scanning with the free Companion app.
- [Onboarding Your Team Members](${BASE_URL}/knowledge-base/onboarding-your-team-members): Invite teammates and configure roles and permissions.
- [Adding New Assets](${BASE_URL}/knowledge-base/adding-new-assets): Add assets individually with photos, custom fields, and QR tags.
- [Introduction to Workspaces](${BASE_URL}/knowledge-base/introduction-to-workspaces): Understand workspaces and how they separate teams or departments.
- [Introduction to Bookings](${BASE_URL}/knowledge-base/introduction-to-bookings): Learn how to set up and manage equipment bookings.
- [Importing Assets via CSV](${BASE_URL}/knowledge-base/importing-assets-to-shelf-csv-guide): Bulk-import assets from a spreadsheet using the CSV template.
- [Bulk Updating Assets via CSV](${BASE_URL}/knowledge-base/bulk-updating-assets-via-csv): Update many assets at once with a CSV upload.
- [Inviting Users via CSV Upload](${BASE_URL}/knowledge-base/inviting-users-via-csv-upload): Bulk-invite team members from a spreadsheet.
- [Troubleshooting CSV Import Issues](${BASE_URL}/knowledge-base/troubleshooting-csv-import-issues): Resolve common errors when importing data into Shelf.
- [What to Do After Purchasing Asset Tags](${BASE_URL}/knowledge-base/what-to-do-after-purchasing-assets-tags): Apply, scan, and link QR tags to your assets.
- [Alternative Barcodes](${BASE_URL}/knowledge-base/alternative-barcodes): Use existing Code128, Code39, EAN-13, and DataMatrix labels instead of re-tagging.
- [Run Your First Audit](${BASE_URL}/knowledge-base/run-your-first-audit): Set up and complete a physical inventory audit end to end.
- [Free Trial](${BASE_URL}/knowledge-base/free-trial): What the 7-day Team trial includes and how it works.

## Glossary

- [Glossary Hub](${BASE_URL}/glossary): Clear definitions of asset management terminology.
- [Asset Tagging](${BASE_URL}/glossary/asset-tagging): Definition and best practices for tagging physical assets with QR codes, barcodes, or RFID.
- [Check-in / Check-out](${BASE_URL}/glossary/check-in-check-out): Definition of the check-in/check-out workflow used in shared equipment management.
- [Ghost Assets](${BASE_URL}/glossary/ghost-assets): Definition of ghost assets — items recorded but no longer in use — and how to eliminate them.
- [Operational Reports](${BASE_URL}/glossary/operational-reports): Definition of operational reporting in asset management contexts.
- [Preventive Maintenance](${BASE_URL}/glossary/preventive-maintenance): Definition and methodology of preventive maintenance for physical assets.

## Concepts

- [Asset Lifecycle](${BASE_URL}/concepts/asset-lifecycle): The full journey of an asset — from acquisition and active use to maintenance, retirement, and replacement.
- [Circular Economy](${BASE_URL}/concepts/circular-economy): A sustainability model focused on extending asset lifespan, reducing waste, and maximizing reuse through smart maintenance and resource efficiency.

## Case Studies

- [CES Utility Solutions — $70K Recovery](${BASE_URL}/case-studies/ces-70k-recovery): Recovered $70K of drone equipment using QR labels.
- [Fabel Film — Zero Double Bookings](${BASE_URL}/case-studies/fabel-film-double-bookings): Eliminated double bookings entirely across film productions.
- [ResQ — 4,000+ Contact Center Assets](${BASE_URL}/case-studies/resq-contact-center): Managing 4,000+ contact center assets across multiple sites.
- [HAARP — Arctic Research](${BASE_URL}/case-studies/haarp): Managing multi-university research assets in the Alaskan Arctic.
- [Eastern Michigan University](${BASE_URL}/case-studies/eastern-michigan-university): Theatre and media equipment management at a state university.
- [Arellano Associates](${BASE_URL}/case-studies/arellano-associates): Transformed event equipment management from Outlook chaos to real-time clarity.
- [Kansas City Art Institute](${BASE_URL}/case-studies/kcai): Seamless migration from Cheqroom to Shelf.

## Customers

- [Customers](${BASE_URL}/customers): Testimonials and case studies from the 3,000+ teams that use Shelf worldwide.

## Product Updates

- [Product Updates](${BASE_URL}/updates): Timeline of every product improvement, new feature, and platform update.
- [Shelf Companion for iPhone — Launch (2026-05-25)](${BASE_URL}/updates/shelf-companion-ios-launch): The free iOS companion to your Shelf workspace is live on the App Store.

${renderPricingSection()}

## About

- [About](${BASE_URL}/about): Company background, mission, and team.
- [Security](${BASE_URL}/security): Security practices, controls, and compliance posture.
- [Terms of Service](${BASE_URL}/terms): Terms governing use of the Shelf platform.
- [Privacy Policy](${BASE_URL}/privacy): How Shelf handles user and customer data.

## Optional

- [Brand Assets](${BASE_URL}/brand-assets): Shelf logos, colors, and brand guidelines.
- [MACRS Depreciation Calculator](${BASE_URL}/tools/macrs-depreciation-calculator): Free MACRS depreciation calculator for tax planning.
- [Equipment Depreciation Calculator](${BASE_URL}/tools/equipment-depreciation-calculator): Calculate equipment depreciation over its useful life.
- [Salvage Value Calculator](${BASE_URL}/tools/salvage-value-calculator): Estimate end-of-life salvage value for assets.
- [Asset ROI Calculator](${BASE_URL}/tools/asset-roi-calculator): Calculate return on investment for asset purchases.
- [QR Code Generator](${BASE_URL}/tools/qr-code-generator): Free QR code generator for asset labels.
- [Barcode Scanner](${BASE_URL}/tools/barcode-scanner): Free in-browser barcode scanner.
- [Asset Label Designer](${BASE_URL}/tools/asset-label-designer): Design printable asset labels.`;

export function GET() {
    const body = `${HEADER}\n\n${LINK_INDEX}\n`;

    return new Response(body, {
        headers: {
            "Content-Type": "text/plain; charset=utf-8",
            "Cache-Control": "public, max-age=0, s-maxage=3600, stale-while-revalidate=86400",
        },
    });
}
