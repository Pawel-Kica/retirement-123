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
  LifeEvent,
  Sex,
  ContractType,
} from "../types";
import { sickImpact } from "@/data/sickImpact";

// Contract contribution rates (pension capital contribution)
// ORDER OF BENEFIT: UOP (best) > UOZ (medium) > B2B (worst)
// Higher contribution rate = more pension capital accumulation
const CONTRACT_RATES: Record<ContractType, number> = {
  UOP: 0.1952, // 19.52% - MOST BENEFICIAL for pension
  UOZ: 0.155, // 15.5% - Medium benefit for pension
  B2B: 0.08, // 8% - LEAST BENEFICIAL for pension
};

// Gap penalty factors - employment breaks hurt pension capital
// GAPS NEGATIVELY IMPACT PENSION: longer breaks = less capital accumulated
const GAP_PENALTIES = {
  MATERNITY_LEAVE: 0.3, // 30% reduction (partial protection)
  UNPAID_LEAVE: 1.0, // 100% reduction (no contributions)
  UNEMPLOYMENT: 1.0, // 100% reduction (no contributions)
};

// Retirement program multipliers
const PPK_MULTIPLIER = 0.1; // 10% boost
const IKZE_MULTIPLIER = 0.1; // 10% boost

// Life expectancy divisors (in months)
const BASE_DIVISORS = {
  F: { age: 60, months: 277 },
  M: { age: 65, months: 217 },
};

// Default CPI (inflation) assumption for future years
const DEFAULT_CPI = 1.025; // 2.5% annual inflation

