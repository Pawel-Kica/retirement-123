/**
 * Salary path calculation
 * Builds historical and future salary trajectory based on wage growth data
 */

import { SalaryPathEntry, WageGrowthData } from '../types';

export interface BuildSalaryPathParams {
    currentSalary: number;
    currentYear: number;
    currentAge: number;
    workStartYear: number;
    workEndYear: number;
    wageGrowthData: WageGrowthData;
    customOverrides?: Record<number, number>;
}

/**
 * Build complete salary path from work start to work end
 * Uses backward indexing to calculate historical salaries,
 * then forward indexing for future salaries.
 * ALWAYS assumes January 1st start/end dates.
 */
export function buildSalaryPath(params: BuildSalaryPathParams): SalaryPathEntry[] {
    const {
        currentSalary,
        currentYear,
        currentAge,
        workStartYear,
        workEndYear,
        wageGrowthData,
        customOverrides = {},
    } = params;

    // Step 1: Calculate backward from current year to start year
    let salary = currentSalary;

    // Go backwards to work start
    for (let year = currentYear - 1; year >= workStartYear; year--) {
        const growthRate = wageGrowthData[year.toString()];
        if (typeof growthRate !== 'number') {
            throw new Error(`Brak danych o wzroście płac dla roku ${year}`);
        }
        // Reverse the growth: if 2023→2024 grew by 3.6%, then 2024→2023 is ÷1.036
        salary = salary / growthRate;
    }

    // Step 2: Build forward path from start to end
    const startSalary = salary;
    salary = startSalary;

    const path: SalaryPathEntry[] = [];

    for (let year = workStartYear; year <= workEndYear; year++) {
        const age = currentAge - (currentYear - year);

        // Apply custom override if exists
        const finalSalary = customOverrides[year] ?? salary;

        path.push({
            year,
            age,
            monthlyGross: finalSalary,
            annualGross: finalSalary * 12,
            isHistorical: year < currentYear,
            isFuture: year > currentYear,
            isCurrentYear: year === currentYear,
        });

        // Apply growth for next year
        if (year < workEndYear) {
            const growthRate = wageGrowthData[year.toString()];
            if (typeof growthRate !== 'number') {
                throw new Error(`Brak danych o wzroście płac dla roku ${year}`);
            }
            salary = salary * growthRate;
        }
    }

    return path;
}

