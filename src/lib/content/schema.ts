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
    industry?: string;
    useCases?: string[];
    audience?: string[];

    // Alternatives
    competitor?: string;
    competitorFeatures?: string[];
    comparisonTable?: any[];
    whyShelf?: string[];

    // Glossary
    definition?: string;
    longDefinition?: string;
    examples?: string[];

    // Blog
    date?: string;
    tags?: string[];
    readingTime?: string;

    // Case studies
    organization?: string;
    industryPage?: string;
    summary?: string;
    challenge?: string;
    solution?: string;
    results?: string[];
    quotes?: (string | { quote: string; author: string; role: string })[];
}
