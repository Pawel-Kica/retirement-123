/**
 * Pension calculation
 * Calculates nominal and real pension values
 */

import { Sex, AnnuityDivisors, CPIData } from '../types';

/**
 * Calculate monthly pension from total capital
 * Pension = Total Capital / Annuity Divisor
 */
export function calculatePension(
    totalCapital: number,
    retirementAge: number,
    sex: Sex,
    annuityDivisors: AnnuityDivisors
): number {
    // Get divisor for this age and sex
    const divisor = annuityDivisors[sex]?.[retirementAge.toString()];

    if (!divisor) {
        throw new Error(
            `Brak dzielnika rentowego dla wieku ${retirementAge} i płci ${sex}`
        );
    }

    // Monthly pension = Total Capital / Divisor
    const monthlyPension = totalCapital / divisor;

    return monthlyPension;
}

/**
 * Calculate real value of pension (in today's money)
 * Adjusts nominal pension by cumulative inflation
 */
export function calculateRealValue(
    nominalPension: number,
    retirementYear: number,
    currentYear: number,
    cpiData: CPIData
): number {
    // If retiring this year or in the past, no adjustment needed
    if (retirementYear <= currentYear) {
        return nominalPension;
    }

    // Calculate cumulative CPI from current year to retirement year
    let cumulativeCPI = 1.0;

    for (let year = currentYear + 1; year <= retirementYear; year++) {
        const cpi = cpiData[year.toString()];
        if (typeof cpi !== 'number') {
            throw new Error(`Brak danych CPI dla roku ${year}`);
        }
        cumulativeCPI *= cpi;
    }

    // Real value = Nominal / Cumulative CPI
    // This converts future pension to "today's złoty"
    const realPension = nominalPension / cumulativeCPI;

    return realPension;
}

/**
 * Calculate replacement rate
 * Replacement rate = (pension / final salary) * 100
 */
export function calculateReplacementRate(
    nominalPension: number,
    finalSalary: number
): number {
    const rate = (nominalPension / finalSalary) * 100;
    return Math.round(rate * 10) / 10; // Round to 1 decimal
}

/**
 * Get replacement rate description in Polish
 */
export function getReplacementRateDescription(rate: number): string {
    if (rate >= 70) return 'Doskonała stopa zastąpienia';
    if (rate >= 50) return 'Dobra stopa zastąpienia';
    if (rate >= 40) return 'Przeciętna stopa zastąpienia';
    if (rate >= 30) return 'Niska stopa zastąpienia';
    return 'Bardzo niska stopa zastąpienia';
}

