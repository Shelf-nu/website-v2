/**
 * Typed data structure for the State of Equipment Management 2026 report.
 *
 * v1.2 pivot: switched the headline from ghost-assets-in-dollars to
 * IDLE-assets-in-dollars. Reason: ghost-asset stats depend on the Audits
 * add-on (a paid feature with bounded adoption). The idle-asset stat is
 * computed from ActivityEvent — universal telemetry that fires for every
 * Shelf customer. The headline now survives even if audit adoption is low.
 *
 * Ghost-asset stats remain in the report but are demoted to a properly-
 * qualified "audit-enabled subset" section. The narrative is honest:
 * "For the X% of Team workspaces with Audits enabled...".
 *
 * THE EIGHT STATS:
 *   1. ds_idle_asset_dollar_value_median_workspace  (THE HEADLINE, universal)
 *   2. ds_idle_asset_rate                            (universal)
 *   3. pct_assets_with_active_custody                (universal)
 *   4. bk_pct_returned_late                          (booking-using subset)
 *   5. ds_recovery_dollar_value_total                (universal IF anonymous-Scan-flag exists)
 *   6. ds_ghost_asset_rate                            (AUDIT-ENABLED SUBSET — qualified)
 *   7. au_pct_audited_assets_missing                  (AUDIT-ENABLED SUBSET — qualified)
 *   8. survey_hours_lost_per_month_median             (survey)
 *
 * @see content/reports/research-inputs/survey-design.md — survey questionnaire
 * @see content/reports/research-inputs/external-benchmarks.md — benchmark sources
 */

export type StatSource = "telemetry" | "telemetry_dollars" | "survey" | "benchmark";
export type StatConfidence = "high" | "medium" | "low";

export interface ReportStat {
    /** Stable key referenced from MDX. */
    key: string;
    /** Display value as a string. */
    value: string;
    /**
     * Same stat from the prior year. Undefined in 2026 (no baseline). 2027
     * edition pulls the 2026 published values into this field per stat.
     */
    priorYearValue?: string;
    /** Optional unit suffix. */
    unit?: string;
    /** Human-readable label. */
    label: string;
    /**
     * Optional qualification — e.g. "Audit-enabled subset only (X% of cohort)".
     * When set, the MDX prepends this to any prose that uses the stat. Stats
     * that need qualification but lack it will be flagged in editorial review.
     */
    qualification?: string;
    /** Optional sub-label or footnote. */
    context?: string;
    /** Where the number came from. */
    source: StatSource;
    /** Editorial confidence in the figure. */
    confidence: StatConfidence;
    /** Free-form note for the data team. Not rendered. */
    note?: string;
}

export interface MiniCaseStudy {
    key: string;
    customer: string;
    context: string;
    /** Which headline stat key this case study illustrates. */
    illustrates: string;
    /** ~100 words narrative. */
    narrative: string;
    /** Single quantified outcome. */
    outcome: string;
    /** Permission confirmed. */
    approved: boolean;
}

export interface ExternalBenchmark {
    key: string;
    value: string;
    label: string;
    source: string;
    sourceYear: number;
    sourceUrl: string;
    direction: "shelf_better" | "shelf_worse" | "neutral";
    vetted: boolean;
}

/* ------------------------------------------------------------------ */
/*  Metadata                                                           */
/* ------------------------------------------------------------------ */

export const reportMetadata = {
    title: "The State of Equipment Management 2026",
    publishedAt: "2026-09-15",
    dataWindowStart: "2025-05-01",
    dataWindowEnd: "2026-04-30",
    sampleSize: {
        workspaces: 0,
        assets: 0,
        countries: 0,
        surveyResponses: 0,
        notes: "PLACEHOLDER — populate from script output + survey tool before publication.",
    },
    methodologyVersion: "1.0",
    datasetKey: "soem-2026-v1",
    /** Adoption thresholds. If a feature is below this, dependent stats are dropped or heavily qualified. */
    adoptionThresholds: {
        /** Audits add-on adoption among eligible Team workspaces. Below this, audit-derived stats are scrapped. */
        auditsEnabledMin: 0.05, // 5%
        /** Workspaces that actually ran an audit in window. Below this, ghost-asset and missing-rate stats are scrapped. */
        auditsRunMin: 0.03, // 3%
        /** Workspaces with bookings activity. Below this, late-return stat is scrapped. */
        bookingsActiveMin: 0.10, // 10%
        /** Asset.valuation coverage across the cohort. Below this, dollar headlines convert to percentages. */
        valuationCoverageMin: 0.30, // 30%
    },
} as const;

/* ------------------------------------------------------------------ */
/*  Eight prioritized stats — idle headline + 5 supporting + 2 subset  */
/* ------------------------------------------------------------------ */

