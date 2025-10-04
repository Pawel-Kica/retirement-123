import React from "react";
import { SimulationResults, SimulationInputs } from "@/lib/types";
import { formatPLN } from "@/lib/utils/formatting";
import { TrendingUp, Wallet } from "lucide-react";

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

  const detailKpis = [
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
      label: "Kod pocztowy",
      value: inputs.postalCode || "Nie podano",
    },
  ];

  return (
    <div className="space-y-6 mb-8">
      {/* Main Pension KPIs */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        {/* Emerytura nominalna */}
        <div className="bg-gradient-to-br from-zus-green to-zus-green-dark rounded-xl shadow-lg p-6 text-white">
          <div className="flex items-center justify-between mb-3">
            <h3 className="text-sm font-semibold uppercase tracking-wide opacity-90">
              Emerytura Nominalna
            </h3>
            <TrendingUp className="w-6 h-6 opacity-80" />
          </div>
          <div
            className={`text-4xl font-bold mb-1 ${
              isCalculating ? "opacity-50" : ""
            }`}
          >
            {isCalculating ? "..." : formatPLN(results.nominalPension)}
          </div>
          <p className="text-xs opacity-75">
            Kwota przed uwzględnieniem inflacji
          </p>
        </div>

        {/* Emerytura urealniona */}
        <div className="bg-gradient-to-br from-zus-navy to-zus-blue rounded-xl shadow-lg p-6 text-white">
          <div className="flex items-center justify-between mb-3">
            <h3 className="text-sm font-semibold uppercase tracking-wide opacity-90">
              Emerytura Urealniona
            </h3>
            <Wallet className="w-6 h-6 opacity-80" />
          </div>
          <div
            className={`text-4xl font-bold mb-1 ${
              isCalculating ? "opacity-50" : ""
            }`}
          >
            {isCalculating ? "..." : formatPLN(results.realPension)}
          </div>
          <p className="text-xs opacity-75">
            Realna wartość z uwzględnieniem inflacji
          </p>
        </div>
      </div>

      {/* Simulation Details - Compact */}
      <div className="bg-white border border-zus-grey-300 rounded-lg shadow-sm p-5">
        <h2 className="text-lg font-bold text-zus-grey-900 mb-4">
          Szczegóły Symulacji
        </h2>
        <div className="grid grid-cols-2 md:grid-cols-4 lg:grid-cols-7 gap-3">
          {detailKpis.map((kpi, index) => (
            <div
              key={index}
              className={`bg-zus-grey-100 rounded-lg p-3 border border-zus-grey-300 ${
                isCalculating ? "opacity-50" : ""
              }`}
            >
              <div className="text-[10px] font-semibold text-zus-grey-600 uppercase tracking-wide mb-1">
                {kpi.label}
              </div>
              <div className="text-sm font-bold text-zus-grey-900">
                {isCalculating ? "..." : kpi.value}
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}
