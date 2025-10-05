"use client";

import React, {
  createContext,
  useContext,
  useState,
  useEffect,
  useCallback,
  ReactNode,
} from "react";
import {
  SimulationState,
  SimulationInputs,
  SimulationResults,
  ScenarioSnapshot,
  DashboardModifications,
  SimulationHistoryEntry,
  EmploymentPeriod,
  EmploymentGapPeriod,
  LifeEvent,
} from "../types";
import { calculateSimulation } from "../engine";
import { calculateExpectedPensionFromCareer } from "../engine/simplifiedCalculation";
import { loadAllData } from "../data/loader";
import {
  saveSimulationToHistory,
  loadSimulationById,
  getSimulationHistory,
  clearHistory,
  getCurrentSimulationId,
  setCurrentSimulationId,
  createNewSimulation,
  initializeDefaultTimelineForSimulation,
  saveTimelineForSimulation,
  loadTimelineForSimulation,
  updateSimulationInputs,
} from "../utils/simulationHistory";

interface SimulationContextType {
  state: SimulationState;
  currentSimulationId: string | null;
  setExpectedPension: (amount: number) => void;
  setInputs: (inputs: SimulationInputs) => void;
  setInputsAndRecalculate: (
    inputs: SimulationInputs,
    isNewSimulation?: boolean
  ) => Promise<boolean>;
  updateInputs: (inputs: Partial<SimulationInputs>) => Promise<void>;
  setResults: (results: SimulationResults, isNewSimulation?: boolean) => void;
  updateDashboardModifications: (mods: Partial<DashboardModifications>) => void;
  saveScenario: (slot: "A" | "B", description: string) => void;
  loadScenario: (slot: "A" | "B") => void;
  clearScenario: (slot: "A" | "B") => void;
  recalculate: (isNewSimulation?: boolean) => Promise<void>;
  reset: () => void;
  isCalculating: boolean;
  saveToHistory: () => void;
  loadFromHistory: (id: string) => void;
  getHistory: () => SimulationHistoryEntry[];
  clearAllHistory: () => void;
  updateContractPeriods: (periods: EmploymentPeriod[]) => Promise<void>;
  updateGapPeriods: (gaps: EmploymentGapPeriod[]) => Promise<void>;
  updateLifeEvents: (events: LifeEvent[]) => Promise<void>;
  loadTimelineFromStorage: () => void;
  startNewSimulation: () => void;
}

const SimulationContext = createContext<SimulationContextType | undefined>(
  undefined
);

const initialState: SimulationState = {
  expectedPension: 3000,
  inputs: null,
  results: null,
  dashboardModifications: {
    customSalaries: {},
    customZwolnienieZdrwotnePeriods: [],
    customWageGrowth: {},
  },
  scenarios: {
    A: null,
    B: null,
  },
};

