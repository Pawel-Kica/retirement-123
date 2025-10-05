import { SimulationHistoryEntry, DashboardModifications } from "../types";

export const EXAMPLE_SIMULATION_ID = "example-simulation-always-available";

export function getExampleSimulation(): SimulationHistoryEntry {
  const currentYear = new Date().getFullYear();
  const retirementYear = 2055;
  const retirementAge = 65;

  return {
    id: EXAMPLE_SIMULATION_ID,
    timestamp: new Date().toISOString(),
    expectedPension: 3500,
    inputs: {
      age: 35,
      sex: "F" as const,
      workStartYear: 2010,
      workEndYear: 2055,
      monthlyGross: 8000,
      contractType: "UOP" as const,
      postalCode: "00-001",
    },
    results: {
      // Main results
      nominalPension: 3245.67,
      realPension: 3245.67,
      replacementRate: 40.57,

      // Comparisons
      avgPensionInRetirementYear: 3800,
      differenceVsAverage: -554.33,
      differenceVsExpected: -254.33,

      // Zwolnienie zdrowotne impact
      withoutZwolnienieZdrowotne: {
        nominalPension: 3245.67,
        realPension: 3245.67,
        totalCapital: 450000,
      },
      withZwolnienieZdrowotne: {
        nominalPension: 3245.67,
        realPension: 3245.67,
        totalCapital: 450000,
      },
      zwolnienieZdrwotneDifference: 0,

      // Deferrals
      deferrals: [
        {
          additionalYears: 2,
          retirementYear: retirementYear + 2,
          retirementAge: retirementAge + 2,
          totalCapital: 490000,
          nominalPension: 3456.2,
          realPension: 3456.2,
          increaseVsBase: 210.53,
          percentIncrease: 6.49,
        },
        {
          additionalYears: 5,
          retirementYear: retirementYear + 5,
          retirementAge: retirementAge + 5,
          totalCapital: 560000,
          nominalPension: 3890.34,
          realPension: 3890.34,
          increaseVsBase: 644.67,
          percentIncrease: 19.86,
        },
      ],

      // Years needed
      yearsNeeded: 42,

      // Paths (simplified for example)
      capitalPath: [],
      salaryPath: [],
    },
  };
}

export function getExampleTimeline(): DashboardModifications {
  return {
    contractPeriods: [
      {
        id: "example-emp-1",
        startYear: 2010,
        endYear: 2055,
        startMonth: 1,
        endMonth: 12,
        monthlyGross: 8000,
        contractType: "UOP",
        description: "Główny okres zatrudnienia",
      },
    ],
    gapPeriods: [],
    lifeEvents: [],
    customSalaries: {},
    customZwolnienieZdrwotnePeriods: [],
    customWageGrowth: {},
  };
}
