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

      {/* Employment Periods List - Compact */}
      <div className="space-y-2">
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
              className={`p-3 rounded-lg border ${
                isCurrentPeriod
                  ? "bg-zus-green-light border-zus-green"
                  : "bg-white border-zus-grey-300"
              }`}
            >
              {/* Compact inline layout */}
              <div className="flex items-center gap-4 flex-wrap text-sm">
                <div className="font-bold text-zus-grey-900 min-w-[60px]">
                  Okres {index + 1}
                </div>
                <div className="flex items-center gap-1">
                  <span className="text-xs font-semibold px-2 py-0.5 bg-zus-grey-100 rounded">
                    {period.contractType === "UOP"
                      ? "💼 UOP"
                      : period.contractType === "UOZ"
                      ? "📝 UOZ"
                      : "🏢 B2B"}
                  </span>
                </div>
                <div className="text-zus-grey-700">
                  <span className="text-xs text-zus-grey-500">Początek</span>{" "}
                  <span className="font-semibold">{period.startYear}</span>
                  <span className="text-xs text-zus-grey-500 ml-1">
                    ({ageAtStart} lat)
                  </span>
                </div>
                <div className="text-zus-grey-700">
                  <span className="text-xs text-zus-grey-500">Koniec</span>{" "}
                  <span className="font-semibold">{period.endYear}</span>
                  <span className="text-xs text-zus-grey-500 ml-1">
                    ({ageAtEnd} lat)
                  </span>
                </div>
                <div className="text-zus-grey-700">
                  <span className="text-xs text-zus-grey-500">Staż</span>{" "}
                  <span className="font-semibold">{yearsWorked} lat</span>
                </div>
                <div className="ml-auto">
                  <span className="text-xs text-zus-grey-500">
                    Wynagrodzenie
                  </span>{" "}
                  <span className="font-bold text-zus-green">
                    {formatPLN(period.monthlyGross)}
                  </span>
                </div>
              </div>

              {/* Description on separate line if exists */}
              {period.description && (
                <div className="mt-2 pt-2 border-t border-zus-grey-200">
                  <p className="text-xs text-zus-grey-600 italic">
                    {period.description}
                  </p>
                </div>
              )}
            </div>
          );
        })}
      </div>
    </Card>
  );
}
