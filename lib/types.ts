// Core data types
export type Sex = "M" | "F";
export type ContractType = "UOP" | "UOZ" | "B2B";

// Month helper type for month-precision periods
export type Month = 1 | 2 | 3 | 4 | 5 | 6 | 7 | 8 | 9 | 10 | 11 | 12;

export interface WageGrowthData {
  _metadata: {
    source: string;
    description: string;
    version: string;
    date: string;
  };
  [year: string]: number | object;
}

export interface CPIData {
  _metadata: {
    source: string;
    description: string;
    version: string;
    date: string;
  };
  [year: string]: number | object;
}

export interface AveragePensionData {
  _metadata: {
    source: string;
    description: string;
    version: string;
    date: string;
  };
  [year: string]: number | object;
}

export interface AnnuityDivisors {
  _metadata: {
    source: string;
    description: string;
    version: string;
    date: string;
  };
  M: Record<string, number>;
  F: Record<string, number>;
}

export interface SickImpactConfig {
  _metadata: {
    source: string;
    description: string;
    version: string;
    date: string;
  };
  avgDaysPerYear: number;
  reductionCoefficient: number;
  description: string;
}

export interface FactsData {
  _metadata: {
    source: string;
    description: string;
    version: string;
    date: string;
  };
  facts: string[];
}

export interface RetirementAgeData {
  _metadata: {
    source: string;
    description: string;
    version: string;
    date: string;
  };
  M: number;
  F: number;
  note: string;
}

export interface LifeDurationData {
  _metadata: {
    source: string;
    description: string;
    version: string;
    date: string;
    unit: string; // "months"
  };
  [age: string]:
    | {
        [month: string]: number; // remaining months of life
      }
    | object;
}

// ==========================================
// NOWE TYPY - Rozszerzona funkcjonalność
// ==========================================

/**
 * Okres zatrudnienia z określoną pensją i typem umowy
 */
export interface EmploymentPeriod {
  id: string;
  startYear: number;
  endYear: number;
  monthlyGross: number;
  contractType: ContractType;
  description?: string;
  // Optional month precision (defaults to January..December when omitted)
  startMonth?: Month;
  endMonth?: Month;
}

/**
 * Typ wydarzenia życiowego wpływającego na składki
 */
export type LifeEventType =
  | "MATERNITY_LEAVE"
  | "UNPAID_LEAVE"
  | "UNEMPLOYMENT"
  | "SICK_LEAVE"
  | "SALARY_CHANGE";

/**
 * Wydarzenie życiowe (urlop, zmiana pensji, etc.)
 */
export interface LifeEvent {
  id: string;
  type: LifeEventType;
  year: number;
  durationMonths?: number; // dla urlopów/zwolnień (1-12)
  newMonthlyGross?: number; // dla zmian wynagrodzenia
  description?: string;
  // Month/day fields for point-like events (e.g., L4)
  month?: Month;
  days?: number;
}

// Periods of gaps affecting contributions (month-precision)
export interface EmploymentGapPeriod {
  id: string;
  kind: "MATERNITY_LEAVE" | "UNPAID_LEAVE" | "UNEMPLOYMENT";
  startYear: number;
  startMonth: Month;
  endYear: number;
  endMonth: Month;
  description?: string;
}

/**
 * Konfiguracja dodatkowych programów emerytalnych
 */
export interface RetirementPrograms {
  ppk: {
    enabled: boolean;
    employeeRate: number; // np. 0.02 = 2%
    employerRate: number; // np. 0.015 = 1.5%
  };
  ikzp: {
    enabled: boolean;
    contributionRate: number; // np. 0.10 = 10%
  };
}

// User input types
export interface SimulationInputs {
  age: number;
  sex: Sex;
  monthlyGross: number;
  workStartYear: number;
  workEndYear: number;
  accountBalance?: number;
  subAccountBalance?: number;
  includeL4: boolean;
  postalCode?: string;
  earlyRetirement?: boolean; // Special professions (police, firefighters, etc.)

