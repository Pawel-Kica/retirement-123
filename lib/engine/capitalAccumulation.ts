/**
 * Capital accumulation calculation
 * Tracks growth of retirement capital (main account and sub-account)
 */

import { CapitalEntry, SalaryPathEntry, WageGrowthData } from "../types";

// Polish pension system constants
const CONTRIBUTION_RATE = 0.1952; // 19.52%
const MAIN_ACCOUNT_SPLIT = 0.7616; // 76.16% goes to main account
const SUB_ACCOUNT_SPLIT = 0.2384; // 23.84% goes to sub-account

export interface AccumulateCapitalParams {
  salaryPath: SalaryPathEntry[];
  initialMainAccount?: number;
  initialSubAccount?: number;
  valorizationData: Record<string, number>; // Waloryzacja rates by year
}

/**
 * Find the most recent available valorization rate for a given year
 * If the exact year is not available, use the first previous available data
 */
function findValorizationRate(
  year: number,
  valorizationData: Record<string, number>
): number {
  // First try to get the exact year
  if (valorizationData[year.toString()]) {
    return valorizationData[year.toString()];
  }

  // If not found, look for the most recent previous year
  const availableYears = Object.keys(valorizationData)
    .map(Number)
    .filter((y) => y < year)
    .sort((a, b) => b - a); // Sort descending to get most recent first

  if (availableYears.length > 0) {
    const mostRecentYear = availableYears[0];
    console.warn(
      `Brak danych waloryzacji dla roku ${year}, używam danych z roku ${mostRecentYear} - ${
        valorizationData[mostRecentYear.toString()]
      }`
    );
    return valorizationData[mostRecentYear.toString()];
  }

  // If no previous data available, use 1.0 (no valorization)
  console.warn(
    `Brak danych waloryzacji dla roku ${year} i poprzednich lat, używam 1.0`
  );
  return 1.0;
}

/**
 * Accumulate capital over time with annual valorization
 * Returns detailed yearly breakdown
 */
export function accumulateCapital(
  params: AccumulateCapitalParams
): CapitalEntry[] {
  const {
    salaryPath,
    initialMainAccount = 0,
    initialSubAccount = 0,
    valorizationData,
  } = params;

  let mainAccount = initialMainAccount;
  let subAccount = initialSubAccount;
  const capitalPath: CapitalEntry[] = [];

  for (const entry of salaryPath) {
    const mainAccountBefore = mainAccount;
    const subAccountBefore = subAccount;

    // Step 1: Apply valorization to existing capital
    // In Polish system, valorization uses waloryzacja formula: (1 + inflacja) × (1 + 0.75 × wzrost wynagrodzeń)
    const valorizationRate = findValorizationRate(entry.year, valorizationData);

    mainAccount = mainAccount * valorizationRate;
    subAccount = subAccount * valorizationRate;

    const valorizationGain =
      mainAccount - mainAccountBefore + (subAccount - subAccountBefore);

    // Step 2: Add this year's contributions
    // Use effectiveSalary if zwolnienie zdrowotne was applied, otherwise use annual gross
    const baseSalary = entry.effectiveSalary
      ? entry.effectiveSalary * 12
      : entry.annualGross;

    const annualContributions = baseSalary * CONTRIBUTION_RATE;
    const mainAccountContribution = annualContributions * MAIN_ACCOUNT_SPLIT;
    const subAccountContribution = annualContributions * SUB_ACCOUNT_SPLIT;

    mainAccount += mainAccountContribution;
    subAccount += subAccountContribution;

    capitalPath.push({
      year: entry.year,
      age: entry.age,
      salary: entry.monthlyGross,
      contributions: annualContributions,
      valorization: valorizationGain,
      mainAccountBefore,
      mainAccountAfter: mainAccount,
      subAccountBefore,
      subAccountAfter: subAccount,
      totalCapital: mainAccount + subAccount,
    });
  }

  return capitalPath;
}

/**
 * Get final capital at retirement
 */
export function getFinalCapital(capitalPath: CapitalEntry[]): {
  mainAccount: number;
  subAccount: number;
  total: number;
} {
  const lastEntry = capitalPath[capitalPath.length - 1];
  return {
    mainAccount: lastEntry.mainAccountAfter,
    subAccount: lastEntry.subAccountAfter,
    total: lastEntry.totalCapital,
  };
}
