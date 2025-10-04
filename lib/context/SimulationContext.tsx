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
} from "../types";
import { calculateSimulation } from "../engine";
import {
  saveSimulationToHistory,
  loadSimulationById,
  getSimulationHistory,
  clearHistory,
} from "../utils/simulationHistory";

interface SimulationContextType {
  state: SimulationState;
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

  // Load from sessionStorage on mount
  useEffect(() => {
    const saved = sessionStorage.getItem("zus-simulation-state");
    if (saved) {
      try {
        const parsed = JSON.parse(saved);
        setState((prev) => ({ ...prev, ...parsed }));
      } catch (e) {
        console.error("Failed to load saved state", e);
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

  // Save to sessionStorage on changes
  useEffect(() => {
    sessionStorage.setItem("zus-simulation-state", JSON.stringify(state));
  }, [state]);

  const setExpectedPension = (amount: number) => {
    setState((prev) => ({ ...prev, expectedPension: amount }));
  };

  const setInputs = (inputs: SimulationInputs) => {
    setState((prev) => ({ ...prev, inputs }));
  };

  const setResults = (results: SimulationResults) => {
    setState((prev) => {
      if (prev.inputs && results) {
        saveSimulationToHistory(prev.expectedPension, prev.inputs, results);
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

      // Log for admin export
      await fetch("/api/simulations", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          timestamp: new Date().toISOString(),
          expectedPension: state.expectedPension,
          ...state.inputs,
          nominalPension: results.nominalPension,
          realPension: results.realPension,
          postalCode: state.inputs.postalCode || null,
        }),
      }).catch((err) => console.error("Failed to log simulation:", err));
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
    sessionStorage.removeItem("zus-simulation-state");
  };

  const saveToHistory = () => {
    if (!state.inputs || !state.results) return;
    saveSimulationToHistory(state.expectedPension, state.inputs, state.results);
  };

  const loadFromHistory = (id: string) => {
    const entry = loadSimulationById(id);
    if (entry) {
      setState((prev) => ({
        ...prev,
        expectedPension: entry.expectedPension,
        inputs: entry.inputs,
        results: entry.results,
      }));
    }
  };

  const getHistory = () => {
    return getSimulationHistory();
  };

  const clearAllHistory = () => {
    clearHistory();
  };

  const value: SimulationContextType = {
    state,
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
