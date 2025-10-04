import { Sex } from "../types";

export const VALIDATION_CONSTANTS = {
  MIN_WORKING_AGE: 18,
  MIN_AGE: 18,
  MAX_AGE: 100,
  MAX_AGE_WARNING: 70,
  MIN_SALARY: 1000,
  MAX_SALARY: 100000,
  MAX_RETIREMENT_YEAR: 2080,
} as const;

// Use static retirement ages instead of loading from async data
export const RETIREMENT_AGES = {
  M: 65, // Standard retirement age for men
  F: 60, // Standard retirement age for women
} as const;

export function calculateBirthYear(
  currentAge: number,
  currentYear: number
): number {
  return currentYear - currentAge;
}

export function calculateMinWorkStartYear(birthYear: number): number {
  return birthYear + VALIDATION_CONSTANTS.MIN_WORKING_AGE;
}

export function calculateMinRetirementYear(
  birthYear: number,
  sex: Sex
): number {
  return birthYear + RETIREMENT_AGES[sex];
}

export function calculateRetirementAge(
  currentAge: number,
  retirementYear: number,
  currentYear: number
): number {
  return currentAge + (retirementYear - currentYear);
}

export function calculateYearsWorked(
  startYear: number,
  endYear: number
): number {
  return Math.max(0, endYear - startYear);
}

export function calculateMinRetirementYearFromAge(
  currentAge: number,
  currentYear: number,
  sex: Sex
): number {
  const birthYear = calculateBirthYear(currentAge, currentYear);
  return calculateMinRetirementYear(birthYear, sex);
}

export const ERROR_MESSAGES = {
  age: {
    required: "Wiek jest wymagany",
    tooYoung: (min: number) => `Musisz mieć co najmniej ${min} lat`,
    tooOld: (max: number) =>
      `Podany wiek przekracza maksymalny realistyczny wiek (${max} lat)`,
    warning: (age: number) =>
      `Wiek powyżej ${age} lat - prawdopodobnie jesteś już na emeryturze`,
  },
  sex: {
    required: "Płeć jest wymagana",
    invalid: "Płeć musi być M lub F",
  },
  salary: {
    required: "Wynagrodzenie jest wymagane",
    tooLow: (min: number) =>
      `Wynagrodzenie musi być co najmniej ${min.toLocaleString("pl-PL")} zł`,
    tooHigh: (max: number) =>
      `Wynagrodzenie nie może przekraczać ${max.toLocaleString("pl-PL")} zł`,
  },
  workStartYear: {
    required: "Rok rozpoczęcia pracy jest wymagany",
    inFuture: "Rok rozpoczęcia nie może być w przyszłości",
    tooEarly: (minYear: number) =>
      `Rok rozpoczęcia pracy nie pasuje do podanego wieku (za wcześnie - musisz mieć co najmniej ${VALIDATION_CONSTANTS.MIN_WORKING_AGE} lat). Najwcześniej: ${minYear}`,
  },
  workEndYear: {
    required: "Rok zakończenia pracy jest wymagany",
    beforeStart: "Rok zakończenia musi być po roku rozpoczęcia",
    tooLate: (max: number) => `Rok zakończenia nie może przekraczać ${max}`,
    belowRetirementAge: (sex: Sex, minAge: number, actualAge: number) =>
      `Minimalny wiek emerytalny dla ${
        sex === "F" ? "kobiet" : "mężczyzn"
      } to ${minAge} lat. Przy tym roku zakończenia będziesz mieć ${actualAge} lat. Zaznacz opcję wcześniejszej emerytury, jeśli dotyczy Cię specjalny tryb (np. służby mundurowe).`,
  },
  accountBalance: {
    negative: "Kapitał na koncie nie może być ujemny",
  },
  subAccountBalance: {
    negative: "Kapitał na subkoncie nie może być ujemny",
  },
  postalCode: {
    invalid: "Kod pocztowy musi być w formacie XX-XXX",
  },
} as const;
