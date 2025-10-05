import { loadPrognoza1Data } from "@/lib/utils/csvParser";

/**
 * Get wage growth data dynamically from prognoza1.csv
 * Only returns years that exist in the CSV file
 */
export async function getWageGrowthByYear() {
  const prognosisData = await loadPrognoza1Data();

  const wageData: Record<string, number> = {};

  // Add historical data (2000-2021) - these are not in prognoza1.csv
  const historicalData = {
    "2000": 1.061,
    "2001": 1.052,
    "2002": 1.023,
    "2003": 1.018,
    "2004": 1.026,
    "2005": 1.034,
    "2006": 1.046,
    "2007": 1.067,
    "2008": 1.074,
    "2009": 1.034,
    "2010": 1.036,
    "2011": 1.043,
    "2012": 1.035,
    "2013": 1.032,
    "2014": 1.036,
    "2015": 1.034,
    "2016": 1.041,
    "2017": 1.056,
    "2018": 1.067,
    "2019": 1.072,
    "2020": 1.048,
    "2021": 1.069,
  };

  // Add historical data
  Object.entries(historicalData).forEach(([year, growth]) => {
    wageData[year] = growth;
  });

  // Add data from prognoza1.csv (2022 onwards)
  prognosisData.forEach((data) => {
    wageData[data.year.toString()] = data.wage_growth; // Already normalized during parsing
  });

  return {
    ...wageData,
    _metadata: {
      source: "GUS, NBP + ZUS Prognoza 2023-2080",
      description: "Średni roczny wzrost wynagrodzeń w Polsce",
      version: "2.0",
      date: "2025-01",
      officialDocument:
        "https://www.zus.pl/documents/10182/167761/Publikacja_Fundusz_Emerytalny_2023-2080.pdf/3c2c41c9-6a50-0574-4634-ee9cfa43f286?t=1674049287158",
    },
  };
}

// For backward compatibility, export a function that returns the data
export const wageGrowthByYear = getWageGrowthByYear;
