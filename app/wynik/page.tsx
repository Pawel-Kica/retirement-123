"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { Button } from "@/components/ui/Button";
import { Card } from "@/components/ui/Card";
import { PensionDisplay } from "@/components/ui/PensionDisplay";
import { useSimulation } from "@/lib/context/SimulationContext";
import { formatPLN, formatPercent, formatYears } from "@/lib/utils/formatting";
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

export default function WynikPage() {
  const router = useRouter();
  const { state } = useSimulation();
  const [deferralViewMode, setDeferralViewMode] = useState<"chart" | "table">(
    "chart"
  );

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
          <div className="flex justify-between items-center mb-6">
            <h3 className="text-xl font-bold text-zus-grey-900">
              Co jeśli będziesz pracować dłużej?
            </h3>
            <div className="flex gap-2 bg-zus-grey-100 p-1 rounded-lg">
              <button
                onClick={() => setDeferralViewMode("chart")}
                className={`px-4 py-2 rounded-md font-semibold text-sm transition-all cursor-pointer ${
                  deferralViewMode === "chart"
                    ? "bg-zus-green text-white shadow-md"
                    : "text-zus-grey-700 hover:bg-white"
                }`}
              >
                📊 Wykres
              </button>
              <button
                onClick={() => setDeferralViewMode("table")}
                className={`px-4 py-2 rounded-md font-semibold text-sm transition-all cursor-pointer ${
                  deferralViewMode === "table"
                    ? "bg-zus-green text-white shadow-md"
                    : "text-zus-grey-700 hover:bg-white"
                }`}
              >
                📋 Tabela
              </button>
            </div>
          </div>

          {deferralViewMode === "chart" ? (
            <div className="space-y-6">
              {/* Bar Chart */}
              <div className="h-[400px]">
                <Bar
                  data={{
                    labels: [
                      "Bazowy",
                      ...results.deferrals.map(
                        (d) =>
                          `+${d.additionalYears} ${
                            d.additionalYears === 1
                              ? "rok"
                              : d.additionalYears < 5
                              ? "lata"
                              : "lat"
                          }`
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

              {/* Growth Line Chart */}
              <div className="h-[300px]">
                <Line
                  data={{
                    labels: [
                      "Bazowy",
                      ...results.deferrals.map((d) => `+${d.additionalYears}`),
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
                          font: { size: 12 },
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
          ) : (
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
                    <td className="p-3 font-bold text-zus-grey-900">Bazowy</td>
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
            variant="success"
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
