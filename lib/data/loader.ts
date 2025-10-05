/**
 * Data loader for JSON files
 */

import wageGrowthData from '@/data/wageGrowthByYear.json';
import cpiData from '@/data/cpiByYear.json';
import avgPensionData from '@/data/averagePensionByYear.json';
import sickImpactMData from '@/data/sickImpactM.json';
import sickImpactFData from '@/data/sickImpactF.json';
import factsData from '@/data/facts.json';
import retirementAgeData from '@/data/retirementAgeBySex.json';
import lifeDurationData from '@/data/lifeDuration.json';
import { loadPrognosisData } from './prognosisLoader';

import {
    WageGrowthData,
    CPIData,
    AveragePensionData,
    SickImpactConfig,
    FactsData,
    RetirementAgeData,
    LifeDurationData,
    PrognosisVariant,
    PrognosisVariantType,
} from '../types';

export interface AllData {
    wageGrowth: WageGrowthData;
    cpi: CPIData;
    avgPension: AveragePensionData;
    sickImpactM: SickImpactConfig;
    sickImpactF: SickImpactConfig;
    facts: FactsData;
    retirementAge: RetirementAgeData;
    lifeDuration: LifeDurationData;
    prognosisVariants: Record<PrognosisVariantType, PrognosisVariant>;
}

/**
 * Load all data files
 */
export async function loadAllData(): Promise<AllData> {
    const prognosisVariants = await loadPrognosisData();

    return {
        wageGrowth: wageGrowthData as WageGrowthData,
        cpi: cpiData as CPIData,
        avgPension: avgPensionData as AveragePensionData,
        sickImpactM: sickImpactMData as SickImpactConfig,
        sickImpactF: sickImpactFData as SickImpactConfig,
        facts: factsData as FactsData,
        retirementAge: retirementAgeData as RetirementAgeData,
        lifeDuration: lifeDurationData as LifeDurationData,
        prognosisVariants,
    };
}

/**
 * Get a random fact from facts.json
 */
export function getRandomFact(): string {
    const facts = factsData as FactsData;
    return facts.facts[Math.floor(Math.random() * facts.facts.length)];
}

/**
 * Get remaining life duration in months for a specific age
 * 
 * @param age - Age in years (30-90)
 * @param month - Month within the year (0-11, optional, defaults to 0)
 * @returns Remaining life expectancy in months, or null if not found
 */
export function getRemainingLifeMonths(age: number, month: number = 0): number | null {
    const lifeDuration = lifeDurationData as LifeDurationData;

    // Clamp age to available range
    if (age < 30) age = 30;
    if (age > 90) age = 90;

    // Clamp month to valid range
    if (month < 0) month = 0;
    if (month > 11) month = 11;

    const ageData = lifeDuration[age.toString()];
    if (!ageData || typeof ageData !== 'object' || '_metadata' in ageData) return null;

    const months = (ageData as Record<string, number>)[month.toString()];
    if (months === undefined) return null;

    return months;
}

/**
 * Get remaining life duration in years for a specific age
 * 
 * @param age - Age in years (30-90)
 * @param month - Month within the year (0-11, optional, defaults to 0)
 * @returns Remaining life expectancy in years (decimal), or null if not found
 */
export function getRemainingLifeYears(age: number, month: number = 0): number | null {
    const months = getRemainingLifeMonths(age, month);
    if (months === null) return null;

    return months / 12;
}

/**
 * Get expected death age for a person
 * 
 * @param currentAge - Current age in years
 * @param currentMonth - Current month within the year (0-11, optional)
 * @returns Expected age at death (decimal), or null if not found
 */
export function getExpectedDeathAge(currentAge: number, currentMonth: number = 0): number | null {
    const remainingYears = getRemainingLifeYears(currentAge, currentMonth);
    if (remainingYears === null) return null;

    return currentAge + remainingYears;
}

/**
 * Calculate annuity divisor based on remaining life expectancy from life duration data
 * This provides an alternative calculation method based on actual life expectancy tables
 * 
 * @param age - Retirement age in years
 * @returns Calculated annuity divisor (months of remaining life)
 */
export function calculateAnnuityDivisorFromLifeData(age: number): number | null {
    return getRemainingLifeMonths(age, 0);
}

