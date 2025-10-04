/**
 * Validation utilities for form inputs
 */

import { SimulationInputs } from '../types';

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
export function validateSimulationInputs(inputs: Partial<SimulationInputs>): ValidationResult {
    const errors: ValidationError[] = [];
    const currentYear = new Date().getFullYear();

    // Age validation
    if (!inputs.age) {
        errors.push({ field: 'age', message: 'Wiek jest wymagany' });
    } else if (inputs.age < 18 || inputs.age > 70) {
        errors.push({ field: 'age', message: 'Wiek musi być w przedziale 18-70 lat' });
    }

    // Sex validation
    if (!inputs.sex) {
        errors.push({ field: 'sex', message: 'Płeć jest wymagana' });
    } else if (inputs.sex !== 'M' && inputs.sex !== 'F') {
        errors.push({ field: 'sex', message: 'Płeć musi być M lub F' });
    }

    // Salary validation
    if (!inputs.monthlyGross) {
        errors.push({ field: 'monthlyGross', message: 'Wynagrodzenie jest wymagane' });
    } else if (inputs.monthlyGross < 1000) {
        errors.push({ field: 'monthlyGross', message: 'Wynagrodzenie musi być co najmniej 1 000 zł' });
    } else if (inputs.monthlyGross > 100000) {
        errors.push({ field: 'monthlyGross', message: 'Wynagrodzenie nie może przekraczać 100 000 zł' });
    }

    // Work start year validation
    if (!inputs.workStartYear) {
        errors.push({ field: 'workStartYear', message: 'Rok rozpoczęcia pracy jest wymagany' });
    } else if (inputs.workStartYear > currentYear) {
        errors.push({ field: 'workStartYear', message: 'Rok rozpoczęcia nie może być w przyszłości' });
    } else if (inputs.age && inputs.workStartYear < currentYear - inputs.age + 15) {
        errors.push({ field: 'workStartYear', message: 'Rok rozpoczęcia pracy nie pasuje do podanego wieku (musisz mieć co najmniej 15 lat)' });
    }

    // Work end year validation
    if (!inputs.workEndYear) {
        errors.push({ field: 'workEndYear', message: 'Rok zakończenia pracy jest wymagany' });
    } else if (inputs.workStartYear && inputs.workEndYear <= inputs.workStartYear) {
        errors.push({ field: 'workEndYear', message: 'Rok zakończenia musi być po roku rozpoczęcia' });
    } else if (inputs.workEndYear > 2080) {
        errors.push({ field: 'workEndYear', message: 'Rok zakończenia nie może przekraczać 2080' });
    }

    // Optional balance validation
    if (inputs.accountBalance !== undefined && inputs.accountBalance < 0) {
        errors.push({ field: 'accountBalance', message: 'Kapitał na koncie nie może być ujemny' });
    }

    if (inputs.subAccountBalance !== undefined && inputs.subAccountBalance < 0) {
        errors.push({ field: 'subAccountBalance', message: 'Kapitał na subkoncie nie może być ujemny' });
    }

    // Postal code validation (if provided)
    if (inputs.postalCode && !/^\d{2}-\d{3}$/.test(inputs.postalCode)) {
        errors.push({ field: 'postalCode', message: 'Kod pocztowy musi być w formacie XX-XXX' });
    }

    return {
        isValid: errors.length === 0,
        errors,
    };
}

/**
 * Get error message for a specific field
 */
export function getFieldError(errors: ValidationError[], field: string): string | undefined {
    return errors.find(e => e.field === field)?.message;
}

/**
 * Check if field has error
 */
export function hasFieldError(errors: ValidationError[], field: string): boolean {
    return errors.some(e => e.field === field);
}

