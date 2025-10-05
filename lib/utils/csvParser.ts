/**
 * CSV parser utilities for prognosis data
 *
 * Data source: ZUS - Prognoza wpływów i wydatków Funduszu Emerytalnego do 2080 roku
 * Official document: https://www.zus.pl/documents/10182/167761/Publikacja_Fundusz_Emerytalny_2023-2080.pdf/3c2c41c9-6a50-0574-4634-ee9cfa43f286?t=1674049287158
 *
 * The CSV file contains structured data extracted from the official ZUS forecast document.
 */

export interface PrognosisData {
  year: number;
  unemployment: number;
  inflation: number;
  pensioners_inflation: number;
  wage_growth: number;
  gdp_growth: number;
  contribution_collection: number;
}

/**
 * Parse CSV data from prognosis files
 */
export function parsePrognosisCSV(csvContent: string): PrognosisData[] {
  const lines = csvContent.trim().split("\n");

  // Find the header line (skip comment lines starting with #)
  const headerLineIndex = lines.findIndex(
    (line) => !line.trim().startsWith("#") && line.trim()
  );
  if (headerLineIndex === -1) {
    throw new Error("No header line found in CSV");
  }

  const headers = lines[headerLineIndex].split(";");

  return lines
    .slice(headerLineIndex + 1)
    .map((line) => {
      if (!line.trim() || line.trim().startsWith("#")) return null;

      const values = line.split(";");
      return {
        year: parseInt(values[0]),
        unemployment: parseFloat(values[1].replace(",", ".")) / 100, // Convert % to decimal
        inflation: parseFloat(values[2].replace(",", ".")) / 100, // Convert % to decimal
        pensioners_inflation: parseFloat(values[3].replace(",", ".")) / 100, // Convert % to decimal
        wage_growth: parseFloat(values[4].replace(",", ".")) / 100, // Convert % to decimal
        gdp_growth: parseFloat(values[5].replace(",", ".")) / 100, // Convert % to decimal
        contribution_collection: parseFloat(values[6].replace(",", ".")) / 100, // Convert % to decimal
      };
    })
    .filter((item): item is PrognosisData => item !== null);
}

// Cache for prognoza1.csv data
let cachedPrognoza1Data: PrognosisData[] | null = null;
let cacheTimestamp: number = 0;
const CACHE_DURATION = 5 * 60 * 1000; // 5 minutes in milliseconds

/**
 * Load and parse prognoza1.csv data with caching
 */
export async function loadPrognoza1Data(): Promise<PrognosisData[]> {
  const now = Date.now();

  // Return cached data if it's still valid
  if (cachedPrognoza1Data && now - cacheTimestamp < CACHE_DURATION) {
    return cachedPrognoza1Data;
  }

  try {
    const response = await fetch("/data/prognoza1.csv");
    const csvContent = await response.text();
    const parsedData = parsePrognosisCSV(csvContent);

    // Update cache
    cachedPrognoza1Data = parsedData;
    cacheTimestamp = now;

    return parsedData;
  } catch (error) {
    console.error("Error loading prognoza1.csv:", error);

    // If we have cached data, return it even if it's stale
    if (cachedPrognoza1Data) {
      console.warn("Using stale cached data due to fetch error");
      return cachedPrognoza1Data;
    }

    return [];
  }
}

/**
 * Clear the cache (useful for testing or manual refresh)
 */
export function clearPrognoza1Cache(): void {
  cachedPrognoza1Data = null;
  cacheTimestamp = 0;
}

/**
 * Calculate average pension based on inflation and other factors
 * This is a simplified calculation - in reality it would be more complex
 */
export function calculateAveragePension(
  baseYear: number,
  targetYear: number,
  basePension: number,
  inflationData: PrognosisData[]
): number {
  // Create a map for O(1) lookups
  const wageGrowthMap = new Map<number, number>();
  inflationData.forEach((data) => {
    wageGrowthMap.set(data.year, data.wage_growth);
  });

  // Calculate cumulative wage growth from base year to target year
  let cumulativeGrowth = 1;
  let lastKnownGrowth = 1; // Default fallback

  for (let year = baseYear + 1; year <= targetYear; year++) {
    // Use the wage growth value for this year if available, otherwise use the last known value
    const yearGrowth = wageGrowthMap.get(year);
    if (yearGrowth !== undefined) {
      lastKnownGrowth = yearGrowth;
    }
    cumulativeGrowth *= lastKnownGrowth;
  }

  return basePension * cumulativeGrowth;
}
