"use client";

import { useEffect, useState, useRef } from "react";
import { useRouter } from "next/navigation";
import { Button } from "@/components/ui/Button";
import { NewSimulationButton } from "@/components/ui/NewSimulationButton";
import { Card } from "@/components/ui/Card";
import { PensionDisplay } from "@/components/ui/PensionDisplay";
import { Tooltip as InfoTooltip } from "@/components/ui/Tooltip";
import { HistoryButton } from "@/components/ui/HistoryButton";
import { CareerTimeline } from "@/components/ui/CareerTimeline";
import { TimelineSidePanel } from "@/components/ui/TimelineSidePanel";
import { useSimulation } from "@/lib/context/SimulationContext";
import { formatPLN, formatPercent, formatYears } from "@/lib/utils/formatting";
import { updateSimulationPostalCode } from "@/lib/utils/simulationHistory";
import type { EmploymentPeriod, EmploymentGapPeriod, LifeEvent } from "@/lib/types";
import {
  Chart as ChartJS,
  CategoryScale,
  LinearScale,
  BarElement,
  LineElement,
  PointElement,
  Title,
  Tooltip,
  Legend,
  Filler,
} from "chart.js";
import { Bar, Line } from "react-chartjs-2";
import {
  MapPin,
  FileText,
  CheckCircle,
  AlertTriangle,
  Lightbulb,
  BarChart3,
  TrendingUp,
  Table,
  X,
} from "lucide-react";

// Register Chart.js components
ChartJS.register(
  CategoryScale,
  LinearScale,
  BarElement,
  LineElement,
  PointElement,
  Title,
  Tooltip,
  Legend,
  Filler
);

const InfoIcon = () => (
  <svg
    className="w-4 h-4 text-zus-grey-500 hover:text-zus-green transition-colors"
    fill="none"
    stroke="currentColor"
    viewBox="0 0 24 24"
  >
    <circle cx="12" cy="12" r="10" strokeWidth="2" />
    <path
      strokeLinecap="round"
      strokeLinejoin="round"
      strokeWidth="2"
      d="M12 16v-4M12 8h.01"
    />
  </svg>
);

