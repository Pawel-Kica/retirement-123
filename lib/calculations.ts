/**
 * Centralizacja wszystkich obliczeń i formuł systemu emerytalnego
 *
 * Ten plik zawiera:
 * - Stałe systemowe ZUS
 * - Formuły składek dla różnych typów umów (UOP, UOZ, B2B)
 * - Obliczenia PPK (Pracownicze Plany Kapitałowe)
 * - Obliczenia IKZP/PPE (Pracownicze Programy Emerytalne)
 * - Wpływ przerw w zatrudnieniu
 */

// ==========================================
// SEKCJA 1: STAŁE SYSTEMOWE ZUS
// ==========================================

/**
 * Stałe polskiego systemu emerytalnego (ZUS)
 * Źródło: Ustawa o systemie ubezpieczeń społecznych
 */
export const ZUS_CONSTANTS = {
  // Składka emerytalna podstawowa
  TOTAL_CONTRIBUTION_RATE: 0.1952, // 19.52% składka emerytalna (pracownik + pracodawca)

  // Podział składki emerytalnej na konta
  MAIN_ACCOUNT_SPLIT: 0.7616, // 76.16% trafia na konto główne (waloryzowane)
  SUB_ACCOUNT_SPLIT: 0.2384, // 23.84% trafia na subkonto (dla osób ur. po 1968)

  // Limity roczne (2025) - aktualizowane corocznie
  CONTRIBUTION_BASE_LIMIT_2025: 232440, // 30x przeciętnego wynagrodzenia
  MINIMUM_CONTRIBUTION_BASE: 4694, // Minimalna płaca krajowa 2025

  // Stopy składek pracownika i pracodawcy
  EMPLOYEE_PENSION_RATE: 0.0976, // 9.76% płaci pracownik
  EMPLOYER_PENSION_RATE: 0.0976, // 9.76% płaci pracodawca
} as const;

// ==========================================
// SEKCJA 2: TYPY UMÓW - RÓŻNICE W SKŁADKACH
// ==========================================

/**
 * Konfiguracja składek ZUS dla różnych typów umów
 */
export const CONTRACT_CONTRIBUTIONS = {
  UOP: {
    // Umowa o Pracę - pełne składki ZUS
    name: 'Umowa o Pracę',
    employeePensionRate: 0.0976, // 9.76% pracownik
    employerPensionRate: 0.0976, // 9.76% pracodawca
    totalPensionRate: 0.1952, // 19.52% łącznie na emeryturę
    disabilityRate: 0.08, // 8% na rentę
    sicknessRate: 0.0245, // 2.45% na chorobowe
    hasFullProtection: true, // Pełna ochrona socjalna
    description: 'Pełne składki ZUS, prawo do zasiłków chorobowych i macierzyńskich',
  },

  UOZ: {
    // Umowa Zlecenie - bez chorobowego (chyba że w statucie)
    name: 'Umowa Zlecenie',
    employeePensionRate: 0.0976,
    employerPensionRate: 0.0976,
    totalPensionRate: 0.1952,
    disabilityRate: 0.08,
    sicknessRate: 0, // Brak obowiązkowego chorobowego!
    hasFullProtection: false,
    description: 'Składki emerytalne i rentowe, zazwyczaj brak chorobowego',
  },

  B2B: {
    // Działalność gospodarcza - składki opcjonalne/minimalne
    name: 'Działalność / B2B',
    optionalPensionRate: 0.1952, // Jeśli płaci dobrowolnie pełne składki
    minimalBaseFactor: 0.6, // Może płacić od 60% przeciętnej
    minimalAbsoluteBase: 4694, // Lub od minimalnej krajowej
    hasFullProtection: false,
    customizable: true, // Może wybierać podstawę
    description: 'Składki opcjonalne, możliwość wyboru podstawy wymiaru',
  },
} as const;

// ==========================================
// SEKCJA 3: DODATKOWE PROGRAMY EMERYTALNE
// ==========================================

/**
 * Pracownicze Plany Kapitałowe (PPK)
 * Źródło: Ustawa o PPK z 2018 roku
 */
