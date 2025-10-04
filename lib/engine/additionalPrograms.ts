/**
 * Moduł obliczający kapitał z dodatkowych programów emerytalnych (PPK, IKZE)
 * Wykorzystuje formuły z lib/calculations.ts
 */

import {
  calculatePPKCapital,
  calculateIKZECapital,
  calculateTotalPension,
} from "../calculations";
import { RetirementPrograms, SalaryPathEntry } from "../types";

export interface CalculateAdditionalProgramsParams {
  salaryPath: SalaryPathEntry[];
  programs: RetirementPrograms;
}

export interface AdditionalProgramsResult {
  ppkCapital: number;
  ikzeCapital: number;
  ppkMonthlyPension: number;
  ikzeMonthlyPension: number;
  totalAdditionalCapital: number;
  totalAdditionalMonthlyPension: number;
}

/**
 * Oblicza kapitał zgromadzony w PPK i IKZE
 *
 * @param params - Ścieżka zarobkowa i konfiguracja programów
 * @returns Kapitały i miesięczne emerytury z PPK/IKZE
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
  let ikzeCapital = 0;

  // Oblicz kapitał PPK
  if (programs.ppk.enabled) {
    ppkCapital = calculatePPKCapital(
      employmentData,
      programs.ppk.employeeRate,
      programs.ppk.employerRate
    );
  }

  // Oblicz kapitał IKZE
  if (programs.ikze.enabled) {
    ikzeCapital = calculateIKZECapital(
      employmentData,
      programs.ikze.contributionRate
    );
  }

  // Przelicz kapitały na miesięczne emerytury
  // Używamy funkcji calculateTotalPension z 0 jako emerytura ZUS
  const breakdown = calculateTotalPension(0, ppkCapital, ikzeCapital);

  return {
    ppkCapital,
    ikzeCapital,
    ppkMonthlyPension: breakdown.ppkPension,
    ikzeMonthlyPension: breakdown.ikzePension,
    totalAdditionalCapital: ppkCapital + ikzeCapital,
    totalAdditionalMonthlyPension: breakdown.ppkPension + breakdown.ikzePension,
  };
}

/**
 * Łączy emeryturę z ZUS z dodatkowymi programami
 *
 * @param zusPension - Emerytura z ZUS (miesięczna)
 * @param additionalPrograms - Wynik obliczeń PPK/IKZE
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
    ikze: number;
  };
} {
  return {
    totalMonthlyPension:
      zusPension + additionalPrograms.totalAdditionalMonthlyPension,
    breakdown: {
      zus: zusPension,
      ppk: additionalPrograms.ppkMonthlyPension,
      ikze: additionalPrograms.ikzeMonthlyPension,
    },
  };
}

/**
 * Oblicza scenariusze deferral z uwzględnieniem PPK/IKZE
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
    ikze: number;
  };
  extended: {
    total: number;
    zus: number;
    ppk: number;
    ikze: number;
  };
  increase: {
    total: number;
    zus: number;
    ppk: number;
    ikze: number;
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
  const extendedCombined = combinePensions(
    extendedZUSPension,
    extendedPrograms
  );

  return {
    base: {
      total: baseCombined.totalMonthlyPension,
      zus: baseCombined.breakdown.zus,
      ppk: baseCombined.breakdown.ppk,
      ikze: baseCombined.breakdown.ikze,
    },
    extended: {
      total: extendedCombined.totalMonthlyPension,
      zus: extendedCombined.breakdown.zus,
      ppk: extendedCombined.breakdown.ppk,
      ikze: extendedCombined.breakdown.ikze,
    },
    increase: {
      total:
        extendedCombined.totalMonthlyPension - baseCombined.totalMonthlyPension,
      zus: extendedCombined.breakdown.zus - baseCombined.breakdown.zus,
      ppk: extendedCombined.breakdown.ppk - baseCombined.breakdown.ppk,
      ikze: extendedCombined.breakdown.ikze - baseCombined.breakdown.ikze,
    },
  };
}
