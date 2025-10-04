/**
 * ZUS Retirement Simulator - Zustand Store
 * Global state management with localStorage persistence
 */

import { create } from 'zustand';
import { persist } from 'zustand/middleware';
import type { AppState, UserInput, PensionResult, SalaryPath, L4Period, SimulationRecord } from '@/types';

export const useStore = create<AppState>()(
  persist(
    (set) => ({
      // Landing page - expected pension
      expectedPension: 3500,
      setExpectedPension: (amount: number) => set({ expectedPension: amount }),

      // Simulation form - user inputs
      userInput: null,
      setUserInput: (input: UserInput) => set({ userInput: input }),

      // Results - calculated pension data
      results: null,
      setResults: (results: PensionResult) => set({ results }),

      // Dashboard - edited data
      editedSalaryHistory: null,
      setEditedSalaryHistory: (history: SalaryPath | null) => set({ editedSalaryHistory: history }),

      customL4Periods: [],
      setCustomL4Periods: (periods: L4Period[]) => set({ customL4Periods: periods }),

      customValorizationRates: null,
      setCustomValorizationRates: (rates: { year: number; rate: number }[] | null) =>
        set({ customValorizationRates: rates }),

      // Scenario comparison
      scenarioA: null,
      setScenarioA: (scenario: PensionResult | null) => set({ scenarioA: scenario }),

      scenarioB: null,
      setScenarioB: (scenario: PensionResult | null) => set({ scenarioB: scenario }),

      // Postal code (optional)
      postalCode: '',
      setPostalCode: (code: string) => set({ postalCode: code }),

      // Admin - all simulations for export
      simulations: [],
      addSimulation: (sim: SimulationRecord) =>
        set((state) => ({ simulations: [...state.simulations, sim] })),
    }),
    {
      name: 'zus-simulator-storage', // localStorage key
      partialize: (state) => ({
        // Only persist necessary data
        expectedPension: state.expectedPension,
        userInput: state.userInput,
        results: state.results,
        postalCode: state.postalCode,
        simulations: state.simulations,
      }),
    }
  )
);
