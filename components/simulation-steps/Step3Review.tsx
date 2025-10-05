"use client";

import { Card } from "@/components/ui/Card";
import { Button } from "@/components/ui/Button";
import { SimulationInputs } from "@/lib/types";
import { WorkHistoryEntry } from "./Step1WorkHistory";
import {
  LuClipboardList,
  LuBriefcase,
  LuCircleCheckBig,
  LuSparkles,
} from "react-icons/lu";

interface Step3Props {
  formData: Partial<SimulationInputs>;
  workHistory: WorkHistoryEntry[];
  currentYear: number;
  onSubmit: () => void;
  onBack: () => void;
  isLoading: boolean;
}

export function Step3Review({
  formData,
  workHistory,
  currentYear,
  onSubmit,
  onBack,
  isLoading,
}: Step3Props) {
  // Find the maximum (latest) end year from all work history entries
  const maxEndYear = workHistory.reduce((max, entry) => {
    return entry.endYear && entry.endYear > max ? entry.endYear : max;
  }, 0);

  const retirementAge =
    formData.age && maxEndYear ? formData.age + (maxEndYear - currentYear) : 0;

  const yearsWorked = workHistory.reduce((sum, entry) => {
    if (entry.startYear && entry.endYear) {
      return sum + (entry.endYear - entry.startYear);
    }
    return sum;
  }, 0);

  return (
    <Card className="p-8">
      <div className="mb-6">
        <h2 className="text-2xl font-bold text-zus-grey-900 mb-2">
          Podsumowanie
        </h2>
        <p className="text-zus-grey-600">
          Sprawdź wprowadzone dane przed wygenerowaniem prognozy
        </p>
      </div>

      <div className="space-y-4">
        {/* Basic Info Summary */}
        <Card className="bg-zus-green-light border-zus-green p-4">
          <h3 className="text-base font-bold text-zus-grey-900 mb-3 flex items-center gap-2">
            <LuClipboardList className="w-5 h-5 text-zus-green flex-shrink-0" />
            <span>Dane podstawowe</span>
          </h3>
          <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
            <div className="flex justify-between sm:flex-col">
              <div className="text-sm text-zus-grey-600">Wiek</div>
              <div className="text-lg font-bold text-zus-grey-900">
                {formData.age} lat
              </div>
            </div>
            <div className="flex justify-between sm:flex-col">
              <div className="text-sm text-zus-grey-600">Płeć</div>
              <div className="text-lg font-bold text-zus-grey-900">
                {formData.sex === "M" ? "Mężczyzna" : "Kobieta"}
              </div>
            </div>
            <div className="flex justify-between sm:flex-col">
              <div className="text-sm text-zus-grey-600">Łączny staż</div>
              <div className="text-lg font-bold text-zus-grey-900">
                {yearsWorked} lat
              </div>
            </div>
            <div className="flex justify-between sm:flex-col">
              <div className="text-sm text-zus-grey-600">Wiek emerytalny</div>
              <div className="text-lg font-bold text-zus-grey-900">
                {retirementAge} lat
              </div>
            </div>
          </div>
        </Card>

        {/* Work History Summary */}
        <Card className="bg-blue-50 border-zus-navy p-4">
          <h3 className="text-base font-bold text-zus-grey-900 mb-3 flex items-center gap-2">
            <LuBriefcase className="w-5 h-5 text-zus-blue flex-shrink-0" />
            <span>
              Historia pracy ({workHistory.length}{" "}
              {workHistory.length === 1 ? "okres" : "okresy"})
            </span>
          </h3>

          {workHistory.map((entry, index) => {
            const entryYears =
              entry.startYear && entry.endYear
                ? entry.endYear - entry.startYear
                : 0;
            const endAge =
              entry.endYear && formData.age
                ? formData.age + (entry.endYear - currentYear)
                : null;

            return (
              <div
                key={entry.id}
                className="mb-3 p-3 bg-white rounded border border-zus-grey-300"
              >
                <div className="flex justify-between items-start mb-2">
                  <h4 className="font-semibold text-zus-grey-900">
                    Okres {index + 1}
                    {index === workHistory.length - 1 && (
                      <span className="ml-2 text-xs text-zus-green bg-zus-green-light px-2 py-1 rounded">
                        Emerytura
                      </span>
                    )}
                  </h4>
                  <span className="text-xs text-zus-grey-600">
                    {entry.contractType === "UOP"
                      ? "💼 UOP"
                      : entry.contractType === "UOZ"
                      ? "📝 Zlecenie"
                      : "🏢 B2B"}
                  </span>
                </div>
                <div className="grid grid-cols-2 gap-2 text-sm">
                  <div>
                    <span className="text-zus-grey-600">Początek:</span>
                    <span className="ml-2 font-semibold">
                      {entry.startYear}
                    </span>
                  </div>
                  <div>
                    <span className="text-zus-grey-600">Koniec:</span>
                    <span className="ml-2 font-semibold">{entry.endYear}</span>
                  </div>
                  <div>
                    <span className="text-zus-grey-600">Staż:</span>
                    <span className="ml-2 font-semibold">{entryYears} lat</span>
                  </div>
                  {endAge !== null && (
                    <div>
                      <span className="text-zus-grey-600">
                        Wiek końca pracy:
                      </span>
                      <span className="ml-2 font-semibold">{endAge} lat</span>
                    </div>
                  )}
                  <div className="col-span-2">
                    <span className="text-zus-grey-600">Wynagrodzenie:</span>
                    <span className="ml-2 font-semibold text-zus-green">
                      {entry.monthlyGross?.toLocaleString("pl-PL")} zł/mc
                    </span>
                  </div>
                </div>
              </div>
            );
          })}

          <div className="mt-4 pt-3 border-t border-zus-navy/20 grid grid-cols-2 gap-3 text-sm">
            <div className="flex justify-between items-center">
              <span className="text-zus-grey-600">PPK:</span>
              <span
                className={`font-semibold ${
                  formData.retirementPrograms?.ppk.enabled
                    ? "text-zus-blue"
                    : "text-zus-grey-500"
                }`}
              >
                {formData.retirementPrograms?.ppk.enabled ? "✓ Tak" : "✗ Nie"}
              </span>
            </div>
            <div className="flex justify-between items-center">
              <span className="text-zus-grey-600">IKZE:</span>
              <span
                className={`font-semibold ${
                  formData.retirementPrograms?.ikze.enabled
                    ? "text-zus-orange"
                    : "text-zus-grey-500"
                }`}
              >
                {formData.retirementPrograms?.ikze.enabled ? "✓ Tak" : "✗ Nie"}
              </span>
            </div>
          </div>
        </Card>

        {/* Additional Info Summary */}
        <Card className="bg-gray-50 border-zus-grey-300 p-4">
          <h3 className="text-base font-bold text-zus-grey-900 mb-3 flex items-center gap-2">
            <LuBriefcase className="w-5 h-5 text-zus-navy flex-shrink-0" />
            <span>Dodatkowe informacje</span>
          </h3>
          <div className="space-y-2 text-sm">
            <div className="flex justify-between items-center py-1">
              <span className="text-zus-grey-600">Konto podstawowe:</span>
              <span className="font-semibold text-zus-grey-900">
                {formData.accountBalance
                  ? `${formData.accountBalance.toLocaleString("pl-PL")} zł`
                  : "Nie podano (automatyczne oszacowanie)"}
              </span>
            </div>
            <div className="flex justify-between items-center py-1">
              <span className="text-zus-grey-600">Subkonto (OFE):</span>
              <span className="font-semibold text-zus-grey-900">
                {formData.subAccountBalance
                  ? `${formData.subAccountBalance.toLocaleString("pl-PL")} zł`
                  : "Nie podano (automatyczne oszacowanie)"}
              </span>
            </div>
            <div className="flex justify-between items-center py-1">
              <span className="text-zus-grey-600">Zwolnienia lekarskie:</span>
              <span
                className={`font-semibold ${
                  formData.includeZwolnienieZdrowotne
                    ? "text-zus-green"
                    : "text-zus-grey-500"
                }`}
              >
                {formData.includeZwolnienieZdrowotne
                  ? "✓ Uwzględnione"
                  : "✗ Pominięte"}
              </span>
            </div>
          </div>
        </Card>

        {/* Ready to Calculate */}
        <div className="p-4 bg-zus-green-light border-2 border-zus-green rounded-lg text-center">
          <p className="text-base font-semibold text-zus-green mb-1 flex items-center justify-center gap-2">
            <LuCircleCheckBig className="w-6 h-6 flex-shrink-0" />
            <span>Wszystkie dane są gotowe!</span>
          </p>
          <p className="text-sm text-zus-grey-700">
            Kliknij poniżej, aby wygenerować szczegółową prognozę emerytalną
          </p>
        </div>
      </div>

      <div className="mt-8 pt-6 border-t border-zus-grey-300">
        <div className="flex gap-4">
          <Button
            type="button"
            variant="ghost"
            size="lg"
            onClick={onBack}
            className="flex-1"
            disabled={isLoading}
          >
            ← Wstecz
          </Button>
          <Button
            type="submit"
            onClick={onSubmit}
            variant="success"
            size="lg"
            className="flex-1"
            disabled={isLoading}
          >
            {isLoading ? (
              <>
                <span className="animate-spin mr-2">⏳</span>
                Obliczam...
              </>
            ) : (
              <>
                <LuSparkles className="w-5 h-5 mr-2" />
                Oblicz moją emeryturę!
              </>
            )}
          </Button>
        </div>
      </div>
    </Card>
  );
}
