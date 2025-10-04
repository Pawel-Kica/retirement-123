import React from "react";

interface SalaryVisualProps {
  salary: number | undefined;
}

export function SalaryVisual({ salary }: SalaryVisualProps) {
  // Determine how many money bags to show based on salary
  const getMoneyBags = (amount: number | undefined): number => {
    if (!amount) return 0;
    if (amount < 3000) return 1;
    if (amount < 6000) return 2;
    if (amount < 10000) return 3;
    if (amount < 20000) return 4;
    return 5;
  };

  const bags = getMoneyBags(salary);
  const formattedSalary = salary
    ? new Intl.NumberFormat("pl-PL").format(salary)
    : "—";

  return (
    <div className="flex flex-col items-center justify-center p-3 bg-zus-green-light rounded-lg w-full transition-all duration-200 min-w-0">
      <div className="flex gap-1 mb-1">
        {[1, 2, 3, 4, 5].map((i) => (
          <span
            key={i}
            className={`text-2xl transition-all duration-200 ${
              i <= bags ? "opacity-100 scale-100" : "opacity-20 scale-75"
            }`}
          >
            💰
          </span>
        ))}
      </div>
      <p className="text-lg font-bold text-zus-grey-900 whitespace-nowrap">
        {formattedSalary} zł
      </p>
      <p className="text-xs text-zus-grey-700 whitespace-nowrap">
        brutto/miesiąc
      </p>
    </div>
  );
}
