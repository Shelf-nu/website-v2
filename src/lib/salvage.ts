export interface SalvageResult {
    salvageValue: number;
    totalDepreciation: number;
    depreciationPercent: number;
    yearlyValues: number[]; // book value at end of each year
}

/**
 * Calculate estimated salvage value with declining-balance depreciation:
 * each year the asset loses `annualRate` of its remaining value, so the
 * value after n years is purchasePrice × (1 − annualRate)^n.
 *
 * Don't switch this to a flat rate on the purchase price. The category
 * rates in salvage-benchmarks.ts are about 1 / typicalLife, so a flat rate
 * writes most presets off to $0 by their typical life.
 */
export function calculateSalvage(
    purchasePrice: number,
    life: number,
    annualRate: number
): SalvageResult {
    const yearlyValues: number[] = [];
    const retainedPerYear = 1 - Math.min(Math.max(annualRate, 0), 1);
    let currentValue = purchasePrice;

    for (let yr = 1; yr <= life; yr++) {
        currentValue *= retainedPerYear;
        yearlyValues.push(Math.round(currentValue * 100) / 100);
    }

    const salvageValue = Math.round(currentValue * 100) / 100;
    const totalDepreciation = Math.round((purchasePrice - salvageValue) * 100) / 100;
    const depreciationPercent =
        purchasePrice > 0
            ? Math.round((totalDepreciation / purchasePrice) * 10000) / 100
            : 0;

    return {
        salvageValue,
        totalDepreciation,
        depreciationPercent,
        yearlyValues,
    };
}
