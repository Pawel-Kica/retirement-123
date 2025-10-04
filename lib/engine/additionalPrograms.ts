/**
 * Moduł obliczający kapitał z dodatkowych programów emerytalnych (PPK, IKZP)
 * Wykorzystuje formuły z lib/calculations.ts
 */

import {
  calculatePPKCapital,
  calculateIKZPCapital,
  calculateTotalPension,
} from "../calculations";
import { RetirementPrograms, SalaryPathEntry } from "../types";

export interface CalculateAdditionalProgramsParams {
  salaryPath: SalaryPathEntry[];
  programs: RetirementPrograms;
}

export interface AdditionalProgramsResult {
  ppkCapital: number;
  ikzpCapital: number;
  ppkMonthlyPension: number;
  ikzpMonthlyPension: number;
  totalAdditionalCapital: number;
  totalAdditionalMonthlyPension: number;
}

/**
 * Oblicza kapitał zgromadzony w PPK i IKZP
 *
 * @param params - Ścieżka zarobkowa i konfiguracja programów
 * @returns Kapitały i miesięczne emerytury z PPK/IKZP
 */
export function calculateAdditionalProgramsCapital(
  params: CalculateAdditionalProgramsParams
): AdditionalProgramsResult {
  const { salaryPath, programs } = params;

  // Konwersja ścieżki zarobkowej na format dla obliczeń
  const employmentData = salaryPath.map((entry) => ({
    year: entry.year,
    annualGross: entry.annualGross,
  }));

  let ppkCapital = 0;
  let ikzpCapital = 0;

  // Oblicz kapitał PPK
  if (programs.ppk.enabled) {
    ppkCapital = calculatePPKCapital(
      employmentData,
      programs.ppk.employeeRate,
      programs.ppk.employerRate
    );
  }

  // Oblicz kapitał IKZP
  if (programs.ikzp.enabled) {
    ikzpCapital = calculateIKZPCapital(
      employmentData,
      programs.ikzp.contributionRate
    );
  }

  // Przelicz kapitały na miesięczne emerytury
  // Używamy funkcji calculateTotalPension z 0 jako emerytura ZUS
  const breakdown = calculateTotalPension(0, ppkCapital, ikzpCapital);

  return {
    ppkCapital,
    ikzpCapital,
    ppkMonthlyPension: breakdown.ppkPension,
    ikzpMonthlyPension: breakdown.ikzpPension,
    totalAdditionalCapital: ppkCapital + ikzpCapital,
    totalAdditionalMonthlyPension: breakdown.ppkPension + breakdown.ikzpPension,
  };
}

/**
 * Łączy emeryturę z ZUS z dodatkowymi programami
 *
 * @param zusPension - Emerytura z ZUS (miesięczna)
 * @param additionalPrograms - Wynik obliczeń PPK/IKZP
 * @returns Łączna emerytura i podział na źródła
 */
export function combinePensions(
  zusPension: number,
  additionalPrograms: AdditionalProgramsResult
): {
  totalMonthlyPension: number;
  breakdown: {
    zus: number;
    ppk: number;
    ikzp: number;
  };
} {
  return {
    totalMonthlyPension:
      zusPension + additionalPrograms.totalAdditionalMonthlyPension,
    breakdown: {
      zus: zusPension,
      ppk: additionalPrograms.ppkMonthlyPension,
      ikzp: additionalPrograms.ikzpMonthlyPension,
    },
  };
}

/**
 * Oblicza scenariusze deferral z uwzględnieniem PPK/IKZP
 * Używane do pokazania jak wzrasta emerytura przy dłuższej pracy
 */
export function calculateDeferralWithPrograms(
  baseSalaryPath: SalaryPathEntry[],
  extendedSalaryPath: SalaryPathEntry[],
  programs: RetirementPrograms,
  baseZUSPension: number,
  extendedZUSPension: number
): {
  base: {
    total: number;
    zus: number;
    ppk: number;
    ikzp: number;
  };
  extended: {
    total: number;
    zus: number;
    ppk: number;
    ikzp: number;
  };
  increase: {
    total: number;
    zus: number;
    ppk: number;
    ikzp: number;
  };
} {
  // Oblicz programy dla bazowego scenariusza
  const basePrograms = calculateAdditionalProgramsCapital({
    salaryPath: baseSalaryPath,
    programs,
  });

  // Oblicz programy dla rozszerzonego scenariusza
  const extendedPrograms = calculateAdditionalProgramsCapital({
    salaryPath: extendedSalaryPath,
    programs,
  });

  const baseCombined = combinePensions(baseZUSPension, basePrograms);
  const extendedCombined = combinePensions(extendedZUSPension, extendedPrograms);

  return {
    base: {
      total: baseCombined.totalMonthlyPension,
      zus: baseCombined.breakdown.zus,
      ppk: baseCombined.breakdown.ppk,
      ikzp: baseCombined.breakdown.ikzp,
    },
    extended: {
      total: extendedCombined.totalMonthlyPension,
      zus: extendedCombined.breakdown.zus,
      ppk: extendedCombined.breakdown.ppk,
      ikzp: extendedCombined.breakdown.ikzp,
    },
    increase: {
      total:
        extendedCombined.totalMonthlyPension -
        baseCombined.totalMonthlyPension,
      zus: extendedCombined.breakdown.zus - baseCombined.breakdown.zus,
      ppk: extendedCombined.breakdown.ppk - baseCombined.breakdown.ppk,
      ikzp: extendedCombined.breakdown.ikzp - baseCombined.breakdown.ikzp,
    },
  };
}
