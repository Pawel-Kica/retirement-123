"use client";

import { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import { useSimulation } from "@/lib/context/SimulationContext";
import { SimulationHistoryEntry } from "@/lib/types";
import { formatPLN } from "@/lib/utils/formatting";
import { History, X, Trash2 } from "lucide-react";
import { deleteSimulationById } from "@/lib/utils/simulationHistory";

interface HistorySectionProps {
  isHistoryOpen: boolean;
  setIsHistoryOpen: (open: boolean) => void;
}

export default function HistorySection({
  isHistoryOpen,
  setIsHistoryOpen,
}: HistorySectionProps) {
  const [history, setHistory] = useState<SimulationHistoryEntry[]>([]);
  const { loadFromHistory, getHistory, clearAllHistory } = useSimulation();
  const router = useRouter();

  useEffect(() => {
    if (isHistoryOpen) {
      setHistory(getHistory());
    }
  }, [isHistoryOpen, getHistory]);

  const handleLoadSimulation = (id: string) => {
    loadFromHistory(id);
    router.push("/wynik");
    setIsHistoryOpen(false);
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
    const date = new Date(timestamp);
    return date.toLocaleDateString("pl-PL", {
      day: "2-digit",
      month: "2-digit",
      year: "numeric",
      hour: "2-digit",
      minute: "2-digit",
    });
  };

  return (
    <div
      className={`fixed top-0 right-0 h-full w-full md:w-[400px] bg-white shadow-2xl z-50 transform transition-transform duration-300 ease-in-out overflow-hidden ${
        isHistoryOpen ? "translate-x-0" : "translate-x-full"
      }`}
    >
      <div className="h-full flex flex-col">
        <div className="p-4 bg-zus-green text-white flex items-center justify-between border-b-4 border-zus-green-dark">
          <div className="flex items-center gap-2">
            <History className="w-6 h-6" />
            <h2 className="text-xl font-bold">Historia Symulacji</h2>
          </div>
          <button
            onClick={() => setIsHistoryOpen(false)}
            className="p-2 hover:bg-zus-green-dark rounded-lg transition-colors"
            aria-label="Zamknij"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        <div className="flex-1 overflow-y-auto p-4">
          {history.length === 0 ? (
            <div className="text-center py-12">
              <History className="w-16 h-16 mx-auto text-zus-grey-300 mb-4" />
              <p className="text-zus-grey-500 text-lg font-medium">
                Brak zapisanych symulacji
              </p>
              <p className="text-zus-grey-400 text-sm mt-2">
                Twoje symulacje będą tutaj widoczne
              </p>
            </div>
          ) : (
            <div className="space-y-3">
              {history.map((entry) => (
                <div
                  key={entry.id}
                  onClick={() => handleLoadSimulation(entry.id)}
                  className="bg-white border-2 border-zus-grey-300 rounded-lg p-4 hover:border-zus-green hover:shadow-md transition-all cursor-pointer group"
                >
                  <div className="flex justify-between items-start mb-2">
                    <div className="flex-1">
                      <p className="text-sm text-zus-grey-500 mb-1">
                        {formatDate(Number(entry.timestamp))}
                      </p>
                      <p className="text-lg font-bold text-zus-green group-hover:text-zus-green-dark">
                        {formatPLN(entry.results.realPension)}
                      </p>
                      <p className="text-xs text-zus-grey-500 mt-1">
                        Emerytura miesięczna
                      </p>
                    </div>
                    <button
                      onClick={(e) => handleDeleteSimulation(e, entry.id)}
                      className="p-2 text-zus-grey-400 hover:text-zus-error hover:bg-zus-grey-100 rounded transition-colors"
                      aria-label="Usuń symulację"
                    >
                      <Trash2 className="w-4 h-4" />
                    </button>
                  </div>

                  <div className="grid grid-cols-2 gap-2 text-xs text-zus-grey-600 border-t border-zus-grey-200 pt-2">
                    <div>
                      <span className="text-zus-grey-500">Wiek:</span>{" "}
                      <span className="font-medium">
                        {entry.inputs.age} lat
                      </span>
                    </div>
                    <div>
                      <span className="text-zus-grey-500">Płeć:</span>{" "}
                      <span className="font-medium">
                        {entry.inputs.sex === "male" ? "Mężczyzna" : "Kobieta"}
                      </span>
                    </div>
                    <div className="col-span-2">
                      <span className="text-zus-grey-500">Wynagrodzenie:</span>{" "}
                      <span className="font-medium">
                        {formatPLN(entry.inputs.currentSalary)}
                      </span>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>

        {history.length > 0 && (
          <div className="p-4 border-t border-zus-grey-200 bg-zus-grey-100">
            <button
              onClick={handleClearAll}
              className="w-full px-4 py-2.5 bg-zus-error hover:bg-red-700 text-white rounded font-medium transition-colors flex items-center justify-center gap-2 cursor-pointer"
            >
              <Trash2 className="w-4 h-4" />
              Wyczyść całą historię
            </button>
          </div>
        )}
      </div>
    </div>
  );
}
