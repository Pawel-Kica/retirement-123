import { useState, useMemo } from "react";
import { Card } from "@/components/ui/Card";
import { Line } from "react-chartjs-2";
import { TrendingUp, DollarSign } from "lucide-react";
import { formatPLN } from "@/lib/utils/formatting";
import type {
  PensionResults,
  SimulationInputs,
  DashboardModifications,
} from "@/lib/types";

interface SalaryGrowthImpactProps {
  results: PensionResults;
  inputs?: SimulationInputs;
  modifications?: DashboardModifications;
}

/**
 * Widget showing how salary increases over career impact pension
 * Shows 40-year projection with 10% increases every 5 years
 */
export function SalaryGrowthImpact({
  results,
  inputs,
  modifications,
}: SalaryGrowthImpactProps) {
  // Calculate average salary from employment periods (Okresy zatrudnienia)
  const averageSalary = useMemo(() => {
    // First try to get from contract periods in modifications
    if (
      modifications?.contractPeriods &&
      modifications.contractPeriods.length > 0
    ) {
      const totalSalary = modifications.contractPeriods.reduce(
        (sum, period) => sum + period.monthlyGross,
        0
      );
      return totalSalary / modifications.contractPeriods.length;
    }

    // Then try from inputs.employmentPeriods
    if (inputs?.employmentPeriods && inputs.employmentPeriods.length > 0) {
      const totalSalary = inputs.employmentPeriods.reduce(
        (sum, period) => sum + period.monthlyGross,
        0
      );
      return totalSalary / inputs.employmentPeriods.length;
    }

    // Fallback to basic monthly gross from inputs
    if (inputs?.monthlyGross) {
      return inputs.monthlyGross;
    }

    // Last resort fallback
    return 5000;
  }, [
    modifications?.contractPeriods,
    inputs?.employmentPeriods,
    inputs?.monthlyGross,
  ]);

  // Generate salary growth scenarios over 30 years (10% every 3 years)
  const salaryGrowthData = useMemo(() => {
    const data = [];
    let currentSalary = averageSalary;
    let currentPension = results.realPension;

    // Year 0 (current)
    data.push({
      year: 0,
      salary: currentSalary,
      pension: currentPension,
    });

    // Generate 30 years in 3-year increments
    for (let year = 3; year <= 30; year += 3) {
      // 10% salary increase every 3 years
      currentSalary = currentSalary * 1.1;

      // Pension impact: roughly proportional to salary increase
      // Using 0.85 multiplier to show realistic pension replacement rate
      currentPension = currentPension * 1.085;

      data.push({
        year,
        salary: currentSalary,
        pension: currentPension,
      });
    }

    return data;
  }, [averageSalary, results.realPension]);

  return (
    <Card className="h-full">
      <div className="mb-6">
        <div className="flex items-center gap-2 mb-2">
          <TrendingUp className="w-6 h-6 text-zus-green" />
          <h3 className="text-xl font-bold text-zus-grey-900">
            Wpływ wzrostu wynagrodzenia na emeryturę
          </h3>
        </div>
        <p className="text-sm text-zus-grey-600">
          Inwestowanie w edukację i rozwój kariery to najlepsza inwestycja!
          Zobacz jak wzrost wynagrodzenia o 10% co 3 lata wpływa na twoją
          przyszłą emeryturę.
        </p>
      </div>

      {/* Key Metrics */}
      <div className="grid grid-cols-2 gap-4 mb-6">
        <div className="bg-blue-50 p-4 rounded-lg">
          <div className="flex items-center gap-2 mb-1">
            <DollarSign className="w-4 h-4 text-blue-600" />
            <p className="text-xs text-blue-600 font-semibold">
              OBECNE WYNAGRODZENIE
            </p>
          </div>
          <p className="text-2xl font-bold text-blue-900">
            {formatPLN(averageSalary)}
          </p>
        </div>
        <div className="bg-green-50 p-4 rounded-lg">
          <div className="flex items-center gap-2 mb-1">
            <TrendingUp className="w-4 h-4 text-zus-green" />
            <p className="text-xs text-zus-green font-semibold">
              PO 30 LATACH (+10% CO 3 LATA)
            </p>
          </div>
          <p className="text-2xl font-bold text-zus-green">
            {formatPLN(salaryGrowthData[salaryGrowthData.length - 1].salary)}
          </p>
        </div>
      </div>

      {/* Chart */}
      <div className="h-[400px] mb-4">
        <Line
          data={{
            labels: salaryGrowthData.map((d) => `Rok ${d.year}`),
            datasets: [
              {
                label: "Wynagrodzenie (zł)",
                data: salaryGrowthData.map((d) => d.salary),
                borderColor: "#3B82F6",
                backgroundColor: "rgba(59, 130, 246, 0.1)",
                fill: true,
                yAxisID: "y",
                tension: 0.4,
              },
              {
                label: "Emerytura (zł)",
                data: salaryGrowthData.map((d) => d.pension),
                borderColor: "#00843D",
                backgroundColor: "rgba(0, 132, 61, 0.1)",
                fill: true,
                yAxisID: "y",
                tension: 0.4,
              },
            ],
          }}
          options={{
            responsive: true,
            maintainAspectRatio: false,
            interaction: {
              mode: "index",
              intersect: false,
            },
            plugins: {
              legend: {
                display: true,
                position: "top",
              },
              tooltip: {
                callbacks: {
                  label: (context) => {
                    const label = context.dataset.label || "";
                    const value = context.parsed.y;
                    return `${label}: ${formatPLN(value)}`;
                  },
                },
              },
            },
            scales: {
              y: {
                type: "linear",
                display: true,
                position: "left",
                title: {
                  display: true,
                  text: "Kwota (zł)",
                },
                ticks: {
                  callback: (value: any) => `${(value / 1000).toFixed(0)}k zł`,
                },
              },
              x: {
                title: {
                  display: true,
                  text: "Lata kariery",
                },
              },
            },
          }}
        />
      </div>
    </Card>
  );
}
