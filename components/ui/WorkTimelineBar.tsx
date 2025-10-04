import React from "react";

interface WorkTimelineBarProps {
  workStartYear: number | undefined;
  workEndYear: number | undefined;
  currentYear: number;
}

export function WorkTimelineBar({
  workStartYear,
  workEndYear,
  currentYear,
}: WorkTimelineBarProps) {
  // Calculate years
  const yearsWorked = workStartYear
    ? Math.max(0, currentYear - workStartYear)
    : 0;
  const yearsToRetirement = workEndYear
    ? Math.max(0, workEndYear - currentYear)
    : 0;
  const totalYears = yearsWorked + yearsToRetirement;

  // Calculate percentages for width
  const workedPercent = totalYears > 0 ? (yearsWorked / totalYears) * 100 : 0;
  const remainingPercent =
    totalYears > 0 ? (yearsToRetirement / totalYears) * 100 : 0;

  if (!workStartYear || !workEndYear) {
    return (
      <div className="p-6 bg-zus-grey-100 rounded-lg">
        <p className="text-center text-zus-grey-500 text-sm">
          Uzupełnij daty rozpoczęcia i zakończenia pracy
        </p>
      </div>
    );
  }

  return (
    <div className="p-6 bg-white border border-zus-grey-300 rounded-lg">
      <h3 className="text-lg font-semibold text-zus-grey-900 mb-4">
        Ścieżka kariery
      </h3>

      {/* Legend */}
      <div className="flex gap-4 mb-4 text-sm">
        <div className="flex items-center gap-2">
          <div className="w-4 h-4 bg-zus-green rounded"></div>
          <span className="text-zus-grey-700">Przepracowane</span>
        </div>
        <div className="flex items-center gap-2">
          <div className="w-4 h-4 bg-zus-grey-300 rounded"></div>
          <span className="text-zus-grey-700">Do emerytury</span>
        </div>
      </div>

      {/* Timeline Bar */}
      <div className="relative">
        <svg width="100%" height="60" className="overflow-visible">
          {/* Background track */}
          <rect x="0" y="20" width="100%" height="20" fill="#E0E0E0" rx="4" />

          {/* Years worked segment */}
          <rect
            x="0"
            y="20"
            width={`${workedPercent}%`}
            height="20"
            fill="#00843D"
            rx="4"
            style={{
              transition: "width 200ms ease-in-out",
            }}
          />

          {/* Labels */}
          {yearsWorked > 0 && (
            <text
              x={`${workedPercent / 2}%`}
              y="32"
              textAnchor="middle"
              fill="white"
              fontSize="12"
              fontWeight="600"
            >
              {yearsWorked}{" "}
              {yearsWorked === 1 ? "rok" : yearsWorked < 5 ? "lata" : "lat"}
            </text>
          )}

          {yearsToRetirement > 0 && (
            <text
              x={`${workedPercent + remainingPercent / 2}%`}
              y="32"
              textAnchor="middle"
              fill="#757575"
              fontSize="12"
              fontWeight="600"
            >
              {yearsToRetirement}{" "}
              {yearsToRetirement === 1
                ? "rok"
                : yearsToRetirement < 5
                ? "lata"
                : "lat"}
            </text>
          )}
        </svg>
      </div>

      {/* Summary stats */}
      <div className="mt-4 grid grid-cols-2 gap-4 text-center">
        <div className="p-3 bg-zus-green-light rounded">
          <p className="text-2xl font-bold text-zus-green">{yearsWorked}</p>
          <p className="text-xs text-zus-grey-700">Przepracowanych lat</p>
        </div>
        <div className="p-3 bg-zus-grey-100 rounded">
          <p className="text-2xl font-bold text-zus-grey-700">
            {yearsToRetirement}
          </p>
          <p className="text-xs text-zus-grey-700">Lat do emerytury</p>
        </div>
      </div>
    </div>
  );
}
