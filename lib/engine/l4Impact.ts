/**
 * L4 (sick leave) impact calculation
 * Applies reduction to salary base for contribution calculations
 */

import { SalaryPathEntry, SickImpactConfig, L4Period, Sex } from '../types';

/**
 * Apply L4 impact to salary path
 * Creates a modified path with reduced effective salary for contributions
 */
export function applyL4Impact(
    salaryPath: SalaryPathEntry[],
    sex: Sex,
    l4Config: SickImpactConfig,
    customL4Periods?: L4Period[]
): SalaryPathEntry[] {
    return salaryPath.map(entry => {
        // Check if custom L4 period exists for this year
        const customPeriod = customL4Periods?.find(p => p.year === entry.year);

        let effectiveSalary: number;
        let l4Impact: number;

        if (customPeriod && customPeriod.days > 0) {
            // Custom L4 days specified
            // Each L4 day reduces contribution base by ~30% for that day
            const l4Ratio = customPeriod.days / 365;
            const reductionFactor = 1 - (l4Ratio * 0.3);
            effectiveSalary = entry.monthlyGross * reductionFactor;
            l4Impact = entry.monthlyGross - effectiveSalary;
        } else {
            // Apply average L4 impact from config
            effectiveSalary = entry.monthlyGross * l4Config.reductionCoefficient;
            l4Impact = entry.monthlyGross - effectiveSalary;
        }

        return {
            ...entry,
            effectiveSalary,
            l4Impact,
        };
    });
}

/**
 * Calculate parallel paths: with and without L4
 */
export function calculateL4Comparison(
    salaryPath: SalaryPathEntry[],
    sex: Sex,
    l4ConfigM: SickImpactConfig,
    l4ConfigF: SickImpactConfig,
    customL4Periods?: L4Period[]
) {
    const config = sex === 'M' ? l4ConfigM : l4ConfigF;

    return {
        withoutL4: salaryPath, // Original path
        withL4: applyL4Impact(salaryPath, sex, config, customL4Periods),
        avgDaysPerYear: config.avgDaysPerYear,
        impactDescription: config.description,
        impactPercent: ((1 - config.reductionCoefficient) * 100).toFixed(1),
    };
}

