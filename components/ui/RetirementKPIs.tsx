import React from "react";
import { SimulationResults, SimulationInputs } from "@/lib/types";
import { formatPLN } from "@/lib/utils/formatting";

interface RetirementKPIsProps {
  results: SimulationResults | null;
  inputs: SimulationInputs | null;
  isCalculating?: boolean;
}

export function RetirementKPIs({
  results,
  inputs,
  isCalculating = false,
}: RetirementKPIsProps) {
  if (!results || !inputs) {
    return null;
  }

  const currentYear = new Date().getFullYear();
  const yearsToRetirement = inputs.workEndYear - currentYear;
  const retirementAge = inputs.age + yearsToRetirement;

  const totalCapital =
    (inputs.accountBalance || 0) + (inputs.subAccountBalance || 0);

  const kpis = [
    {
      label: "Emerytura oczekiwana",
      value: formatPLN(inputs.monthlyGross * 0.6),
    },
    {
      label: "Wiek",
      value: `${retirementAge} lat`,
    },
    {
      label: "Płeć",
      value: inputs.sex === "M" ? "Mężczyzna" : "Kobieta",
    },
    {
      label: "Wysokość wynagrodzenia",
      value: formatPLN(inputs.monthlyGross),
    },
    {
      label: "Okresy choroby",
      value: inputs.includeL4 ? "Tak" : "Nie",
    },
    {
      label: "Środki na koncie",
      value: formatPLN(totalCapital),
    },
    {
      label: "Emerytura nominalna",
      value: formatPLN(results.nominalPension),
    },
    {
      label: "Emerytura urealniona",
      value: formatPLN(results.realPension),
    },
    {
      label: "Kod pocztowy",
      value: inputs.postalCode || "Nie podano",
    },
  ];

  return (
    <div className="bg-white border border-zus-grey-300 rounded-lg shadow-sm p-6 mb-8">
      <h2 className="text-xl font-bold text-zus-grey-900 mb-6">
        Szczegóły Symulacji
      </h2>
      <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-6 gap-4">
        {kpis.map((kpi, index) => (
          <div
            key={index}
            className={`bg-zus-grey-100 rounded-lg p-4 border border-zus-grey-300 ${
              isCalculating ? "opacity-50" : ""
            }`}
          >
            <div className="text-xs font-semibold text-zus-grey-600 uppercase tracking-wide mb-2">
              {kpi.label}
            </div>
            <div className="text-base font-bold text-zus-grey-900">
              {isCalculating ? "..." : kpi.value}
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}
