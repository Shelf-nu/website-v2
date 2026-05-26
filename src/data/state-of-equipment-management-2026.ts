/**
 * Typed data structure for the State of Equipment Management 2026 report.
 *
 * Pivoted from a 30-stat "comprehensive" scaffold to 8 prioritized stats
 * organized around a single viral headline: the median workspace's
 * dollar value of ghost assets (items on the books but missing in audits).
 *
 * This file is the single source of truth for every statistic and quote
 * referenced in `content/reports/state-of-equipment-management-2026.mdx`.
 *
 * Workflow:
 * 1. Data team runs the extraction script in `shelf-nu/shelf.nu`:
 *      pnpm webapp:report:state-of-em-2026
 *    The script outputs JSON to
 *    `apps/webapp/scripts/state-of-em-2026/output/aggregates.json`.
 * 2. Copy the relevant values into this file, replacing the {{TODO}} sentinels.
 *    Round to one significant figure (the script already does this; just
 *    transcribe).
 * 3. Verify the `sampleSize` block matches the script output.
 * 4. Open the report MDX and double-check every <StatBlock /> reference
 *    resolves against a key in `headlineStats`.
 * 5. Survey results land via the external survey tool (see
 *    `content/reports/research-inputs/survey-design.md`). Paste the
 *    median "hours lost per month" value into the corresponding key.
 * 6. External benchmark vetted by marketing (see
 *    `content/reports/research-inputs/external-benchmarks.md`).
 * 7. Generate the public CSV companion file and place it at
 *    `public/reports/state-of-equipment-management-2026.csv`.
 *
 * Sentinels:
 * - `"{{TODO}}"` — plug a value here.
 * - `null` value with `confidence: "low"` — reportable but flag in copy.
 *
 * Year-over-year:
 * - `priorYearValue?: string` on ReportStat is set in the 2027 edition
 *   from the 2026 published numbers. 2026 leaves this undefined.
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
     * edition pulls the 2026 published values into this field to render
     * year-over-year trend lines.
     */
    priorYearValue?: string;
    /** Optional unit suffix when value is a bare number. */
    unit?: string;
    /** Human-readable label. */
    label: string;
    /** Optional sub-label or footnote. */
    context?: string;
    /** Where the number came from. Drives the methodology footnote per stat. */
    source: StatSource;
    /** Editorial confidence in the figure. */
    confidence: StatConfidence;
    /** Free-form note for the data team. Not rendered. */
    note?: string;
}

export interface MiniCaseStudy {
    /** Stable key referenced from MDX. */
    key: string;
    /** Customer name. Published only with explicit permission. */
    customer: string;
    /** Industry context for the case study, e.g. "University media program". */
    context: string;
    /** The finding this case study illustrates (matches a headlineStats key). */
    illustrates: string;
    /** Short narrative — ~100 words. */
    narrative: string;
    /** The single quantified outcome the case study supports. */
    outcome: string;
    /** Permission to publish has been confirmed. */
    approved: boolean;
}

export interface ExternalBenchmark {
    /** Stable key. */
    key: string;
    /** The published number being compared against, including unit. */
    value: string;
    /** Label for the comparison. */
    label: string;
    /** Source organization. */
    source: string;
    /** Year the external number was published. */
    sourceYear: number;
    /** URL to the source. */
    sourceUrl: string;
    /** How this compares to Shelf's number — favourable, unfavourable, neutral. */
    direction: "shelf_better" | "shelf_worse" | "neutral";
    /** Marketing has vetted the source for citation appropriateness. */
    vetted: boolean;
}

/* ------------------------------------------------------------------ */
/*  Metadata                                                           */
/* ------------------------------------------------------------------ */

export const reportMetadata = {
    title: "The State of Equipment Management 2026",
    publishedAt: "2026-09-15", // TODO: confirm with marketing
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
} as const;

/* ------------------------------------------------------------------ */
/*  Headline stats — 8 only, organized around the dollar headline      */
/* ------------------------------------------------------------------ */

