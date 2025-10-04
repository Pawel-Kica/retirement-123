import React from "react";

interface YearVisualProps {
  startYear: number | undefined;
  endYear: number | undefined;
  currentYear: number;
  type: "start" | "end";
}

export function YearVisual({
  startYear,
  endYear,
  currentYear,
  type,
}: YearVisualProps) {
  const yearsWorked = startYear ? Math.max(0, currentYear - startYear) : 0;
  const yearsToRetirement = endYear ? Math.max(0, endYear - currentYear) : 0;

  if (type === "start") {
    return (
      <div className="flex flex-col items-center justify-center p-3 bg-zus-green-light rounded-lg w-full transition-all duration-200 min-w-0">
        <div className="text-4xl mb-1">📅</div>
        <p className="text-2xl font-bold text-zus-green">{yearsWorked}</p>
        <p className="text-xs text-zus-grey-700 whitespace-nowrap">
          {yearsWorked === 1 ? "rok" : yearsWorked < 5 ? "lata" : "lat"}{" "}
          przepracowanych
        </p>
      </div>
    );
  }

  return (
    <div className="flex flex-col items-center justify-center p-3 bg-zus-green-light rounded-lg w-full transition-all duration-200 min-w-0">
      <div className="text-4xl mb-1">🎯</div>
      <p className="text-2xl font-bold text-zus-orange">{yearsToRetirement}</p>
      <p className="text-xs text-zus-grey-700 whitespace-nowrap">
        {yearsToRetirement === 1
          ? "rok"
          : yearsToRetirement < 5
          ? "lata"
          : "lat"}{" "}
        do emerytury
      </p>
    </div>
  );
}
