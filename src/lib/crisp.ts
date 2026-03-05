/**
 * Crisp live chat SDK wrappers.
 *
 * All calls use the $crisp.push() pattern which is inherently async-safe:
 * commands queue up and replay once the Crisp SDK loads.
 */

import { getLandingPage, getPagesViewed, getUtmParams } from "@/lib/analytics";

/* ------------------------------------------------------------------ */
/* Global type declarations                                           */
/* ------------------------------------------------------------------ */

declare global {
    interface Window {
        $crisp: unknown[];
        CRISP_WEBSITE_ID: string;
    }
}

/* ------------------------------------------------------------------ */
/* Low-level helper                                                   */
/* ------------------------------------------------------------------ */

function crisp(...args: unknown[]): void {
    if (typeof window === "undefined") return;
    if (!window.$crisp) return;
    window.$crisp.push(args);
}

/* ------------------------------------------------------------------ */
/* Theme                                                              */
/* ------------------------------------------------------------------ */

/** Set Crisp widget color to Shelf brand orange + sync light/dark mode. */
export function configureCrispTheme(isDark: boolean): void {
    crisp("config", "color:theme", ["orange"]);
    crisp("config", "color:mode", [isDark ? "dark" : "light"]);
}

/* ------------------------------------------------------------------ */
/* Session data                                                       */
/* ------------------------------------------------------------------ */

/** Push current page, landing page, journey, referrer, UTMs to Crisp. */
export function updateCrispSessionData(pathname: string): void {
    const utm = getUtmParams();
    const pagesViewed = getPagesViewed();

    const data: [string, string][] = [
        ["current_page", pathname],
        ["landing_page", getLandingPage() || pathname],
        ["pages_viewed", pagesViewed.join(" > ") || pathname],
        ["page_count", String(pagesViewed.length || 1)],
        ["referrer", (typeof document !== "undefined" && document.referrer) || "(direct)"],
    ];

    // Append UTM params if present
    for (const [key, value] of Object.entries(utm)) {
        if (value) data.push([key, value]);
    }

    crisp("set", "session:data", [data]);
}

/* ------------------------------------------------------------------ */
/* Segmentation                                                       */
/* ------------------------------------------------------------------ */

/** Auto-tag visitors by intent level based on pages they've viewed. */
export function updateCrispSegments(pathname: string): void {
    const segments: string[] = [];
    const pagesViewed = getPagesViewed();

    // Intent-based
    if (pathname === "/pricing" || pagesViewed.includes("/pricing")) {
        segments.push("pricing-visitor");
    }
    if (pathname === "/demo" || pagesViewed.includes("/demo")) {
        segments.push("demo-interested");
    }

    // Content-based
    if (pathname.startsWith("/blog") || pathname.startsWith("/knowledge-base")) {
        segments.push("blog-reader");
    }
    if (pathname.startsWith("/case-studies")) {
        segments.push("case-study-reader");
    }
    if (pathname.startsWith("/solutions") || pathname.startsWith("/industries")) {
        segments.push("solutions-explorer");
    }
    if (pathname.startsWith("/features") || pathname.startsWith("/product")) {
        segments.push("feature-explorer");
    }
    if (pathname.startsWith("/alternatives") || pathname.startsWith("/migrate")) {
        segments.push("competitor-researcher");
    }

    // Engagement-based
    if (pagesViewed.length >= 5) {
        segments.push("high-engagement");
    }
    if (pagesViewed.length >= 3 && pagesViewed.includes("/pricing")) {
        segments.push("sales-qualified");
    }

    if (segments.length > 0) {
        crisp("set", "session:segments", [segments]);
    }
}

/* ------------------------------------------------------------------ */
/* Lead enrichment (called after demo form submission)                */
/* ------------------------------------------------------------------ */

export interface CrispLeadData {
    email: string;
    firstName: string;
    lastName: string;
    company: string;
    teamSize: string;
    equipment: string;
    needs: string[];
    heardAbout: string;
}

/** Push lead identity + context to Crisp after demo form success. */
export function enrichCrispWithLead(lead: CrispLeadData): void {
    // Identify the visitor
    crisp("set", "user:email", [lead.email]);
    crisp("set", "user:nickname", [`${lead.firstName} ${lead.lastName}`]);
    crisp("set", "user:company", [lead.company]);

    // Detailed lead context as session data
    const data: [string, string][] = [
        ["team_size", lead.teamSize],
        ["equipment_type", lead.equipment],
        ["needs", lead.needs.join(", ")],
        ["heard_about", lead.heardAbout],
        ["demo_submitted", "true"],
    ];
    crisp("set", "session:data", [data]);

    // Timeline event visible to agents
    crisp("set", "session:event", [[
        ["demo_form_submitted", { team_size: lead.teamSize, company: lead.company }, "orange"],
    ]]);

    // High-intent segments
    crisp("set", "session:segments", [["demo-submitted", "high-intent"]]);
}
