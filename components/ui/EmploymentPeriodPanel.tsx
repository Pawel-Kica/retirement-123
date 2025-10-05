import React, { useState, useEffect } from "react";
import { EmploymentPeriod, ContractType, Month } from "@/lib/types";
import { Button } from "./Button";
import { formatPLN } from "@/lib/utils/formatting";
import { formatDuration } from "@/lib/utils/simulationHistory";
import {
  validateEmploymentPeriod,
  ValidationError,
} from "@/lib/utils/timelineValidation";
import { Briefcase, DollarSign, FileText, AlertCircle } from "lucide-react";

interface EmploymentPeriodPanelProps {
  period: EmploymentPeriod | null;
  existingPeriods: EmploymentPeriod[];
  workStartYear: number;
  workEndYear: number;
  maxYear?: number; // Max year (e.g., when user is 90)
  onSave: (period: EmploymentPeriod) => void;
  onDelete?: () => void;
  onCancel: () => void;
}

const MONTHS: { value: Month; label: string }[] = [
  { value: 1, label: "Styczeń" },
  { value: 2, label: "Luty" },
  { value: 3, label: "Marzec" },
  { value: 4, label: "Kwiecień" },
  { value: 5, label: "Maj" },
  { value: 6, label: "Czerwiec" },
  { value: 7, label: "Lipiec" },
  { value: 8, label: "Sierpień" },
  { value: 9, label: "Wrzesień" },
  { value: 10, label: "Październik" },
  { value: 11, label: "Listopad" },
  { value: 12, label: "Grudzień" },
];

const CONTRACT_TYPES: { value: ContractType; label: string; icon: string }[] = [
  { value: "UOP", label: "Umowa o Pracę", icon: "💼" },
  { value: "UOZ", label: "Umowa Zlecenie", icon: "📝" },
  { value: "B2B", label: "Działalność / B2B", icon: "🏢" },
];