export const PPK_CONFIG = {
  // Składki domyślne
  defaultEmployeeRate: 0.02, // 2% podstawowa składka pracownika
  defaultEmployerRate: 0.015, // 1.5% podstawowa składka pracodawcy

  // Zakresy składek
  minEmployeeRate: 0.005, // Min 0.5% (można obniżyć deklaracją)
  maxEmployeeRate: 0.04, // Max 4%
  minEmployerRate: 0.015, // Min 1.5% (obowiązkowe)
  maxEmployerRate: 0.04, // Max 4%

  // Dopłaty państwa
  welcomeBonus: 250, // Wpłata powitalna (jednorazowo)
  annualBonusAmount: 240, // Dopłata roczna
  annualBonusIncomeLimit: 1.2, // Dla wynagrodzeń < 120% przeciętnej

  // Koszty
  managementFeeMax: 0.005, // Max 0.5% opłata za zarządzanie rocznie
  depositFeeMax: 0.01, // Max 1% opłata od wpłat

  // Prognoza zwrotu (konserwatywna)
  estimatedAnnualReturn: 0.05, // Szacowany realny zwrot 5% rocznie

  description: 'Pracownicze Plany Kapitałowe - długoterminowe oszczędzanie z dopłatami państwa',
} as const;

/**
 * Indywidualne Konta Zabezpieczenia Emerytalnego / Pracownicze Programy Emerytalne
 * (IKZE, PPE, IKE)
 */
export const IKZP_CONFIG = {
  // Składki
  defaultContributionRate: 0.10, // 10% typowa składka pracodawcy
  minContributionRate: 0.05, // Min 5%
  maxContributionRate: 0.15, // Max 15%

  // Ulgi podatkowe
  taxDeductible: true, // Zwolnione z podatku do limitu
  taxDeductionLimitIKZE: 9388, // IKZE: 1.2x przeciętnej rocznej (2025)
  taxDeductionLimitPPE: null, // PPE: zwykle brak limitu dla pracodawcy

  // Prognoza zwrotu
  estimatedAnnualReturn: 0.05, // Szacowany realny zwrot 5% rocznie

  description: 'Zakładowe programy emerytalne - dodatkowe oszczędności z korzyściami podatkowymi',
} as const;

// ==========================================
// SEKCJA 4: PRZERWY W ZATRUDNIENIU
// ==========================================

/**
 * Konfiguracja wpływu różnych przerw w zatrudnieniu
 */
export const EMPLOYMENT_GAP_CONFIG = {
  MATERNITY_LEAVE: {
    // Urlop macierzyński
    benefitRate: 0.7, // Średnio 70% normalnych składek
    description: 'Zasiłek macierzyński (100% przez 20 tyg, potem 60-80%)',
    contributionsPaid: true, // Składki są odprowadzane
    contributionBase: 0.7, // Od ~70% normalnej podstawy
  },

  UNPAID_LEAVE: {
    // Urlop bezpłatny
    benefitRate: 0, // Brak zasiłku
    description: 'Urlop bezpłatny - brak składek emerytalnych',
    contributionsPaid: false,
    contributionBase: 0,
  },

  LONG_TERM_SICK: {
    // Długotrwałe L4 (>33 dni)
    benefitRate: 0.7, // Zasiłek chorobowy: 80% przez 182 dni
    description: 'Zasiłek chorobowy (80% wynagrodzenia)',
    contributionsPaid: true,
    contributionBase: 0.7,
  },

  SHORT_TERM_SICK: {
    // Krótkie L4 (<=33 dni)
    benefitRate: 0.8, // Wynagrodzenie chorobowe: 80%
    description: 'Wynagrodzenie chorobowe (80% wynagrodzenia)',
    contributionsPaid: true,
    contributionBase: 0.8,
  },
} as const;

// ==========================================
// SEKCJA 5: FORMUŁY OBLICZENIOWE
// ==========================================

/**
 * Oblicza roczną składkę emerytalną dla danego typu umowy
 *
 * @param annualGross - Roczne wynagrodzenie brutto
 * @param contractType - Typ umowy (UOP/UOZ/B2B)
 * @param b2bCustomBase - Dla B2B: opcjonalna niestandardowa podstawa składek
 * @returns Roczna składka emerytalna w PLN
 */
export function calculatePensionContribution(
  annualGross: number,
  contractType: 'UOP' | 'UOZ' | 'B2B' = 'UOP',
  b2bCustomBase?: number
): number {
  // Dla B2B - może być niestandardowa podstawa
  if (contractType === 'B2B') {
    const base = b2bCustomBase || (ZUS_CONSTANTS.MINIMUM_CONTRIBUTION_BASE * 12);
    return base * CONTRACT_CONTRIBUTIONS.B2B.optionalPensionRate;
  }

  // Dla UOP i UOZ - standardowe 19.52% od wynagrodzenia
  const config = CONTRACT_CONTRIBUTIONS[contractType];

  // Sprawdź limit podstawy wymiaru
  const cappedGross = Math.min(annualGross, ZUS_CONSTANTS.CONTRIBUTION_BASE_LIMIT_2025);

  return cappedGross * config.totalPensionRate;
}