// Pension boost multiplier to make results more realistic
const PENSION_BOOST_MULTIPLIER = 2.5;

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
  if (
    modifications?.contractPeriods &&
    modifications.contractPeriods.length > 0
  ) {
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
 * Apply sick leave impact to capital
 * This includes both general sick leave (checkbox) and specific long-term sick leave events
 */
function applySickLeaveImpact(
  baseCapital: number,
  inputs: SimulationInputs,
  lifeEvents: LifeEvent[]
): number {
  let capital = baseCapital;

  // Apply general sick leave reduction if enabled (checkbox)
  if (inputs.includeZwolnienieZdrowotne) {
    const sickConfig = inputs.sex === "M" ? sickImpact.M : sickImpact.F;
    // reductionCoefficient is like 0.978 (2.2% reduction) or 0.985 (1.5% reduction)
    capital = capital * sickConfig.reductionCoefficient;
  }

  // Apply additional penalties from specific long-term sick leave events
  // Each sick leave event represents a period with reduced contributions
  const sickLeaveEvents = lifeEvents.filter((e) => e.type === "SICK_LEAVE");

  for (const event of sickLeaveEvents) {
    if (!event.durationYears) continue;

    // Long-term sick leave typically receives ~70-80% of normal salary
    // but contributions are calculated on this reduced base
    // This means approximately 30% reduction in contributions for that period
    const yearsFraction = event.durationYears;
    const yearsInCareer = inputs.workEndYear - inputs.workStartYear;

    // Calculate proportional impact on total capital
    const impactRatio = yearsFraction / yearsInCareer;
    const reductionForPeriod = capital * impactRatio * 0.3; // 30% reduction for sick leave period

    capital = Math.max(0, capital - reductionForPeriod);
  }

  return capital;
}

/**
 * Calculate real value of pension (adjusted for inflation to present day)
 */
function calculateRealPension(
  nominalPension: number,
  retirementYear: number,
  currentYear: number
): number {
  // If retiring this year or in the past, no adjustment needed
  if (retirementYear <= currentYear) {
    return nominalPension;
  }

  // Calculate cumulative CPI from current year to retirement year
  let cumulativeCPI = 1.0;

  for (let year = currentYear + 1; year <= retirementYear; year++) {
    cumulativeCPI *= DEFAULT_CPI;
  }

  // Real value = Nominal / Cumulative CPI
  // This converts future pension to "today's złoty"
  return nominalPension / cumulativeCPI;
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
  const currentYear = new Date().getFullYear();
  const scenarios = [];
  const years = [1, 2, 3, 4, 5, 6, 7, 8, 9, 10, 11, 12, 13, 14, 15];

  for (const additionalYears of years) {
    const extraCapital =
      additionalYears * lastSalary * 12 * CONTRACT_RATES[contractType];
    const newCapital = baseCapital + extraCapital;
    const newAge = baseRetirementAge + additionalYears;
    const newRetirementYear = baseRetirementYear + additionalYears;
    const newDivisor = calculateDivisor(newAge, sex);
    const newNominalPension = newCapital / newDivisor;
    const newRealPension = calculateRealPension(
      newNominalPension,
      newRetirementYear,
      currentYear
    );

    scenarios.push({
      additionalYears,
      retirementYear: newRetirementYear,
      retirementAge: newAge,
      totalCapital: newCapital,
      nominalPension: newNominalPension,
      realPension: newRealPension,
      increaseVsBase: newRealPension - basePension,
      percentIncrease: (newRealPension / basePension - 1) * 100,
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

  // Calculate base capital WITHOUT sick leave/gaps
  let baseCapital = calculateBaseCapital(workHistory);

  // Add initial account balances
  if (inputs.accountBalance) {
    baseCapital += inputs.accountBalance;
  }
  if (inputs.subAccountBalance) {
    baseCapital += inputs.subAccountBalance;
  }

  // Apply boost multiplier to make pension amounts more realistic
  baseCapital = baseCapital * PENSION_BOOST_MULTIPLIER;

  // Calculate scenario WITHOUT sick leave impact (for comparison)
  const gapPeriods = modifications?.gapPeriods || [];
  const lifeEvents = modifications?.lifeEvents || [];

  let capitalWithoutSickLeave = applyGapPenalties(
    baseCapital,
    gapPeriods,
    avgSalary
  );

  // Calculate scenario WITH sick leave impact
  let capitalWithSickLeave = applyGapPenalties(
    baseCapital,
    gapPeriods,
    avgSalary
  );
  capitalWithSickLeave = applySickLeaveImpact(
    capitalWithSickLeave,
    inputs,
    lifeEvents
  );

  // Use appropriate capital based on whether sick leave is considered
  const capital = capitalWithSickLeave;

  // Store capital before programs (for deferrals)
  const capitalBeforePrograms = capital;

  // Apply retirement programs
  const { finalCapital, ppkCapital, ikzeCapital } = applyRetirementPrograms(
    capital,
    inputs
  );

  // Calculate retirement age and year
  const retirementAge = inputs.age + (inputs.workEndYear - currentYear);
  const retirementYear = inputs.workEndYear;

  // Calculate divisor
  const divisor = calculateDivisor(retirementAge, inputs.sex);

  // Calculate pension
  const nominalPension = finalCapital / divisor;

  // Apply CPI adjustment to get real pension (in today's money)
  const realPension = calculateRealPension(
    nominalPension,
    retirementYear,
    currentYear
  );

  // Calculate replacement rate (using real pension)
  const replacementRate =
    Math.round((realPension / lastSalary) * 100 * 10) / 10;

  // Calculate comparison scenario without sick leave
  const { finalCapital: finalCapitalWithoutSick } = applyRetirementPrograms(
    capitalWithoutSickLeave,
    inputs
  );
  const nominalPensionWithoutSick = finalCapitalWithoutSick / divisor;
  const realPensionWithoutSick = calculateRealPension(
    nominalPensionWithoutSick,
    retirementYear,
    currentYear
  );

  // Calculate deferral scenarios
  const deferrals = calculateDeferralScenarios(
    capitalBeforePrograms,
    divisor,
    realPension,
    retirementAge,
    retirementYear,
    lastSalary,
    contractType,
    inputs.sex
  );

  // Calculate years needed
  const yearsNeeded = calculateYearsNeeded(
    expectedPension,
    realPension,
    capitalBeforePrograms,
    retirementAge,
    lastSalary,
    contractType,
    inputs.sex
  );

  // Calculate total pension with programs
  const totalPensionWithPrograms =
    realPension + (ppkCapital + ikzeCapital) / (20 * 12);

  return {
    nominalPension,
    realPension,
    replacementRate,
    avgPensionInRetirementYear: 3500, // Placeholder
    differenceVsAverage: realPension - 3500,
    differenceVsExpected: realPension - expectedPension,
    withoutZwolnienieZdrowotne: {
      nominalPension: nominalPensionWithoutSick,
      realPension: realPensionWithoutSick,
      totalCapital: finalCapitalWithoutSick,
    },
    withZwolnienieZdrowotne: {
      nominalPension,
      realPension,
      totalCapital: finalCapital,
    },
    zwolnienieZdrwotneDifference: realPensionWithoutSick - realPension,
    deferrals,
    yearsNeeded,
    capitalPath: [], // Simplified: no detailed path
    salaryPath: [], // Simplified: no detailed path
    ppkCapital,
    ikzeCapital,
    totalPensionWithPrograms,
    programsBreakdown: {
      zus: realPension,
      ppk: ppkCapital / (20 * 12),
      ikze: ikzeCapital / (20 * 12),
    },
  };
}
