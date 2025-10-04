/**
 * ZUS Retirement Simulator - Pension Calculator Engine
 * Implements all calculation logic as per README.md specifications
 */

import type {
  UserInput,
  SalaryPath,
  CapitalHistory,
  PensionResult,
  WageGrowthData,
  CPIData,
  AveragePensionData,
  AnnuityDivisor,
  SickImpact,
  RetirementAge,
  PensionAmount,
  L4Impact,
  VsAverage,
  PostponementVariants,
} from '@/types';

// Import data files
import wageGrowthData from '@/data/wageGrowthByYear.json';
import cpiData from '@/data/cpiByYear.json';
import averagePensionData from '@/data/averagePensionByYear.json';
import annuityDivisorData from '@/data/annuityDivisor.json';
import sickImpactMData from '@/data/sickImpactM.json';
import sickImpactFData from '@/data/sickImpactF.json';
import retirementAgeData from '@/data/retirementAgeBySex.json';

const CONTRIBUTION_RATE = 0.1952; // 19.52% składka emerytalna
const CURRENT_YEAR = 2025; // Rok bieżący

/**
 * Krok 1: Budowa ścieżki płac (cofanie/projekcja)
 * Z dzisiejszego brutto wyznaczamy wartości dla lat przeszłych i przyszłych
 * używając średniego wzrostu płac (GUS/NBP)
 *
 * Start i koniec ZAWSZE w STYCZNIU wskazanych lat
 */
export function buildSalaryPath(
  currentSalary: number,
  currentYear: number,
  startYear: number,
  endYear: number,
  wageGrowth: WageGrowthData = wageGrowthData as WageGrowthData
): SalaryPath {
  const salaryPath: SalaryPath = [];

  // Dla każdego roku od startu do końca
  for (let year = startYear; year <= endYear; year++) {
    let salary: number;

    if (year === currentYear) {
      // Rok obecny - używamy podanej pensji
      salary = currentSalary;
    } else if (year < currentYear) {
      // Lata przeszłe - cofanie używając wzrostu płac
      // salary[pastYear] = currentSalary / Π(1 + wageGrowth[y]) for y in pastYear..currentYear-1
      let growthMultiplier = 1;
      for (let y = year; y < currentYear; y++) {
        const growth = wageGrowth[y.toString()] || 0.03; // domyślnie 3%
        growthMultiplier *= (1 + growth);
      }
      salary = currentSalary / growthMultiplier;
    } else {
      // Lata przyszłe - projekcja używając wzrostu płac
      // salary[futureYear] = currentSalary * Π(1 + wageGrowth[y]) for y in currentYear+1..futureYear
      let growthMultiplier = 1;
      for (let y = currentYear + 1; y <= year; y++) {
        const growth = wageGrowth[y.toString()] || 0.03;
        growthMultiplier *= (1 + growth);
      }
      salary = currentSalary * growthMultiplier;
    }

    salaryPath.push({
      year,
      monthly: salary,
      annual: salary * 12,
    });
  }

  return salaryPath;
}

/**
 * Krok 2: Zastosowanie wpływu L4
 * Dla K/M stosujemy średni roczny współczynnik redukcji bazy składkowej
 * Liczymy dwie ścieżki równolegle: BEZ L4 i Z L4
 */
export function applySickLeaveImpact(
  salaryPath: SalaryPath,
  gender: 'male' | 'female'
): { withoutL4: SalaryPath; withL4: SalaryPath } {
  const sickImpact: SickImpact = gender === 'male'
    ? (sickImpactMData as SickImpact)
    : (sickImpactFData as SickImpact);

  const reductionCoefficient = sickImpact.reductionCoefficient;

  const withoutL4 = salaryPath;
  const withL4 = salaryPath.map(point => ({
    year: point.year,
    monthly: point.monthly * (1 - reductionCoefficient),
    annual: point.annual * (1 - reductionCoefficient),
  }));

  return { withoutL4, withL4 };
}

/**
 * Krok 3: Akumulacja kapitału rok po roku
 * Na bazie (z/bez L4) naliczamy składki emerytalne i dopisujemy do KONTA
 * Subkonto waloryzujemy osobno
 * Coroczna waloryzacja kapitału zgodnie z przyjętymi wskaźnikami
 */
