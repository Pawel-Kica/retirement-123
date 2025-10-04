import {
  EmploymentGapPeriod,
  EmploymentPeriod,
  LifeEvent,
  SalaryPathEntry,
  Sex,
} from "../types";

// Helper to compute how many months overlap within a year for a period
function monthsOverlapInYear(
  startYear: number,
  startMonth: number,
  endYear: number,
  endMonth: number,
  year: number
): number {
  const sYear = startYear;
  const eYear = endYear;
  if (year < sYear || year > eYear) return 0;
  const start = year === sYear ? startMonth : 1;
  const end = year === eYear ? endMonth : 12;
  return Math.max(0, end - start + 1);
}

export interface ApplyTimelineAdjustmentsParams {
  path: SalaryPathEntry[];
  contractPeriods?: EmploymentPeriod[];
  gapPeriods?: EmploymentGapPeriod[];
  lifeEvents?: LifeEvent[]; // long L4 as points with month/days
  sex: Sex;
}

export function applyTimelineAdjustments(
  params: ApplyTimelineAdjustmentsParams
): SalaryPathEntry[] {
  const {
    path,
    contractPeriods = [],
    gapPeriods = [],
    lifeEvents = [],
  } = params;

  return path.map((entry) => {
    const year = entry.year;

    // Base monthly salary
    let effectiveMonthly = entry.effectiveSalary ?? entry.monthlyGross;

    // Apply gap periods proportionally by months in the year
    let reductionFactorFromGaps = 1;
    for (const gap of gapPeriods) {
      const months = monthsOverlapInYear(
        gap.startYear,
        gap.startMonth,
        gap.endYear,
        gap.endMonth,
        year
      );
      if (months <= 0) continue;
      if (gap.kind === "UNPAID_LEAVE" || gap.kind === "UNEMPLOYMENT") {
        const ratio = months / 12;
        reductionFactorFromGaps *= 1 - ratio; // months without contributions
      }
      if (gap.kind === "MATERNITY_LEAVE") {
        const ratio = months / 12;
        // 70% contribution base for those months
        reductionFactorFromGaps *= 1 - ratio + ratio * 0.7;
      }
    }

    // Apply L4 events in this year (point events with days)
    const l4Days = lifeEvents
      .filter((e) => e.type === "SICK_LEAVE" && e.year === year)
      .reduce((sum, e) => sum + (e.days || 0), 0);
    if (l4Days > 0) {
      const l4Reduction = 1 - (Math.min(l4Days, 365) / 365) * 0.3;
      reductionFactorFromGaps *= l4Reduction;
    }

    const effectiveSalary = effectiveMonthly * reductionFactorFromGaps;

    return {
      ...entry,
      effectiveSalary,
    };
  });
}
