import React from "react";
import { AgeEmojiBadge } from "./AgeEmojiBadge";
import { WorkTimelineBar } from "./WorkTimelineBar";

interface LivePreviewProps {
  age: number | undefined;
  workStartYear: number | undefined;
  workEndYear: number | undefined;
  currentYear: number;
}

export function LivePreview({
  age,
  workStartYear,
  workEndYear,
  currentYear,
}: LivePreviewProps) {
  return (
    <div className="lg:sticky lg:top-24 space-y-4">
      <div className="bg-white border border-zus-grey-300 rounded-lg shadow-sm p-6">
        <h2 className="text-xl font-bold text-zus-grey-900 mb-4 flex items-center gap-2">
          <span>📊</span>
          <span>Podgląd na żywo</span>
        </h2>

        <div className="space-y-4">
          <AgeEmojiBadge age={age} />
          <WorkTimelineBar
            workStartYear={workStartYear}
            workEndYear={workEndYear}
            currentYear={currentYear}
          />
        </div>

        <div className="mt-4 p-3 bg-zus-green-light rounded text-sm text-zus-grey-700">
          <p className="font-semibold mb-1">💡 Podpowiedź:</p>
          <p>
            Podgląd aktualizuje się automatycznie podczas wypełniania
            formularza.
          </p>
        </div>
      </div>
    </div>
  );
}
