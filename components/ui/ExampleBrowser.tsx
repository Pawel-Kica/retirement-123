"use client";

import React, { useState } from "react";
import { useRouter } from "next/navigation";
import { X, BookOpen, TrendingUp, TrendingDown } from "lucide-react";
import { EXAMPLE_PERSONAS, ExamplePersona } from "@/lib/data/examples";
import { Button } from "./Button";

interface ExampleBrowserProps {
  /** If true, shows as a button that opens modal. If false, shows inline */
  mode?: "button" | "inline";
}

export function ExampleBrowser({ mode = "button" }: ExampleBrowserProps) {
  const [isOpen, setIsOpen] = useState(false);
  const router = useRouter();

  const handleSelectExample = (exampleId: string) => {
    router.push(`/wynik?example=${exampleId}`);
    setIsOpen(false);
  };

  const getColorClasses = (color: ExamplePersona["color"]) => {
    switch (color) {
      case "green":
        return {
          bg: "bg-green-50",
          border: "border-green-200",
          badge: "bg-green-100 text-green-800",
          hover: "hover:bg-green-100",
          icon: "text-green-600",
        };
      case "blue":
        return {
          bg: "bg-blue-50",
          border: "border-blue-200",
          badge: "bg-blue-100 text-blue-800",
          hover: "hover:bg-blue-100",
          icon: "text-blue-600",
        };
      case "orange":
        return {
          bg: "bg-orange-50",
          border: "border-orange-200",
          badge: "bg-orange-100 text-orange-800",
          hover: "hover:bg-orange-100",
          icon: "text-orange-600",
        };
      case "red":
        return {
          bg: "bg-red-50",
          border: "border-red-200",
          badge: "bg-red-100 text-red-800",
          hover: "hover:bg-red-100",
          icon: "text-red-600",
        };
    }
  };

  const ExampleCard = ({ example }: { example: ExamplePersona }) => {
    const colors = getColorClasses(example.color);

    return (
      <button
        onClick={() => handleSelectExample(example.id)}
        className={`${colors.bg} ${colors.border} ${colors.hover} border-2 rounded-lg p-5 text-left transition-all hover:shadow-md hover:scale-105 w-full`}
      >
        <div className="flex items-start gap-3 mb-3">
          <div className={`${colors.icon} mt-1`}>
            {example.color === "green" && <TrendingUp className="w-6 h-6" />}
            {example.color === "blue" && <TrendingUp className="w-6 h-6" />}
            {example.color === "orange" && (
              <TrendingDown className="w-6 h-6" />
            )}
            {example.color === "red" && <TrendingDown className="w-6 h-6" />}
          </div>
          <div className="flex-1">
            <h3 className="text-lg font-bold text-zus-grey-900 mb-1">
              {example.title}
            </h3>
            <p className="text-sm text-zus-grey-700 mb-2">
              {example.shortDescription}
            </p>
            <div className={`${colors.badge} text-xs font-semibold px-2 py-1 rounded inline-block`}>
              Przewidywana emerytura: {example.estimatedPensionRange}
            </div>
          </div>
        </div>
      </button>
    );
  };

  if (mode === "button") {
    return (
      <>
        {/* Floating Button */}
        <button
          onClick={() => setIsOpen(true)}
          className="fixed bottom-6 left-6 z-40 bg-zus-green hover:bg-zus-green-dark text-white rounded-full px-6 py-3 shadow-lg hover:shadow-xl transition-all flex items-center gap-2 font-medium"
          aria-label="Zobacz przykłady"
        >
          <BookOpen className="w-5 h-5" />
          <span className="hidden sm:inline">Zobacz Przykłady</span>
          <span className="sm:hidden">Przykłady</span>
        </button>

        {/* Modal */}
        {isOpen && (
          <div className="fixed inset-0 bg-black/70 z-50 flex items-center justify-center p-4 backdrop-blur-sm">
            <div className="bg-white rounded-lg shadow-2xl max-w-5xl w-full max-h-[90vh] overflow-hidden flex flex-col animate-in fade-in zoom-in duration-200">
              {/* Header */}
              <div className="bg-zus-green p-6 flex items-center justify-between">
                <div className="flex items-center gap-3">
                  <BookOpen className="w-8 h-8 text-white" />
                  <div>
                    <h2 className="text-2xl font-bold text-white">
                      Przykłady Edukacyjne
                    </h2>
                    <p className="text-sm text-white/90">
                      Zobacz, jak różne ścieżki kariery wpływają na emeryturę
                    </p>
                  </div>
                </div>
                <button
                  onClick={() => setIsOpen(false)}
                  className="text-white hover:bg-white/20 rounded-full p-2 transition-colors"
                  aria-label="Zamknij"
                >
                  <X className="w-6 h-6" />
                </button>
              </div>

              {/* Content */}
              <div className="overflow-y-auto flex-1 p-6">
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  {EXAMPLE_PERSONAS.map((example) => (
                    <ExampleCard key={example.id} example={example} />
                  ))}
                </div>

                {/* Info Box */}
                <div className="mt-6 bg-blue-50 border border-blue-200 rounded-lg p-4">
                  <p className="text-sm text-blue-900">
                    <span className="font-bold">💡 Wskazówka:</span> Każdy
                    przykład pokazuje realistyczną historię kariery z
                    szczegółową ścieżką zawodową, przerwami i wydarzeniami
                    życiowymi. Kliknij wybrany przykład, aby zobaczyć pełną
                    symulację i szczegóły.
                  </p>
                </div>
              </div>

              {/* Footer */}
              <div className="border-t border-gray-200 p-4 bg-gray-50">
                <Button
                  onClick={() => setIsOpen(false)}
                  variant="secondary"
                  className="w-full"
                >
                  Zamknij
                </Button>
              </div>
            </div>
          </div>
        )}
      </>
    );
  }

  // Inline mode
  return (
    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
      {EXAMPLE_PERSONAS.map((example) => (
        <ExampleCard key={example.id} example={example} />
      ))}
    </div>
  );
}
