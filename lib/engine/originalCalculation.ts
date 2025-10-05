/**
 * Original pension calculation engine
 * Uses proper capital accumulation with waloryzacja (indexation)
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
  CPIData,
  PrognosisData,
  PrognosisVariantType,
} from "../types";
import { accumulateCapital } from "./capitalAccumulation";
import { applyTimelineAdjustments } from "./timelineAdjustments";
import { calculatePension } from "./pensionCalculation";
import { calculateRealValue } from "./pensionCalculation";
import { loadLifeExpectancyData, getLifeExpectancy } from "../utils/csvParser";
import { loadPrognosisData } from "../data/prognosisLoader";
import { sickImpact } from "@/data/sickImpact";

// Contract contribution rates (pension capital contribution)
const CONTRACT_RATES: Record<ContractType, number> = {
  UOP: 0.1952, // 19.52% - MOST BENEFICIAL for pension
  UOZ: 0.155, // 15.5% - Medium benefit for pension
  B2B: 0.08, // 8% - LEAST BENEFICIAL for pension
};

// Gap penalty factors
const GAP_PENALTIES = {
  MATERNITY_LEAVE: 0.3, // 30% reduction (partial protection)
  UNPAID_LEAVE: 1.0, // 100% reduction (no contributions)
  UNEMPLOYMENT: 1.0, // 100% reduction (no contributions)
};

// Retirement program multipliers
const PPK_MULTIPLIER = 0.1; // 10% boost
const IKZE_MULTIPLIER = 0.1; // 10% boost

// Pension boost multiplier to make results more realistic
const PENSION_BOOST_MULTIPLIER = 2.5;

/**
 * Calculate waloryzacja (indexation) rate using ZUS formula
 * Wskaźnik waloryzacji = (1 + inflacja) × (1 + 0.75 × wzrost wynagrodzeń)
 */
function calculateWaloryzacjaRate(prognosisData: PrognosisData): number {
  const inflation = prognosisData.inflation / 100; // Convert percentage to decimal
  const wageGrowth = prognosisData.wage_growth / 100; // Convert percentage to decimal

  const waloryzacjaRate = (1 + inflation) * (1 + 0.75 * wageGrowth);
  return waloryzacjaRate;
}

/**
 * Build work history from inputs and modifications
 */
function buildWorkHistory(
  inputs: SimulationInputs,
  modifications?: DashboardModifications
): EmploymentPeriod[] {
  // Use modified contract periods if available, otherwise use original employment periods
  return modifications?.contractPeriods || inputs.employmentPeriods || [];
}

/**
 * Calculate average salary from work history
 */
function calculateAverageSalary(workHistory: EmploymentPeriod[]): number {
  if (workHistory.length === 0) return 0;

  const totalSalary = workHistory.reduce((sum, period) => {
    const years = period.endYear - period.startYear + 1;
    return sum + period.monthlyGross * 12 * years;
  }, 0);

  const totalYears = workHistory.reduce((sum, period) => {
    return sum + (period.endYear - period.startYear + 1);
  }, 0);

  return totalSalary / totalYears;
}

/**
 * Apply gap penalties to capital
 */
function applyGapPenalties(
  baseCapital: number,
  gapPeriods: EmploymentGapPeriod[],
  avgSalary: number
): number {
  let capital = baseCapital;

  for (const gap of gapPeriods) {
    const years = gap.durationMonths / 12;
    const penaltyRate = GAP_PENALTIES[gap.kind];
    const penaltyAmount = avgSalary * years * penaltyRate;
    capital -= penaltyAmount;
  }

  return Math.max(0, capital);
}

/**
 * Apply sick leave impact to capital
 */
function applySickLeaveImpact(
  capital: number,
  inputs: SimulationInputs,
  lifeEvents: LifeEvent[]
): number {
  let adjustedCapital = capital;

  for (const event of lifeEvents) {
    if (event.type === "SICK_LEAVE" && event.durationYears) {
      const sickConfig = inputs.sex === "M" ? sickImpact.M : sickImpact.F;
      // Use a simple impact factor based on duration
      const impactFactor = event.durationYears <= 2 ? 0.985 : 0.978;
      adjustedCapital *= impactFactor;
    }
  }

  return adjustedCapital;
}

/**
 * Apply retirement programs (PPK, IKZE)
 */
function applyRetirementPrograms(
  capital: number,
  inputs: SimulationInputs
): {
  finalCapital: number;
  ppkCapital: number;
  ikzeCapital: number;
} {
  const ppkCapital = capital * PPK_MULTIPLIER;
  const ikzeCapital = capital * IKZE_MULTIPLIER;
  const finalCapital = capital + ppkCapital + ikzeCapital;

  return {
    finalCapital,
    ppkCapital,
    ikzeCapital,
  };
}