  // ========== NOWE POLA ==========
  contractType?: ContractType; // Typ umowy (domyślnie UOP)
  employmentPeriods?: EmploymentPeriod[]; // Niestandardowe okresy zatrudnienia
  lifeEvents?: LifeEvent[]; // Wydarzenia życiowe
  retirementPrograms?: RetirementPrograms; // PPK, IKZP
}

// Calculation result types
export interface SalaryPathEntry {
  year: number;
  age: number;
  monthlyGross: number;
  annualGross: number;
  isHistorical: boolean;
  isFuture: boolean;
  isCurrentYear: boolean;
  effectiveSalary?: number;
  l4Impact?: number;
}

export interface CapitalEntry {
  year: number;
  age: number;
  salary: number;
  contributions: number;
  valorization: number;
  mainAccountBefore: number;
  mainAccountAfter: number;
  subAccountBefore: number;
  subAccountAfter: number;
  totalCapital: number;
}

export interface DeferralScenario {
  additionalYears: number;
  retirementYear: number;
  retirementAge: number;
  totalCapital: number;
  nominalPension: number;
  realPension: number;
  increaseVsBase: number;
  percentIncrease: number;
}

export interface SimulationResults {
  // Main results
  nominalPension: number;
  realPension: number;
  replacementRate: number;

  // Comparisons
  avgPensionInRetirementYear: number;
  differenceVsAverage: number;
  differenceVsExpected: number;

  // L4 impact
  withoutL4: {
    nominalPension: number;
    realPension: number;
    totalCapital: number;
  };
  withL4: {
    nominalPension: number;
    realPension: number;
    totalCapital: number;
  };
  l4Difference: number;

  // Deferrals
  deferrals: DeferralScenario[];

  // Years needed
  yearsNeeded: number | null;

  // Paths
  capitalPath: CapitalEntry[];
  salaryPath: SalaryPathEntry[];

  // ========== NOWE POLA - PPK/IKZP ==========
  ppkCapital?: number; // Kapitał zgromadzony w PPK
  ikzpCapital?: number; // Kapitał zgromadzony w IKZP
  totalPensionWithPrograms?: number; // Łączna emerytura (ZUS + PPK + IKZP)
  programsBreakdown?: {
    // Podział emerytury na źródła
    zus: number;
    ppk: number;
    ikzp: number;
  };
}

// Dashboard modifications
export interface L4Period {
  year: number;
  days: number;
}

export interface DashboardModifications {
  customSalaries: Record<number, number>;
  customL4Periods: L4Period[];
  customWageGrowth: Record<number, number>;
  // New unified timeline data
  contractPeriods?: EmploymentPeriod[];
  gapPeriods?: EmploymentGapPeriod[];
  lifeEvents?: LifeEvent[];
}

// Scenario snapshot
export interface ScenarioSnapshot {
  description: string;
  timestamp: Date;
  inputs: SimulationInputs;
  results: SimulationResults;
  modifications: DashboardModifications;
}

// Complete simulation state
export interface SimulationState {
  expectedPension: number;
  inputs: SimulationInputs | null;
  results: SimulationResults | null;
  dashboardModifications: DashboardModifications;
  scenarios: {
    A: ScenarioSnapshot | null;
    B: ScenarioSnapshot | null;
  };
}

// Admin export record
export interface SimulationRecord {
  timestamp: string;
  expectedPension: number;
  age: number;
  sex: Sex;
  monthlyGross: number;
  includeL4: boolean;
  accountBalance: number | null;
  subAccountBalance: number | null;
  nominalPension: number;
  realPension: number;
  postalCode: string | null;
}

// Simulation history
export interface SimulationHistoryEntry {
  id: string;
  timestamp: string;
  expectedPension: number;
  inputs: SimulationInputs;
  results: SimulationResults;
}
