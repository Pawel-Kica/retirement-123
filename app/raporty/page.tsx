"use client";

import React, { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import { getAveragePensionByYear } from "@/data/tables/averagePensionByYear";
import { getCpiByYear } from "@/data/tables/cpiByYear";
import { getWageGrowthByYear } from "@/data/tables/wageGrowthByYear";

type TabType = "pension" | "cpi" | "wages";

interface DataState {
  pensionData: [string, any][];
  cpiData: [string, any][];
  wagesData: [string, any][];
  pensionMetadata: any;
  cpiMetadata: any;
  wagesMetadata: any;
  loading: boolean;
}

export default function RaportyPage() {
  const router = useRouter();
  const [activeTab, setActiveTab] = useState<TabType>("pension");
  const [dataState, setDataState] = useState<DataState>({
    pensionData: [],
    cpiData: [],
    wagesData: [],
    pensionMetadata: {},
    cpiMetadata: {},
    wagesMetadata: {},
    loading: true,
  });

  useEffect(() => {
    const loadData = async () => {
      try {
        const [pensionData, cpiData, wagesData] = await Promise.all([
          getAveragePensionByYear(),
          getCpiByYear(),
          getWageGrowthByYear(),
        ]);

        setDataState({
          pensionData: Object.entries(pensionData).filter(
            ([key]) => key !== "_metadata"
          ),
          cpiData: Object.entries(cpiData).filter(
            ([key]) => key !== "_metadata"
          ),
          wagesData: Object.entries(wagesData).filter(
            ([key]) => key !== "_metadata"
          ),
          pensionMetadata: pensionData._metadata,
          cpiMetadata: cpiData._metadata,
          wagesMetadata: wagesData._metadata,
          loading: false,
        });
      } catch (error) {
        console.error("Error loading data:", error);
        setDataState(prev => ({ ...prev, loading: false }));
      }
    };

    loadData();
  }, []);

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
        <div className="mb-6 p-4 bg-blue-50 rounded border border-blue-200">
          <h3 className="text-base font-semibold text-zus-grey-900 mb-2">
            Źródło danych
          </h3>
          <p className="text-sm text-zus-grey-700 mb-1">
            <span className="font-medium">Źródło:</span> {metadata.source}
          </p>
          <p className="text-sm text-zus-grey-700 mb-1">
            <span className="font-medium">Opis:</span> {metadata.description}
          </p>
          <p className="text-sm text-zus-grey-600 mb-2">
            <span className="font-medium">Wersja:</span> {metadata.version} |{" "}
            <span className="font-medium">Data:</span> {metadata.date}
          </p>
          {metadata.officialDocument && (
            <p className="text-sm text-zus-grey-600">
              <span className="font-medium">Dokument oficjalny:</span>{" "}
              <a
                href={metadata.officialDocument}
                target="_blank"
                rel="noopener noreferrer"
                className="text-zus-green hover:text-zus-green-700 underline"
              >
                ZUS - Prognoza wpływów i wydatków Funduszu Emerytalnego do 2080 roku
              </a>
            </p>
          )}
        </div>

        <div className="overflow-x-auto">
          <table
            className="min-w-full"
            role="table"
            aria-label={metadata.description}
          >
            <thead>
              <tr className="bg-gray-50 border-b-2 border-zus-green">
                {columns.map((_, colIndex) => (
                  <React.Fragment key={`header-${colIndex}`}>
                    <th
                      scope="col"
                      className="px-4 py-3 text-left text-base font-bold text-zus-grey-900"
                    >
                      Rok
                    </th>
                    <th
                      scope="col"
                      className="px-4 py-3 text-left text-base font-bold text-zus-grey-900"
                    >
                      {valueLabel}
                    </th>
                    {colIndex < columns.length - 1 && <th className="w-8"></th>}
                  </React.Fragment>
                ))}
              </tr>
            </thead>
            <tbody>
              {Array.from({ length: itemsPerColumn }).map((_, rowIndex) => (
                <tr
                  key={rowIndex}
                  className={`border-b border-gray-200 hover:bg-gray-100 transition-colors ${
                    rowIndex % 2 === 0 ? "bg-white" : "bg-gray-50"
                  }`}
                >
                  {columns.map((column, colIndex) => {
                    const item = column[rowIndex];
                    if (!item) {
                      return (
                        <React.Fragment key={`empty-${rowIndex}-${colIndex}`}>
                          <td></td>
                          <td></td>
                          {colIndex < columns.length - 1 && <td></td>}
                        </React.Fragment>
                      );
                    }
                    const [year, value] = item;
                    return (
                      <React.Fragment key={`data-${rowIndex}-${colIndex}`}>
                        <td className="px-4 py-3 text-base text-zus-grey-800">
                          {year}
                        </td>
                        <td className="px-4 py-3 text-base text-zus-grey-800">
                          {typeof value === "number"
                            ? value.toLocaleString("pl-PL", {
                                minimumFractionDigits: 2,
                                maximumFractionDigits: 3,
                              })
                            : value}
                        </td>
                        {colIndex < columns.length - 1 && (
                          <td className="border-r border-gray-300"></td>
                        )}
                      </React.Fragment>
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
    <div className="bg-gradient-to-b from-gray-50 to-gray-100">
      <div className="container mx-auto px-4 sm:px-6 lg:px-8 max-w-[1400px] py-8">
        <h1 className="text-5xl font-bold text-zus-grey-900 mb-8 text-center">
          Raporty Danych
        </h1>

        <div className="bg-white rounded-lg shadow-md p-6 mb-6">
          {/* Tabs */}
          <div
            className="border-b border-gray-200 mb-6 relative"
            role="tablist"
            aria-label="Źródła danych"
          >
            {/* Back Button - Top Left */}
            <button
              onClick={() => router.back()}
              className="absolute -top-2 left-0 flex items-center gap-2 text-gray-600 hover:text-zus-green transition-colors group"
              aria-label="Powrót"
            >
              <svg
                className="w-5 h-5 transform group-hover:-translate-x-1 transition-transform"
                fill="none"
                stroke="currentColor"
                viewBox="0 0 24 24"
              >
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth={2}
                  d="M10 19l-7-7m0 0l7-7m-7 7h18"
                />
              </svg>
              <span className="text-sm font-medium">Powrót</span>
            </button>
            <nav
              className="flex space-x-4 justify-center"
              aria-label="Wybór źródła danych"
            >
              <button
                role="tab"
                aria-selected={activeTab === "pension"}
                aria-controls="pension-panel"
                onClick={() => setActiveTab("pension")}
                className={`py-3 px-6 rounded-t-lg font-medium text-base transition-colors focus:outline-none focus:ring-2 focus:ring-zus-green ${
                  activeTab === "pension"
                    ? "bg-zus-green text-white"
                    : "text-gray-600 hover:text-zus-green hover:bg-gray-50"
                }`}
              >
                Średnia Emerytura
              </button>
              <button
                role="tab"
                aria-selected={activeTab === "cpi"}
                aria-controls="cpi-panel"
                onClick={() => setActiveTab("cpi")}
                className={`py-3 px-6 rounded-t-lg font-medium text-base transition-colors focus:outline-none focus:ring-2 focus:ring-zus-green ${
                  activeTab === "cpi"
                    ? "bg-zus-green text-white"
                    : "text-gray-600 hover:text-zus-green hover:bg-gray-50"
                }`}
              >
                Wskaźnik CPI
              </button>
              <button
                role="tab"
                aria-selected={activeTab === "wages"}
                aria-controls="wages-panel"
                onClick={() => setActiveTab("wages")}
                className={`py-3 px-6 rounded-t-lg font-medium text-base transition-colors focus:outline-none focus:ring-2 focus:ring-zus-green ${
                  activeTab === "wages"
                    ? "bg-zus-green text-white"
                    : "text-gray-600 hover:text-zus-green hover:bg-gray-50"
                }`}
              >
                Wzrost Wynagrodzeń
              </button>
            </nav>
          </div>

          {/* Table Content */}
          <div
            role="tabpanel"
            id="pension-panel"
            hidden={activeTab !== "pension"}
            aria-labelledby="pension-tab"
          >
            {dataState.loading ? (
              <div className="text-center py-8">
                <div className="inline-block animate-spin rounded-full h-8 w-8 border-b-2 border-zus-green"></div>
                <p className="mt-2 text-gray-600">Ładowanie danych...</p>
              </div>
            ) : (
              activeTab === "pension" &&
              renderTable(
                dataState.pensionData,
                "Średnia emerytura (PLN)",
                dataState.pensionMetadata
              )
            )}
          </div>
          <div
            role="tabpanel"
            id="cpi-panel"
            hidden={activeTab !== "cpi"}
            aria-labelledby="cpi-tab"
          >
            {dataState.loading ? (
              <div className="text-center py-8">
                <div className="inline-block animate-spin rounded-full h-8 w-8 border-b-2 border-zus-green"></div>
                <p className="mt-2 text-gray-600">Ładowanie danych...</p>
              </div>
            ) : (
              activeTab === "cpi" &&
              renderTable(dataState.cpiData, "Wskaźnik CPI", dataState.cpiMetadata)
            )}
          </div>
          <div
            role="tabpanel"
            id="wages-panel"
            hidden={activeTab !== "wages"}
            aria-labelledby="wages-tab"
          >
            {dataState.loading ? (
              <div className="text-center py-8">
                <div className="inline-block animate-spin rounded-full h-8 w-8 border-b-2 border-zus-green"></div>
                <p className="mt-2 text-gray-600">Ładowanie danych...</p>
              </div>
            ) : (
              activeTab === "wages" &&
              renderTable(
                dataState.wagesData,
                "Wzrost wynagrodzeń",
                dataState.wagesMetadata
              )
            )}
          </div>
        </div>
      </div>
    </div>
  );
}
