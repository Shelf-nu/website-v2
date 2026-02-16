export interface Frontmatter {
    title: string;
    slug: string;
    description: string;

    layout: string; // solution | feature | industry | alternative | blog | case-study | glossary | use-case | concept

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
}
