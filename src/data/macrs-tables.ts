/**
 * MACRS depreciation percentage tables from IRS Publication 946.
 * GDS = General Depreciation System (most common)
 * ADS = Alternative Depreciation System (required for certain property, e.g. listed property used ≤50% for business)
 * Half-year convention applied.
 */

export type PropertyClass = "3" | "5" | "7" | "10" | "15" | "20";

export const PROPERTY_CLASS_LABELS: Record<PropertyClass, string> = {
    "3": "3-Year Property",
    "5": "5-Year Property",
    "7": "7-Year Property",
    "10": "10-Year Property",
    "15": "15-Year Property",
    "20": "20-Year Property",
};

export const PROPERTY_CLASS_EXAMPLES: Record<PropertyClass, string> = {
    "3": "Tractors, racehorses (>2 yr), rent-to-own property",
    "5": "Computers, office equipment, automobiles, trucks, R&D equipment",
    "7": "Office furniture, fixtures, agricultural machinery, any property not assigned elsewhere",
    "10": "Vessels, barges, single-purpose agricultural structures",
    "15": "Land improvements, retail motor fuel outlets, electric transmission property",
    "20": "Farm buildings, municipal sewers",
};

/**
 * GDS (200% Declining Balance switching to Straight-Line)
 * Half-year convention — IRS Publication 946, Table A-1
 * Percentages sum to 100%.
 * Note: The recovery period is class + 1 years due to half-year convention.
 */
export const GDS_RATES: Record<PropertyClass, number[]> = {
    "3": [33.33, 44.45, 14.81, 7.41],
    "5": [20.0, 32.0, 19.2, 11.52, 11.52, 5.76],
    "7": [14.29, 24.49, 17.49, 12.49, 8.93, 8.92, 8.93, 4.46],
    "10": [10.0, 18.0, 14.4, 11.52, 9.22, 7.37, 6.55, 6.55, 6.56, 6.55, 3.28],
    "15": [
        5.0, 9.5, 8.55, 7.7, 6.93, 6.23, 5.9, 5.9, 5.91, 5.9, 5.91, 5.9,
        5.91, 5.9, 5.91, 2.95,
    ],
    "20": [
        3.75, 7.219, 6.677, 6.177, 5.713, 5.285, 4.888, 4.522, 4.462, 4.461,
        4.462, 4.461, 4.462, 4.461, 4.462, 4.461, 4.462, 4.461, 4.462, 4.461,
        2.231,
    ],
};

/**
 * ADS (Straight-Line over ADS recovery period)
 * Half-year convention
 * ADS recovery periods differ from GDS.
 */
export const ADS_LIFE: Record<PropertyClass, number> = {
    "3": 4,
    "5": 5,
    "7": 10,
    "10": 15,
    "15": 20,
    "20": 25,
};

/**
 * Generate ADS straight-line rates with half-year convention.
 * First and last years get half the annual rate.
 */
export function getAdsRates(propertyClass: PropertyClass): number[] {
    const life = ADS_LIFE[propertyClass];
    const annualRate = 100 / life;
    const halfRate = annualRate / 2;
    const rates: number[] = [];

    // First year: half
    rates.push(Math.round(halfRate * 1000) / 1000);
    // Middle years: full
    for (let i = 1; i < life; i++) {
        rates.push(Math.round(annualRate * 1000) / 1000);
    }
    // Last year: half
    rates.push(Math.round(halfRate * 1000) / 1000);

    return rates;
}
