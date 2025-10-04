"use client";

import { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import { Button } from "@/components/ui/Button";
import { Card } from "@/components/ui/Card";
import { Input } from "@/components/ui/Input";
import { FormField } from "@/components/ui/FormField";
import { useSimulation } from "@/lib/context/SimulationContext";
import { SimulationInputs } from "@/lib/types";
import {
  validateSimulationInputs,
  getFieldError,
} from "@/lib/utils/validation";
import { loadAllData } from "@/lib/data/loader";

export default function SimulacjaPage() {
  const router = useRouter();
  const { state, setInputs, recalculate, isCalculating } = useSimulation();
  const [data, setData] = useState<any>(null);

  const currentYear = new Date().getFullYear();
  const [formData, setFormData] = useState<Partial<SimulationInputs>>({
    age: 35,
    sex: "M",
    monthlyGross: 5000,
    workStartYear: currentYear - 15,
    workEndYear: currentYear + 25,
    includeL4: false,
  });

  const [errors, setErrors] = useState<any[]>([]);
  const [showL4Info, setShowL4Info] = useState(false);

  useEffect(() => {
    const loadedData = loadAllData();
    setData(loadedData);

    // Calculate default retirement year
    if (formData.age && formData.sex) {
      const retirementAge = loadedData.retirementAge[formData.sex];
      const defaultRetirementYear =
        currentYear + (retirementAge - formData.age);
      setFormData((prev) => ({ ...prev, workEndYear: defaultRetirementYear }));
    }
  }, []);

  const handleChange = (field: keyof SimulationInputs, value: any) => {
    setFormData((prev) => ({ ...prev, [field]: value }));

    // Recalculate default retirement year when age or sex changes
    if ((field === "age" || field === "sex") && data) {
      const age = field === "age" ? value : formData.age;
      const sex = field === "sex" ? value : formData.sex;
      if (age && sex) {
        const retirementAge = data.retirementAge[sex];
        const defaultRetirementYear = currentYear + (retirementAge - age);
        setFormData((prev) => ({
          ...prev,
          workEndYear: defaultRetirementYear,
        }));
      }
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    // Validate
    const validation = validateSimulationInputs(formData);
    if (!validation.isValid) {
      setErrors(validation.errors);
      return;
    }

    setErrors([]);

    try {
      setInputs(formData as SimulationInputs);
      await recalculate();
      router.push("/wynik");
    } catch (error) {
      console.error("Calculation error:", error);
      alert("Wystąpił błąd podczas obliczania prognozy. Spróbuj ponownie.");
    }
  };

  // Generate year options
  const startYearOptions = [];
  const earliestStart = currentYear - (formData.age || 70) + 18;
  for (let year = earliestStart; year <= currentYear; year++) {
    startYearOptions.push({ value: year, label: year.toString() });
  }

  const endYearOptions = [];
  const minEnd = (formData.workStartYear || currentYear) + 10;
  for (let year = minEnd; year <= 2080; year++) {
    endYearOptions.push({ value: year, label: year.toString() });
  }

  if (!data)
    return (
      <div className="min-h-screen flex items-center justify-center">
        Ładowanie...
      </div>
    );

  const l4Config = formData.sex === "M" ? data.sickImpactM : data.sickImpactF;

  return (
    <main className="min-h-screen bg-gradient-to-b from-gray-50 to-gray-100 py-12">
      <div className="container mx-auto px-4 max-w-3xl">
        <div className="mb-8">
          <button
            onClick={() => router.push("/")}
            className="text-[rgb(63,132,210)] hover:underline mb-4"
          >
            ← Powrót do strony głównej
          </button>
          <h1 className="text-4xl font-bold text-[rgb(0,65,110)]">
            Symulacja Emerytury
          </h1>
          <p className="text-gray-700 mt-2">
            Wypełnij formularz, aby poznać prognozę swojej przyszłej emerytury
          </p>
        </div>

        <form onSubmit={handleSubmit}>
          <Card className="mb-6">
            <h2 className="text-2xl font-bold text-[rgb(0,65,110)] mb-6">
              Dane podstawowe
            </h2>

            <div className="space-y-4">
              <FormField
                label="Twój obecny wiek"
                required
                error={getFieldError(errors, "age")}
              >
                <input
                  type="number"
                  min={18}
                  max={70}
                  value={formData.age || ""}
                  onChange={(e) => handleChange("age", Number(e.target.value))}
                  className="w-full px-4 py-2 border-2 border-[rgb(190,195,206)] rounded-lg"
                  required
                />
              </FormField>

              <FormField
                label="Płeć"
                required
                error={getFieldError(errors, "sex")}
              >
                <div className="flex gap-6">
                  <label className="flex items-center gap-2 cursor-pointer">
                    <input
                      type="radio"
                      name="sex"
                      value="K"
                      checked={formData.sex === ("K" as const)}
                      onChange={(e) => handleChange("sex", e.target.value)}
                      className="w-5 h-5 accent-[rgb(63,132,210)]"
                    />
                    <span className="text-lg">Kobieta</span>
                  </label>
                  <label className="flex items-center gap-2 cursor-pointer">
                    <input
                      type="radio"
                      name="sex"
                      value="M"
                      checked={formData.sex === ("M" as const)}
                      onChange={(e) => handleChange("sex", e.target.value)}
                      className="w-5 h-5 accent-[rgb(63,132,210)]"
                    />
                    <span className="text-lg">Mężczyzna</span>
                  </label>
                </div>
              </FormField>

              <FormField
                label="Twoje obecne wynagrodzenie brutto miesięczne"
                required
                hint="Podaj kwotę brutto (przed potrąceniem podatków i składek)"
                error={getFieldError(errors, "monthlyGross")}
              >
                <div className="relative">
                  <input
                    type="number"
                    min={1000}
                    max={100000}
                    step={100}
                    value={formData.monthlyGross || ""}
                    onChange={(e) =>
                      handleChange("monthlyGross", Number(e.target.value))
                    }
                    className="w-full px-4 py-2 pr-12 border-2 border-[rgb(190,195,206)] rounded-lg"
                    required
                  />
                  <span className="absolute right-4 top-1/2 -translate-y-1/2 text-gray-500">
                    zł
                  </span>
                </div>
              </FormField>

              <FormField
                label="W którym roku rozpocząłeś/rozpoczęłaś pracę?"
                required
                hint="📅 Zawsze liczone od stycznia danego roku"
                error={getFieldError(errors, "workStartYear")}
              >
                <select
                  value={formData.workStartYear || ""}
                  onChange={(e) =>
                    handleChange("workStartYear", Number(e.target.value))
                  }
                  className="w-full px-4 py-2 border-2 border-[rgb(190,195,206)] rounded-lg"
                  required
                >
                  {startYearOptions.map((opt) => (
                    <option key={opt.value} value={opt.value}>
                      {opt.label}
                    </option>
                  ))}
                </select>
              </FormField>

              <FormField
                label="Planowany rok przejścia na emeryturę"
                required
                hint={`💡 Domyślnie: ${formData.workEndYear} (osiągnięcie wieku emerytalnego). Możesz wybrać inny rok, jeśli planujesz pracować dłużej lub krócej.`}
                error={getFieldError(errors, "workEndYear")}
              >
                <select
                  value={formData.workEndYear || ""}
                  onChange={(e) =>
                    handleChange("workEndYear", Number(e.target.value))
                  }
                  className="w-full px-4 py-2 border-2 border-[rgb(190,195,206)] rounded-lg"
                  required
                >
                  {endYearOptions.map((opt) => (
                    <option key={opt.value} value={opt.value}>
                      {opt.label}
                    </option>
                  ))}
                </select>
              </FormField>
            </div>
          </Card>

          <Card className="mb-6">
            <h3 className="text-xl font-bold text-[rgb(0,65,110)] mb-4">
              Zgromadzony kapitał w ZUS (opcjonalnie)
            </h3>
            <p className="text-sm text-gray-600 mb-4">
              Jeśli znasz stan swojego konta w ZUS, możesz go tutaj wpisać dla
              dokładniejszej prognozy. Jeśli nie znasz - pozostaw puste, a
              system oszacuje je automatycznie.
            </p>

            <div className="space-y-4">
              <FormField
                label="Środki na koncie podstawowym"
                tooltip="Kapitał zgromadzony na Twoim koncie emerytalnym (19,52% składki). Znajdziesz go na wyciągu z ZUS lub w systemie PUE ZUS."
              >
                <div className="relative">
                  <input
                    type="number"
                    min={0}
                    step={0.01}
                    value={formData.accountBalance || ""}
                    onChange={(e) =>
                      handleChange(
                        "accountBalance",
                        e.target.value ? Number(e.target.value) : undefined
                      )
                    }
                    placeholder="Pozostaw puste, jeśli nie znasz"
                    className="w-full px-4 py-2 pr-12 border-2 border-[rgb(190,195,206)] rounded-lg"
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
                    value={formData.subAccountBalance || ""}
                    onChange={(e) =>
                      handleChange(
                        "subAccountBalance",
                        e.target.value ? Number(e.target.value) : undefined
                      )
                    }
                    placeholder="Pozostaw puste, jeśli nie znasz"
                    className="w-full px-4 py-2 pr-12 border-2 border-[rgb(190,195,206)] rounded-lg"
                  />
                  <span className="absolute right-4 top-1/2 -translate-y-1/2 text-gray-500">
                    zł
                  </span>
                </div>
              </FormField>
            </div>
          </Card>

          <Card className="mb-6 bg-[rgb(63,132,210)]/10">
            <div className="flex items-center justify-between">
              <div className="flex-1">
                <label className="flex items-center gap-3 cursor-pointer">
                  <input
                    type="checkbox"
                    checked={formData.includeL4}
                    onChange={(e) =>
                      handleChange("includeL4", e.target.checked)
                    }
                    className="w-5 h-5 accent-[rgb(63,132,210)]"
                  />
                  <span className="font-bold text-[rgb(0,65,110)]">
                    Uwzględnij prawdopodobieństwo zwolnień lekarskich (L4)
                  </span>
                </label>
              </div>
              <button
                type="button"
                onClick={() => setShowL4Info(!showL4Info)}
                className="text-[rgb(63,132,210)] hover:text-[rgb(63,132,210)]/80"
              >
                <svg
                  className="w-6 h-6"
                  fill="currentColor"
                  viewBox="0 0 20 20"
                >
                  <path
                    fillRule="evenodd"
                    d="M18 10a8 8 0 11-16 0 8 8 0 0116 0zm-7-4a1 1 0 11-2 0 1 1 0 012 0zM9 9a1 1 0 000 2v3a1 1 0 001 1h1a1 1 0 100-2v-3a1 1 0 00-1-1H9z"
                    clipRule="evenodd"
                  />
                </svg>
              </button>
            </div>

            {showL4Info && (
              <div className="mt-4 p-4 bg-white rounded border-l-4 border-[rgb(63,132,210)]">
                <h4 className="font-bold mb-2">Średnia długość L4 w Polsce:</h4>
                <ul className="list-disc pl-5 space-y-1 mb-3">
                  <li>
                    Kobiety: średnio {data.sickImpactF.avgDaysPerYear} dni
                    rocznie
                  </li>
                  <li>
                    Mężczyźni: średnio {data.sickImpactM.avgDaysPerYear} dni
                    rocznie
                  </li>
                </ul>
                <p className="text-sm">
                  <strong>Jak to wpływa na emeryturę?</strong>
                  <br />
                  Podczas zwolnienia lekarskiego składki emerytalne są
                  odprowadzane od zasiłku (zazwyczaj niższego niż pełne
                  wynagrodzenie), co zmniejsza kapitał emerytalny. Średnio
                  obniża to świadczenie o{" "}
                  {((1 - l4Config.reductionCoefficient) * 100).toFixed(1)}%.
                </p>
                <p className="mt-2 text-xs text-gray-600">
                  ℹ️ To informacja edukacyjna oparta na danych statystycznych,
                  nie instrukcja prawna.
                </p>
              </div>
            )}
          </Card>

          <div className="flex gap-4">
            <Button
              type="button"
              variant="ghost"
              size="lg"
              onClick={() => router.push("/")}
              className="flex-1"
            >
              Anuluj
            </Button>
            <Button
              type="submit"
              size="lg"
              loading={isCalculating}
              disabled={isCalculating}
              className="flex-1"
            >
              {isCalculating
                ? "Obliczanie prognozy..."
                : "Zaprognozuj moją przyszłą emeryturę 🔮"}
            </Button>
          </div>
        </form>
      </div>
    </main>
  );
}
