"use client";

import React, {
  createContext,
  useContext,
  useState,
  useEffect,
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
} from "../utils/simulationHistory";

interface SimulationContextType {
  state: SimulationState;
  currentSimulationId: string | null;
  setExpectedPension: (amount: number) => void;
  setInputs: (inputs: SimulationInputs) => void;
  setResults: (results: SimulationResults) => void;
  updateDashboardModifications: (mods: Partial<DashboardModifications>) => void;
  saveScenario: (slot: "A" | "B", description: string) => void;
  loadScenario: (slot: "A" | "B") => void;
  clearScenario: (slot: "A" | "B") => void;
  recalculate: () => Promise<void>;
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
    customL4Periods: [],
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
    setState((prev) => ({ ...prev, inputs }));

    if (!currentSimulationId) {
      const newId = createNewSimulation();
      setCurrentSimId(newId);

      const defaultMods = initializeDefaultTimelineForSimulation(newId, inputs);
      setState((prev) => ({
        ...prev,
        inputs,
        dashboardModifications: defaultMods,
      }));
    }
  };

  const setResults = (results: SimulationResults) => {
    setState((prev) => {
      if (prev.inputs && results) {
        const simId = currentSimulationId || createNewSimulation();
        if (!currentSimulationId) {
          setCurrentSimId(simId);
        }

        saveSimulationToHistory(
          prev.expectedPension,
          prev.inputs,
          results,
          prev.dashboardModifications
        );
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

  const recalculate = async () => {
    if (!state.inputs) return;

    setIsCalculating(true);
    try {
      const results = await calculateSimulation({
        inputs: state.inputs,
        expectedPension: state.expectedPension,
        modifications: state.dashboardModifications,
      });

      setResults(results);
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

  const loadFromHistory = (id: string) => {
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
  };

  const getHistory = () => {
    return getSimulationHistory();
  };

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

  const loadTimelineFromStorage = () => {
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
  };

  const value: SimulationContextType = {
    state,
    currentSimulationId,
    setExpectedPension,
    setInputs,
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
