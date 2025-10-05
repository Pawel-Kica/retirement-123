import {
  loadPrognoza1Data,
  calculateAveragePension,
} from "@/lib/utils/csvParser";

/**
 * Get average pension data dynamically from prognoza1.csv
 * Only returns years that exist in the CSV file
 */
export async function getAveragePensionByYear() {
  const prognosisData = await loadPrognoza1Data();

  const pensionData: Record<string, number> = {};

  // Base pension for 2024 (from ZUS data)
  const basePension2024 = 3855.23;

  // Add data from prognoza1.csv (2022 onwards)
  prognosisData.forEach((data) => {
    if (data.year >= 2022) {
      // Calculate pension based on inflation from 2024 base
      const pension = calculateAveragePension(
        2024,
        data.year,
        basePension2024,
        prognosisData
      );
      pensionData[data.year.toString()] = Math.round(pension * 100) / 100; // Round to 2 decimal places
    }
  });

  return {
    ...pensionData,
    _metadata: {
      source: "ZUS Prognoza 2023-2080",
      description:
        "Prognozowane średnie świadczenie emerytalne w Polsce (brutto, PLN miesięcznie)",
      version: "2.0",
      date: "2025-01",
      officialDocument:
        "https://www.zus.pl/documents/10182/167761/Publikacja_Fundusz_Emerytalny_2023-2080.pdf/3c2c41c9-6a50-0574-4634-ee9cfa43f286?t=1674049287158",
    },
  };
}

// For backward compatibility, export a function that returns the data
export const averagePensionByYear = getAveragePensionByYear;
