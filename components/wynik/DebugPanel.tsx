"use client";

import { useState, useEffect } from "react";
import { Card } from "@/components/ui/Card";
import { Button } from "@/components/ui/Button";
import { ChevronDown, ChevronUp, Bug } from "lucide-react";
import { formatPLN } from "@/lib/utils/formatting";
import { calculateStartingSalary } from "@/lib/utils/csvParser";
import { getWageGrowthByYear } from "@/data/tables/wageGrowthByYear";
import type { SimulationResults, SimulationInputs } from "@/lib/types";

interface DebugPanelProps {
  results: SimulationResults;
  inputs: SimulationInputs;
  expectedPension: number;
  waloryzacjaData?: Record<string, number>;
}

export function DebugPanel({ results, inputs, expectedPension, waloryzacjaData }: DebugPanelProps) {
  const [isOpen, setIsOpen] = useState(true); // Open by default when debug is enabled
  const [startingSalaries, setStartingSalaries] = useState<Record<string, number>>({});

  // Only show if DEBUG_PROGNOSIS is enabled
  if (process.env.NODE_ENV !== 'development' || process.env.NEXT_PUBLIC_DEBUG_PROGNOSIS !== 'true') {
    return null;
  }

  if (!results || !inputs) return null;

  const currentYear = new Date().getFullYear();
  const retirementYear = inputs.workEndYear;
  const retirementAge = inputs.age + (retirementYear - currentYear);

  // Get waloryzacja rate for current year
  const currentYearStr = currentYear.toString();
  const waloryzacjaRate = waloryzacjaData?.[currentYearStr] || 1.035; // Fallback to 3.5% annual

  // Calculate starting salaries
  useEffect(() => {
    const loadData = async () => {
      try {
        const wageDataResponse = await getWageGrowthByYear();
        // Extract only the data part, excluding metadata
        const { _metadata, ...wageData } = wageDataResponse;
        const salaries: Record<string, number> = {};
        inputs.employmentPeriods?.forEach((period) => {
          const startingSalary = calculateStartingSalary(
            period.monthlyGross,
            period.startYear,
            period.endYear,
            wageData
          );
          salaries[period.id] = startingSalary;
        });
        setStartingSalaries(salaries);
      } catch (error) {
        console.error("Error loading wage growth data:", error);
      }
    };

    loadData();
  }, [inputs.employmentPeriods]);

  return (
    <div className={`fixed top-[100px] right-0 z-30 ${isOpen ? 'w-[600px] h-[700px]' : 'w-[300px] h-auto'}`}>
      <Card className="bg-white border-2 border-blue-500 shadow-lg h-full flex flex-col p-0">
        {/* Header */}
        <div className="flex items-center justify-between p-2 bg-blue-50 border-b border-blue-200">
          <div className="flex items-center gap-2">
            <Bug className="w-4 h-4 text-blue-600" />
            <span className="font-semibold text-blue-900">Panel Debugowania</span>
          </div>
          <Button
            variant="ghost"
            size="sm"
            onClick={() => setIsOpen(!isOpen)}
            className="p-1 h-auto"
          >
            {isOpen ? (
              <ChevronDown className="w-4 h-4" />
            ) : (
              <ChevronUp className="w-4 h-4" />
            )}
          </Button>
        </div>

        {/* Content */}
        {isOpen && (
          <div className="p-2 flex-1 overflow-y-auto">
            <div className="grid grid-cols-1 gap-4 h-full">
              {/* Left Column */}
              <div className="space-y-4">
                {/* Core Parameters */}
                <div className="space-y-2">
                  <h4 className="font-semibold text-sm text-gray-700 border-b pb-1">
                    Parametry Podstawowe
                  </h4>
                  <div className="grid grid-cols-2 gap-2 text-xs">
                <div>
                  <span className="text-gray-500">Wiek obecny:</span>
                  <span className="font-mono ml-1">{inputs.age}</span>
                </div>
                <div>
                  <span className="text-gray-500">Wiek emerytalny:</span>
                  <span className="font-mono ml-1">{retirementAge}</span>
                </div>
                <div>
                  <span className="text-gray-500">Rok emerytury:</span>
                  <span className="font-mono ml-1">{retirementYear}</span>
                </div>
                <div>
                  <span className="text-gray-500">Płeć:</span>
                  <span className="font-mono ml-1">{inputs.sex}</span>
                </div>
                <div>
                  <span className="text-gray-500">Saldo główne:</span>
                  <span className="font-mono ml-1">
                    {formatPLN(inputs.accountBalance || 0)}
                  </span>
                </div>
                <div>
                  <span className="text-gray-500">Saldo sub:</span>
                  <span className="font-mono ml-1">
                    {formatPLN(inputs.subAccountBalance || 0)}
                  </span>
                </div>
                <div>
                  <span className="text-gray-500">Oczekiwana emerytura:</span>
                  <span className="font-mono ml-1 text-green-600">
                    {formatPLN(expectedPension)}
                  </span>
                </div>
                <div>
                  <span className="text-gray-500">Stopa waloryzacji:</span>
                  <span className="font-mono ml-1">{waloryzacjaRate.toFixed(3)}</span>
                </div>
                  </div>
                </div>

            {/* Employment Periods */}
            <div className="space-y-2">
              <h4 className="font-semibold text-sm text-gray-700 border-b pb-1">
                Okresy Zatrudnienia
              </h4>
              <div className="space-y-1 text-xs">
                {inputs.employmentPeriods?.map((period, index) => (
                  <div key={index} className="flex justify-between items-center bg-gray-50 p-2 rounded">
                    <div>
                      <span className="font-semibold">Okres {index + 1}</span>
                      <div className="text-gray-600">
                        {period.startYear}-{period.endYear} ({period.contractType})
                      </div>
                    </div>
                    <div className="text-right">
                      <div className="font-mono text-green-600">
                        {formatPLN(period.monthlyGross)}
                      </div>
                      {startingSalaries[period.id] && startingSalaries[period.id] !== period.monthlyGross && (
                        <div className="text-gray-500 text-xs">
                          Start: {formatPLN(startingSalaries[period.id])}
                        </div>
                      )}
                      <div className="text-gray-600">
                        {period.endYear - period.startYear + 1} lat
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            </div>

            {/* Capital Path (All years) */}
            <div className="space-y-2">
              <h4 className="font-semibold text-sm text-gray-700 border-b pb-1">
                Wzrost Kapitału (Wszystkie Lata) - {results.capitalPath?.length || 0} lat
              </h4>
              {results.capitalPath && results.capitalPath.length > 0 && (
                <div className="grid grid-cols-2 gap-4 text-xs text-gray-600 mb-2">
                  <div>Pierwszy rok: {results.capitalPath[0].year} (Wiek {results.capitalPath[0].age})</div>
                  <div>Ostatni rok: {results.capitalPath[results.capitalPath.length - 1].year} (Wiek {results.capitalPath[results.capitalPath.length - 1].age})</div>
                  <div>Łączne składki: {formatPLN(results.capitalPath.reduce((sum, entry) => sum + entry.contributions, 0))}</div>
                  <div>Łączna waloryzacja: {formatPLN(results.capitalPath.reduce((sum, entry) => sum + entry.valorization, 0))}</div>
                </div>
              )}
              <div className="space-y-1 text-xs max-h-60 overflow-y-auto">
                {results.capitalPath?.map((entry, index) => {
                  const yearWaloryzacjaRate = waloryzacjaData?.[entry.year.toString()] || 1.0;
                  return (
                    <div key={index} className="flex justify-between items-start bg-gray-50 p-2 rounded min-h-[2.5rem]">
                      <div className="flex-1 min-w-0">
                        <div className="flex items-center gap-2">
                          <span className="font-semibold">{entry.year}</span>
                          <span className="text-gray-600">Wiek {entry.age}</span>
                          <span className="text-gray-500">
                            Waloryzacja: {(yearWaloryzacjaRate - 1) * 100}%
                          </span>
                        </div>
                        <div className="text-gray-500 text-xs mt-1">
                          Główne: {formatPLN(entry.mainAccountAfter)} | Sub: {formatPLN(entry.subAccountAfter)}
                        </div>
                      </div>
                      <div className="text-right ml-4 flex-shrink-0">
                        <div className="font-mono text-green-600 text-sm">
                          {formatPLN(entry.totalCapital)}
                        </div>
                        <div className="text-gray-600 text-xs">
                          +{formatPLN(entry.contributions)} składki | +{formatPLN(entry.valorization)} waloryzacja
                        </div>
                      </div>
                    </div>
                  );
                })}
              </div>
            </div>

            {/* Final Results */}
            <div className="space-y-2">
              <h4 className="font-semibold text-sm text-gray-700 border-b pb-1">
                Wyniki Końcowe
              </h4>
              <div className="grid grid-cols-3 gap-2 text-xs">
                <div>
                  <span className="text-gray-500">Emerytura nominalna:</span>
                  <span className="font-mono ml-1 text-blue-600">
                    {formatPLN(results.nominalPension)}
                  </span>
                </div>
                <div>
                  <span className="text-gray-500">Emerytura realna:</span>
                  <span className="font-mono ml-1 text-green-600">
                    {formatPLN(results.realPension)}
                  </span>
                </div>
                <div>
                  <span className="text-gray-500">Wskaźnik zastąpienia:</span>
                  <span className="font-mono ml-1">{results.replacementRate}%</span>
                </div>
                <div>
                  <span className="text-gray-500">Kapitał łączny:</span>
                  <span className="font-mono ml-1">
                    {formatPLN(results.capitalPath?.[results.capitalPath.length - 1]?.totalCapital || 0)}
                  </span>
                </div>
                <div>
                  <span className="text-gray-500">Kapitał PPK:</span>
                  <span className="font-mono ml-1">
                    {formatPLN(results.ppkCapital || 0)}
                  </span>
                </div>
                <div>
                  <span className="text-gray-500">Kapitał IKZE:</span>
                  <span className="font-mono ml-1">
                    {formatPLN(results.ikzeCapital || 0)}
                  </span>
                </div>
                <div>
                  <span className="text-gray-500">Łącznie z programami:</span>
                  <span className="font-mono ml-1 text-purple-600">
                    {formatPLN(results.totalPensionWithPrograms || 0)}
                  </span>
                </div>
                <div>
                  <span className="text-gray-500">Lata potrzebne:</span>
                  <span className="font-mono ml-1">
                    {results.yearsNeeded || "N/A"}
                  </span>
                </div>
              </div>
            </div>

            {/* Difference Analysis */}
            <div className="space-y-2">
              <h4 className="font-semibold text-sm text-gray-700 border-b pb-1">
                Analiza Różnic
              </h4>
              <div className="grid grid-cols-3 gap-2 text-xs">
                <div>
                  <span className="text-gray-500">vs Oczekiwana:</span>
                  <span className={`font-mono ml-1 ${
                    results.differenceVsExpected >= 0 ? 'text-green-600' : 'text-red-600'
                  }`}>
                    {formatPLN(results.differenceVsExpected)}
                  </span>
                </div>
                <div>
                  <span className="text-gray-500">vs Średnia:</span>
                  <span className={`font-mono ml-1 ${
                    results.differenceVsAverage >= 0 ? 'text-green-600' : 'text-red-600'
                  }`}>
                    {formatPLN(results.differenceVsAverage)}
                  </span>
                </div>
              </div>
            </div>
              </div>
            </div>
          </div>
        )}
      </Card>
    </div>
  );
}
