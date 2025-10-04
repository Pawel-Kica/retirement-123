"use client";

import { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import { Button } from "@/components/ui/Button";
import { Card } from "@/components/ui/Card";
import { Tooltip } from "@/components/ui/Tooltip";
import { useSimulation } from "@/lib/context/SimulationContext";
import { getRandomFact } from "@/lib/data/loader";
import { formatPLN } from "@/lib/utils/formatting";
import {
  Chart as ChartJS,
  CategoryScale,
  LinearScale,
  BarElement,
  Title,
  Tooltip as ChartTooltip,
  Legend as ChartLegend,
} from "chart.js";
import { Bar as ChartBar } from "react-chartjs-2";

// Register Chart.js components
ChartJS.register(
  CategoryScale,
  LinearScale,
  BarElement,
  Title,
  ChartTooltip,
  ChartLegend
);

export default function Home() {
  const router = useRouter();
  const { state, setExpectedPension } = useSimulation();
  const [pension, setPension] = useState(state.expectedPension);
  const [fact, setFact] = useState("");

  useEffect(() => {
    setFact(getRandomFact());
  }, []);

  // Pension distribution groups - ACTUAL DATA
  const groups = [
    {
      name: "Poniżej minimalnej",
      shortName: "Poniżej min.",
      range: "<1 780 zł",
      percent: 15,
      color: "#D32F2F",
      description:
        "Niska aktywność zawodowa, przerwy w karierze. Uwaga: Brak przepracowanych 25 lat (K) lub 20 lat (M) = brak gwarancji minimalnej emerytury.",
      min: 0,
      max: 1780,
      details: {
        averageYears: "15-20 lat",
        example:
          "Osoba pracująca dorywczo, długie okresy bezrobocia, praca na czarno przez znaczną część kariery",
        bullets: [
          "Nieregularne odprowadzanie składek do ZUS",
          "Częste przerwy w karierze zawodowej (bezrobocie, choroba, opieka)",
          "Brak spełnienia warunku minimalnego stażu (20 lat K / 25 lat M)",
        ],
      },
    },
    {
      name: "Około minimalnej",
      shortName: "Około min.",
      range: "1 780-2 500 zł",
      percent: 25,
      color: "#F5A623",
      description:
        "Niskie lub nieregularne zarobki, część kariery w szarej strefie lub okresy bezrobocia.",
      min: 1780,
      max: 2500,
      details: {
        averageYears: "25-30 lat",
        example:
          "Osoba zatrudniona na minimalnej krajowej, pracownik usług, praca w małej firmie",
        bullets: [
          "Wynagrodzenie na poziomie minimalnej krajowej (obecnie ~4 300 zł brutto)",
          "Pełny staż pracy, ale niskie zarobki przez całą karierę",
          "Praca w branżach nisko płatnych (handel, obsługa, opieka)",
        ],
      },
    },
    {
      name: "Około średniej",
      shortName: "Około śr.",
      range: "2 500-4 500 zł",
      percent: 35,
      color: "#0088CC",
      description:
        "Typowa kariera zawodowa, stałe zatrudnienie, średnie krajowe zarobki.",
      min: 2500,
      max: 4500,
      details: {
        averageYears: "35-40 lat",
        example:
          "Nauczyciel, urzędnik, technik, pracownik administracji w średniej firmie",
        bullets: [
          "Wynagrodzenie na poziomie średniej krajowej (~8 000 zł brutto)",
          "Stabilna kariera, stałe zatrudnienie, pełny etat",
          "Regularne odprowadzanie składek przez całą karierę zawodową",
        ],
      },
    },
    {
      name: "Powyżej średniej",
      shortName: "Powyżej śr.",
      range: "4 500-7 000 zł",
      percent: 20,
      color: "#00843D",
      description:
        "Wyższe zarobki, długi staż, brak długich przerw, regularne odprowadzanie składek.",
      min: 4500,
      max: 7000,
      details: {
        averageYears: "38-42 lata",
        example:
          "Menadżer średniego szczebla, specjalista IT, inżynier, lekarz, prawnik",
        bullets: [
          "Wynagrodzenie wyraźnie powyżej średniej krajowej (12 000-15 000 zł brutto)",
          "Długi staż pracy bez dłuższych przerw",
          "Możliwe odroczenie emerytury o 2-3 lata dla zwiększenia świadczenia",
        ],
      },
    },
    {
      name: "Wysokie emerytury",
      shortName: "Wysokie",
      range: ">7 000 zł",
      percent: 5,
      color: "#0B4C7C",
      description:
        "Bardzo wysokie zarobki przez całą karierę, maksymalizacja składek, często odroczenie przejścia na emeryturę.",
      min: 7000,
      max: 15000,
      details: {
        averageYears: "42-50 lat",
        example:
          "Dyrektor, przedsiębiorca z wysokimi dochodami, specjalista z wieloletnim doświadczeniem",
        bullets: [
          "Wynagrodzenie przekraczające 20 000 zł brutto miesięcznie przez większość kariery",
          "Maksymalizacja podstawy składek przez dziesiątki lat",
          "Odroczenie przejścia na emeryturę o 5+ lat, brak zwolnień chorobowych",
        ],
      },
    },
  ];

  const SLIDER_MIN = groups[0].min;
  const SLIDER_MAX = groups[groups.length - 1].max;
  const SLIDER_STEP = 10; // Step in pension value (zł)

  // Convert slider percentage (0-100) to pension value
  const percentageToPension = (percentage: number): number => {
    let cumulativePercent = 0;

    for (const group of groups) {
      const groupEndPercent = cumulativePercent + group.percent;

      if (percentage <= groupEndPercent) {
        // Interpolate within this group
        const percentageInGroup =
          (percentage - cumulativePercent) / group.percent;
        const pensionValue =
          group.min + percentageInGroup * (group.max - group.min);
        // Round to nearest step for smoother operation
        return Math.round(pensionValue / SLIDER_STEP) * SLIDER_STEP;
      }

      cumulativePercent = groupEndPercent;
    }

    return SLIDER_MAX;
  };

  // Convert pension value to slider percentage (0-100)
  const pensionToPercentage = (value: number): number => {
    // Clamp value to valid range first
    const clampedValue = Math.max(SLIDER_MIN, Math.min(SLIDER_MAX, value));
    let cumulativePercent = 0;

    for (const group of groups) {
      if (clampedValue >= group.min && clampedValue <= group.max) {
        const percentageInGroup =
          (clampedValue - group.min) / (group.max - group.min);
        return cumulativePercent + percentageInGroup * group.percent;
      }
      cumulativePercent += group.percent;
    }

    return 100;
  };

  const handleSliderChange = (sliderValue: number) => {
    const pensionValue = percentageToPension(sliderValue);
    setPension(pensionValue);
    setExpectedPension(pensionValue);
  };

  const handleDirectInput = (value: number) => {
    // Handle empty or invalid input
    if (isNaN(value)) {
      setPension(SLIDER_MIN);
      setExpectedPension(SLIDER_MIN);
      return;
    }
    // Clamp to min/max and round to step
    let clampedValue = Math.max(SLIDER_MIN, Math.min(SLIDER_MAX, value));
    clampedValue = Math.round(clampedValue / SLIDER_STEP) * SLIDER_STEP;
    setPension(clampedValue);
    setExpectedPension(clampedValue);
  };

  const handleNext = () => {
    setExpectedPension(pension);
    router.push("/symulacja");
  };

  // Determine which category the selected pension falls into
  const getActiveCategory = (value: number) => {
    for (let i = 0; i < groups.length; i++) {
      if (value >= groups[i].min && value <= groups[i].max) {
        return i;
      }
    }
    return groups.length - 1;
  };

  const activeCategory = getActiveCategory(pension);

  // Calculate slider position (0-100) for current pension
  const sliderPosition = pensionToPercentage(pension);

  // Slider tick marks - only start and end
  const labeledMarks = [SLIDER_MIN, SLIDER_MAX];

  // Chart data for Chart.js
  const chartData = {
    labels: groups.map((g) => g.shortName),
    datasets: [
      {
        label: "Procent emerytów",
        data: groups.map((g) => g.percent),
        backgroundColor: groups.map((g, i) =>
          i === activeCategory ? g.color : `${g.color}99`
        ),
        borderColor: groups.map((g, i) =>
          i === activeCategory ? g.color : "transparent"
        ),
        borderWidth: groups.map((g, i) => (i === activeCategory ? 3 : 0)),
        borderRadius: 8,
      },
    ],
  };

  const chartOptions = {
    responsive: true,
    maintainAspectRatio: false,
    onClick: (event: any, elements: any) => {
      if (elements.length > 0) {
        const index = elements[0].index;
        const group = groups[index];
        // Set pension to middle of the range
        const middlePension = Math.round((group.min + group.max) / 2);
        handleDirectInput(middlePension);
      }
    },
    plugins: {
      legend: {
        display: false,
      },
      tooltip: {
        callbacks: {
          title: (context: any) => {
            const index = context[0].dataIndex;
            return groups[index].name;
          },
          label: (context: any) => {
            const index = context.dataIndex;
            const group = groups[index];
            return [
              `${group.range}`,
              `${group.percent}% emerytów`,
              "",
              group.description,
            ];
          },
        },
        backgroundColor: "white",
        titleColor: "#0B4C7C",
        bodyColor: "#374151",
        borderColor: "#e5e7eb",
        borderWidth: 2,
        padding: 12,
        displayColors: false,
        titleFont: {
          size: 14,
          weight: "bold" as const,
        },
        bodyFont: {
          size: 12,
        },
      },
    },
    scales: {
      y: {
        beginAtZero: true,
        title: {
          display: true,
          text: "Procent emerytów (%)",
          color: "#374151",
          font: {
            size: 12,
          },
        },
        ticks: {
          color: "#374151",
        },
        grid: {
          color: "#e5e7eb",
        },
      },
      x: {
        ticks: {
          color: "#374151",
          font: {
            size: 11,
          },
        },
        grid: {
          display: false,
        },
      },
    },
  };

  return (
    <main className="min-h-screen bg-gradient-to-b from-gray-50 to-gray-100">
      <div className="container mx-auto px-4 sm:px-6 lg:px-8 py-6 max-w-[1400px]">
        {/* Header */}
        <div className="text-center mb-6">
          <h1 className="text-3xl font-bold text-zus-grey-900 mb-2">
            Symulator Emerytalny ZUS
          </h1>
          <p className="text-base text-gray-700">
            Zaprognozuj swoją przyszłą emeryturę i dowiedz się, ile musisz
            zarobić
          </p>
        </div>

        {/* Expected Pension Input */}
        <Card className="mb-4">
          <div className="text-center mb-4">
            <h2 className="text-xl font-bold text-zus-grey-900 mb-1">
              Jaka emerytura Cię zadowoli?
            </h2>
            <p className="text-sm text-gray-600">
              W dzisiejszych złotych (wartość realna)
            </p>
          </div>

          <div className="flex items-center justify-center gap-4 mb-4">
            <input
              type="number"
              step={SLIDER_STEP}
              value={pension}
              onChange={(e) => handleDirectInput(Number(e.target.value))}
              onBlur={(e) => {
                // Ensure value is clamped when user leaves the field
                const value = Number(e.target.value);
                if (isNaN(value) || value < SLIDER_MIN) {
                  handleDirectInput(SLIDER_MIN);
                } else if (value > SLIDER_MAX) {
                  handleDirectInput(SLIDER_MAX);
                }
              }}
              className="w-28 p-2 text-center text-xl font-bold border-2 border-zus-grey-300 rounded-lg"
            />
            <div className="text-2xl font-bold text-zus-grey-900">
              {formatPLN(pension)}
            </div>
          </div>

          {/* Colorful Gradient Slider */}
          <div className="relative mb-4">
            {/* Gradient based on percentage distribution: 15%, 25%, 35%, 20%, 5% */}
            <div
              className="h-3 rounded-lg overflow-hidden mb-2"
              style={{
                background: `linear-gradient(to right,
                #D32F2F 0%,
                #D32F2F 15%,
                #F5A623 15%,
                #F5A623 40%,
                #0088CC 40%,
                #0088CC 75%,
                #00843D 75%,
                #00843D 95%,
                #0B4C7C 95%,
                #0B4C7C 100%)`,
              }}
            />
            <input
              type="range"
              min={0}
              max={100}
              step={0.01}
              value={sliderPosition}
              onChange={(e) => handleSliderChange(Number(e.target.value))}
              className="absolute top-0 w-full h-3 bg-transparent appearance-none cursor-pointer slider-thumb"
              style={{
                WebkitAppearance: "none",
              }}
            />

            {/* Tick marks - only start and end */}
            <div className="relative mt-2" style={{ height: "24px" }}>
              {labeledMarks.map((mark, index) => {
                const position = pensionToPercentage(mark);
                const isFirst = index === 0;
                const isLast = index === labeledMarks.length - 1;

                return (
                  <div
                    key={`label-${mark}`}
                    className="absolute top-0 pointer-events-none"
                    style={{
                      left: `${position}%`,
                      transform: isFirst
                        ? "none"
                        : isLast
                        ? "translateX(-100%)"
                        : "translateX(-50%)",
                    }}
                  >
                    <div
                      style={{
                        width: "2px",
                        height: "8px",
                        backgroundColor: "#4b5563",
                        marginBottom: "2px",
                        marginLeft: isLast ? "auto" : "0",
                      }}
                    ></div>
                    <span
                      className="block text-xs whitespace-nowrap"
                      style={{ color: "#4b5563" }}
                    >
                      {mark.toLocaleString("pl-PL")} zł
                    </span>
                  </div>
                );
              })}
            </div>
          </div>

          <style jsx>{`
            .slider-thumb::-webkit-slider-thumb {
              -webkit-appearance: none;
              appearance: none;
              width: 24px;
              height: 24px;
              border-radius: 50%;
              background: white;
              border: 3px solid ${groups[activeCategory]?.color || "#0B4C7C"};
              cursor: pointer;
              box-shadow: 0 2px 4px rgba(0, 0, 0, 0.2);
            }

            .slider-thumb::-moz-range-thumb {
              width: 24px;
              height: 24px;
              border-radius: 50%;
              background: white;
              border: 3px solid ${groups[activeCategory]?.color || "#0B4C7C"};
              cursor: pointer;
              box-shadow: 0 2px 4px rgba(0, 0, 0, 0.2);
            }
          `}</style>
        </Card>

        {/* Comparison to Average */}
        <Card variant="info" className="mb-4">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-xs text-gray-700 mb-1">
                Obecna średnia emerytura w Polsce:
              </p>
              <p className="text-2xl font-bold text-zus-grey-900">
                3 518,04 zł
              </p>
            </div>
            <Tooltip content="Średnia emerytura brutto w Polsce (dane GUS, 2024). Połowa emerytów otrzymuje mniej, połowa więcej. Twoje oczekiwania mogą być wyższe lub niższe.">
              <span className="inline-flex items-center justify-center w-10 h-10 rounded-full border-2 border-zus-green text-zus-green hover:bg-zus-green hover:text-white transition-all duration-200 cursor-help flex-shrink-0">
                <svg
                  className="w-5 h-5"
                  fill="currentColor"
                  viewBox="0 0 20 20"
                >
                  <path
                    fillRule="evenodd"
                    d="M18 10a8 8 0 11-16 0 8 8 0 0116 0zm-7-4a1 1 0 11-2 0 1 1 0 012 0zM9 9a1 1 0 000 2v3a1 1 0 001 1h1a1 1 0 100-2v-3a1 1 0 00-1-1H9z"
                    clipRule="evenodd"
                  />
                </svg>
              </span>
            </Tooltip>
          </div>
          {pension < 3518 && (
            <p className="text-xs text-gray-700 mt-2">
              💡 Twoje oczekiwania są poniżej obecnej średniej
            </p>
          )}
          {pension > 3518 && (
            <p className="text-xs text-gray-700 mt-2">
              💡 Twoje oczekiwania są powyżej obecnej średniej
            </p>
          )}
        </Card>

        {/* Distribution Chart - Split View */}
        <Card className="mb-4">
          <h3 className="text-lg font-bold text-zus-grey-900 mb-4 text-center">
            Rozkład emerytur w Polsce
          </h3>

          <div className="grid md:grid-cols-[60%_40%] gap-6">
            {/* Left side: Chart */}
            <div className="flex flex-col">
              <div className="flex-1 min-h-[400px] max-h-[500px] cursor-pointer">
                <ChartBar data={chartData} options={chartOptions} />
              </div>
              <p className="text-xs text-gray-600 text-center mt-2">
                💡 Kliknij na słupek, aby wybrać środek przedziału
              </p>
            </div>

            {/* Right side: Details */}
            <div className="min-h-[400px]">
              {activeCategory !== -1 && (
                <div
                  className="p-4 rounded-lg border-2 transition-all h-full flex flex-col"
                  style={{
                    borderColor: groups[activeCategory].color,
                    backgroundColor: `${groups[activeCategory].color}15`,
                  }}
                >
                  {/* Header with category name and selected pension */}
                  <div className="flex items-start gap-2 mb-4">
                    <div
                      className="w-8 h-8 rounded-full flex items-center justify-center flex-shrink-0"
                      style={{ backgroundColor: groups[activeCategory].color }}
                    >
                      <svg
                        className="w-5 h-5 text-white"
                        fill="currentColor"
                        viewBox="0 0 20 20"
                      >
                        <path
                          fillRule="evenodd"
                          d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z"
                          clipRule="evenodd"
                        />
                      </svg>
                    </div>
                    <div className="flex-1">
                      <h4
                        className="font-bold text-lg"
                        style={{ color: groups[activeCategory].color }}
                      >
                        {groups[activeCategory].name}
                      </h4>
                      <p className="text-2xl font-bold text-zus-grey-900 mt-1">
                        {formatPLN(pension)}
                      </p>
                    </div>
                  </div>

                  {/* Range and percentage */}
                  <div className="mb-4 pb-4 border-b border-gray-300">
                    <div className="flex items-center justify-between mb-2">
                      <span className="text-sm text-gray-600">Przedział:</span>
                      <span className="text-sm font-semibold text-gray-800">
                        {groups[activeCategory].range}
                      </span>
                    </div>
                    <div className="flex items-center justify-between">
                      <span className="text-sm text-gray-600">
                        Procent emerytów:
                      </span>
                      <span
                        className="text-sm font-bold"
                        style={{ color: groups[activeCategory].color }}
                      >
                        {groups[activeCategory].percent}%
                      </span>
                    </div>
                  </div>

                  {/* Short description */}
                  <p className="text-sm text-gray-700 mb-4 italic">
                    {groups[activeCategory].description}
                  </p>

                  {/* Detailed context */}
                  <div className="space-y-4">
                    {/* Average years of work */}
                    <div>
                      <h5 className="text-sm font-bold text-zus-grey-900 mb-1">
                        Średni staż pracy:
                      </h5>
                      <p className="text-sm text-gray-700">
                        {groups[activeCategory].details.averageYears}
                      </p>
                    </div>

                    {/* Example profile */}
                    <div>
                      <h5 className="text-sm font-bold text-zus-grey-900 mb-1">
                        Typowy profil:
                      </h5>
                      <p className="text-sm text-gray-700">
                        {groups[activeCategory].details.example}
                      </p>
                    </div>

                    {/* Bullet points with characteristics */}
                    <div>
                      <h5 className="text-sm font-bold text-zus-grey-900 mb-2">
                        Charakterystyka:
                      </h5>
                      <ul className="space-y-2">
                        {groups[activeCategory].details.bullets.map(
                          (bullet, idx) => (
                            <li
                              key={idx}
                              className="flex items-start gap-2 text-sm text-gray-700"
                            >
                              <span
                                className="w-1.5 h-1.5 rounded-full flex-shrink-0 mt-1.5"
                                style={{
                                  backgroundColor: groups[activeCategory].color,
                                }}
                              ></span>
                              <span>{bullet}</span>
                            </li>
                          )
                        )}
                      </ul>
                    </div>
                  </div>
                </div>
              )}
            </div>
          </div>
        </Card>

        {/* Fun Fact */}
        {fact && (
          <Card className="mb-4 bg-gradient-to-r from-zus-blue/10 to-zus-green/10">
            <div className="flex items-start gap-3">
              <svg
                className="w-6 h-6 text-zus-orange flex-shrink-0 mt-0.5"
                fill="currentColor"
                viewBox="0 0 20 20"
              >
                <path d="M11 3a1 1 0 10-2 0v1a1 1 0 102 0V3zM15.657 5.757a1 1 0 00-1.414-1.414l-.707.707a1 1 0 001.414 1.414l.707-.707zM18 10a1 1 0 01-1 1h-1a1 1 0 110-2h1a1 1 0 011 1zM5.05 6.464A1 1 0 106.464 5.05l-.707-.707a1 1 0 00-1.414 1.414l.707.707zM5 10a1 1 0 01-1 1H3a1 1 0 110-2h1a1 1 0 011 1zM8 16v-1h4v1a2 2 0 11-4 0zM12 14c.015-.34.208-.646.477-.859a4 4 0 10-4.954 0c.27.213.462.519.476.859h4.002z" />
              </svg>
              <div>
                <h4 className="font-bold text-zus-grey-900 mb-1 text-base">
                  Czy wiesz, że...
                </h4>
                <p className="text-sm text-gray-700">{fact}</p>
              </div>
            </div>
          </Card>
        )}

        {/* CTA Button */}
        <div className="text-center">
          <Button
            onClick={handleNext}
            variant="success"
            size="lg"
            className="w-full md:w-auto px-8 py-3 text-lg shadow-lg hover:shadow-xl transform hover:scale-105"
          >
            Przejdź do symulacji →
          </Button>
          <p className="text-xs text-gray-600 mt-2">
            Wypełnij prosty formularz i zobacz swoją prognozę
          </p>
        </div>
      </div>
    </main>
  );
}
