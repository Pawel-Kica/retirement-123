/**
 * Educational example personas for retirement simulation
 * Each example demonstrates different career paths and their pension outcomes
 */

import {
  SimulationInputs,
  DashboardModifications,
  EmploymentPeriod,
  EmploymentGapPeriod,
  LifeEvent,
} from "../types";

export interface ExamplePersona {
  id: string;
  title: string;
  shortDescription: string;
  educationalDescription: string;
  color: "green" | "blue" | "orange" | "red";
  estimatedPensionRange: string;
  inputs: SimulationInputs;
  modifications: DashboardModifications;
}

// All examples: Female, born 2000, retirement at 60 (year 2060)
const BIRTH_YEAR = 2000;
const CURRENT_YEAR = 2025;
const CURRENT_AGE = CURRENT_YEAR - BIRTH_YEAR; // 25
const RETIREMENT_AGE = 60;
const RETIREMENT_YEAR = BIRTH_YEAR + RETIREMENT_AGE; // 2060

/**
 * Example 1: Maximum Pension
 * Early start, all UOP, high salary growth, PPK + IKZE, minimal disruptions
 */
const EXAMPLE_1_MAX: ExamplePersona = {
  id: "1",
  title: "Maksymalna Emerytura",
  shortDescription:
    "Wczesny start, stabilna kariera w UOP, wysokie zarobki, PPK i IKZE",
  educationalDescription:
    "Optymalna strategia emerytalna: wczesny start kariery (20 lat), stabilna umowa o pracę (UOP z najwyższą składką 19.52%), systematyczny wzrost wynagrodzeń, oraz dodatkowe oszczędności w PPK i IKZE (+20% kapitału). Nawet urlop macierzyński nie przeszkadza znacząco (tylko 30% redukcji składek za ten okres).",
  color: "green",
  estimatedPensionRange: "8,000 - 10,000 PLN",
  inputs: {
    age: CURRENT_AGE,
    sex: "F",
    monthlyGross: 9500, // Average of career
    workStartYear: 2020,
    workEndYear: RETIREMENT_YEAR,
    accountBalance: 0,
    subAccountBalance: 0,
    includeZwolnienieZdrowotne: false, // No sick leave impact
    contractType: "UOP",
    retirementPrograms: {
      ppk: {
        enabled: true,
        employeeRate: 0.02,
        employerRate: 0.015,
      },
      ikze: {
        enabled: true,
        contributionRate: 0.1,
      },
    },
  },
  modifications: {
    customSalaries: {},
    customZwolnienieZdrwotnePeriods: [],
    customWageGrowth: {},
    contractPeriods: [
      {
        id: "period-1",
        startYear: 2020,
        endYear: 2021,
        monthlyGross: 3500,
        contractType: "UOP",
        description: "Praca part-time podczas studiów",
      },
      {
        id: "period-2",
        startYear: 2022,
        endYear: 2027,
        monthlyGross: 7000,
        contractType: "UOP",
        description: "Junior Specialist",
      },
      {
        id: "period-3",
        startYear: 2028,
        endYear: 2035,
        monthlyGross: 9500,
        contractType: "UOP",
        description: "Mid-level Specialist",
      },
      {
        id: "period-4",
        startYear: 2036,
        endYear: 2045,
        monthlyGross: 12500,
        contractType: "UOP",
        description: "Senior Specialist",
      },
      {
        id: "period-5",
        startYear: 2046,
        endYear: RETIREMENT_YEAR,
        monthlyGross: 15000,
        contractType: "UOP",
        description: "Expert / Manager",
      },
    ],
    gapPeriods: [
      {
        id: "gap-1",
        kind: "MATERNITY_LEAVE",
        startYear: 2030,
        startMonth: 6,
        durationMonths: 12,
        description: "Urlop macierzyński",
      },
    ],
    lifeEvents: [],
  },
};

/**
 * Example 2: Good Pension
 * Standard start, mostly UOP with one UOZ period, medium salary, PPK enabled
 */
