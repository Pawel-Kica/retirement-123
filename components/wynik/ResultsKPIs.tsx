import { Card } from "@/components/ui/Card";
import type { PensionResults, SimulationInputs } from "@/lib/types";
import { formatPLN } from "@/lib/utils/formatting";

interface ResultsKPIsProps {
  results: PensionResults;
  inputs: SimulationInputs;
  expectedPension: number;
}

export function ResultsKPIs({
  results,
  inputs,
  expectedPension,
}: ResultsKPIsProps) {
  const pensionDifference = results.realPension - expectedPension;
  const isBelowExpectation = pensionDifference < 0;

  // Calculate total years worked from employment periods
  const totalYearsWorked =
    inputs.employmentPeriods?.reduce(
      (sum, period) => sum + (period.endYear - period.startYear + 1),
      0
    ) || inputs.workEndYear - inputs.workStartYear + 1;

  return (
    <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-3 mb-6">
      <Card className="bg-white border border-zus-grey-300 p-3">
        <div className="text-[10px] font-semibold text-zus-grey-600 uppercase tracking-wide mb-1">
          Emerytura oczekiwana
        </div>
        <div className="text-2xl font-bold text-zus-grey-900">
          {formatPLN(expectedPension)}
        </div>
        <div className="text-[10px] text-zus-grey-600 mt-0.5">
          (wartość realna)
        </div>
      </Card>

      <Card
        className={`bg-white border-2 p-3 ${
          isBelowExpectation ? "border-zus-error" : "border-zus-green"
        }`}
      >
        <div className="text-[10px] font-semibold text-zus-grey-600 uppercase tracking-wide mb-1">
          Emerytura prognozowana
        </div>
        <div
          className={`text-2xl font-bold ${
            isBelowExpectation ? "text-zus-error" : "text-zus-green"
          }`}
        >
          {formatPLN(results.realPension)}
        </div>
        <div className="text-[10px] text-zus-grey-600 mt-0.5">
          (wartość realna)
        </div>
      </Card>

      <Card className="bg-white border border-zus-grey-300 p-3">
        <div className="text-[10px] font-semibold text-zus-grey-600 uppercase tracking-wide mb-1">
          Emerytura rzeczywista
        </div>
        <div className="text-2xl font-bold text-zus-grey-900">
          {formatPLN(results.nominalPension)}
        </div>
        <div className="text-[10px] text-zus-grey-600 mt-0.5">
          (w roku przejścia na emeryturę)
        </div>
      </Card>

      <Card className="bg-white border border-zus-grey-300 p-3">
        <div className="text-[10px] font-semibold text-zus-grey-600 uppercase tracking-wide mb-1">
          Łączny staż
        </div>
        <div className="text-2xl font-bold text-zus-grey-900">
          {totalYearsWorked} lat
        </div>
        <div className="text-[10px] text-zus-grey-600 mt-0.5">
          (od roku rozpoczęcia pracy)
        </div>
      </Card>
    </div>
  );
}