export const headlineStats: ReportStat[] = [
    // ===========================
    // THE VIRAL STAT — lead the report with this number.
    // Mechanic: estimated ghost-asset count per workspace * median Asset.valuation
    // for the workspace. Use the median workspace, not the mean.
    // ===========================
    {
        key: "ds_ghost_asset_dollar_value_median_workspace",
        value: "{{TODO: $X,XXX}}",
        label: "Median workspace has this much equipment on the books but missing from audits",
        source: "telemetry_dollars",
        confidence: "high",
        note: "THE HEADLINE. Ghost assets = items Missing across consecutive audits with no scan in between. Dollar value = ghost count * median valuation. Disclose Asset.valuation coverage in methodology.",
    },

    // ----- Supporting stat 1: the rate itself (feeds the headline) -----
    {
        key: "ds_ghost_asset_rate",
        value: "{{TODO}}",
        unit: "%",
        label: "Of audited assets are ghost assets across the platform",
        source: "telemetry",
        confidence: "high",
    },

    // ----- Supporting stat 2: the upstream behavioral cause (custody gap) -----
    {
        key: "pct_assets_with_active_custody",
        value: "{{TODO}}",
        unit: "%",
        label: "Of assets have an active custodian assigned",
        source: "telemetry",
        confidence: "high",
        note: "The accountability gap. Below this, every other failure mode compounds.",
    },

    // ----- Supporting stat 3: the audit behavior that surfaces the problem -----
    {
        key: "au_pct_workspaces_running_audits",
        value: "{{TODO}}",
        unit: "%",
        label: "Of Team-tier workspaces with the Audits add-on ran at least one audit in the year",
        source: "telemetry",
        confidence: "high",
        note: "Ghost assets are unmeasured without audits. This is why most ghost stats are estimates.",
    },

    // ----- Supporting stat 4: the audit-surface direct evidence -----
    {
        key: "au_pct_audited_assets_missing",
        value: "{{TODO}}",
        unit: "%",
        label: "Of expected assets came up Missing on the first audit scan",
        source: "telemetry",
        confidence: "high",
    },

    // ----- Supporting stat 5: the hidden idle-asset cost (also $-denominated) -----
    {
        key: "ds_idle_asset_dollar_value_median_workspace",
        value: "{{TODO: $X,XXX}}",
        label: "Median workspace has this much equipment idle (no activity in 90 days)",
        source: "telemetry_dollars",
        confidence: "high",
        note: "Idle = no scan, custody change, booking, or location update in prior 90 days.",
    },

    // ----- Supporting stat 6: the positive Shelf-product story (also $-denominated) -----
    {
        key: "ds_recovery_dollar_value_total",
        value: "{{TODO: $X,XXX,XXX}}",
        label: "Of equipment was recovered via Found-via-Scan across the platform in the year",
        source: "telemetry_dollars",
        confidence: "medium",
        note: "Anonymous-scan recovery events. Sum across all workspaces. The Wikipedia-citable Shelf-product number.",
    },

    // ----- Supporting stat 7: THE "WHY" — survey data, not telemetry -----
    {
        key: "survey_hours_lost_per_month_median",
        value: "{{TODO}}",
        unit: " hours/month",
        label: "Median hours per month admins say their team loses to missing or misplaced equipment",
        source: "survey",
        confidence: "medium",
        note: "From the n=200 admin survey. See content/reports/research-inputs/survey-design.md for the question wording.",
    },
];

/* ------------------------------------------------------------------ */
/*  Mini case studies — 3, each tied to a headline stat                */
/* ------------------------------------------------------------------ */

export const miniCaseStudies: MiniCaseStudy[] = [
    {
        key: "case_ghost_assets",
        customer: "{{TODO}}",
        context: "{{TODO: e.g. 'IT department, 3,000-employee organization'}}",
        illustrates: "ds_ghost_asset_dollar_value_median_workspace",
        narrative:
            "{{TODO: ~100 words. The customer's audit before they fixed the problem: X items missing, $Y in inflated inventory. Specific. Named. Permission-confirmed.}}",
        outcome: "{{TODO: e.g. 'Reduced ghost-asset rate from 12% to under 2% in 9 months'}}",
        approved: false,
    },
    {
        key: "case_audit_cadence",
        customer: "{{TODO}}",
        context: "{{TODO: e.g. 'University AV department, 850 assets'}}",
        illustrates: "au_pct_workspaces_running_audits",
        narrative:
            "{{TODO: ~100 words. The customer that moved from annual audits to quarterly and what changed.}}",
        outcome: "{{TODO: e.g. 'Missing rate fell from 8% to 1.5% over 4 quarterly audits'}}",
        approved: false,
    },
    {
        key: "case_recovery",
        customer: "{{TODO}}",
        context: "{{TODO: e.g. 'Construction firm, 50 field crews'}}",
        illustrates: "ds_recovery_dollar_value_total",
        narrative:
            "{{TODO: ~100 words. The recovery story. A specific item, a specific value, the Found-via-Scan event. Concrete.}}",
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
    label: "Industry-wide equipment loss rate (any independent source)",
    source: "{{TODO: vetted source name}}",
    sourceYear: 0,
    sourceUrl: "{{TODO: stable URL}}",
    direction: "neutral",
    vetted: false,
};