const EXAMPLE_2_GOOD: ExamplePersona = {
  id: "2",
  title: "Dobra Emerytura",
  shortDescription:
    "Start po studiach, głównie UOP z okresem UOZ, średnie zarobki, PPK",
  educationalDescription:
    "Dobra emerytura przy zrównoważonej karierze. Umowa zlecenie (UOZ) ma niższe składki emerytalne (15.5%) niż UOP (19.52%), ale wciąż lepsze niż B2B. PPK dodaje 10% kapitału. Krótkie przerwy w karierze (urlop macierzyński, krótki urlop bezpłatny) można sobie pozwolić bez dramatycznego wpływu na emeryturę.",
  color: "blue",
  estimatedPensionRange: "5,000 - 6,500 PLN",
  inputs: {
    age: CURRENT_AGE,
    sex: "F",
    monthlyGross: 7500,
    workStartYear: 2022,
    workEndYear: RETIREMENT_YEAR,
    accountBalance: 0,
    subAccountBalance: 0,
    includeZwolnienieZdrowotne: true, // ~2% reduction
    contractType: "UOP",
    retirementPrograms: {
      ppk: {
        enabled: true,
        employeeRate: 0.02,
        employerRate: 0.015,
      },
      ikze: {
        enabled: false,
        contributionRate: 0,
      },
    },
  },
  modifications: {
    customSalaries: {},
    customZwolnienieZdrwotnePeriods: [],
    customWageGrowth: {},
    contractPeriods: [
      {
        id: "period-1",
        startYear: 2022,
        endYear: 2026,
        monthlyGross: 5000,
        contractType: "UOP",
        description: "Junior - pierwsza praca",
      },
      {
        id: "period-2",
        startYear: 2027,
        endYear: 2033,
        monthlyGross: 6500,
        contractType: "UOP",
        description: "Mid-level",
      },
      {
        id: "period-3",
        startYear: 2034,
        endYear: 2038,
        monthlyGross: 7500,
        contractType: "UOZ",
        description: "Freelance consulting (niższe składki)",
      },
      {
        id: "period-4",
        startYear: 2039,
        endYear: 2048,
        monthlyGross: 8500,
        contractType: "UOP",
        description: "Powrót do UOP",
      },
      {
        id: "period-5",
        startYear: 2049,
        endYear: RETIREMENT_YEAR,
        monthlyGross: 10000,
        contractType: "UOP",
        description: "Senior",
      },
    ],
    gapPeriods: [
      {
        id: "gap-1",
        kind: "MATERNITY_LEAVE",
        startYear: 2029,
        startMonth: 3,
        durationMonths: 12,
        description: "Urlop macierzyński",
      },
      {
        id: "gap-2",
        kind: "UNPAID_LEAVE",
        startYear: 2042,
        startMonth: 9,
        durationMonths: 3,
        description: "Krótka przerwa w karierze",
      },
    ],
    lifeEvents: [],
  },
};

/**
 * Example 3: Average Pension
 * Late start, mix of UOP/B2B, medium-low salary, several gaps, no programs
 */
const EXAMPLE_3_AVERAGE: ExamplePersona = {
  id: "3",
  title: "Przeciętna Emerytura",
  shortDescription:
    "Późniejszy start, mix UOP i B2B, średnio-niskie zarobki, kilka przerw",
  educationalDescription:
    "Przeciętna emerytura wynika z mieszanych form zatrudnienia. B2B ma drastycznie niższe składki emerytalne (8% zamiast 19.52% w UOP) - to ponad 50% mniej kapitału emerytalnego! Przerwy w karierze (bezrobocie, urlopy bezpłatne dają 100% redukcję składek) oraz brak dodatkowych programów emerytalnych (PPK, IKZE) dodatkowo obniżają przyszłą emeryturę.",
  color: "orange",
  estimatedPensionRange: "3,000 - 4,000 PLN",
  inputs: {
    age: CURRENT_AGE,
    sex: "F",
    monthlyGross: 5500,
    workStartYear: 2024,
    workEndYear: RETIREMENT_YEAR,
    accountBalance: 0,
    subAccountBalance: 0,
    includeZwolnienieZdrowotne: true,
    contractType: "UOP",
    retirementPrograms: {
      ppk: {
        enabled: false,
        employeeRate: 0,
        employerRate: 0,
      },
      ikze: {
        enabled: false,
        contributionRate: 0,
      },
    },
  },
  modifications: {
    customSalaries: {},
    customZwolnienieZdrwotnePeriods: [],
    customWageGrowth: {},
    contractPeriods: [
      {
        id: "period-1",
        startYear: 2024,
        endYear: 2027,
        monthlyGross: 4500,
        contractType: "UOP",
        description: "Pierwsza praca",
      },
      {
        id: "period-2",
        startYear: 2028,
        endYear: 2032,
        monthlyGross: 5500,
        contractType: "B2B",
        description: "Freelancing (tylko 8% składek!)",
      },
      {
        id: "period-3",
        startYear: 2033,
        endYear: 2037,
        monthlyGross: 5000,
        contractType: "UOP",
        description: "Powrót do etatu",
      },
      {
        id: "period-4",
        startYear: 2038,
        endYear: 2043,
        monthlyGross: 6000,
        contractType: "B2B",
        description: "Własna działalność",
      },
      {
        id: "period-5",
        startYear: 2044,
        endYear: RETIREMENT_YEAR,
        monthlyGross: 6500,
        contractType: "UOP",
        description: "Stabilna praca do emerytury",
      },
    ],
    gapPeriods: [
      {
        id: "gap-1",
        kind: "MATERNITY_LEAVE",
        startYear: 2035,
        startMonth: 5,
        durationMonths: 12,
        description: "Urlop macierzyński",
      },
      {
        id: "gap-2",
        kind: "UNEMPLOYMENT",
        startYear: 2044,
        startMonth: 1,
        durationMonths: 6,
        description: "Bezrobocie",
      },
      {
        id: "gap-3",
        kind: "UNPAID_LEAVE",
        startYear: 2050,
        startMonth: 8,
        durationMonths: 4,
        description: "Urlop bezpłatny",
      },
    ],
    lifeEvents: [
      {
        id: "sick-1",
        type: "SICK_LEAVE",
        year: 2052,
        month: 3,
        durationYears: 0.5,
        description: "Długotrwałe L4 (6 miesięcy)",
      },
    ],
  },
};