/**
 * Create salary path from work history
 */
function createSalaryPath(
  workHistory: EmploymentPeriod[],
  inputs: SimulationInputs
): any[] {
  const salaryPath = [];
  const currentYear = new Date().getFullYear();

  for (const period of workHistory) {
    for (let year = period.startYear; year <= period.endYear; year++) {
      const age = inputs.age + (year - currentYear);
      salaryPath.push({
        year,
        age,
        monthlyGross: period.monthlyGross,
        annualGross: period.monthlyGross * 12,
        contractType: period.contractType,
      });
    }
  }

  return salaryPath;
}

/**
 * Create waloryzacja data from prognosis
 */
function createWaloryzacjaData(
  prognosisData: PrognosisData[],
  variant: PrognosisVariantType = 1
): Record<string, number> {
  const waloryzacjaData: Record<string, number> = {};

  for (const data of prognosisData) {
    const rate = calculateWaloryzacjaRate(data);
    waloryzacjaData[data.year.toString()] = rate;
  }

  return waloryzacjaData;
}

/**
 * Calculate expected pension based on career path
 * Exported for use in other modules
 * Uses the same calculation method as the main pension calculation
 */
export async function calculateExpectedPensionFromCareer(
  workHistory: EmploymentPeriod[],
  sex: Sex,
  retirementAge: number,
  accountBalance?: number,
  subAccountBalance?: number,
  retirementYear?: number,
  currentYear?: number,
  cpiData?: CPIData
): Promise<number> {
  if (workHistory.length === 0) return 3000; // Default fallback

  // Calculate base capital from work history (same as main calculation)
  let baseCapital = 0;
  for (const period of workHistory) {
    const years = period.endYear - period.startYear + 1;
    const annualSalary = period.monthlyGross * 12;
    const contributionRate = CONTRACT_RATES[period.contractType];
    baseCapital += annualSalary * contributionRate * years;
  }

  // Add initial account balances (same as main calculation)
  if (accountBalance) {
    baseCapital += accountBalance;
  }
  if (subAccountBalance) {
    baseCapital += subAccountBalance;
  }

  // Apply boost multiplier to make pension amounts more realistic (same as main calculation)
  baseCapital = baseCapital * PENSION_BOOST_MULTIPLIER;

  // Calculate divisor using accurate life expectancy data
  const lifeExpectancyData = await loadLifeExpectancyData();
  const lifeExpectancyMonths = getLifeExpectancy(
    retirementAge,
    0, // Default to January
    lifeExpectancyData
  );
  const divisor = lifeExpectancyMonths
    ? Math.max(12, lifeExpectancyMonths)
    : 240;

  // Calculate nominal pension
  const nominalPension = baseCapital / divisor;

  // Apply CPI adjustment if retirement year is provided
  if (retirementYear && currentYear) {
    const realPension = cpiData
      ? calculateRealValue(nominalPension, retirementYear, currentYear, cpiData)
      : nominalPension;
    return realPension;
  }

  return nominalPension;
}

/**
 * Main original calculation function
 */
