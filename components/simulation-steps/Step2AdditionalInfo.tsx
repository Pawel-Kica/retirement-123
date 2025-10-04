"use client";

import { Card } from "@/components/ui/Card";
import { Button } from "@/components/ui/Button";
import { FormField } from "@/components/ui/FormField";
import { SimulationInputs } from "@/lib/types";
import { LuBanknote, LuHeartPulse } from "react-icons/lu";

interface Step2Props {
  formData: Partial<SimulationInputs>;
  sickImpactConfig: any;
  onFieldChange: (field: keyof SimulationInputs, value: any) => void;
  onNext: () => void;
  onBack: () => void;
}

export function Step2AdditionalInfo({
  formData,
  sickImpactConfig,
  onFieldChange,
  onNext,
  onBack,
}: Step2Props) {
  return (
    <Card className="p-8">
      <div className="mb-6">
        <h2 className="text-2xl font-bold text-zus-grey-900 mb-2">
          Dodatkowe informacje
        </h2>
        <p className="text-zus-grey-600">
          Te informacje są opcjonalne, ale mogą zwiększyć dokładność prognozy
        </p>
      </div>

      <div className="space-y-6">
        <div className="p-4 bg-blue-50 border-l-4 border-zus-navy rounded">
          <p className="text-sm text-zus-grey-700 flex items-start gap-2">
            <LuBanknote className="w-5 h-5 text-zus-green flex-shrink-0 mt-0.5" />
            <span>
              <strong>Zgromadzony kapitał</strong>
              <br />
              Jeśli znasz stan swojego konta w ZUS, możesz go tutaj wpisać dla
              dokładniejszej prognozy.
            </span>
          </p>
        </div>

        <FormField
          label="Środki na koncie podstawowym"
          tooltip="Kapitał zgromadzony na Twoim koncie emerytalnym (19,52% składki). Znajdziesz go na wyciągu z ZUS lub w systemie PUE ZUS."
        >
          <div className="relative">
            <input
              type="number"
              min={0}
              step={0.01}
              value={
                formData.accountBalance !== undefined
                  ? formData.accountBalance
                  : ""
              }
              onChange={(e) =>
                onFieldChange(
                  "accountBalance",
                  e.target.value !== "" ? Number(e.target.value) : undefined
                )
              }
              placeholder="Pozostaw puste, jeśli nie znasz"
              className="w-full px-4 py-2 pr-12 border border-zus-grey-300 rounded focus:outline-none focus:ring-2 focus:ring-zus-green focus:border-zus-green"
            />
            <span className="absolute right-4 top-1/2 -translate-y-1/2 text-gray-500">
              zł
            </span>
          </div>
        </FormField>

        <FormField
          label="Środki na subkoncie (OFE)"
          tooltip="Kapitał zgromadzony na subkoncie (dla osób urodzonych po 1968 roku). Znajdziesz go na wyciągu z ZUS."
        >
          <div className="relative">
            <input
              type="number"
              min={0}
              step={0.01}
              value={
                formData.subAccountBalance !== undefined
                  ? formData.subAccountBalance
                  : ""
              }
              onChange={(e) =>
                onFieldChange(
                  "subAccountBalance",
                  e.target.value !== "" ? Number(e.target.value) : undefined
                )
              }
              placeholder="Pozostaw puste, jeśli nie znasz"
              className="w-full px-4 py-2 pr-12 border border-zus-grey-300 rounded focus:outline-none focus:ring-2 focus:ring-zus-green focus:border-zus-green"
            />
            <span className="absolute right-4 top-1/2 -translate-y-1/2 text-zus-grey-500">
              zł
            </span>
          </div>
        </FormField>

        <div className="pt-4">
          <div className="p-4 bg-blue-50 border-l-4 border-zus-blue rounded">
            <h4 className="text-base font-bold text-zus-grey-900 mb-3">
              Dodatkowe programy emerytalne
            </h4>
            <div className="space-y-3">
              <label className="flex items-center gap-3 p-3 bg-white rounded-lg cursor-pointer hover:bg-blue-50 transition-colors border-2 border-transparent hover:border-zus-blue">
                <input
                  type="checkbox"
                  checked={formData.retirementPrograms?.ppk.enabled || false}
                  onChange={(e) =>
                    onFieldChange("retirementPrograms", {
                      ...formData.retirementPrograms,
                      ppk: {
                        ...(formData.retirementPrograms?.ppk || {
                          employeeRate: 0.02,
                          employerRate: 0.015,
                        }),
                        enabled: e.target.checked,
                      },
                    })
                  }
                  className="w-5 h-5 accent-zus-blue flex-shrink-0"
                />
                <div className="flex-1">
                  <div className="font-semibold text-zus-grey-900 flex items-center gap-2">
                    <span>Uczestniczę w PPK</span>
                    <span className="px-2 py-0.5 bg-zus-blue/10 text-zus-blue text-xs font-bold rounded">
                      +~3.5%
                    </span>
                  </div>
                </div>
              </label>

              <label className="flex items-center gap-3 p-3 bg-white rounded-lg cursor-pointer hover:bg-orange-50 transition-colors border-2 border-transparent hover:border-zus-orange">
                <input
                  type="checkbox"
                  checked={formData.retirementPrograms?.ikze.enabled || false}
                  onChange={(e) =>
                    onFieldChange("retirementPrograms", {
                      ...formData.retirementPrograms,
                      ikze: {
                        ...(formData.retirementPrograms?.ikze || {
                          contributionRate: 0.1,
                        }),
                        enabled: e.target.checked,
                      },
                    })
                  }
                  className="w-5 h-5 accent-zus-orange flex-shrink-0"
                />
                <div className="flex-1">
                  <div className="font-semibold text-zus-grey-900 flex items-center gap-2">
                    <span>Mam IKZE</span>
                    <span className="px-2 py-0.5 bg-zus-orange/10 text-zus-orange text-xs font-bold rounded">
                      +~10%
                    </span>
                  </div>
                </div>
              </label>
            </div>
          </div>
        </div>

        <div className="pt-4">
          <div className="p-5 bg-blue-50 border-l-4 border-zus-navy rounded-lg shadow-sm">
            <div className="flex items-start gap-3 mb-4">
              <LuHeartPulse className="w-6 h-6 text-zus-error flex-shrink-0 mt-0.5" />
              <div className="flex-1">
                <h4 className="text-lg font-bold text-zus-grey-900 mb-1">
                  Zwolnienia lekarskie
                </h4>
                <p className="text-sm text-zus-grey-700">
                  Uwzględnij statystyczne prawdopodobieństwo zwolnień lekarskich
                </p>
              </div>
            </div>

            <label className="flex items-center gap-3 p-3 bg-white rounded-lg cursor-pointer hover:bg-zus-green-light transition-colors border-2 border-transparent hover:border-zus-green mb-4">
              <input
                type="checkbox"
                checked={formData.includeZwolnienieZdrowotne || false}
                onChange={(e) =>
                  onFieldChange("includeZwolnienieZdrowotne", e.target.checked)
                }
                className="w-5 h-5 accent-zus-green flex-shrink-0"
              />
              <span className="font-semibold text-zus-grey-900">
                Uwzględnij prawdopodobieństwo zwolnień lekarskich
              </span>
            </label>

            <div className="bg-white/70 rounded-lg p-4 space-y-3">
              <h5 className="font-bold text-zus-grey-900">
                Średnia długość zwolnienia lekarskiego w Polsce:
              </h5>
              <ul className="space-y-2 text-sm">
                <li className="flex items-start gap-2">
                  <span className="text-zus-green font-bold">•</span>
                  <span className="text-zus-grey-700">
                    <strong>Kobiety:</strong> średnio{" "}
                    {sickImpactConfig?.avgDaysPerYear || 0} dni rocznie
                  </span>
                </li>
                <li className="flex items-start gap-2">
                  <span className="text-zus-green font-bold">•</span>
                  <span className="text-zus-grey-700">
                    <strong>Mężczyźni:</strong> średnio{" "}
                    {sickImpactConfig?.avgDaysPerYear || 0} dni rocznie
                  </span>
                </li>
              </ul>
              <p className="text-sm text-zus-grey-700 pt-2 border-t border-zus-grey-300">
                Podczas zwolnienia lekarskiego składki emerytalne są
                odprowadzane od zasiłku (zazwyczaj niższego niż pełne
                wynagrodzenie), co zmniejsza kapitał emerytalny. Średnio obniża
                to świadczenie o{" "}
                <strong className="text-zus-error">
                  {(
                    (1 - (sickImpactConfig?.reductionCoefficient || 1)) *
                    100
                  ).toFixed(1)}
                  %
                </strong>
                .
              </p>
            </div>
          </div>
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
          >
            ← Wstecz
          </Button>
          <Button
            type="button"
            onClick={onNext}
            variant="success"
            size="lg"
            className="flex-1"
          >
            Dalej: Podsumowanie →
          </Button>
        </div>
      </div>
    </Card>
  );
}
