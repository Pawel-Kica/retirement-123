"use client";

import { useState, useEffect, useCallback } from "react";
import { useRouter } from "next/navigation";
import { StepIndicator } from "@/components/ui/StepIndicator";
import { UnifiedTimeline } from "@/components/ui/UnifiedTimeline";
import { PostalCodeModal } from "@/components/ui/PostalCodeModal";
import { useSimulation } from "@/lib/context/SimulationContext";
import { SimulationInputs, ContractType, EmploymentPeriod } from "@/lib/types";
import { retirementAgeBySex } from "@/data/retirementAgeBySex";
import {
  validateSimulationInputs,
  getFieldError as getFieldErrorUtil,
} from "@/lib/utils/validation";
import {
  shouldShowPostalCodeModal,
  getPostalCode,
  setPostalCode as savePostalCode,
} from "@/lib/utils/postalCodeStorage";
import { loadAllData } from "@/lib/data/loader";
import {
  Step0BasicInfo,
  Step1WorkHistory,
  Step2AdditionalInfo,
  Step3Review,
  WorkHistoryEntry,
} from "@/components/simulation-steps";

const STEPS = [
  { number: 1, title: "O Tobie", subtitle: "Podstawowe informacje" },
  { number: 2, title: "Historia pracy", subtitle: "Zatrudnienie" },
  { number: 3, title: "Dodatkowe", subtitle: "Opcjonalne" },
  { number: 4, title: "Podsumowanie", subtitle: "Przegląd" },
];

