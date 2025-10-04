/**
 * Deferral scenarios calculation
 * Shows what happens if user works +1, +2, +5 years longer
 */

import { DeferralScenario, SalaryPathEntry, Sex, AnnuityDivisors, CPIData, WageGrowthData } from '../types';
import { accumulateCapital } from './capitalAccumulation';
import { calculatePension, calculateRealValue } from './pensionCalculation';

export interface CalculateDeferralScenariosParams {
    baseRetirementYear: number;
    baseRetirementAge: number;
    baseTotalCapital: number;
    baseRealPension: number;
    completeSalaryPath: SalaryPathEntry[]; // Full path including potential future years
    sex: Sex;
    annuityDivisors: AnnuityDivisors;
    cpiData: CPIData;
    wageGrowthData: WageGrowthData;
    currentYear: number;
    deferralYears?: number[];
}

/**
 * Calculate pension scenarios for working additional years
 * Takes into account:
 * - Additional contributions from extra work years
 * - Valorization of existing capital
 * - Lower annuity divisor (shorter life expectancy)
 */
export function calculateDeferralScenarios(
    params: CalculateDeferralScenariosParams
): DeferralScenario[] {
    const {
        baseRetirementYear,
        baseRetirementAge,
        baseTotalCapital,
        baseRealPension,
        completeSalaryPath,
        sex,
        annuityDivisors,
        cpiData,
        wageGrowthData,
        currentYear,
        deferralYears = [1, 2, 5],
    } = params;

    const scenarios: DeferralScenario[] = [];

    for (const additionalYears of deferralYears) {
        const newRetirementYear = baseRetirementYear + additionalYears;
        const newRetirementAge = baseRetirementAge + additionalYears;

        // Check if divisor exists for this age
        const newDivisor = annuityDivisors[sex]?.[newRetirementAge.toString()];
        if (!newDivisor) {
            console.warn(`Brak dzielnika dla wieku ${newRetirementAge}, pomijam scenariusz +${additionalYears}`);
            continue;
        }

        // Get salary path up to new retirement year
        const extendedPath = completeSalaryPath.filter(
            entry => entry.year <= newRetirementYear
        );

        if (extendedPath.length === 0) {
            console.warn(`Brak danych płac do roku ${newRetirementYear}, pomijam scenariusz +${additionalYears}`);
            continue;
        }

        // Recalculate capital with extended path
        const capitalPath = accumulateCapital({
            salaryPath: extendedPath,
            initialMainAccount: 0,
            initialSubAccount: 0,
            valorizationData: wageGrowthData,
        });

        const lastEntry = capitalPath[capitalPath.length - 1];
        const newTotalCapital = lastEntry.totalCapital;

        // Calculate new pension with lower divisor
        const newNominalPension = calculatePension(
            newTotalCapital,
            newRetirementAge,
            sex,
            annuityDivisors
        );

        const newRealPension = calculateRealValue(
            newNominalPension,
            newRetirementYear,
            currentYear,
            cpiData
        );

        scenarios.push({
            additionalYears,
            retirementYear: newRetirementYear,
            retirementAge: newRetirementAge,
            totalCapital: newTotalCapital,
            nominalPension: newNominalPension,
            realPension: newRealPension,
            increaseVsBase: newRealPension - baseRealPension,
            percentIncrease: ((newRealPension / baseRealPension - 1) * 100),
        });
    }

    return scenarios;
}

