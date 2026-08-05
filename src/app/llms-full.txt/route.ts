import { getAllContent, type ContentType, type MDXContent } from "@/lib/mdx";
import { BASE_URL } from "@/lib/site-url";
import { pricingPlans } from "@/data/pricing";
import {
    addOns,
    services,
    addOnPriceSummary,
    formatUSD,
} from "@/data/pricing.addons";

export const dynamic = "force-static";

/**
 * Pricing block for the full bundle. This file previously shipped with NO
 * pricing at all — an agent that fetched only llms-full.txt could read every
 * feature page and still not know what Shelf costs. Numbers come from the same
 * modules /pricing renders from, so the bundle cannot drift from the page.
 */
function renderPricing(): string {
    const parts: string[] = ["# Pricing", "", `URL: ${BASE_URL}/pricing`, ""];

    parts.push(
        "Shelf is priced per workspace, not per asset or per user seat. Every plan includes unlimited assets, and the Team plan includes unlimited user seats at one flat price. All amounts are USD.",
        "",
        "## Plans",
        ""
    );

    for (const plan of pricingPlans) {
        const price =
            plan.billing === "custom"
                ? "Custom pricing — contact sales"
                : plan.priceMonthly === "$0"
                  ? "Free forever, no credit card required"
                  : `${plan.priceMonthly}/month, or ${plan.priceYearly}/year billed annually`;
        parts.push(`### ${plan.name} — ${price}`, "", plan.description, "");
    }

    parts.push(
        "## Add-ons",
        "",
        "Add-ons attach to a Team workspace and can be switched on or off at any time from workspace settings. Adding one mid-cycle on annual billing is prorated to the renewal date. Audits and Alternative Barcodes are free to enable during the 7-day Team trial; SSO is configured together with the Shelf team on a paid plan.",
        ""
    );

    for (const addOn of addOns) {
        parts.push(`### ${addOn.name} — ${addOnPriceSummary(addOn)}`, "", addOn.description, "");
        for (const feature of addOn.features) parts.push(`- ${feature}`);
        parts.push("");

        // Names the systems whose labels this add-on takes over, so an agent
        // asked "can Shelf reuse my Cheqroom/Snipe-IT barcodes?" can answer it.
        if (addOn.migrationFrom?.length) {
            parts.push(
                `Teams migrating from ${addOn.migrationFrom
                    .map((t) => t.name)
                    .join(", ")} commonly enable this add-on to keep the labels already on their assets instead of re-tagging every item.`,
                ""
            );
        }

        if (addOn.tiers) {
            parts.push(
                `SSO is licensed per user who signs in via SSO; bands are cumulative, so the first ${addOn.tiers[0].to} users always bill at the first-tier rate.`,
                ""
            );
            for (const tier of addOn.tiers) {
                const range = tier.to === null ? `${tier.from} and above` : `${tier.from}–${tier.to}`;
                const monthly =
                    tier.monthlyPerUser === null
                        ? "no monthly-billing option for this band"
                        : `${formatUSD(tier.monthlyPerUser)}/user/month on monthly billing`;
                parts.push(
                    `- Users ${range}: ${formatUSD(tier.yearlyPerUser)}/user/month on annual billing; ${monthly}.`
                );
            }
            if (addOn.unlimitedEnquiryThreshold) {
                parts.push(
                    `- An unlimited-user SSO licence is also available, removing per-seat counting entirely. Above roughly ${addOn.unlimitedEnquiryThreshold} SSO users it usually works out cheaper than per-seat billing. It is quoted per organization — contact ${BASE_URL}/contact.`
                );
            }
            parts.push("");
        }
    }

    parts.push("## One-time services", "");
    for (const service of services) {
        parts.push(
            `### ${service.name} — from ${formatUSD(service.priceFrom)}, one time`,
            "",
            service.description,
            ""
        );
    }

    parts.push(
        "## Discounts and billing",
        "",
        "Registered non-profit organizations, including non-profit schools and universities, receive 10% off the Team plan, all add-ons, and SSO on annual billing. Annual plans can be paid by invoice with a purchase order via ACH, wire, or SEPA transfer, and Shelf supports formal quotes, W9s, and vendor registration for procurement teams.",
        "",
        "---",
        ""
    );

    return parts.join("\n");
}

// Sections bundled into llms-full.txt. Ordered by LLM-reading priority:
// product capabilities first, then use cases, competitive comparisons,
// definitions, and conceptual content. Volatile content (blog, updates,
// case-studies) and high-volume reference content (knowledge-base) are
// intentionally excluded — they remain linked from llms.txt with stable
// URLs that agents can fetch individually.
const SECTIONS: { type: ContentType; heading: string }[] = [
    { type: "features", heading: "Features" },
    { type: "solutions", heading: "Solutions" },
    { type: "industries", heading: "Industries" },
    { type: "use-cases", heading: "Use Cases" },
    { type: "alternatives", heading: "Comparisons" },
    { type: "glossary", heading: "Glossary" },
    { type: "concepts", heading: "Concepts" },
];

function renderEntry({ frontmatter, content }: MDXContent): string {
    const lines: string[] = [
        `## ${frontmatter.title}`,
        "",
        `URL: ${frontmatter.canonicalUrl}`,
    ];

    if (frontmatter.description) {
        lines.push("", frontmatter.description);
    }

    lines.push("", content.trim());
    return lines.join("\n");
}

function renderSection(type: ContentType, heading: string): string {
    const entries = getAllContent(type);
    if (entries.length === 0) return "";

    const parts = [`# ${heading}`, ""];
    for (const entry of entries) {
        parts.push(renderEntry(entry), "", "---", "");
    }
    return parts.join("\n");
}

export function GET() {
    const header = [
        "# Shelf — Full Content Bundle",
        "",
        "> Consolidated bundle of Shelf's marketing site content for LLM ingestion.",
        "> See https://www.shelf.nu/llms.txt for the structured index with link descriptions.",
        "",
        "This file concatenates Pricing, Features, Solutions, Industries, Use Cases,",
        "Comparisons, Glossary, and Concepts. Knowledge base articles, blog posts,",
        "product updates, and case studies are linked from llms.txt with stable URLs.",
        "",
    ].join("\n");

    // Pricing leads the bundle: it is the single most-asked question of an
    // answer engine, and it is cheap to place before the long content sections.
    const body =
        renderPricing() +
        "\n" +
        SECTIONS.map(({ type, heading }) => renderSection(type, heading))
            .filter(Boolean)
            .join("\n");

    return new Response(header + "\n" + body, {
        headers: {
            "Content-Type": "text/plain; charset=utf-8",
            "Cache-Control": "public, max-age=0, s-maxage=3600, stale-while-revalidate=86400",
        },
    });
}
