/**
 * ZUS Retirement Simulator - TypeScript Types
 */

export type Gender = 'male' | 'female';

export interface UserInput {
  age: number; // Wiek
  gender: Gender; // Płeć K/M
  monthlySalary: number; // Wynagrodzenie brutto miesięczne (PLN)
  startYear: number; // Rok rozpoczęcia pracy (STYCZEŃ)
  endYear: number; // Rok zakończenia aktywności (STYCZEŃ)
  accountBalance?: number; // Konto ZUS (opcjonalnie)
  subaccountBalance?: number; // Subkonto ZUS (opcjonalnie)
  includeL4: boolean; // Uwzględniaj L4
  expectedPension: number; // Oczekiwana emerytura z pulpitu
  postalCode?: string; // Kod pocztowy (opcjonalnie)
}

export interface SalaryPoint {
  year: number;
  monthly: number;
  annual: number;
}

export type SalaryPath = SalaryPoint[];

export interface CapitalPoint {
  year: number;
  account: number; // Konto
  subaccount: number; // Subkonto
  total: number;
}

export type CapitalHistory = CapitalPoint[];

export interface PensionAmount {
  nominal: number;
  real: number;
  increase?: number; // Percentage increase (for postponement variants)
}

export interface L4Impact {
  withoutL4: number;
  withL4: number;
  diff: number;
  diffPercentage: number;
}

export interface VsAverage {
  diff: number;
  percentage: number;
}

export interface PostponementVariants {
  '+1': PensionAmount;
  '+2': PensionAmount;
  '+5': PensionAmount;
}

export interface PensionResult {
  nominal: number; // Rzeczywista (nominalna) w roku przejścia
  real: number; // Urealniona (w dzisiejszych zł)
  replacementRate: number; // Stopa zastąpienia (%)
  vsAverage: VsAverage; // vs średnia w roku przejścia
  l4Impact: L4Impact; // Wpływ L4
  postponement: PostponementVariants; // Warianty odroczenia
  gapToExpected: number; // Brakuje X zł
  yearsToTarget: number | null; // ~N lat dłużej lub null
  capitalHistory: CapitalHistory; // Historia kapitału
  salaryPath: SalaryPath; // Ścieżka płac
  retirementYear: number; // Rok przejścia na emeryturę
}

export interface SimulationRecord {
  timestamp: string; // Data + Godzina użycia
  expectedPension: number;
  age: number;
  gender: Gender;
  salary: number;
  includeL4: boolean;
  accountBalance?: number;
  subaccountBalance?: number;
  nominalPension: number;
  realPension: number;
  postalCode?: string;
}

export interface L4Period {
  year: number;
  days: number;
}

// Data file types
export interface WageGrowthData {
  [year: string]: number; // year -> growth rate (e.g., 0.025 for 2.5%)
}

export interface CPIData {
  [year: string]: number; // year -> cumulative CPI index
}

export interface AveragePensionData {
  [year: string]: number; // year -> average pension amount
}

export interface AnnuityDivisor {
  male: { [age: string]: number };
  female: { [age: string]: number };
}

export interface SickImpact {
  avgDaysPerYear: number;
  reductionCoefficient: number;
  description: string;
}

export interface Fact {
  text: string;
  category: string;
}

export interface RetirementAge {
  male: number;
  female: number;
}

// Store types
export interface AppState {
  // Landing page
  expectedPension: number;
  setExpectedPension: (amount: number) => void;

  // Simulation form
  userInput: UserInput | null;
  setUserInput: (input: UserInput) => void;

  // Results
  results: PensionResult | null;
  setResults: (results: PensionResult) => void;

  // Dashboard
  editedSalaryHistory: SalaryPath | null;
  setEditedSalaryHistory: (history: SalaryPath | null) => void;
  customL4Periods: L4Period[];
  setCustomL4Periods: (periods: L4Period[]) => void;
  customValorizationRates: { year: number; rate: number }[] | null;
  setCustomValorizationRates: (rates: { year: number; rate: number }[] | null) => void;
  scenarioA: PensionResult | null;
  setScenarioA: (scenario: PensionResult | null) => void;
  scenarioB: PensionResult | null;
  setScenarioB: (scenario: PensionResult | null) => void;

  // Postal code
  postalCode: string;
  setPostalCode: (code: string) => void;

  // Admin
  simulations: SimulationRecord[];
  addSimulation: (sim: SimulationRecord) => void;
}
