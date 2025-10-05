/**
 * Data loader for JSON files
 */

import { getWageGrowthByYear } from '@/data/tables/wageGrowthByYear';
import { getCpiByYear } from '@/data/tables/cpiByYear';
import { getAveragePensionByYear } from '@/data/tables/averagePensionByYear';
import { sickImpact } from '@/data/sickImpact';
import { facts } from '@/data/facts';
import { retirementAgeBySex } from '@/data/retirementAgeBySex';
import { loadPrognosisData } from './prognosisLoader';

import {
    WageGrowthData,
    CPIData,
    AveragePensionData,
    SickImpactConfig,
    FactsData,
    RetirementAgeData,
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
    prognosisVariants: Record<PrognosisVariantType, PrognosisVariant>;
}

/**
 * Load all data files
 */
export async function loadAllData(): Promise<AllData> {
    const prognosisVariants = await loadPrognosisData();
    const [wageGrowth, cpi, avgPension] = await Promise.all([
        getWageGrowthByYear(),
        getCpiByYear(),
        getAveragePensionByYear(),
    ]);

    return {
        wageGrowth: wageGrowth as WageGrowthData,
        cpi: cpi as CPIData,
        avgPension: avgPension as AveragePensionData,
        sickImpactM: sickImpact.M as SickImpactConfig,
        sickImpactF: sickImpact.F as SickImpactConfig,
        facts: { facts } as FactsData,
        retirementAge: retirementAgeBySex as RetirementAgeData,
        prognosisVariants,
    };
}

/**
 * Get a random fact from facts.json
 */
export function getRandomFact(): string {
    return facts[Math.floor(Math.random() * facts.length)];
}

