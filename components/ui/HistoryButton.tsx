"use client";

import { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import { useSimulation } from "@/lib/context/SimulationContext";
import { SimulationHistoryEntry } from "@/lib/types";
import { formatPLN } from "@/lib/utils/formatting";
import { History, X, ChevronRight, Trash2 } from "lucide-react";
import { deleteSimulationById } from "@/lib/utils/simulationHistory";

export function HistoryButton() {
  const [isOpen, setIsOpen] = useState(false);
  const [history, setHistory] = useState<SimulationHistoryEntry[]>([]);
  const [mounted, setMounted] = useState(false);
  const { loadFromHistory, getHistory, clearAllHistory } = useSimulation();
  const router = useRouter();

  useEffect(() => {
    setMounted(true);
  }, []);

  useEffect(() => {
    if (isOpen && mounted) {
      setHistory(getHistory());
    }
  }, [isOpen, mounted, getHistory]);

  const handleLoadSimulation = (id: string) => {
    loadFromHistory(id);
    router.push("/wynik");
    setIsOpen(false);
  };

  const handleDeleteSimulation = (e: React.MouseEvent, id: string) => {
    e.stopPropagation();
    deleteSimulationById(id);
    setHistory(getHistory());
  };

  const handleClearAll = () => {
    if (confirm("Czy na pewno chcesz usunąć całą historię symulacji?")) {
      clearAllHistory();
      setHistory([]);
    }
  };

  const formatDate = (timestamp: number) => {
    if (!mounted) return "";
    const date = new Date(timestamp);
    return date.toLocaleDateString("pl-PL", {
      day: "2-digit",
      month: "2-digit",
      year: "numeric",
      hour: "2-digit",
      minute: "2-digit",
    });
  };

  if (!mounted) {
    return null;
  }

  return (
    <>
      <button
        onClick={() => setIsOpen(!isOpen)}
        className="p-3 bg-zus-green text-white rounded-lg shadow-lg hover:bg-zus-green-dark transition-all duration-200 flex items-center gap-2 cursor-pointer"
        aria-label="Historia symulacji"
      >
        <History className="w-5 h-5" />
        <span className="text-sm font-semibold hidden md:inline">
          Historia
        </span>
      </button>

      {isOpen && (
        <div
          className="fixed inset-0 bg-black/30 z-40"
          onClick={() => setIsOpen(false)}
          aria-hidden="true"
        />
      )}

      <div
        className={`fixed top-0 right-0 h-full w-full md:w-[400px] bg-white shadow-2xl z-50 transform transition-transform duration-300 ease-in-out overflow-hidden ${
          isOpen ? "translate-x-0" : "translate-x-full"
        }`}
      >
        <div className="h-full flex flex-col">
          <div className="p-4 bg-zus-green text-white flex items-center justify-between border-b-4 border-zus-green-dark">
            <div className="flex items-center gap-2">
              <History className="w-6 h-6" />
              <h2 className="text-xl font-bold">Historia Symulacji</h2>
            </div>
            <button
              onClick={() => setIsOpen(false)}
              className="p-2 hover:bg-zus-green-dark rounded-lg transition-colors cursor-pointer"
              aria-label="Zamknij"
            >
              <X className="w-5 h-5" />
            </button>
          </div>

          <div className="flex-1 overflow-y-auto p-4">
            {history.length === 0 ? (
              <div className="text-center py-12">
                <History className="w-16 h-16 text-zus-grey-300 mx-auto mb-4" />
                <p className="text-zus-grey-500 text-sm">
                  Brak zapisanych symulacji
                </p>
                <p className="text-zus-grey-400 text-xs mt-2">
                  Wykonaj swoją pierwszą symulację, aby zobaczyć ją tutaj
                </p>
              </div>
            ) : (
              <div className="space-y-3">
                {history.map((entry, index) => (
                  <div
                    key={entry.id}
                    onClick={() => handleLoadSimulation(entry.id)}
                    className="p-4 border-2 border-zus-grey-300 rounded-lg hover:border-zus-green hover:shadow-md transition-all cursor-pointer bg-white group"
                  >
                    <div className="flex items-start justify-between mb-2">
                      <div className="flex items-center gap-2">
                        <div className="w-8 h-8 rounded-full bg-zus-green text-white flex items-center justify-center font-bold text-sm">
                          {index + 1}
                        </div>
                        <div>
                          <p className="text-xs text-zus-grey-500">
                            {formatDate(entry.timestamp)}
                          </p>
                        </div>
                      </div>
                      <button
                        onClick={(e) => handleDeleteSimulation(e, entry.id)}
                        className="opacity-0 group-hover:opacity-100 p-1 text-zus-error hover:bg-zus-error/10 rounded transition-all cursor-pointer"
                        aria-label="Usuń"
                      >
                        <Trash2 className="w-4 h-4" />
                      </button>
                    </div>

                    <div className="space-y-2">
                      <div className="flex items-center justify-between">
                        <span className="text-xs text-zus-grey-700">
                          Oczekiwana:
                        </span>
                        <span className="text-sm font-semibold text-zus-grey-900">
                          {formatPLN(entry.expectedPension)}
                        </span>
                      </div>

                      <div className="flex items-center justify-between">
                        <span className="text-xs text-zus-grey-700">
                          Rzeczywista:
                        </span>
                        <span className="text-sm font-bold text-zus-green">
                          {formatPLN(entry.results.realPension)}
                        </span>
                      </div>

                      <div className="pt-2 border-t border-zus-grey-200">
                        <div className="flex items-center justify-between text-xs">
                          <span className="text-zus-grey-600">
                            {entry.inputs.sex === "M" ? "Mężczyzna" : "Kobieta"}
                            , {entry.inputs.age} lat
                          </span>
                          <span className="text-zus-grey-600">
                            {formatPLN(entry.inputs.monthlyGross)} brutto
                          </span>
                        </div>
                      </div>
                    </div>

                    <div className="mt-3 text-xs text-zus-green font-semibold flex items-center gap-1">
                      <span>Kliknij, aby załadować</span>
                      <ChevronRight className="w-3 h-3" />
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>

          {history.length > 0 && (
            <div className="p-4 border-t-2 border-zus-grey-300 bg-zus-grey-100">
              <button
                onClick={handleClearAll}
                className="w-full py-3 px-4 bg-white border-2 border-zus-error text-zus-error rounded-lg hover:bg-zus-error hover:text-white transition-all font-semibold text-sm flex items-center justify-center gap-2 cursor-pointer"
              >
                <Trash2 className="w-4 h-4" />
                Wyczyść całą historię
              </button>
              <p className="text-xs text-zus-grey-500 text-center mt-2">
                Zapisanych: {history.length}/5 symulacji
              </p>
            </div>
          )}
        </div>
      </div>
    </>
  );
}

