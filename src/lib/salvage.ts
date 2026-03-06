export interface SalvageResult {
    salvageValue: number;
    totalDepreciation: number;
    depreciationPercent: number;
    yearlyValues: number[]; // book value at end of each year
}

/**
 * Calculate estimated salvage value using flat annual depreciation rate.
 */
export function calculateSalvage(
    purchasePrice: number,
    life: number,
    annualRate: number
): SalvageResult {
    const yearlyValues: number[] = [];
    let currentValue = purchasePrice;

    for (let yr = 1; yr <= life; yr++) {
        const depreciation = purchasePrice * annualRate;
        currentValue = Math.max(0, currentValue - depreciation);
        yearlyValues.push(Math.round(currentValue * 100) / 100);
    }

    const salvageValue = Math.max(0, Math.round(currentValue * 100) / 100);
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
