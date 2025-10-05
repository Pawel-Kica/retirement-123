"use client";

import { useState } from "react";
import { Card } from "@/components/ui/Card";
import { formatPLN } from "@/lib/utils/formatting";
import { Briefcase, TrendingUp, ChevronDown } from "lucide-react";
import type { SimulationInputs } from "@/lib/types";
import { retirementAgeBySex } from "@/data/retirementAgeBySex";

interface WorkHistorySummaryProps {
  inputs: SimulationInputs;
}

export function WorkHistorySummary({ inputs }: WorkHistorySummaryProps) {
  const [expandedPeriods, setExpandedPeriods] = useState<Set<string>>(
    new Set()
  );

  if (!inputs.employmentPeriods || inputs.employmentPeriods.length === 0) {
    return null;
  }

  const currentYear = new Date().getFullYear();

  const togglePeriod = (periodId: string) => {
    setExpandedPeriods((prev) => {
      const newSet = new Set(prev);
      if (newSet.has(periodId)) {
        newSet.delete(periodId);
      } else {
        newSet.add(periodId);
      }
      return newSet;
    });
  };

  return (
    <Card className="mb-8">
      <div className="mb-6">
        <h2 className="text-2xl font-bold text-zus-grey-900 flex items-center gap-2">
          <Briefcase className="w-6 h-6 text-zus-green" />
          Historia zatrudnienia
        </h2>
        <p className="text-sm text-zus-grey-600 mt-2">
          <span className="font-semibold">Twoje dane:</span>{" "}
          {inputs.sex === "M" ? "Mężczyzna" : "Kobieta"} • {inputs.age} lat •
          Wiek emerytalny: {retirementAgeBySex[inputs.sex]} lat
        </p>
      </div>

      {/* Employment Periods List */}
      <div className="space-y-3">
        <h3 className="text-lg font-bold text-zus-grey-900 mb-3">
          Okresy zatrudnienia
        </h3>
        {inputs.employmentPeriods.map((period, index) => {
          const yearsWorked = period.endYear - period.startYear + 1;
          const ageAtStart = inputs.age + (period.startYear - currentYear);
          const ageAtEnd = inputs.age + (period.endYear - currentYear);
          const isCurrentPeriod =
            index === inputs.employmentPeriods!.length - 1;

          return (
            <div
              key={period.id}
              className={`p-4 rounded-lg border-2 ${
                isCurrentPeriod
                  ? "bg-zus-green-light border-zus-green"
                  : "bg-white border-zus-grey-300"
              }`}
            >
              <div className="flex items-start justify-between mb-3">
                <h4 className="font-bold text-zus-grey-900">
                  Okres {index + 1}
                </h4>
                <span className="text-sm font-semibold text-zus-grey-700">
                  {period.contractType === "UOP"
                    ? "💼 UOP"
                    : period.contractType === "UOZ"
                    ? "📝 Zlecenie"
                    : "🏢 B2B"}
                </span>
              </div>

              <div className="grid grid-cols-2 md:grid-cols-4 gap-3 text-sm">
                <div>
                  <span className="text-zus-grey-600 block text-xs mb-1">
                    Początek
                  </span>
                  <span className="font-bold text-zus-grey-900">
                    {period.startYear}
                  </span>
                  <span className="text-xs text-zus-grey-500 ml-1">
                    ({ageAtStart} lat)
                  </span>
                </div>
                <div>
                  <span className="text-zus-grey-600 block text-xs mb-1">
                    Koniec
                  </span>
                  <span className="font-bold text-zus-grey-900">
                    {period.endYear}
                  </span>
                  <span className="text-xs text-zus-grey-500 ml-1">
                    ({ageAtEnd} lat)
                  </span>
                </div>
                <div>
                  <span className="text-zus-grey-600 block text-xs mb-1">
                    Staż
                  </span>
                  <span className="font-bold text-zus-grey-900">
                    {yearsWorked} lat
                  </span>
                </div>
                <div>
                  <span className="text-zus-grey-600 block text-xs mb-1">
                    Wynagrodzenie
                  </span>
                  <span className="font-bold text-zus-green">
                    {formatPLN(period.monthlyGross)}
                  </span>
                </div>
              </div>

              {period.annualRaisePercentage !== undefined && (
                <div className="mt-3">
                  <button
                    onClick={() => togglePeriod(period.id)}
                    className="flex items-center gap-2 text-base hover:bg-zus-grey-100 rounded px-3 py-2 -mx-2 transition-colors w-full cursor-pointer"
                  >
                    <TrendingUp className="w-5 h-5 text-zus-blue" />
                    <span className="text-zus-grey-600">Roczna podwyżka:</span>
                    <span className="font-bold text-zus-blue">
                      +{period.annualRaisePercentage}%
                    </span>
                    <ChevronDown
                      className={`w-5 h-5 text-zus-grey-500 ml-auto transition-transform ${
                        expandedPeriods.has(period.id) ? "rotate-180" : ""
                      }`}
                    />
                  </button>

                  {/* Year-by-year salary breakdown */}
                  {expandedPeriods.has(period.id) && (
                    <div className="mt-2 bg-white/50 rounded p-2 border border-zus-grey-200">
                      <div className="grid grid-cols-4 md:grid-cols-6 gap-1 text-xs">
                        {Array.from({ length: yearsWorked }, (_, i) => {
                          const year = period.startYear + i;
                          const salary =
                            period.monthlyGross *
                            Math.pow(
                              1 + period.annualRaisePercentage! / 100,
                              i
                            );
                          return (
                            <div
                              key={year}
                              className="text-center py-1 px-1 rounded hover:bg-zus-green-light transition-colors"
                            >
                              <div className="text-zus-grey-500 font-medium">
                                {year}
                              </div>
                              <div className="font-bold text-zus-grey-900 whitespace-nowrap">
                                {formatPLN(salary)}
                              </div>
                            </div>
                          );
                        })}
                      </div>
                    </div>
                  )}
                </div>
              )}

              {period.description && (
                <div className="mt-3 pt-3 border-t border-zus-grey-300">
                  <p className="text-xs text-zus-grey-600">
                    {period.description}
                  </p>
                </div>
              )}
            </div>
          );
        })}
      </div>

      {/* Salary Progression */}
      {inputs.employmentPeriods.length > 1 && (
        <div className="mt-6 pt-6 border-t border-zus-grey-300">
          <h3 className="text-lg font-bold text-zus-grey-900 mb-3">
            Wzrost wynagrodzenia
          </h3>
          <div className="bg-gradient-to-r from-orange-50 to-purple-50 rounded-lg p-4 border border-purple-300">
            <div className="flex items-center justify-between">
              <div>
                <div className="text-xs text-zus-grey-600 mb-1">Od</div>
                <div className="text-xl font-bold text-orange-600">
                  {formatPLN(inputs.employmentPeriods[0].monthlyGross)}
                </div>
              </div>
              <TrendingUp className="w-8 h-8 text-zus-green" />
              <div>
                <div className="text-xs text-zus-grey-600 mb-1">Do</div>
                <div className="text-xl font-bold text-purple-600">
                  {formatPLN(
                    inputs.employmentPeriods[
                      inputs.employmentPeriods.length - 1
                    ].monthlyGross
                  )}
                </div>
              </div>
            </div>
            <div className="mt-3 text-center">
              <span className="text-sm text-zus-grey-700">
                Wzrost o{" "}
                <strong className="text-zus-green">
                  {(
                    ((inputs.employmentPeriods[
                      inputs.employmentPeriods.length - 1
                    ].monthlyGross -
                      inputs.employmentPeriods[0].monthlyGross) /
                      inputs.employmentPeriods[0].monthlyGross) *
                    100
                  ).toFixed(1)}
                  %
                </strong>
              </span>
            </div>
          </div>
        </div>
      )}
    </Card>
  );
}
