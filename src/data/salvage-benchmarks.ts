export interface SalvageBenchmark {
    label: string;
    annualRate: number; // annual depreciation rate as decimal (e.g., 0.20 = 20%)
    typicalLife: number; // typical useful life in years
}

export type AssetCategory =
    | "computers"
    | "vehicles"
    | "furniture"
    | "heavy-equipment"
    | "medical"
    | "lab"
    | "av-media"
    | "other";

export const CATEGORY_LABELS: Record<AssetCategory, string> = {
    computers: "Computers & Electronics",
    vehicles: "Vehicles",
    furniture: "Office Furniture",
    "heavy-equipment": "Heavy Equipment & Machinery",
    medical: "Medical Equipment",
    lab: "Lab & Scientific Instruments",
    "av-media": "AV & Media Equipment",
    other: "Other / General",
};

/**
 * Industry benchmark data for salvage value estimation.
 * Annual rates represent typical straight-line depreciation percentages.
 * Sources: general industry guides, IRS useful life tables.
 */
export const SALVAGE_BENCHMARKS: Record<AssetCategory, SalvageBenchmark> = {
    computers: {
        label: "Computers & Electronics",
        annualRate: 0.25,
        typicalLife: 4,
    },
    vehicles: {
        label: "Vehicles",
        annualRate: 0.15,
        typicalLife: 6,
    },
    furniture: {
        label: "Office Furniture",
        annualRate: 0.1,
        typicalLife: 10,
    },
    "heavy-equipment": {
        label: "Heavy Equipment & Machinery",
        annualRate: 0.07,
        typicalLife: 15,
    },
    medical: {
        label: "Medical Equipment",
        annualRate: 0.12,
        typicalLife: 8,
    },
    lab: {
        label: "Lab & Scientific Instruments",
        annualRate: 0.1,
        typicalLife: 10,
    },
    "av-media": {
        label: "AV & Media Equipment",
        annualRate: 0.2,
        typicalLife: 5,
    },
    other: {
        label: "Other / General",
        annualRate: 0.15,
        typicalLife: 7,
    },
};
