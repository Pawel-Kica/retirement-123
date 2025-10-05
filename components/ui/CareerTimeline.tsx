"use client";

import { useMemo, useState } from "react";
import {
  CapitalEntry,
  EmploymentGapPeriod,
  EmploymentPeriod,
  LifeEvent,
  SalaryPathEntry,
} from "@/lib/types";
import { formatPLN } from "@/lib/utils/formatting";

interface CareerTimelineProps {
  salaryPath: SalaryPathEntry[];
  capitalPath: CapitalEntry[];
  contractPeriods?: EmploymentPeriod[];
  gapPeriods?: EmploymentGapPeriod[];
  lifeEvents?: LifeEvent[];
  currentYear: number;
  retirementYear: number;
  onChangeRetirementYear?: (year: number) => void;
  onAddMaternity?: () => void;
  onAddUnpaid?: () => void;
  onAddSickPoint?: () => void;
}

export function CareerTimeline(props: CareerTimelineProps) {
  const {
    salaryPath,
    lifeEvents = [],
    gapPeriods = [],
    currentYear,
    retirementYear,
    onChangeRetirementYear,
  } = props;

  const [hoverYear, setHoverYear] = useState<number | null>(null);

  const startYear = salaryPath[0]?.year || currentYear;
  const endYear = salaryPath[salaryPath.length - 1]?.year || retirementYear;

  // Calculate milestone years (every ~5-7 years)
  const milestones = useMemo(() => {
    const years: number[] = [];
    const totalYears = endYear - startYear;
    const step = Math.max(Math.floor(totalYears / 6), 5);

    years.push(startYear); // Start
    for (let year = startYear + step; year < endYear; year += step) {
      years.push(year);
    }
    if (
      !years.includes(currentYear) &&
      currentYear >= startYear &&
      currentYear <= endYear
    ) {
      years.push(currentYear);
    }
    if (!years.includes(retirementYear)) {
      years.push(retirementYear);
    }

    return years.sort((a, b) => a - b);
  }, [startYear, endYear, currentYear, retirementYear]);

  const getPositionForYear = (year: number) => {
    return ((year - startYear) / (endYear - startYear)) * 100;
  };

  const getMilestoneLabel = (year: number) => {
    const entry = salaryPath.find((e) => e.year === year);
    if (year === currentYear) return "Dziś";
    if (year === retirementYear) return "Emerytura";
    if (year === startYear) return "Start kariery";
    return year.toString();
  };

  return (
    <div className="w-full py-6">
      {/* Timeline Bar */}
      <div className="relative h-3 bg-zus-grey-300 rounded-full mb-16">
        {/* Progress bar to current year */}
        <div
          className="absolute top-0 left-0 h-full bg-zus-green rounded-full transition-all"
          style={{ width: `${getPositionForYear(currentYear)}%` }}
        />

        {/* Future progress (lighter) */}
        <div
          className="absolute top-0 h-full bg-zus-green/30 rounded-full transition-all"
          style={{
            left: `${getPositionForYear(currentYear)}%`,
            width: `${
              getPositionForYear(retirementYear) -
              getPositionForYear(currentYear)
            }%`,
          }}
        />

        {/* Gap periods overlay */}
        {gapPeriods.map((gap) => {
          const gapStart = getPositionForYear(gap.startYear);
          const gapEndYear = gap.startYear + (gap.startMonth - 1 + gap.durationMonths) / 12;
          const gapEnd = getPositionForYear(gapEndYear);
          const gapColor =
            gap.kind === "MATERNITY_LEAVE"
              ? "bg-purple-400"
              : gap.kind === "UNPAID_LEAVE"
              ? "bg-zus-grey-500"
              : "bg-zus-error";

          return (
            <div
              key={gap.id}
              className={`absolute top-0 h-full ${gapColor} opacity-70`}
              style={{
                left: `${gapStart}%`,
                width: `${gapEnd - gapStart}%`,
              }}
            />
          );
        })}

        {/* Milestone markers */}
        {milestones.map((year) => {
          const pos = getPositionForYear(year);
          const isCurrentYear = year === currentYear;
          const isRetirement = year === retirementYear;
          const entry = salaryPath.find((e) => e.year === year);

          return (
            <div
              key={year}
              className="absolute -translate-x-1/2 cursor-pointer"
              style={{ left: `${pos}%`, top: "-4px" }}
              onMouseEnter={() => setHoverYear(year)}
              onMouseLeave={() => setHoverYear(null)}
            >
              {/* Marker dot */}
              <div
                className={`w-5 h-5 rounded-full border-4 border-white shadow-lg transition-all ${
                  isCurrentYear
                    ? "bg-zus-orange scale-125"
                    : isRetirement
                    ? "bg-zus-blue scale-110"
                    : "bg-zus-green hover:scale-110"
                }`}
              />

              {/* Label below */}
              <div className="absolute top-8 left-1/2 -translate-x-1/2 text-center whitespace-nowrap">
                <div
                  className={`text-xs font-semibold ${
                    isCurrentYear
                      ? "text-zus-orange"
                      : isRetirement
                      ? "text-zus-blue"
                      : "text-zus-grey-700"
                  }`}
                >
                  {getMilestoneLabel(year)}
                </div>
                {entry && (
                  <div className="text-xs text-zus-grey-600 mt-1">
                    {formatPLN(entry.monthlyGross)}
                  </div>
                )}
              </div>

              {/* Hover tooltip */}
              {hoverYear === year && entry && (
                <div className="absolute -top-16 left-1/2 -translate-x-1/2 bg-zus-grey-900 text-white text-xs px-3 py-2 rounded-lg shadow-xl whitespace-nowrap z-10">
                  <div className="font-bold">{year}</div>
                  <div>Wiek: {entry.age} lat</div>
                  <div>{formatPLN(entry.monthlyGross)}/mc</div>
                </div>
              )}

              {/* Vertical line */}
              <div className="absolute top-6 left-1/2 -translate-x-1/2 w-px h-2 bg-zus-grey-400" />
            </div>
          );
        })}

        {/* Life events (zwolnienie zdrowotne) */}
        {lifeEvents.map((event) => {
          const pos = getPositionForYear(event.year);

          return (
            <div
              key={event.id}
              className="absolute -translate-x-1/2"
              style={{ left: `${pos}%`, top: "-18px" }}
            >
              <div className="text-lg cursor-pointer hover:scale-125 transition-transform">
                🏥
              </div>
            </div>
          );
        })}
      </div>

      {/* Legend */}
      <div className="flex items-center justify-center gap-6 text-xs text-zus-grey-700 mt-4">
        <div className="flex items-center gap-2">
          <div className="w-3 h-3 rounded-full bg-zus-green"></div>
          <span>Kariera</span>
        </div>
        <div className="flex items-center gap-2">
          <div className="w-3 h-3 rounded-full bg-zus-orange"></div>
          <span>Dziś</span>
        </div>
        <div className="flex items-center gap-2">
          <div className="w-3 h-3 rounded-full bg-zus-blue"></div>
          <span>Emerytura</span>
        </div>
        {gapPeriods.length > 0 && (
          <>
            <div className="flex items-center gap-2">
              <div className="w-3 h-3 rounded-full bg-purple-400"></div>
              <span>Urlop macierzyński</span>
            </div>
            <div className="flex items-center gap-2">
              <div className="w-3 h-3 rounded-full bg-zus-grey-500"></div>
              <span>Urlop bezpłatny</span>
            </div>
          </>
        )}
        {lifeEvents.length > 0 && (
          <div className="flex items-center gap-2">
            <span>🏥</span>
            <span>Długie zwolnienie zdrowotne</span>
          </div>
        )}
      </div>
    </div>
  );
}

export default CareerTimeline;
