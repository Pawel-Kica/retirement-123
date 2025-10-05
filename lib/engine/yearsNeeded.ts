/**
 * Calculate years needed to reach expected pension
 * Iteratively extends retirement year until expected amount is reached
 */

import { SalaryPathEntry, Sex, CPIData, WageGrowthData } from '../types';
import { accumulateCapital } from './capitalAccumulation';
import { calculatePension, calculateRealValue } from './pensionCalculation';

export interface CalculateYearsNeededParams {
    expectedPension: number;
    baseRetirementYear: number;
    baseRetirementAge: number;
    baseRealPension: number;
    completeSalaryPath: SalaryPathEntry[];
    sex: Sex;
    cpiData: CPIData;
    wageGrowthData: WageGrowthData;
    currentYear: number;
    maxAdditionalYears?: number;
}

/**
 * Calculate how many additional years of work are needed to reach expected pension
 * Returns null if not achievable within reasonable timeframe
 */
export function calculateYearsNeeded(
    params: CalculateYearsNeededParams
): number | null {
    const {
        expectedPension,
        baseRetirementYear,
        baseRetirementAge,
        baseRealPension,
        completeSalaryPath,
        sex,
        cpiData,
        wageGrowthData,
        currentYear,
        maxAdditionalYears = 15,
    } = params;

    // If already meeting expectations, return 0
    if (baseRealPension >= expectedPension) {
        return 0;
    }

    // Iteratively add years until we reach the expected amount
    for (let additionalYears = 1; additionalYears <= maxAdditionalYears; additionalYears++) {
        const newRetirementYear = baseRetirementYear + additionalYears;
        const newRetirementAge = baseRetirementAge + additionalYears;

        // Check if we have data for this year
        if (newRetirementYear > 2080) break;

        // Get extended salary path
        const extendedPath = completeSalaryPath.filter(
            entry => entry.year <= newRetirementYear
        );

        if (extendedPath.length === 0) break;

        // Recalculate with additional years
        const capitalPath = accumulateCapital({
            salaryPath: extendedPath,
            initialMainAccount: 0,
            initialSubAccount: 0,
            valorizationData: wageGrowthData,
        });

        const lastEntry = capitalPath[capitalPath.length - 1];
        const newTotalCapital = lastEntry.totalCapital;

        const newNominalPension = calculatePension(
            newTotalCapital,
            newRetirementAge,
            sex
        );

        const newRealPension = calculateRealValue(
            newNominalPension,
            newRetirementYear,
            currentYear,
            cpiData
        );

        // Check if we've reached the goal
        if (newRealPension >= expectedPension) {
            return additionalYears;
        }
    }

    // Not achievable within reasonable timeframe
    return null;
}

