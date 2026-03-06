export interface DepreciationRow {
    year: number;
    beginningValue: number;
    expense: number;
    accumulated: number;
    endingValue: number;
}

export type DepreciationMethod =
    | "straight-line"
    | "declining-balance"
    | "double-declining"
    | "sum-of-years";

export const METHOD_LABELS: Record<DepreciationMethod, string> = {
    "straight-line": "Straight-Line",
    "declining-balance": "Declining Balance",
    "double-declining": "Double Declining Balance",
    "sum-of-years": "Sum-of-Years' Digits",
};

export function calculateStraightLine(
    cost: number,
    salvage: number,
    life: number
): DepreciationRow[] {
    const depreciable = cost - salvage;
    const annual = depreciable / life;
    const rows: DepreciationRow[] = [];
    let accumulated = 0;

    for (let yr = 1; yr <= life; yr++) {
        const beginning = cost - accumulated;
        const expense = Math.min(annual, beginning - salvage);
        accumulated += expense;
        rows.push({
            year: yr,
            beginningValue: beginning,
            expense,
            accumulated,
            endingValue: cost - accumulated,
        });
    }
    return rows;
}

export function calculateDecliningBalance(
    cost: number,
    salvage: number,
    life: number,
    rate: number = 150
): DepreciationRow[] {
    const dbRate = (rate / 100) / life;
    const rows: DepreciationRow[] = [];
    let accumulated = 0;

    for (let yr = 1; yr <= life; yr++) {
        const beginning = cost - accumulated;
        let expense = beginning * dbRate;
        // Cannot depreciate below salvage value
        if (beginning - expense < salvage) {
            expense = beginning - salvage;
        }
        if (expense < 0) expense = 0;
        accumulated += expense;
        rows.push({
            year: yr,
            beginningValue: beginning,
            expense,
            accumulated,
            endingValue: cost - accumulated,
        });
    }
    return rows;
}

export function calculateDoubleDeclining(
    cost: number,
    salvage: number,
    life: number
): DepreciationRow[] {
    return calculateDecliningBalance(cost, salvage, life, 200);
}

export function calculateSumOfYears(
    cost: number,
    salvage: number,
    life: number
): DepreciationRow[] {
    const depreciable = cost - salvage;
    const sumOfYears = (life * (life + 1)) / 2;
    const rows: DepreciationRow[] = [];
    let accumulated = 0;

    for (let yr = 1; yr <= life; yr++) {
        const beginning = cost - accumulated;
        const fraction = (life - yr + 1) / sumOfYears;
        let expense = depreciable * fraction;
        if (beginning - expense < salvage) {
            expense = beginning - salvage;
        }
        if (expense < 0) expense = 0;
        accumulated += expense;
        rows.push({
            year: yr,
            beginningValue: beginning,
            expense,
            accumulated,
            endingValue: cost - accumulated,
        });
    }
    return rows;
}

export function calculate(
    method: DepreciationMethod,
    cost: number,
    salvage: number,
    life: number,
    dbRate?: number
): DepreciationRow[] {
    switch (method) {
        case "straight-line":
            return calculateStraightLine(cost, salvage, life);
        case "declining-balance":
            return calculateDecliningBalance(cost, salvage, life, dbRate);
        case "double-declining":
            return calculateDoubleDeclining(cost, salvage, life);
        case "sum-of-years":
            return calculateSumOfYears(cost, salvage, life);
    }
}

export function calculateAll(
    cost: number,
    salvage: number,
    life: number
): Record<DepreciationMethod, DepreciationRow[]> {
    return {
        "straight-line": calculateStraightLine(cost, salvage, life),
        "declining-balance": calculateDecliningBalance(cost, salvage, life),
        "double-declining": calculateDoubleDeclining(cost, salvage, life),
        "sum-of-years": calculateSumOfYears(cost, salvage, life),
    };
}
