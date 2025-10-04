/**
 * Data loader for JSON files
 */

import wageGrowthData from '@/data/wageGrowthByYear.json';
import cpiData from '@/data/cpiByYear.json';
import avgPensionData from '@/data/averagePensionByYear.json';
import annuityDivisorData from '@/data/annuityDivisor.json';
import sickImpactMData from '@/data/sickImpactM.json';
import sickImpactFData from '@/data/sickImpactF.json';
import factsData from '@/data/facts.json';
import retirementAgeData from '@/data/retirementAgeBySex.json';

import {
    WageGrowthData,
    CPIData,
    AveragePensionData,
    AnnuityDivisors,
    SickImpactConfig,
    FactsData,
    RetirementAgeData,
} from '../types';

export interface AllData {
    wageGrowth: WageGrowthData;
    cpi: CPIData;
    avgPension: AveragePensionData;
    annuityDivisors: AnnuityDivisors;
    sickImpactM: SickImpactConfig;
    sickImpactF: SickImpactConfig;
    facts: FactsData;
    retirementAge: RetirementAgeData;
}

/**
 * Load all data files
 */
export function loadAllData(): AllData {
    return {
        wageGrowth: wageGrowthData as WageGrowthData,
        cpi: cpiData as CPIData,
        avgPension: avgPensionData as AveragePensionData,
        annuityDivisors: annuityDivisorData as AnnuityDivisors,
        sickImpactM: sickImpactMData as SickImpactConfig,
        sickImpactF: sickImpactFData as SickImpactConfig,
        facts: factsData as FactsData,
        retirementAge: retirementAgeData as RetirementAgeData,
    };
}

/**
 * Get a random fact from facts.json
 */
export function getRandomFact(): string {
    const allData = loadAllData();
    const facts = allData.facts.facts;
    return facts[Math.floor(Math.random() * facts.length)];
}

