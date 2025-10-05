import { useState } from "react";
import { Card } from "@/components/ui/Card";
import { Bar, Line } from "react-chartjs-2";
import { BarChart3, TrendingUp, Table } from "lucide-react";
import { formatPLN, formatYears } from "@/lib/utils/formatting";
import type { PensionResults } from "@/lib/types";

interface DeferralScenariosProps {
  results: PensionResults;
}

export function DeferralScenarios({ results }: DeferralScenariosProps) {
  const [viewMode, setViewMode] = useState<"bar" | "line" | "table">("bar");

  return (
    <Card className="mb-8">
      <div className="flex justify-between items-center mb-6">
        <h3 className="text-xl font-bold text-zus-grey-900">
          Scenariusze wydłużenia kariery
        </h3>
        <div className="flex gap-2 bg-zus-grey-100 p-1 rounded-lg">
          <button
            onClick={() => setViewMode("bar")}
            className={`px-4 py-2 rounded-md font-semibold text-sm transition-all cursor-pointer flex items-center gap-2 ${
              viewMode === "bar"
                ? "bg-zus-green text-white shadow-md"
                : "text-zus-grey-700 hover:bg-white"
            }`}
          >
            <BarChart3 className="w-4 h-4" />
            Wykres
          </button>
          <button
            onClick={() => setViewMode("line")}
            className={`px-4 py-2 rounded-md font-semibold text-sm transition-all cursor-pointer flex items-center gap-2 ${
              viewMode === "line"
                ? "bg-zus-green text-white shadow-md"
                : "text-zus-grey-700 hover:bg-white"
            }`}
          >
            <TrendingUp className="w-4 h-4" />
            Linia
          </button>
          <button
            onClick={() => setViewMode("table")}
            className={`px-4 py-2 rounded-md font-semibold text-sm transition-all cursor-pointer flex items-center gap-2 ${
              viewMode === "table"
                ? "bg-zus-green text-white shadow-md"
                : "text-zus-grey-700 hover:bg-white"
            }`}
          >
            <Table className="w-4 h-4" />
            Tabela
          </button>
        </div>
      </div>

      {viewMode === "bar" && (
        <div className="h-[400px]">
          <Bar
            data={{
              labels: [
                `Bazowy`,
                ...results.deferrals.map((d) => `+${d.additionalYears} lat`),
              ],
              datasets: [
                {
                  label: "Emerytura realna (zł)",
                  data: [
                    results.realPension,
                    ...results.deferrals.map((d) => d.realPension),
                  ],
                  backgroundColor: "#00843D",
                  borderRadius: 8,
                },
              ],
            }}
            options={{
              responsive: true,
              maintainAspectRatio: false,
              plugins: {
                legend: { display: false },
              },
              scales: {
                y: {
                  ticks: {
                    callback: (value: any) => `${(value / 1000).toFixed(0)}k zł`,
                  },
                },
              },
            }}
          />
        </div>
      )}

      {viewMode === "line" && (
        <div className="h-[400px]">
          <Line
            data={{
              labels: [
                "Bazowy",
                ...results.deferrals.map((d) => `+${d.additionalYears}`),
              ],
              datasets: [
                {
                  label: "Wzrost emerytury (%)",
                  data: [
                    0,
                    ...results.deferrals.map((d) => d.percentIncrease),
                  ],
                  borderColor: "#00843D",
                  backgroundColor: "rgba(0, 132, 61, 0.1)",
                  fill: true,
                },
              ],
            }}
            options={{
              responsive: true,
              maintainAspectRatio: false,
            }}
          />
        </div>
      )}

      {viewMode === "table" && (
        <div className="h-[400px] overflow-y-auto">
          <table className="w-full">
            <thead className="sticky top-0 bg-white z-10">
              <tr className="bg-zus-grey-100 border-b-2 border-zus-green">
                <th className="p-3 text-left font-semibold">Scenariusz</th>
                <th className="p-3 text-right font-semibold">Emerytura</th>
                <th className="p-3 text-right font-semibold">Wzrost</th>
              </tr>
            </thead>
            <tbody>
              <tr className="border-b">
                <td className="p-3 font-bold">Bazowy</td>
                <td className="p-3 text-right font-bold">
                  {formatPLN(results.realPension)}
                </td>
                <td className="p-3 text-right">-</td>
              </tr>
              {results.deferrals.map((def) => (
                <tr
                  key={def.additionalYears}
                  className="border-b hover:bg-zus-green-light"
                >
                  <td className="p-3">+{formatYears(def.additionalYears)}</td>
                  <td className="p-3 text-right font-bold text-zus-green">
                    {formatPLN(def.realPension)}
                  </td>
                  <td className="p-3 text-right text-zus-green">
                    +{def.percentIncrease.toFixed(1)}%
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}
    </Card>
  );
}
