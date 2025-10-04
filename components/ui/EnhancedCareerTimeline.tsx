import React from "react";
import {
  EmploymentPeriod,
  EmploymentGapPeriod,
  LifeEvent,
  ContractType,
} from "@/lib/types";
import { calculateEndDate } from "@/lib/utils/simulationHistory";
import { Briefcase, Baby, Plane, TrendingDown, Activity } from "lucide-react";

interface EnhancedCareerTimelineProps {
  contractPeriods: EmploymentPeriod[];
  gapPeriods: EmploymentGapPeriod[];
  lifeEvents: LifeEvent[];
  currentYear: number;
  workStartYear: number;
  workEndYear: number;
  onEditEmployment?: (period: EmploymentPeriod) => void;
  onEditGap?: (gap: EmploymentGapPeriod) => void;
  onEditSickLeave?: (event: LifeEvent) => void;
}

const getContractColor = (contractType: ContractType): string => {
  switch (contractType) {
    case "UOP":
      return "bg-zus-green";
    case "UOZ":
      return "bg-zus-navy";
    case "B2B":
      return "bg-zus-teal";
    default:
      return "bg-zus-grey-500";
  }
};

const getContractLabel = (contractType: ContractType): string => {
  switch (contractType) {
    case "UOP":
      return "Umowa o Pracę";
    case "UOZ":
      return "Umowa Zlecenie";
    case "B2B":
      return "Działalność/B2B";
    default:
      return contractType;
  }
};

const getGapColor = (kind: EmploymentGapPeriod["kind"]): string => {
  switch (kind) {
    case "MATERNITY_LEAVE":
      return "bg-pink-200";
    case "UNPAID_LEAVE":
      return "bg-orange-200";
    case "UNEMPLOYMENT":
      return "bg-zus-grey-300";
    default:
      return "bg-zus-grey-200";
  }
};

const getGapIcon = (kind: EmploymentGapPeriod["kind"]) => {
  switch (kind) {
    case "MATERNITY_LEAVE":
      return <Baby className="w-4 h-4" />;
    case "UNPAID_LEAVE":
      return <Plane className="w-4 h-4" />;
    case "UNEMPLOYMENT":
      return <TrendingDown className="w-4 h-4" />;
  }
};

const getGapLabel = (kind: EmploymentGapPeriod["kind"]): string => {
  switch (kind) {
    case "MATERNITY_LEAVE":
      return "Urlop macierzyński";
    case "UNPAID_LEAVE":
      return "Urlop bezpłatny";
    case "UNEMPLOYMENT":
      return "Bezrobocie";
  }
};

