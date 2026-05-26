/**
 * Typed data structure for the State of Equipment Management 2026 report.
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
 *    Round to one significant figure unless precision is genuinely informative;
 *    a stat like "32.7%" sounds spuriously precise.
 * 3. Verify the `sampleSize` block matches the script output.
 * 4. Open the report MDX and double-check every <StatBlock /> reference
 *    resolves against a key in `headlineStats` or one of the section stats.
 * 5. Generate the public CSV companion file (use the same script's CSV mode)
 *    and place it at `public/reports/state-of-equipment-management-2026.csv`.
 *
 * Sentinels:
 * - `"{{TODO}}"` — plug a number here.
 * - `null` value with `confidence: "low"` — stat was attempted but not
 *   reportable (sample too small, definition unclear, etc.). Leave the
 *   row in place so the MDX can show “— not reported” copy.
 */

export type StatSource = "telemetry" | "survey" | "benchmark";
export type StatConfidence = "high" | "medium" | "low";

export interface ReportStat {
    /** Stable key referenced from MDX. */
    key: string;
    /** Display value as a string (so we can include units, ranges, or “—”). */
    value: string;
    /** Optional unit suffix when value is a bare number. */
    unit?: string;
    /** Human-readable label, e.g. “Median assets per workspace”. */
    label: string;
    /** Optional sub-label or footnote. */
    context?: string;
    /** Where the number came from. Drives the methodology footnote per stat. */
    source: StatSource;
    /** Editorial confidence in the figure. Low-confidence stats should be flagged in copy. */
    confidence: StatConfidence;
    /** Free-form note for the data team. Not rendered to the public page. */
    note?: string;
}

export interface ReportSection {
    id: string;
    label: string;
    stats: ReportStat[];
}

/* ------------------------------------------------------------------ */
/*  Metadata                                                           */
/* ------------------------------------------------------------------ */

export const reportMetadata = {
    title: "The State of Equipment Management 2026",
    publishedAt: "2026-09-15", // TODO: confirm publication date with marketing
    dataWindowStart: "2025-05-01",
    dataWindowEnd: "2026-04-30",
    sampleSize: {
        // TODO: replace with extraction-script output. Use one significant figure
        // for the public number (e.g. 3000, not 3,047).
        workspaces: 0,
        assets: 0,
        countries: 0,
        notes: "PLACEHOLDER — populate from `pnpm webapp:report:state-of-em-2026` output before publication.",
    },
    methodologyVersion: "1.0",
    datasetKey: "soem-2026-v1",
} as const;

/* ------------------------------------------------------------------ */
/*  Headline stats — these render in the executive summary             */
/* ------------------------------------------------------------------ */

export const headlineStats: ReportStat[] = [
    {
        key: "median_assets_per_workspace",
        value: "{{TODO}}",
        label: "Median assets per workspace",
        source: "telemetry",
        confidence: "high",
    },
    {
        key: "median_users_per_workspace",
        value: "{{TODO}}",
        label: "Median users per workspace",
        source: "telemetry",
        confidence: "high",
    },
    {
        key: "pct_assets_with_active_custody",
        value: "{{TODO}}",
        unit: "%",
        label: "Of assets have an active custodian assigned",
        source: "telemetry",
        confidence: "high",
    },
    {
        key: "avg_bookings_per_workspace_per_month",
        value: "{{TODO}}",
        label: "Average bookings per workspace per month",
        source: "telemetry",
        confidence: "high",
        note: "Restrict to Team-tier workspaces with bookings feature enabled.",
    },
    {
        key: "pct_bookings_with_conflict_averted",
        value: "{{TODO}}",
        unit: "%",
        label: "Of attempted bookings were blocked by Shelf for conflict",
        source: "telemetry",
        confidence: "medium",
        note: "Requires capturing failed-create attempts — see methodology note.",
    },
    {
        key: "median_audit_completion_days",
        value: "{{TODO}}",
        unit: " days",
        label: "Median audit duration, start to complete",
        source: "telemetry",
        confidence: "high",
    },
];

/* ------------------------------------------------------------------ */
/*  Section stats — keyed by section anchor                            */
/* ------------------------------------------------------------------ */

