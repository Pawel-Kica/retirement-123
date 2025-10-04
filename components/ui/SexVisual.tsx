import React from "react";

interface SexVisualProps {
  sex: "M" | "F" | undefined;
}

export function SexVisual({ sex }: SexVisualProps) {
  return (
    <div className="flex flex-col gap-1 items-center justify-center p-3 bg-zus-green-light rounded-lg w-full min-w-0">
      <div className="flex gap-3 items-center justify-center">
        <div
          className={`text-4xl transition-all duration-200 ${
            sex === "M" ? "opacity-100 scale-110" : "opacity-30 scale-90"
          }`}
        >
          👨
        </div>
        <div
          className={`text-4xl transition-all duration-200 ${
            sex === "F" ? "opacity-100 scale-110" : "opacity-30 scale-90"
          }`}
        >
          👩
        </div>
      </div>
      {sex && (
        <p className="text-xs font-semibold text-zus-grey-900 whitespace-nowrap">
          {sex === "F" ? "Kobieta" : "Mężczyzna"}
        </p>
      )}
    </div>
  );
}
