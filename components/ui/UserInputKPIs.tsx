import React, { useState } from "react";
import { SimulationInputs } from "@/lib/types";
import { formatPLN } from "@/lib/utils/formatting";
import { LuPencil, LuCheck, LuX } from "react-icons/lu";
import { setPostalCode as savePostalCode } from "@/lib/utils/postalCodeStorage";

interface UserInputKPIsProps {
  inputs: SimulationInputs | null;
  isCalculating?: boolean;
  onUpdateInputs?: (inputs: Partial<SimulationInputs>) => void;
}

export function UserInputKPIs({
  inputs,
  isCalculating = false,
  onUpdateInputs,
}: UserInputKPIsProps) {
  const [editingSection, setEditingSection] = useState<string | null>(null);
  const [editedValues, setEditedValues] = useState<Partial<SimulationInputs>>(
    {}
  );

  if (!inputs) {
    return null;
  }

  const currentYear = new Date().getFullYear();
  const yearsToRetirement = inputs.workEndYear - currentYear;
  const retirementAge = inputs.age + yearsToRetirement;
  const yearsWorked = inputs.workEndYear - inputs.workStartYear;

  const getContractTypeLabel = (contractType?: string) => {
    switch (contractType) {
      case "UOP":
        return "💼 Umowa o Pracę (UOP)";
      case "UOZ":
        return "📝 Umowa Zlecenie (UOZ)";
      case "B2B":
        return "🏢 Działalność / B2B";
      default:
        return "💼 Umowa o Pracę (UOP)";
    }
  };

  const handleStartEdit = (section: string) => {
    setEditingSection(section);
    setEditedValues(inputs);
  };

  const handleCancelEdit = () => {
    setEditingSection(null);
    setEditedValues({});
  };

  const handleSaveEdit = () => {
    if (onUpdateInputs && editedValues) {
      const fieldsToUpdate: Partial<SimulationInputs> = {};

      if (editingSection === "basic") {
        if (editedValues.age !== inputs.age)
          fieldsToUpdate.age = editedValues.age;
        if (editedValues.sex !== inputs.sex)
          fieldsToUpdate.sex = editedValues.sex;
        if (editedValues.monthlyGross !== inputs.monthlyGross)
          fieldsToUpdate.monthlyGross = editedValues.monthlyGross;
      } else if (editingSection === "work") {
        if (editedValues.workStartYear !== inputs.workStartYear)
          fieldsToUpdate.workStartYear = editedValues.workStartYear;
        if (editedValues.workEndYear !== inputs.workEndYear)
          fieldsToUpdate.workEndYear = editedValues.workEndYear;
        if (editedValues.earlyRetirement !== inputs.earlyRetirement)
          fieldsToUpdate.earlyRetirement = editedValues.earlyRetirement;
        if (editedValues.contractType !== inputs.contractType)
          fieldsToUpdate.contractType = editedValues.contractType;
        if (
          JSON.stringify(editedValues.retirementPrograms) !==
          JSON.stringify(inputs.retirementPrograms)
        )
          fieldsToUpdate.retirementPrograms = editedValues.retirementPrograms;
      } else if (editingSection === "additional") {
        if (editedValues.accountBalance !== inputs.accountBalance)
          fieldsToUpdate.accountBalance = editedValues.accountBalance;
        if (editedValues.subAccountBalance !== inputs.subAccountBalance)
          fieldsToUpdate.subAccountBalance = editedValues.subAccountBalance;
        if (editedValues.includeZwolnienieZdrowotne !== inputs.includeZwolnienieZdrowotne)
          fieldsToUpdate.includeZwolnienieZdrowotne = editedValues.includeZwolnienieZdrowotne;
        if (editedValues.postalCode !== inputs.postalCode) {
          fieldsToUpdate.postalCode = editedValues.postalCode;
          // Also save postal code to local storage
          if (editedValues.postalCode && editedValues.postalCode.trim()) {
            savePostalCode(editedValues.postalCode.trim());
          }
        }
      }

      if (Object.keys(fieldsToUpdate).length > 0) {
        onUpdateInputs(fieldsToUpdate);
      }
    }
    setEditingSection(null);
    setEditedValues({});
  };

  const displayInputs = editingSection ? editedValues : inputs;

  const basicInfoKpis = [
    {
      label: "Wiek",
      value: `${inputs.age} lat`,
    },
    {
      label: "Płeć",
      value: inputs.sex === "M" ? "Mężczyzna" : "Kobieta",
    },
    {
      label: "Wynagrodzenie brutto",
      value: formatPLN(inputs.monthlyGross),
    },
  ];

  const workHistoryKpis = [
    {
      label: "Rok rozpoczęcia pracy",
      value: inputs.workStartYear.toString(),
    },
    {
      label: "Planowana emerytura",
      value: inputs.workEndYear.toString(),
    },
    {
      label: "Łączny staż pracy",
      value: `${yearsWorked} lat`,
    },
    {
      label: "Wiek emerytalny",
      value: `${retirementAge} lat`,
    },
    {
      label: "Wcześniejsza emerytura",
      value: inputs.earlyRetirement ? "✓ Tak" : "✗ Nie",
    },
    {
      label: "Typ umowy",
      value: getContractTypeLabel(inputs.contractType),
    },
    {
      label: "PPK",
      value: inputs.retirementPrograms?.ppk.enabled
        ? "✓ Uczestniczę"
        : "✗ Nie uczestniczę",
    },
    {
      label: "IKZE",
      value: inputs.retirementPrograms?.ikze.enabled
        ? "✓ Posiadam"
        : "✗ Nie posiadam",
    },
  ];

  const additionalInfoKpis = [
    {
      label: "Konto podstawowe",
      value: inputs.accountBalance
        ? formatPLN(inputs.accountBalance)
        : "Automatyczne oszacowanie",
    },
    {
      label: "Subkonto (OFE)",
      value: inputs.subAccountBalance
        ? formatPLN(inputs.subAccountBalance)
        : "Automatyczne oszacowanie",
    },
    {
      label: "Zwolnienia lekarskie",
      value: inputs.includeZwolnienieZdrowotne ? "✓ Uwzględnione" : "✗ Pominięte",
    },
    {
      label: "Kod pocztowy",
      value: inputs.postalCode || "Nie podano",
    },
  ];

  return (
    <div className="space-y-4 mb-6">
      {/* Basic Info KPIs */}
      <div className="bg-zus-green-light border border-zus-green rounded-lg p-4">
        <div className="flex items-center justify-between mb-3">
          <h2 className="text-sm font-bold text-zus-grey-900">
            Dane podstawowe
          </h2>
          {onUpdateInputs && editingSection !== "basic" && !isCalculating && (
            <button
              onClick={() => handleStartEdit("basic")}
              className="flex items-center gap-1 px-2 py-1 text-xs font-semibold text-zus-green hover:bg-zus-green hover:text-white rounded transition-colors"
            >
              <LuPencil className="w-3 h-3" />
              Edytuj
            </button>
          )}
          {editingSection === "basic" && (
            <div className="flex gap-2">
              <button
                onClick={handleSaveEdit}
                className="flex items-center gap-1 px-2 py-1 text-xs font-semibold text-white bg-zus-green hover:bg-zus-green-dark rounded transition-colors"
              >
                <LuCheck className="w-3 h-3" />
                Zapisz
              </button>
              <button
                onClick={handleCancelEdit}
                className="flex items-center gap-1 px-2 py-1 text-xs font-semibold text-zus-error hover:bg-red-50 rounded transition-colors"
              >
                <LuX className="w-3 h-3" />
                Anuluj
              </button>
            </div>
          )}
        </div>
        <div className="grid grid-cols-1 sm:grid-cols-3 gap-2">
          {editingSection === "basic" ? (
            <>
              <div className="bg-white rounded p-2">
                <div className="text-[10px] font-semibold text-zus-grey-600 uppercase tracking-wide mb-0.5">
                  Wiek
                </div>
                <input
                  type="number"
                  min={18}
                  max={100}
                  value={displayInputs.age || ""}
                  onChange={(e) =>
                    setEditedValues((prev) => ({
                      ...prev,
                      age: Number(e.target.value),
                    }))
                  }
                  className="w-full text-sm font-bold text-zus-grey-900 border border-zus-grey-300 rounded px-2 py-1 focus:outline-none focus:ring-2 focus:ring-zus-green"
                />
              </div>
              <div className="bg-white rounded p-2">
                <div className="text-[10px] font-semibold text-zus-grey-600 uppercase tracking-wide mb-0.5">
                  Płeć
                </div>
                <select
                  value={displayInputs.sex || "M"}
                  onChange={(e) =>
                    setEditedValues((prev) => ({
                      ...prev,
                      sex: e.target.value as "M" | "F",
                    }))
                  }
                  className="w-full text-sm font-bold text-zus-grey-900 border border-zus-grey-300 rounded px-2 py-1 focus:outline-none focus:ring-2 focus:ring-zus-green"
                >
                  <option value="M">Mężczyzna</option>
                  <option value="F">Kobieta</option>
                </select>
              </div>
              <div className="bg-white rounded p-2">
                <div className="text-[10px] font-semibold text-zus-grey-600 uppercase tracking-wide mb-0.5">
                  Wynagrodzenie brutto
                </div>
                <input
                  type="number"
                  min={1000}
                  max={100000}
                  step={100}
                  value={displayInputs.monthlyGross || ""}
                  onChange={(e) =>
                    setEditedValues((prev) => ({
                      ...prev,
                      monthlyGross: Number(e.target.value),
                    }))
                  }
                  className="w-full text-sm font-bold text-zus-grey-900 border border-zus-grey-300 rounded px-2 py-1 focus:outline-none focus:ring-2 focus:ring-zus-green"
                />
              </div>
            </>
          ) : (
            basicInfoKpis.map((kpi, index) => (
              <div
                key={index}
                className={`bg-white rounded p-2 ${
                  isCalculating ? "opacity-50" : ""
                }`}
              >
                <div className="text-[10px] font-semibold text-zus-grey-600 uppercase tracking-wide mb-0.5">
                  {kpi.label}
                </div>
                <div className="text-sm font-bold text-zus-grey-900">
                  {isCalculating ? "..." : kpi.value}
                </div>
              </div>
            ))
          )}
        </div>
      </div>

      {/* Work History KPIs */}
      <div className="bg-blue-50 border border-zus-navy rounded-lg p-4">
        <div className="flex items-center justify-between mb-3">
          <h2 className="text-sm font-bold text-zus-grey-900">
            Historia pracy
          </h2>
          {onUpdateInputs && editingSection !== "work" && !isCalculating && (
            <button
              onClick={() => handleStartEdit("work")}
              className="flex items-center gap-1 px-2 py-1 text-xs font-semibold text-zus-navy hover:bg-zus-navy hover:text-white rounded transition-colors"
            >
              <LuPencil className="w-3 h-3" />
              Edytuj
            </button>
          )}
          {editingSection === "work" && (
            <div className="flex gap-2">
              <button
                onClick={handleSaveEdit}
                className="flex items-center gap-1 px-2 py-1 text-xs font-semibold text-white bg-zus-green hover:bg-zus-green-dark rounded transition-colors"
              >
                <LuCheck className="w-3 h-3" />
                Zapisz
              </button>
              <button
                onClick={handleCancelEdit}
                className="flex items-center gap-1 px-2 py-1 text-xs font-semibold text-zus-error hover:bg-red-50 rounded transition-colors"
              >
                <LuX className="w-3 h-3" />
                Anuluj
              </button>
            </div>
          )}
        </div>
        {editingSection === "work" ? (
          <div className="space-y-3">
            <div className="grid grid-cols-2 md:grid-cols-4 gap-2">
              <div className="bg-white rounded p-2">
                <div className="text-[10px] font-semibold text-zus-grey-600 uppercase tracking-wide mb-0.5">
                  Rok rozpoczęcia pracy
                </div>
                <input
                  type="number"
                  min={1950}
                  max={currentYear}
                  value={displayInputs.workStartYear || ""}
                  onChange={(e) =>
                    setEditedValues((prev) => ({
                      ...prev,
                      workStartYear: Number(e.target.value),
                    }))
                  }
                  className="w-full text-xs font-bold text-zus-grey-900 border border-zus-grey-300 rounded px-2 py-1 focus:outline-none focus:ring-2 focus:ring-zus-green"
                />
              </div>
              <div className="bg-white rounded p-2">
                <div className="text-[10px] font-semibold text-zus-grey-600 uppercase tracking-wide mb-0.5">
                  Planowana emerytura
                </div>
                <input
                  type="number"
                  min={currentYear}
                  max={2080}
                  value={displayInputs.workEndYear || ""}
                  onChange={(e) =>
                    setEditedValues((prev) => ({
                      ...prev,
                      workEndYear: Number(e.target.value),
                    }))
                  }
                  className="w-full text-xs font-bold text-zus-grey-900 border border-zus-grey-300 rounded px-2 py-1 focus:outline-none focus:ring-2 focus:ring-zus-green"
                />
              </div>
              <div className="bg-white rounded p-2">
                <div className="text-[10px] font-semibold text-zus-grey-600 uppercase tracking-wide mb-0.5">
                  Typ umowy
                </div>
                <select
                  value={displayInputs.contractType || "UOP"}
                  onChange={(e) =>
                    setEditedValues((prev) => ({
                      ...prev,
                      contractType: e.target.value as "UOP" | "UOZ" | "B2B",
                    }))
                  }
                  className="w-full text-[10px] font-bold text-zus-grey-900 border border-zus-grey-300 rounded px-1 py-1 focus:outline-none focus:ring-2 focus:ring-zus-green"
                >
                  <option value="UOP">UOP</option>
                  <option value="UOZ">Zlecenie</option>
                  <option value="B2B">B2B</option>
                </select>
              </div>
              <div className="bg-white rounded p-2">
                <div className="text-[10px] font-semibold text-zus-grey-600 uppercase tracking-wide mb-0.5">
                  Wcześniejsza emerytura
                </div>
                <label className="flex items-center gap-1 mt-1">
                  <input
                    type="checkbox"
                    checked={displayInputs.earlyRetirement || false}
                    onChange={(e) =>
                      setEditedValues((prev) => ({
                        ...prev,
                        earlyRetirement: e.target.checked,
                      }))
                    }
                    className="w-4 h-4 accent-zus-green"
                  />
                  <span className="text-xs font-bold text-zus-grey-900">
                    {displayInputs.earlyRetirement ? "Tak" : "Nie"}
                  </span>
                </label>
              </div>
            </div>
            <div className="grid grid-cols-2 gap-2">
              <div className="bg-white rounded p-2">
                <label className="flex items-center gap-2">
                  <input
                    type="checkbox"
                    checked={
                      displayInputs.retirementPrograms?.ppk.enabled || false
                    }
                    onChange={(e) => {
                      setEditedValues((prev) => {
                        const currentPrograms = prev.retirementPrograms ||
                          inputs.retirementPrograms || {
                            ppk: {
                              enabled: false,
                              employeeRate: 0.02,
                              employerRate: 0.015,
                            },
                            ikze: { enabled: false, contributionRate: 0.1 },
                          };
                        return {
                          ...prev,
                          retirementPrograms: {
                            ppk: {
                              ...currentPrograms.ppk,
                              enabled: e.target.checked,
                            },
                            ikze: currentPrograms.ikze,
                          },
                        };
                      });
                    }}
                    className="w-4 h-4 accent-zus-blue"
                  />
                  <span className="text-xs font-bold text-zus-grey-900">
                    PPK
                  </span>
                </label>
              </div>
              <div className="bg-white rounded p-2">
                <label className="flex items-center gap-2">
                  <input
                    type="checkbox"
                    checked={
                      displayInputs.retirementPrograms?.ikze.enabled || false
                    }
                    onChange={(e) => {
                      setEditedValues((prev) => {
                        const currentPrograms = prev.retirementPrograms ||
                          inputs.retirementPrograms || {
                            ppk: {
                              enabled: false,
                              employeeRate: 0.02,
                              employerRate: 0.015,
                            },
                            ikze: { enabled: false, contributionRate: 0.1 },
                          };
                        return {
                          ...prev,
                          retirementPrograms: {
                            ppk: currentPrograms.ppk,
                            ikze: {
                              ...currentPrograms.ikze,
                              enabled: e.target.checked,
                            },
                          },
                        };
                      });
                    }}
                    className="w-4 h-4 accent-zus-orange"
                  />
                  <span className="text-xs font-bold text-zus-grey-900">
                    IKZE
                  </span>
                </label>
              </div>
            </div>
          </div>
        ) : (
          <div className="grid grid-cols-2 md:grid-cols-4 gap-2">
            {workHistoryKpis.map((kpi, index) => (
              <div
                key={index}
                className={`bg-white rounded p-2 ${
                  isCalculating ? "opacity-50" : ""
                }`}
              >
                <div className="text-[10px] font-semibold text-zus-grey-600 uppercase tracking-wide mb-0.5">
                  {kpi.label}
                </div>
                <div className="text-xs font-bold text-zus-grey-900">
                  {isCalculating ? "..." : kpi.value}
                </div>
              </div>
            ))}
          </div>
        )}
      </div>

      {/* Additional Info KPIs */}
      <div className="bg-gray-50 border border-zus-grey-300 rounded-lg p-4">
        <div className="flex items-center justify-between mb-3">
          <h2 className="text-sm font-bold text-zus-grey-900">
            Dodatkowe informacje
          </h2>
          {onUpdateInputs &&
            editingSection !== "additional" &&
            !isCalculating && (
              <button
                onClick={() => handleStartEdit("additional")}
                className="flex items-center gap-1 px-2 py-1 text-xs font-semibold text-zus-grey-700 hover:bg-zus-grey-300 rounded transition-colors"
              >
                <LuPencil className="w-3 h-3" />
                Edytuj
              </button>
            )}
          {editingSection === "additional" && (
            <div className="flex gap-2">
              <button
                onClick={handleSaveEdit}
                className="flex items-center gap-1 px-2 py-1 text-xs font-semibold text-white bg-zus-green hover:bg-zus-green-dark rounded transition-colors"
              >
                <LuCheck className="w-3 h-3" />
                Zapisz
              </button>
              <button
                onClick={handleCancelEdit}
                className="flex items-center gap-1 px-2 py-1 text-xs font-semibold text-zus-error hover:bg-red-50 rounded transition-colors"
              >
                <LuX className="w-3 h-3" />
                Anuluj
              </button>
            </div>
          )}
        </div>
        {editingSection === "additional" ? (
          <div className="grid grid-cols-1 md:grid-cols-2 gap-2">
            <div className="bg-white rounded p-2">
              <div className="text-[10px] font-semibold text-zus-grey-600 uppercase tracking-wide mb-0.5">
                Konto podstawowe
              </div>
              <input
                type="number"
                min={0}
                step={0.01}
                value={displayInputs.accountBalance || ""}
                onChange={(e) =>
                  setEditedValues((prev) => ({
                    ...prev,
                    accountBalance:
                      e.target.value !== ""
                        ? Number(e.target.value)
                        : undefined,
                  }))
                }
                placeholder="Pozostaw puste"
                className="w-full text-xs font-bold text-zus-grey-900 border border-zus-grey-300 rounded px-2 py-1 focus:outline-none focus:ring-2 focus:ring-zus-green"
              />
            </div>
            <div className="bg-white rounded p-2">
              <div className="text-[10px] font-semibold text-zus-grey-600 uppercase tracking-wide mb-0.5">
                Subkonto (OFE)
              </div>
              <input
                type="number"
                min={0}
                step={0.01}
                value={displayInputs.subAccountBalance || ""}
                onChange={(e) =>
                  setEditedValues((prev) => ({
                    ...prev,
                    subAccountBalance:
                      e.target.value !== ""
                        ? Number(e.target.value)
                        : undefined,
                  }))
                }
                placeholder="Pozostaw puste"
                className="w-full text-xs font-bold text-zus-grey-900 border border-zus-grey-300 rounded px-2 py-1 focus:outline-none focus:ring-2 focus:ring-zus-green"
              />
            </div>
            <div className="bg-white rounded p-2">
              <div className="text-[10px] font-semibold text-zus-grey-600 uppercase tracking-wide mb-0.5">
                Zwolnienia lekarskie
              </div>
              <label className="flex items-center gap-1 mt-1">
                <input
                  type="checkbox"
                  checked={displayInputs.includeZwolnienieZdrowotne || false}
                  onChange={(e) =>
                    setEditedValues((prev) => ({
                      ...prev,
                      includeZwolnienieZdrowotne: e.target.checked,
                    }))
                  }
                  className="w-4 h-4 accent-zus-green"
                />
                <span className="text-xs font-bold text-zus-grey-900">
                  {displayInputs.includeZwolnienieZdrowotne ? "Uwzględnione" : "Pominięte"}
                </span>
              </label>
            </div>
            <div className="bg-white rounded p-2">
              <div className="text-[10px] font-semibold text-zus-grey-600 uppercase tracking-wide mb-0.5">
                Kod pocztowy
              </div>
              <input
                type="text"
                value={displayInputs.postalCode || ""}
                onChange={(e) => {
                  const value = e.target.value.replace(/[^0-9-]/g, "");
                  if (value.length <= 6) {
                    setEditedValues((prev) => ({
                      ...prev,
                      postalCode: value,
                    }));
                  }
                }}
                placeholder="np. 34-222"
                maxLength={6}
                className="w-full text-xs font-bold text-zus-grey-900 border border-zus-grey-300 rounded px-2 py-1 focus:outline-none focus:ring-2 focus:ring-zus-green"
              />
            </div>
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 gap-2">
            {additionalInfoKpis.map((kpi, index) => (
              <div
                key={index}
                className={`bg-white rounded p-2 ${
                  isCalculating ? "opacity-50" : ""
                }`}
              >
                <div className="text-[10px] font-semibold text-zus-grey-600 uppercase tracking-wide mb-0.5">
                  {kpi.label}
                </div>
                <div className="text-xs font-bold text-zus-grey-900">
                  {isCalculating ? "..." : kpi.value}
                </div>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}
