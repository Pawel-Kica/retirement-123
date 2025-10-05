import { loadPrognoza1Data } from "@/lib/utils/csvParser";

/**
 * Get CPI data dynamically from prognoza1.csv
 * Only returns years that exist in the CSV file
 */
export async function getCpiByYear() {
  const prognosisData = await loadPrognoza1Data();

  const cpiData: Record<string, number> = {};

  // Add historical data (2000-2021) - these are not in prognoza1.csv
  const historicalData = {
    "2000": 1.086,
    "2001": 1.054,
    "2002": 1.019,
    "2003": 1.008,
    "2004": 1.035,
    "2005": 1.021,
    "2006": 1.01,
    "2007": 1.024,
    "2008": 1.042,
    "2009": 1.035,
    "2010": 1.027,
    "2011": 1.043,
    "2012": 1.037,
    "2013": 1.009,
    "2014": 1.0,
    "2015": 0.991,
    "2016": 0.994,
    "2017": 1.02,
    "2018": 1.017,
    "2019": 1.023,
    "2020": 1.033,
    "2021": 1.054,
  };

  // Add historical data
  Object.entries(historicalData).forEach(([year, cpi]) => {
    cpiData[year] = cpi;
  });

  // Add data from prognoza1.csv (2022 onwards)
  prognosisData.forEach((data) => {
    cpiData[data.year.toString()] = data.inflation; // Already normalized during parsing
  });

  return {
    ...cpiData,
    _metadata: {
      source: "GUS + ZUS Prognoza 2023-2080",
      description: "Wskaźnik cen konsumpcyjnych (CPI) - inflacja roczna",
      version: "2.0",
      date: "2025-01",
      officialDocument:
        "https://www.zus.pl/documents/10182/167761/Publikacja_Fundusz_Emerytalny_2023-2080.pdf/3c2c41c9-6a50-0574-4634-ee9cfa43f286?t=1674049287158",
    },
  };
}

// For backward compatibility, export a function that returns the data
export const cpiByYear = getCpiByYear;
