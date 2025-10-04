"use client";

import { Card } from "@/components/ui/Card";
import { Button } from "@/components/ui/Button";
import { FieldWithVisual } from "@/components/ui/FieldWithVisual";
import { FormField } from "@/components/ui/FormField";
import { InputWithSlider } from "@/components/ui/InputWithSlider";
import { AgeVisual } from "@/components/ui/AgeVisual";
import { SexVisual } from "@/components/ui/SexVisual";
import { SimulationInputs } from "@/lib/types";
import { LuLightbulb, LuTriangleAlert } from "react-icons/lu";

interface Step0Props {
  formData: Partial<SimulationInputs>;
  errors: any[];
  isComplete: boolean;
  onFieldChange: (field: keyof SimulationInputs, value: any) => void;
  onNext: () => void;
  onCancel: () => void;
  getFieldError: (errors: any[], field: string) => string | undefined;
}

export function Step0BasicInfo({
  formData,
  errors,
  isComplete,
  onFieldChange,
  onNext,
  onCancel,
  getFieldError,
}: Step0Props) {
  return (
    <Card className="p-8">
      <div className="mb-6">
        <h2 className="text-2xl font-bold text-zus-grey-900 mb-2">
          Zacznijmy od podstaw
        </h2>
        <p className="text-zus-grey-600">
          Podaj swój wiek i płeć, aby rozpocząć symulację
        </p>
      </div>

      <div className="space-y-8">
        <FieldWithVisual visual={<SexVisual sex={formData.sex} />}>
          <FormField label="Płeć" required error={getFieldError(errors, "sex")}>
            <div className="flex gap-6">
              <label className="flex items-center gap-2 cursor-pointer">
                <input
                  type="radio"
                  name="sex"
                  value="M"
                  checked={formData.sex === "M"}
                  onChange={(e) =>
                    onFieldChange("sex", e.target.value as "M" | "F")
                  }
                  className="w-5 h-5 accent-zus-green"
                />
                <span className="text-lg">Mężczyzna</span>
              </label>
              <label className="flex items-center gap-2 cursor-pointer">
                <input
                  type="radio"
                  name="sex"
                  value="F"
                  checked={formData.sex === "F"}
                  onChange={(e) =>
                    onFieldChange("sex", e.target.value as "M" | "F")
                  }
                  className="w-5 h-5 accent-zus-green"
                />
                <span className="text-lg">Kobieta</span>
              </label>
            </div>
          </FormField>
        </FieldWithVisual>

        <FieldWithVisual visual={<AgeVisual age={formData.age} />}>
          <InputWithSlider
            label="Twój obecny wiek"
            value={formData.age}
            onChange={(value) => onFieldChange("age", value)}
            min={18}
            max={100}
            step={1}
            suffix="lat"
            placeholder="np. 35"
            required
            error={getFieldError(errors, "age")}
            reserveErrorSpace="46px"
          />
          {formData.age &&
            formData.age > 70 &&
            formData.age <= 100 &&
            !getFieldError(errors, "age") && (
              <div className="mt-2 p-3 bg-orange-50 border-l-4 border-zus-warning rounded text-sm text-zus-grey-700 flex items-start gap-2">
                <LuLightbulb className="w-5 h-5 text-zus-orange flex-shrink-0 mt-0.5" />
                <span>
                  W tym wieku prawdopodobnie jesteś już na emeryturze. Symulator
                  służy do planowania przyszłej emerytury.
                </span>
              </div>
            )}
        </FieldWithVisual>
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
            onClick={onCancel}
            className="flex-1"
          >
            Anuluj
          </Button>
          <Button
            type="button"
            onClick={onNext}
            variant="success"
            size="lg"
            className="flex-1"
            disabled={!isComplete}
          >
            Dalej: Historia pracy →
          </Button>
        </div>
      </div>
    </Card>
  );
}
