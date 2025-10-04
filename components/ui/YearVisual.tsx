import React from "react";

interface YearVisualProps {
  startYear: number | undefined;
  endYear: number | undefined;
  currentYear: number;
  age?: number;
  type: "start" | "end";
}

export function YearVisual({
  startYear,
  endYear,
  currentYear,
  age,
  type,
}: YearVisualProps) {
  const yearsWorked = startYear ? Math.max(0, currentYear - startYear) : 0;
  const yearsToRetirement = endYear ? Math.max(0, endYear - currentYear) : 0;
  const yearTurned18 = age ? currentYear - age + 18 : undefined;

  if (type === "start") {
    return (
      <div className="flex flex-col gap-3 p-4 bg-zus-green-light rounded-lg w-full transition-all duration-200 min-w-0">
        {/* Timeline Header */}
        <div className="flex items-baseline gap-2 justify-center">
          <div className="text-2xl">📅</div>
          <p className="text-3xl font-bold text-zus-green">{yearsWorked}</p>
          <p className="text-sm text-zus-grey-700 font-medium whitespace-nowrap">
            {yearsWorked === 1 ? "rok" : yearsWorked < 5 ? "lata" : "lat"}{" "}
            przepracowanych
          </p>
        </div>
        {/* Timeline Visual */}
        {startYear && age && yearTurned18 && (
          <div className="space-y-2 pt-2 border-t border-zus-green/20">
            {/* Year turned 18 */}
            <div className="flex items-center gap-2">
              <div className="flex-shrink-0 w-8 h-8 rounded-full bg-zus-grey-300 flex items-center justify-center">
                <span className="text-xs">🎓</span>
              </div>
              <div className="flex-1 min-w-0">
                <p className="text-xs font-semibold text-zus-grey-900">
                  Ukończenie 18 lat
                </p>
                <p className="text-xs text-zus-grey-600">Rok {yearTurned18}</p>
              </div>
            </div>

            {/* Connector line */}
            <div className="ml-4 h-4 border-l-2 border-dashed border-zus-green/30"></div>

            {/* Year started work */}
            <div className="flex items-center gap-2">
              <div className="flex-shrink-0 w-8 h-8 rounded-full bg-zus-green flex items-center justify-center">
                <span className="text-xs">💼</span>
              </div>
              <div className="flex-1 min-w-0">
                <p className="text-xs font-semibold text-zus-grey-900">
                  Początek pracy
                </p>
                <p className="text-xs text-zus-grey-600">Rok {startYear}</p>
              </div>
            </div>

            {/* Years worked indicator */}
            {yearsWorked > 0 && (
              <>
                <div className="ml-4 h-4 border-l-2 border-dashed border-zus-green"></div>
                <div className="flex items-center gap-2">
                  <div className="flex-shrink-0 w-8 h-8 rounded-full bg-zus-navy flex items-center justify-center">
                    <span className="text-xs">📍</span>
                  </div>
                  <div className="flex-1 min-w-0">
                    <p className="text-xs font-semibold text-zus-grey-900">
                      Dzisiaj ({currentYear})
                    </p>
                    <p className="text-xs text-zus-green font-bold">
                      ✓ {yearsWorked}{" "}
                      {yearsWorked === 1
                        ? "rok"
                        : yearsWorked < 5
                        ? "lata"
                        : "lat"}{" "}
                      stażu
                    </p>
                  </div>
                </div>
              </>
            )}
          </div>
        )}
        {/* Fallback if no age provided */}
        {(!age || !yearTurned18) && startYear && yearsWorked > 0 && (
          <div className="pt-2 border-t border-zus-green/20">
            <div className="flex items-center justify-between text-xs">
              <span className="text-zus-grey-600">Rok rozpoczęcia:</span>
              <span className="font-bold text-zus-grey-900">{startYear}</span>
            </div>
            <div className="flex items-center justify-between text-xs mt-1">
              <span className="text-zus-grey-600">Lata pracy:</span>
              <span className="font-bold text-zus-green">{yearsWorked}</span>
            </div>
          </div>
        )}
      </div>
    );
  }

  return (
    <div className="flex flex-col gap-3 p-4 bg-zus-green-light rounded-lg w-full transition-all duration-200 min-w-0">
      {/* Years to retirement */}
      <div className="flex items-baseline gap-2 justify-center">
        <div className="text-2xl">🎯</div>
        <p className="text-3xl font-bold text-zus-orange">
          {yearsToRetirement}
        </p>
        <p className="text-sm text-zus-grey-700 font-medium whitespace-nowrap">
          {yearsToRetirement === 1
            ? "rok"
            : yearsToRetirement < 5
            ? "lata"
            : "lat"}{" "}
          do emerytury
        </p>
      </div>

      {/* Timeline for end year */}
      {startYear && endYear && (
        <div className="space-y-2 pt-2 border-t border-zus-orange/20">
          {/* Today */}
          <div className="flex items-center gap-2">
            <div className="flex-shrink-0 w-8 h-8 rounded-full bg-zus-navy flex items-center justify-center">
              <span className="text-xs">📍</span>
            </div>
            <div className="flex-1 min-w-0">
              <p className="text-xs font-semibold text-zus-grey-900">Dzisiaj</p>
              <p className="text-xs text-zus-grey-600">Rok {currentYear}</p>
            </div>
          </div>

          {/* Connector line */}
          <div className="ml-4 h-4 border-l-2 border-dashed border-zus-orange/30"></div>

          {/* Retirement year */}
          <div className="flex items-center gap-2">
            <div className="flex-shrink-0 w-8 h-8 rounded-full bg-zus-orange flex items-center justify-center">
              <span className="text-xs">🏖️</span>
            </div>
            <div className="flex-1 min-w-0">
              <p className="text-xs font-semibold text-zus-grey-900">
                Planowana emerytura
              </p>
              <p className="text-xs text-zus-grey-600">Rok {endYear}</p>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
