import { EmploymentPeriod, EmploymentGapPeriod, LifeEvent } from "../types";
import { calculateEndDate } from "./simulationHistory";

export interface ValidationError {
  type: "error" | "warning";
  field?: string;
  message: string;
}

export function validateEmploymentPeriod(
  period: Partial<EmploymentPeriod>,
  existingPeriods: EmploymentPeriod[],
  editingId?: string
): ValidationError[] {
  const errors: ValidationError[] = [];

  if (!period.startYear) {
    errors.push({
      type: "error",
      field: "startYear",
      message: "Rok rozpoczęcia jest wymagany",
    });
  }

  if (!period.endYear) {
    errors.push({
      type: "error",
      field: "endYear",
      message: "Rok zakończenia jest wymagany",
    });
  }

  if (!period.monthlyGross || period.monthlyGross < 1000) {
    errors.push({
      type: "error",
      field: "monthlyGross",
      message: "Wynagrodzenie musi wynosić co najmniej 1 000 zł",
    });
  }

  if (period.startYear && period.endYear) {
    const startTotalMonths = period.startYear * 12 + (period.startMonth || 1);
    const endTotalMonths = period.endYear * 12 + (period.endMonth || 12);

    if (endTotalMonths < startTotalMonths) {
      errors.push({
        type: "error",
        field: "endYear",
        message: "Data zakończenia musi być późniejsza lub równa dacie rozpoczęcia",
      });
    }
  }

  return errors;
}

export function validateGapPeriod(
  gap: Partial<EmploymentGapPeriod>,
  existingGaps: EmploymentGapPeriod[],
  editingId?: string
): ValidationError[] {
  const errors: ValidationError[] = [];

  if (!gap.startYear) {
    errors.push({
      type: "error",
      field: "startYear",
      message: "Rok rozpoczęcia jest wymagany",
    });
  }

  if (!gap.startMonth) {
    errors.push({
      type: "error",
      field: "startMonth",
      message: "Miesiąc rozpoczęcia jest wymagany",
    });
  }

  if (!gap.durationMonths || gap.durationMonths < 1) {
    errors.push({
      type: "error",
      field: "durationMonths",
      message: "Czas trwania musi wynosić co najmniej 1 miesiąc",
    });
  }

  if (gap.durationMonths && gap.durationMonths > 36) {
    errors.push({
      type: "error",
      field: "durationMonths",
      message: "Czas trwania nie może przekraczać 36 miesięcy (3 lat)",
    });
  }

  if (!gap.kind) {
    errors.push({
      type: "error",
      field: "kind",
      message: "Typ przerwy jest wymagany",
    });
  }

  if (gap.startYear && gap.startMonth && gap.durationMonths) {
    const { endYear, endMonth } = calculateEndDate(
      gap.startYear,
      gap.startMonth,
      gap.durationMonths
    );

    const startTotalMonths = gap.startYear * 12 + gap.startMonth;
    const endTotalMonths = endYear * 12 + endMonth;

    const otherGaps = existingGaps.filter((g) => g.id !== editingId);
    for (const existing of otherGaps) {
      const existingEnd = calculateEndDate(
        existing.startYear,
        existing.startMonth,
        existing.durationMonths
      );
      const existingStart = existing.startYear * 12 + existing.startMonth;
      const existingEndTotal = existingEnd.endYear * 12 + existingEnd.endMonth;

      const hasOverlap =
        startTotalMonths <= existingEndTotal && endTotalMonths >= existingStart;

      if (hasOverlap) {
        errors.push({
          type: "warning",
          field: "startYear",
          message: `Okres pokrywa się z inną przerwą (${existing.startMonth}/${existing.startYear})`,
        });
        break;
      }
    }
  }

  return errors;
}

export function validateSickLeave(
  event: Partial<LifeEvent>,
  existingEvents: LifeEvent[],
  editingId?: string
): ValidationError[] {
  const errors: ValidationError[] = [];

  if (!event.year) {
    errors.push({
      type: "error",
      field: "year",
      message: "Rok jest wymagany",
    });
  }

  if (!event.month) {
    errors.push({
      type: "error",
      field: "month",
      message: "Miesiąc jest wymagany",
    });
  }

  if (!event.durationYears || event.durationYears < 0.5) {
    errors.push({
      type: "error",
      field: "durationYears",
      message: "Czas trwania musi wynosić co najmniej pół roku",
    });
  }

  if (event.durationYears && event.durationYears > 3) {
    errors.push({
      type: "error",
      field: "durationYears",
      message: "Czas trwania nie może przekraczać 3 lat",
    });
  }

  if (event.year && event.month && event.durationYears) {
    const durationMonths = event.durationYears * 12;
    const { endYear } = calculateEndDate(
      event.year,
      event.month,
      durationMonths
    );

    const otherEvents = existingEvents.filter(
      (e) => e.id !== editingId && e.type === "SICK_LEAVE"
    );
    for (const existing of otherEvents) {
      if (existing.year === event.year || existing.year === endYear) {
        errors.push({
          type: "warning",
          field: "year",
          message: `W tym roku istnieje już zwolnienie lekarskie`,
        });
        break;
      }
    }
  }

  return errors;
}

export function validateTimelineConsistency(
  contractPeriods: EmploymentPeriod[],
  gapPeriods: EmploymentGapPeriod[],
  lifeEvents: LifeEvent[]
): ValidationError[] {
  const warnings: ValidationError[] = [];

  const totalCareerMonths = contractPeriods.reduce((sum, period) => {
    const start = period.startYear * 12 + (period.startMonth || 1);
    const end = period.endYear * 12 + (period.endMonth || 12);
    return sum + (end - start + 1);
  }, 0);

  const totalGapMonths = gapPeriods.reduce((sum, gap) => {
    return sum + gap.durationMonths;
  }, 0);

  if (totalGapMonths > totalCareerMonths * 0.2) {
    warnings.push({
      type: "warning",
      message: "Przerwy w karierze stanowią ponad 20% całkowitego czasu pracy",
    });
  }

  return warnings;
}
