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
        setState((prev) => ({
          ...prev,
          expectedPension: entry.expectedPension,
          inputs: entry.inputs,
          results: entry.results,
        }));

        const timeline = loadTimelineForSimulation(simId);
        if (timeline) {
          setState((prev) => ({
            ...prev,
            dashboardModifications: timeline,
          }));
        }
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
      const results = await calculateSimulation({
        inputs: inputs,
        expectedPension: state.expectedPension,
        modifications: defaultMods,
      });

      console.log("💾 Saving to history...", {
        simId,
        expectedPension: state.expectedPension,
        hasInputs: !!inputs,
        hasResults: !!results,
      });

      // Save to history
      saveSimulationToHistory(
        state.expectedPension,
        inputs,
        results,
        defaultMods,
        isNewSimulation
      );

      console.log("✅ Simulation saved successfully!");

      // Update results in state
      setState((prev) => ({ ...prev, results }));

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
      setState((prev) => ({ ...prev, inputs: updatedInputs }));

      updateSimulationInputs(currentSimulationId, newInputs);

      try {
        setIsCalculating(true);
        const results = await calculateSimulation({
          inputs: updatedInputs,
          expectedPension: state.expectedPension,
          modifications: state.dashboardModifications,
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
      const results = await calculateSimulation({
        inputs: state.inputs,
        expectedPension: state.expectedPension,
        modifications: state.dashboardModifications,
      });

      setResults(results, isNewSimulation);
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

      setState((prev) => ({
        ...prev,
        expectedPension: entry.expectedPension,
        inputs: entry.inputs,
        results: entry.results,
      }));

      const timeline = loadTimelineForSimulation(id);
      if (timeline) {
        setState((prev) => ({
          ...prev,
          dashboardModifications: timeline,
        }));
      }
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

    setState((prev) => ({
      ...prev,
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