/**
 * Oblicza kapitał PPK zgromadzony do momentu emerytury
 *
 * @param employmentPeriods - Okresy zatrudnienia z rocznymi pensjami
 * @param employeeRate - Składka pracownika (domyślnie 2%)
 * @param employerRate - Składka pracodawcy (domyślnie 1.5%)
 * @param estimatedReturn - Szacowany roczny zwrot (domyślnie 5%)
 * @returns Kapitał PPK w PLN
 */
export function calculatePPKCapital(
  employmentPeriods: Array<{ year: number; annualGross: number }>,
  employeeRate: number = PPK_CONFIG.defaultEmployeeRate,
  employerRate: number = PPK_CONFIG.defaultEmployerRate,
  estimatedReturn: number = PPK_CONFIG.estimatedAnnualReturn
): number {
  if (employmentPeriods.length === 0) return 0;

  // Wpłata powitalna
  let capital = PPK_CONFIG.welcomeBonus;

  employmentPeriods.forEach((period, index) => {
    // Waloryzacja kapitału z poprzednich lat
    if (index > 0) {
      capital *= (1 + estimatedReturn);
    }

    // Składki roczne
    const employeeContribution = period.annualGross * employeeRate;
    const employerContribution = period.annualGross * employerRate;

    // Dopłata roczna (dla wynagrodzeń poniżej 120% przeciętnej - uproszczenie: < 80k PLN)
    const qualifiesForBonus = period.annualGross < 80000;
    const annualBonus = qualifiesForBonus ? PPK_CONFIG.annualBonusAmount : 0;

    // Opłaty (uproszczenie: opłata od wpłat + zarządzanie)
    const totalDeposit = employeeContribution + employerContribution + annualBonus;
    const depositFee = totalDeposit * PPK_CONFIG.depositFeeMax;
    const managementFee = capital * PPK_CONFIG.managementFeeMax;

    capital += totalDeposit - depositFee - managementFee;
  });

  return Math.max(0, capital);
}

/**
 * Oblicza kapitał IKZP/PPE zgromadzony do momentu emerytury
 *
 * @param employmentPeriods - Okresy zatrudnienia z rocznymi pensjami
 * @param contributionRate - Składka pracodawcy (domyślnie 10%)
 * @param estimatedReturn - Szacowany roczny zwrot (domyślnie 5%)
 * @returns Kapitał IKZP w PLN
 */
export function calculateIKZPCapital(
  employmentPeriods: Array<{ year: number; annualGross: number }>,
  contributionRate: number = IKZP_CONFIG.defaultContributionRate,
  estimatedReturn: number = IKZP_CONFIG.estimatedAnnualReturn
): number {
  if (employmentPeriods.length === 0) return 0;

  let capital = 0;

  employmentPeriods.forEach((period, index) => {
    // Waloryzacja kapitału z poprzednich lat
    if (index > 0) {
      capital *= (1 + estimatedReturn);
    }

    // Składka roczna od pracodawcy
    const annualContribution = period.annualGross * contributionRate;

    capital += annualContribution;
  });

  return Math.max(0, capital);
}

/**
 * Oblicza wpływ przerwy w zatrudnieniu na składki emerytalne
 *
 * @param baseMonthlyGross - Podstawowe miesięczne wynagrodzenie brutto
 * @param eventType - Typ przerwy w zatrudnieniu
 * @param durationMonths - Długość przerwy w miesiącach (1-12)
 * @returns Efektywna roczna pensja do obliczeń składek + szczegóły
 */
