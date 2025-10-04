"use client";

import { useState, useMemo } from "react";
import { SalaryPathEntry, LifeEvent, CapitalEntry } from "@/lib/types";
import { formatPLN } from "@/lib/utils/formatting";
import { getEmploymentGapIcon } from "@/lib/calculations";

interface InteractiveCareerTimelineProps {
  salaryPath: SalaryPathEntry[];
  capitalPath: CapitalEntry[];
  lifeEvents?: LifeEvent[];
  onEditSalary: (year: number, newSalary: number) => void;
  onAddLifeEvent?: (event: Omit<LifeEvent, "id">) => void;
  onRemoveLifeEvent?: (eventId: string) => void;
  currentYear: number;
  retirementYear: number;
}

export function InteractiveCareerTimeline({
  salaryPath,
  capitalPath,
  lifeEvents = [],
  onEditSalary,
  onAddLifeEvent,
  onRemoveLifeEvent,
  currentYear,
  retirementYear,
}: InteractiveCareerTimelineProps) {
  const [editingYear, setEditingYear] = useState<number | null>(null);
  const [editValue, setEditValue] = useState<number>(0);
  const [hoveredYear, setHoveredYear] = useState<number | null>(null);
  const [showAddEventModal, setShowAddEventModal] = useState(false);

  // Wybierz co 4-5 lat do wyświetlenia (żeby nie było za gęsto)
  const displayYears = useMemo(() => {
    const years: number[] = [];
    const startYear = salaryPath[0]?.year || currentYear;
    const endYear = salaryPath[salaryPath.length - 1]?.year || retirementYear;

    const step = Math.max(Math.floor((endYear - startYear) / 12), 1);

    for (let year = startYear; year <= endYear; year += step) {
      years.push(year);
    }

    // Zawsze dodaj ostatni rok
    if (!years.includes(endYear)) {
      years.push(endYear);
    }

    return years;
  }, [salaryPath, currentYear, retirementYear]);

  const handlePointClick = (year: number, currentSalary: number) => {
    // Tylko przyszłe lata można edytować
    if (year >= currentYear) {
      setEditingYear(year);
      setEditValue(currentSalary);
    }
  };

  const handleSaveEdit = () => {
    if (editingYear && editValue > 0) {
      onEditSalary(editingYear, editValue);
      setEditingYear(null);
    }
  };

  const handleCancelEdit = () => {
    setEditingYear(null);
  };

  // Oblicz maksymalną pensję dla skalowania
  const maxSalary = Math.max(...salaryPath.map((e) => e.monthlyGross));
  const minSalary = Math.min(...salaryPath.map((e) => e.monthlyGross));

  // Funkcja do obliczenia pozycji Y punktu (0-100%)
  const getYPosition = (salary: number) => {
    const range = maxSalary - minSalary;
    if (range === 0) return 50;
    return 100 - ((salary - minSalary) / range) * 80; // 80% wysokości, 20% padding
  };

  // Znajdź wydarzenia dla danego roku
  const getEventsForYear = (year: number) => {
    return lifeEvents.filter((e) => e.year === year);
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h3 className="text-2xl font-bold text-zus-grey-900 flex items-center gap-2">
            <span>📊</span>
            Twoja Ścieżka Kariery
          </h3>
          <p className="text-sm text-zus-grey-700 mt-1">
            Kliknij na dowolny przyszły rok, aby edytować pensję. Dodaj
            wydarzenia życiowe, aby zobaczyć ich wpływ.
          </p>
        </div>

        {onAddLifeEvent && (
          <button
            onClick={() => setShowAddEventModal(true)}
            className="px-4 py-2 bg-zus-blue text-white rounded-lg hover:bg-zus-blue/90 transition-colors font-semibold text-sm"
          >
            + Dodaj Wydarzenie
          </button>
        )}
      </div>

      {/* Timeline Visualization */}
      <div className="bg-white p-6 rounded-lg border-2 border-zus-grey-300 relative">
        {/* Years axis */}
        <div className="flex justify-between mb-4 text-xs text-zus-grey-600 font-semibold">
          {displayYears.map((year) => (
            <div
              key={year}
              className={`text-center ${
                year === currentYear ? "text-zus-orange font-bold" : ""
              }`}
            >
              {year}
            </div>
          ))}
        </div>

        {/* Timeline graph */}
        <div className="relative h-64 mb-6">
          {/* Grid lines */}
          <div className="absolute inset-0 flex flex-col justify-between">
            {[0, 25, 50, 75, 100].map((pct) => (
              <div
                key={pct}
                className="border-t border-zus-grey-200 border-dashed"
              ></div>
            ))}
          </div>

          {/* Salary path line */}
          <svg
            className="absolute inset-0 w-full h-full"
            preserveAspectRatio="none"
            viewBox="0 0 100 100"
          >
            <polyline
              points={salaryPath
                .map((entry, idx) => {
                  const x = (idx / (salaryPath.length - 1)) * 100;
                  const y = getYPosition(entry.monthlyGross);
                  return `${x},${y}`;
                })
                .join(" ")}
              fill="none"
              stroke="#00843D"
              strokeWidth="0.5"
              vectorEffect="non-scaling-stroke"
            />

            {/* Fill area under line */}
            <polygon
              points={`0,100 ${salaryPath
                .map((entry, idx) => {
                  const x = (idx / (salaryPath.length - 1)) * 100;
                  const y = getYPosition(entry.monthlyGross);
                  return `${x},${y}`;
                })
                .join(" ")} 100,100`}
              fill="rgba(0, 132, 61, 0.1)"
            />
          </svg>

          {/* Data points */}
          {displayYears.map((year) => {
            const entry = salaryPath.find((e) => e.year === year);
            if (!entry) return null;

            const idx = salaryPath.findIndex((e) => e.year === year);
            const x = (idx / (salaryPath.length - 1)) * 100;
            const y = getYPosition(entry.monthlyGross);

            const isEditing = editingYear === year;
            const isHovered = hoveredYear === year;
            const isFuture = year > currentYear;
            const isCurrent = year === currentYear;

            return (
              <div
                key={year}
                className="absolute transform -translate-x-1/2 -translate-y-1/2 cursor-pointer group"
                style={{
                  left: `${x}%`,
                  top: `${y}%`,
                }}
                onClick={() => handlePointClick(year, entry.monthlyGross)}
                onMouseEnter={() => setHoveredYear(year)}
                onMouseLeave={() => setHoveredYear(null)}
              >
                {/* Point */}
                <div
                  className={`w-4 h-4 rounded-full border-3 transition-all ${
                    isEditing
                      ? "bg-zus-orange border-white scale-150 ring-4 ring-zus-orange/30"
                      : isHovered
                      ? "bg-zus-green border-white scale-125 ring-2 ring-zus-green/20"
                      : isCurrent
                      ? "bg-zus-orange border-white"
                      : isFuture
                      ? "bg-zus-green border-white"
                      : "bg-zus-grey-500 border-white"
                  }`}
                ></div>

                {/* Tooltip */}
                {(isHovered || isEditing) && !isEditing && (
                  <div className="absolute bottom-full mb-2 left-1/2 transform -translate-x-1/2 bg-zus-grey-900 text-white text-xs rounded-lg px-3 py-2 whitespace-nowrap z-10 shadow-lg">
                    <div className="font-bold">{year}</div>
                    <div>{formatPLN(entry.monthlyGross)} / mc</div>
                    <div className="text-zus-grey-300">
                      Wiek: {entry.age} lat
                    </div>
                    {isFuture && (
                      <div className="text-zus-green-light mt-1 text-[10px]">
                        Kliknij aby edytować
                      </div>
                    )}
                  </div>
                )}

                {/* Edit mode */}
                {isEditing && (
                  <div className="absolute bottom-full mb-2 left-1/2 transform -translate-x-1/2 bg-white rounded-lg px-4 py-3 shadow-2xl border-2 border-zus-orange z-20 min-w-[200px]">
                    <div className="font-bold text-sm mb-2 text-zus-grey-900">
                      Edytuj rok {year}
                    </div>
                    <input
                      type="number"
                      value={editValue}
                      onChange={(e) => setEditValue(Number(e.target.value))}
                      className="w-full px-3 py-2 border-2 border-zus-grey-300 rounded-lg text-sm focus:border-zus-orange focus:outline-none mb-2"
                      placeholder="Nowa pensja"
                      autoFocus
                      onKeyDown={(e) => {
                        if (e.key === "Enter") handleSaveEdit();
                        if (e.key === "Escape") handleCancelEdit();
                      }}
                    />
                    <div className="flex gap-2">
                      <button
                        onClick={handleSaveEdit}
                        className="flex-1 px-3 py-1 bg-zus-green text-white rounded text-xs font-semibold hover:bg-zus-green-dark transition-colors"
                      >
                        Zapisz
                      </button>
                      <button
                        onClick={handleCancelEdit}
                        className="flex-1 px-3 py-1 bg-zus-grey-300 text-zus-grey-900 rounded text-xs font-semibold hover:bg-zus-grey-400 transition-colors"
                      >
                        Anuluj
                      </button>
                    </div>
                  </div>
                )}
              </div>
            );
          })}

          {/* Life events markers */}
          {lifeEvents.map((event) => {
            const idx = salaryPath.findIndex((e) => e.year === event.year);
            if (idx === -1) return null;

            const x = (idx / (salaryPath.length - 1)) * 100;
            const entry = salaryPath[idx];
            const y = getYPosition(entry.monthlyGross);

            return (
              <div
                key={event.id}
                className="absolute transform -translate-x-1/2 cursor-pointer group"
                style={{
                  left: `${x}%`,
                  top: `${y - 15}%`,
                }}
              >
                <div className="text-2xl">
                  {getEmploymentGapIcon(event.type as any)}
                </div>

                {/* Event tooltip */}
                <div className="absolute bottom-full mb-2 left-1/2 transform -translate-x-1/2 bg-zus-grey-900 text-white text-xs rounded-lg px-3 py-2 whitespace-nowrap opacity-0 group-hover:opacity-100 transition-opacity shadow-lg z-10">
                  <div className="font-bold">
                    {event.description || event.type}
                  </div>
                  <div>{event.year}</div>
                  {event.durationMonths && (
                    <div>Długość: {event.durationMonths} mc</div>
                  )}
                  {onRemoveLifeEvent && (
                    <button
                      onClick={() => onRemoveLifeEvent(event.id)}
                      className="mt-1 text-[10px] text-red-300 hover:text-red-100"
                    >
                      Usuń wydarzenie
                    </button>
                  )}
                </div>
              </div>
            );
          })}

          {/* Current year indicator */}
          <div
            className="absolute top-0 bottom-0 w-0.5 bg-zus-orange opacity-50 pointer-events-none"
            style={{
              left: `${
                (salaryPath.findIndex((e) => e.year === currentYear) /
                  (salaryPath.length - 1)) *
                100
              }%`,
            }}
          >
            <div className="absolute -top-6 left-1/2 transform -translate-x-1/2 text-xs font-bold text-zus-orange whitespace-nowrap">
              Dziś
            </div>
          </div>
        </div>

        {/* Salary scale (left side) */}
        <div className="absolute left-0 top-20 bottom-20 w-16 flex flex-col justify-between text-xs text-zus-grey-600">
          <div className="text-right pr-2">{formatPLN(maxSalary)}</div>
          <div className="text-right pr-2">
            {formatPLN((maxSalary + minSalary) / 2)}
          </div>
          <div className="text-right pr-2">{formatPLN(minSalary)}</div>
        </div>

        {/* Legend */}
        <div className="flex gap-6 justify-center text-xs text-zus-grey-700 mt-4 flex-wrap">
          <div className="flex items-center gap-2">
            <div className="w-3 h-3 rounded-full bg-zus-grey-500"></div>
            <span>Historia</span>
          </div>
          <div className="flex items-center gap-2">
            <div className="w-3 h-3 rounded-full bg-zus-orange"></div>
            <span>Dziś</span>
          </div>
          <div className="flex items-center gap-2">
            <div className="w-3 h-3 rounded-full bg-zus-green"></div>
            <span>Prognoza</span>
          </div>
          {lifeEvents.length > 0 && (
            <>
              <div className="flex items-center gap-2">
                <span className="text-lg">👶</span>
                <span>Urlop macierzyński</span>
              </div>
              <div className="flex items-center gap-2">
                <span className="text-lg">🏖️</span>
                <span>Urlop bezpłatny</span>
              </div>
              <div className="flex items-center gap-2">
                <span className="text-lg">🏥</span>
                <span>Długotrwałe L4</span>
              </div>
            </>
          )}
        </div>
      </div>

      {/* Quick add event buttons */}
      {onAddLifeEvent && (
        <div className="flex gap-3 flex-wrap">
          <button
            onClick={() => {
              onAddLifeEvent({
                type: "MATERNITY_LEAVE",
                year: currentYear + 1,
                durationMonths: 6,
                description: "Urlop macierzyński",
              });
            }}
            className="px-4 py-2 bg-white border-2 border-zus-grey-300 rounded-lg hover:border-zus-green hover:bg-zus-green-light transition-all text-sm font-semibold flex items-center gap-2"
          >
            <span>👶</span>
            Dodaj urlop macierzyński
          </button>
          <button
            onClick={() => {
              onAddLifeEvent({
                type: "UNPAID_LEAVE",
                year: currentYear + 1,
                durationMonths: 3,
                description: "Urlop bezpłatny",
              });
            }}
            className="px-4 py-2 bg-white border-2 border-zus-grey-300 rounded-lg hover:border-zus-blue hover:bg-blue-50 transition-all text-sm font-semibold flex items-center gap-2"
          >
            <span>🏖️</span>
            Dodaj urlop bezpłatny
          </button>
          <button
            onClick={() => {
              onAddLifeEvent({
                type: "LONG_TERM_SICK",
                year: currentYear + 1,
                durationMonths: 6,
                description: "Długotrwałe zwolnienie L4",
              });
            }}
            className="px-4 py-2 bg-white border-2 border-zus-grey-300 rounded-lg hover:border-zus-orange hover:bg-orange-50 transition-all text-sm font-semibold flex items-center gap-2"
          >
            <span>🏥</span>
            Dodaj długie L4
          </button>
        </div>
      )}
    </div>
  );
}
