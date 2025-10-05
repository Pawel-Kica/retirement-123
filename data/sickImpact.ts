export const sickImpact = {
  M: {
    avgDaysPerYear: 14,
    reductionCoefficient: 0.985,
  },
  F: {
    avgDaysPerYear: 18,
    reductionCoefficient: 0.978,
  },
} as const;

export type SickImpactData = typeof sickImpact;
