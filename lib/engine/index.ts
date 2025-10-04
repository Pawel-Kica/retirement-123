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
import { calculateL4Comparison } from "./l4Impact";
import { accumulateCapital, getFinalCapital } from "./capitalAccumulation";
import {
  calculatePension,
  calculateRealValue,
  calculateReplacementRate,
} from "./pensionCalculation";
import { calculateDeferralScenarios } from "./deferralScenarios";
import { calculateYearsNeeded } from "./yearsNeeded";

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

  // Step 2: Calculate L4 impact (if enabled)
  let pathWithoutL4 = baseSalaryPath;
  let pathWithL4 = baseSalaryPath;

  if (inputs.includeL4) {
    const l4Comparison = calculateL4Comparison(
      baseSalaryPath,
      inputs.sex,
      data.sickImpactM,
      data.sickImpactF,
      modifications?.customL4Periods
    );
    pathWithoutL4 = l4Comparison.withoutL4;
    pathWithL4 = l4Comparison.withL4;
  }

  // Step 3: Calculate capital accumulation for both paths
  const capitalPathWithoutL4 = accumulateCapital({
    salaryPath: pathWithoutL4,
    initialMainAccount: inputs.accountBalance,
    initialSubAccount: inputs.subAccountBalance,
    valorizationData: data.wageGrowth,
  });

  const capitalPathWithL4 = accumulateCapital({
    salaryPath: pathWithL4,
    initialMainAccount: inputs.accountBalance,
    initialSubAccount: inputs.subAccountBalance,
    valorizationData: data.wageGrowth,
  });

  // Get final capitals
  const finalCapitalWithoutL4 = getFinalCapital(capitalPathWithoutL4);
  const finalCapitalWithL4 = getFinalCapital(capitalPathWithL4);

  // Step 4: Calculate pensions
  const actualRetirementAge = inputs.age + (inputs.workEndYear - currentYear);

  // Without L4
  const nominalPensionWithoutL4 = calculatePension(
    finalCapitalWithoutL4.total,
    actualRetirementAge,
    inputs.sex,
    data.annuityDivisors
  );

  const realPensionWithoutL4 = calculateRealValue(
    nominalPensionWithoutL4,
    inputs.workEndYear,
    currentYear,
    data.cpi
  );

  // With L4
  const nominalPensionWithL4 = calculatePension(
    finalCapitalWithL4.total,
    actualRetirementAge,
    inputs.sex,
    data.annuityDivisors
  );

  const realPensionWithL4 = calculateRealValue(
    nominalPensionWithL4,
    inputs.workEndYear,
    currentYear,
    data.cpi
  );

  // Use the appropriate values based on whether L4 is enabled
  const nominalPension = inputs.includeL4
    ? nominalPensionWithL4
    : nominalPensionWithoutL4;
  const realPension = inputs.includeL4
    ? realPensionWithL4
    : realPensionWithoutL4;
  const capitalPath = inputs.includeL4
    ? capitalPathWithL4
    : capitalPathWithoutL4;

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
    baseTotalCapital: inputs.includeL4
      ? finalCapitalWithL4.total
      : finalCapitalWithoutL4.total,
    baseRealPension: realPension,
    deferralYears: [1, 2, 3, 4, 5, 6, 7, 8, 9, 10, 11, 12, 13, 14, 15],
    completeSalaryPath: inputs.includeL4
      ? calculateL4Comparison(
          completeSalaryPath,
          inputs.sex,
          data.sickImpactM,
          data.sickImpactF
        ).withL4
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
      completeSalaryPath: inputs.includeL4
        ? calculateL4Comparison(
            completeSalaryPath,
            inputs.sex,
            data.sickImpactM,
            data.sickImpactF
          ).withL4
        : completeSalaryPath,
      sex: inputs.sex,
      annuityDivisors: data.annuityDivisors,
      cpiData: data.cpi,
      wageGrowthData: data.wageGrowth,
      currentYear,
    });
  }

  return {
    nominalPension,
    realPension,
    replacementRate,
    avgPensionInRetirementYear,
    differenceVsAverage,
    differenceVsExpected,
    withoutL4: {
      nominalPension: nominalPensionWithoutL4,
      realPension: realPensionWithoutL4,
      totalCapital: finalCapitalWithoutL4.total,
    },
    withL4: {
      nominalPension: nominalPensionWithL4,
      realPension: realPensionWithL4,
      totalCapital: finalCapitalWithL4.total,
    },
    l4Difference: realPensionWithoutL4 - realPensionWithL4,
    deferrals,
    yearsNeeded,
    capitalPath,
    salaryPath: baseSalaryPath,
  };
}
