"use client";

import { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import { Button } from "@/components/ui/Button";
import { Card } from "@/components/ui/Card";
import { HistoryButton } from "@/components/ui/HistoryButton";
import { useSimulation } from "@/lib/context/SimulationContext";
import { formatPLN } from "@/lib/utils/formatting";
import {
  Chart as ChartJS,
  CategoryScale,
  LinearScale,
  BarElement,
  LineElement,
  PointElement,
  ArcElement,
  Title,
  Tooltip,
  Legend,
  Filler,
} from "chart.js";
import { Line, Bar, Doughnut } from "react-chartjs-2";

// Register Chart.js components
ChartJS.register(
  CategoryScale,
  LinearScale,
  BarElement,
  LineElement,
  PointElement,
  ArcElement,
  Title,
  Tooltip,
  Legend,
  Filler
);

interface EditableSalary {
  year: number;
  value: number;
  isEditing: boolean;
}

interface L4Event {
  year: number;
  days: number;
}

export default function DashboardPage() {
  const router = useRouter();
  const { state, updateDashboardModifications, recalculate, isCalculating } =
    useSimulation();

  const [activeTab, setActiveTab] = useState<
    "overview" | "salaries" | "l4" | "scenarios"
  >("overview");
  const [editableSalaries, setEditableSalaries] = useState<EditableSalary[]>(
    []
  );
  const [l4Events, setL4Events] = useState<L4Event[]>([]);
  const [newL4Year, setNewL4Year] = useState<number | null>(null);
  const [newL4Days, setNewL4Days] = useState<number>(30);

  useEffect(() => {
    if (!state.results) {
      router.push("/symulacja");
    }
  }, [state.results, router]);

  // Initialize editable salaries
  useEffect(() => {
    if (state.results?.salaryPath) {
      const editable = state.results.salaryPath
        .filter((entry) => entry.isFuture)
        .map((entry) => ({
          year: entry.year,
          value:
            state.dashboardModifications.customSalaries[entry.year] ||
            entry.monthlyGross,
          isEditing: false,
        }));
      setEditableSalaries(editable);
    }
  }, [state.results, state.dashboardModifications]);

  // Initialize L4 events
  useEffect(() => {
    if (state.dashboardModifications.customL4Periods) {
      setL4Events(state.dashboardModifications.customL4Periods);
    }
  }, [state.dashboardModifications]);

  if (!state.results || !state.inputs) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-zus-grey-100">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-zus-green mx-auto mb-4"></div>
          <p className="text-zus-grey-700">Ładowanie...</p>
        </div>
      </div>
    );
  }

  const handleSalaryEdit = (year: number, newValue: number) => {
    const updated = { ...state.dashboardModifications.customSalaries };
    updated[year] = newValue;
    updateDashboardModifications({ customSalaries: updated });
  };

  const handleAddL4Event = () => {
    if (newL4Year && newL4Days > 0) {
      const newEvent = { year: newL4Year, days: newL4Days };
      const updated = [...l4Events, newEvent].sort((a, b) => a.year - b.year);
      setL4Events(updated);
      updateDashboardModifications({ customL4Periods: updated });
      setNewL4Year(null);
      setNewL4Days(30);
    }
  };

  const handleRemoveL4Event = (year: number) => {
    const updated = l4Events.filter((e) => e.year !== year);
    setL4Events(updated);
    updateDashboardModifications({ customL4Periods: updated });
  };

  const handleRecalculate = async () => {
    await recalculate();
  };

  // Prepare chart data
  const capitalChartData = {
    labels: state.results.capitalPath.slice(0, 30).map((e) => e.year),
    datasets: [
      {
        label: "Kapitał główny",
        data: state.results.capitalPath
          .slice(0, 30)
          .map((e) => e.mainAccountAfter),
        borderColor: "#00843D",
        backgroundColor: "rgba(0, 132, 61, 0.1)",
        fill: true,
        tension: 0.4,
      },
      {
        label: "Subkonto",
        data: state.results.capitalPath
          .slice(0, 30)
          .map((e) => e.subAccountAfter),
        borderColor: "#0088CC",
        backgroundColor: "rgba(0, 136, 204, 0.1)",
        fill: true,
        tension: 0.4,
      },
    ],
  };

  const salaryChartData = {
    labels: state.results.salaryPath.slice(0, 30).map((e) => e.year),
    datasets: [
      {
        label: "Wynagrodzenie miesięczne brutto",
        data: state.results.salaryPath.slice(0, 30).map((e) => e.monthlyGross),
        backgroundColor: state.results.salaryPath
          .slice(0, 30)
          .map((e) =>
            e.isHistorical ? "#757575" : e.isCurrentYear ? "#F5A623" : "#00843D"
          ),
        borderRadius: 6,
      },
    ],
  };

  const deferralChartData = {
    labels: state.results.deferrals.map(
      (d) => `+${d.additionalYears} ${d.additionalYears === 1 ? "rok" : "lata"}`
    ),
    datasets: [
      {
        label: "Emerytura realna",
        data: state.results.deferrals.map((d) => d.realPension),
        backgroundColor: [
          "#00843D",
          "#0088CC",
          "#F5A623",
          "#00A99D",
          "#0B4C7C",
        ],
        borderWidth: 0,
      },
    ],
  };

  const chartOptions = {
    responsive: true,
    maintainAspectRatio: false,
    plugins: {
      legend: {
        position: "top" as const,
        labels: {
          color: "#424242",
          font: { size: 12, weight: "600" as const },
          padding: 16,
        },
      },
      tooltip: {
        backgroundColor: "#FFFFFF",
        titleColor: "#212121",
        bodyColor: "#424242",
        borderColor: "#E0E0E0",
        borderWidth: 2,
        padding: 12,
        titleFont: { size: 14, weight: "bold" as const },
        bodyFont: { size: 12 },
        callbacks: {
          label: function (context: any) {
            let label = context.dataset.label || "";
            if (label) {
              label += ": ";
            }
            label += formatPLN(context.parsed.y);
            return label;
          },
        },
      },
    },
    scales: {
      y: {
        beginAtZero: true,
        ticks: {
          color: "#757575",
          callback: function (value: any) {
            return (value / 1000).toFixed(0) + "k";
          },
        },
        grid: {
          color: "#E0E0E0",
        },
      },
      x: {
        ticks: {
          color: "#757575",
        },
        grid: {
          display: false,
        },
      },
    },
  };

  const doughnutOptions = {
    responsive: true,
    maintainAspectRatio: false,
    plugins: {
      legend: {
        position: "right" as const,
        labels: {
          color: "#424242",
          font: { size: 12 },
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
            return context.label + ": " + formatPLN(context.parsed);
          },
        },
      },
    },
  };

  // Available years for L4 input
  const availableYears =
    state.results.salaryPath
      .filter((e) => e.isFuture || e.isCurrentYear)
      .map((e) => e.year) || [];

  return (
    <main className="min-h-screen bg-zus-grey-100 py-8">
      <div className="container mx-auto px-4 sm:px-6 lg:px-8 max-w-7xl relative">
        {/* History Button - Top Right */}
        <div className="absolute top-0 right-4 sm:right-6 lg:right-8 z-30">
          <HistoryButton />
        </div>

        {/* Header */}
        <div className="mb-6">
          <button
            onClick={() => router.push("/wynik")}
            className="text-zus-green hover:text-zus-green-dark mb-4 flex items-center gap-2 font-medium transition-colors cursor-pointer"
          >
            <svg
              className="w-5 h-5"
              fill="none"
              stroke="currentColor"
              viewBox="0 0 24 24"
            >
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeWidth={2}
                d="M15 19l-7-7 7-7"
              />
            </svg>
            Powrót do wyników
          </button>
          <h1 className="text-4xl font-bold text-zus-grey-900 mb-2">
            Dashboard - Zaawansowana Analiza
          </h1>
          <p className="text-zus-grey-700">
            Modyfikuj parametry symulacji i obserwuj zmiany w czasie
            rzeczywistym
          </p>
        </div>

        {/* Tabs */}
        <div className="flex gap-2 mb-6 flex-wrap">
          <button
            onClick={() => setActiveTab("overview")}
            className={`px-6 py-3 rounded-lg font-semibold transition-all cursor-pointer ${
              activeTab === "overview"
                ? "bg-zus-green text-white shadow-md"
                : "bg-white text-zus-grey-700 hover:bg-zus-green-light"
            }`}
          >
            📊 Przegląd
          </button>
          <button
            onClick={() => setActiveTab("salaries")}
            className={`px-6 py-3 rounded-lg font-semibold transition-all cursor-pointer ${
              activeTab === "salaries"
                ? "bg-zus-green text-white shadow-md"
                : "bg-white text-zus-grey-700 hover:bg-zus-green-light"
            }`}
          >
            💰 Wynagrodzenia
          </button>
          <button
            onClick={() => setActiveTab("l4")}
            className={`px-6 py-3 rounded-lg font-semibold transition-all cursor-pointer ${
              activeTab === "l4"
                ? "bg-zus-green text-white shadow-md"
                : "bg-white text-zus-grey-700 hover:bg-zus-green-light"
            }`}
          >
            🏥 Zwolnienia L4
          </button>
          <button
            onClick={() => setActiveTab("scenarios")}
            className={`px-6 py-3 rounded-lg font-semibold transition-all cursor-pointer ${
              activeTab === "scenarios"
                ? "bg-zus-green text-white shadow-md"
                : "bg-white text-zus-grey-700 hover:bg-zus-green-light"
            }`}
          >
            🔄 Scenariusze
          </button>
        </div>

        {/* Overview Tab */}
        {activeTab === "overview" && (
          <div className="space-y-6">
            {/* Key Metrics */}
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
              <Card className="bg-white border border-zus-grey-300">
                <div className="text-center">
                  <p className="text-sm text-zus-grey-500 mb-1">
                    Emerytura nominalna
                  </p>
                  <p className="text-3xl font-bold text-zus-grey-900">
                    {formatPLN(state.results.nominalPension)}
                  </p>
                </div>
              </Card>
              <Card className="bg-white border border-zus-grey-300">
                <div className="text-center">
                  <p className="text-sm text-zus-grey-500 mb-1">
                    Emerytura realna
                  </p>
                  <p className="text-3xl font-bold text-zus-green">
                    {formatPLN(state.results.realPension)}
                  </p>
                </div>
              </Card>
              <Card className="bg-white border border-zus-grey-300">
                <div className="text-center">
                  <p className="text-sm text-zus-grey-500 mb-1">
                    Stopa zastąpienia
                  </p>
                  <p className="text-3xl font-bold text-zus-navy">
                    {state.results.replacementRate.toFixed(1)}%
                  </p>
                </div>
              </Card>
            </div>

            {/* Capital Growth Chart */}
            <Card className="bg-white border border-zus-grey-300">
              <h3 className="text-2xl font-bold text-zus-grey-900 mb-4">
                Wzrost kapitału emerytalnego
              </h3>
              <div className="h-[400px]">
                <Line data={capitalChartData} options={chartOptions} />
              </div>
            </Card>

            {/* Salary Path Chart */}
            <Card className="bg-white border border-zus-grey-300">
              <h3 className="text-2xl font-bold text-zus-grey-900 mb-4">
                Ścieżka wynagrodzeń
              </h3>
              <div className="h-[400px]">
                <Bar data={salaryChartData} options={chartOptions} />
              </div>
              <div className="flex gap-4 justify-center mt-4 text-sm">
                <div className="flex items-center gap-2">
                  <div className="w-4 h-4 bg-zus-grey-500 rounded"></div>
                  <span className="text-zus-grey-700">Historia</span>
                </div>
                <div className="flex items-center gap-2">
                  <div className="w-4 h-4 bg-zus-orange rounded"></div>
                  <span className="text-zus-grey-700">Obecnie</span>
                </div>
                <div className="flex items-center gap-2">
                  <div className="w-4 h-4 bg-zus-green rounded"></div>
                  <span className="text-zus-grey-700">Prognoza</span>
                </div>
              </div>
            </Card>

            {/* Deferral Scenarios */}
            <Card className="bg-white border border-zus-grey-300">
              <h3 className="text-2xl font-bold text-zus-grey-900 mb-4">
                Odroczenie emerytury - porównanie
              </h3>
              <div className="grid md:grid-cols-2 gap-6">
                <div className="h-[300px]">
                  <Doughnut
                    data={deferralChartData}
                    options={doughnutOptions}
                  />
                </div>
                <div className="space-y-3">
                  {state.results.deferrals.map((def, idx) => (
                    <div
                      key={idx}
                      className="p-4 bg-zus-grey-100 rounded-lg border border-zus-grey-300"
                    >
                      <div className="flex justify-between items-center mb-2">
                        <span className="font-semibold text-zus-grey-900">
                          Odroczenie o {def.additionalYears}{" "}
                          {def.additionalYears === 1 ? "rok" : "lata"}
                        </span>
                        <span className="text-sm text-zus-grey-500">
                          Wiek: {def.retirementAge}
                        </span>
                      </div>
                      <div className="text-2xl font-bold text-zus-green mb-1">
                        {formatPLN(def.realPension)}
                      </div>
                      <div className="text-sm text-zus-grey-700">
                        Wzrost: +{def.percentIncrease.toFixed(1)}% (
                        {formatPLN(def.increaseVsBase)})
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            </Card>
          </div>
        )}

        {/* Salaries Tab */}
        {activeTab === "salaries" && (
          <div className="space-y-6">
            <Card className="bg-white border border-zus-grey-300">
              <h3 className="text-2xl font-bold text-zus-grey-900 mb-4">
                Edytuj przyszłe wynagrodzenia
              </h3>
              <p className="text-sm text-zus-grey-700 mb-6">
                Zmień prognozowane wynagrodzenia, aby zobaczyć wpływ na Twoją
                emeryturę. Kliknij "Przelicz ponownie" aby zaktualizować wyniki.
              </p>
              <div className="overflow-x-auto">
                <table className="w-full">
                  <thead>
                    <tr className="bg-zus-grey-100 border-b-2 border-zus-green">
                      <th className="p-3 text-left text-zus-grey-900 font-semibold">
                        Rok
                      </th>
                      <th className="p-3 text-left text-zus-grey-900 font-semibold">
                        Wiek
                      </th>
                      <th className="p-3 text-right text-zus-grey-900 font-semibold">
                        Wynagrodzenie miesięczne brutto
                      </th>
                      <th className="p-3 text-center text-zus-grey-900 font-semibold">
                        Akcje
                      </th>
                    </tr>
                  </thead>
                  <tbody>
                    {editableSalaries.map((item) => {
                      const pathEntry = state.results!.salaryPath.find(
                        (e) => e.year === item.year
                      );
                      return (
                        <tr
                          key={item.year}
                          className="border-b border-zus-grey-300 hover:bg-zus-green-light transition-colors"
                        >
                          <td className="p-3 font-bold text-zus-grey-900">
                            {item.year}
                          </td>
                          <td className="p-3 text-zus-grey-700">
                            {pathEntry?.age}
                          </td>
                          <td className="p-3 text-right">
                            {item.isEditing ? (
                              <input
                                type="number"
                                value={item.value}
                                onChange={(e) => {
                                  const updated = editableSalaries.map((s) =>
                                    s.year === item.year
                                      ? { ...s, value: Number(e.target.value) }
                                      : s
                                  );
                                  setEditableSalaries(updated);
                                }}
                                className="w-32 p-2 border-2 border-zus-green rounded-lg text-right focus:outline-none focus:ring-2 focus:ring-zus-green"
                                autoFocus
                              />
                            ) : (
                              <span className="font-semibold text-zus-grey-900">
                                {formatPLN(item.value)}
                              </span>
                            )}
                          </td>
                          <td className="p-3 text-center">
                            {item.isEditing ? (
                              <div className="flex gap-2 justify-center">
                                <button
                                  onClick={() => {
                                    handleSalaryEdit(item.year, item.value);
                                    const updated = editableSalaries.map((s) =>
                                      s.year === item.year
                                        ? { ...s, isEditing: false }
                                        : s
                                    );
                                    setEditableSalaries(updated);
                                  }}
                                  className="px-3 py-1 bg-zus-green text-white rounded-lg text-sm font-semibold hover:bg-zus-green-dark transition-colors cursor-pointer"
                                >
                                  ✓
                                </button>
                                <button
                                  onClick={() => {
                                    const updated = editableSalaries.map((s) =>
                                      s.year === item.year
                                        ? {
                                            ...s,
                                            value:
                                              state.dashboardModifications
                                                .customSalaries[item.year] ||
                                              pathEntry?.monthlyGross ||
                                              s.value,
                                            isEditing: false,
                                          }
                                        : s
                                    );
                                    setEditableSalaries(updated);
                                  }}
                                  className="px-3 py-1 bg-zus-grey-300 text-zus-grey-900 rounded-lg text-sm font-semibold hover:bg-zus-grey-500 hover:text-white transition-colors cursor-pointer"
                                >
                                  ✗
                                </button>
                              </div>
                            ) : (
                              <button
                                onClick={() => {
                                  const updated = editableSalaries.map((s) =>
                                    s.year === item.year
                                      ? { ...s, isEditing: true }
                                      : { ...s, isEditing: false }
                                  );
                                  setEditableSalaries(updated);
                                }}
                                className="px-3 py-1 bg-zus-navy text-white rounded-lg text-sm font-semibold hover:bg-zus-navy-dark transition-colors cursor-pointer"
                              >
                                Edytuj
                              </button>
                            )}
                          </td>
                        </tr>
                      );
                    })}
                  </tbody>
                </table>
              </div>
            </Card>

            <div className="flex justify-center">
              <Button
                onClick={handleRecalculate}
                disabled={isCalculating}
                size="lg"
                className="px-8"
              >
                {isCalculating ? "Przeliczam..." : "🔄 Przelicz ponownie"}
              </Button>
            </div>
          </div>
        )}

        {/* L4 Tab */}
        {activeTab === "l4" && (
          <div className="space-y-6">
            <Card className="bg-white border border-zus-grey-300">
              <h3 className="text-2xl font-bold text-zus-grey-900 mb-4">
                Zarządzanie zwolnieniami L4
              </h3>
              <p className="text-sm text-zus-grey-700 mb-6">
                Dodaj lub usuń zwolnienia chorobowe, aby zobaczyć ich wpływ na
                Twoją emeryturę. Każdy dzień L4 zmniejsza składki emerytalne.
              </p>

              {/* Add new L4 event */}
              <div className="bg-zus-green-light p-6 rounded-lg mb-6">
                <h4 className="font-semibold text-zus-grey-900 mb-4">
                  Dodaj nowe zwolnienie
                </h4>
                <div className="grid md:grid-cols-3 gap-4">
                  <div>
                    <label className="block text-sm font-semibold text-zus-grey-900 mb-2">
                      Rok
                    </label>
                    <select
                      value={newL4Year || ""}
                      onChange={(e) => setNewL4Year(Number(e.target.value))}
                      className="w-full p-3 border-2 border-zus-grey-300 rounded-lg focus:border-zus-green focus:outline-none"
                    >
                      <option value="">Wybierz rok</option>
                      {availableYears.map((year) => (
                        <option key={year} value={year}>
                          {year}
                        </option>
                      ))}
                    </select>
                  </div>
                  <div>
                    <label className="block text-sm font-semibold text-zus-grey-900 mb-2">
                      Liczba dni
                    </label>
                    <input
                      type="number"
                      min="1"
                      max="365"
                      value={newL4Days}
                      onChange={(e) => setNewL4Days(Number(e.target.value))}
                      className="w-full p-3 border-2 border-zus-grey-300 rounded-lg focus:border-zus-green focus:outline-none"
                    />
                  </div>
                  <div className="flex items-end">
                    <Button
                      onClick={handleAddL4Event}
                      disabled={!newL4Year || newL4Days <= 0}
                      className="w-full"
                    >
                      Dodaj zwolnienie
                    </Button>
                  </div>
                </div>
              </div>

              {/* Current L4 events */}
              <div>
                <h4 className="font-semibold text-zus-grey-900 mb-4">
                  Aktualne zwolnienia ({l4Events.length})
                </h4>
                {l4Events.length === 0 ? (
                  <p className="text-zus-grey-500 text-center py-8">
                    Brak zwolnień chorobowych
                  </p>
                ) : (
                  <div className="space-y-3">
                    {l4Events.map((event) => (
                      <div
                        key={event.year}
                        className="flex items-center justify-between p-4 bg-zus-grey-100 rounded-lg border border-zus-grey-300"
                      >
                        <div>
                          <span className="font-bold text-zus-grey-900">
                            Rok {event.year}
                          </span>
                          <span className="text-zus-grey-700 ml-4">
                            {event.days} {event.days === 1 ? "dzień" : "dni"}
                          </span>
                        </div>
                        <button
                          onClick={() => handleRemoveL4Event(event.year)}
                          className="px-4 py-2 bg-zus-error text-white rounded-lg text-sm font-semibold hover:opacity-80 transition-opacity cursor-pointer"
                        >
                          Usuń
                        </button>
                      </div>
                    ))}
                  </div>
                )}
              </div>
            </Card>

            {/* L4 Impact Summary */}
            {state.inputs.includeL4 && (
              <Card className="bg-white border border-zus-grey-300">
                <h3 className="text-2xl font-bold text-zus-grey-900 mb-4">
                  Wpływ zwolnień na emeryturę
                </h3>
                <div className="grid md:grid-cols-2 gap-6">
                  <div className="text-center p-6 bg-zus-grey-100 rounded-lg">
                    <p className="text-sm text-zus-grey-700 mb-2">
                      Emerytura bez L4
                    </p>
                    <p className="text-3xl font-bold text-zus-green">
                      {formatPLN(state.results.withoutL4.realPension)}
                    </p>
                  </div>
                  <div className="text-center p-6 bg-zus-grey-100 rounded-lg">
                    <p className="text-sm text-zus-grey-700 mb-2">
                      Emerytura z L4
                    </p>
                    <p className="text-3xl font-bold text-zus-orange">
                      {formatPLN(state.results.withL4.realPension)}
                    </p>
                  </div>
                </div>
                <div className="mt-6 text-center p-4 bg-zus-error/10 rounded-lg border border-zus-error">
                  <p className="text-sm text-zus-grey-700 mb-1">
                    Różnica (strata)
                  </p>
                  <p className="text-2xl font-bold text-zus-error">
                    -{formatPLN(Math.abs(state.results.l4Difference))}
                  </p>
                </div>
              </Card>
            )}

            <div className="flex justify-center">
              <Button
                onClick={handleRecalculate}
                disabled={isCalculating}
                size="lg"
                className="px-8"
              >
                {isCalculating ? "Przeliczam..." : "🔄 Przelicz ponownie"}
              </Button>
            </div>
          </div>
        )}

        {/* Scenarios Tab */}
        {activeTab === "scenarios" && (
          <div className="space-y-6">
            <Card className="bg-white border border-zus-grey-300">
              <h3 className="text-2xl font-bold text-zus-grey-900 mb-4">
                Scenariusze A/B
              </h3>
              <p className="text-sm text-zus-grey-700 mb-6">
                Zapisz różne warianty symulacji i porównuj je między sobą.
                Funkcja w przygotowaniu.
              </p>
              <div className="bg-zus-grey-100 p-8 rounded-lg text-center">
                <p className="text-zus-grey-700">
                  🚧 Ta funkcja będzie dostępna wkrótce
                </p>
              </div>
            </Card>
          </div>
        )}

        {/* Bottom Actions */}
        <div className="flex gap-4 mt-8">
          <Button
            onClick={() => router.push("/wynik")}
            variant="ghost"
            size="lg"
            className="flex-1"
          >
            Powrót do wyników
          </Button>
          <Button
            onClick={() => router.push("/symulacja")}
            variant="ghost"
            size="lg"
            className="flex-1"
          >
            Nowa symulacja
          </Button>
        </div>
      </div>
    </main>
  );
}
