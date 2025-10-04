import {
  SimulationHistoryEntry,
  SimulationInputs,
  SimulationResults,
} from "../types";

const HISTORY_KEY = "zus-simulation-history";
const MAX_HISTORY_ITEMS = 5;

export function saveSimulationToHistory(
  expectedPension: number,
  inputs: SimulationInputs,
  results: SimulationResults
): SimulationHistoryEntry {
  const id = Date.now().toString();
  const timestamp = new Date().toISOString();

  const entry: SimulationHistoryEntry = {
    id,
    timestamp,
    expectedPension,
    inputs,
    results,
  };

  const history = getSimulationHistory();
  const updatedHistory = [entry, ...history].slice(0, MAX_HISTORY_ITEMS);

  try {
    localStorage.setItem(HISTORY_KEY, JSON.stringify(updatedHistory));
  } catch (error) {
    console.error("Failed to save simulation to history:", error);
  }

  return entry;
}

export function getSimulationHistory(): SimulationHistoryEntry[] {
  if (typeof window === "undefined") return [];

  try {
    const stored = localStorage.getItem(HISTORY_KEY);
    if (!stored) return [];

    const history = JSON.parse(stored) as SimulationHistoryEntry[];
    return history.slice(0, MAX_HISTORY_ITEMS);
  } catch (error) {
    console.error("Failed to load simulation history:", error);
    return [];
  }
}

export function loadSimulationById(id: string): SimulationHistoryEntry | null {
  const history = getSimulationHistory();
  return history.find((entry) => entry.id === id) || null;
}

export function clearHistory(): void {
  try {
    localStorage.removeItem(HISTORY_KEY);
  } catch (error) {
    console.error("Failed to clear simulation history:", error);
  }
}

export function deleteSimulationById(id: string): void {
  const history = getSimulationHistory();
  const updatedHistory = history.filter((entry) => entry.id !== id);

  try {
    localStorage.setItem(HISTORY_KEY, JSON.stringify(updatedHistory));
  } catch (error) {
    console.error("Failed to delete simulation from history:", error);
  }
}

export function updateSimulationPostalCode(
  id: string,
  postalCode: string
): void {
  const history = getSimulationHistory();
  const updatedHistory = history.map((entry) => {
    if (entry.id === id) {
      return {
        ...entry,
        inputs: {
          ...entry.inputs,
          postalCode,
        },
      };
    }
    return entry;
  });

  try {
    localStorage.setItem(HISTORY_KEY, JSON.stringify(updatedHistory));
  } catch (error) {
    console.error("Failed to update postal code in history:", error);
  }
}