export function EnhancedCareerTimeline({
  contractPeriods,
  gapPeriods,
  lifeEvents,
  currentYear,
  workStartYear,
  workEndYear,
  onEditEmployment,
  onEditGap,
  onEditSickLeave,
}: EnhancedCareerTimelineProps) {
  const totalYears = workEndYear - workStartYear + 1;
  const years = Array.from({ length: totalYears }, (_, i) => workStartYear + i);

  // Calculate position and width for employment periods
  const getPeriodStyle = (period: EmploymentPeriod) => {
    const startMonth =
      (period.startYear - workStartYear) * 12 + (period.startMonth || 1);
    const endMonth =
      (period.endYear - workStartYear) * 12 + (period.endMonth || 12);
    const totalMonths = totalYears * 12;

    const left = (startMonth / totalMonths) * 100;
    const width = ((endMonth - startMonth + 1) / totalMonths) * 100;

    return { left: `${left}%`, width: `${width}%` };
  };

  // Calculate position and width for gap periods
  const getGapStyle = (gap: EmploymentGapPeriod) => {
    const startMonth = (gap.startYear - workStartYear) * 12 + gap.startMonth;
    const totalMonths = totalYears * 12;

    const left = (startMonth / totalMonths) * 100;
    const width = (gap.durationMonths / totalMonths) * 100;

    return { left: `${left}%`, width: `${width}%` };
  };

  // Calculate position for sick leave events
  const getSickLeaveStyle = (event: LifeEvent) => {
    const monthPosition =
      (event.year - workStartYear) * 12 + (event.month || 1);
    const totalMonths = totalYears * 12;

    const left = (monthPosition / totalMonths) * 100;

    return { left: `${left}%` };
  };

  // Display every N years for labels
  const displayYearInterval = Math.max(Math.floor(totalYears / 10), 1);
  const displayYears = years.filter(
    (year, index) => index % displayYearInterval === 0 || year === workEndYear
  );

  return (
    <div className="w-full space-y-4">
      {/* Timeline Container */}
      <div className="relative w-full">
        {/* Year Labels */}
        <div className="relative w-full h-6 mb-2">
          {displayYears.map((year) => {
            const position = ((year - workStartYear) / totalYears) * 100;
            return (
              <div
                key={year}
                className="absolute transform -translate-x-1/2"
                style={{ left: `${position}%` }}
              >
                <span
                  className={`text-xs font-semibold ${
                    year === currentYear
                      ? "text-zus-orange"
                      : year > currentYear
                      ? "text-zus-green"
                      : "text-zus-grey-600"
                  }`}
                >
                  {year}
                </span>
              </div>
            );
          })}
        </div>

        {/* Main Timeline Bar - Employment Periods */}
        <div className="relative w-full h-16 bg-zus-grey-200 rounded-lg overflow-hidden">
          {contractPeriods.map((period) => (
            <div
              key={period.id}
              className={`absolute h-full ${getContractColor(
                period.contractType
              )} hover:opacity-80 transition-opacity cursor-pointer group`}
              style={getPeriodStyle(period)}
              onClick={() => onEditEmployment?.(period)}
            >
              {/* Tooltip */}
              <div className="absolute bottom-full mb-2 left-1/2 transform -translate-x-1/2 bg-zus-grey-900 text-white text-xs rounded-lg px-3 py-2 whitespace-nowrap opacity-0 group-hover:opacity-100 transition-opacity z-10 pointer-events-none">
                <div className="font-bold">
                  {getContractLabel(period.contractType)}
                </div>
                <div>
                  {period.startMonth}/{period.startYear} - {period.endMonth}/
                  {period.endYear}
                </div>
                <div>{period.monthlyGross.toLocaleString("pl-PL")} zł/mc</div>
                {period.description && (
                  <div className="text-zus-grey-300 mt-1">
                    {period.description}
                  </div>
                )}
                <div className="text-zus-green-light mt-1 text-[10px]">
                  Kliknij aby edytować
                </div>
              </div>

              {/* Period Label (for wider periods) */}
              <div className="h-full flex items-center justify-center px-2">
                <span className="text-white text-xs font-semibold truncate">
                  <Briefcase className="w-4 h-4 inline mr-1" />
                  {getContractLabel(period.contractType)}
                </span>
              </div>
            </div>
          ))}

          {/* Current Year Indicator */}
          <div
            className="absolute top-0 bottom-0 w-0.5 bg-zus-orange z-20 pointer-events-none"
            style={{
              left: `${((currentYear - workStartYear) / totalYears) * 100}%`,
            }}
          >
            <div className="absolute -top-8 left-1/2 transform -translate-x-1/2 text-xs font-bold text-zus-orange whitespace-nowrap">
              Dzisiaj
            </div>
          </div>
        </div>

        {/* Gap Periods Overlay */}
        {gapPeriods.length > 0 && (
          <div className="relative w-full h-12 -mt-16 z-10">
            {gapPeriods.map((gap) => {
              const endDate = calculateEndDate(
                gap.startYear,
                gap.startMonth,
                gap.durationMonths
              );
              return (
                <div
                  key={gap.id}
                  className={`absolute h-full ${getGapColor(
                    gap.kind
                  )} border-2 border-white hover:opacity-80 transition-opacity cursor-pointer group rounded`}
                  style={getGapStyle(gap)}
                  onClick={() => onEditGap?.(gap)}
                >
                  {/* Tooltip */}
                  <div className="absolute bottom-full mb-2 left-1/2 transform -translate-x-1/2 bg-zus-grey-900 text-white text-xs rounded-lg px-3 py-2 whitespace-nowrap opacity-0 group-hover:opacity-100 transition-opacity z-30 pointer-events-none">
                    <div className="font-bold">{getGapLabel(gap.kind)}</div>
                    <div>
                      {gap.startMonth}/{gap.startYear} - {endDate.endMonth}/
                      {endDate.endYear}
                    </div>
                    <div>Długość: {gap.durationMonths} miesięcy</div>
                    {gap.description && (
                      <div className="text-zus-grey-300 mt-1">
                        {gap.description}
                      </div>
                    )}
                    <div className="text-zus-green-light mt-1 text-[10px]">
                      Kliknij aby edytować
                    </div>
                  </div>

                  {/* Gap Icon */}
                  <div className="h-full flex items-center justify-center">
                    <div className="text-zus-grey-700">
                      {getGapIcon(gap.kind)}
                    </div>
                  </div>
                </div>
              );
            })}
          </div>
        )}

        {/* Sick Leave Markers */}
        {lifeEvents.length > 0 && (
          <div className="relative w-full h-8 mt-2">
            {lifeEvents
              .filter((event) => event.type === "SICK_LEAVE")
              .map((event) => (
                <div
                  key={event.id}
                  className="absolute transform -translate-x-1/2 cursor-pointer group"
                  style={getSickLeaveStyle(event)}
                  onClick={() => onEditSickLeave?.(event)}
                >
                  {/* Sick Leave Marker */}
                  <div className="w-8 h-8 rounded-full bg-zus-error flex items-center justify-center text-white shadow-lg hover:scale-110 transition-transform">
                    <Activity className="w-4 h-4" />
                  </div>

                  {/* Tooltip */}
                  <div className="absolute bottom-full mb-2 left-1/2 transform -translate-x-1/2 bg-zus-grey-900 text-white text-xs rounded-lg px-3 py-2 whitespace-nowrap opacity-0 group-hover:opacity-100 transition-opacity z-30 pointer-events-none">
                    <div className="font-bold">Długie zwolnienie (L4)</div>
                    <div>
                      {event.month}/{event.year}
                    </div>
                    <div>
                      Długość: {event.durationYears}{" "}
                      {event.durationYears === 1
                        ? "rok"
                        : event.durationYears && event.durationYears < 5
                        ? "lata"
                        : "lat"}
                    </div>
                    {event.description && (
                      <div className="text-zus-grey-300 mt-1">
                        {event.description}
                      </div>
                    )}
                    <div className="text-zus-green-light mt-1 text-[10px]">
                      Kliknij aby edytować
                    </div>
                  </div>
                </div>
              ))}
          </div>
        )}
      </div>

      {/* Legend */}
      <div className="flex flex-wrap gap-4 justify-center text-xs mt-4">
        <div className="flex items-center gap-2">
          <div className="w-4 h-4 rounded bg-zus-green"></div>
          <span className="text-zus-grey-700">UOP</span>
        </div>
        <div className="flex items-center gap-2">
          <div className="w-4 h-4 rounded bg-zus-navy"></div>
          <span className="text-zus-grey-700">UOZ</span>
        </div>
        <div className="flex items-center gap-2">
          <div className="w-4 h-4 rounded bg-zus-teal"></div>
          <span className="text-zus-grey-700">B2B</span>
        </div>
        <div className="w-px h-4 bg-zus-grey-300"></div>
        <div className="flex items-center gap-2">
          <Baby className="w-4 h-4 text-pink-600" />
          <span className="text-zus-grey-700">Urlop macierzyński</span>
        </div>
        <div className="flex items-center gap-2">
          <Plane className="w-4 h-4 text-orange-600" />
          <span className="text-zus-grey-700">Urlop bezpłatny</span>
        </div>
        <div className="flex items-center gap-2">
          <TrendingDown className="w-4 h-4 text-zus-grey-600" />
          <span className="text-zus-grey-700">Bezrobocie</span>
        </div>
        <div className="flex items-center gap-2">
          <Activity className="w-4 h-4 text-zus-error" />
          <span className="text-zus-grey-700">Długie L4</span>
        </div>
      </div>
    </div>
  );
}
