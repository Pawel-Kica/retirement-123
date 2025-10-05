/**
 * Simplified pension calculation engine
 * Year-by-year accumulation based purely on user inputs
 */

import {
  SimulationInputs,
  SimulationResults,
  DashboardModifications,
  EmploymentPeriod,
  EmploymentGapPeriod,
  Sex,
  ContractType,
} from "../types";

// Contract contribution rates
const CONTRACT_RATES: Record<ContractType, number> = {
  UOP: 0.1952, // 19.52%
  UOZ: 0.1952, // 19.52%
  B2B: 0.12, // 12% (simplified)
};

// Gap penalty factors
const GAP_PENALTIES = {
  MATERNITY_LEAVE: 0.3, // 30% reduction
  UNPAID_LEAVE: 1.0, // 100% reduction
  UNEMPLOYMENT: 1.0, // 100% reduction
};

// Retirement program multipliers
const PPK_MULTIPLIER = 0.10; // 10% boost
const IKZE_MULTIPLIER = 0.10; // 10% boost

// Life expectancy divisors (in months)
const BASE_DIVISORS = {
  F: { age: 60, months: 277 },
  M: { age: 65, months: 217 },
};

/**
 * Calculate divisor based on retirement age and sex
 */
function calculateDivisor(retirementAge: number, sex: Sex): number {
  const base = BASE_DIVISORS[sex];
  const ageDifference = retirementAge - base.age;
  const divisor = base.months - ageDifference * 12;
  return Math.max(12, divisor); // Minimum 1 year
}

/**
 * Build work history from inputs
 */
function buildWorkHistory(
  inputs: SimulationInputs,
  modifications?: DashboardModifications
): EmploymentPeriod[] {
  // If timeline modifications exist, use those
  if (modifications?.contractPeriods && modifications.contractPeriods.length > 0) {
    return modifications.contractPeriods;
  }

  // Otherwise, create single period from basic inputs
  return [
    {
      id: "default",
      startYear: inputs.workStartYear,
      endYear: inputs.workEndYear,
      monthlyGross: inputs.monthlyGross,
      contractType: inputs.contractType || "UOP",
    },
  ];
}

/**
 * Calculate base capital from work history
 */
function calculateBaseCapital(workHistory: EmploymentPeriod[]): number {
  let totalCapital = 0;

  for (const period of workHistory) {
    const years = period.endYear - period.startYear + 1;
    const annualGross = period.monthlyGross * 12;
    const rate = CONTRACT_RATES[period.contractType];

    for (let i = 0; i < years; i++) {
      totalCapital += annualGross * rate;
    }
  }

  return totalCapital;
}

/**
 * Calculate average monthly salary from work history
 */
function calculateAverageSalary(workHistory: EmploymentPeriod[]): number {
  let totalSalary = 0;
  let totalYears = 0;

  for (const period of workHistory) {
    const years = period.endYear - period.startYear + 1;
    totalSalary += period.monthlyGross * years;
    totalYears += years;
  }

  return totalYears > 0 ? totalSalary / totalYears : 0;
}

/**
 * Apply gap penalties to capital
 */
function applyGapPenalties(
  baseCapital: number,
  gapPeriods: EmploymentGapPeriod[],
  avgSalary: number
): number {
  let totalReduction = 0;

  for (const gap of gapPeriods) {
    const yearsFraction = gap.durationMonths / 12;
    const annualGross = avgSalary * 12;
    const penalty = GAP_PENALTIES[gap.kind];
    const reduction = yearsFraction * annualGross * 0.1952 * penalty;
    totalReduction += reduction;
  }

  return Math.max(0, baseCapital - totalReduction);
}

/**
 * Apply retirement program bonuses
 */
function applyRetirementPrograms(
  capital: number,
  inputs: SimulationInputs
): {
  finalCapital: number;
  ppkCapital: number;
  ikzeCapital: number;
} {
  let ppkCapital = 0;
  let ikzeCapital = 0;

  if (inputs.retirementPrograms?.ppk.enabled) {
    ppkCapital = capital * PPK_MULTIPLIER;
  }

  if (inputs.retirementPrograms?.ikze.enabled) {
    ikzeCapital = capital * IKZE_MULTIPLIER;
  }

  return {
    finalCapital: capital + ppkCapital + ikzeCapital,
    ppkCapital,
    ikzeCapital,
  };
}

/**
 * Calculate deferral scenarios (working additional years)
 */
