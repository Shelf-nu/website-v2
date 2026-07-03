export interface Frontmatter {
    title: string;
    slug: string;
    description: string;

    layout: string; // solution | feature | industry | alternative | blog | case-study | glossary | use-case | concept | report

    canonicalUrl: string;

    seo: {
        title: string;
        description: string;
        keywords?: string[];
        noindex?: boolean;
    };

    personas?: string[];

    stage: "TOFU" | "MOFU" | "BOFU";
    intent: "informational" | "commercial" | "transactional";

    cluster: {
        name: string;
        role: "pillar" | "supporting";
    };

    related?: {
        solutions?: string[];
        features?: string[];
        case_studies?: string[];
        glossary?: string[];
    };

    schemaType?: string;

    // Solutions
    heroTagline?: string;
    problemStatements?: string[];
    keyFeatures?: string[];
    ctaText?: string;

    // Industries
    industry?: string | string[];
    useCases?: string[];
    audience?: string[];

    // Alternatives
    competitor?: string;
    competitorFeatures?: string[];
    comparisonTable?: Record<string, unknown>[];
    /** Suppress the layout-injected "Quick comparison" table — use when the MDX body has its own comparison content. */
    hideLayoutTable?: boolean;
    whyShelf?: string[];

    // Glossary
    definition?: string;
    longDefinition?: string;
    examples?: string[];

    // Blog
    date?: string;
    tags?: string[];
    readingTime?: string;
    image?: string;
    category?: string;
    author?: string;
    authorRole?: string;

    // Updates (product changelog)
    readMoreUrl?: string;

    // Case studies
    customer?: string | {
        name: string;
        industry?: string;
        size?: string;
        founded?: string;
        headquarters?: string;
        website?: string;
        logo?: string;
        quote?: string;
    };
    logo?: string;
    coverImage?: string;
    organization?: string;
    industryPage?: string;
    summary?: string;
    challenge?: string;
    solution?: string;
    results?: string[];
    quotes?: (string | { quote: string; author: string; role: string })[];
    location?: string;
    team_size?: string;
    featured_metrics?: { label: string; value: string }[];
    nextStudy?: {
        title: string;
        slug: string;
        organization?: string;
        description?: string;
        image?: string;
    };

    // Reports (annual industry reports, e.g. State of Equipment Management 2026)
    /** Year the report covers, e.g. 2026. Useful for sorting and year-on-year diffs. */
    reportYear?: number;
    /** ISO 8601 start of the data observation window, e.g. "2025-05-01". */
    dataWindowStart?: string;
    /** ISO 8601 end of the data observation window, e.g. "2026-04-30". */
    dataWindowEnd?: string;
    /** Approximate sample size used in the report. */
    sampleSize?: {
        workspaces?: number;
        assets?: number;
        countries?: number;
        notes?: string;
    };
    /** Pointer to a downloadable PDF, e.g. "/reports/state-of-equipment-management-2026.pdf". */
    pdfUrl?: string;
    /** Pointer to a downloadable CSV of the underlying aggregates. */
    csvUrl?: string;
    /** Pointer to the methodology document for this report. */
    methodologyUrl?: string;
    /** Methodology version string for tracking changes across yearly editions. */
    methodologyVersion?: string;
    /** Stable key for the underlying dataset (used in Dataset JSON-LD). */
    datasetKey?: string;
    /** Whether this report is the headline / featured report on /reports. */
    featured?: boolean;
}
