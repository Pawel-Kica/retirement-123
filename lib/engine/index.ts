/**
 * Main calculation engine orchestrator
 * Combines all calculation modules to produce complete simulation results
 */

import {
  SimulationInputs,
  SimulationResults,
  DashboardModifications,
} from "../types";
import { loadAllData } from "../data/loader";
import { buildSalaryPath } from "./salaryPath";
import { calculateZwolnienieZdrowotneComparison } from "./l4Impact";
import { applyTimelineAdjustments } from "./timelineAdjustments";
import { accumulateCapital, getFinalCapital } from "./capitalAccumulation";
import {
  calculatePension,
  calculateRealValue,
  calculateReplacementRate,
} from "./pensionCalculation";
import { calculateDeferralScenarios } from "./deferralScenarios";
import { calculateYearsNeeded } from "./yearsNeeded";
import {
  calculateAdditionalProgramsCapital,
  combinePensions,
} from "./additionalPrograms";

export interface CalculateParams {
  inputs: SimulationInputs;
  expectedPension: number;
  modifications?: DashboardModifications;
}

/**
 * Main calculation function
 * Orchestrates all engine modules to produce complete results
 */
export async function calculateSimulation(
  params: CalculateParams
): Promise<SimulationResults> {
  const { inputs, expectedPension, modifications } = params;
  const currentYear = new Date().getFullYear();

  // Load all data
  const data = await loadAllData();

  // Step 1: Build salary path
  const baseSalaryPath = buildSalaryPath({
    currentSalary: inputs.monthlyGross,
    currentYear,
    currentAge: inputs.age,
    workStartYear: inputs.workStartYear,
    workEndYear: inputs.workEndYear,
    wageGrowthData: data.wageGrowth,
    customOverrides: modifications?.customSalaries,
  });

  // Extend salary path to allow for deferral scenarios (up to +15 years)
  const maxExtendedYear = Math.min(inputs.workEndYear + 15, 2080);
  const completeSalaryPath = buildSalaryPath({
    currentSalary: inputs.monthlyGross,
    currentYear,
    currentAge: inputs.age,
    workStartYear: inputs.workStartYear,
    workEndYear: maxExtendedYear,
    wageGrowthData: data.wageGrowth,
    customOverrides: modifications?.customSalaries,
  });

  // Step 2: Calculate zwolnienie zdrowotne impact (if enabled)
  let pathWithoutZwolnienieZdrowotne = baseSalaryPath;
  let pathWithZwolnienieZdrowotne = baseSalaryPath;

  if (inputs.includeZwolnienieZdrowotne) {
    const zwolnienieZdrowotneComparison = calculateZwolnienieZdrowotneComparison(
      baseSalaryPath,
      inputs.sex,
      data.sickImpactM,
      data.sickImpactF,
      modifications?.customZwolnienieZdrwotnePeriods
    );
    pathWithoutZwolnienieZdrowotne = zwolnienieZdrowotneComparison.withoutZwolnienieZdrowotne;
    pathWithZwolnienieZdrowotne = zwolnienieZdrowotneComparison.withZwolnienieZdrowotne;
  }

  // Apply unified timeline adjustments (contract/gaps/zwolnienie zdrowotne points)
  const adjustedPath = applyTimelineAdjustments({
    path: inputs.includeZwolnienieZdrowotne ? pathWithZwolnienieZdrowotne : pathWithoutZwolnienieZdrowotne,
    contractPeriods: modifications?.contractPeriods,
    gapPeriods: modifications?.gapPeriods,
    lifeEvents: modifications?.lifeEvents,
    sex: inputs.sex,
  });

  // Step 3: Calculate capital accumulation for adjusted path
  const capitalPathWithoutZwolnienieZdrowotne = accumulateCapital({
    salaryPath: adjustedPath,
    initialMainAccount: inputs.accountBalance,
    initialSubAccount: inputs.subAccountBalance,
    valorizationData: data.wageGrowth,
  });

  const capitalPathWithZwolnienieZdrowotne = capitalPathWithoutZwolnienieZdrowotne;

  // Get final capitals
  const finalCapitalWithoutZwolnienieZdrowotne = getFinalCapital(capitalPathWithoutZwolnienieZdrowotne);
  const finalCapitalWithZwolnienieZdrowotne = getFinalCapital(capitalPathWithZwolnienieZdrowotne);

  // Step 4: Calculate pensions
  const actualRetirementAge = inputs.age + (inputs.workEndYear - currentYear);

  // Without zwolnienie zdrowotne
  const nominalPensionWithoutZwolnienieZdrowotne = calculatePension(
    finalCapitalWithoutZwolnienieZdrowotne.total,
    actualRetirementAge,
    inputs.sex,
    data.annuityDivisors
  );

  const realPensionWithoutZwolnienieZdrowotne = calculateRealValue(
    nominalPensionWithoutZwolnienieZdrowotne,
    inputs.workEndYear,
    currentYear,
    data.cpi
  );

  // With zwolnienie zdrowotne
  const nominalPensionWithZwolnienieZdrowotne = calculatePension(
    finalCapitalWithZwolnienieZdrowotne.total,
    actualRetirementAge,
    inputs.sex,
    data.annuityDivisors
  );

  const realPensionWithZwolnienieZdrowotne = calculateRealValue(
    nominalPensionWithZwolnienieZdrowotne,
    inputs.workEndYear,
    currentYear,
    data.cpi
  );

  // Use the appropriate values based on whether zwolnienie zdrowotne is enabled
  const nominalPension = inputs.includeZwolnienieZdrowotne
    ? nominalPensionWithZwolnienieZdrowotne
    : nominalPensionWithoutZwolnienieZdrowotne;
  const realPension = inputs.includeZwolnienieZdrowotne
    ? realPensionWithZwolnienieZdrowotne
    : realPensionWithoutZwolnienieZdrowotne;
  const capitalPath = capitalPathWithoutZwolnienieZdrowotne;

  // Step 5: Calculate replacement rate
  const finalSalaryEntry = baseSalaryPath[baseSalaryPath.length - 1];
  const replacementRate = calculateReplacementRate(
    nominalPension,
    finalSalaryEntry.monthlyGross
  );

  // Step 6: Compare to average pension
  const avgPensionInRetirementYear = data.avgPension[
    inputs.workEndYear.toString()
  ] as number;
  const differenceVsAverage = nominalPension - avgPensionInRetirementYear;

  // Step 7: Compare to expectations
  const differenceVsExpected = realPension - expectedPension;

  // Step 8: Calculate deferral scenarios
  const deferrals = calculateDeferralScenarios({
    baseRetirementYear: inputs.workEndYear,
    baseRetirementAge: actualRetirementAge,
    baseTotalCapital: inputs.includeZwolnienieZdrowotne
      ? finalCapitalWithZwolnienieZdrowotne.total
      : finalCapitalWithoutZwolnienieZdrowotne.total,
    baseRealPension: realPension,
    deferralYears: [1, 2, 3, 4, 5, 6, 7, 8, 9, 10, 11, 12, 13, 14, 15],
    completeSalaryPath: inputs.includeZwolnienieZdrowotne
      ? calculateZwolnienieZdrowotneComparison(
          completeSalaryPath,
          inputs.sex,
          data.sickImpactM,
          data.sickImpactF
        ).withZwolnienieZdrowotne
      : completeSalaryPath,
    sex: inputs.sex,
    annuityDivisors: data.annuityDivisors,
    cpiData: data.cpi,
    wageGrowthData: data.wageGrowth,
    currentYear,
  });

  // Step 9: Calculate years needed to reach expectations
  let yearsNeeded: number | null = null;
  if (realPension < expectedPension) {
    yearsNeeded = calculateYearsNeeded({
      expectedPension,
      baseRetirementYear: inputs.workEndYear,
      baseRetirementAge: actualRetirementAge,
      baseRealPension: realPension,
      completeSalaryPath: inputs.includeZwolnienieZdrowotne
        ? calculateZwolnienieZdrowotneComparison(
            completeSalaryPath,
            inputs.sex,
            data.sickImpactM,
            data.sickImpactF
          ).withZwolnienieZdrowotne
        : completeSalaryPath,
      sex: inputs.sex,
      annuityDivisors: data.annuityDivisors,
      cpiData: data.cpi,
      wageGrowthData: data.wageGrowth,
      currentYear,
    });
  }

  // Step 10: Calculate additional retirement programs (PPK, IKZE) if enabled
  let ppkCapital = 0;
  let ikzeCapital = 0;
  let totalPensionWithPrograms = realPension;
  let programsBreakdown = undefined;

  if (inputs.retirementPrograms) {
    const additionalPrograms = calculateAdditionalProgramsCapital({
      salaryPath: inputs.includeZwolnienieZdrowotne ? pathWithZwolnienieZdrowotne : pathWithoutZwolnienieZdrowotne,
      programs: inputs.retirementPrograms,
    });

    ppkCapital = additionalPrograms.ppkCapital;
    ikzeCapital = additionalPrograms.ikzeCapital;

    const combined = combinePensions(realPension, additionalPrograms);
    totalPensionWithPrograms = combined.totalMonthlyPension;
    programsBreakdown = combined.breakdown;
  }

  return {
    nominalPension,
    realPension,
    replacementRate,
    avgPensionInRetirementYear,
    differenceVsAverage,
    differenceVsExpected,
    withoutZwolnienieZdrowotne: {
      nominalPension: nominalPensionWithoutZwolnienieZdrowotne,
      realPension: realPensionWithoutZwolnienieZdrowotne,
      totalCapital: finalCapitalWithoutZwolnienieZdrowotne.total,
    },
    withZwolnienieZdrowotne: {
      nominalPension: nominalPensionWithZwolnienieZdrowotne,
      realPension: realPensionWithZwolnienieZdrowotne,
      totalCapital: finalCapitalWithZwolnienieZdrowotne.total,
    },
    zwolnienieZdrwotneDifference: realPensionWithoutZwolnienieZdrowotne - realPensionWithZwolnienieZdrowotne,
    deferrals,
    yearsNeeded,
    capitalPath,
    salaryPath: adjustedPath,
    // New PPK/IKZE fields
    ppkCapital,
    ikzeCapital,
    totalPensionWithPrograms,
    programsBreakdown,
  };
}