export function SimulationProvider({ children }: { children: ReactNode }) {
  const [state, setState] = useState<SimulationState>(initialState);
  const [isCalculating, setIsCalculating] = useState(false);
  const [currentSimulationId, setCurrentSimId] = useState<string | null>(null);

  // Load from localStorage on mount
  useEffect(() => {
    const simId = getCurrentSimulationId();
    if (simId) {
      setCurrentSimId(simId);
      const entry = loadSimulationById(simId);
      if (entry) {
        const timeline = loadTimelineForSimulation(simId);

        // Sync inputs.employmentPeriods with timeline contractPeriods
        const syncedInputs = timeline?.contractPeriods
          ? {
              ...entry.inputs,
              employmentPeriods: timeline.contractPeriods,
            }
          : entry.inputs;

        setState((prev) => ({
          ...prev,
          expectedPension: entry.expectedPension,
          inputs: syncedInputs,
          results: entry.results,
          dashboardModifications: timeline || prev.dashboardModifications,
        }));
      }
    }

    // Load scenarios from localStorage
    const savedScenarios = localStorage.getItem("zus-scenarios");
    if (savedScenarios) {
      try {
        const parsed = JSON.parse(savedScenarios);
        setState((prev) => ({ ...prev, scenarios: parsed }));
      } catch (e) {
        console.error("Failed to load scenarios", e);
      }
    }
  }, []);

  // Auto-save to localStorage when state changes (debounced)
  useEffect(() => {
    if (!currentSimulationId || !state.inputs || !state.results) return;

    const timeoutId = setTimeout(() => {
      if (state.inputs && state.results) {
        saveSimulationToHistory(
          state.expectedPension,
          state.inputs,
          state.results,
          state.dashboardModifications
        );
      }
    }, 500);

    return () => clearTimeout(timeoutId);
  }, [state, currentSimulationId]);

  const setExpectedPension = (amount: number) => {
    setState((prev) => ({ ...prev, expectedPension: amount }));
  };

  const setInputs = (inputs: SimulationInputs) => {
    if (!currentSimulationId) {
      const newId = createNewSimulation();
      setCurrentSimId(newId);

      const defaultMods = initializeDefaultTimelineForSimulation(newId, inputs);
      setState((prev) => ({
        ...prev,
        inputs,
        dashboardModifications: defaultMods,
      }));
    } else {
      setState((prev) => ({ ...prev, inputs }));
    }
  };

  const setInputsAndRecalculate = async (
    inputs: SimulationInputs,
    isNewSimulation: boolean = true
  ) => {
    console.log("🚀 Starting setInputsAndRecalculate", { isNewSimulation });

    // Create simulation ID if needed
    let simId = currentSimulationId;
    if (!simId) {
      simId = createNewSimulation();
      setCurrentSimId(simId);
      console.log("✨ Created new simulation ID:", simId);
    } else {
      console.log("📝 Using existing simulation ID:", simId);
    }

    const defaultMods = initializeDefaultTimelineForSimulation(simId, inputs);

    // Update state with inputs
    setState((prev) => ({
      ...prev,
      inputs,
      dashboardModifications: defaultMods,
    }));

    // Calculate immediately with the new inputs (don't wait for state update)
    setIsCalculating(true);
    try {
      console.log("🧮 Starting calculation...");
      
      // For new simulations, use the current expectedPension from state
      // For existing simulations, recalculate based on career path
      const expectedPensionToUse = isNewSimulation 
        ? state.expectedPension 
        : await (async () => {
            const data = await loadAllData();
            const workHistory = inputs.employmentPeriods || [];
            const retirementAge = inputs.age + (inputs.workEndYear - new Date().getFullYear());
            const retirementYear = inputs.workEndYear;
            const currentYear = new Date().getFullYear();
            return await calculateExpectedPensionFromCareer(
              workHistory,
              inputs.sex,
              retirementAge,
              inputs.accountBalance,
              inputs.subAccountBalance,
              retirementYear,
              currentYear,
              data.cpi
            );
          })();

      const results = await calculateSimulation({
        inputs: inputs,
        expectedPension: expectedPensionToUse,
        modifications: defaultMods,
      });

      console.log("💾 Saving to history...", {
        simId,
        expectedPension: expectedPensionToUse,
        hasInputs: !!inputs,
        hasResults: !!results,
      });

      // Save to history
      saveSimulationToHistory(
        expectedPensionToUse,
        inputs,
        results,
        defaultMods,
        isNewSimulation
      );

      console.log("✅ Simulation saved successfully!");

      // Update results and expected pension in state
      setState((prev) => ({ 
        ...prev, 
        expectedPension: expectedPensionToUse,
        results 
      }));

      return true;
    } catch (error) {
      console.error("❌ Calculation error:", error);
      throw error;
    } finally {
      setIsCalculating(false);
    }
  };

  const updateInputs = useCallback(
    async (newInputs: Partial<SimulationInputs>) => {
      if (!state.inputs || !currentSimulationId) return;

      const updatedInputs = { ...state.inputs, ...newInputs };

      // If employmentPeriods are provided in newInputs, also sync to contractPeriods
      if (newInputs.employmentPeriods) {
        const updatedMods = {
          ...state.dashboardModifications,
          contractPeriods: newInputs.employmentPeriods,
        };
        saveTimelineForSimulation(currentSimulationId, updatedMods);
      }

      setState((prev) => ({
        ...prev,
        inputs: updatedInputs,
        dashboardModifications: newInputs.employmentPeriods
          ? {
              ...prev.dashboardModifications,
              contractPeriods: newInputs.employmentPeriods,
            }
          : prev.dashboardModifications,
      }));

      updateSimulationInputs(currentSimulationId, newInputs);

      try {
        setIsCalculating(true);
        const results = await calculateSimulation({
          inputs: updatedInputs,
          expectedPension: state.expectedPension,
          modifications: newInputs.employmentPeriods
            ? {
                ...state.dashboardModifications,
                contractPeriods: newInputs.employmentPeriods,
              }
            : state.dashboardModifications,
        });
        setState((prev) => {
          saveSimulationToHistory(
            prev.expectedPension,
            updatedInputs,
            results,
            prev.dashboardModifications
          );
          return { ...prev, results };
        });
      } catch (error) {
        console.error("Calculation error:", error);
      } finally {
        setIsCalculating(false);
      }
    },
    [
      state.inputs,
      state.expectedPension,
      state.dashboardModifications,
      currentSimulationId,
    ]
  );

  const setResults = (
    results: SimulationResults,
    isNewSimulation: boolean = false
  ) => {
    setState((prev) => {
      if (prev.inputs && results) {
        let simId = currentSimulationId;

        // If this is a new simulation or no current ID exists, create a new one
        if (isNewSimulation || !currentSimulationId) {
          simId = createNewSimulation();
          setCurrentSimId(simId);
        }

        console.log("💾 Saving simulation to history:", {
          expectedPension: prev.expectedPension,
          hasInputs: !!prev.inputs,
          hasResults: !!results,
          simId,
          isNewSimulation,
        });

        saveSimulationToHistory(
          prev.expectedPension,
          prev.inputs,
          results,
          prev.dashboardModifications,
          isNewSimulation
        );

        console.log("✅ Simulation saved to history");
      } else {
        console.warn("⚠️ Cannot save to history - missing inputs or results", {
          hasInputs: !!prev.inputs,
          hasResults: !!results,
        });
      }
      return { ...prev, results };
    });
  };

  const updateDashboardModifications = (
    mods: Partial<DashboardModifications>
  ) => {
    setState((prev) => ({
      ...prev,
      dashboardModifications: {
        ...prev.dashboardModifications,
        ...mods,
      },
    }));
  };

  const saveScenario = (slot: "A" | "B", description: string) => {
    if (!state.inputs || !state.results) return;

    const snapshot: ScenarioSnapshot = {
      description,
      timestamp: new Date(),
      inputs: state.inputs,
      results: state.results,
      modifications: state.dashboardModifications,
    };

    const newScenarios = {
      ...state.scenarios,
      [slot]: snapshot,
    };

    setState((prev) => ({ ...prev, scenarios: newScenarios }));
    localStorage.setItem("zus-scenarios", JSON.stringify(newScenarios));
  };

  const loadScenario = (slot: "A" | "B") => {
    const scenario = state.scenarios[slot];
    if (scenario) {
      setState((prev) => ({
        ...prev,
        inputs: scenario.inputs,
        results: scenario.results,
        dashboardModifications: scenario.modifications,
      }));
    }
  };

  const clearScenario = (slot: "A" | "B") => {
    const newScenarios = {
      ...state.scenarios,
      [slot]: null,
    };
    setState((prev) => ({ ...prev, scenarios: newScenarios }));
    localStorage.setItem("zus-scenarios", JSON.stringify(newScenarios));
  };

  const recalculate = async (isNewSimulation: boolean = false) => {
    if (!state.inputs) return;

    setIsCalculating(true);
    try {
      // Sync inputs.employmentPeriods with dashboardModifications.contractPeriods before calculation
      const syncedInputs = {
        ...state.inputs,
        employmentPeriods:
          state.dashboardModifications.contractPeriods ||
          state.inputs.employmentPeriods,
      };

      // Check if career path has been modified (contract periods, gap periods, or life events)
      const hasCareerModifications = 
        state.dashboardModifications.contractPeriods ||
        (state.dashboardModifications.gapPeriods && state.dashboardModifications.gapPeriods.length > 0) ||
        (state.dashboardModifications.lifeEvents && state.dashboardModifications.lifeEvents.length > 0);

      let expectedPensionToUse = state.expectedPension;

      // Only recalculate expected pension if career path has been modified
      if (hasCareerModifications) {
        console.log("🔄 Career path modified, recalculating expected pension...");
        const data = await loadAllData();
        const workHistory = syncedInputs.employmentPeriods || [];
        const retirementAge = syncedInputs.age + (syncedInputs.workEndYear - new Date().getFullYear());
        const retirementYear = syncedInputs.workEndYear;
        const currentYear = new Date().getFullYear();
        expectedPensionToUse = await calculateExpectedPensionFromCareer(
          workHistory,
          syncedInputs.sex,
          retirementAge,
          syncedInputs.accountBalance,
          syncedInputs.subAccountBalance,
          retirementYear,
          currentYear,
          data.cpi
        );
      } else {
        console.log("📊 No career modifications, using existing expected pension");
      }

      const results = await calculateSimulation({
        inputs: syncedInputs,
        expectedPension: expectedPensionToUse,
        modifications: state.dashboardModifications,
      });

      // Update both inputs and results in a single atomic state update
      setState((prev) => {
        let simId = currentSimulationId;
        if (isNewSimulation || !currentSimulationId) {
          simId = createNewSimulation();
          setCurrentSimId(simId);
        }

        if (syncedInputs && results) {
          console.log("💾 Saving simulation to history");
          saveSimulationToHistory(
            expectedPensionToUse,
            syncedInputs,
            results,
            prev.dashboardModifications,
            isNewSimulation
          );
        }

        return {
          ...prev,
          expectedPension: expectedPensionToUse,
          inputs: syncedInputs,
          results,
        };
      });
    } catch (error) {
      console.error("Calculation error:", error);
      throw error;
    } finally {
      setIsCalculating(false);
    }
  };

  const reset = () => {
    setState({
      ...initialState,
      scenarios: state.scenarios,
    });
    setCurrentSimId(null);
  };

  const startNewSimulation = () => {
    const newId = createNewSimulation();
    setCurrentSimId(newId);
    setState(initialState);
  };

  const saveToHistory = () => {
    if (!state.inputs || !state.results) return;
    const simId = currentSimulationId || createNewSimulation();
    if (!currentSimulationId) {
      setCurrentSimId(simId);
    }
    saveSimulationToHistory(
      state.expectedPension,
      state.inputs,
      state.results,
      state.dashboardModifications
    );
  };

  const loadFromHistory = useCallback((id: string) => {
    const entry = loadSimulationById(id);
    if (entry) {
      setCurrentSimId(id);
      setCurrentSimulationId(id);

      const timeline = loadTimelineForSimulation(id);

      // Sync inputs.employmentPeriods with timeline contractPeriods
      const syncedInputs = timeline?.contractPeriods
        ? {
            ...entry.inputs,
            employmentPeriods: timeline.contractPeriods,
          }
        : entry.inputs;

      setState((prev) => ({
        ...prev,
        expectedPension: entry.expectedPension,
        inputs: syncedInputs,
        results: entry.results,
        dashboardModifications: timeline || prev.dashboardModifications,
      }));
    }
  }, []);

  const getHistory = useCallback(() => {
    return getSimulationHistory();
  }, []);

  const clearAllHistory = () => {
    clearHistory();
  };

  const updateContractPeriods = async (periods: EmploymentPeriod[]) => {
    if (currentSimulationId) {
      const updatedMods = {
        ...state.dashboardModifications,
        contractPeriods: periods,
      };
      saveTimelineForSimulation(currentSimulationId, updatedMods);
    }

    // Calculate workStartYear and workEndYear from all periods
    let workStartYear = state.inputs?.workStartYear;
    let workEndYear = state.inputs?.workEndYear;

    if (periods.length > 0) {
      workStartYear = Math.min(...periods.map((p) => p.startYear));
      workEndYear = Math.max(...periods.map((p) => p.endYear));
    }

    // Update both dashboardModifications AND inputs.employmentPeriods to keep them in sync
    setState((prev) => ({
      ...prev,
      inputs: prev.inputs
        ? {
            ...prev.inputs,
            employmentPeriods: periods,
            workStartYear: workStartYear!,
            workEndYear: workEndYear!,
          }
        : prev.inputs,
      dashboardModifications: {
        ...prev.dashboardModifications,
        contractPeriods: periods,
      },
    }));
    await recalculate();
  };

  const updateGapPeriods = async (gaps: EmploymentGapPeriod[]) => {
    if (currentSimulationId) {
      const updatedMods = {
        ...state.dashboardModifications,
        gapPeriods: gaps,
      };
      saveTimelineForSimulation(currentSimulationId, updatedMods);
    }

    setState((prev) => ({
      ...prev,
      dashboardModifications: {
        ...prev.dashboardModifications,
        gapPeriods: gaps,
      },
    }));
    await recalculate();
  };

  const updateLifeEvents = async (events: LifeEvent[]) => {
    if (currentSimulationId) {
      const updatedMods = {
        ...state.dashboardModifications,
        lifeEvents: events,
      };
      saveTimelineForSimulation(currentSimulationId, updatedMods);
    }

    setState((prev) => ({
      ...prev,
      dashboardModifications: {
        ...prev.dashboardModifications,
        lifeEvents: events,
      },
    }));
    await recalculate();
  };

  const loadTimelineFromStorage = useCallback(() => {
    if (!currentSimulationId) return;

    const timelineData = loadTimelineForSimulation(currentSimulationId);

    if (!timelineData && state.inputs) {
      const defaultData = initializeDefaultTimelineForSimulation(
        currentSimulationId,
        state.inputs
      );
      setState((prev) => ({
        ...prev,
        dashboardModifications: defaultData,
      }));
    } else if (timelineData) {
      setState((prev) => ({
        ...prev,
        dashboardModifications: timelineData,
      }));
    }
  }, [currentSimulationId, state.inputs]);

  const value: SimulationContextType = {
    state,
    currentSimulationId,
    setExpectedPension,
    setInputs,
    setInputsAndRecalculate,
    updateInputs,
    setResults,
    updateDashboardModifications,
    saveScenario,
    loadScenario,
    clearScenario,
    recalculate,
    reset,
    isCalculating,
    saveToHistory,
    loadFromHistory,
    getHistory,
    clearAllHistory,
    updateContractPeriods,
    updateGapPeriods,
    updateLifeEvents,
    loadTimelineFromStorage,
    startNewSimulation,
  };

  return (
    <SimulationContext.Provider value={value}>
      {children}
    </SimulationContext.Provider>
  );
}

export function useSimulation() {
  const context = useContext(SimulationContext);
  if (!context) {
    throw new Error("useSimulation must be used within SimulationProvider");
  }
  return context;
}
