/**
 * Validation utilities for form inputs
 */

import { SimulationInputs } from "../types";
import {
  VALIDATION_CONSTANTS,
  RETIREMENT_AGES,
  ERROR_MESSAGES,
  calculateBirthYear,
  calculateMinWorkStartYear,
  calculateRetirementAge,
} from "../config/validationRules";

export interface ValidationError {
  field: string;
  message: string;
}

export interface ValidationResult {
  isValid: boolean;
  errors: ValidationError[];
}

/**
 * Validate simulation inputs
 */
export function validateSimulationInputs(
  inputs: Partial<SimulationInputs>
): ValidationResult {
  const errors: ValidationError[] = [];
  const currentYear = new Date().getFullYear();

  // Age validation
  if (!inputs.age) {
    errors.push({ field: "age", message: "Wiek jest wymagany" });
  } else if (inputs.age < VALIDATION_CONSTANTS.MIN_AGE) {
    errors.push({
      field: "age",
      message: `Musisz mieć co najmniej ${VALIDATION_CONSTANTS.MIN_AGE} lat`,
    });
  } else if (inputs.age > VALIDATION_CONSTANTS.MAX_AGE) {
    errors.push({
      field: "age",
      message: `Wiek nie może przekraczać ${VALIDATION_CONSTANTS.MAX_AGE} lat`,
    });
  }

  // Sex validation
  if (!inputs.sex) {
    errors.push({ field: "sex", message: "Płeć jest wymagana" });
  } else if (inputs.sex !== "M" && inputs.sex !== "F") {
    errors.push({ field: "sex", message: "Płeć musi być M lub F" });
  }

  // Salary validation
  if (!inputs.monthlyGross) {
    errors.push({
      field: "monthlyGross",
      message: "Wynagrodzenie jest wymagane",
    });
  } else if (inputs.monthlyGross < 1000) {
    errors.push({
      field: "monthlyGross",
      message: "Wynagrodzenie musi być co najmniej 1 000 zł",
    });
  } else if (inputs.monthlyGross > 100000) {
    errors.push({
      field: "monthlyGross",
      message: "Wynagrodzenie nie może przekraczać 100 000 zł",
    });
  }

  // Work start year validation
  if (!inputs.workStartYear) {
    errors.push({
      field: "workStartYear",
      message: "Rok rozpoczęcia pracy jest wymagany",
    });
  } else if (inputs.workStartYear > currentYear) {
    errors.push({
      field: "workStartYear",
      message: "Rok rozpoczęcia nie może być w przyszłości",
    });
  } else if (inputs.age) {
    const birthYear = calculateBirthYear(inputs.age, currentYear);
    const minWorkStartYear = calculateMinWorkStartYear(birthYear);
    if (inputs.workStartYear < minWorkStartYear) {
      errors.push({
        field: "workStartYear",
        message: `Rok rozpoczęcia pracy nie pasuje do podanego wieku. Najwcześniejszy możliwy rok: ${minWorkStartYear} (wiek 18 lat)`,
      });
    }
  }

  // Work end year validation
  if (!inputs.workEndYear) {
    errors.push({
      field: "workEndYear",
      message: "Rok zakończenia pracy jest wymagany",
    });
  } else if (
    inputs.workStartYear &&
    inputs.workEndYear <= inputs.workStartYear
  ) {
    errors.push({
      field: "workEndYear",
      message: "Rok zakończenia musi być po roku rozpoczęcia",
    });
  } else if (inputs.workEndYear > 2080) {
    errors.push({
      field: "workEndYear",
      message: "Rok zakończenia nie może przekraczać 2080",
    });
  }

  // Minimum retirement age validation (unless early retirement for special professions)
  if (
    inputs.age &&
    inputs.sex &&
    inputs.workEndYear &&
    !inputs.earlyRetirement
  ) {
    const retirementAge = inputs.age + (inputs.workEndYear - currentYear);
    const minRetirementAge = inputs.sex === "F" ? 60 : 65;

    if (retirementAge < minRetirementAge) {
      errors.push({
        field: "workEndYear",
        message: `Minimalny wiek emerytalny dla ${
          inputs.sex === "F" ? "kobiet" : "mężczyzn"
        } to ${minRetirementAge} lat. Przy tym roku zakończenia będziesz mieć ${retirementAge} lat. Zaznacz opcję wcześniejszej emerytury, jeśli dotyczy Cię specjalny tryb (np. służby mundurowe).`,
      });
    }
  }

  // Optional balance validation
  if (inputs.accountBalance !== undefined && inputs.accountBalance < 0) {
    errors.push({
      field: "accountBalance",
      message: "Kapitał na koncie nie może być ujemny",
    });
  }

  if (inputs.subAccountBalance !== undefined && inputs.subAccountBalance < 0) {
    errors.push({
      field: "subAccountBalance",
      message: "Kapitał na subkoncie nie może być ujemny",
    });
  }

  // Postal code validation (if provided)
  if (inputs.postalCode && !/^\d{2}-\d{3}$/.test(inputs.postalCode)) {
    errors.push({
      field: "postalCode",
      message: "Kod pocztowy musi być w formacie XX-XXX",
    });
  }

  return {
    isValid: errors.length === 0,
    errors,
  };
}

/**
 * Get error message for a specific field
 */
export function getFieldError(
  errors: ValidationError[],
  field: string
): string | undefined {
  return errors.find((e) => e.field === field)?.message;
}

/**
 * Check if field has error
 */
export function hasFieldError(
  errors: ValidationError[],
  field: string
): boolean {
  return errors.some((e) => e.field === field);
}
