/**
 * Zwolnienie zdrowotne (sick leave) impact calculation
 * Applies reduction to salary base for contribution calculations
 */

import { SalaryPathEntry, SickImpactConfig, ZwolnienieZdrwotnePeriod, Sex } from '../types';

/**
 * Apply zwolnienie zdrowotne impact to salary path
 * Creates a modified path with reduced effective salary for contributions
 */
export function applyZwolnienieZdrowotneImpact(
    salaryPath: SalaryPathEntry[],
    sex: Sex,
    zwolnienieZdrowotneConfig: SickImpactConfig,
    customZwolnienieZdrwotnePeriods?: ZwolnienieZdrwotnePeriod[]
): SalaryPathEntry[] {
    return salaryPath.map(entry => {
        // Check if custom zwolnienie zdrowotne period exists for this year
        const customPeriod = customZwolnienieZdrwotnePeriods?.find(p => p.year === entry.year);

        let effectiveSalary: number;
        let zwolnienieZdrowotneImpact: number;

        if (customPeriod && customPeriod.days > 0) {
            // Custom zwolnienie zdrowotne days specified
            // Each zwolnienie zdrowotne day reduces contribution base by ~30% for that day
            const zwolnienieZdrowotneRatio = customPeriod.days / 365;
            const reductionFactor = 1 - (zwolnienieZdrowotneRatio * 0.3);
            effectiveSalary = entry.monthlyGross * reductionFactor;
            zwolnienieZdrowotneImpact = entry.monthlyGross - effectiveSalary;
        } else {
            // Apply average zwolnienie zdrowotne impact from config
            effectiveSalary = entry.monthlyGross * zwolnienieZdrowotneConfig.reductionCoefficient;
            zwolnienieZdrowotneImpact = entry.monthlyGross - effectiveSalary;
        }

        return {
            ...entry,
            effectiveSalary,
            zwolnienieZdrowotneImpact,
        };
    });
}

/**
 * Calculate parallel paths: with and without zwolnienie zdrowotne
 */
export function calculateZwolnienieZdrowotneComparison(
    salaryPath: SalaryPathEntry[],
    sex: Sex,
    zwolnienieZdrowotneConfigM: SickImpactConfig,
    zwolnienieZdrowotneConfigF: SickImpactConfig,
    customZwolnienieZdrwotnePeriods?: ZwolnienieZdrwotnePeriod[]
) {
    const config = sex === 'M' ? zwolnienieZdrowotneConfigM : zwolnienieZdrowotneConfigF;

    return {
        withoutZwolnienieZdrowotne: salaryPath, // Original path
        withZwolnienieZdrowotne: applyZwolnienieZdrowotneImpact(salaryPath, sex, config, customZwolnienieZdrwotnePeriods),
        avgDaysPerYear: config.avgDaysPerYear,
        impactDescription: config.description,
        impactPercent: ((1 - config.reductionCoefficient) * 100).toFixed(1),
    };
}

