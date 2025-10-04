// Core data types
export type Sex = 'M' | 'F';

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
    [age: string]: {
        [month: string]: number; // remaining months of life
    } | object;
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