export const headlineStats: ReportStat[] = [
    // ===========================
    // THE VIRAL STAT (universal telemetry, no audit dependency).
    // ===========================
    {
        key: "ds_idle_asset_dollar_value_median_workspace",
        value: "{{TODO: $X,XXX}}",
        label: "Median organization has this much equipment sitting unused for 90+ days at a time",
        source: "telemetry_dollars",
        confidence: "high",
        note: "THE HEADLINE. Idle = no ActivityEvent in prior 90 days. Universal telemetry; no paid-feature dependency. Dollar value = sum Asset.valuation over idle assets per workspace, then MEDIAN across workspaces (right-skewed distribution).",
    },

    // ----- Supporting stat 1: the rate companion (universal) -----
    {
        key: "ds_idle_asset_rate",
        value: "{{TODO}}",
        unit: "%",
        label: "Of tracked assets had no activity in the prior 90 days at end of window",
        source: "telemetry",
        confidence: "high",
        note: "Universal stat — ActivityEvent fires for every Shelf customer. The percentage version of the dollar headline.",
    },

    // ----- Supporting stat 2: the upstream accountability gap (universal) -----
    {
        key: "pct_assets_with_active_custody",
        value: "{{TODO}}",
        unit: "%",
        label: "Of assets have an active custodian assigned",
        source: "telemetry",
        confidence: "high",
        note: "Universal. The accountability surface. Low custody coverage upstream is what produces idle and ghost assets downstream.",
    },

    // ----- Supporting stat 3: the booking-specific pain point (Team subset) -----
    {
        key: "bk_pct_returned_late",
        value: "{{TODO}}",
        unit: "%",
        label: "Of bookings ended after the scheduled return time",
        qualification: "Among workspaces that used the bookings feature during the window.",
        source: "telemetry",
        confidence: "high",
        note: "Compute from Booking model: status COMPLETE or OVERDUE with actualReturnAt > to, OR status still ONGOING/OVERDUE past to. The probe script verifies cohort size for this subset.",
    },

    // ----- Supporting stat 4: the positive Shelf-product story (universal IF scan flag exists) -----
    {
        key: "ds_recovery_dollar_value_total",
        value: "{{TODO: $X,XXX,XXX}}",
        label: "Of equipment was recovered via Found-via-Scan across the platform in the year",
        source: "telemetry_dollars",
        confidence: "medium",
        note: "DEPENDENCY: requires the anonymous-source flag on the Scan model. Probe script verifies. If flag does not exist, this stat is dropped from v1.",
    },

    // ===========================
    // AUDIT-ENABLED SUBSET STATS — published only with explicit qualification.
    // These remain useful but are NOT presented as "median workspace" claims.
    // ===========================
    {
        key: "ds_ghost_asset_rate",
        value: "{{TODO}}",
        unit: "%",
        label: "Of audited assets are ghost assets (missing across consecutive audits)",
        qualification: "Audit-enabled subset only. Computed across workspaces that ran at least one completed audit in the window.",
        source: "telemetry",
        confidence: "high",
        note: "Demoted from headline in v1.2 due to audit-adoption risk. Still publishable as a supporting subset finding with proper qualification.",
    },

    {
        key: "au_pct_audited_assets_missing",
        value: "{{TODO}}",
        unit: "%",
        label: "Of expected assets came up Missing on first audit scan",
        qualification: "Audit-enabled subset only.",
        source: "telemetry",
        confidence: "high",
    },

    // ===========================
    // SURVEY STAT (independent of telemetry; plugged in manually).
    // ===========================
    {
        key: "survey_hours_lost_per_month_median",
        value: "{{TODO}}",
        unit: " hours/month",
        label: "Median hours per month admins say their team loses to missing or misplaced equipment",
        source: "survey",
        confidence: "medium",
        note: "From the n=200 (target) admin survey. See content/reports/research-inputs/survey-design.md.",
    },
];

/* ------------------------------------------------------------------ */
/*  Mini case studies — 3, each tied to a headline stat                */
/* ------------------------------------------------------------------ */

export const miniCaseStudies: MiniCaseStudy[] = [
    {
        key: "case_idle_assets",
        customer: "{{TODO}}",
        context: "{{TODO: e.g. 'IT department, 500-person organization'}}",
        illustrates: "ds_idle_asset_dollar_value_median_workspace",
        narrative:
            "{{TODO: ~100 words. The customer's pre-Shelf state, where they discovered their idle assets, what they did about it. Specific. Named.}}",
        outcome: "{{TODO: e.g. 'Reduced idle laptop count by 40% in 6 months by redistributing to new hires'}}",
        approved: false,
    },
    {
        key: "case_late_returns",
        customer: "{{TODO}}",
        context: "{{TODO: e.g. 'University AV department, 850 assets, 200 students booking weekly'}}",
        illustrates: "bk_pct_returned_late",
        narrative:
            "{{TODO: ~100 words. The customer who tackled late returns. Booking notifications, overdue alerts, what changed.}}",
        outcome: "{{TODO: e.g. 'Late-return rate fell from 35% to 8% over one semester'}}",
        approved: false,
    },
    {
        key: "case_recovery",
        customer: "{{TODO}}",
        context: "{{TODO: e.g. 'Construction firm, 50 field crews'}}",
        illustrates: "ds_recovery_dollar_value_total",
        narrative:
            "{{TODO: ~100 words. The recovery story. A specific item, a specific value, the Found-via-Scan event.}}",
        outcome: "{{TODO: e.g. '$70,000 in drone equipment recovered via QR scan by a stranger at a job site'}}",
        approved: false,
    },
];

/* ------------------------------------------------------------------ */
/*  External benchmark — 1, vetted before publication                  */
/* ------------------------------------------------------------------ */

export const externalBenchmark: ExternalBenchmark = {
    key: "benchmark_industry_loss_rate",
    value: "{{TODO}}",
    label: "Industry-wide equipment idle / utilization rate from an independent source",
    source: "{{TODO: vetted source name}}",
    sourceYear: 0,
    sourceUrl: "{{TODO: stable URL}}",
    direction: "neutral",
    vetted: false,
};
