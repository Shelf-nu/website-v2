export interface RoiInputs {
    totalAssets: number;
    avgValue: number;
    teamSize: number;
    hourlyCost: number;
    ghostRate: number; // percentage
    searchHours: number; // hours per week
    shrinkageRate: number; // percentage
    duplicateRate: number; // percentage
}

export interface RoiBreakdown {
    ghostAssetCost: number;
    productivityLoss: number;
    shrinkageCost: number;
    duplicateCost: number;
    totalAnnualCost: number;
}

export interface ShelfComparison {
    annualShelfCost: number;
    netSavings: number;
    roi: number; // percentage
    paybackMonths: number;
    threeYearSavings: number;
}

export const SHELF_PLANS = {
    plus: { label: "Plus", monthlyPrice: 34, yearlyPrice: 190 },
    team: { label: "Team", monthlyPrice: 67, yearlyPrice: 370 },
} as const;

export type ShelfPlan = keyof typeof SHELF_PLANS;

export function calculateRoi(inputs: RoiInputs): RoiBreakdown {
    const totalFleetValue = inputs.totalAssets * inputs.avgValue;

    // Ghost assets: assets on the books that don't exist or can't be found
    const ghostAssetCost =
        totalFleetValue * (inputs.ghostRate / 100);

    // Productivity loss: time spent searching for equipment
    const productivityLoss =
        inputs.searchHours * inputs.hourlyCost * inputs.teamSize * 52;

    // Shrinkage: assets lost, stolen, or broken beyond repair
    const shrinkageCost =
        totalFleetValue * (inputs.shrinkageRate / 100);

    // Duplicate purchases: buying something you already have because you can't find it
    const duplicateCost =
        totalFleetValue * (inputs.duplicateRate / 100);

    const totalAnnualCost =
        ghostAssetCost + productivityLoss + shrinkageCost + duplicateCost;

    return {
        ghostAssetCost: Math.round(ghostAssetCost),
        productivityLoss: Math.round(productivityLoss),
        shrinkageCost: Math.round(shrinkageCost),
        duplicateCost: Math.round(duplicateCost),
        totalAnnualCost: Math.round(totalAnnualCost),
    };
}

export function calculateShelfComparison(
    breakdown: RoiBreakdown,
    plan: ShelfPlan
): ShelfComparison {
    const planInfo = SHELF_PLANS[plan];
    const annualShelfCost = planInfo.yearlyPrice;
    // Conservative: assume Shelf recovers 60% of these costs
    const recoveryRate = 0.6;
    const recoveredAmount = breakdown.totalAnnualCost * recoveryRate;
    const netSavings = recoveredAmount - annualShelfCost;
    const roi =
        annualShelfCost > 0 ? (netSavings / annualShelfCost) * 100 : 0;
    const paybackMonths =
        recoveredAmount > 0
            ? Math.ceil((annualShelfCost / recoveredAmount) * 12)
            : 0;
    const threeYearSavings = netSavings * 3;

    return {
        annualShelfCost,
        netSavings: Math.round(netSavings),
        roi: Math.round(roi),
        paybackMonths,
        threeYearSavings: Math.round(threeYearSavings),
    };
}
