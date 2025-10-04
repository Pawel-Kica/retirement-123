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
  onSave,
  onDelete,
  onCancel,
}: EmploymentPeriodPanelProps) {
  const [formData, setFormData] = useState<Partial<EmploymentPeriod>>({
    startYear: period?.startYear || workStartYear,
    startMonth: period?.startMonth || 1,
    endYear: period?.endYear || workEndYear,
    endMonth: period?.endMonth || 12,
    monthlyGross: period?.monthlyGross || 7000,
    contractType: period?.contractType || "UOP",
    description: period?.description || "",
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
      startMonth: formData.startMonth!,
      endYear: formData.endYear!,
      endMonth: formData.endMonth!,
      monthlyGross: formData.monthlyGross!,
      contractType: formData.contractType!,
      description: formData.description,
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

  const years = Array.from(
    { length: workEndYear - workStartYear + 5 },
    (_, i) => workStartYear + i
  );

  return (
    <div className="space-y-6">
      {/* Contract Type */}
      <div>
        <label className="block text-sm font-semibold text-zus-grey-900 mb-3">
          Typ zatrudnienia
        </label>
        <div className="space-y-2">
          {CONTRACT_TYPES.map((type) => (
            <label
              key={type.value}
              className={`flex items-center gap-3 p-4 border-2 rounded-lg cursor-pointer transition-all ${
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
                className="w-5 h-5 accent-zus-green"
              />
              <span className="text-2xl">{type.icon}</span>
              <span className="font-semibold text-zus-grey-900">
                {type.label}
              </span>
            </label>
          ))}
        </div>
      </div>

      {/* Start Date */}
      <div>
        <label className="block text-sm font-semibold text-zus-grey-900 mb-2">
          Data rozpoczęcia
        </label>
        <div className="grid grid-cols-2 gap-3">
          <div>
            <label className="block text-xs text-zus-grey-600 mb-1">
              Miesiąc
            </label>
            <select
              value={formData.startMonth}
              onChange={(e) =>
                setFormData({
                  ...formData,
                  startMonth: Number(e.target.value) as Month,
                })
              }
              className="w-full px-3 py-2 border border-zus-grey-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-zus-green"
            >
              {MONTHS.map((month) => (
                <option key={month.value} value={month.value}>
                  {month.label}
                </option>
              ))}
            </select>
          </div>
          <div>
            <label className="block text-xs text-zus-grey-600 mb-1">Rok</label>
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
          </div>
        </div>
        {getFieldError("startYear") && (
          <p className="text-sm text-zus-error mt-1 flex items-center gap-1">
            <AlertCircle className="w-4 h-4" />
            {getFieldError("startYear")!.message}
          </p>
        )}
      </div>

      {/* End Date */}
      <div>
        <label className="block text-sm font-semibold text-zus-grey-900 mb-2">
          Data zakończenia
        </label>
        <div className="grid grid-cols-2 gap-3">
          <div>
            <label className="block text-xs text-zus-grey-600 mb-1">
              Miesiąc
            </label>
            <select
              value={formData.endMonth}
              onChange={(e) =>
                setFormData({
                  ...formData,
                  endMonth: Number(e.target.value) as Month,
                })
              }
              className="w-full px-3 py-2 border border-zus-grey-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-zus-green"
            >
              {MONTHS.map((month) => (
                <option key={month.value} value={month.value}>
                  {month.label}
                </option>
              ))}
            </select>
          </div>
          <div>
            <label className="block text-xs text-zus-grey-600 mb-1">Rok</label>
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
          </div>
        </div>
        {getFieldError("endYear") && (
          <p className="text-sm text-zus-error mt-1 flex items-center gap-1">
            <AlertCircle className="w-4 h-4" />
            {getFieldError("endYear")!.message}
          </p>
        )}
      </div>

      {/* Duration Display */}
      {formData.startYear &&
        formData.startMonth &&
        formData.endYear &&
        formData.endMonth && (
          <div className="p-3 bg-zus-green-light rounded-lg border border-zus-green">
            <p className="text-sm text-zus-grey-700">
              <strong>Czas trwania:</strong>{" "}
              {formatDuration(
                formData.startYear,
                formData.startMonth,
                formData.endYear,
                formData.endMonth
              )}
            </p>
          </div>
        )}

      {/* Monthly Gross Salary */}
      <div>
        <label className="block text-sm font-semibold text-zus-grey-900 mb-2">
          Wynagrodzenie miesięczne brutto
        </label>
        <div className="space-y-2">
          <input
            type="number"
            value={formData.monthlyGross}
            onChange={(e) =>
              setFormData({ ...formData, monthlyGross: Number(e.target.value) })
            }
            min={1000}
            max={100000}
            step={100}
            className={`w-full px-4 py-3 text-lg font-semibold border-2 rounded-lg focus:outline-none focus:ring-2 focus:ring-zus-green ${
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

      {/* Description */}
      <div>
        <label className="block text-sm font-semibold text-zus-grey-900 mb-2">
          Opis (opcjonalnie)
        </label>
        <textarea
          value={formData.description}
          onChange={(e) =>
            setFormData({ ...formData, description: e.target.value })
          }
          placeholder="np. Praca w firmie XYZ"
          rows={3}
          className="w-full px-4 py-2 border border-zus-grey-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-zus-green"
        />
      </div>

      {/* Action Buttons */}
      <div className="space-y-3 pt-4 border-t border-zus-grey-300">
        <div className="flex gap-3">
          <Button
            onClick={onCancel}
            variant="ghost"
            size="lg"
            className="flex-1"
          >
            Anuluj
          </Button>
          <Button
            onClick={handleSubmit}
            variant="success"
            size="lg"
            className="flex-1"
            disabled={hasErrors}
          >
            {period ? "Zapisz zmiany" : "Dodaj okres"}
          </Button>
        </div>

        {period && onDelete && (
          <>
            {showDeleteConfirm ? (
              <div className="p-4 bg-red-50 border-2 border-zus-error rounded-lg">
                <p className="text-sm font-semibold text-zus-error mb-3">
                  Czy na pewno chcesz usunąć ten okres zatrudnienia?
                </p>
                <div className="flex gap-2">
                  <Button
                    onClick={() => setShowDeleteConfirm(false)}
                    variant="ghost"
                    size="sm"
                    className="flex-1"
                  >
                    Nie, anuluj
                  </Button>
                  <Button
                    onClick={handleDelete}
                    className="flex-1 bg-zus-error hover:bg-red-700 text-white"
                    size="sm"
                  >
                    Tak, usuń
                  </Button>
                </div>
              </div>
            ) : (
              <Button
                onClick={() => setShowDeleteConfirm(true)}
                className="w-full bg-zus-error hover:bg-red-700 text-white"
                size="lg"
              >
                Usuń okres zatrudnienia
              </Button>
            )}
          </>
        )}
      </div>
    </div>
  );
}