export default function WynikPage() {
  const router = useRouter();
  const {
    state,
    loadFromHistory,
    getHistory,
    setInputs,
    recalculate,
    updateDashboardModifications,
  } = useSimulation();
  const [deferralViewMode, setDeferralViewMode] = useState<
    "bar" | "line" | "table"
  >("bar");
  const [selectedDeferralYears, setSelectedDeferralYears] = useState(0);
  const [isLoading, setIsLoading] = useState(true);
  const [showPostalModal, setShowPostalModal] = useState(false);
  const [postalCode, setPostalCode] = useState("");
  const [postalError, setPostalError] = useState("");
  const postalInputRef = useRef<HTMLInputElement>(null);
  const [showReportPreview, setShowReportPreview] = useState(false);
  const [showSimulationData, setShowSimulationData] = useState(false);
  const [contractPeriods, setContractPeriods] = useState<EmploymentPeriod[]>([]);
  const [gapPeriods, setGapPeriods] = useState<EmploymentGapPeriod[]>([]);
  const [lifeEvents, setLifeEvents] = useState<LifeEvent[]>([]);

  useEffect(() => {
    if (!state.results) {
      const history = getHistory();
      if (history.length > 0) {
        loadFromHistory(history[0].id);
        setIsLoading(false);
      } else {
        router.push("/symulacja");
      }
    } else {
      setIsLoading(false);
    }
  }, [state.results, router, loadFromHistory, getHistory]);

  useEffect(() => {
    if (!isLoading && state.results && state.inputs) {
      const currentSimulationId = sessionStorage.getItem(
        "current-simulation-id"
      );
      const lastAskedSimulationId = sessionStorage.getItem(
        "postal-asked-for-simulation"
      );

      if (
        currentSimulationId &&
        currentSimulationId !== lastAskedSimulationId
      ) {
        setShowPostalModal(true);
        sessionStorage.setItem(
          "postal-asked-for-simulation",
          currentSimulationId
        );

        if (state.inputs.postalCode) {
          setPostalCode(state.inputs.postalCode);
        }
      }
    }
  }, [isLoading, state.results, state.inputs]);

  useEffect(() => {
    if (showPostalModal && postalInputRef.current) {
      postalInputRef.current.focus();
    }
  }, [showPostalModal]);

  const handlePostalSubmit = async () => {
    if (postalCode && !validatePostalCode(postalCode)) {
      setPostalError("Nieprawidłowy kod pocztowy. Format: XX-XXX");
      return;
    }

    if (state.inputs && postalCode) {
      setInputs({
        ...state.inputs,
        postalCode,
      });

      const history = getHistory();
      if (history.length > 0) {
        updateSimulationPostalCode(history[0].id, postalCode);
      }
    }

    await saveToDatabase(postalCode);
    setShowPostalModal(false);
  };

  const handleSkipPostal = async () => {
    await saveToDatabase(null);
    setShowPostalModal(false);
  };

  const saveToDatabase = async (postal: string | null) => {
    if (!state.inputs || !state.results) return;

    try {
      await fetch("/api/simulations", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          expectedPension: state.expectedPension,
          age: state.inputs.age,
          sex: state.inputs.sex,
          monthlyGross: state.inputs.monthlyGross,
          includeL4: state.inputs.includeL4,
          accountBalance: state.inputs.accountBalance,
          subAccountBalance: state.inputs.subAccountBalance,
          nominalPension: state.results.nominalPension,
          realPension: state.results.realPension,
          postalCode: postal,
        }),
      });
      console.log("Simulation data saved to database");
    } catch (error) {
      console.error("Failed to save simulation to database:", error);
    }
  };

  const validatePostalCode = (code: string): boolean => {
    const postalRegex = /^\d{2}-\d{3}$/;
    return postalRegex.test(code);
  };

  const handlePostalChange = (value: string) => {
    setPostalError("");
    let formatted = value.replace(/\D/g, "");
    if (formatted.length > 2) {
      formatted = formatted.slice(0, 2) + "-" + formatted.slice(2, 5);
    }
    setPostalCode(formatted);
  };

  const handleDownloadReport = async () => {
    if (!state.inputs || !state.results) {
      alert("No data available to generate report");
      return;
    }

    try {
      const { generatePDFReport } = await import("@/lib/utils/pdfGenerator");

      await generatePDFReport({
        inputs: state.inputs,
        results: state.results,
        expectedPension: state.expectedPension,
        timestamp: new Date(),
        postalCode: state.inputs.postalCode,
      });

      setShowReportPreview(false);
    } catch (error) {
      console.error("Error generating PDF report:", error);
      alert("Error generating PDF report. Please try again.");
    }
  };

  const formatDate = (date: Date) => {
    return new Date(date).toLocaleDateString("pl-PL", {
      day: "2-digit",
      month: "2-digit",
      year: "numeric",
    });
  };

  const formatTime = (date: Date) => {
    return new Date(date).toLocaleTimeString("pl-PL", {
      hour: "2-digit",
      minute: "2-digit",
    });
  };

  const handleEditSalary = (year: number, newSalary: number) => {
    console.log(`Editing salary for year ${year} to ${newSalary}`);
    // TODO: Implement salary editing logic
    // This would update the inputs and recalculate the simulation
  };

  const handleAddLifeEvent = (event: any) => {
    console.log("Adding life event:", event);
    setLifeEvents([...lifeEvents, { ...event, id: Date.now().toString() }]);
    // TODO: Implement life event addition logic
    // This would update the inputs and recalculate the simulation
  };

  const handleRemoveLifeEvent = (eventId: string) => {
    console.log("Removing life event:", eventId);
    setLifeEvents(lifeEvents.filter((e) => e.id !== eventId));
    // TODO: Implement life event removal logic
    // This would update the inputs and recalculate the simulation
  };

  if (isLoading || !state.results || !state.inputs) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        Ładowanie...
      </div>
    );
  }

  const { results, inputs, expectedPension } = state;

  return (
    <>
      {/* Postal Code Modal */}
      {showPostalModal && (
        <div
          className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4"
          onClick={handleSkipPostal}
        >
          <div
            className="bg-white rounded-lg shadow-2xl max-w-md w-full p-8 transform transition-all"
            onClick={(e) => e.stopPropagation()}
          >
            <div className="text-center mb-6">
              <div className="w-16 h-16 bg-zus-green-light rounded-full flex items-center justify-center mx-auto mb-4">
                <MapPin className="w-8 h-8 text-zus-green" />
              </div>
              <h2 className="text-2xl font-bold text-zus-grey-900 mb-2">
                {postalCode ? "Zaktualizuj kod pocztowy" : "Podaj kod pocztowy"}
              </h2>
              <p className="text-zus-grey-700">
                {postalCode
                  ? "Możesz zmienić swój kod pocztowy lub pozostawić obecny"
                  : "Opcjonalnie - pomoże nam lepiej dopasować statystyki"}
              </p>
            </div>

            <div className="mb-6">
              <label
                htmlFor="postal-code"
                className="block text-sm font-semibold text-zus-grey-900 mb-2"
              >
                Kod pocztowy
              </label>
              <input
                ref={postalInputRef}
                id="postal-code"
                type="text"
                value={postalCode}
                onChange={(e) => handlePostalChange(e.target.value)}
                onKeyDown={(e) => {
                  if (e.key === "Enter") {
                    handlePostalSubmit();
                  } else if (e.key === "Escape") {
                    handleSkipPostal();
                  }
                }}
                placeholder="XX-XXX"
                maxLength={6}
                className={`w-full h-12 px-4 text-center text-lg font-semibold border-2 rounded-lg focus:outline-none transition-colors ${
                  postalError
                    ? "border-zus-error focus:border-zus-error"
                    : "border-zus-grey-300 focus:border-zus-green"
                }`}
                aria-invalid={!!postalError}
                aria-describedby={postalError ? "postal-error" : undefined}
              />
              {postalError && (
                <p
                  id="postal-error"
                  className="text-sm text-zus-error mt-2 font-medium"
                  role="alert"
                >
                  {postalError}
                </p>
              )}
              <p className="text-xs text-zus-grey-500 mt-2 text-center">
                Przykład: 00-001 (Warszawa)
              </p>
            </div>

            <div className="flex flex-col gap-3">
              <Button
                onClick={handlePostalSubmit}
                variant="success"
                size="lg"
                className="w-full cursor-pointer"
                disabled={postalCode.length > 0 && postalCode.length !== 6}
              >
                {postalCode ? "Zapisz" : "Pomiń"}
              </Button>
              {postalCode && (
                <button
                  onClick={handleSkipPostal}
                  className="text-zus-grey-700 hover:text-zus-grey-900 font-semibold py-2 transition-colors cursor-pointer"
                >
                  Pomiń
                </button>
              )}
            </div>

            <p className="text-xs text-zus-grey-500 text-center mt-4">
              Dane są przetwarzane zgodnie z RODO i nie są udostępniane osobom
              trzecim
            </p>
          </div>
        </div>
      )}

      {/* Report Preview Modal */}
      {showReportPreview && (
        <div
          className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4 overflow-y-auto"
          onClick={() => setShowReportPreview(false)}
        >
          <div
            className="bg-white rounded-lg shadow-2xl max-w-2xl w-full my-8 transform transition-all"
            onClick={(e) => e.stopPropagation()}
          >
            {/* Header */}
            <div className="bg-zus-green p-6 rounded-t-lg">
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-3">
                  <div className="w-12 h-12 bg-white rounded-full flex items-center justify-center">
                    <FileText className="w-6 h-6 text-zus-green" />
                  </div>
                  <div>
                    <h2 className="text-2xl font-bold text-white">
                      Podgląd raportu
                    </h2>
                    <p className="text-zus-green-light text-sm">
                      Sprawdź dane przed pobraniem
                    </p>
                  </div>
                </div>
                <button
                  onClick={() => setShowReportPreview(false)}
                  className="text-white hover:bg-zus-green-dark rounded-full w-8 h-8 flex items-center justify-center transition-colors cursor-pointer"
                  aria-label="Zamknij"
                >
                  <X className="w-5 h-5" />
                </button>
              </div>
            </div>

            {/* Content */}
            <div className="p-6 max-h-[70vh] overflow-y-auto">
              <div className="space-y-4">
                {/* General Info Header */}
                <div className="pb-2 border-b-2 border-zus-green">
                  <h3 className="text-sm font-bold text-zus-green uppercase">
                    Informacje ogólne
                  </h3>
                </div>

                {/* Timestamp */}
                <div className="grid grid-cols-2 gap-3 py-2 border-b border-zus-grey-300">
                  <div>
                    <p className="text-xs text-zus-grey-700">Data użycia</p>
                    <p className="text-sm font-semibold text-zus-grey-900">
                      {formatDate(new Date())}
                    </p>
                  </div>
                  <div>
                    <p className="text-xs text-zus-grey-700">Godzina użycia</p>
                    <p className="text-sm font-semibold text-zus-grey-900">
                      {formatTime(new Date())}
                    </p>
                  </div>
                </div>

                {/* Postal Code */}
                <div className="py-2 border-b border-zus-grey-300">
                  <p className="text-xs text-zus-grey-700">Kod pocztowy</p>
                  <p className="text-sm font-semibold text-zus-grey-900">
                    {inputs.postalCode || "Nie podano"}
                  </p>
                </div>

                {/* Input Data Section Header */}
                <div className="pt-3 pb-2 border-b-2 border-zus-green">
                  <h3 className="text-sm font-bold text-zus-green uppercase">
                    Dane wejściowe
                  </h3>
                </div>

                {/* Salary and Expected Pension */}
                <div className="grid grid-cols-2 gap-3 py-2 border-b border-zus-grey-300">
                  <div>
                    <p className="text-xs text-zus-grey-700">
                      Wysokość wynagrodzenia (brutto)
                    </p>
                    <p className="text-lg font-bold text-zus-grey-900">
                      {formatPLN(inputs.monthlyGross)}
                    </p>
                  </div>
                  <div>
                    <p className="text-xs text-zus-grey-700">
                      Emerytura oczekiwana
                    </p>
                    <p className="text-lg font-bold text-zus-orange">
                      {formatPLN(expectedPension)}
                    </p>
                  </div>
                </div>

                {/* Personal Info */}
                <div className="grid grid-cols-2 gap-3 py-2 border-b border-zus-grey-300">
                  <div>
                    <p className="text-xs text-zus-grey-700">Wiek obecny</p>
                    <p className="text-sm font-semibold text-zus-grey-900">
                      {inputs.age} lat
                    </p>
                  </div>
                  <div>
                    <p className="text-xs text-zus-grey-700">Płeć</p>
                    <p className="text-sm font-semibold text-zus-grey-900">
                      {inputs.sex === "M" ? "Mężczyzna" : "Kobieta"}
                    </p>
                  </div>
                </div>

                {/* Work Period */}
                <div className="grid grid-cols-2 gap-3 py-2 border-b border-zus-grey-300">
                  <div>
                    <p className="text-xs text-zus-grey-700">
                      Rok rozpoczęcia pracy
                    </p>
                    <p className="text-sm font-semibold text-zus-grey-900">
                      {inputs.workStartYear}
                    </p>
                  </div>
                  <div>
                    <p className="text-xs text-zus-grey-700">
                      Rok przejścia na emeryturę
                    </p>
                    <p className="text-sm font-semibold text-zus-grey-900">
                      {inputs.workEndYear}
                    </p>
                  </div>
                </div>

                {/* Retirement Age and Sick Leave */}
                <div className="grid grid-cols-2 gap-3 py-2 border-b border-zus-grey-300">
                  <div>
                    <p className="text-xs text-zus-grey-700">
                      Uwzględnienie zwolnień lekarskich
                    </p>
                    <span
                      className={`inline-block px-2 py-0.5 rounded-full text-xs font-semibold mt-1 ${
                        inputs.includeL4
                          ? "bg-zus-error/10 text-zus-error"
                          : "bg-zus-green/10 text-zus-green"
                      }`}
                    >
                      {inputs.includeL4 ? "Tak" : "Nie"}
                    </span>
                  </div>
                  <div>
                    <p className="text-xs text-zus-grey-700">Wiek emerytalny</p>
                    <p className="text-sm font-semibold text-zus-grey-900">
                      {inputs.age +
                        (inputs.workEndYear - new Date().getFullYear())}{" "}
                      lat
                    </p>
                  </div>
                </div>

                {/* Account Balances */}
                <div className="grid grid-cols-2 gap-3 py-2 border-b border-zus-grey-300">
                  <div>
                    <p className="text-xs text-zus-grey-700">Konto główne</p>
                    <p className="text-sm font-semibold text-zus-grey-900">
                      {inputs.accountBalance
                        ? formatPLN(inputs.accountBalance)
                        : "0,00 zł"}
                    </p>
                  </div>
                  <div>
                    <p className="text-xs text-zus-grey-700">Subkonto</p>
                    <p className="text-sm font-semibold text-zus-grey-900">
                      {inputs.subAccountBalance
                        ? formatPLN(inputs.subAccountBalance)
                        : "0,00 zł"}
                    </p>
                  </div>
                </div>

                {/* Results Section Header */}
                <div className="pt-3 pb-2 border-b-2 border-zus-green">
                  <h3 className="text-sm font-bold text-zus-green uppercase">
                    Wyniki kalkulacji
                  </h3>
                </div>

                {/* Results - Nominal */}
                <div className="py-2 border-b border-zus-grey-300">
                  <p className="text-xs text-zus-grey-700">
                    Emerytura rzeczywista (w cenach z {inputs.workEndYear} roku)
                  </p>
                  <p className="text-lg font-bold text-zus-grey-900">
                    {formatPLN(results.nominalPension)}
                  </p>
                </div>

                {/* Results - Real */}
                <div className="py-2 border-b border-zus-grey-300">
                  <p className="text-xs text-zus-grey-700">
                    Emerytura urealniona (w dzisiejszych złotych)
                  </p>
                  <p className="text-xl font-bold text-zus-green">
                    {formatPLN(results.realPension)}
                  </p>
                  <p className="text-xs text-zus-grey-600 mt-0.5">
                    Porównywalna do dzisiejszych kosztów życia
                  </p>
                </div>

                {/* Replacement Rate */}
                <div className="py-2">
                  <p className="text-xs text-zus-grey-700">Stopa zastąpienia</p>
                  <p className="text-lg font-bold text-zus-grey-900">
                    {formatPercent(results.replacementRate / 100)}
                  </p>
                  <p className="text-xs text-zus-grey-600 mt-0.5">
                    Wynagrodzenie zindeksowane w odniesieniu do prognozowanego
                    świadczenia
                  </p>
                </div>
              </div>
            </div>

            {/* Footer Actions */}
            <div className="p-6 bg-zus-grey-100 rounded-b-lg border-t border-zus-grey-300">
              <div className="flex flex-col sm:flex-row gap-3">
                <button
                  onClick={() => setShowReportPreview(false)}
                  className="flex-1 px-6 py-3 bg-white border-2 border-zus-grey-300 text-zus-grey-900 font-semibold rounded-lg hover:bg-zus-grey-50 transition-colors cursor-pointer"
                >
                  Anuluj
                </button>
                <Button
                  onClick={handleDownloadReport}
                  variant="success"
                  size="lg"
                  className="flex-1 cursor-pointer"
                >
                  📥 Pobierz raport PDF
                </Button>
              </div>
              <p className="text-xs text-zus-grey-500 text-center mt-4">
                Raport zostanie pobrany w formacie PDF
              </p>
            </div>
          </div>
        </div>
      )}

      <main className="min-h-screen bg-gradient-to-b from-gray-50 to-gray-100 py-12">
        <div className="container mx-auto px-4 sm:px-6 lg:px-8 max-w-[1400px] relative">
          {/* History Button - Top Right */}
          <div className="absolute top-0 right-4 sm:right-6 lg:right-8 z-30">
            <HistoryButton />
          </div>

          <h1 className="text-4xl font-bold text-zus-grey-900 mb-8 text-center">
            Twoja Prognoza Emerytury
          </h1>

          {/* Congratulations Message */}
          {results.differenceVsExpected >= 0 && (
            <Card variant="success" className="mb-8">
              <h3 className="text-xl font-bold text-zus-green flex items-center gap-2">
                <CheckCircle className="w-6 h-6" />
                Gratulacje! Przekraczasz swoje oczekiwania
              </h3>
              <p className="mt-2">
                Twoja prognozowana emerytura ({formatPLN(results.realPension)})
                jest wyższa od oczekiwanej ({formatPLN(expectedPension)}) o{" "}
                {formatPLN(results.differenceVsExpected)}.
              </p>
            </Card>
          )}

          {/* Main Results */}
          <div className="grid md:grid-cols-2 gap-6 mb-8">
            <Card>
              <PensionDisplay
                title={`Wysokość rzeczywista - Twoja emerytura w ${inputs.workEndYear} roku`}
                amount={results.nominalPension}
                subtitle={`(w cenach z ${inputs.workEndYear} roku)`}
                formatPLN={formatPLN}
              />
            </Card>

            <Card variant="success">
              <PensionDisplay
                title="Wysokość urealniona (W DZISIEJSZYCH ZŁOTYCH)"
                amount={results.realPension}
                subtitle="Porównywalna do dzisiejszych kosztów życia"
                formatPLN={formatPLN}
                highlighted
              />
            </Card>
          </div>

          {/* Sick Leave Impact */}
          {inputs.includeL4 && (
            <Card className="mb-8 border-l-4 border-zus-error">
              <h3 className="text-xl font-bold text-zus-grey-900 mb-4">
                Wpływ zwolnień lekarskich na emeryturę
              </h3>
              <div className="grid md:grid-cols-2 gap-4">
                <div className="p-4 bg-zus-green/10 rounded-lg">
                  <span className="text-sm text-gray-600">Bez zwolnień</span>
                  <div className="text-2xl font-bold text-zus-green">
                    {formatPLN(results.withoutL4.realPension)}
                  </div>
                </div>
                <div className="p-4 bg-zus-error/10 rounded-lg">
                  <span className="text-sm text-gray-600">
                    Ze zwolnieniami lekarskimi
                  </span>
                  <div className="text-2xl font-bold text-zus-error">
                    {formatPLN(results.withL4.realPension)}
                  </div>
                </div>
              </div>
              <div className="mt-4 p-4 bg-gray-50 rounded-lg">
                <p className="font-bold text-zus-error">
                  📉 Różnica: {formatPLN(results.l4Difference)} miesięcznie
                </p>
              </div>
            </Card>
          )}

          {/* Input Summary */}
          <Card className="mb-8 bg-zus-grey-50">
            <h3 className="text-lg font-bold text-zus-grey-900 mb-4 pb-2 border-b-2 border-zus-green flex items-center gap-2">
              <FileText className="w-5 h-5 text-zus-green" />
              Dane symulacji
            </h3>
            <p className="text-sm text-zus-grey-700 mb-6">
              Zobacz swoją ścieżkę kariery i dodaj wydarzenia, które wpłyną na
              Twoją emeryturę
            </p>

            {/* Deferral Slider Section - NOW AT TOP */}
            <div className="mb-8 p-6 bg-gradient-to-br from-zus-green-light to-blue-50 rounded-lg border-2 border-zus-green">
              <h3 className="text-xl font-bold text-zus-grey-900 mb-2 flex items-center gap-2">
                <span>🎯</span>
                Symuluj: Pracuj dłużej, zarabiaj więcej
              </h3>
              <p className="text-sm text-zus-grey-700 mb-6">
                Przesuń suwak, aby zobaczyć jak wydłużenie kariery zawodowej
                wpłynie na Twoją przyszłą emeryturę
              </p>

              {/* Results Display - NEW LAYOUT */}
              <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-6">
                {/* Base Pension */}
                <div className="p-5 bg-white rounded-lg shadow-sm border-l-4 border-zus-grey-500">
                  <p className="text-xs text-zus-grey-600 mb-1 uppercase tracking-wide">
                    Emerytura bazowa
                  </p>
                  <p className="text-2xl font-bold text-zus-grey-900">
                    {formatPLN(results.realPension)}
                  </p>
                  <p className="text-xs text-zus-grey-600 mt-1">
                    Przejście: {inputs.workEndYear} (
                    {inputs.age +
                      (inputs.workEndYear - new Date().getFullYear())}{" "}
                    lat)
                  </p>
                </div>

                {/* Selected Deferral Pension */}
                <div className="p-5 bg-gradient-to-br from-zus-green to-zus-green-dark rounded-lg shadow-md border-2 border-white">
                  <p className="text-xs text-white/90 mb-1 uppercase tracking-wide flex items-center gap-2">
                    <span>✨</span>
                    Emerytura po +{selectedDeferralYears}{" "}
                    {selectedDeferralYears === 1 ? "roku" : "latach"}
                  </p>
                  <p className="text-3xl font-bold text-white">
                    {selectedDeferralYears === 0
                      ? formatPLN(results.realPension)
                      : formatPLN(
                          results.deferrals[selectedDeferralYears - 1]
                            ?.realPension || results.realPension
                        )}
                  </p>
                  <p className="text-xs text-white/80 mt-1">
                    {selectedDeferralYears === 0
                      ? "Wybierz lata na suwaku powyżej"
                      : `Przejście: ${
                          inputs.workEndYear + selectedDeferralYears
                        } (${
                          inputs.age +
                          (inputs.workEndYear - new Date().getFullYear()) +
                          selectedDeferralYears
                        } lat)`}
                  </p>
                </div>

                {/* Increase */}
                <div
                  className={`p-5 rounded-lg shadow-sm border-l-4 ${
                    selectedDeferralYears === 0
                      ? "bg-zus-grey-100 border-zus-grey-400"
                      : "bg-zus-green-light border-zus-green"
                  }`}
                >
                  <p className="text-xs text-zus-grey-600 mb-1 uppercase tracking-wide">
                    💰 Wzrost emerytury
                  </p>
                  <p
                    className={`text-2xl font-bold ${
                      selectedDeferralYears === 0
                        ? "text-zus-grey-600"
                        : "text-zus-green"
                    }`}
                  >
                    {selectedDeferralYears === 0
                      ? "+0 zł"
                      : `+${formatPLN(
                          (results.deferrals[selectedDeferralYears - 1]
                            ?.realPension || results.realPension) -
                            results.realPension
                        )}`}
                  </p>
                  <p className="text-xs text-zus-grey-600 mt-1">
                    {selectedDeferralYears === 0
                      ? "Przesuń suwak, aby zobaczyć wzrost"
                      : `+${
                          results.deferrals[
                            selectedDeferralYears - 1
                          ]?.percentIncrease.toFixed(1) || "0.0"
                        }% więcej miesięcznie`}
                  </p>
                </div>
              </div>

              {/* Slider Control */}
              <div className="bg-white p-6 rounded-lg shadow-sm">
                <div className="flex justify-between items-center mb-3">
                  <label className="font-semibold text-zus-grey-900 text-lg">
                    Ile lat dłużej chcesz pracować?
                  </label>
                  <span className="text-3xl font-bold text-zus-green">
                    +{selectedDeferralYears}{" "}
                    {selectedDeferralYears === 1
                      ? "rok"
                      : selectedDeferralYears < 5
                      ? "lata"
                      : "lat"}
                  </span>
                </div>

                <input
                  type="range"
                  min={0}
                  max={Math.min(results.deferrals.length, 15)}
                  value={selectedDeferralYears}
                  onChange={(e) =>
                    setSelectedDeferralYears(Number(e.target.value))
                  }
                  className="w-full h-4 bg-gradient-to-r from-zus-grey-300 to-zus-green rounded-lg appearance-none cursor-pointer accent-zus-green"
                  style={{
                    background: `linear-gradient(to right, #00843D 0%, #00843D ${
                      (selectedDeferralYears /
                        Math.min(results.deferrals.length, 15)) *
                      100
                    }%, #E0E0E0 ${
                      (selectedDeferralYears /
                        Math.min(results.deferrals.length, 15)) *
                      100
                    }%, #E0E0E0 100%)`,
                  }}
                />

                <div className="flex justify-between text-sm text-zus-grey-600 mt-2">
                  <span>
                    Bazowy plan ({inputs.workEndYear} r. -{" "}
                    {inputs.age +
                      (inputs.workEndYear - new Date().getFullYear())}{" "}
                    lat)
                  </span>
                  <span>
                    +{Math.min(results.deferrals.length, 15)} lat (maks.)
                  </span>
                </div>
              </div>

              {/* Tip */}
              {selectedDeferralYears > 0 && (
                <div className="mt-4 p-4 bg-white/70 rounded-lg border border-zus-green">
                  <p className="text-sm text-zus-grey-700 flex items-start gap-2">
                    <span className="text-zus-green flex-shrink-0 text-lg">
                      💡
                    </span>
                    <span>
                      <strong>Wskazówka:</strong> Pracując{" "}
                      {selectedDeferralYears}{" "}
                      {selectedDeferralYears === 1
                        ? "rok"
                        : selectedDeferralYears < 5
                        ? "lata"
                        : "lat"}{" "}
                      dłużej zwiększysz swoją emeryturę o{" "}
                      <strong className="text-zus-green">
                        {formatPLN(
                          (results.deferrals[selectedDeferralYears - 1]
                            ?.realPension || results.realPension) -
                            results.realPension
                        )}
                      </strong>{" "}
                      miesięcznie! To daje{" "}
                      <strong className="text-zus-green">
                        {formatPLN(
                          ((results.deferrals[selectedDeferralYears - 1]
                            ?.realPension || results.realPension) -
                            results.realPension) *
                            12
                        )}
                      </strong>{" "}
                      więcej rocznie.
                    </span>
                  </p>
                </div>
              )}
            </div>

            {/* Career Timeline Visualization */}
            <div className="grid grid-cols-1 md:grid-cols-[1fr_320px] gap-6 mb-8">
              <div className="bg-white p-6 rounded-lg border border-zus-grey-300">
                {/* Timeline header */}
                <div className="flex items-center justify-between mb-4">
                  <div className="text-sm text-zus-grey-700">
                    Twoja ścieżka zawodowa
                  </div>
                  <div className="flex gap-2">
                    <button
                      onClick={() => {
                        const item = {
                          id: Date.now().toString(),
                          kind: "MATERNITY_LEAVE" as const,
                          startYear: new Date().getFullYear() + 1,
                          startMonth: 1 as const,
                          endYear: new Date().getFullYear() + 1,
                          endMonth: 6 as const,
                        };
                        setGapPeriods((prev) => [...prev, item]);
                        updateDashboardModifications({
                          gapPeriods: [...gapPeriods, item],
                        });
                        recalculate();
                      }}
                      className="px-3 py-1.5 rounded bg-zus-green text-white hover:bg-zus-green-dark text-xs font-semibold transition-colors"
                    >
                      👶 Urlop macierzyński
                    </button>
                    <button
                      onClick={() => {
                        const item = {
                          id: Date.now().toString(),
                          kind: "UNPAID_LEAVE" as const,
                          startYear: new Date().getFullYear() + 1,
                          startMonth: 1 as const,
                          endYear: new Date().getFullYear() + 1,
                          endMonth: 3 as const,
                        };
                        setGapPeriods((prev) => [...prev, item]);
                        updateDashboardModifications({
                          gapPeriods: [...gapPeriods, item],
                        });
                        recalculate();
                      }}
                      className="px-3 py-1.5 rounded bg-zus-navy text-white hover:bg-[#083A5F] text-xs font-semibold transition-colors"
                    >
                      🏖️ Urlop bezpłatny
                    </button>
                    <button
                      onClick={() => {
                        const item = {
                          id: Date.now().toString(),
                          type: "SICK_LEAVE" as const,
                          year: new Date().getFullYear() + 1,
                          month: 1 as const,
                          days: 182,
                        };
                        setLifeEvents((prev) => [...prev, item]);
                        updateDashboardModifications({
                          lifeEvents: [...lifeEvents, item],
                        });
                        recalculate();
                      }}
                      className="px-3 py-1.5 rounded border-2 border-zus-green text-zus-green hover:bg-zus-green-light text-xs font-semibold transition-colors"
                    >
                      🏥 Długie L4
                    </button>
                  </div>
                </div>

                {/* Timeline visualization */}
                <CareerTimeline
                  salaryPath={results.salaryPath}
                  capitalPath={results.capitalPath}
                  contractPeriods={contractPeriods}
                  gapPeriods={gapPeriods}
                  lifeEvents={lifeEvents}
                  currentYear={new Date().getFullYear()}
                  retirementYear={inputs.workEndYear}
                  onChangeRetirementYear={(year) => {
                    const newInputs = { ...inputs, workEndYear: year };
                    setInputs(newInputs);
                    recalculate();
                  }}
                />

                {/* Events list */}
                {(lifeEvents.length > 0 ||
                  gapPeriods.length > 0 ||
                  contractPeriods.length > 0) && (
                  <div className="mt-6 pt-6 border-t border-zus-grey-300">
                    <h4 className="font-semibold text-zus-grey-900 mb-3">
                      Twoje wydarzenia
                    </h4>
                    <div className="space-y-2">
                      {gapPeriods.map((gap) => (
                        <div
                          key={gap.id}
                          className="flex items-center justify-between p-3 bg-zus-grey-100 rounded-lg"
                        >
                          <div className="flex items-center gap-3">
                            <span className="text-xl">
                              {gap.kind === "MATERNITY_LEAVE"
                                ? "👶"
                                : gap.kind === "UNPAID_LEAVE"
                                ? "🏖️"
                                : "📉"}
                            </span>
                            <div>
                              <p className="font-semibold text-sm text-zus-grey-900">
                                {gap.kind === "MATERNITY_LEAVE"
                                  ? "Urlop macierzyński"
                                  : gap.kind === "UNPAID_LEAVE"
                                  ? "Urlop bezpłatny"
                                  : "Bezrobocie"}
                              </p>
                              <p className="text-xs text-zus-grey-600">
                                {gap.startMonth}/{gap.startYear} -{" "}
                                {gap.endMonth}/{gap.endYear}
                              </p>
                            </div>
                          </div>
                          <button
                            onClick={() => {
                              const filtered = gapPeriods.filter(
                                (g) => g.id !== gap.id
                              );
                              setGapPeriods(filtered);
                              updateDashboardModifications({
                                gapPeriods: filtered,
                              });
                              recalculate();
                            }}
                            className="text-zus-error hover:text-zus-error/80 text-sm font-semibold"
                          >
                            Usuń
                          </button>
                        </div>
                      ))}
                      {lifeEvents.map((event) => (
                        <div
                          key={event.id}
                          className="flex items-center justify-between p-3 bg-zus-grey-100 rounded-lg"
                        >
                          <div className="flex items-center gap-3">
                            <span className="text-xl">🏥</span>
                            <div>
                              <p className="font-semibold text-sm text-zus-grey-900">
                                Długie L4
                              </p>
                              <p className="text-xs text-zus-grey-600">
                                {event.month}/{event.year} ({event.days || 182}{" "}
                                dni)
                              </p>
                            </div>
                          </div>
                          <button
                            onClick={() => {
                              const filtered = lifeEvents.filter(
                                (e) => e.id !== event.id
                              );
                              setLifeEvents(filtered);
                              updateDashboardModifications({
                                lifeEvents: filtered,
                              });
                              recalculate();
                            }}
                            className="text-zus-error hover:text-zus-error/80 text-sm font-semibold"
                          >
                            Usuń
                          </button>
                        </div>
                      ))}
                    </div>
                  </div>
                )}
              </div>

              <TimelineSidePanel
                onCreateEmployment={(p) => {
                  const item = { ...p, id: Date.now().toString() };
                  setContractPeriods((prev) => [...prev, item]);
                  updateDashboardModifications({
                    contractPeriods: [...contractPeriods, item],
                  });
                  recalculate();
                }}
                onCreateGap={(p) => {
                  const item = { ...p, id: Date.now().toString() };
                  setGapPeriods((prev) => [...prev, item]);
                  updateDashboardModifications({
                    gapPeriods: [...gapPeriods, item],
                  });
                  recalculate();
                }}
                onCreateSickPoint={(e) => {
                  const item = { ...e, id: Date.now().toString() };
                  setLifeEvents((prev) => [...prev, item]);
                  updateDashboardModifications({
                    lifeEvents: [...lifeEvents, item],
                  });
                  recalculate();
                }}
              />
            </div>
          </Card>

          {/* Deferral Scenarios */}
          <Card className="mb-8">
            {/* Original View Mode Toggle */}
            <div className="flex justify-between items-center mb-6">
              <h3 className="text-xl font-bold text-zus-grey-900">
                Szczegółowa analiza wszystkich scenariuszy
              </h3>
              <div className="flex gap-2 bg-zus-grey-100 p-1 rounded-lg">
                <button
                  onClick={() => setDeferralViewMode("bar")}
                  className={`px-4 py-2 rounded-md font-semibold text-sm transition-all cursor-pointer flex items-center gap-2 ${
                    deferralViewMode === "bar"
                      ? "bg-zus-green text-white shadow-md"
                      : "text-zus-grey-700 hover:bg-white"
                  }`}
                >
                  <BarChart3 className="w-4 h-4" />
                  Wykres słupkowy
                </button>
                <button
                  onClick={() => setDeferralViewMode("line")}
                  className={`px-4 py-2 rounded-md font-semibold text-sm transition-all cursor-pointer flex items-center gap-2 ${
                    deferralViewMode === "line"
                      ? "bg-zus-green text-white shadow-md"
                      : "text-zus-grey-700 hover:bg-white"
                  }`}
                >
                  <TrendingUp className="w-4 h-4" />
                  Wykres liniowy
                </button>
                <button
                  onClick={() => setDeferralViewMode("table")}
                  className={`px-4 py-2 rounded-md font-semibold text-sm transition-all cursor-pointer flex items-center gap-2 ${
                    deferralViewMode === "table"
                      ? "bg-zus-green text-white shadow-md"
                      : "text-zus-grey-700 hover:bg-white"
                  }`}
                >
                  <Table className="w-4 h-4" />
                  Tabela
                </button>
              </div>
            </div>

            {deferralViewMode === "bar" && (
              <div className="space-y-6">
                {/* Bar Chart */}
                <div className="h-[500px]">
                  <Bar
                    data={{
                      labels: [
                        `Bazowy (wiek ${
                          inputs.age +
                          (inputs.workEndYear - new Date().getFullYear())
                        })`,
                        ...results.deferrals.map(
                          (d) =>
                            `+${d.additionalYears} ${
                              d.additionalYears === 1
                                ? "rok"
                                : d.additionalYears < 5
                                ? "lata"
                                : "lat"
                            } (wiek ${d.retirementAge})`
                        ),
                      ],
                      datasets: [
                        {
                          label: "Emerytura realna (zł)",
                          data: [
                            results.realPension,
                            ...results.deferrals.map((d) => d.realPension),
                          ],
                          backgroundColor: [
                            "#9E9E9E", // Bazowy - light grey (starting point)
                            "#7BA885", // +1 - grey-green transition
                            "#5FB370", // +2 - light green
                            "#42BD5B", // +3 - medium-light green
                            "#26C846", // +4 - bright green
                            "#1FB843", // +5 - vibrant green
                            "#18A83D", // +6 - medium green
                            "#129837", // +7 - ZUS green shade
                            "#0D8831", // +8 - deeper green
                            "#08782B", // +9 - dark green
                            "#0A6D2E", // +10 - forest green
                            "#0C6231", // +11 - deep forest
                            "#0E5734", // +12 - very dark green
                            "#0F4C37", // +13 - teal-green
                            "#10413A", // +14 - dark teal
                            "#0B363D", // +15 - deep teal-navy
                          ],
                          borderRadius: 8,
                          borderWidth: 0,
                        },
                      ],
                    }}
                    options={{
                      responsive: true,
                      maintainAspectRatio: false,
                      plugins: {
                        legend: {
                          display: false,
                        },
                        tooltip: {
                          backgroundColor: "#FFFFFF",
                          titleColor: "#212121",
                          bodyColor: "#424242",
                          borderColor: "#E0E0E0",
                          borderWidth: 2,
                          padding: 12,
                          titleFont: { size: 14, weight: "bold" as const },
                          bodyFont: { size: 13 },
                          callbacks: {
                            label: function (context: any) {
                              return formatPLN(context.parsed.y);
                            },
                          },
                        },
                      },
                      scales: {
                        y: {
                          beginAtZero: false,
                          ticks: {
                            color: "#757575",
                            font: { size: 12 },
                            callback: function (value: any) {
                              return (value / 1000).toFixed(0) + "k zł";
                            },
                          },
                          grid: {
                            color: "#E0E0E0",
                          },
                        },
                        x: {
                          ticks: {
                            color: "#424242",
                            font: { size: 12, weight: 600 },
                          },
                          grid: {
                            display: false,
                          },
                        },
                      },
                    }}
                  />
                </div>

                {/* Summary Cards */}
                <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mt-6">
                  <div className="p-4 bg-zus-grey-100 rounded-lg border border-zus-grey-300">
                    <p className="text-sm text-zus-grey-700 mb-1">
                      Emerytura bazowa
                    </p>
                    <p className="text-2xl font-bold text-zus-grey-900">
                      {formatPLN(results.realPension)}
                    </p>
                    <p className="text-xs text-zus-grey-500 mt-1">
                      Przejście na emeryturę w {inputs.workEndYear} roku
                    </p>
                  </div>
                  {results.deferrals.length > 0 && (
                    <>
                      <div className="p-4 bg-zus-green-light rounded-lg border border-zus-green">
                        <p className="text-sm text-zus-grey-700 mb-1">
                          Po +
                          {
                            results.deferrals[results.deferrals.length - 1]
                              .additionalYears
                          }{" "}
                          {results.deferrals[results.deferrals.length - 1]
                            .additionalYears < 5
                            ? "latach"
                            : "lat"}
                        </p>
                        <p className="text-2xl font-bold text-zus-green">
                          {formatPLN(
                            results.deferrals[results.deferrals.length - 1]
                              .realPension
                          )}
                        </p>
                        <p className="text-xs text-zus-grey-700 mt-1">
                          Wzrost: +
                          {results.deferrals[
                            results.deferrals.length - 1
                          ].percentIncrease.toFixed(1)}
                          %
                        </p>
                      </div>
                      <div className="p-4 bg-zus-orange/10 rounded-lg border border-zus-orange">
                        <p className="text-sm text-zus-grey-700 mb-1">
                          Maksymalna korzyść
                        </p>
                        <p className="text-2xl font-bold text-zus-orange">
                          +
                          {formatPLN(
                            results.deferrals[results.deferrals.length - 1]
                              .increaseVsBase
                          )}
                        </p>
                        <p className="text-xs text-zus-grey-700 mt-1">
                          Dodatkowy dochód miesięcznie
                        </p>
                      </div>
                    </>
                  )}
                </div>
              </div>
            )}

            {deferralViewMode === "line" && (
              <div className="space-y-6">
                {/* Growth Line Chart */}
                <div className="h-[500px]">
                  <Line
                    data={{
                      labels: [
                        `Bazowy\n${
                          inputs.age +
                          (inputs.workEndYear - new Date().getFullYear())
                        } lat`,
                        ...results.deferrals.map(
                          (d) => `+${d.additionalYears}\n${d.retirementAge} lat`
                        ),
                      ],
                      datasets: [
                        {
                          label: "Procentowy wzrost emerytury",
                          data: [
                            0,
                            ...results.deferrals.map((d) => d.percentIncrease),
                          ],
                          borderColor: "#00843D",
                          backgroundColor: "rgba(0, 132, 61, 0.1)",
                          fill: true,
                          tension: 0.4,
                          pointRadius: 6,
                          pointHoverRadius: 8,
                          pointBackgroundColor: "#00843D",
                          pointBorderColor: "#FFFFFF",
                          pointBorderWidth: 2,
                        },
                      ],
                    }}
                    options={{
                      responsive: true,
                      maintainAspectRatio: false,
                      plugins: {
                        legend: {
                          display: true,
                          position: "top" as const,
                          labels: {
                            color: "#424242",
                            font: { size: 13, weight: 600 },
                            padding: 12,
                          },
                        },
                        tooltip: {
                          backgroundColor: "#FFFFFF",
                          titleColor: "#212121",
                          bodyColor: "#424242",
                          borderColor: "#E0E0E0",
                          borderWidth: 2,
                          padding: 12,
                          callbacks: {
                            label: function (context: any) {
                              return `Wzrost: +${context.parsed.y.toFixed(1)}%`;
                            },
                          },
                        },
                      },
                      scales: {
                        y: {
                          beginAtZero: true,
                          ticks: {
                            color: "#757575",
                            font: { size: 12 },
                            callback: function (value: any) {
                              return `+${value}%`;
                            },
                          },
                          grid: {
                            color: "#E0E0E0",
                          },
                        },
                        x: {
                          ticks: {
                            color: "#424242",
                            font: { size: 11, weight: 600 },
                            maxRotation: 0,
                            minRotation: 0,
                          },
                          grid: {
                            display: false,
                          },
                        },
                      },
                    }}
                  />
                </div>

                {/* Summary Cards */}
                <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mt-6">
                  <div className="p-4 bg-zus-grey-100 rounded-lg border border-zus-grey-300">
                    <p className="text-sm text-zus-grey-700 mb-1">
                      Emerytura bazowa
                    </p>
                    <p className="text-2xl font-bold text-zus-grey-900">
                      {formatPLN(results.realPension)}
                    </p>
                    <p className="text-xs text-zus-grey-500 mt-1">
                      Przejście na emeryturę w {inputs.workEndYear} roku
                    </p>
                  </div>
                  {results.deferrals.length > 0 && (
                    <>
                      <div className="p-4 bg-zus-green-light rounded-lg border border-zus-green">
                        <p className="text-sm text-zus-grey-700 mb-1">
                          Po +
                          {
                            results.deferrals[results.deferrals.length - 1]
                              .additionalYears
                          }{" "}
                          {results.deferrals[results.deferrals.length - 1]
                            .additionalYears < 5
                            ? "latach"
                            : "lat"}
                        </p>
                        <p className="text-2xl font-bold text-zus-green">
                          {formatPLN(
                            results.deferrals[results.deferrals.length - 1]
                              .realPension
                          )}
                        </p>
                        <p className="text-xs text-zus-grey-700 mt-1">
                          Wzrost: +
                          {results.deferrals[
                            results.deferrals.length - 1
                          ].percentIncrease.toFixed(1)}
                          %
                        </p>
                      </div>
                      <div className="p-4 bg-zus-orange/10 rounded-lg border border-zus-orange">
                        <p className="text-sm text-zus-grey-700 mb-1">
                          Maksymalna korzyść
                        </p>
                        <p className="text-2xl font-bold text-zus-orange">
                          +
                          {formatPLN(
                            results.deferrals[results.deferrals.length - 1]
                              .increaseVsBase
                          )}
                        </p>
                        <p className="text-xs text-zus-grey-700 mt-1">
                          Dodatkowy dochód miesięcznie
                        </p>
                      </div>
                    </>
                  )}
                </div>
              </div>
            )}

            {deferralViewMode === "table" && (
              <div className="overflow-x-auto">
                <table className="w-full">
                  <thead>
                    <tr className="bg-zus-grey-100 border-b-2 border-zus-green">
                      <th className="p-3 text-left font-semibold text-zus-grey-900">
                        Scenariusz
                      </th>
                      <th className="p-3 text-right font-semibold text-zus-grey-900">
                        Rok przejścia
                      </th>
                      <th className="p-3 text-right font-semibold text-zus-grey-900">
                        Emerytura
                      </th>
                      <th className="p-3 text-right font-semibold text-zus-grey-900">
                        Wzrost
                      </th>
                    </tr>
                  </thead>
                  <tbody>
                    <tr className="border-b border-zus-grey-300 bg-zus-grey-50">
                      <td className="p-3 font-bold text-zus-grey-900">
                        Bazowy
                      </td>
                      <td className="p-3 text-right text-zus-grey-900">
                        {inputs.workEndYear}
                      </td>
                      <td className="p-3 text-right font-bold text-zus-grey-900">
                        {formatPLN(results.realPension)}
                      </td>
                      <td className="p-3 text-right text-zus-grey-500">-</td>
                    </tr>
                    {results.deferrals.map((def) => (
                      <tr
                        key={def.additionalYears}
                        className="border-b border-zus-grey-300 hover:bg-zus-green-light transition-colors"
                      >
                        <td className="p-3 font-semibold text-zus-grey-900">
                          +{formatYears(def.additionalYears)}
                        </td>
                        <td className="p-3 text-right text-zus-grey-700">
                          {def.retirementYear}
                        </td>
                        <td className="p-3 text-right font-bold text-zus-green">
                          {formatPLN(def.realPension)}
                        </td>
                        <td className="p-3 text-right">
                          <div className="font-bold text-zus-green">
                            +{formatPLN(def.increaseVsBase)}
                          </div>
                          <div className="text-xs text-zus-grey-700">
                            (+{def.percentIncrease.toFixed(1)}%)
                          </div>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            )}
          </Card>

          {/* Gap Analysis */}
          {results.differenceVsExpected < 0 && (
            <Card variant="warning" className="mb-8">
              <h3 className="text-xl font-bold text-zus-error mb-4 flex items-center gap-2">
                <AlertTriangle className="w-6 h-6" />
                Twoja prognoza jest niższa od oczekiwań
              </h3>
              <div className="p-4 bg-white rounded-lg mb-4">
                <p className="text-xl font-bold text-zus-error">
                  Brakuje: {formatPLN(Math.abs(results.differenceVsExpected))}{" "}
                  miesięcznie
                </p>
              </div>
              {results.yearsNeeded !== null && (
                <div className="p-4 bg-zus-orange/20 rounded-lg">
                  <p className="font-bold text-lg flex items-center gap-2">
                    <Lightbulb className="w-5 h-5 text-zus-orange" />
                    Aby osiągnąć oczekiwaną kwotę:
                  </p>
                  <p className="text-xl font-bold text-zus-grey-900 mt-2">
                    Musisz pracować o {formatYears(results.yearsNeeded)} dłużej
                  </p>
                </div>
              )}
            </Card>
          )}

          {/* Actions */}
          <div className="flex flex-col md:flex-row gap-4">
            <NewSimulationButton className="flex-1 cursor-pointer" />
            <Button
              onClick={() => router.push("/dashboard")}
              variant="secondary"
              size="lg"
              className="flex-1 cursor-pointer flex items-center justify-center gap-2"
            >
              <BarChart3 className="w-5 h-5" />
              Przejdź do Dashboardu
            </Button>
            <Button
              onClick={() => setShowReportPreview(true)}
              variant="success"
              size="lg"
              className="flex-1 cursor-pointer flex items-center justify-center gap-2"
            >
              <FileText className="w-5 h-5" />
              Pobierz raport (PDF)
            </Button>
          </div>
        </div>
      </main>
    </>
  );
}
