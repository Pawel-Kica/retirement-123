"use client";

import { useState } from "react";
import { Card } from "@/components/ui/Card";
import { Button } from "@/components/ui/Button";
import { FormField } from "@/components/ui/FormField";
import { Input } from "@/components/ui/Input";
import { InputWithSlider } from "@/components/ui/InputWithSlider";
import { ContractType, SimulationInputs } from "@/lib/types";
import { retirementAgeBySex } from "@/data/retirementAgeBySex";
import {
  LuTrash2,
  LuPlus,
  LuCalendar,
  LuTriangleAlert,
  LuCircleCheckBig,
  LuBriefcase,
  LuInfo,
  LuChevronDown,
  LuChevronUp,
} from "react-icons/lu";

export interface WorkHistoryEntry {
  id: string;
  startYear: number | undefined;
  endYear: number | undefined;
  monthlyGross: number | undefined;
  contractType: ContractType;
  annualRaisePercentage?: number;
}

interface Step1Props {
  formData: Partial<SimulationInputs>;
  workHistory: WorkHistoryEntry[];
  errors: any[];
  isComplete: boolean;
  currentYear: number;
  minWorkStartYear: number;
  onFieldChange: (field: keyof SimulationInputs, value: any) => void;
  onWorkHistoryUpdate: (
    id: string,
    field: keyof WorkHistoryEntry,
    value: any
  ) => void;
  onAddEntry: () => void;
  onRemoveEntry: (id: string) => void;
  onNext: () => void;
  onBack: () => void;
  getFieldError: (errors: any[], field: string) => string | undefined;
}

