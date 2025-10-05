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
 * Uses simplified year-by-year calculation based on user inputs
 */
export async function calculateSimulation(
  params: CalculateParams
): Promise<SimulationResults> {
  // Import simplified calculation engine
  const { calculateSimulationSimplified } = await import('./simplifiedCalculation');

  // Use simplified calculation
  return calculateSimulationSimplified(params);
}
