/**
 * Main calculation engine orchestrator
 * Combines all calculation modules to produce complete simulation results
 */

import {
  SimulationInputs,
  SimulationResults,
  DashboardModifications,
} from "../types";
import { loadAllData } from "../data/loader";
import { buildSalaryPath } from "./salaryPath";
import { calculateZwolnienieZdrowotneComparison } from "./l4Impact";
import { applyTimelineAdjustments } from "./timelineAdjustments";
import { accumulateCapital, getFinalCapital } from "./capitalAccumulation";
import {
  calculatePension,
  calculateRealValue,
  calculateReplacementRate,
} from "./pensionCalculation";
import { calculateDeferralScenarios } from "./deferralScenarios";
import { calculateYearsNeeded } from "./yearsNeeded";
import {
  calculateAdditionalProgramsCapital,
  combinePensions,
} from "./additionalPrograms";

export interface CalculateParams {
  inputs: SimulationInputs;
  expectedPension: number;
  modifications?: DashboardModifications;
}

/**
 * Main calculation function
 * Uses original calculation method with proper waloryzacja
 */
export async function calculateSimulation(
  params: CalculateParams
): Promise<SimulationResults> {
  // Import original calculation engine
  const { calculateSimulationOriginal } = await import("./originalCalculation");

  // Load all data including prognosis data
  const data = await loadAllData();

  // Use original calculation with proper waloryzacja
  return calculateSimulationOriginal({
    ...params,
    cpiData: data.cpi,
    prognosisData: data.prognosisVariants[1].data, // Use variant 1 (Pośredni)
    prognosisVariant: 1,
  });
}
