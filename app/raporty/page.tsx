"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { Button } from "@/components/ui/Button";
import { averagePensionByYear } from "@/data/tables/averagePensionByYear";
import { cpiByYear } from "@/data/tables/cpiByYear";
import { wageGrowthByYear } from "@/data/tables/wageGrowthByYear";

type TabType = "pension" | "cpi" | "wages";

export default function RaportyPage() {
  const router = useRouter();
  const [activeTab, setActiveTab] = useState<TabType>("pension");

  const pensionData = Object.entries(averagePensionByYear).filter(
    ([key]) => key !== "_metadata"
  );
  const cpiData = Object.entries(cpiByYear).filter(
    ([key]) => key !== "_metadata"
  );
  const wagesData = Object.entries(wageGrowthByYear).filter(
    ([key]) => key !== "_metadata"
  );

  const renderTable = (
    data: [string, any][],
    valueLabel: string,
    metadata: any
  ) => {
    // Split data into chunks for multi-column layout
    const itemsPerColumn = 10;
    const columns: [string, any][][] = [];
    for (let i = 0; i < data.length; i += itemsPerColumn) {
      columns.push(data.slice(i, i + itemsPerColumn));
    }

    return (
      <div>
        <div className="mb-6 p-3 bg-gray-50 rounded border border-gray-200">
          <h3 className="text-sm font-semibold text-zus-grey-900 mb-2">
            Źródło danych
          </h3>
          <p className="text-xs text-zus-grey-700 mb-1">
            <span className="font-medium">Źródło:</span> {metadata.source}
          </p>
          <p className="text-xs text-zus-grey-700 mb-1">
            <span className="font-medium">Opis:</span> {metadata.description}
          </p>
          <p className="text-xs text-zus-grey-600">
            <span className="font-medium">Wersja:</span> {metadata.version} |{" "}
            <span className="font-medium">Data:</span> {metadata.date}
          </p>
        </div>

        <div className="overflow-x-auto">
          <table className="min-w-full">
            <thead>
              <tr className="border-b-2 border-zus-green">
                {columns.map((_, colIndex) => (
                  <>
                    <th
                      key={`year-${colIndex}`}
                      className="px-4 py-2 text-left text-sm font-semibold text-zus-grey-900"
                    >
                      Rok
                    </th>
                    <th
                      key={`value-${colIndex}`}
                      className="px-4 py-2 text-left text-sm font-semibold text-zus-grey-900"
                    >
                      {valueLabel}
                    </th>
                    {colIndex < columns.length - 1 && (
                      <th key={`spacer-${colIndex}`} className="w-8"></th>
                    )}
                  </>
                ))}
              </tr>
            </thead>
            <tbody>
              {Array.from({ length: itemsPerColumn }).map((_, rowIndex) => (
                <tr
                  key={rowIndex}
                  className={`border-b border-gray-200 ${
                    rowIndex % 2 === 0 ? "bg-white" : "bg-gray-50"
                  }`}
                >
                  {columns.map((column, colIndex) => {
                    const item = column[rowIndex];
                    if (!item) {
                      return (
                        <>
                          <td key={`empty-year-${colIndex}`}></td>
                          <td key={`empty-value-${colIndex}`}></td>
                          {colIndex < columns.length - 1 && (
                            <td key={`empty-spacer-${colIndex}`}></td>
                          )}
                        </>
                      );
                    }
                    const [year, value] = item;
                    return (
                      <>
                        <td
                          key={`year-${colIndex}`}
                          className="px-4 py-2 text-sm text-zus-grey-800"
                        >
                          {year}
                        </td>
                        <td
                          key={`value-${colIndex}`}
                          className="px-4 py-2 text-sm text-zus-grey-800"
                        >
                          {typeof value === "number"
                            ? value.toLocaleString("pl-PL", {
                                minimumFractionDigits: 2,
                                maximumFractionDigits: 3,
                              })
                            : value}
                        </td>
                        {colIndex < columns.length - 1 && (
                          <td
                            key={`spacer-${colIndex}`}
                            className="border-r border-gray-300"
                          ></td>
                        )}
                      </>
                    );
                  })}
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>
    );
  };

  return (
    <main className="min-h-screen bg-gradient-to-b from-gray-50 to-gray-100">
      <div className="container mx-auto px-4 sm:px-6 lg:px-8 max-w-[1400px] py-8">
        <h1 className="text-4xl font-bold text-zus-grey-900 mb-6 text-center">
          Raporty Danych
        </h1>

        <div className="bg-white rounded-lg shadow-md p-6 mb-6">
          {/* Tabs */}
          <div className="border-b border-gray-200 mb-6">
            <nav className="flex space-x-8" aria-label="Tabs">
              <button
                onClick={() => setActiveTab("pension")}
                className={`py-4 px-1 border-b-2 font-medium text-sm transition-colors ${
                  activeTab === "pension"
                    ? "border-zus-green text-zus-green"
                    : "border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300"
                }`}
              >
                Średnia Emerytura
              </button>
              <button
                onClick={() => setActiveTab("cpi")}
                className={`py-4 px-1 border-b-2 font-medium text-sm transition-colors ${
                  activeTab === "cpi"
                    ? "border-zus-green text-zus-green"
                    : "border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300"
                }`}
              >
                Wskaźnik CPI
              </button>
              <button
                onClick={() => setActiveTab("wages")}
                className={`py-4 px-1 border-b-2 font-medium text-sm transition-colors ${
                  activeTab === "wages"
                    ? "border-zus-green text-zus-green"
                    : "border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300"
                }`}
              >
                Wzrost Wynagrodzeń
              </button>
            </nav>
          </div>

          {/* Table Content */}
          {activeTab === "pension" &&
            renderTable(
              pensionData,
              "Średnia emerytura (PLN)",
              averagePensionByYear._metadata
            )}
          {activeTab === "cpi" &&
            renderTable(
              cpiData,
              "Wskaźnik CPI",
              cpiByYear._metadata
            )}
          {activeTab === "wages" &&
            renderTable(
              wagesData,
              "Wzrost wynagrodzeń",
              wageGrowthByYear._metadata
            )}
        </div>

        {/* Back Button */}
        <div className="flex justify-center">
          <Button
            onClick={() => router.back()}
            variant="secondary"
            size="lg"
            className="min-w-[200px]"
          >
            Powrót
          </Button>
        </div>
      </div>
    </main>
  );
}