export function accumulateCapital(
  salaryPath: SalaryPath,
  startYear: number,
  endYear: number,
  initialAccount: number = 0,
  initialSubaccount: number = 0,
  wageGrowth: WageGrowthData = wageGrowthData as WageGrowthData
): CapitalHistory {
  const capitalHistory: CapitalHistory = [];

  let accountBalance = initialAccount;
  let subaccountBalance = initialSubaccount;

  for (let year = startYear; year <= endYear; year++) {
    const salaryPoint = salaryPath.find(p => p.year === year);
    if (!salaryPoint) continue;

    // Składka = 19.52% wynagrodzenia rocznego
    const contribution = salaryPoint.annual * CONTRIBUTION_RATE;

    // Podział składki: 80% na konto, 20% na subkonto (uproszczenie dla MVP)
    const accountContribution = contribution * 0.8;
    const subaccountContribution = contribution * 0.2;

    // Dodaj składki
    accountBalance += accountContribution;
    subaccountBalance += subaccountContribution;

    // Waloryzacja (na końcu roku)
    // Używamy wzrostu płac jako wskaźnika waloryzacji (uproszczenie)
    const valorizationRate = wageGrowth[year.toString()] || 0.03;
    accountBalance *= (1 + valorizationRate);
    subaccountBalance *= (1 + valorizationRate);

    capitalHistory.push({
      year,
      account: Math.round(accountBalance * 100) / 100,
      subaccount: Math.round(subaccountBalance * 100) / 100,
      total: Math.round((accountBalance + subaccountBalance) * 100) / 100,
    });
  }

  return capitalHistory;
}

/**
 * Krok 4: Emerytura nominalna
 * pension = (accountCapital + subaccountCapital) / divisor[gender][retirementAge]
 */
export function calculateNominalPension(
  totalCapital: number,
  retirementAge: number,
  gender: 'male' | 'female',
  divisor: AnnuityDivisor = annuityDivisorData as AnnuityDivisor
): number {
  const divisorValue = divisor[gender][retirementAge.toString()];

  if (!divisorValue) {
    // Jeśli brak dokładnego dzielnika, użyj najbliższego
    const ages = Object.keys(divisor[gender]).map(Number).sort((a, b) => a - b);
    const closestAge = ages.reduce((prev, curr) =>
      Math.abs(curr - retirementAge) < Math.abs(prev - retirementAge) ? curr : prev
    );
    return totalCapital / divisor[gender][closestAge.toString()];
  }

  return totalCapital / divisorValue;
}

/**
 * Krok 4b: Emerytura urealniona (w dzisiejszych zł)
 * realPension = nominalPension / (cumulativeCPI[retirementYear] / cumulativeCPI[currentYear])
 */
export function calculateRealPension(
  nominalPension: number,
  retirementYear: number,
  currentYear: number = CURRENT_YEAR,
  cpi: CPIData = cpiData as CPIData
): number {
  const cpiRetirement = cpi[retirementYear.toString()] || cpi[currentYear.toString()];
  const cpiCurrent = cpi[currentYear.toString()];

  const cumulativeCPI = cpiRetirement / cpiCurrent;
  return nominalPension / cumulativeCPI;
}

/**
 * Krok 5: Stopa zastąpienia
 * rate = (nominalPension / indexedSalary[retirementYear]) * 100
 */
export function calculateReplacementRate(
  nominalPension: number,
  salaryPath: SalaryPath,
  retirementYear: number
): number {
  const salaryAtRetirement = salaryPath.find(p => p.year === retirementYear);
  if (!salaryAtRetirement) return 0;

  return (nominalPension / salaryAtRetirement.monthly) * 100;
}

/**
 * Krok 5b: Porównanie do średniej
 * diff = userPension - averagePension[retirementYear]
 * percentage = (userPension / averagePension[retirementYear]) * 100
 */
export function compareToAverage(
  nominalPension: number,
  retirementYear: number,
  avgPension: AveragePensionData = averagePensionData as AveragePensionData
): VsAverage {
  const average = avgPension[retirementYear.toString()] || 3500;
  const diff = nominalPension - average;
  const percentage = (nominalPension / average) * 100;

  return { diff, percentage };
}

