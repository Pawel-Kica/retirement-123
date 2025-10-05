/**
 * Pension calculation
 * Calculates nominal and real pension values
 */

import { Sex, CPIData, LifeDurationData } from "../types";

/**
 * Calculate monthly pension from total capital using life duration data
 * Pension = Total Capital / Life Expectancy in Months
 */
export function calculatePension(
  totalCapital: number,
  retirementAge: number,
  sex: Sex,
  lifeDuration: LifeDurationData
): number {
  // Get life expectancy in months for this age
  // For simplicity, we'll use average of M and F data from lifeDuration
  // Note: The lifeDuration data doesn't distinguish by sex in the current implementation
  const ageData = lifeDuration[retirementAge.toString()];

  let divisor: number;

  if (!ageData || typeof ageData !== 'object' || '_metadata' in ageData) {
    // If no data found for this age, find the closest available age
    const availableAges = Object.keys(lifeDuration)
      .filter((key) => !key.startsWith('_'))
      .map((age) => parseInt(age))
      .filter((age) => !isNaN(age))
      .sort((a, b) => b - a);

    if (availableAges.length === 0) {
      throw new Error(`Brak danych długości życia`);
    }

    // Find closest age
    const closestAge = availableAges.reduce((prev, curr) =>
      Math.abs(curr - retirementAge) < Math.abs(prev - retirementAge) ? curr : prev
    );

    const closestAgeData = lifeDuration[closestAge.toString()];
    if (!closestAgeData || typeof closestAgeData !== 'object') {
      throw new Error(`Brak danych długości życia dla wieku ${closestAge}`);
    }

    // Use month 0 as default
    divisor = (closestAgeData as Record<string, number>)['0'];

    // Adjust for age difference
    if (retirementAge > closestAge) {
      const yearsBeyond = retirementAge - closestAge;
      divisor = Math.max(12, divisor - yearsBeyond * 12); // Minimum 1 year
    } else if (retirementAge < closestAge) {
      const yearsBefore = closestAge - retirementAge;
      divisor = divisor + yearsBefore * 12;
    }
  } else {
    // Use month 0 as default
    divisor = (ageData as Record<string, number>)['0'];
  }

  if (!divisor) {
    throw new Error(`Brak dzielnika dla wieku ${retirementAge}`);
  }

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
