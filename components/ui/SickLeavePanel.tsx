import React, { useState, useEffect } from "react";
import { LifeEvent, Month } from "@/lib/types";
import { Button } from "./Button";
import { calculateEndDate, formatYears } from "@/lib/utils/simulationHistory";
import {
  validateSickLeave,
  ValidationError,
} from "@/lib/utils/timelineValidation";
import { Activity, AlertCircle } from "lucide-react";

interface SickLeavePanelProps {
  event: LifeEvent | null;
  existingEvents: LifeEvent[];
  workStartYear: number;
  workEndYear: number;
  maxYear?: number; // Max year (e.g., when user is 90)
  onSave: (event: LifeEvent) => void;
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

const DURATION_OPTIONS = [0.5, 1, 1.5, 2, 2.5, 3];

export function SickLeavePanel({
  event,
  existingEvents,
  workStartYear,
  workEndYear,
  maxYear,
  onSave,
  onDelete,
  onCancel,
}: SickLeavePanelProps) {
  const [formData, setFormData] = useState<Partial<LifeEvent>>({
    type: "SICK_LEAVE",
    year: event?.year || new Date().getFullYear(),
    month: event?.month || 1,
    durationYears: event?.durationYears || 1,
    description: event?.description || "",
  });

  const [errors, setErrors] = useState<ValidationError[]>([]);
  const [showDeleteConfirm, setShowDeleteConfirm] = useState(false);

  useEffect(() => {
    const validationErrors = validateSickLeave(
      formData,
      existingEvents,
      event?.id
    );
    setErrors(validationErrors);
  }, [formData, existingEvents, event?.id]);

  const handleSubmit = () => {
    const validationErrors = validateSickLeave(
      formData,
      existingEvents,
      event?.id
    );

    if (validationErrors.some((e) => e.type === "error")) {
      setErrors(validationErrors);
      return;
    }

    const durationMonths = formData.durationYears! * 12;

    const savedEvent: LifeEvent = {
      id: event?.id || `sick-${Date.now()}`,
      type: "SICK_LEAVE",
      year: formData.year!,
      month: formData.month,
      durationYears: formData.durationYears!,
      durationMonths: durationMonths,
      description: formData.description,
    };

    onSave(savedEvent);
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
    formData.year && formData.month && formData.durationYears
      ? calculateEndDate(
          formData.year,
          formData.month,
          formData.durationYears * 12
        )
      : null;

  const getDurationLabel = (years: number) => {
    if (years === 0.5) return "6 miesięcy (pół roku)";
    if (years === 1) return "12 miesięcy (1 rok)";
    if (years === 1.5) return "18 miesięcy (1.5 roku)";
    if (years === 2) return "24 miesiące (2 lata)";
    if (years === 2.5) return "30 miesięcy (2.5 roku)";
    if (years === 3) return "36 miesięcy (3 lata)";
    return `${years * 12} miesięcy`;
  };

  return (
    <div className="space-y-4">
      {/* Info Banner */}
      <div className="p-3 bg-blue-50 border-l-4 border-zus-blue rounded">
        <div className="flex items-start gap-2">
          <Activity className="w-5 h-5 text-zus-blue flex-shrink-0 mt-0.5" />
          <div>
            <p className="text-xs font-semibold text-zus-grey-900 mb-0.5">
              Długotrwałe zwolnienie lekarskie
            </p>
            <p className="text-xs text-zus-grey-700">
              Składki emerytalne odprowadzane od zasiłku chorobowego, który jest
              niższy niż pełne wynagrodzenie.
            </p>
          </div>
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
              value={formData.month}
              onChange={(e) =>
                setFormData({
                  ...formData,
                  month: Number(e.target.value) as Month,
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
              value={formData.year}
              onChange={(e) =>
                setFormData({ ...formData, year: Number(e.target.value) })
              }
              className={`w-full px-3 py-2 border rounded-lg focus:outline-none focus:ring-2 focus:ring-zus-green ${
                getFieldError("year")
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
        {getFieldError("year") && (
          <p className="text-sm text-zus-error mt-1 flex items-center gap-1">
            <AlertCircle className="w-4 h-4" />
            {getFieldError("year")!.message}
          </p>
        )}
      </div>

      {/* Duration in Years */}
      <div>
        <label className="block text-xs font-semibold text-zus-grey-900 uppercase tracking-wide mb-1.5">
          Czas trwania
        </label>
        <div className="space-y-1.5">
          {DURATION_OPTIONS.map((duration) => (
            <label
              key={duration}
              className={`flex items-center gap-2 p-2.5 border-2 rounded-lg cursor-pointer transition-all ${
                formData.durationYears === duration
                  ? "border-zus-green bg-zus-green-light"
                  : "border-zus-grey-300 bg-white hover:border-zus-green/50"
              }`}
            >
              <input
                type="radio"
                name="durationYears"
                value={duration}
                checked={formData.durationYears === duration}
                onChange={(e) =>
                  setFormData({
                    ...formData,
                    durationYears: Number(e.target.value),
                  })
                }
                className="w-4 h-4 accent-zus-green"
              />
              <div className="flex-1">
                <span className="font-semibold text-sm text-zus-grey-900">
                  {getDurationLabel(duration)}
                </span>
              </div>
            </label>
          ))}
        </div>
        {getFieldError("durationYears") && (
          <p className="text-sm text-zus-error mt-1 flex items-center gap-1">
            <AlertCircle className="w-4 h-4" />
            {getFieldError("durationYears")!.message}
          </p>
        )}
      </div>

      {/* End Date Preview */}
      {endDate && (
        <div className="p-2 bg-zus-green-light rounded border border-zus-green">
          <p className="text-xs text-zus-grey-700">
            <strong>Koniec:</strong>{" "}
            {MONTHS[endDate.endMonth - 1].label} {endDate.endYear}
          </p>
        </div>
      )}

      {/* Impact Warning */}
      <div className="p-3 bg-red-50 border-l-4 border-zus-error rounded">
        <p className="text-xs text-zus-grey-700">
          <strong>⚠️ Wpływ:</strong> Zmniejszy kapitał emerytalny o ~20-30%,
          składki odprowadzane od niższego zasiłku chorobowego.
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
            {event ? "Zapisz" : "Dodaj"}
          </Button>
        </div>

        {event && onDelete && (
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
                Usuń zwolnienie
              </Button>
            )}
          </>
        )}
      </div>
    </div>
  );
}