/**
 * Krok 6: Warianty odroczenia (+1, +2, +5 lat)
 * Extend salaryPath → continue contributions → recalculate z nowym wiekiem
 */
export function calculatePostponement(
  userInput: UserInput,
  baseNominalPension: number,
  baseRealPension: number,
  retirementAge: number
): PostponementVariants {
  const variants: PostponementVariants = {
    '+1': { nominal: 0, real: 0, increase: 0 },
    '+2': { nominal: 0, real: 0, increase: 0 },
    '+5': { nominal: 0, real: 0, increase: 0 },
  };

  for (const [key, years] of Object.entries({ '+1': 1, '+2': 2, '+5': 5 })) {
    const newEndYear = userInput.endYear + years;
    const newAge = retirementAge + years;

    // Extend salary path
    const extendedSalaryPath = buildSalaryPath(
      userInput.monthlySalary,
      CURRENT_YEAR,
      userInput.startYear,
      newEndYear
    );

    // Apply L4 if needed
    const { withL4 } = userInput.includeL4
      ? applySickLeaveImpact(extendedSalaryPath, userInput.gender)
      : { withL4: extendedSalaryPath };

    const salaryPathToUse = userInput.includeL4 ? withL4 : extendedSalaryPath;

    // Accumulate capital
    const capitalHistory = accumulateCapital(
      salaryPathToUse,
      userInput.startYear,
      newEndYear,
      userInput.accountBalance,
      userInput.subaccountBalance
    );

    const finalCapital = capitalHistory[capitalHistory.length - 1];
    const totalCapital = finalCapital ? finalCapital.total : 0;

    // Calculate pension with new age (shorter divisor)
    const nominal = calculateNominalPension(totalCapital, newAge, userInput.gender);
    const real = calculateRealPension(nominal, newEndYear);
    const increase = ((nominal - baseNominalPension) / baseNominalPension) * 100;

    variants[key as keyof PostponementVariants] = { nominal, real, increase };
  }

  return variants;
}

/**
 * Krok 7: Ile lat brakuje do oczekiwań
 * Iteracyjnie zwiększamy rok zakończenia do momentu osiągnięcia oczekiwanej kwoty
 * Max limit: sensowny zakres (np. wiek 75)
 */
export function findYearsToTarget(
  userInput: UserInput,
  expectedPension: number,
  baseRetirementYear: number,
  retirementAge: number
): number | null {
  const MAX_AGE = 75;
  const maxYears = MAX_AGE - retirementAge;

  for (let additionalYears = 1; additionalYears <= maxYears; additionalYears++) {
    const newEndYear = baseRetirementYear + additionalYears;
    const newAge = retirementAge + additionalYears;

    // Build extended salary path
    const extendedSalaryPath = buildSalaryPath(
      userInput.monthlySalary,
      CURRENT_YEAR,
      userInput.startYear,
      newEndYear
    );

    // Apply L4 if needed
    const { withL4 } = userInput.includeL4
      ? applySickLeaveImpact(extendedSalaryPath, userInput.gender)
      : { withL4: extendedSalaryPath };

    const salaryPathToUse = userInput.includeL4 ? withL4 : extendedSalaryPath;

    // Accumulate capital
    const capitalHistory = accumulateCapital(
      salaryPathToUse,
      userInput.startYear,
      newEndYear,
      userInput.accountBalance,
      userInput.subaccountBalance
    );

    const finalCapital = capitalHistory[capitalHistory.length - 1];
    const totalCapital = finalCapital ? finalCapital.total : 0;

    // Calculate pension
    const nominal = calculateNominalPension(totalCapital, newAge, userInput.gender);
    const real = calculateRealPension(nominal, newEndYear);

    // Check if target reached
    if (real >= expectedPension) {
      return additionalYears;
    }
  }

  return null; // Nieosiągalne w realistycznym zakresie
}