export function calculateEmploymentGapImpact(
  baseMonthlyGross: number,
  eventType: keyof typeof EMPLOYMENT_GAP_CONFIG,
  durationMonths: number
): {
  effectiveAnnualSalary: number;
  lostContributions: number;
  description: string;
  monthsAffected: number;
} {
  const config = EMPLOYMENT_GAP_CONFIG[eventType];

  // Miesiące normalne vs. dotknięte przerwą
  const monthsAffected = Math.min(durationMonths, 12);
  const monthsNormal = 12 - monthsAffected;

  // Składki od normalnych miesięcy
  const normalAnnualGross = baseMonthlyGross * monthsNormal;
  const normalContributions = normalAnnualGross * ZUS_CONSTANTS.TOTAL_CONTRIBUTION_RATE;

  // Składki od miesięcy z przerwą
  const affectedAnnualGross = baseMonthlyGross * monthsAffected;
  const affectedContributions = affectedAnnualGross * ZUS_CONSTANTS.TOTAL_CONTRIBUTION_RATE * config.contributionBase;

  // Łączne składki
  const totalContributions = normalContributions + affectedContributions;

  // Pełne składki (gdyby nie było przerwy)
  const fullYearContributions = baseMonthlyGross * 12 * ZUS_CONSTANTS.TOTAL_CONTRIBUTION_RATE;

  // Efektywna pensja roczna (dla celów obliczeń kapitału)
  const effectiveAnnualSalary = totalContributions / ZUS_CONSTANTS.TOTAL_CONTRIBUTION_RATE;

  return {
    effectiveAnnualSalary,
    lostContributions: fullYearContributions - totalContributions,
    description: config.description,
    monthsAffected,
  };
}

/**
 * Przelicza kapitał dodatkowy (PPK/IKZP) na miesięczną rentę
 * Uproszczenie: zakładamy 20-letni okres wypłat
 *
 * @param capital - Kapitał zgromadzony w PPK lub IKZP
 * @param payoutYears - Liczba lat wypłat (domyślnie 20)
 * @returns Miesięczna dodatkowa emerytura w PLN
 */
export function capitalToMonthlyPension(
  capital: number,
  payoutYears: number = 20
): number {
  const totalMonths = payoutYears * 12;
  return capital / totalMonths;
}

/**
 * Sumuje wszystkie źródła emerytury
 *
 * @param zusPension - Emerytura z ZUS
 * @param ppkCapital - Kapitał PPK (opcjonalnie)
 * @param ikzpCapital - Kapitał IKZP (opcjonalnie)
 * @returns Łączna miesięczna emerytura
 */
export function calculateTotalPension(
  zusPension: number,
  ppkCapital: number = 0,
  ikzpCapital: number = 0
): {
  zusPension: number;
  ppkPension: number;
  ikzpPension: number;
  totalPension: number;
} {
  const ppkPension = capitalToMonthlyPension(ppkCapital);
  const ikzpPension = capitalToMonthlyPension(ikzpCapital);

  return {
    zusPension,
    ppkPension,
    ikzpPension,
    totalPension: zusPension + ppkPension + ikzpPension,
  };
}

// ==========================================
// SEKCJA 6: UTILITY FUNCTIONS
// ==========================================

/**
 * Sprawdza czy dana pensja przekracza limit podstawy wymiaru składek
 */
export function isAboveContributionLimit(
  annualGross: number,
  year: number = 2025
): boolean {
  return annualGross > ZUS_CONSTANTS.CONTRIBUTION_BASE_LIMIT_2025;
}

/**
 * Formatuje opis typu umowy po polsku
 */
export function getContractTypeLabel(type: 'UOP' | 'UOZ' | 'B2B'): string {
  return CONTRACT_CONTRIBUTIONS[type].name;
}

/**
 * Formatuje opis typu wydarzenia po polsku
 */
export function getEmploymentGapLabel(type: keyof typeof EMPLOYMENT_GAP_CONFIG): string {
  const labels = {
    MATERNITY_LEAVE: 'Urlop macierzyński',
    UNPAID_LEAVE: 'Urlop bezpłatny',
    LONG_TERM_SICK: 'Długotrwałe zwolnienie chorobowe (L4 > 33 dni)',
    SHORT_TERM_SICK: 'Krótkie zwolnienie chorobowe (L4)',
  };
  return labels[type];
}

/**
 * Pobiera ikonę emoji dla typu umowy
 */
export function getContractTypeIcon(type: 'UOP' | 'UOZ' | 'B2B'): string {
  const icons = {
    UOP: '💼', // Teczka - pełny etat
    UOZ: '📝', // Dokument - zlecenie
    B2B: '🏢', // Biurowiec - działalność
  };
  return icons[type];
}

/**
 * Pobiera ikonę emoji dla typu wydarzenia
 */
export function getEmploymentGapIcon(type: keyof typeof EMPLOYMENT_GAP_CONFIG): string {
  const icons = {
    MATERNITY_LEAVE: '👶',
    UNPAID_LEAVE: '🏖️',
    LONG_TERM_SICK: '🏥',
    SHORT_TERM_SICK: '🤒',
  };
  return icons[type];
}