export const sectionStats: Record<string, ReportSection> = {
    visibility: {
        id: "visibility",
        label: "The visibility gap",
        stats: [
            { key: "vis_assets_with_location", value: "{{TODO}}", unit: "%", label: "Of assets have a current location assigned", source: "telemetry", confidence: "high" },
            { key: "vis_assets_with_category", value: "{{TODO}}", unit: "%", label: "Of assets are categorized", source: "telemetry", confidence: "high" },
            { key: "vis_assets_with_custom_fields", value: "{{TODO}}", unit: "%", label: "Of assets have one or more custom fields populated", source: "telemetry", confidence: "high" },
            { key: "vis_median_fields_per_workspace", value: "{{TODO}}", label: "Median custom fields configured per workspace", source: "telemetry", confidence: "high" },
            { key: "vis_top_categories", value: "{{TODO: top 5 with %}}", label: "Top asset categories across the platform", source: "telemetry", confidence: "high" },
        ],
    },
    bookings: {
        id: "bookings",
        label: "The booking problem",
        stats: [
            { key: "bk_median_bookings_per_workspace_per_year", value: "{{TODO}}", label: "Median bookings per workspace per year", source: "telemetry", confidence: "high" },
            { key: "bk_median_lead_time_days", value: "{{TODO}}", unit: " days", label: "Median booking lead time", source: "telemetry", confidence: "high" },
            { key: "bk_pct_overdue", value: "{{TODO}}", unit: "%", label: "Of bookings ended after the scheduled return time", source: "telemetry", confidence: "high" },
            { key: "bk_median_overdue_hours", value: "{{TODO}}", unit: " hours", label: "Median lateness on overdue bookings", source: "telemetry", confidence: "medium" },
            { key: "bk_peak_day", value: "{{TODO: e.g. Tuesday}}", label: "Most-booked weekday", source: "telemetry", confidence: "high" },
        ],
    },
    custody: {
        id: "custody",
        label: "Custody and accountability",
        stats: [
            { key: "cu_median_handovers_per_asset_per_year", value: "{{TODO}}", label: "Median custody handovers per asset per year (active assets only)", source: "telemetry", confidence: "high" },
            { key: "cu_pct_assets_with_history", value: "{{TODO}}", unit: "%", label: "Of assets have one or more custody events in the last year", source: "telemetry", confidence: "high" },
            { key: "cu_top_handover_categories", value: "{{TODO: top 3}}", label: "Asset categories with the highest handover rate", source: "telemetry", confidence: "high" },
        ],
    },
    audits: {
        id: "audits",
        label: "The audit reality",
        stats: [
            { key: "au_pct_workspaces_running_audits", value: "{{TODO}}", unit: "%", label: "Of Team-tier workspaces ran at least one audit in the year", source: "telemetry", confidence: "high", note: "Restrict to workspaces with the Audits add-on enabled." },
            { key: "au_pct_audited_assets_found", value: "{{TODO}}", unit: "%", label: "Of expected assets came up Found", source: "telemetry", confidence: "high" },
            { key: "au_pct_audited_assets_missing", value: "{{TODO}}", unit: "%", label: "Of expected assets came up Missing", source: "telemetry", confidence: "high" },
            { key: "au_pct_audited_assets_unexpected", value: "{{TODO}}", unit: "%", label: "Of scanned assets were Unexpected (not on the expected list)", source: "telemetry", confidence: "high" },
            { key: "au_median_completion_days", value: "{{TODO}}", unit: " days", label: "Median audit duration, start to complete", source: "telemetry", confidence: "high" },
        ],
    },
    disorder: {
        id: "disorder",
        label: "The cost of disorder",
        stats: [
            { key: "ds_ghost_asset_rate", value: "{{TODO}}", unit: "%", label: "Of expected audit assets are estimated ghost assets (missing across consecutive audits)", source: "telemetry", confidence: "medium", note: "Definition: an asset marked Missing in two or more consecutive audits AND no scan in the same window." },
            { key: "ds_idle_asset_rate", value: "{{TODO}}", unit: "%", label: "Of assets had no activity in the prior 90 days", source: "telemetry", confidence: "high" },
            { key: "ds_recovery_rate_found_via_scan", value: "{{TODO}}", unit: "%", label: "Of Missing assets were recovered via Found-via-Scan within 30 days", source: "telemetry", confidence: "medium" },
            { key: "ds_median_recovery_days", value: "{{TODO}}", unit: " days", label: "Median time to recover an asset marked Missing", source: "telemetry", confidence: "medium" },
        ],
    },
};

/* ------------------------------------------------------------------ */
/*  Industry cuts                                                      */
/* ------------------------------------------------------------------ */

