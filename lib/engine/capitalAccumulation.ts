/**
 * Capital accumulation calculation
 * Tracks growth of retirement capital (main account and sub-account)
 */

import { CapitalEntry, SalaryPathEntry, WageGrowthData } from '../types';

// Polish pension system constants
const CONTRIBUTION_RATE = 0.1952; // 19.52%
const MAIN_ACCOUNT_SPLIT = 0.7616; // 76.16% goes to main account
const SUB_ACCOUNT_SPLIT = 0.2384; // 23.84% goes to sub-account

export interface AccumulateCapitalParams {
    salaryPath: SalaryPathEntry[];
    initialMainAccount?: number;
    initialSubAccount?: number;
    valorizationData: WageGrowthData; // We use wage growth as valorization proxy
}

/**
 * Accumulate capital over time with annual valorization
 * Returns detailed yearly breakdown
 */
export function accumulateCapital(params: AccumulateCapitalParams): CapitalEntry[] {
    const {
        salaryPath,
        initialMainAccount = 0,
        initialSubAccount = 0,
        valorizationData,
    } = params;

    let mainAccount = initialMainAccount;
    let subAccount = initialSubAccount;
    const capitalPath: CapitalEntry[] = [];

    for (const entry of salaryPath) {
        const mainAccountBefore = mainAccount;
        const subAccountBefore = subAccount;

        // Step 1: Apply valorization to existing capital
        // In Polish system, valorization happens based on wage growth
        const valorizationRate = valorizationData[entry.year.toString()];
        if (typeof valorizationRate !== 'number') {
            throw new Error(`Brak danych waloryzacji dla roku ${entry.year}`);
        }

        mainAccount = mainAccount * valorizationRate;
        subAccount = subAccount * valorizationRate;

        const valorizationGain =
            (mainAccount - mainAccountBefore) +
            (subAccount - subAccountBefore);

        // Step 2: Add this year's contributions
        // Use effectiveSalary if zwolnienie zdrowotne was applied, otherwise use annual gross
        const baseSalary = entry.effectiveSalary
            ? entry.effectiveSalary * 12
            : entry.annualGross;

        const annualContributions = baseSalary * CONTRIBUTION_RATE;
        const mainAccountContribution = annualContributions * MAIN_ACCOUNT_SPLIT;
        const subAccountContribution = annualContributions * SUB_ACCOUNT_SPLIT;

        mainAccount += mainAccountContribution;
        subAccount += subAccountContribution;

        capitalPath.push({
            year: entry.year,
            age: entry.age,
            salary: entry.monthlyGross,
            contributions: annualContributions,
            valorization: valorizationGain,
            mainAccountBefore,
            mainAccountAfter: mainAccount,
            subAccountBefore,
            subAccountAfter: subAccount,
            totalCapital: mainAccount + subAccount,
        });
    }

    return capitalPath;
}

/**
 * Get final capital at retirement
 */
export function getFinalCapital(capitalPath: CapitalEntry[]): {
    mainAccount: number;
    subAccount: number;
    total: number;
} {
    const lastEntry = capitalPath[capitalPath.length - 1];
    return {
        mainAccount: lastEntry.mainAccountAfter,
        subAccount: lastEntry.subAccountAfter,
        total: lastEntry.totalCapital,
    };
}

