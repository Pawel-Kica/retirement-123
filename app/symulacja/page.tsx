"use client";

import { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import { Button } from "@/components/ui/Button";
import { Card } from "@/components/ui/Card";
import { Input } from "@/components/ui/Input";
import { FormField } from "@/components/ui/FormField";
import { InputWithSlider } from "@/components/ui/InputWithSlider";
import { FieldWithVisual } from "@/components/ui/FieldWithVisual";
import { AgeVisual } from "@/components/ui/AgeVisual";
import { SexVisual } from "@/components/ui/SexVisual";
import { SalaryVisual } from "@/components/ui/SalaryVisual";
import { UnifiedTimeline } from "@/components/ui/UnifiedTimeline";
import { StepIndicator } from "@/components/ui/StepIndicator";
import { useSimulation } from "@/lib/context/SimulationContext";
import { SimulationInputs } from "@/lib/types";
import {
  validateSimulationInputs,
  getFieldError,
} from "@/lib/utils/validation";
import { 
  LuLightbulb, 
  LuCalendar, 
  LuTriangleAlert, 
  LuBanknote, 
  LuHeartPulse, 
  LuClipboardList, 
  LuBriefcase, 
  LuCircleCheckBig 
} from "react-icons/lu";

// Helper to get error severity
const getFieldSeverity = (
  errors: any[],
  field: string
): "error" | "warning" => {
  const error = errors.find((e) => e.field === field);
  return error?.severity || "error";
};
import { loadAllData } from "@/lib/data/loader";

const STEPS = [
  { number: 1, title: "Dane podstawowe", subtitle: "Informacje osobiste" },
  { number: 2, title: "Historia pracy", subtitle: "Zatrudnienie" },
  { number: 3, title: "Dodatkowe", subtitle: "Opcjonalne" },
  { number: 4, title: "Podsumowanie", subtitle: "Przegląd" },
];

export default function SimulacjaPage() {
  const router = useRouter();
  const { state, setInputs, recalculate, isCalculating } = useSimulation();
  const [data, setData] = useState<any>(null);
  const [isDataLoading, setIsDataLoading] = useState(true);

  const currentYear = new Date().getFullYear();
  const [currentStep, setCurrentStep] = useState<number>(0);
  const [completedSteps, setCompletedSteps] = useState<number[]>([]);
  const [formData, setFormData] = useState<Partial<SimulationInputs>>({
    age: 35,
    sex: "M",
    monthlyGross: 7000,
    workStartYear: undefined,
    workEndYear: 2050,
    includeL4: false,
    earlyRetirement: false,
  });

  const [errors, setErrors] = useState<any[]>([]);
  const [showL4Info, setShowL4Info] = useState(false);

  useEffect(() => {
    const loadData = async () => {
      try {
        setIsDataLoading(true);
        const loadedData = await loadAllData();
        setData(loadedData);

        // Calculate default retirement year
        if (formData.age && formData.sex) {
          const retirementAge = loadedData.retirementAge[formData.sex];
          const defaultRetirementYear =
            currentYear + (retirementAge - formData.age);
          setFormData((prev) => ({ ...prev, workEndYear: defaultRetirementYear }));
        }
      } catch (error) {
        console.error('Failed to load data:', error);
      } finally {
        setIsDataLoading(false);
      }
    };

    loadData();
  }, []);

  const handleChange = (field: keyof SimulationInputs, value: any) => {
    setFormData((prev) => ({ ...prev, [field]: value }));

    // Clear existing errors for this field
    setErrors((prevErrors) =>
      prevErrors.filter((error) => error.field !== field)
    );

    // Real-time validation for age
    if (field === "age" && value !== undefined) {
      if (value < 18) {
        setErrors((prev) => [
          ...prev,
          { field: "age", message: "Musisz mieć co najmniej 18 lat" },
        ]);
      } else if (value > 100) {
        setErrors((prev) => [
          ...prev,
          {
            field: "age",
            message: "Wiek nie może przekraczać 100 lat",
          },
        ]);
      } else if (value > 70) {
        setErrors((prev) => [
          ...prev,
          {
            field: "age",
            message:
              "Wiek powyżej 70 lat - prawdopodobnie jesteś już na emeryturze",
          },
        ]);
      }

      // Re-validate and adjust work start year when age changes
      if (formData.workStartYear) {
        setErrors((prevErrors) =>
          prevErrors.filter((error) => error.field !== "workStartYear")
        );
        const birthYear = currentYear - value;
        const minWorkStartYear = birthYear + 18;

        // If current work start year is now invalid, adjust it
        if (formData.workStartYear < minWorkStartYear) {
          const adjustedWorkStart = Math.round(
            (minWorkStartYear + currentYear) / 2
          );
          setFormData((prev) => ({
            ...prev,
            workStartYear: adjustedWorkStart,
          }));
        } else if (formData.workStartYear > currentYear) {
          // If work start is in the future (shouldn't happen but safety check)
          setFormData((prev) => ({
            ...prev,
            workStartYear: currentYear,
          }));
        }
      }

      // Re-validate work end year when age changes
      if (formData.workEndYear && formData.sex && !formData.earlyRetirement) {
        setErrors((prevErrors) =>
          prevErrors.filter((error) => error.field !== "workEndYear")
        );
        const retirementAge = value + (formData.workEndYear - currentYear);
        const minRetirementAge = formData.sex === "F" ? 60 : 65;

        if (retirementAge < minRetirementAge) {
          setErrors((prev) => [
            ...prev,
            {
              field: "workEndYear",
              message: `Minimalny wiek emerytalny dla ${
                formData.sex === "F" ? "kobiet" : "mężczyzn"
              } to ${minRetirementAge} lat. Przy tym roku zakończenia będziesz mieć ${retirementAge} lat. Zaznacz opcję wcześniejszej emerytury, jeśli dotyczy Cię specjalny tryb (np. służby mundurowe).`,
              severity: "warning" as const,
            },
          ]);
        }
      }
    }

    // Real-time validation for monthly gross
    if (field === "monthlyGross" && value !== undefined) {
      if (value < 1000) {
        setErrors((prev) => [
          ...prev,
          {
            field: "monthlyGross",
            message: "Wynagrodzenie musi być co najmniej 1 000 zł",
          },
        ]);
      } else if (value > 100000) {
        setErrors((prev) => [
          ...prev,
          {
            field: "monthlyGross",
            message: "Wynagrodzenie nie może przekraczać 100 000 zł",
          },
        ]);
      }
    }

    // Real-time validation for work start year
    if (field === "workStartYear" && value !== undefined) {
      if (value > currentYear) {
        setErrors((prev) => [
          ...prev,
          {
            field: "workStartYear",
            message: "Rok rozpoczęcia nie może być w przyszłości",
          },
        ]);
      } else if (formData.age) {
        const birthYear = currentYear - formData.age;
        const minWorkStartYear = birthYear + 18;
        if (value < minWorkStartYear) {
          setErrors((prev) => [
            ...prev,
            {
              field: "workStartYear",
              message: `Rok rozpoczęcia pracy nie pasuje do podanego wieku. Najwcześniejszy możliwy rok: ${minWorkStartYear} (wiek 18 lat)`,
            },
          ]);
        }
      }
    }

    // Real-time validation for work end year (retirement year)
    if (field === "workEndYear" && value !== undefined) {
      if (formData.age && formData.sex && !formData.earlyRetirement) {
        const retirementAge = formData.age + (value - currentYear);
        const minRetirementAge = formData.sex === "F" ? 60 : 65;

        if (retirementAge < minRetirementAge) {
          setErrors((prev) => [
            ...prev,
            {
              field: "workEndYear",
              message: `Minimalny wiek emerytalny dla ${
                formData.sex === "F" ? "kobiet" : "mężczyzn"
              } to ${minRetirementAge} lat. Przy tym roku zakończenia będziesz mieć ${retirementAge} lat. Zaznacz opcję wcześniejszej emerytury, jeśli dotyczy Cię specjalny tryb (np. służby mundurowe).`,
              severity: "warning" as const,
            },
          ]);
        }
      }
    }

    // Re-validate work end year when earlyRetirement checkbox changes
    if (field === "earlyRetirement" && formData.workEndYear) {
      setErrors((prevErrors) =>
        prevErrors.filter((error) => error.field !== "workEndYear")
      );

      // If unchecking early retirement, re-validate minimum age
      if (!value && formData.age && formData.sex) {
        const retirementAge =
          formData.age + (formData.workEndYear - currentYear);
        const minRetirementAge = formData.sex === "F" ? 60 : 65;

        if (retirementAge < minRetirementAge) {
          setErrors((prev) => [
            ...prev,
            {
              field: "workEndYear",
              message: `Minimalny wiek emerytalny dla ${
                formData.sex === "F" ? "kobiet" : "mężczyzn"
              } to ${minRetirementAge} lat. Przy tym roku zakończenia będziesz mieć ${retirementAge} lat. Zaznacz opcję wcześniejszej emerytury, jeśli dotyczy Cię specjalny tryb (np. służby mundurowe).`,
              severity: "warning" as const,
            },
          ]);
        }
      }
    }

    // Recalculate default retirement year when age or sex changes
    if ((field === "age" || field === "sex") && data) {
      const age = field === "age" ? value : formData.age;
      const sex = field === "sex" ? value : formData.sex;
      if (age && sex && data?.retirementAge) {
        const retirementAge = data.retirementAge[sex];
        const defaultRetirementYear = currentYear + (retirementAge - age);
        setFormData((prev) => ({
          ...prev,
          workEndYear: defaultRetirementYear,
        }));

        // Re-validate work end year when sex changes
        if (field === "sex" && formData.workEndYear) {
          setErrors((prevErrors) =>
            prevErrors.filter((error) => error.field !== "workEndYear")
          );

          if (!formData.earlyRetirement && age) {
            const retirementAgeAtEnd =
              age + (formData.workEndYear - currentYear);
            const minRetirementAge = sex === "F" ? 60 : 65;

            if (retirementAgeAtEnd < minRetirementAge) {
              setErrors((prev) => [
                ...prev,
                {
                  field: "workEndYear",
                  message: `Minimalny wiek emerytalny dla ${
                    sex === "F" ? "kobiet" : "mężczyzn"
                  } to ${minRetirementAge} lat. Przy tym roku zakończenia będziesz mieć ${retirementAgeAtEnd} lat. Zaznacz opcję wcześniejszej emerytury, jeśli dotyczy Cię specjalny tryb (np. służby mundurowe).`,
                  severity: "warning" as const,
                },
              ]);
            }
          }
        }
      }
    }
  };

  // Validation functions for each step
  const validateStep0 = (): boolean => {
    const sectionErrors = [];

    if (!formData.age) {
      sectionErrors.push({ field: "age", message: "Wiek jest wymagany" });
    } else if (formData.age < 18) {
      sectionErrors.push({
        field: "age",
        message: "Musisz mieć co najmniej 18 lat",
      });
    } else if (formData.age > 100) {
      sectionErrors.push({
        field: "age",
        message: "Wiek nie może przekraczać 100 lat",
      });
    } else if (formData.age > 70) {
      sectionErrors.push({
        field: "age",
        message:
          "Wiek powyżej 70 lat - prawdopodobnie jesteś już na emeryturze",
      });
    }

    if (!formData.sex) {
      sectionErrors.push({ field: "sex", message: "Płeć jest wymagana" });
    }

    if (!formData.monthlyGross) {
      sectionErrors.push({
        field: "monthlyGross",
        message: "Wynagrodzenie jest wymagane",
      });
    } else if (formData.monthlyGross < 1000) {
      sectionErrors.push({
        field: "monthlyGross",
        message: "Wynagrodzenie musi być co najmniej 1 000 zł",
      });
    } else if (formData.monthlyGross > 100000) {
      sectionErrors.push({
        field: "monthlyGross",
        message: "Wynagrodzenie nie może przekraczać 100 000 zł",
      });
    }

    setErrors(sectionErrors);
    return sectionErrors.length === 0;
  };

  const validateStep1 = (): boolean => {
    const sectionErrors = [];

    if (!formData.workStartYear) {
      sectionErrors.push({
        field: "workStartYear",
        message: "Rok rozpoczęcia pracy jest wymagany",
      });
    } else if (formData.workStartYear > currentYear) {
      sectionErrors.push({
        field: "workStartYear",
        message: "Rok rozpoczęcia nie może być w przyszłości",
      });
    } else if (formData.age) {
      const birthYear = currentYear - formData.age;
      const minWorkStartYear = birthYear + 18;
      if (formData.workStartYear < minWorkStartYear) {
        sectionErrors.push({
          field: "workStartYear",
          message: `Rok rozpoczęcia pracy nie pasuje do podanego wieku. Najwcześniejszy możliwy rok: ${minWorkStartYear} (wiek 18 lat)`,
        });
      }
    }

    if (!formData.workEndYear) {
      sectionErrors.push({
        field: "workEndYear",
        message: "Rok zakończenia pracy jest wymagany",
      });
    } else if (
      formData.workStartYear &&
      formData.workEndYear <= formData.workStartYear
    ) {
      sectionErrors.push({
        field: "workEndYear",
        message: "Rok zakończenia musi być po roku rozpoczęcia",
      });
    } else if (formData.workEndYear > 2080) {
      sectionErrors.push({
        field: "workEndYear",
        message: "Rok zakończenia nie może przekraczać 2080",
      });
    }

    // Minimum retirement age validation (unless early retirement)
    if (
      formData.age &&
      formData.sex &&
      formData.workEndYear &&
      !formData.earlyRetirement
    ) {
      const retirementAge = formData.age + (formData.workEndYear - currentYear);
      const minRetirementAge = formData.sex === "F" ? 60 : 65;

      if (retirementAge < minRetirementAge) {
        sectionErrors.push({
          field: "workEndYear",
          message: `Minimalny wiek emerytalny dla ${
            formData.sex === "F" ? "kobiet" : "mężczyzn"
          } to ${minRetirementAge} lat. Przy tym roku zakończenia będziesz mieć ${retirementAge} lat. Zaznacz opcję wcześniejszej emerytury, jeśli dotyczy Cię specjalny tryb (np. służby mundurowe).`,
          severity: "warning" as const,
        });
      }
    }

    setErrors(sectionErrors);
    return sectionErrors.length === 0;
  };

  const isStep0Complete = (): boolean => {
    return !!(
      formData.age &&
      formData.age >= 18 &&
      formData.age <= 100 &&
      formData.sex &&
      formData.monthlyGross &&
      formData.monthlyGross >= 1000
    );
  };

  const isStep1Complete = (): boolean => {
    if (!formData.workStartYear || !formData.workEndYear) {
      return false;
    }

    if (formData.workEndYear <= formData.workStartYear) {
      return false;
    }

    // Check retirement age requirement (unless early retirement)
    if (formData.age && formData.sex && !formData.earlyRetirement) {
      const retirementAge = formData.age + (formData.workEndYear - currentYear);
      const minRetirementAge = formData.sex === "F" ? 60 : 65;

      if (retirementAge < minRetirementAge) {
        return false; // Incomplete if below retirement age without early retirement flag
      }
    }

    return true;
  };

  const handleNext = () => {
    if (currentStep === 0) {
      if (validateStep0()) {
        if (!completedSteps.includes(0)) {
          setCompletedSteps([...completedSteps, 0]);
        }

        // Auto-adjust work start year when moving to step 1
        if (formData.age && !formData.workStartYear) {
          const birthYear = currentYear - formData.age;
          const minWorkStart = birthYear + 18;
          // Set to middle point between min and current year
          const defaultWorkStart = Math.round((minWorkStart + currentYear) / 2);
          setFormData((prev) => ({
            ...prev,
            workStartYear: defaultWorkStart,
          }));
        }

        setCurrentStep(1);
      }
    } else if (currentStep === 1) {
      if (validateStep1()) {
        if (!completedSteps.includes(1)) {
          setCompletedSteps([...completedSteps, 1]);
        }
        setCurrentStep(2);
      }
    } else if (currentStep === 2) {
      // Step 2 is optional, no validation needed
      if (!completedSteps.includes(2)) {
        setCompletedSteps([...completedSteps, 2]);
      }
      setCurrentStep(3);
    }
  };

  const handleBack = () => {
    if (currentStep > 0) {
      setCurrentStep(currentStep - 1);
      setErrors([]);
    }
  };

  const handleStepClick = (stepIndex: number) => {
    // Can only navigate to completed steps or current step
    if (
      stepIndex === currentStep ||
      completedSteps.includes(stepIndex) ||
      stepIndex < currentStep
    ) {
      setCurrentStep(stepIndex);
      setErrors([]);
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    // Final validation
    const validation = validateSimulationInputs(formData);
    if (!validation.isValid) {
      setErrors(validation.errors);
      // Navigate to first step with errors
      if (
        validation.errors.some((e) =>
          ["age", "sex", "monthlyGross"].includes(e.field)
        )
      ) {
        setCurrentStep(0);
      } else if (
        validation.errors.some((e) =>
          ["workStartYear", "workEndYear"].includes(e.field)
        )
      ) {
        setCurrentStep(1);
      }
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

  if (isDataLoading || !data)
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-zus-green mx-auto mb-4"></div>
          <p className="text-zus-grey-600">Ładowanie danych...</p>
        </div>
      </div>
    );

  const l4Config = formData.sex === "M" ? data?.sickImpactM : data?.sickImpactF;

  const yearsWorked =
    formData.workStartYear && formData.workEndYear
      ? formData.workEndYear - formData.workStartYear
      : 0;

  const retirementAge =
    formData.age && formData.workEndYear
      ? formData.age + (formData.workEndYear - currentYear)
      : 0;

  const birthYear = formData.age
    ? currentYear - formData.age
    : currentYear - 35;
  const minWorkStartYear = birthYear + 18;
  const minRetirementYear =
    formData.sex && formData.age
      ? birthYear + (formData.sex === "F" ? 60 : 65)
      : currentYear + 25;

  return (
    <main className="min-h-screen bg-gradient-to-b from-gray-50 to-gray-100 pt-8 pb-16">
      <div className="container mx-auto px-4 sm:px-6 lg:px-8 max-w-6xl pb-8">
        <div className="mb-8">
          <button
            onClick={() => router.push("/")}
            className="text-zus-green hover:underline mb-4 font-medium cursor-pointer"
          >
            ← Powrót do strony głównej
          </button>
          <h1 className="text-4xl font-bold text-zus-grey-900">
            Symulacja Emerytury
          </h1>
          <p className="text-zus-grey-700 mt-2">
            Wypełnij formularz, aby poznać prognozę swojej przyszłej emerytury
          </p>
        </div>

        {/* Step Indicator */}
        <StepIndicator
          steps={STEPS}
          currentStep={currentStep}
          completedSteps={completedSteps}
          onStepClick={handleStepClick}
        />

        {/* Form Container with Animation */}
        <form onSubmit={handleSubmit}>
          <div className="relative min-h-[600px]">
            {/* Step 0: Basic Info */}
            <div
              className={`transition-all duration-500 ease-in-out ${
                currentStep === 0
                  ? "opacity-100 translate-x-0"
                  : currentStep > 0
                  ? "opacity-0 -translate-x-full absolute inset-0 pointer-events-none"
                  : "opacity-0 translate-x-full absolute inset-0 pointer-events-none"
              }`}
            >
              <Card className="p-8">
                <div className="mb-6">
                  <h2 className="text-2xl font-bold text-zus-grey-900 mb-2">
                    Dane podstawowe
                  </h2>
                  <p className="text-zus-grey-600">
                    Podaj swoje podstawowe informacje
                  </p>
                </div>

                <div className="space-y-6">
                  <FieldWithVisual visual={<AgeVisual age={formData.age} />}>
                    <InputWithSlider
                      label="Twój obecny wiek"
                      value={formData.age}
                      onChange={(value) => handleChange("age", value)}
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
                          <span>W tym wieku prawdopodobnie jesteś już na
                          emeryturze. Symulator służy do planowania przyszłej
                          emerytury.</span>
                        </div>
                      )}
                  </FieldWithVisual>

                  <FieldWithVisual visual={<SexVisual sex={formData.sex} />}>
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
                            value="M"
                            checked={formData.sex === "M"}
                            onChange={(e) =>
                              handleChange("sex", e.target.value as "M" | "F")
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
                              handleChange("sex", e.target.value as "M" | "F")
                            }
                            className="w-5 h-5 accent-zus-green"
                          />
                          <span className="text-lg">Kobieta</span>
                        </label>
                      </div>
                    </FormField>
                  </FieldWithVisual>

                  <FieldWithVisual
                    visual={<SalaryVisual salary={formData.monthlyGross} />}
                  >
                    <InputWithSlider
                      label="Twoje obecne wynagrodzenie brutto miesięczne"
                      value={formData.monthlyGross}
                      onChange={(value) => handleChange("monthlyGross", value)}
                      min={1000}
                      max={50000}
                      step={100}
                      suffix="zł"
                      placeholder="np. 5000"
                      required
                      error={getFieldError(errors, "monthlyGross")}
                      hint={
                        !getFieldError(errors, "monthlyGross")
                          ? "Podaj kwotę brutto (przed potrąceniem podatków i składek)"
                          : undefined
                      }
                    />
                  </FieldWithVisual>
                </div>

                <div className="mt-8 pt-6 border-t border-zus-grey-300">
                  {!isStep0Complete() && errors.length > 0 && (
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
                      onClick={() => router.push("/")}
                      className="flex-1"
                    >
                      Anuluj
                    </Button>
                    <Button
                      type="button"
                      onClick={handleNext}
                      variant="success"
                      size="lg"
                      className="flex-1"
                      disabled={!isStep0Complete()}
                    >
                      Dalej: Historia pracy →
                    </Button>
                  </div>
                </div>
              </Card>
            </div>

            {/* Step 1: Work History */}
            <div
              className={`transition-all duration-500 ease-in-out ${
                currentStep === 1
                  ? "opacity-100 translate-x-0"
                  : currentStep > 1
                  ? "opacity-0 -translate-x-full absolute inset-0 pointer-events-none"
                  : "opacity-0 translate-x-full absolute inset-0 pointer-events-none"
              }`}
            >
              <Card className="p-8">
                <div className="mb-6">
                  <h2 className="text-2xl font-bold text-zus-grey-900 mb-2">
                    Historia pracy
                  </h2>
                  <p className="text-zus-grey-600">
                    Kiedy rozpocząłeś pracę i kiedy planujesz przejść na
                    emeryturę?
                  </p>
                </div>

                <div className="space-y-6">
                  <FieldWithVisual
                    visual={
                      <UnifiedTimeline
                        startYear={formData.workStartYear}
                        endYear={formData.workEndYear}
                        currentYear={currentYear}
                        age={formData.age}
                        variant="work-start"
                      />
                    }
                  >
                    <InputWithSlider
                      label="W którym roku rozpocząłeś/rozpoczęłaś pracę?"
                      value={formData.workStartYear}
                      onChange={(value) => handleChange("workStartYear", value)}
                      min={minWorkStartYear}
                      max={currentYear}
                      step={1}
                      placeholder="np. 2010"
                      required
                      error={getFieldError(errors, "workStartYear")}
                      hint={
                        !getFieldError(errors, "workStartYear")
                          ? (
                            <span className="flex items-center gap-1.5">
                              <LuCalendar className="w-4 h-4 text-zus-blue flex-shrink-0" />
                              <span>Rok urodzenia: {birthYear} | Najwcześniejszy rok pracy: {minWorkStartYear} (wiek 18 lat)</span>
                            </span>
                          )
                          : undefined
                      }
                    />
                  </FieldWithVisual>

                  <FieldWithVisual
                    visual={
                      <UnifiedTimeline
                        startYear={formData.workStartYear}
                        endYear={formData.workEndYear}
                        currentYear={currentYear}
                        age={formData.age}
                        variant="work-end"
                      />
                    }
                  >
                    <InputWithSlider
                      label="Planowany rok przejścia na emeryturę"
                      value={formData.workEndYear}
                      onChange={(value) => handleChange("workEndYear", value)}
                      min={currentYear}
                      max={2080}
                      step={1}
                      placeholder="np. 2050"
                      required
                      error={getFieldError(errors, "workEndYear")}
                      errorSeverity={getFieldSeverity(errors, "workEndYear")}
                      reserveErrorSpace="64px"
                      hint={
                        !getFieldError(errors, "workEndYear") &&
                        formData.workEndYear
                          ? (
                            <span className="flex items-center gap-1.5">
                              <LuLightbulb className="w-4 h-4 text-zus-orange flex-shrink-0" />
                              <span>Wiek emerytalny: {retirementAge} lat | Staż pracy: {yearsWorked} lat | Minimalny wiek {
                                formData.sex === "F" ? "kobiet" : "mężczyzn"
                              }: {formData.sex === "F" ? 60 : 65} lat</span>
                            </span>
                          )
                          : undefined
                      }
                    />
                  </FieldWithVisual>

                  {/* Early Retirement Checkbox */}
                  <div className="mt-6 p-4 bg-yellow-50 border-l-4 border-yellow-500 rounded">
                    <label className="flex items-start gap-3 cursor-pointer">
                      <input
                        type="checkbox"
                        checked={formData.earlyRetirement || false}
                        onChange={(e) =>
                          handleChange("earlyRetirement", e.target.checked)
                        }
                        className="mt-1 w-5 h-5 text-zus-green border-zus-grey-300 rounded focus:ring-zus-green focus:ring-2"
                      />
                      <div className="flex-1">
                        <div className="font-semibold text-zus-grey-900 flex items-center gap-2">
                          <LuTriangleAlert className="w-5 h-5 text-yellow-600 flex-shrink-0" />
                          <span>Wcześniejsza emerytura (służby mundurowe, specjalne
                          zawody)</span>
                        </div>
                        <div className="text-sm text-zus-grey-700 mt-1">
                          Zaznacz, jeśli masz prawo do wcześniejszej emerytury
                          przed osiągnięciem standardowego wieku emerytalnego
                          (60 lat dla kobiet, 65 lat dla mężczyzn). Dotyczy to
                          m.in.: policjantów, strażaków, żołnierzy, górników
                          oraz innych zawodów w szczególnych warunkach.
                        </div>
                      </div>
                    </label>
                  </div>
                </div>

                <div className="mt-8 pt-6 border-t border-zus-grey-300">
                  {!isStep1Complete() &&
                    errors.filter((e) => e.field !== "workEndYear").length >
                      0 && (
                      <div className="mb-4 p-4 bg-red-50 border-l-4 border-zus-error rounded">
                        <p className="text-sm font-semibold text-zus-error mb-2 flex items-center gap-2">
                          <LuTriangleAlert className="w-5 h-5 flex-shrink-0" />
                          <span>Uzupełnij wszystkie wymagane pola:</span>
                        </p>
                        <ul className="text-sm text-gray-700 list-disc pl-5 space-y-1">
                          {errors
                            .filter((e) => e.field !== "workEndYear")
                            .map((error, idx) => (
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
                      onClick={handleBack}
                      className="flex-1"
                    >
                      ← Wstecz
                    </Button>
                    <Button
                      type="button"
                      onClick={handleNext}
                      variant="success"
                      size="lg"
                      className="flex-1"
                      disabled={!isStep1Complete()}
                    >
                      Dalej: Dodatkowe informacje →
                    </Button>
                  </div>
                </div>
              </Card>
            </div>

            {/* Step 2: Additional Info */}
            <div
              className={`transition-all duration-500 ease-in-out ${
                currentStep === 2
                  ? "opacity-100 translate-x-0"
                  : currentStep > 2
                  ? "opacity-0 -translate-x-full absolute inset-0 pointer-events-none"
                  : "opacity-0 translate-x-full absolute inset-0 pointer-events-none"
              }`}
            >
              <Card className="p-8">
                <div className="mb-6">
                  <h2 className="text-2xl font-bold text-zus-grey-900 mb-2">
                    Dodatkowe informacje
                  </h2>
                  <p className="text-zus-grey-600">
                    Te informacje są opcjonalne, ale mogą zwiększyć dokładność
                    prognozy
                  </p>
                </div>

                <div className="space-y-6">
                  <div className="p-4 bg-blue-50 border-l-4 border-zus-navy rounded">
                    <p className="text-sm text-zus-grey-700 flex items-start gap-2">
                      <LuBanknote className="w-5 h-5 text-zus-green flex-shrink-0 mt-0.5" />
                      <span>
                        <strong>Zgromadzony kapitał</strong>
                        <br />
                        Jeśli znasz stan swojego konta w ZUS, możesz go tutaj
                        wpisać dla dokładniejszej prognozy.
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
                        value={formData.accountBalance !== undefined ? formData.accountBalance : ""}
                        onChange={(e) =>
                          handleChange(
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
                        value={formData.subAccountBalance !== undefined ? formData.subAccountBalance : ""}
                        onChange={(e) =>
                          handleChange(
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
                    <div className="p-5 bg-blue-50 border-l-4 border-zus-navy rounded-lg shadow-sm">
                      <div className="flex items-start gap-3 mb-4">
                        <LuHeartPulse className="w-6 h-6 text-zus-error flex-shrink-0 mt-0.5" />
                        <div className="flex-1">
                          <h4 className="text-lg font-bold text-zus-grey-900 mb-1">
                            Zwolnienia lekarskie (L4)
                          </h4>
                          <p className="text-sm text-zus-grey-700">
                            Uwzględnij statystyczne prawdopodobieństwo zwolnień lekarskich
                          </p>
                        </div>
                      </div>

                      <label className="flex items-center gap-3 p-3 bg-white rounded-lg cursor-pointer hover:bg-zus-green-light transition-colors border-2 border-transparent hover:border-zus-green mb-4">
                        <input
                          type="checkbox"
                          checked={formData.includeL4 || false}
                          onChange={(e) =>
                            handleChange("includeL4", e.target.checked)
                          }
                          className="w-5 h-5 accent-zus-green flex-shrink-0"
                        />
                        <span className="font-semibold text-zus-grey-900">
                          Uwzględnij prawdopodobieństwo zwolnień lekarskich
                        </span>
                      </label>

                      <div className="bg-white/70 rounded-lg p-4 space-y-3">
                        <h5 className="font-bold text-zus-grey-900">
                          Średnia długość L4 w Polsce:
                        </h5>
                        <ul className="space-y-2 text-sm">
                          <li className="flex items-start gap-2">
                            <span className="text-zus-green font-bold">•</span>
                            <span className="text-zus-grey-700">
                              <strong>Kobiety:</strong> średnio {data?.sickImpactF?.avgDaysPerYear || 0} dni rocznie
                            </span>
                          </li>
                          <li className="flex items-start gap-2">
                            <span className="text-zus-green font-bold">•</span>
                            <span className="text-zus-grey-700">
                              <strong>Mężczyźni:</strong> średnio {data?.sickImpactM?.avgDaysPerYear || 0} dni rocznie
                            </span>
                          </li>
                        </ul>
                        <p className="text-sm text-zus-grey-700 pt-2 border-t border-zus-grey-300">
                          Podczas zwolnienia lekarskiego składki emerytalne są odprowadzane od zasiłku (zazwyczaj niższego niż pełne wynagrodzenie), co zmniejsza kapitał emerytalny. Średnio obniża to świadczenie o{" "}
                          <strong className="text-zus-error">
                            {((1 - l4Config.reductionCoefficient) * 100).toFixed(1)}%
                          </strong>.
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
                      onClick={handleBack}
                      className="flex-1"
                    >
                      ← Wstecz
                    </Button>
                    <Button
                      type="button"
                      onClick={handleNext}
                      variant="success"
                      size="lg"
                      className="flex-1"
                    >
                      Dalej: Podsumowanie →
                    </Button>
                  </div>
                </div>
              </Card>
            </div>

            {/* Step 3: Review */}
            <div
              className={`transition-all duration-500 ease-in-out ${
                currentStep === 3
                  ? "opacity-100 translate-x-0"
                  : "opacity-0 translate-x-full absolute inset-0 pointer-events-none"
              }`}
            >
              <Card className="p-8">
                <div className="mb-6">
                  <h2 className="text-2xl font-bold text-zus-grey-900 mb-2">
                    Podsumowanie danych
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
                    <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
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
                        <div className="text-sm text-zus-grey-600">
                          Wynagrodzenie brutto
                        </div>
                        <div className="text-lg font-bold text-zus-green">
                          {formData.monthlyGross?.toLocaleString("pl-PL")} zł/mc
                        </div>
                      </div>
                    </div>
                  </Card>

                  {/* Work History Summary */}
                  <Card className="bg-blue-50 border-zus-navy p-4">
                    <h3 className="text-base font-bold text-zus-grey-900 mb-3 flex items-center gap-2">
                      <LuCalendar className="w-5 h-5 text-zus-blue flex-shrink-0" />
                      <span>Historia pracy</span>
                    </h3>
                    <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-3">
                      <div className="flex justify-between sm:flex-col">
                        <div className="text-sm text-zus-grey-600">
                          Rok rozpoczęcia pracy
                        </div>
                        <div className="text-lg font-bold text-zus-grey-900">
                          {formData.workStartYear}
                        </div>
                      </div>
                      <div className="flex justify-between sm:flex-col">
                        <div className="text-sm text-zus-grey-600">
                          Planowana emerytura
                        </div>
                        <div className="text-lg font-bold text-zus-grey-900">
                          {formData.workEndYear}
                        </div>
                      </div>
                      <div className="flex justify-between sm:flex-col">
                        <div className="text-sm text-zus-grey-600">
                          Łączny staż pracy
                        </div>
                        <div className="text-lg font-bold text-zus-green">
                          {yearsWorked} lat
                        </div>
                      </div>
                      <div className="flex justify-between sm:flex-col">
                        <div className="text-sm text-zus-grey-600">
                          Wiek emerytalny
                        </div>
                        <div className="text-lg font-bold text-zus-green">
                          {retirementAge} lat
                        </div>
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
                        <span className="text-zus-grey-600">
                          Konto podstawowe:
                        </span>
                        <span className="font-semibold text-zus-grey-900">
                          {formData.accountBalance
                            ? `${formData.accountBalance.toLocaleString(
                                "pl-PL"
                              )} zł`
                            : "Nie podano (automatyczne oszacowanie)"}
                        </span>
                      </div>
                      <div className="flex justify-between items-center py-1">
                        <span className="text-zus-grey-600">
                          Subkonto (OFE):
                        </span>
                        <span className="font-semibold text-zus-grey-900">
                          {formData.subAccountBalance
                            ? `${formData.subAccountBalance.toLocaleString(
                                "pl-PL"
                              )} zł`
                            : "Nie podano (automatyczne oszacowanie)"}
                        </span>
                      </div>
                      <div className="flex justify-between items-center py-1">
                        <span className="text-zus-grey-600">
                          Zwolnienia lekarskie (L4):
                        </span>
                        <span
                          className={`font-semibold ${
                            formData.includeL4
                              ? "text-zus-green"
                              : "text-zus-grey-500"
                          }`}
                        >
                          {formData.includeL4
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
                      Kliknij poniżej, aby wygenerować szczegółową prognozę
                      Twojej przyszłej emerytury
                    </p>
                  </div>
                </div>

                <div className="mt-8 pt-6 border-t border-zus-grey-300">
                  <div className="flex gap-4">
                    <Button
                      type="button"
                      variant="ghost"
                      size="lg"
                      onClick={handleBack}
                      className="flex-1"
                    >
                      ← Wstecz
                    </Button>
                    <Button
                      type="submit"
                      variant="success"
                      size="lg"
                      loading={isCalculating}
                      disabled={isCalculating}
                      className="flex-1"
                    >
                      {isCalculating
                        ? "Obliczanie prognozy..."
                        : "Zaprognozuj moją emeryturę"}
                    </Button>
                  </div>
                </div>
              </Card>
            </div>
          </div>
        </form>
      </div>
    </main>
  );
}
