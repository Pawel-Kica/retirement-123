import {
  SimulationHistoryEntry,
  SimulationInputs,
  SimulationResults,
  EmploymentPeriod,
  EmploymentGapPeriod,
  LifeEvent,
  DashboardModifications,
} from "../types";
import { clearPostalCodeData } from "./postalCodeStorage";

const HISTORY_KEY = "zus-simulation-history";
const TIMELINE_PREFIX = "zus-timeline-";
const MAX_HISTORY_ITEMS = 10;
const CURRENT_SIMULATION_KEY = "zus-current-simulation-id";

export interface UnifiedSimulationData {
  id: string;
  timestamp: string;
  expectedPension: number;
  inputs: SimulationInputs;
  results: SimulationResults;
  dashboardModifications?: DashboardModifications;
}

export function getCurrentSimulationId(): string | null {
  if (typeof window === "undefined") return null;
  return localStorage.getItem(CURRENT_SIMULATION_KEY);
}

export function setCurrentSimulationId(id: string): void {
  if (typeof window === "undefined") return;
  localStorage.setItem(CURRENT_SIMULATION_KEY, id);
}

export function saveSimulationToHistory(
  expectedPension: number,
  inputs: SimulationInputs,
  results: SimulationResults,
  dashboardModifications?: DashboardModifications
): SimulationHistoryEntry {
  const currentId = getCurrentSimulationId();
  const id =
    currentId || `sim_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`;
  const timestamp = new Date().toISOString();

  const entry: SimulationHistoryEntry = {
    id,
    timestamp,
    expectedPension,
    inputs,
    results,
  };

  const history = getSimulationHistory();

  const existingIndex = history.findIndex((h) => h.id === id);
  let updatedHistory;

  if (existingIndex >= 0) {
    updatedHistory = [...history];
    updatedHistory[existingIndex] = entry;
  } else {
    updatedHistory = [entry, ...history].slice(0, MAX_HISTORY_ITEMS);
  }

  try {
    localStorage.setItem(HISTORY_KEY, JSON.stringify(updatedHistory));

    if (dashboardModifications) {
      saveTimelineForSimulation(id, dashboardModifications);
    }

    setCurrentSimulationId(id);
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

export function saveTimelineForSimulation(
  id: string,
  modifications: DashboardModifications
): void {
  try {
    const key = `${TIMELINE_PREFIX}${id}`;
    localStorage.setItem(key, JSON.stringify(modifications));
  } catch (error) {
    console.error("Failed to save timeline data:", error);
  }
}

export function loadTimelineForSimulation(
  id: string
): DashboardModifications | null {
  if (typeof window === "undefined") return null;

  try {
    const key = `${TIMELINE_PREFIX}${id}`;
    const stored = localStorage.getItem(key);
    if (!stored) return null;

    return JSON.parse(stored) as DashboardModifications;
  } catch (error) {
    console.error("Failed to load timeline data:", error);
    return null;
  }
}

export function clearHistory(): void {
  try {
    const history = getSimulationHistory();

    history.forEach((entry) => {
      const key = `${TIMELINE_PREFIX}${entry.id}`;
      localStorage.removeItem(key);
    });

    localStorage.removeItem(HISTORY_KEY);
    localStorage.removeItem(CURRENT_SIMULATION_KEY);

    // Also clear postal code data
    clearPostalCodeData();
  } catch (error) {
    console.error("Failed to clear simulation history:", error);
  }
}

export function deleteSimulationById(id: string): void {
  const history = getSimulationHistory();
  const updatedHistory = history.filter((entry) => entry.id !== id);

  try {
    localStorage.setItem(HISTORY_KEY, JSON.stringify(updatedHistory));

    const key = `${TIMELINE_PREFIX}${id}`;
    localStorage.removeItem(key);
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

export function updateSimulationInputs(
  id: string,
  inputs: Partial<SimulationInputs>
): void {
  const history = getSimulationHistory();
  const updatedHistory = history.map((entry) => {
    if (entry.id === id) {
      return {
        ...entry,
        inputs: {
          ...entry.inputs,
          ...inputs,
        },
      };
    }
    return entry;
  });

  try {
    localStorage.setItem(HISTORY_KEY, JSON.stringify(updatedHistory));
  } catch (error) {
    console.error("Failed to update simulation inputs in history:", error);
  }
}

export function createNewSimulation(): string {
  const id = `sim_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`;
  setCurrentSimulationId(id);
  return id;
}

export function initializeDefaultTimelineForSimulation(
  id: string,
  inputs: SimulationInputs
): DashboardModifications {
  const defaultPeriod: EmploymentPeriod = {
    id: `emp-default-${Date.now()}`,
    startYear: inputs.workStartYear,
    endYear: inputs.workEndYear,
    startMonth: 1,
    endMonth: 12,
    monthlyGross: inputs.monthlyGross,
    contractType: inputs.contractType || "UOP",
    description: "Główny okres zatrudnienia",
  };

  const modifications: DashboardModifications = {
    contractPeriods: [defaultPeriod],
    gapPeriods: [],
    lifeEvents: [],
    customSalaries: {},
    customL4Periods: [],
    customWageGrowth: {},
  };

  saveTimelineForSimulation(id, modifications);
  return modifications;
}

export function calculateEndDate(
  startYear: number,
  startMonth: number,
  durationMonths: number
): { endYear: number; endMonth: number } {
  const totalMonths = startYear * 12 + startMonth - 1 + durationMonths;
  const endYear = Math.floor(totalMonths / 12);
  const endMonth = (totalMonths % 12) + 1;

  return { endYear, endMonth };
}

export function formatMonths(months: number): string {
  if (months === 1) return "1 miesiąc";
  if (months >= 2 && months <= 4) return `${months} miesiące`;
  return `${months} miesięcy`;
}

export function formatYears(years: number): string {
  if (years === 0.5) return "pół roku";
  if (years === 1) return "1 rok";
  if (years === 1.5) return "1.5 roku";
  if (years >= 2 && years <= 4) return `${years} lata`;
  return `${years} lat`;
}

export function formatDuration(
  startYear: number,
  startMonth: number,
  endYear: number,
  endMonth: number
): string {
  const totalMonths =
    endYear * 12 + endMonth - (startYear * 12 + startMonth) + 1;
  const years = Math.floor(totalMonths / 12);
  const months = totalMonths % 12;

  if (years === 0) {
    return formatMonths(months);
  }

  if (months === 0) {
    return formatYears(years);
  }

  return `${formatYears(years)} i ${formatMonths(months)}`;
}