export interface IndustryCut {
    industry: string;
    workspaceCount: number; // headline N for the cohort
    stats: ReportStat[];
}

export const industryCuts: IndustryCut[] = [
    {
        industry: "Education",
        workspaceCount: 0, // TODO
        stats: [
            { key: "ed_median_assets", value: "{{TODO}}", label: "Median assets per workspace", source: "telemetry", confidence: "high" },
            { key: "ed_median_users", value: "{{TODO}}", label: "Median active users per workspace", source: "telemetry", confidence: "high" },
            { key: "ed_seasonal_peak_month", value: "{{TODO}}", label: "Peak booking month (likely fall semester start)", source: "telemetry", confidence: "high" },
        ],
    },
    {
        industry: "IT & Technology",
        workspaceCount: 0,
        stats: [
            { key: "it_pct_laptops", value: "{{TODO}}", unit: "%", label: "Of tracked assets are laptops or computing devices", source: "telemetry", confidence: "high" },
            { key: "it_median_custody_duration_days", value: "{{TODO}}", unit: " days", label: "Median custody duration", source: "telemetry", confidence: "high" },
        ],
    },
    {
        industry: "Media & Production",
        workspaceCount: 0,
        stats: [
            { key: "mp_pct_kits", value: "{{TODO}}", unit: "%", label: "Of bookings include at least one kit", source: "telemetry", confidence: "high" },
            { key: "mp_pct_camera_lens_audio", value: "{{TODO}}", unit: "%", label: "Of assets are camera, lens, or audio equipment", source: "telemetry", confidence: "high" },
        ],
    },
    {
        industry: "Construction & Field Operations",
        workspaceCount: 0,
        stats: [
            { key: "co_pct_multi_location", value: "{{TODO}}", unit: "%", label: "Of workspaces operate across two or more locations", source: "telemetry", confidence: "high" },
            { key: "co_pct_tool_assets", value: "{{TODO}}", unit: "%", label: "Of assets are categorized as tools", source: "telemetry", confidence: "high" },
        ],
    },
];

/* ------------------------------------------------------------------ */
/*  Top-performer patterns                                             */
/* ------------------------------------------------------------------ */

export interface TopPerformerPattern {
    id: string;
    pattern: string;
    /** Quantified delta vs the median workspace, when known. */
    impact?: string;
    note?: string;
}

export const topPerformerPatterns: TopPerformerPattern[] = [
    {
        id: "early_custody_assignment",
        pattern: "Assign custody within 48 hours of asset creation",
        impact: "{{TODO: e.g. 'X% lower missing rate at year-end audit'}}",
    },
    {
        id: "quarterly_audit_cadence",
        pattern: "Run audits on at least a quarterly cadence",
        impact: "{{TODO: e.g. 'X% lower ghost-asset rate than annual-audit peers'}}",
    },
    {
        id: "qr_labels_at_intake",
        pattern: "Apply QR labels at intake, not retrospectively",
        impact: "{{TODO: e.g. 'Median custody coverage X percentage points higher'}}",
    },
    {
        id: "kit_grouping",
        pattern: "Group multi-component equipment into kits",
        impact: "{{TODO: e.g. 'X% lower missing-accessory rate at check-in'}}",
    },
];

/* ------------------------------------------------------------------ */
/*  Quotes — placeholder, real quotes need outreach approval           */
/* ------------------------------------------------------------------ */

export interface ReportQuote {
    /** Stable key referenced from MDX. */
    key: string;
    quote: string;
    author: string;
    role: string;
    organization?: string;
    /** Whether outreach has confirmed permission to publish. */
    approved: boolean;
}

export const quotes: ReportQuote[] = [
    {
        key: "placeholder_education",
        quote: "{{TODO: outreach to an education customer for a quote about ghost assets or audit results}}",
        author: "{{TODO}}",
        role: "{{TODO}}",
        organization: "{{TODO}}",
        approved: false,
    },
    {
        key: "placeholder_media",
        quote: "{{TODO: outreach to a film/AV customer for a quote about double-booking elimination}}",
        author: "{{TODO}}",
        role: "{{TODO}}",
        organization: "{{TODO}}",
        approved: false,
    },
    {
        key: "placeholder_construction",
        quote: "{{TODO: outreach to a field-ops customer for a quote about tool recovery or accountability}}",
        author: "{{TODO}}",
        role: "{{TODO}}",
        organization: "{{TODO}}",
        approved: false,
    },
];
