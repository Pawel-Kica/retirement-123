"use client";

import { useEffect, useState, useRef } from "react";
import { useRouter } from "next/navigation";
import { Button } from "@/components/ui/Button";
import { NewSimulationButton } from "@/components/ui/NewSimulationButton";
import { Card } from "@/components/ui/Card";
import { PensionDisplay } from "@/components/ui/PensionDisplay";
import { Tooltip as InfoTooltip } from "@/components/ui/Tooltip";
import { HistoryButton } from "@/components/ui/HistoryButton";
import { useSimulation } from "@/lib/context/SimulationContext";
import { formatPLN, formatPercent, formatYears } from "@/lib/utils/formatting";
import { updateSimulationPostalCode } from "@/lib/utils/simulationHistory";
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
  const { state, loadFromHistory, getHistory, setInputs } = useSimulation();
  const [deferralViewMode, setDeferralViewMode] = useState<
    "bar" | "line" | "table"
  >("bar");
  const [isLoading, setIsLoading] = useState(true);
  const [showPostalModal, setShowPostalModal] = useState(false);
  const [postalCode, setPostalCode] = useState("");
  const [postalError, setPostalError] = useState("");
  const postalInputRef = useRef<HTMLInputElement>(null);
  const [showReportPreview, setShowReportPreview] = useState(false);

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
      console.log("✅ Simulation data saved to database");
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
                <span className="text-3xl">📍</span>
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
                className={`w-full h-12 px-4 text-center text-lg font-semibold border-2 rounded-lg focus:outline-none transition-colors ${postalError
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
                    <span className="text-2xl">📄</span>
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
                  ✕
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
                      className={`inline-block px-2 py-0.5 rounded-full text-xs font-semibold mt-1 ${inputs.includeL4
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
              <h3 className="text-xl font-bold text-zus-green">
                ✅ Gratulacje! Przekraczasz swoje oczekiwania
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
            <h3 className="text-lg font-bold text-zus-grey-900 mb-4 pb-2 border-b-2 border-zus-green">
              📋 Dane symulacji
            </h3>
            <div className="grid grid-cols-2 md:grid-cols-4 lg:grid-cols-6 gap-3">
              <div className="p-3 bg-white rounded border border-zus-grey-300">
                <div className="flex items-center gap-1 mb-1">
                  <p className="text-xs text-zus-grey-600">
                    Oczekiwana emerytura
                  </p>
                </div>
                <p className="text-sm font-bold text-zus-orange">
                  {formatPLN(expectedPension)}
                </p>
              </div>
              <div className="p-3 bg-white rounded border border-zus-grey-300">
                <p className="text-xs text-zus-grey-600 mb-1">Wiek obecny</p>
                <p className="text-sm font-bold text-zus-grey-900">
                  {inputs.age} lat
                </p>
              </div>
              <div className="p-3 bg-white rounded border border-zus-grey-300">
                <p className="text-xs text-zus-grey-600 mb-1">Płeć</p>
                <p className="text-sm font-bold text-zus-grey-900">
                  {inputs.sex === "M" ? "M" : "K"}
                </p>
              </div>
              <div className="p-3 bg-white rounded border border-zus-grey-300">
                <p className="text-xs text-zus-grey-600 mb-1">
                  Rozpoczęcie pracy
                </p>
                <p className="text-sm font-bold text-zus-grey-900">
                  {inputs.workStartYear}
                </p>
              </div>
              <div className="p-3 bg-white rounded border border-zus-grey-300">
                <p className="text-xs text-zus-grey-600 mb-1">
                  Przejście na emeryturę
                </p>
                <p className="text-sm font-bold text-zus-grey-900">
                  {inputs.workEndYear}
                </p>
              </div>
              <div className="p-3 bg-white rounded border border-zus-grey-300">
                <p className="text-xs text-zus-grey-600 mb-1">
                  Wiek emerytalny
                </p>
                <p className="text-sm font-bold text-zus-green">
                  {inputs.age + (inputs.workEndYear - new Date().getFullYear())}{" "}
                  lat
                </p>
              </div>
              <div className="p-3 bg-white rounded border border-zus-grey-300">
                <p className="text-xs text-zus-grey-600 mb-1">
                  Lata pracy (total)
                </p>
                <p className="text-sm font-bold text-zus-grey-900">
                  {inputs.workEndYear - inputs.workStartYear} lat
                </p>
              </div>
              <div className="p-3 bg-white rounded border border-zus-grey-300">
                <div className="flex items-center gap-1 mb-1">
                  <p className="text-xs text-zus-grey-600">Wynagrodzenie</p>
                  <InfoTooltip content="Twoje obecne miesięczne wynagrodzenie brutto (przed potrąceniem podatków i składek ZUS). Na tej podstawie obliczane są przyszłe składki emerytalne.">
                    <InfoIcon />
                  </InfoTooltip>
                </div>
                <p className="text-sm font-bold text-zus-grey-900">
                  {formatPLN(inputs.monthlyGross)}
                </p>
              </div>
              <div className="p-3 bg-white rounded border border-zus-grey-300">
                <div className="flex items-center gap-1 mb-1">
                  <p className="text-xs text-zus-grey-600">Zwolnienia lekarskie</p>
                  <InfoTooltip content="Uwzględnienie zwolnień lekarskich w symulacji. Okres choroby nie generuje pełnych składek emerytalnych, co wpływa na wysokość przyszłej emerytury.">
                    <InfoIcon />
                  </InfoTooltip>
                </div>
                <p className="text-sm font-bold text-zus-grey-900">
                  {inputs.includeL4 ? "Tak" : "Nie"}
                </p>
              </div>
              <div className="p-3 bg-white rounded border border-zus-grey-300">
                <div className="flex items-center gap-1 mb-1">
                  <p className="text-xs text-zus-grey-600">Konto główne</p>
                  <InfoTooltip content="Stan Twojego głównego konta emerytalnego w ZUS. Informację o stanie konta możesz znaleźć w rocznej informacji przesyłanej przez ZUS lub na Platformie Usług Elektronicznych (PUE ZUS).">
                    <InfoIcon />
                  </InfoTooltip>
                </div>
                <p className="text-sm font-bold text-zus-grey-900">
                  {inputs.accountBalance
                    ? formatPLN(inputs.accountBalance)
                    : "0,00 zł"}
                </p>
              </div>
              <div className="p-3 bg-white rounded border border-zus-grey-300">
                <div className="flex items-center gap-1 mb-1">
                  <p className="text-xs text-zus-grey-600">Subkonto</p>
                  <InfoTooltip content="Stan subkonta emerytalnego w ZUS. Subkonto zostało utworzone dla osób urodzonych po 1948 roku i gromadzi składki odprowadzane od 1999 roku. Sprawdź stan na PUE ZUS.">
                    <InfoIcon />
                  </InfoTooltip>
                </div>
                <p className="text-sm font-bold text-zus-grey-900">
                  {inputs.subAccountBalance
                    ? formatPLN(inputs.subAccountBalance)
                    : "0,00 zł"}
                </p>
              </div>
              <div className="p-3 bg-white rounded border border-zus-grey-300">
                <div className="flex items-center gap-1 mb-1">
                  <p className="text-xs text-zus-grey-600">Stopa zastąpienia</p>
                  <InfoTooltip content="Stopa zastąpienia to procent ostatniego wynagrodzenia, który będzie zastąpiony przez emeryturę. Na przykład 50% oznacza, że emerytura wyniesie połowę ostatniej pensji. Im wyższa stopa, tym lepiej.">
                    <InfoIcon />
                  </InfoTooltip>
                </div>
                <p className="text-sm font-bold text-zus-grey-900">
                  {formatPercent(results.replacementRate / 100)}
                </p>
              </div>
            </div>
          </Card>

          {/* Deferral Scenarios */}
          <Card className="mb-8">
            <div className="flex justify-between items-center mb-6">
              <h3 className="text-xl font-bold text-zus-grey-900">
                Co jeśli będziesz pracować dłużej?
              </h3>
              <div className="flex gap-2 bg-zus-grey-100 p-1 rounded-lg">
                <button
                  onClick={() => setDeferralViewMode("bar")}
                  className={`px-4 py-2 rounded-md font-semibold text-sm transition-all cursor-pointer ${deferralViewMode === "bar"
                    ? "bg-zus-green text-white shadow-md"
                    : "text-zus-grey-700 hover:bg-white"
                    }`}
                >
                  📊 Wykres słupkowy
                </button>
                <button
                  onClick={() => setDeferralViewMode("line")}
                  className={`px-4 py-2 rounded-md font-semibold text-sm transition-all cursor-pointer ${deferralViewMode === "line"
                    ? "bg-zus-green text-white shadow-md"
                    : "text-zus-grey-700 hover:bg-white"
                    }`}
                >
                  📈 Wykres liniowy
                </button>
                <button
                  onClick={() => setDeferralViewMode("table")}
                  className={`px-4 py-2 rounded-md font-semibold text-sm transition-all cursor-pointer ${deferralViewMode === "table"
                    ? "bg-zus-green text-white shadow-md"
                    : "text-zus-grey-700 hover:bg-white"
                    }`}
                >
                  📋 Tabela
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
                        `Bazowy (wiek ${inputs.age +
                        (inputs.workEndYear - new Date().getFullYear())
                        })`,
                        ...results.deferrals.map(
                          (d) =>
                            `+${d.additionalYears} ${d.additionalYears === 1
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
                            "#757575", // Bazowy - grey
                            "#00843D", // +1 - green
                            "#0088CC", // +2 - blue
                            "#F5A623", // +3 - orange
                            "#00A99D", // +4 - teal
                            "#0B4C7C", // +5 - navy
                            "#00843D", // +6 - green
                            "#0088CC", // +7 - blue
                            "#F5A623", // +8 - orange
                            "#00A99D", // +9 - teal
                            "#0B4C7C", // +10 - navy
                            "#00843D", // +11 - green
                            "#0088CC", // +12 - blue
                            "#F5A623", // +13 - orange
                            "#00A99D", // +14 - teal
                            "#0B4C7C", // +15 - navy
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
                        `Bazowy\n${inputs.age +
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
              <h3 className="text-xl font-bold text-zus-error mb-4">
                ⚠️ Twoja prognoza jest niższa od oczekiwań
              </h3>
              <div className="p-4 bg-white rounded-lg mb-4">
                <p className="text-xl font-bold text-zus-error">
                  Brakuje: {formatPLN(Math.abs(results.differenceVsExpected))}{" "}
                  miesięcznie
                </p>
              </div>
              {results.yearsNeeded !== null && (
                <div className="p-4 bg-zus-orange/20 rounded-lg">
                  <p className="font-bold text-lg">
                    💡 Aby osiągnąć oczekiwaną kwotę:
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
              className="flex-1 cursor-pointer"
            >
              📊 Przejdź do Dashboardu
            </Button>
            <Button
              onClick={() => setShowReportPreview(true)}
              variant="success"
              size="lg"
              className="flex-1 cursor-pointer"
            >
              📄 Pobierz raport (PDF)
            </Button>
          </div>
        </div>
      </main>
    </>
  );
}
