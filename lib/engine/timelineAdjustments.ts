import {
  EmploymentGapPeriod,
  EmploymentPeriod,
  LifeEvent,
  SalaryPathEntry,
  Sex,
} from "../types";
import { calculateEndDate } from "../utils/simulationHistory";

function monthsOverlapInYear(
  startYear: number,
  startMonth: number,
  endYear: number,
  endMonth: number,
  year: number
): number {
  if (year < startYear || year > endYear) return 0;
  const start = year === startYear ? startMonth : 1;
  const end = year === endYear ? endMonth : 12;
  return Math.max(0, end - start + 1);
}

function getMonthsAffectedByEvent(
  eventYear: number,
  eventMonth: number,
  durationMonths: number,
  targetYear: number
): number {
  const endDate = calculateEndDate(eventYear, eventMonth, durationMonths);
  return monthsOverlapInYear(
    eventYear,
    eventMonth,
    endDate.endYear,
    endDate.endMonth,
    targetYear
  );
}

export interface ApplyTimelineAdjustmentsParams {
  path: SalaryPathEntry[];
  contractPeriods?: EmploymentPeriod[];
  gapPeriods?: EmploymentGapPeriod[];
  lifeEvents?: LifeEvent[];
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
    let effectiveMonthly = entry.effectiveSalary ?? entry.monthlyGross;

    // Check if a custom employment period with different salary applies
    for (const period of contractPeriods) {
      const months = monthsOverlapInYear(
        period.startYear,
        period.startMonth || 1,
        period.endYear,
        period.endMonth || 12,
        year
      );
      if (months > 0) {
        effectiveMonthly = period.monthlyGross;
        break;
      }
    }

    // Apply gap periods - use durationMonths
    let reductionFactorFromGaps = 1;
    for (const gap of gapPeriods) {
      const months = getMonthsAffectedByEvent(
        gap.startYear,
        gap.startMonth,
        gap.durationMonths,
        year
      );
      if (months <= 0) continue;

      const ratio = months / 12;

      switch (gap.kind) {
        case "UNPAID_LEAVE":
        case "UNEMPLOYMENT":
          reductionFactorFromGaps *= 1 - ratio;
          break;
        case "MATERNITY_LEAVE":
          reductionFactorFromGaps *= 1 - ratio + ratio * 0.7;
          break;
      }
    }

    // Apply sick leave events - use durationYears
    for (const event of lifeEvents) {
      if (event.type !== "SICK_LEAVE" || !event.durationYears) continue;

      const durationMonths = event.durationYears * 12;
      const months = getMonthsAffectedByEvent(
        event.year,
        event.month || 1,
        durationMonths,
        year
      );

      if (months > 0) {
        const ratio = months / 12;
        reductionFactorFromGaps *= 1 - ratio * 0.3;
      }
    }

    const effectiveSalary = effectiveMonthly * reductionFactorFromGaps;

    return {
      ...entry,
      effectiveSalary,
    };
  });
}
