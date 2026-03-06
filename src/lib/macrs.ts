import {
    GDS_RATES,
    getAdsRates,
    type PropertyClass,
} from "@/data/macrs-tables";

export interface MacrsRow {
    year: number;
    rate: number; // percentage
    depreciation: number;
    accumulated: number;
    bookValue: number;
    taxSavings: number | null;
}

export type DepSystem = "gds" | "ads";

export function calculateMacrs(
    cost: number,
    propertyClass: PropertyClass,
    system: DepSystem,
    taxRate?: number
): MacrsRow[] {
    const rates =
        system === "gds" ? GDS_RATES[propertyClass] : getAdsRates(propertyClass);
    const rows: MacrsRow[] = [];
    let accumulated = 0;

    for (let i = 0; i < rates.length; i++) {
        const rate = rates[i];
        const depreciation = Math.round((cost * rate) / 100 * 100) / 100;
        accumulated += depreciation;
        const taxSavings =
            taxRate != null && taxRate > 0
                ? Math.round(depreciation * (taxRate / 100) * 100) / 100
                : null;

        rows.push({
            year: i + 1,
            rate,
            depreciation,
            accumulated: Math.round(accumulated * 100) / 100,
            bookValue: Math.round((cost - accumulated) * 100) / 100,
            taxSavings,
        });
    }

    return rows;
}
