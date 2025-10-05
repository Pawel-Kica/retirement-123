/**
 * CSV loader for prognosis data
 */

import {
  PrognosisVariant,
  PrognosisVariantType,
  PrognosisData,
} from "../types";

/**
 * Parse CSV data from prognosis files
 */
function parsePrognosisCSV(csvContent: string): PrognosisData[] {
  const lines = csvContent.trim().split("\n");

  if (lines.length < 2) {
    console.warn("CSV content has insufficient lines");
    return [];
  }

  const headers = lines[0].split(";");
  console.log("CSV headers:", headers);

  return lines
    .slice(1)
    .map((line, index) => {
      if (!line.trim()) return null;

      const values = line.split(";");

      // Check if we have enough columns (at least 7: year + 6 data columns)
      if (values.length < 7) {
        console.warn(
          `Skipping line ${index + 2}: insufficient columns (${
            values.length
          } < 7)`,
          line
        );
        return null;
      }

      try {
        return {
          year: parseInt(values[0]),
          unemployment: parseFloat(values[1]?.replace(",", ".") || "0"),
          inflation: parseFloat(values[2]?.replace(",", ".") || "0"),
          pensioners_inflation: parseFloat(values[3]?.replace(",", ".") || "0"),
          wage_growth: parseFloat(values[4]?.replace(",", ".") || "0"),
          gdp_growth: parseFloat(values[5]?.replace(",", ".") || "0"),
          contribution_collection: parseFloat(
            values[6]?.replace(",", ".") || "0"
          ),
        };
      } catch (error) {
        console.warn(`Error parsing line ${index + 2}:`, line, error);
        return null;
      }
    })
    .filter(
      (item: PrognosisData | null): item is PrognosisData => item !== null
    );
}

/**
 * Load prognosis data from CSV files
 */
export async function loadPrognosisData(): Promise<
  Record<PrognosisVariantType, PrognosisVariant>
> {
  try {
    console.log("Loading prognosis data...");

    const [prognoza1, prognoza2, prognoza3] = await Promise.all([
      fetch("/data/prognoza1.csv").then((res) => {
        if (!res.ok)
          throw new Error(`Failed to fetch prognoza1.csv: ${res.status}`);
        return res.text();
      }),
      fetch("/data/prognoza2.csv").then((res) => {
        if (!res.ok)
          throw new Error(`Failed to fetch prognoza2.csv: ${res.status}`);
        return res.text();
      }),
      fetch("/data/prognoza3.csv").then((res) => {
        if (!res.ok)
          throw new Error(`Failed to fetch prognoza3.csv: ${res.status}`);
        return res.text();
      }),
    ]);

    const result = {
      1: {
        _metadata: {
          name: "Pośredni",
          description: "Wariant pośredni - umiarkowane założenia ekonomiczne",
          variant: 1 as PrognosisVariantType,
        },
        data: parsePrognosisCSV(prognoza1),
      },
      2: {
        _metadata: {
          name: "Pesymistyczny",
          description:
            "Wariant pesymistyczny - konserwatywne założenia ekonomiczne",
          variant: 2 as PrognosisVariantType,
        },
        data: parsePrognosisCSV(prognoza2),
      },
      3: {
        _metadata: {
          name: "Optymistyczny",
          description:
            "Wariant optymistyczny - pozytywne założenia ekonomiczne",
          variant: 3 as PrognosisVariantType,
        },
        data: parsePrognosisCSV(prognoza3),
      },
    };

    console.log("Successfully loaded prognosis data");
    return result;
  } catch (error) {
    console.error("Error loading prognosis data:", error);

    // Return empty data structure as fallback
    return {
      1: {
        _metadata: {
          name: "Pośredni",
          description: "Wariant pośredni - umiarkowane założenia ekonomiczne",
          variant: 1 as PrognosisVariantType,
        },
        data: [],
      },
      2: {
        _metadata: {
          name: "Pesymistyczny",
          description:
            "Wariant pesymistyczny - konserwatywne założenia ekonomiczne",
          variant: 2 as PrognosisVariantType,
        },
        data: [],
      },
      3: {
        _metadata: {
          name: "Optymistyczny",
          description:
            "Wariant optymistyczny - pozytywne założenia ekonomiczne",
          variant: 3 as PrognosisVariantType,
        },
        data: [],
      },
    };
  }
}

/**
 * Get prognosis data for a specific year and variant
 */
export function getPrognosisForYear(
  variants: Record<PrognosisVariantType, PrognosisVariant>,
  variant: PrognosisVariantType,
  year: number
): PrognosisData | null {
  const variantData = variants[variant];
  if (!variantData) return null;

  return variantData.data.find((item) => item.year === year) || null;
}

/**
 * Get wage growth rate for a specific year and variant
 */
export function getWageGrowthRate(
  variants: Record<PrognosisVariantType, PrognosisVariant>,
  variant: PrognosisVariantType,
  year: number
): number | null {
  const prognosis = getPrognosisForYear(variants, variant, year);
  if (!prognosis) return null;

  // Convert percentage to multiplier (e.g., 103.4% -> 1.034)
  return prognosis.wage_growth / 100;
}

/**
 * Get inflation rate for a specific year and variant
 */
export function getInflationRate(
  variants: Record<PrognosisVariantType, PrognosisVariant>,
  variant: PrognosisVariantType,
  year: number
): number | null {
  const prognosis = getPrognosisForYear(variants, variant, year);
  if (!prognosis) return null;

  // Convert percentage to multiplier (e.g., 102.5% -> 1.025)
  return prognosis.inflation / 100;
}