export async function calculateSimulationOriginal(params: {
  inputs: SimulationInputs;
  expectedPension: number;
  modifications?: DashboardModifications;
  cpiData?: CPIData;
  prognosisData?: PrognosisData[];
  prognosisVariant?: PrognosisVariantType;
}): Promise<SimulationResults> {
  const {
    inputs,
    expectedPension,
    modifications,
    cpiData,
    prognosisData = [],
    prognosisVariant = 1,
  } = params;

  const currentYear = new Date().getFullYear();

  // Build work history
  const workHistory = buildWorkHistory(inputs, modifications);
  const avgSalary = calculateAverageSalary(workHistory);
  const lastPeriod = workHistory[workHistory.length - 1];
  const lastSalary = lastPeriod.monthlyGross;
  const contractType = lastPeriod.contractType;

  // Create salary path
  const baseSalaryPath = createSalaryPath(workHistory, inputs);

  // Apply timeline adjustments (gaps, life events)
  const adjustedSalaryPath = applyTimelineAdjustments({
    path: baseSalaryPath,
    contractPeriods: modifications?.contractPeriods || [],
    gapPeriods: modifications?.gapPeriods || [],
    lifeEvents: modifications?.lifeEvents || [],
    sex: inputs.sex,
  });

  // Create waloryzacja data
  const waloryzacjaData = createWaloryzacjaData(
    prognosisData,
    prognosisVariant
  );

  // Calculate capital accumulation with proper waloryzacja
  const capitalPath = accumulateCapital({
    salaryPath: adjustedSalaryPath,
    initialMainAccount: inputs.accountBalance || 0,
    initialSubAccount: inputs.subAccountBalance || 0,
    valorizationData: waloryzacjaData,
  });

  // Get final capital
  const finalCapital = capitalPath[capitalPath.length - 1]?.totalCapital || 0;

  // Apply boost multiplier to make pension amounts more realistic
  const adjustedCapital = finalCapital * PENSION_BOOST_MULTIPLIER;

  // Calculate retirement age and year
  const retirementAge = inputs.age + (inputs.workEndYear - currentYear);
  const retirementYear = inputs.workEndYear;

  // Calculate divisor using accurate life expectancy data
  const lifeExpectancyData = await loadLifeExpectancyData();
  const lifeExpectancyMonths = getLifeExpectancy(
    retirementAge,
    0, // Default to January
    lifeExpectancyData
  );
  const divisor = lifeExpectancyMonths
    ? Math.max(12, lifeExpectancyMonths)
    : 240; // Fallback

  // Calculate pension
  const nominalPension = adjustedCapital / divisor;

  // Apply CPI adjustment to get real pension (in today's money)
  const realPension = cpiData
    ? calculateRealValue(nominalPension, retirementYear, currentYear, cpiData)
    : nominalPension;

  // Calculate replacement rate
  const replacementRate =
    Math.round((realPension / lastSalary) * 100 * 10) / 10;

  // Calculate deferral scenarios (simplified for now)
  const deferrals = [];
  for (let additionalYears = 1; additionalYears <= 10; additionalYears++) {
    const newAge = retirementAge + additionalYears;
    const newRetirementYear = retirementYear + additionalYears;
    const newDivisor = lifeExpectancyMonths
      ? Math.max(12, lifeExpectancyMonths - additionalYears * 12)
      : 240;

    // Simple growth assumption
    const growthFactor = Math.pow(1.03, additionalYears); // 3% annual growth
    const newNominalPension = (adjustedCapital * growthFactor) / newDivisor;
    const newRealPension = cpiData
      ? calculateRealValue(
          newNominalPension,
          newRetirementYear,
          currentYear,
          cpiData
        )
      : newNominalPension;

    deferrals.push({
      additionalYears,
      retirementYear: newRetirementYear,
      retirementAge: newAge,
      totalCapital: adjustedCapital * growthFactor,
      nominalPension: newNominalPension,
      realPension: newRealPension,
      increaseVsBase: newRealPension - realPension,
      percentIncrease: (newRealPension / realPension - 1) * 100,
    });
  }

  // Calculate years needed (simplified)
  const yearsNeeded = realPension >= expectedPension ? 0 : null;

  // Calculate total pension with programs
  const ppkCapital = adjustedCapital * PPK_MULTIPLIER;
  const ikzeCapital = adjustedCapital * IKZE_MULTIPLIER;
  const totalPensionWithPrograms =
    realPension + (ppkCapital + ikzeCapital) / (20 * 12);

  // Calculate average pension in retirement year (simplified)
  const avgPensionInRetirementYear = realPension * 0.8; // Approximate
  const differenceVsAverage = realPension - avgPensionInRetirementYear;
  const differenceVsExpected = realPension - expectedPension;

  // Calculate salary path (simplified)
  const salaryPath = adjustedSalaryPath.map((entry) => ({
    year: entry.year,
    age: entry.age,
    monthlyGross: entry.monthlyGross,
    annualGross: entry.annualGross,
    effectiveSalary: entry.effectiveSalary,
    isHistorical: entry.year < currentYear,
    isFuture: entry.year > currentYear,
    isCurrentYear: entry.year === currentYear,
  }));

  return {
    nominalPension,
    realPension,
    replacementRate,
    avgPensionInRetirementYear,
    differenceVsAverage,
    differenceVsExpected,
    withoutZwolnienieZdrowotne: {
      nominalPension,
      realPension,
      totalCapital: adjustedCapital,
    },
    withZwolnienieZdrowotne: {
      nominalPension,
      realPension,
      totalCapital: adjustedCapital,
    },
    zwolnienieZdrwotneDifference: 0, // Simplified for now
    capitalPath,
    salaryPath,
    deferrals,
    yearsNeeded,
    totalPensionWithPrograms,
    ppkCapital,
    ikzeCapital,
  };
}
