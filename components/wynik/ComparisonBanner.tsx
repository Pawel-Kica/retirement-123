import { formatPLN } from "@/lib/utils/formatting";

interface ComparisonBannerProps {
  pensionDifference: number;
  pensionDifferencePercent: number;
}

export function ComparisonBanner({
  pensionDifference,
  pensionDifferencePercent,
}: ComparisonBannerProps) {
  const isBelowExpectation = pensionDifference < 0;

  if (isBelowExpectation) {
    return (
      <div className="mb-6 p-4 bg-zus-error/10 border-l-4 border-zus-error rounded-lg">
        <div className="flex items-start gap-3">
          <div className="flex-shrink-0 w-6 h-6 rounded-full bg-zus-error flex items-center justify-center mt-0.5">
            <span className="text-white text-sm font-bold">!</span>
          </div>
          <div className="flex-1">
            <h3 className="text-sm font-bold text-zus-error mb-1">
              Uwaga: Emerytura poniżej oczekiwań
            </h3>
            <p className="text-sm text-zus-grey-700">
              Twoja prognozowana emerytura jest{" "}
              <strong className="text-zus-error">
                {formatPLN(Math.abs(pensionDifference))}
              </strong>{" "}
              ({Math.abs(pensionDifferencePercent).toFixed(1)}%) niższa niż
              oczekiwana. Rozważ wydłużenie kariery lub zwiększenie składek.
            </p>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="mb-6 p-4 bg-zus-green-light border-l-4 border-zus-green rounded-lg">
      <div className="flex items-start gap-3">
        <div className="flex-shrink-0 w-6 h-6 rounded-full bg-zus-green flex items-center justify-center mt-0.5">
          <span className="text-white text-sm font-bold">✓</span>
        </div>
        <div className="flex-1">
          <h3 className="text-sm font-bold text-zus-green mb-1">
            Gratulacje! Emerytura powyżej oczekiwań
          </h3>
          <p className="text-sm text-zus-grey-700">
            Twoja prognozowana emerytura jest{" "}
            <strong className="text-zus-green">
              {formatPLN(pensionDifference)}
            </strong>{" "}
            ({pensionDifferencePercent.toFixed(1)}%) wyższa niż oczekiwana.
            Dobra praca!
          </p>
        </div>
      </div>
    </div>
  );
}
