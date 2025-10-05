export const retirementAgeBySex = {
  M: 65,
  F: 60,
} as const;

export type Sex = keyof typeof retirementAgeBySex;
