import React, { useState, useEffect } from "react";
import { EmploymentGapPeriod, Month } from "@/lib/types";
import { Button } from "./Button";
import { calculateEndDate, formatMonths } from "@/lib/utils/simulationHistory";
import {
  validateGapPeriod,
  ValidationError,
} from "@/lib/utils/timelineValidation";
import { Baby, Plane, TrendingDown, AlertCircle } from "lucide-react";

interface GapPeriodPanelProps {
  gap: EmploymentGapPeriod | null;
  existingGaps: EmploymentGapPeriod[];
  workStartYear: number;
  workEndYear: number;
  maxYear?: number; // Max year (e.g., when user is 90)
  onSave: (gap: EmploymentGapPeriod) => void;
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

const GAP_TYPES: {
  value: "MATERNITY_LEAVE" | "UNPAID_LEAVE" | "UNEMPLOYMENT";
  label: string;
  icon: React.ReactElement;
  color: string;
}[] = [
  {
    value: "MATERNITY_LEAVE",
    label: "Urlop macierzyński / rodzicielski",
    icon: <Baby className="w-6 h-6" />,
    color: "pink",
  },
  {
    value: "UNPAID_LEAVE",
    label: "Urlop bezpłatny",
    icon: <Plane className="w-6 h-6" />,
    color: "orange",
  },
  {
    value: "UNEMPLOYMENT",
    label: "Bezrobocie",
    icon: <TrendingDown className="w-6 h-6" />,
    color: "grey",
  },
];

export function GapPeriodPanel({
  gap,
  existingGaps,
  workStartYear,
  workEndYear,
  maxYear,
  onSave,
  onDelete,
  onCancel,
}: GapPeriodPanelProps) {
  const [formData, setFormData] = useState<Partial<EmploymentGapPeriod>>({
    kind: gap?.kind || "MATERNITY_LEAVE",
    startYear: gap?.startYear || new Date().getFullYear(),
    startMonth: gap?.startMonth || 1,
    durationMonths: gap?.durationMonths || 12,
    description: gap?.description || "",
  });

  const [errors, setErrors] = useState<ValidationError[]>([]);
  const [showDeleteConfirm, setShowDeleteConfirm] = useState(false);

  useEffect(() => {
    const validationErrors = validateGapPeriod(formData, existingGaps, gap?.id);
    setErrors(validationErrors);
  }, [formData, existingGaps, gap?.id]);

  const handleSubmit = () => {
    const validationErrors = validateGapPeriod(formData, existingGaps, gap?.id);

    if (validationErrors.some((e) => e.type === "error")) {
      setErrors(validationErrors);
      return;
    }

    const savedGap: EmploymentGapPeriod = {
      id: gap?.id || `gap-${Date.now()}`,
      kind: formData.kind!,
      startYear: formData.startYear!,
      startMonth: formData.startMonth!,
      durationMonths: formData.durationMonths!,
      description: formData.description,
    };

    onSave(savedGap);
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

  const endDate =
    formData.startYear && formData.startMonth && formData.durationMonths
      ? calculateEndDate(
          formData.startYear,
          formData.startMonth,
          formData.durationMonths
        )
      : null;

  const selectedType = GAP_TYPES.find((t) => t.value === formData.kind);

  return (
    <div className="space-y-4">
      {/* Type Selection */}
      <div>
        <label className="block text-xs font-semibold text-zus-grey-900 uppercase tracking-wide mb-2">
          Typ przerwy
        </label>
        <div className="space-y-1.5">
          {GAP_TYPES.map((type) => (
            <label
              key={type.value}
              className={`flex items-center gap-2 p-2.5 border-2 rounded-lg cursor-pointer transition-all ${
                formData.kind === type.value
                  ? "border-zus-green bg-zus-green-light"
                  : "border-zus-grey-300 bg-white hover:border-zus-green/50"
              }`}
            >
              <input
                type="radio"
                name="kind"
                value={type.value}
                checked={formData.kind === type.value}
                onChange={(e) =>
                  setFormData({
                    ...formData,
                    kind: e.target.value as EmploymentGapPeriod["kind"],
                  })
                }
                className="w-4 h-4 accent-zus-green"
              />
              <div className="text-zus-green w-5 h-5">{React.cloneElement(type.icon, { className: 'w-5 h-5' } as any)}</div>
              <span className="font-semibold text-sm text-zus-grey-900">
                {type.label}
              </span>
            </label>
          ))}
        </div>
      </div>

      {/* Start Date */}
      <div>
        <label className="block text-xs font-semibold text-zus-grey-900 uppercase tracking-wide mb-1.5">
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

      {/* Duration in Months */}
      <div>
        <label className="block text-xs font-semibold text-zus-grey-900 uppercase tracking-wide mb-1.5">
          Czas trwania (w miesiącach)
        </label>
        <div className="space-y-1.5">
          <input
            type="number"
            value={formData.durationMonths}
            onChange={(e) =>
              setFormData({
                ...formData,
                durationMonths: Number(e.target.value),
              })
            }
            min={1}
            max={36}
            step={1}
            className={`w-full px-3 py-2 text-base font-semibold border-2 rounded-lg focus:outline-none focus:ring-2 focus:ring-zus-green ${
              getFieldError("durationMonths")
                ? "border-zus-error"
                : "border-zus-grey-300"
            }`}
          />
          <input
            type="range"
            value={formData.durationMonths}
            onChange={(e) =>
              setFormData({
                ...formData,
                durationMonths: Number(e.target.value),
              })
            }
            min={1}
            max={36}
            step={1}
            className="w-full accent-zus-green"
          />
          <div className="flex justify-between text-xs text-zus-grey-600">
            <span>1 miesiąc</span>
            <span className="text-lg font-bold text-zus-green">
              {formatMonths(formData.durationMonths || 1)}
            </span>
            <span>36 miesięcy</span>
          </div>
        </div>
        {getFieldError("durationMonths") && (
          <p className="text-sm text-zus-error mt-1 flex items-center gap-1">
            <AlertCircle className="w-4 h-4" />
            {getFieldError("durationMonths")!.message}
          </p>
        )}
      </div>

      {/* End Date Preview */}
      {endDate && (
        <div className="p-2 bg-zus-green-light rounded border border-zus-green">
          <p className="text-xs text-zus-grey-700">
            <strong>Kończy się:</strong> {MONTHS[endDate.endMonth - 1].label}{" "}
            {endDate.endYear}
          </p>
        </div>
      )}

      {/* Impact Warning */}
      <div className="p-3 bg-yellow-50 border-l-4 border-zus-warning rounded">
        <p className="text-xs text-zus-grey-700">
          <strong>ℹ️ Wpływ:</strong> Podczas{" "}
          {formData.kind === "MATERNITY_LEAVE"
            ? "urlopu macierzyńskiego"
            : formData.kind === "UNPAID_LEAVE"
            ? "urlopu bezpłatnego"
            : "bezrobocia"}{" "}
          składki emerytalne mogą być zmniejszone lub niewpłacane, co wpłynie na
          wysokość przyszłej emerytury.
        </p>
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
            {gap ? "Zapisz" : "Dodaj"}
          </Button>
        </div>

        {gap && onDelete && (
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
                Usuń przerwę
              </Button>
            )}
          </>
        )}
      </div>
    </div>
  );
}