/**
 * MASTER FUNCTION: Główne obliczenia emerytury
 * Workflow:
 * 1. buildSalaryPath()
 * 2. applySickLeaveImpact() → dwie ścieżki
 * 3. accumulateCapital() dla obu ścieżek
 * 4. calculateNominalPension() dla obu
 * 5. calculateRealPension() dla obu
 * 6. calculateReplacementRate()
 * 7. compareToAverage()
 * 8. calculatePostponement(+1, +2, +5)
 * 9. findYearsToTarget()
 * 10. Return PensionResult
 */
export function calculatePension(userInput: UserInput): PensionResult {
  const currentYear = CURRENT_YEAR;
  const retirementAge = userInput.age + (userInput.endYear - currentYear);

  // 1. Build salary path
  const baseSalaryPath = buildSalaryPath(
    userInput.monthlySalary,
    currentYear,
    userInput.startYear,
    userInput.endYear
  );

  // 2. Apply L4 impact - dwie ścieżki równolegle
  const { withoutL4, withL4 } = applySickLeaveImpact(baseSalaryPath, userInput.gender);

  // 3. Accumulate capital for both scenarios
  const capitalHistoryWithoutL4 = accumulateCapital(
    withoutL4,
    userInput.startYear,
    userInput.endYear,
    userInput.accountBalance,
    userInput.subaccountBalance
  );

  const capitalHistoryWithL4 = accumulateCapital(
    withL4,
    userInput.startYear,
    userInput.endYear,
    userInput.accountBalance,
    userInput.subaccountBalance
  );

  // Use appropriate capital history based on L4 setting
  const capitalHistory = userInput.includeL4 ? capitalHistoryWithL4 : capitalHistoryWithoutL4;
  const finalCapital = capitalHistory[capitalHistory.length - 1];
  const totalCapital = finalCapital ? finalCapital.total : 0;

  // For L4 comparison
  const finalCapitalWithoutL4 = capitalHistoryWithoutL4[capitalHistoryWithoutL4.length - 1];
  const totalCapitalWithoutL4 = finalCapitalWithoutL4 ? finalCapitalWithoutL4.total : 0;

  const finalCapitalWithL4 = capitalHistoryWithL4[capitalHistoryWithL4.length - 1];
  const totalCapitalWithL4 = finalCapitalWithL4 ? finalCapitalWithL4.total : 0;

  // 4. Calculate nominal pension
  const nominal = calculateNominalPension(totalCapital, retirementAge, userInput.gender);
  const nominalWithoutL4 = calculateNominalPension(totalCapitalWithoutL4, retirementAge, userInput.gender);
  const nominalWithL4 = calculateNominalPension(totalCapitalWithL4, retirementAge, userInput.gender);

  // 5. Calculate real pension
  const real = calculateRealPension(nominal, userInput.endYear);
  const realWithoutL4 = calculateRealPension(nominalWithoutL4, userInput.endYear);
  const realWithL4 = calculateRealPension(nominalWithL4, userInput.endYear);

  // 6. Calculate replacement rate
  const salaryPathToUse = userInput.includeL4 ? withL4 : withoutL4;
  const replacementRate = calculateReplacementRate(nominal, salaryPathToUse, userInput.endYear);

  // 7. Compare to average
  const vsAverage = compareToAverage(nominal, userInput.endYear);

  // L4 Impact
  const l4Impact: L4Impact = {
    withoutL4: nominalWithoutL4,
    withL4: nominalWithL4,
    diff: nominalWithL4 - nominalWithoutL4,
    diffPercentage: ((nominalWithL4 - nominalWithoutL4) / nominalWithoutL4) * 100,
  };

  // 8. Calculate postponement variants
  const postponement = calculatePostponement(userInput, nominal, real, retirementAge);

  // 9. Find years to target
  const gapToExpected = userInput.expectedPension - real;
  const yearsToTarget = gapToExpected > 0
    ? findYearsToTarget(userInput, userInput.expectedPension, userInput.endYear, retirementAge)
    : null;

  return {
    nominal,
    real,
    replacementRate,
    vsAverage,
    l4Impact,
    postponement,
    gapToExpected,
    yearsToTarget,
    capitalHistory,
    salaryPath: salaryPathToUse,
    retirementYear: userInput.endYear,
  };
}
