/**
 * Pension calculation
 * Calculates nominal and real pension values
 */

import { Sex, CPIData } from "../types";

/**
 * Calculate monthly pension from total capital using statistical life expectancy
 * Pension = Total Capital / Life Expectancy in Months
 *
 * Uses statistical averages:
 * - Base life expectancy at 60 (women): ~277 months (23 years)
 * - Base life expectancy at 65 (men): ~217 months (18 years)
 * - Adjusts by approximately 12 months per year of age difference
 */
export function calculatePension(
  totalCapital: number,
  retirementAge: number,
  sex: Sex
): number {
  // Base divisors from Polish statistical data
  const baseDivisors = {
    F: { age: 60, months: 277 }, // Women at 60
    M: { age: 65, months: 217 }, // Men at 65
  };

  const base = baseDivisors[sex];
  const ageDifference = retirementAge - base.age;

  // Adjust divisor: subtract ~12 months per year of age
  // (older retirement = shorter remaining life)
  let divisor = base.months - (ageDifference * 12);

  // Ensure minimum divisor of 12 months (1 year)
  divisor = Math.max(12, divisor);

  // Monthly pension = Total Capital / Divisor
  const monthlyPension = totalCapital / divisor;

  return monthlyPension;
}

/**
 * Calculate real value of pension (in today's money)
 * Adjusts nominal pension by cumulative inflation
 */
export function calculateRealValue(
  nominalPension: number,
  retirementYear: number,
  currentYear: number,
  cpiData: CPIData
): number {
  // If retiring this year or in the past, no adjustment needed
  if (retirementYear <= currentYear) {
    return nominalPension;
  }

  // Default inflation assumption for years beyond available data
  const DEFAULT_INFLATION = 1.025; // 2.5% annual inflation assumption

  // Find the last available year in CPI data
  const availableYears = Object.keys(cpiData)
    .filter((key) => !key.startsWith("_")) // Skip metadata
    .map((year) => parseInt(year))
    .filter((year) => !isNaN(year))
    .sort((a, b) => b - a);

  const lastAvailableYear = availableYears.length > 0 ? availableYears[0] : currentYear;

  // Calculate cumulative CPI from current year to retirement year
  let cumulativeCPI = 1.0;

  for (let year = currentYear + 1; year <= retirementYear; year++) {
    let cpi: number;

    // Use actual CPI data if available, otherwise use default assumption
    if (year <= lastAvailableYear) {
      const cpiValue = cpiData[year.toString()];
      cpi = typeof cpiValue === "number" ? cpiValue : DEFAULT_INFLATION;
    } else {
      cpi = DEFAULT_INFLATION;
    }

    cumulativeCPI *= cpi;
  }

  // Real value = Nominal / Cumulative CPI
  // This converts future pension to "today's złoty"
  const realPension = nominalPension / cumulativeCPI;

  return realPension;
}

/**
 * Calculate replacement rate
 * Replacement rate = (pension / final salary) * 100
 */
export function calculateReplacementRate(
  nominalPension: number,
  finalSalary: number
): number {
  const rate = (nominalPension / finalSalary) * 100;
  return Math.round(rate * 10) / 10; // Round to 1 decimal
}

/**
 * Get replacement rate description in Polish
 */
export function getReplacementRateDescription(rate: number): string {
  if (rate >= 70) return "Doskonała stopa zastąpienia";
  if (rate >= 50) return "Dobra stopa zastąpienia";
  if (rate >= 40) return "Przeciętna stopa zastąpienia";
  if (rate >= 30) return "Niska stopa zastąpienia";
  return "Bardzo niska stopa zastąpienia";
}