function calculateDeferralScenarios(
  baseCapital: number,
  baseDivisor: number,
  basePension: number,
  baseRetirementAge: number,
  baseRetirementYear: number,
  lastSalary: number,
  contractType: ContractType,
  sex: Sex
) {
  const scenarios = [];
  const years = [1, 2, 3, 4, 5, 6, 7, 8, 9, 10, 11, 12, 13, 14, 15];

  for (const additionalYears of years) {
    const extraCapital =
      additionalYears * lastSalary * 12 * CONTRACT_RATES[contractType];
    const newCapital = baseCapital + extraCapital;
    const newAge = baseRetirementAge + additionalYears;
    const newDivisor = calculateDivisor(newAge, sex);
    const newPension = newCapital / newDivisor;

    scenarios.push({
      additionalYears,
      retirementYear: baseRetirementYear + additionalYears,
      retirementAge: newAge,
      totalCapital: newCapital,
      nominalPension: newPension,
      realPension: newPension, // Simplified: no inflation adjustment
      increaseVsBase: newPension - basePension,
      percentIncrease: ((newPension / basePension - 1) * 100),
    });
  }

  return scenarios;
}

/**
 * Calculate years needed to reach expected pension
 */
function calculateYearsNeeded(
  expectedPension: number,
  basePension: number,
  baseCapital: number,
  baseRetirementAge: number,
  lastSalary: number,
  contractType: ContractType,
  sex: Sex
): number | null {
  if (basePension >= expectedPension) return 0;

  for (let years = 1; years <= 15; years++) {
    const extraCapital = years * lastSalary * 12 * CONTRACT_RATES[contractType];
    const newCapital = baseCapital + extraCapital;
    const newAge = baseRetirementAge + years;
    const newDivisor = calculateDivisor(newAge, sex);
    const newPension = newCapital / newDivisor;

    if (newPension >= expectedPension) {
      return years;
    }
  }

  return null; // Not achievable within 15 years
}

/**
 * Main simplified calculation function
 */
export async function calculateSimulationSimplified(params: {
  inputs: SimulationInputs;
  expectedPension: number;
  modifications?: DashboardModifications;
}): Promise<SimulationResults> {
  const { inputs, expectedPension, modifications } = params;
  const currentYear = new Date().getFullYear();

  // Build work history
  const workHistory = buildWorkHistory(inputs, modifications);
  const avgSalary = calculateAverageSalary(workHistory);
  const lastPeriod = workHistory[workHistory.length - 1];
  const lastSalary = lastPeriod.monthlyGross;
  const contractType = lastPeriod.contractType;

  // Calculate base capital
  let capital = calculateBaseCapital(workHistory);

  // Add initial account balances
  if (inputs.accountBalance) {
    capital += inputs.accountBalance;
  }
  if (inputs.subAccountBalance) {
    capital += inputs.subAccountBalance;
  }

  // Apply gap penalties
  const gapPeriods = modifications?.gapPeriods || [];
  capital = applyGapPenalties(capital, gapPeriods, avgSalary);

  // Store capital before programs (for deferrals)
  const capitalBeforePrograms = capital;

  // Apply retirement programs
  const { finalCapital, ppkCapital, ikzeCapital } = applyRetirementPrograms(
    capital,
    inputs
  );

  // Calculate retirement age
  const retirementAge = inputs.age + (inputs.workEndYear - currentYear);

  // Calculate divisor
  const divisor = calculateDivisor(retirementAge, inputs.sex);

  // Calculate pension
  const nominalPension = finalCapital / divisor;
  const realPension = nominalPension; // Simplified: no inflation adjustment

  // Calculate replacement rate
  const replacementRate = Math.round(
    (nominalPension / lastSalary) * 100 * 10
  ) / 10;

  // Calculate deferral scenarios
  const deferrals = calculateDeferralScenarios(
    capitalBeforePrograms,
    divisor,
    nominalPension,
    retirementAge,
    inputs.workEndYear,
    lastSalary,
    contractType,
    inputs.sex
  );

  // Calculate years needed
  const yearsNeeded = calculateYearsNeeded(
    expectedPension,
    nominalPension,
    capitalBeforePrograms,
    retirementAge,
    lastSalary,
    contractType,
    inputs.sex
  );

  // Calculate total pension with programs
  const totalPensionWithPrograms =
    nominalPension + (ppkCapital + ikzeCapital) / (20 * 12);

  return {
    nominalPension,
    realPension,
    replacementRate,
    avgPensionInRetirementYear: 3500, // Placeholder
    differenceVsAverage: nominalPension - 3500,
    differenceVsExpected: realPension - expectedPension,
    withoutZwolnienieZdrowotne: {
      nominalPension,
      realPension,
      totalCapital: finalCapital,
    },
    withZwolnienieZdrowotne: {
      nominalPension,
      realPension,
      totalCapital: finalCapital,
    },
    zwolnienieZdrwotneDifference: 0,
    deferrals,
    yearsNeeded,
    capitalPath: [], // Simplified: no detailed path
    salaryPath: [], // Simplified: no detailed path
    ppkCapital,
    ikzeCapital,
    totalPensionWithPrograms,
    programsBreakdown: {
      zus: nominalPension,
      ppk: ppkCapital / (20 * 12),
      ikze: ikzeCapital / (20 * 12),
    },
  };
}