/**
 * Example 4: Low Pension
 * Very late start, mostly B2B, low salary, many gaps, no programs
 */
const EXAMPLE_4_LOW: ExamplePersona = {
  id: "4",
  title: "Niska Emerytura",
  shortDescription:
    "Bardzo późny start, głównie B2B, niskie zarobki, wiele przerw, brak programów",
  educationalDescription:
    "Niska emerytura to efekt późnego startu kariery (29 lat), przewagi B2B w historii zatrudnienia (składki tylko 8% - mniej niż połowa UOP 19.52%!), częstych i długich przerw w pracy (bezrobocie i urlopy bezpłatne dają 100% redukcję składek), niskich zarobków oraz całkowitego braku dodatkowych programów emerytalnych (PPK, IKZE). To pokazuje, jak ważne są wczesne decyzje zawodowe.",
  color: "red",
  estimatedPensionRange: "1,800 - 2,500 PLN",
  inputs: {
    age: CURRENT_AGE,
    sex: "F",
    monthlyGross: 4500,
    workStartYear: 2029,
    workEndYear: RETIREMENT_YEAR,
    accountBalance: 0,
    subAccountBalance: 0,
    includeZwolnienieZdrowotne: true,
    contractType: "B2B",
    retirementPrograms: {
      ppk: {
        enabled: false,
        employeeRate: 0,
        employerRate: 0,
      },
      ikze: {
        enabled: false,
        contributionRate: 0,
      },
    },
  },
  modifications: {
    customSalaries: {},
    customZwolnienieZdrwotnePeriods: [],
    customWageGrowth: {},
    contractPeriods: [
      {
        id: "period-1",
        startYear: 2029,
        endYear: 2031,
        monthlyGross: 4000,
        contractType: "UOP",
        description: "Krótki okres na etacie",
      },
      {
        id: "period-2",
        startYear: 2032,
        endYear: 2039,
        monthlyGross: 4200,
        contractType: "B2B",
        description: "Długi okres B2B",
      },
      {
        id: "period-3",
        startYear: 2040,
        endYear: 2043,
        monthlyGross: 4500,
        contractType: "UOP",
        description: "Powrót do UOP",
      },
      {
        id: "period-4",
        startYear: 2044,
        endYear: 2051,
        monthlyGross: 4800,
        contractType: "B2B",
        description: "Ponownie B2B",
      },
      {
        id: "period-5",
        startYear: 2052,
        endYear: RETIREMENT_YEAR,
        monthlyGross: 5000,
        contractType: "UOP",
        description: "Ostatnie lata kariery",
      },
    ],
    gapPeriods: [
      {
        id: "gap-1",
        kind: "UNEMPLOYMENT",
        startYear: 2031,
        startMonth: 10,
        durationMonths: 8,
        description: "Długie bezrobocie",
      },
      {
        id: "gap-2",
        kind: "UNPAID_LEAVE",
        startYear: 2035,
        startMonth: 4,
        durationMonths: 6,
        description: "Urlop bezpłatny",
      },
      {
        id: "gap-3",
        kind: "UNEMPLOYMENT",
        startYear: 2043,
        startMonth: 9,
        durationMonths: 10,
        description: "Bezrobocie",
      },
      {
        id: "gap-4",
        kind: "UNPAID_LEAVE",
        startYear: 2048,
        startMonth: 6,
        durationMonths: 5,
        description: "Urlop bezpłatny",
      },
    ],
    lifeEvents: [
      {
        id: "sick-1",
        type: "SICK_LEAVE",
        year: 2037,
        month: 5,
        durationYears: 0.67,
        description: "Długotrwałe L4 (8 miesięcy)",
      },
      {
        id: "sick-2",
        type: "SICK_LEAVE",
        year: 2055,
        month: 9,
        durationYears: 0.5,
        description: "Długotrwałe L4 (6 miesięcy)",
      },
    ],
  },
};

/**
 * All available example personas
 */
export const EXAMPLE_PERSONAS: ExamplePersona[] = [
  EXAMPLE_1_MAX,
  EXAMPLE_2_GOOD,
  EXAMPLE_3_AVERAGE,
  EXAMPLE_4_LOW,
];

/**
 * Get example persona by ID
 */
export function getExampleById(id: string): ExamplePersona | undefined {
  return EXAMPLE_PERSONAS.find((example) => example.id === id);
}