export function EmploymentPeriodPanel({
  period,
  existingPeriods,
  workStartYear,
  workEndYear,
  maxYear,
  onSave,
  onDelete,
  onCancel,
}: EmploymentPeriodPanelProps) {
  const [formData, setFormData] = useState<Partial<EmploymentPeriod>>({
    startYear: period?.startYear || workStartYear,
    startMonth: 1, // Always January
    endYear: period?.endYear || workEndYear,
    endMonth: 12, // Always December
    monthlyGross: period?.monthlyGross || 7000,
    contractType: period?.contractType || "UOP",
    description: period?.description || "",
    annualRaisePercentage: period?.annualRaisePercentage,
  });

  const [errors, setErrors] = useState<ValidationError[]>([]);
  const [showDeleteConfirm, setShowDeleteConfirm] = useState(false);

  useEffect(() => {
    const validationErrors = validateEmploymentPeriod(
      formData,
      existingPeriods,
      period?.id
    );
    setErrors(validationErrors);
  }, [formData, existingPeriods, period?.id]);

  const handleSubmit = () => {
    const validationErrors = validateEmploymentPeriod(
      formData,
      existingPeriods,
      period?.id
    );

    if (validationErrors.some((e) => e.type === "error")) {
      setErrors(validationErrors);
      return;
    }

    const savedPeriod: EmploymentPeriod = {
      id: period?.id || `emp-${Date.now()}`,
      startYear: formData.startYear!,
      startMonth: 1, // Always January
      endYear: formData.endYear!,
      endMonth: 12, // Always December
      monthlyGross: formData.monthlyGross!,
      contractType: formData.contractType!,
      description: formData.description,
      annualRaisePercentage: formData.annualRaisePercentage,
    };

    onSave(savedPeriod);
  };

  const handleDelete = () => {
    if (onDelete) {
      onDelete();
    }
  };

  const getFieldError = (field: string) => {
    return errors.find((e) => e.field === field);
  };

  const hasErrors = errors.some((e) => e.type === "error");

  const effectiveMaxYear = maxYear || workEndYear + 5;
  const years = Array.from(
    { length: effectiveMaxYear - workStartYear + 1 },
    (_, i) => workStartYear + i
  );

  return (
    <div className="space-y-4">
      {/* Contract Type */}
      <div>
        <label className="block text-xs font-semibold text-zus-grey-900 uppercase tracking-wide mb-2">
          Typ zatrudnienia
        </label>
        <div className="space-y-1.5">
          {CONTRACT_TYPES.map((type) => (
            <label
              key={type.value}
              className={`flex items-center gap-2 p-2.5 border-2 rounded-lg cursor-pointer transition-all ${
                formData.contractType === type.value
                  ? "border-zus-green bg-zus-green-light"
                  : "border-zus-grey-300 bg-white hover:border-zus-green/50"
              }`}
            >
              <input
                type="radio"
                name="contractType"
                value={type.value}
                checked={formData.contractType === type.value}
                onChange={(e) =>
                  setFormData({
                    ...formData,
                    contractType: e.target.value as ContractType,
                  })
                }
                className="w-4 h-4 accent-zus-green"
              />
              <span className="text-lg">{type.icon}</span>
              <span className="font-semibold text-sm text-zus-grey-900">
                {type.label}
              </span>
            </label>
          ))}
        </div>
      </div>

      {/* Start Year */}
      <div>
        <label className="block text-xs font-semibold text-zus-grey-900 uppercase tracking-wide mb-1.5">
          Rok rozpoczęcia
        </label>
        <select
          value={formData.startYear}
          onChange={(e) =>
            setFormData({ ...formData, startYear: Number(e.target.value) })
          }
          className={`w-full px-3 py-2 border rounded-lg focus:outline-none focus:ring-2 focus:ring-zus-green ${
            getFieldError("startYear")
              ? "border-zus-error"
              : "border-zus-grey-300"
          }`}
        >
          {years.map((year) => (
            <option key={year} value={year}>
              {year}
            </option>
          ))}
        </select>
        {getFieldError("startYear") && (
          <p className="text-sm text-zus-error mt-1 flex items-center gap-1">
            <AlertCircle className="w-4 h-4" />
            {getFieldError("startYear")!.message}
          </p>
        )}
      </div>

      {/* End Year */}
      <div>
        <label className="block text-xs font-semibold text-zus-grey-900 uppercase tracking-wide mb-1.5">
          Rok zakończenia
        </label>
        <select
          value={formData.endYear}
          onChange={(e) =>
            setFormData({ ...formData, endYear: Number(e.target.value) })
          }
          className={`w-full px-3 py-2 border rounded-lg focus:outline-none focus:ring-2 focus:ring-zus-green ${
            getFieldError("endYear")
              ? "border-zus-error"
              : "border-zus-grey-300"
          }`}
        >
          {years.map((year) => (
            <option key={year} value={year}>
              {year}
            </option>
          ))}
        </select>
        {getFieldError("endYear") && (
          <p className="text-sm text-zus-error mt-1 flex items-center gap-1">
            <AlertCircle className="w-4 h-4" />
            {getFieldError("endYear")!.message}
          </p>
        )}
      </div>

      {/* Duration Display */}
      {formData.startYear && formData.endYear && (
        <div className="p-2 bg-zus-green-light rounded border border-zus-green">
          <p className="text-xs text-zus-grey-700">
            <strong>Czas trwania:</strong>{" "}
            {formData.endYear - formData.startYear + 1}{" "}
            {formData.endYear - formData.startYear + 1 === 1
              ? "rok"
              : formData.endYear - formData.startYear + 1 < 5
              ? "lata"
              : "lat"}
          </p>
        </div>
      )}

      {/* Monthly Gross Salary */}
      <div>
        <label className="block text-xs font-semibold text-zus-grey-900 uppercase tracking-wide mb-1.5">
          Wynagrodzenie miesięczne brutto
        </label>
        <div className="space-y-1.5">
          <input
            type="number"
            value={formData.monthlyGross}
            onChange={(e) =>
              setFormData({ ...formData, monthlyGross: Number(e.target.value) })
            }
            min={1000}
            max={100000}
            step={100}
            className={`w-full px-3 py-2 text-base font-semibold border-2 rounded-lg focus:outline-none focus:ring-2 focus:ring-zus-green ${
              getFieldError("monthlyGross")
                ? "border-zus-error"
                : "border-zus-grey-300"
            }`}
          />
          <input
            type="range"
            value={formData.monthlyGross}
            onChange={(e) =>
              setFormData({ ...formData, monthlyGross: Number(e.target.value) })
            }
            min={1000}
            max={50000}
            step={100}
            className="w-full accent-zus-green"
          />
          <div className="flex justify-between text-xs text-zus-grey-600">
            <span>1 000 zł</span>
            <span className="text-lg font-bold text-zus-green">
              {formatPLN(formData.monthlyGross || 0)}
            </span>
            <span>50 000 zł</span>
          </div>
        </div>
        {getFieldError("monthlyGross") && (
          <p className="text-sm text-zus-error mt-1 flex items-center gap-1">
            <AlertCircle className="w-4 h-4" />
            {getFieldError("monthlyGross")!.message}
          </p>
        )}
      </div>

      {/* Annual Raise Percentage */}
      <div>
        <label className="block text-xs font-semibold text-zus-grey-900 uppercase tracking-wide mb-1.5">
          Roczna % podwyżka (opcjonalnie)
        </label>
        <div className="flex items-center gap-2">
          <input
            type="checkbox"
            checked={formData.annualRaisePercentage !== undefined}
            onChange={(e) => {
              setFormData({
                ...formData,
                annualRaisePercentage: e.target.checked ? 1 : undefined,
              });
            }}
            className="w-4 h-4 accent-zus-green"
          />
          <span className="text-xs text-zus-grey-700">
            Dodaj coroczną podwyżkę
          </span>
          {formData.annualRaisePercentage !== undefined && (
            <>
              <input
                type="number"
                value={formData.annualRaisePercentage}
                onChange={(e) =>
                  setFormData({
                    ...formData,
                    annualRaisePercentage: Number(e.target.value),
                  })
                }
                min={0}
                max={100}
                step={0.5}
                className="w-16 px-2 py-1 text-sm border border-zus-grey-300 rounded focus:outline-none focus:ring-2 focus:ring-zus-green"
              />
              <span className="text-xs text-zus-grey-600">% rocznie</span>
            </>
          )}
        </div>
      </div>

      {/* Action Buttons */}
      <div className="space-y-2 pt-3 border-t border-zus-grey-300">
        <div className="flex gap-2">
          <Button
            onClick={onCancel}
            variant="ghost"
            size="md"
            className="flex-1"
          >
            Anuluj
          </Button>
          <Button
            onClick={handleSubmit}
            variant="success"
            size="md"
            className="flex-1"
            disabled={hasErrors}
          >
            {period ? "Zapisz" : "Dodaj"}
          </Button>
        </div>

        {period && onDelete && (
          <>
            {showDeleteConfirm ? (
              <div className="p-3 bg-red-50 border-2 border-zus-error rounded">
                <p className="text-xs font-semibold text-zus-error mb-2">
                  Czy na pewno chcesz usunąć?
                </p>
                <div className="flex gap-2">
                  <Button
                    onClick={() => setShowDeleteConfirm(false)}
                    variant="ghost"
                    size="sm"
                    className="flex-1"
                  >
                    Anuluj
                  </Button>
                  <Button
                    onClick={handleDelete}
                    className="flex-1 bg-zus-error hover:bg-red-700 text-white"
                    size="sm"
                  >
                    Usuń
                  </Button>
                </div>
              </div>
            ) : (
              <Button
                onClick={() => setShowDeleteConfirm(true)}
                className="w-full bg-zus-error hover:bg-red-700 text-white"
                size="md"
              >
                Usuń okres
              </Button>
            )}
          </>
        )}
      </div>
    </div>
  );
}