export function Step1WorkHistory({
  formData,
  workHistory,
  errors,
  isComplete,
  currentYear,
  minWorkStartYear,
  onFieldChange,
  onWorkHistoryUpdate,
  onAddEntry,
  onRemoveEntry,
  onNext,
  onBack,
  getFieldError,
}: Step1Props) {
  const [collapsedEntries, setCollapsedEntries] = useState<Set<string>>(
    new Set()
  );
  const [showBackWarning, setShowBackWarning] = useState(false);

  const toggleCollapse = (id: string) => {
    setCollapsedEntries((prev) => {
      const next = new Set(prev);
      if (next.has(id)) {
        next.delete(id);
      } else {
        next.add(id);
      }
      return next;
    });
  };

  const handleBackClick = () => {
    setShowBackWarning(true);
  };

  const confirmBack = () => {
    setShowBackWarning(false);
    onBack();
  };

  return (
    <>
      {showBackWarning && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4">
          <div className="bg-white rounded-lg p-6 max-w-md w-full shadow-2xl relative z-50">
            <div className="flex items-start gap-3 mb-6">
              <LuTriangleAlert className="w-6 h-6 text-zus-warning flex-shrink-0 mt-1" />
              <div>
                <h3 className="text-lg font-bold text-zus-grey-900 mb-2">
                  Utracisz wprowadzone dane
                </h3>
                <p className="text-sm text-zus-grey-700">
                  Jeśli wrócisz do poprzedniego kroku, wszystkie wprowadzone
                  informacje o okresach pracy zostaną usunięte. Czy na pewno
                  chcesz kontynuować?
                </p>
              </div>
            </div>
            <div className="flex gap-3 justify-end">
              <Button
                type="button"
                variant="secondary"
                onClick={() => setShowBackWarning(false)}
              >
                Anuluj
              </Button>
              <Button
                type="button"
                variant="primary"
                onClick={confirmBack}
              >
                Wróć i usuń dane
              </Button>
            </div>
          </div>
        </div>
      )}

      <Card className="p-8">
        <div className="mb-6">
          <h2 className="text-2xl font-bold text-zus-grey-900 mb-2">
            Historia pracy
          </h2>
          {formData.age && formData.sex && (
            <div className="mb-3 p-3 bg-zus-green-light border-l-4 border-zus-green rounded-lg">
              <div className="flex items-center gap-2 text-sm">
                <span className="text-zus-grey-600">Twoje dane:</span>
                <span className="font-bold text-zus-grey-900">
                  {formData.sex === "M" ? "Mężczyzna" : "Kobieta"}
                </span>
                <span className="text-zus-grey-400">•</span>
                <span className="font-bold text-zus-grey-900">
                  {formData.age} lat
                </span>
              </div>
            </div>
          )}
          <p className="text-zus-grey-600">
            Określ swoje okresy zatrudnienia. Ostatni okres wyznacza planowany
            rok przejścia na emeryturę.
          </p>
        </div>

        <div className="space-y-6">
          <div className="pt-6">
            <div className="mb-4">
              <h3 className="text-lg font-bold text-zus-grey-900 flex items-center gap-2">
                <LuBriefcase className="w-5 h-5 text-zus-green" />
                <span>Okresy pracy</span>
                <span className="text-zus-error">*</span>
              </h3>
              <p className="text-sm text-zus-grey-600 mt-1">
                Dodaj okresy zatrudnienia. Ostatni okres określa rok przejścia
                na emeryturę.
              </p>
            </div>

            {workHistory.map((entry, index) => {
              const isCollapsed = collapsedEntries.has(entry.id);
              const contractTypeLabel =
                entry.contractType === "UOP"
                  ? "💼 UOP"
                  : entry.contractType === "UOZ"
                  ? "📝 Zlecenie"
                  : "🏢 B2B";

              return (
                <div
                  key={entry.id}
                  className="mb-4 p-4 bg-zus-grey-100 rounded-lg border border-zus-grey-300"
                >
                  <div className="flex justify-between items-center mb-3">
                    <div className="flex items-center gap-2 flex-1">
                      <button
                        type="button"
                        onClick={() => toggleCollapse(entry.id)}
                        className="p-1 hover:bg-zus-grey-200 rounded transition-colors"
                        title={isCollapsed ? "Rozwiń" : "Zwiń"}
                      >
                        {isCollapsed ? (
                          <LuChevronDown className="w-5 h-5 text-zus-grey-700 transition-transform duration-200" />
                        ) : (
                          <LuChevronUp className="w-5 h-5 text-zus-grey-700 transition-transform duration-200" />
                        )}
                      </button>
                      <div className="flex items-center gap-2">
                        <h4 className="font-semibold text-zus-grey-900">
                          Okres {index + 1}
                        </h4>
                        {entry.startYear &&
                          entry.endYear &&
                          entry.endYear >= entry.startYear && (
                            <span className="text-xs text-zus-blue bg-blue-50 px-2 py-1 rounded font-medium">
                              {entry.endYear - entry.startYear + 1}{" "}
                              {entry.endYear - entry.startYear + 1 === 1
                                ? "rok"
                                : entry.endYear - entry.startYear + 1 < 5
                                ? "lata"
                                : "lat"}
                            </span>
                          )}
                        {index === workHistory.length - 1 && (
                          <span className="text-xs text-zus-green bg-zus-green-light px-2 py-1 rounded">
                            Rok emerytury
                          </span>
                        )}
                      </div>
                      {isCollapsed && (
                        <div className="flex items-center gap-3 text-sm text-zus-grey-700 ml-2">
                          <span>
                            {entry.startYear || "?"} - {entry.endYear || "?"}
                          </span>
                          <span className="text-zus-grey-400">•</span>
                          <span className="font-semibold text-zus-green">
                            {entry.monthlyGross
                              ? `${entry.monthlyGross.toLocaleString(
                                  "pl-PL"
                                )} zł`
                              : "—"}
                          </span>
                          <span className="text-zus-grey-400">•</span>
                          <span>{contractTypeLabel}</span>
                          {entry.annualRaisePercentage !== undefined &&
                            entry.annualRaisePercentage !== 1 && (
                              <>
                                <span className="text-zus-grey-400">•</span>
                                <span className="text-zus-blue">
                                  +{entry.annualRaisePercentage}%/rok
                                </span>
                              </>
                            )}
                        </div>
                      )}
                    </div>
                    {workHistory.length > 1 && (
                      <button
                        type="button"
                        onClick={() => onRemoveEntry(entry.id)}
                        className="text-zus-error hover:text-red-700 flex items-center gap-1 text-sm"
                      >
                        <LuTrash2 className="w-4 h-4" />
                        Usuń
                      </button>
                    )}
                  </div>

                  <div
                    className={`transition-all duration-300 ease-in-out overflow-hidden ${
                      isCollapsed
                        ? "max-h-0 opacity-0"
                        : "max-h-[2000px] opacity-100"
                    }`}
                  >
                    <div className="space-y-4">
                      <div>
                        <InputWithSlider
                          label="Rok rozpoczęcia"
                          value={entry.startYear}
                          onChange={(value) =>
                            onWorkHistoryUpdate(entry.id, "startYear", value)
                          }
                          min={minWorkStartYear}
                          max={
                            formData.age && formData.sex
                              ? currentYear +
                                (retirementAgeBySex[formData.sex] -
                                  formData.age) -
                                1
                              : currentYear + 30
                          }
                          step={1}
                          suffix=""
                          placeholder="np. 2010"
                          required
                          error={getFieldError(
                            errors,
                            `work-${entry.id}-startYear`
                          )}
                          hint={
                            entry.startYear && formData.age
                              ? `Wiek: ${
                                  formData.age - (currentYear - entry.startYear)
                                } lat`
                              : undefined
                          }
                        />
                      </div>

                      <div>
                        <div className="flex items-start gap-2">
                          <div className="flex-1">
                            <InputWithSlider
                              label={
                                index === workHistory.length - 1
                                  ? "Rok zakończenia pracy / przejścia na emeryturę"
                                  : "Rok zakończenia"
                              }
                              value={entry.endYear}
                              onChange={(value) =>
                                onWorkHistoryUpdate(entry.id, "endYear", value)
                              }
                              min={minWorkStartYear}
                              max={
                                formData.age
                                  ? currentYear + (90 - formData.age)
                                  : 2080
                              }
                              step={1}
                              suffix=""
                              placeholder="np. 2050"
                              required
                              error={getFieldError(
                                errors,
                                `work-${entry.id}-endYear`
                              )}
                              hint={
                                entry.endYear && formData.age
                                  ? `Wiek emerytalny: ${
                                      formData.age +
                                      (entry.endYear - currentYear)
                                    } lat`
                                  : undefined
                              }
                            />
                          </div>
                          {index === workHistory.length - 1 &&
                            formData.age &&
                            formData.sex && (
                              <button
                                type="button"
                                onClick={() => {
                                  const minRetirementAge =
                                    retirementAgeBySex[formData.sex];
                                  const minRetirementYear =
                                    currentYear +
                                    (minRetirementAge - formData.age!);
                                  onWorkHistoryUpdate(
                                    entry.id,
                                    "endYear",
                                    minRetirementYear
                                  );
                                }}
                                className="mt-8 px-3 py-2 bg-zus-green text-white rounded hover:bg-zus-green-dark transition-colors text-sm font-medium whitespace-nowrap flex items-center gap-1 h-[40px]"
                                title="Ustaw minimalny wiek emerytalny"
                              >
                                <LuCalendar className="w-4 h-4" />
                                Min. wiek
                              </button>
                            )}
                        </div>
                      </div>

                      {entry.startYear &&
                        entry.endYear &&
                        entry.startYear > entry.endYear && (
                          <div className="mt-3 p-3 bg-red-50 border-l-4 border-zus-error rounded text-sm">
                            <div className="flex items-start gap-2">
                              <LuTriangleAlert className="w-4 h-4 text-zus-error flex-shrink-0 mt-0.5" />
                              <div>
                                <p className="font-semibold text-zus-error">
                                  Błąd w datach
                                </p>
                                <p className="text-zus-grey-700 mt-1">
                                  Rok rozpoczęcia ({entry.startYear}) nie może być
                                  późniejszy niż rok zakończenia ({entry.endYear}
                                  ).
                                </p>
                              </div>
                            </div>
                          </div>
                        )}

                      {index === workHistory.length - 1 &&
                        entry.endYear &&
                        formData.age &&
                        formData.sex && (
                          <div className="mt-3">
                            {(() => {
                              const retirementAge =
                                formData.age + (entry.endYear - currentYear);
                              const minRetirementAge =
                                retirementAgeBySex[formData.sex];
                              const isEarly = retirementAge < minRetirementAge;

                              if (isEarly) {
                                return (
                                  <div className="p-3 bg-orange-50 border-l-4 border-zus-warning rounded text-sm">
                                    <div className="flex items-start gap-2">
                                      <LuTriangleAlert className="w-4 h-4 text-zus-warning flex-shrink-0 mt-0.5" />
                                      <div>
                                        <p className="font-semibold text-zus-grey-900">
                                          Praca kończy się przed wiekiem
                                          emerytalnym
                                        </p>
                                        <p className="text-zus-grey-700 mt-1">
                                          Planowany koniec pracy:{" "}
                                          {retirementAge} lat. Standardowy wiek
                                          emerytalny to {minRetirementAge} lat.
                                          Emerytura zostanie obliczona na
                                          podstawie zgromadzonego kapitału do
                                          roku zakończenia pracy.
                                        </p>
                                      </div>
                                    </div>
                                  </div>
                                );
                              } else {
                                return (
                                  <div className="p-3 bg-zus-green-light border-l-4 border-zus-green rounded text-sm">
                                    <div className="flex items-start gap-2">
                                      <LuCircleCheckBig className="w-4 h-4 text-zus-green flex-shrink-0 mt-0.5" />
                                      <div>
                                        <p className="font-semibold text-zus-grey-900">
                                          Wiek emerytalny: {retirementAge} lat
                                        </p>
                                        <p className="text-zus-grey-700">
                                          Osiągniesz standardowy wiek emerytalny
                                        </p>
                                      </div>
                                    </div>
                                  </div>
                                );
                              }
                            })()}
                          </div>
                        )}

                      <div className="mt-4">
                        <InputWithSlider
                          label="Wynagrodzenie brutto miesięczne"
                          value={entry.monthlyGross}
                          onChange={(value) =>
                            onWorkHistoryUpdate(entry.id, "monthlyGross", value)
                          }
                          min={1000}
                          max={50000}
                          step={100}
                          suffix="zł"
                          placeholder="np. 7000"
                          required
                          error={getFieldError(
                            errors,
                            `work-${entry.id}-monthlyGross`
                          )}
                        />
                      </div>

                      <div className="mt-4">
                        <div className="flex items-center gap-3">
                          <label className="flex items-center gap-2 cursor-pointer">
                            <input
                              type="checkbox"
                              checked={
                                entry.annualRaisePercentage !== undefined
                              }
                              onChange={(e) => {
                                onWorkHistoryUpdate(
                                  entry.id,
                                  "annualRaisePercentage",
                                  e.target.checked ? 3 : undefined
                                );
                              }}
                              className="w-4 h-4 text-zus-green border-zus-grey-300 rounded focus:ring-zus-green focus:ring-2"
                            />
                            <span className="text-sm font-medium text-zus-grey-700">
                              Roczna % podwyżka
                            </span>
                          </label>
                          {entry.annualRaisePercentage !== undefined && (
                            <>
                              <input
                                type="number"
                                value={entry.annualRaisePercentage}
                                onChange={(e) => {
                                  const value = e.target.value;
                                  onWorkHistoryUpdate(
                                    entry.id,
                                    "annualRaisePercentage",
                                    value === "" ? 3 : Number(value)
                                  );
                                }}
                                min={0}
                                max={100}
                                step={0.5}
                                placeholder="3"
                                className="w-20 px-3 py-2 border border-zus-grey-300 rounded focus:outline-none focus:ring-2 focus:ring-zus-green focus:border-zus-green"
                              />
                              <span className="text-sm text-zus-grey-600">
                                % rocznie
                              </span>
                            </>
                          )}
                        </div>
                      </div>

                      <div className="mt-4">
                        <FormField label="Typ umowy" required>
                          <div className="grid grid-cols-3 gap-2">
                            <label className="cursor-pointer">
                              <input
                                type="radio"
                                name={`contractType-${entry.id}`}
                                value="UOP"
                                checked={entry.contractType === "UOP"}
                                onChange={() =>
                                  onWorkHistoryUpdate(
                                    entry.id,
                                    "contractType",
                                    "UOP"
                                  )
                                }
                                className="peer sr-only"
                              />
                              <div className="p-2 bg-white border-2 border-zus-grey-300 rounded peer-checked:border-zus-green peer-checked:bg-zus-green-light hover:border-zus-green transition-all text-center">
                                <div className="text-xl mb-1">💼</div>
                                <div className="text-xs font-semibold">UOP</div>
                              </div>
                            </label>
                            <label className="cursor-pointer">
                              <input
                                type="radio"
                                name={`contractType-${entry.id}`}
                                value="UOZ"
                                checked={entry.contractType === "UOZ"}
                                onChange={() =>
                                  onWorkHistoryUpdate(
                                    entry.id,
                                    "contractType",
                                    "UOZ"
                                  )
                                }
                                className="peer sr-only"
                              />
                              <div className="p-2 bg-white border-2 border-zus-grey-300 rounded peer-checked:border-zus-green peer-checked:bg-zus-green-light hover:border-zus-green transition-all text-center">
                                <div className="text-xl mb-1">📝</div>
                                <div className="text-xs font-semibold">
                                  Zlecenie
                                </div>
                              </div>
                            </label>
                            <label className="cursor-pointer">
                              <input
                                type="radio"
                                name={`contractType-${entry.id}`}
                                value="B2B"
                                checked={entry.contractType === "B2B"}
                                onChange={() =>
                                  onWorkHistoryUpdate(
                                    entry.id,
                                    "contractType",
                                    "B2B"
                                  )
                                }
                                className="peer sr-only"
                              />
                              <div className="p-2 bg-white border-2 border-zus-grey-300 rounded peer-checked:border-zus-green peer-checked:bg-zus-green-light hover:border-zus-green transition-all text-center">
                                <div className="text-xl mb-1">🏢</div>
                                <div className="text-xs font-semibold">B2B</div>
                              </div>
                            </label>
                          </div>
                        </FormField>
                      </div>
                    </div>
                  </div>
                </div>
              );
            })}

            <Button
              type="button"
              onClick={onAddEntry}
              variant="ghost"
              className="w-full flex items-center justify-center gap-2"
            >
              <LuPlus className="w-4 h-4" />
              Dodaj kolejny okres pracy
            </Button>

            <div className="mt-4 p-3 bg-blue-50 border-l-4 border-zus-blue rounded text-sm flex items-start gap-2">
              <LuInfo className="w-4 h-4 text-zus-blue flex-shrink-0 mt-0.5" />
              <p className="text-zus-grey-700">
                <strong>Wskazówka:</strong> Możesz dodać więcej okresów pracy
                później na stronie wyników, aby uwzględnić luki w zatrudnieniu
                lub zmiany wynagrodzeń.
              </p>
            </div>
          </div>
        </div>

        <div className="mt-8 pt-6 border-t border-zus-grey-300">
          {!isComplete && errors.length > 0 && (
            <div className="mb-4 p-4 bg-red-50 border-l-4 border-zus-error rounded">
              <p className="text-sm font-semibold text-zus-error mb-2 flex items-center gap-2">
                <LuTriangleAlert className="w-5 h-5 flex-shrink-0" />
                <span>Uzupełnij wszystkie wymagane pola:</span>
              </p>
              <ul className="text-sm text-gray-700 list-disc pl-5 space-y-1">
                {errors.map((error, idx) => (
                  <li key={idx}>{error.message}</li>
                ))}
              </ul>
            </div>
          )}
          <div className="flex gap-4">
            <Button
              type="button"
              variant="ghost"
              size="lg"
              onClick={handleBackClick}
              className="flex-1"
            >
              ← Wstecz
            </Button>
            <Button
              type="button"
              onClick={onNext}
              variant="success"
              size="lg"
              className="flex-1"
              disabled={!isComplete}
            >
              Dalej: Dodatkowe informacje →
            </Button>
          </div>
        </div>
      </Card>
    </>
  );
}
