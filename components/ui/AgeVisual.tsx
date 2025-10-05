import React from "react";

interface AgeVisualProps {
  age: number | undefined;
  sex?: "M" | "F";
}

function getAgeEmoji(
  age: number | undefined,
  sex: "M" | "F" | undefined
): {
  emoji: string;
  label: string;
} {
  if (!age || age < 18) {
    return { emoji: "❓", label: "Podaj wiek" };
  }

  // Female emojis
  if (sex === "F") {
    if (age <= 19) {
      return { emoji: "👧", label: "Nastolatka" };
    } else if (age <= 29) {
      return { emoji: "👩", label: "Młoda dorosła" };
    } else if (age <= 44) {
      return { emoji: "👩", label: "Dorosła" };
    } else if (age <= 59) {
      return { emoji: "👩‍🦳", label: "Dojrzała" };
    } else {
      return { emoji: "👵", label: "Seniorka" };
    }
  }

  // Male emojis (default)
  if (age <= 19) {
    return { emoji: "🧒", label: "Nastolatek" };
  } else if (age <= 29) {
    return { emoji: "🧑", label: "Młody dorosły" };
  } else if (age <= 44) {
    return { emoji: "🧔", label: "Dorosły" };
  } else if (age <= 59) {
    return { emoji: "🧓", label: "Dojrzały" };
  } else {
    return { emoji: "👴", label: "Senior" };
  }
}

export function AgeVisual({ age, sex }: AgeVisualProps) {
  const { emoji, label } = getAgeEmoji(age, sex);

  return (
    <div className="flex flex-col items-center justify-center p-3 bg-zus-green-light rounded-lg transition-all duration-200 ease-in-out w-full min-w-0">
      <div
        className="text-5xl mb-1 transition-all duration-200 ease-in-out"
        key={age}
        style={{
          animation: "fadeInScale 200ms ease-in-out",
        }}
      >
        {emoji}
      </div>
      <div className="text-center">
        <p className="text-xl font-bold text-zus-grey-900">
          {age !== undefined ? `${age}` : "—"}
        </p>
        <p className="text-xs text-zus-grey-700 whitespace-nowrap">{label}</p>
      </div>
      <style jsx>{`
        @keyframes fadeInScale {
          from {
            opacity: 0.5;
            transform: scale(0.9);
          }
          to {
            opacity: 1;
            transform: scale(1);
          }
        }
      `}</style>
    </div>
  );
}