export default function SimulacjaPage() {
  const router = useRouter();
  const { state, setInputsAndRecalculate, isCalculating } = useSimulation();
  const [data, setData] = useState<any>(null);
  const [isDataLoading, setIsDataLoading] = useState(true);

  const currentYear = new Date().getFullYear();
  const [currentStep, setCurrentStep] = useState<number>(0);
  const [completedSteps, setCompletedSteps] = useState<number[]>([]);

  const [workHistory, setWorkHistory] = useState<WorkHistoryEntry[]>([
    {
      id: `work-${Date.now()}`,
      startYear: undefined,
      endYear: undefined,
      monthlyGross: undefined,
      contractType: "UOP",
    },
  ]);

  const [formData, setFormData] = useState<Partial<SimulationInputs>>({
    age: 35,
    sex: "M",
    includeZwolnienieZdrowotne: false,
    retirementPrograms: {
      ppk: {
        enabled: false,
        employeeRate: 0.02,
        employerRate: 0.015,
      },
      ikze: {
        enabled: false,
        contributionRate: 0.1,
      },
    },
  });

  const [errors, setErrors] = useState<any[]>([]);
  const [showPostalCodeModal, setShowPostalCodeModal] = useState(false);
  const [postalCode, setPostalCode] = useState("");
  const [hasInitializedDefaults, setHasInitializedDefaults] = useState(false);

  useEffect(() => {
    async function fetchData() {
      try {
        const loadedData = await loadAllData();
        setData(loadedData);
      } catch (error) {
        console.error("Failed to load data:", error);
      } finally {
        setIsDataLoading(false);
      }
    }
    fetchData();
  }, []);

  // Initialize work history defaults on mount if age and sex are already set
  // Also update when age or sex changes in step 0 (before initialization is locked)
  useEffect(() => {
    if (formData.age && formData.sex) {
      const minRetirementAge = retirementAgeBySex[formData.sex];
      const yearTurned18 = currentYear - (formData.age - 18);
      const retirementYear = currentYear + (minRetirementAge - formData.age);

      // Only update if not yet initialized, or if we're still on step 0 (currentStep === 0)
      if (!hasInitializedDefaults || currentStep === 0) {
        setWorkHistory([
          {
            id: `work-${Date.now()}`,
            startYear: yearTurned18,
            endYear: retirementYear,
            monthlyGross: 7000,
            contractType: "UOP",
          },
        ]);
        if (!hasInitializedDefaults) {
          setHasInitializedDefaults(true);
        }
      }
    }
  }, [
    formData.age,
    formData.sex,
    hasInitializedDefaults,
    currentYear,
    currentStep,
  ]);

  const minWorkStartYear = formData.age
    ? currentYear - (formData.age - 18)
    : 1980;

  const getFieldError = useCallback(
    (errors: any[], field: string) => getFieldErrorUtil(errors, field),
    []
  );

  const handleChange = useCallback(
    (field: keyof SimulationInputs, value: any) => {
      setFormData((prev) => {
        const updated = { ...prev, [field]: value };
        // Work history initialization is now handled by useEffect
        return updated;
      });
    },
    []
  );

  const updateWorkHistoryEntry = useCallback(
    (id: string, field: keyof WorkHistoryEntry, value: any) => {
      setWorkHistory((prev) =>
        prev.map((entry) =>
          entry.id === id ? { ...entry, [field]: value } : entry
        )
      );
    },
    []
  );

  const addWorkHistoryEntry = useCallback(() => {
    const lastEntry = workHistory[workHistory.length - 1];
    const newStartYear = lastEntry?.endYear
      ? lastEntry.endYear + 1
      : currentYear;

    setWorkHistory((prev) => [
      ...prev,
      {
        id: `work-${Date.now()}`,
        startYear: newStartYear,
        endYear: undefined,
        monthlyGross: lastEntry?.monthlyGross || undefined,
        contractType: lastEntry?.contractType || "UOP",
      },
    ]);
  }, [workHistory, currentYear]);

  const removeWorkHistoryEntry = useCallback((id: string) => {
    setWorkHistory((prev) => prev.filter((entry) => entry.id !== id));
  }, []);

  const validateStep0 = useCallback(() => {
    const stepErrors: any[] = [];

    if (!formData.age) {
      stepErrors.push({ field: "age", message: "Wiek jest wymagany" });
    } else if (formData.age < 18 || formData.age > 100) {
      stepErrors.push({
        field: "age",
        message: "Wiek musi być w zakresie 18-100 lat",
      });
    }

    if (!formData.sex) {
      stepErrors.push({ field: "sex", message: "Płeć jest wymagana" });
    }

    setErrors(stepErrors);
    return stepErrors.length === 0;
  }, [formData]);

  const validateStep1 = useCallback(() => {
    const stepErrors: any[] = [];
    const minRetirementAge = formData.sex
      ? retirementAgeBySex[formData.sex]
      : 65;

    if (workHistory.length === 0) {
      stepErrors.push({
        field: "workHistory",
        message: "Wymagany jest co najmniej jeden okres pracy",
      });
      setErrors(stepErrors);
      return false;
    }

    workHistory.forEach((entry, index) => {
      if (!entry.startYear) {
        stepErrors.push({
          field: `work-${entry.id}-startYear`,
          message: `Okres ${index + 1}: Rok rozpoczęcia jest wymagany`,
        });
      }

      if (!entry.endYear) {
        stepErrors.push({
          field: `work-${entry.id}-endYear`,
          message: `Okres ${index + 1}: Rok zakończenia jest wymagany`,
        });
      }

      if (!entry.monthlyGross) {
        stepErrors.push({
          field: `work-${entry.id}-monthlyGross`,
          message: `Okres ${index + 1}: Wynagrodzenie jest wymagane`,
        });
      }

      // Don't add duplicate error - inline "Błąd w datach" message is already shown
      // if (
      //   entry.startYear &&
      //   entry.endYear &&
      //   entry.startYear >= entry.endYear
      // ) {
      //   stepErrors.push({
      //     field: `work-${entry.id}-endYear`,
      //     message: `Okres ${
      //       index + 1
      //     }: Rok zakończenia musi być późniejszy niż rok rozpoczęcia`,
      //   });
      // }

      // No validation needed for early retirement - just informational

      if (index > 0) {
        const prevEntry = workHistory[index - 1];
        if (
          prevEntry.endYear &&
          entry.startYear &&
          entry.startYear < prevEntry.endYear
        ) {
          stepErrors.push({
            field: `work-${entry.id}-startYear`,
            message: `Okres ${index + 1}: Nakładka z poprzednim okresem pracy`,
          });
        }
      }
    });

    setErrors(stepErrors);
    return stepErrors.length === 0;
  }, [workHistory, formData, currentYear]);

  const isStep0Complete = useCallback(() => {
    return formData.age !== undefined && formData.sex !== undefined;
  }, [formData]);

  const isStep1Complete = useCallback(() => {
    return (
      workHistory.length > 0 &&
      workHistory.every(
        (entry) =>
          entry.startYear !== undefined &&
          entry.endYear !== undefined &&
          entry.monthlyGross !== undefined &&
          entry.startYear < entry.endYear // Ensure dates are valid
      )
    );
  }, [workHistory]);

  const handleNext = useCallback(() => {
    let isValid = true;

    if (currentStep === 0) {
      isValid = validateStep0();
    } else if (currentStep === 1) {
      isValid = validateStep1();
    }

    if (isValid) {
      if (!completedSteps.includes(currentStep)) {
        setCompletedSteps((prev) => [...prev, currentStep]);
      }
      setCurrentStep((prev) => Math.min(prev + 1, STEPS.length - 1));
      setErrors([]);
    }
  }, [currentStep, validateStep0, validateStep1, completedSteps]);

  const handleBack = useCallback(() => {
    // Reset work history when going back from Step 1
    if (currentStep === 1) {
      setWorkHistory([
        {
          id: `work-${Date.now()}`,
          startYear: undefined,
          endYear: undefined,
          monthlyGross: undefined,
          contractType: "UOP",
        },
      ]);
      setHasInitializedDefaults(false);
    }
    setCurrentStep((prev) => Math.max(prev - 1, 0));
    setErrors([]);
  }, [currentStep]);

  const handleStepClick = useCallback(
    (stepIndex: number) => {
      if (completedSteps.includes(stepIndex - 1) || stepIndex === 0) {
        setCurrentStep(stepIndex);
        setErrors([]);
      }
    },
    [completedSteps]
  );

  const proceedWithCalculation = useCallback(async () => {
    const employmentPeriods: EmploymentPeriod[] = workHistory
      .filter((entry) => entry.startYear && entry.endYear && entry.monthlyGross)
      .map((entry) => ({
        id: entry.id,
        startYear: entry.startYear!,
        endYear: entry.endYear!,
        monthlyGross: entry.monthlyGross!,
        contractType: entry.contractType,
        annualRaisePercentage: entry.annualRaisePercentage,
      }));

    const workStartYear = workHistory[0]?.startYear;
    const workEndYear = workHistory[workHistory.length - 1]?.endYear;
    const currentSalary = workHistory[workHistory.length - 1]?.monthlyGross;
    const contractType = workHistory[workHistory.length - 1]?.contractType;

    const inputs: SimulationInputs = {
      age: formData.age!,
      sex: formData.sex!,
      monthlyGross: currentSalary!,
      workStartYear: workStartYear!,
      workEndYear: workEndYear!,
      contractType: contractType!,
      accountBalance: formData.accountBalance,
      subAccountBalance: formData.subAccountBalance,
      includeZwolnienieZdrowotne: formData.includeZwolnienieZdrowotne || false,
      retirementPrograms: formData.retirementPrograms,
      employmentPeriods: employmentPeriods,
    };

    const validationResult = validateSimulationInputs(inputs);
    if (!validationResult.isValid) {
      setErrors(validationResult.errors);
      return;
    }

    // Set inputs and calculate in one atomic operation
    await setInputsAndRecalculate(inputs, true);

    // Use hard refresh to ensure clean state
    router.push("/wynik");
  }, [formData, workHistory, setInputsAndRecalculate]);

  const handleSubmit = useCallback((e: React.FormEvent) => {
    e.preventDefault();
    // Show postal code modal before proceeding
    setShowPostalCodeModal(true);
  }, []);

  const handlePostalCodeSave = useCallback(
    (code: string) => {
      if (code) {
        savePostalCode(code);
        setPostalCode(code);
      }
      setShowPostalCodeModal(false);
      // Proceed with calculation after saving postal code
      proceedWithCalculation();
    },
    [proceedWithCalculation]
  );

  const handlePostalCodeSkip = useCallback(() => {
    setShowPostalCodeModal(false);
    // Proceed with calculation even if skipped
    proceedWithCalculation();
  }, [proceedWithCalculation]);

  const handleCancel = useCallback(() => {
    router.push("/");
  }, [router]);

  if (isDataLoading) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-zus-green-light via-white to-blue-50 flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-zus-green mx-auto mb-4"></div>
          <p className="text-zus-grey-700">Ładowanie danych...</p>
        </div>
      </div>
    );
  }

  const sickImpactConfig =
    formData.sex === "F" ? data?.sickImpactF : data?.sickImpactM;

  return (
    <>
      <PostalCodeModal
        isOpen={showPostalCodeModal}
        onClose={handlePostalCodeSkip}
        onSave={handlePostalCodeSave}
      />

      <main className="min-h-screen bg-gradient-to-br from-zus-green-light via-white to-blue-50 py-12">
        <div className="container mx-auto px-4 max-w-7xl">
          <div className="mb-8">
            <h1 className="text-3xl md:text-4xl font-bold text-zus-grey-900 mb-2">
              Symulacja emerytury
            </h1>
            <p className="text-zus-grey-600">
              Przewiduj swoją przyszłość emerytalną w kilku prostych krokach
            </p>
          </div>

          <div className="max-w-4xl mx-auto">
            <StepIndicator
              steps={STEPS}
              currentStep={currentStep}
              completedSteps={completedSteps}
              onStepClick={handleStepClick}
            />

            <form onSubmit={handleSubmit} className="mt-8">
              {currentStep === 0 && (
                <Step0BasicInfo
                  formData={formData}
                  errors={errors}
                  isComplete={isStep0Complete()}
                  onFieldChange={handleChange}
                  onNext={handleNext}
                  onCancel={handleCancel}
                  getFieldError={getFieldError}
                />
              )}

              {currentStep === 1 && (
                <Step1WorkHistory
                  formData={formData}
                  workHistory={workHistory}
                  errors={errors}
                  isComplete={isStep1Complete()}
                  currentYear={currentYear}
                  minWorkStartYear={minWorkStartYear}
                  onFieldChange={handleChange}
                  onWorkHistoryUpdate={updateWorkHistoryEntry}
                  onAddEntry={addWorkHistoryEntry}
                  onRemoveEntry={removeWorkHistoryEntry}
                  onNext={handleNext}
                  onBack={handleBack}
                  getFieldError={getFieldError}
                />
              )}

              {currentStep === 2 && (
                <Step2AdditionalInfo
                  formData={formData}
                  sickImpactConfig={sickImpactConfig}
                  onFieldChange={handleChange}
                  onNext={handleNext}
                  onBack={handleBack}
                />
              )}

              {currentStep === 3 && (
                <Step3Review
                  formData={formData}
                  workHistory={workHistory}
                  currentYear={currentYear}
                  onSubmit={() => setShowPostalCodeModal(true)}
                  onBack={handleBack}
                  isLoading={isCalculating}
                />
              )}
            </form>

            {/* Timeline sidebar - commented out for now */}
            {/* <div className="mt-8">
                <UnifiedTimeline
                  startYear={workHistory[0]?.startYear}
                  endYear={workHistory[workHistory.length - 1]?.endYear}
                  currentYear={currentYear}
                  age={formData.age}
                  variant="full"
                />
              </div> */}
          </div>
        </div>
      </main>
    </>
  );
}
