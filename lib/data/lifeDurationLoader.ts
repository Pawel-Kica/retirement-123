/**
 * Life Duration Data Loader
 * Loads and provides lookup for remaining life expectancy from life-duration.csv
 * 
 * CSV Format:
 * - First column: age (years, from 30 to 90)
 * - Columns 0-11: months (0-11 months into that year)
 * - Values: remaining life duration in MONTHS (using comma as decimal separator)
 */

export interface LifeDurationData {
    [age: number]: {
        [month: number]: number; // remaining months of life
    };
}

/**
 * Parse the life-duration.csv data
 * Note: Values use comma as decimal separator (Polish format)
 */
export function parseLifeDurationCSV(csvContent: string): LifeDurationData {
    const lines = csvContent.trim().split('\n');
    const data: LifeDurationData = {};

    // Skip header line
    for (let i = 1; i < lines.length; i++) {
        const line = lines[i];
        const parts = line.split(';');

        if (parts.length < 2) continue;

        const age = parseInt(parts[0], 10);
        if (isNaN(age)) continue;

        data[age] = {};

        // Parse months 0-11 (columns 1-12)
        for (let month = 0; month < 12 && month + 1 < parts.length; month++) {
            const valueStr = parts[month + 1];
            // Convert Polish decimal format (comma) to JavaScript (dot)
            const value = parseFloat(valueStr.replace(',', '.'));
            if (!isNaN(value)) {
                data[age][month] = value;
            }
        }
    }

    return data;
}

/**
 * Get remaining life duration in months for a specific age and month
 * 
 * @param data - Life duration data
 * @param age - Age in years (30-90)
 * @param month - Month within the year (0-11, optional, defaults to 0)
 * @returns Remaining life expectancy in months, or null if not found
 */
export function getRemainingLifeMonths(
    data: LifeDurationData,
    age: number,
    month: number = 0
): number | null {
    // Clamp age to available range
    if (age < 30) age = 30;
    if (age > 90) age = 90;

    // Clamp month to valid range
    if (month < 0) month = 0;
    if (month > 11) month = 11;

    const ageData = data[age];
    if (!ageData) return null;

    const months = ageData[month];
    if (months === undefined) return null;

    return months;
}

/**
 * Get remaining life duration in years (decimal) for a specific age
 * 
 * @param data - Life duration data
 * @param age - Age in years (30-90)
 * @param month - Month within the year (0-11, optional, defaults to 0)
 * @returns Remaining life expectancy in years (decimal), or null if not found
 */
export function getRemainingLifeYears(
    data: LifeDurationData,
    age: number,
    month: number = 0
): number | null {
    const months = getRemainingLifeMonths(data, age, month);
    if (months === null) return null;

    return months / 12;
}

/**
 * Get expected death age for a person
 * 
 * @param data - Life duration data
 * @param currentAge - Current age in years
 * @param currentMonth - Current month within the year (0-11, optional)
 * @returns Expected age at death (decimal), or null if not found
 */
export function getExpectedDeathAge(
    data: LifeDurationData,
    currentAge: number,
    currentMonth: number = 0
): number | null {
    const remainingYears = getRemainingLifeYears(data, currentAge, currentMonth);
    if (remainingYears === null) return null;

    return currentAge + remainingYears;
}

/**
 * Calculate average annuity divisor based on remaining life expectancy
 * This can be used as an alternative or supplement to the existing annuity divisor table
 * 
 * The divisor represents how the pension capital should be divided for monthly payments
 * Formula: months_of_remaining_life
 * 
 * @param data - Life duration data
 * @param age - Retirement age in years
 * @returns Calculated annuity divisor
 */
export function calculateAnnuityDivisorFromLifeData(
    data: LifeDurationData,
    age: number
): number | null {
    const remainingMonths = getRemainingLifeMonths(data, age, 0);
    if (remainingMonths === null) return null;

    // The divisor is simply the number of months of remaining life
    // Capital / Divisor = Monthly Pension
    return remainingMonths;
}

/**
 * Get life duration statistics for a given age
 */
export function getLifeDurationStats(
    data: LifeDurationData,
    age: number
): {
    age: number;
    remainingYears: number;
    remainingMonths: number;
    expectedDeathAge: number;
    annuityDivisor: number;
} | null {
    const remainingMonths = getRemainingLifeMonths(data, age, 0);
    if (remainingMonths === null) return null;

    const remainingYears = remainingMonths / 12;
    const expectedDeathAge = age + remainingYears;
    const annuityDivisor = remainingMonths;

    return {
        age,
        remainingYears,
        remainingMonths,
        expectedDeathAge,
        annuityDivisor,
    };
}

