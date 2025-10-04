"use client";

import { useEffect } from "react";
import { useRouter } from "next/navigation";
import { Button } from "@/components/ui/Button";
import { Card } from "@/components/ui/Card";
import { useSimulation } from "@/lib/context/SimulationContext";
import { formatPLN, formatPercent, formatYears } from "@/lib/utils/formatting";

export default function WynikPage() {
  const router = useRouter();
  const { state } = useSimulation();

  useEffect(() => {
    if (!state.results) {
      router.push("/symulacja");
    }
  }, [state.results, router]);

  if (!state.results || !state.inputs) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        Ładowanie...
      </div>
    );
  }

  const { results, inputs, expectedPension } = state;

  return (
    <main className="min-h-screen bg-gradient-to-b from-gray-50 to-gray-100 py-12">
      <div className="container mx-auto px-4 sm:px-6 lg:px-8 max-w-7xl">
        <h1 className="text-4xl font-bold text-zus-grey-900 mb-8 text-center">
          Twoja Prognoza Emerytury
        </h1>

        {/* Main Results */}
        <div className="grid md:grid-cols-2 gap-6 mb-8">
          <Card>
            <h3 className="text-sm text-gray-600 mb-2">
              Twoja emerytura w {inputs.workEndYear} roku
            </h3>
            <div className="text-3xl font-bold text-zus-grey-900">
              {formatPLN(results.nominalPension)}
            </div>
            <p className="text-xs text-gray-500 mt-1">
              (w cenach z {inputs.workEndYear} roku)
            </p>
          </Card>

          <Card variant="highlight">
            <div className="flex items-center gap-2 mb-2">
              <span className="text-sm font-bold text-zus-green">
                ⭐ W DZISIEJSZYCH ZŁOTYCH
              </span>
            </div>
            <div className="text-5xl font-bold text-zus-green">
              {formatPLN(results.realPension)}
            </div>
            <p className="text-sm text-gray-700 mt-2">
              Porównywalna do dzisiejszych kosztów życia
            </p>
          </Card>
        </div>

        {/* Comparisons */}
        <Card className="mb-8">
          <h3 className="text-xl font-bold text-zus-grey-900 mb-4">
            Porównania i wskaźniki
          </h3>

          <div className="grid md:grid-cols-3 gap-6">
            <div>
              <p className="text-sm text-gray-600 mb-1">Stopa zastąpienia</p>
              <p className="text-3xl font-bold text-zus-blue">
                {results.replacementRate}%
              </p>
            </div>

            <div>
              <p className="text-sm text-gray-600 mb-1">
                Vs średnia w {inputs.workEndYear}
              </p>
              <p
                className={`text-3xl font-bold ${
                  results.differenceVsAverage >= 0
                    ? "text-zus-green"
                    : "text-zus-error"
                }`}
              >
                {results.differenceVsAverage >= 0 ? "+" : ""}
                {formatPLN(results.differenceVsAverage)}
              </p>
            </div>

            <div>
              <p className="text-sm text-gray-600 mb-1">Vs Twoje oczekiwania</p>
              <p
                className={`text-3xl font-bold ${
                  results.differenceVsExpected >= 0
                    ? "text-zus-green"
                    : "text-zus-error"
                }`}
              >
                {results.differenceVsExpected >= 0 ? "+" : ""}
                {formatPLN(results.differenceVsExpected)}
              </p>
            </div>
          </div>
        </Card>

        {/* L4 Impact */}
        {inputs.includeL4 && (
          <Card className="mb-8 border-l-4 border-zus-error">
            <h3 className="text-xl font-bold text-zus-grey-900 mb-4">
              Wpływ zwolnień lekarskich na emeryturę
            </h3>
            <div className="grid md:grid-cols-2 gap-4">
              <div className="p-4 bg-zus-green/10 rounded-lg">
                <span className="text-sm text-gray-600">Bez L4</span>
                <div className="text-2xl font-bold text-zus-green">
                  {formatPLN(results.withoutL4.realPension)}
                </div>
              </div>
              <div className="p-4 bg-zus-error/10 rounded-lg">
                <span className="text-sm text-gray-600">
                  Z uwzględnieniem L4
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

        {/* Deferral Scenarios */}
        <Card className="mb-8">
          <h3 className="text-xl font-bold text-zus-grey-900 mb-4">
            Co jeśli będziesz pracować dłużej?
          </h3>
          <div className="overflow-x-auto">
            <table className="w-full">
              <thead>
                <tr className="bg-zus-grey-300/20">
                  <th className="p-3 text-left">Scenariusz</th>
                  <th className="p-3 text-right">Rok przejścia</th>
                  <th className="p-3 text-right">Emerytura</th>
                  <th className="p-3 text-right">Wzrost</th>
                </tr>
              </thead>
              <tbody>
                <tr className="border-b">
                  <td className="p-3 font-bold">Bazowy</td>
                  <td className="p-3 text-right">{inputs.workEndYear}</td>
                  <td className="p-3 text-right font-bold">
                    {formatPLN(results.realPension)}
                  </td>
                  <td className="p-3 text-right">-</td>
                </tr>
                {results.deferrals.map((def) => (
                  <tr
                    key={def.additionalYears}
                    className="border-b hover:bg-gray-50"
                  >
                    <td className="p-3">+{formatYears(def.additionalYears)}</td>
                    <td className="p-3 text-right">{def.retirementYear}</td>
                    <td className="p-3 text-right font-bold text-zus-green">
                      {formatPLN(def.realPension)}
                    </td>
                    <td className="p-3 text-right text-zus-green font-bold">
                      +{formatPLN(def.increaseVsBase)}
                      <br />
                      <span className="text-xs">
                        ({def.percentIncrease.toFixed(1)}%)
                      </span>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
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

        {results.differenceVsExpected >= 0 && (
          <Card variant="highlight" className="mb-8">
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

        {/* Actions */}
        <div className="flex flex-col md:flex-row gap-4">
          <Button
            onClick={() => router.push("/dashboard")}
            variant="secondary"
            size="lg"
            className="flex-1"
          >
            📊 Przejdź do Dashboardu
          </Button>
          <Button
            onClick={() => alert("Funkcja PDF w przygotowaniu")}
            size="lg"
            className="flex-1"
          >
            📄 Pobierz raport (PDF)
          </Button>
        </div>
      </div>
    </main>
  );
}
