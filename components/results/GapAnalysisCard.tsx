/**
 * GapAnalysisCard Component - Gap to expected and years needed
 */

'use client';

import React from 'react';
import { Card } from '@/components/shared/Card';
import { formatCurrency } from '@/lib/utils';

interface GapAnalysisCardProps {
  expectedPension: number;
  realPension: number;
  gapToExpected: number;
  yearsToTarget: number | null;
}

export function GapAnalysisCard({
  expectedPension,
  realPension,
  gapToExpected,
  yearsToTarget,
}: GapAnalysisCardProps) {
  // Only show if there's a gap
  if (gapToExpected <= 0) {
    return (
      <Card className="bg-green-50 border-2 border-zus-green">
        <div className="text-center py-6">
          <div className="text-6xl mb-4">🎉</div>
          <h3 className="text-2xl font-bold text-zus-green mb-2">
            Gratulacje!
          </h3>
          <p className="text-lg text-zus-black">
            Osiągniesz oczekiwaną emeryturę w wysokości {formatCurrency(expectedPension)}
          </p>
          <p className="text-sm text-zus-gray mt-2">
            Twoja prognozowana emerytura ({formatCurrency(realPension)}) przewyższa Twoje oczekiwania.
          </p>
        </div>
      </Card>
    );
  }

  return (
    <Card className="bg-red-50 border-2 border-zus-red">
      <h3 className="text-xl font-semibold text-zus-navy mb-4">
        Relacja do oczekiwań
      </h3>

      <div className="space-y-4">
        <div className="p-4 bg-white rounded-lg">
          <div className="text-sm text-zus-gray mb-1">Oczekiwana emerytura</div>
          <div className="text-2xl font-bold text-zus-black">
            {formatCurrency(expectedPension)}
          </div>
        </div>

        <div className="p-4 bg-white rounded-lg">
          <div className="text-sm text-zus-gray mb-1">Prognozowana emerytura</div>
          <div className="text-2xl font-bold text-zus-red">
            {formatCurrency(realPension)}
          </div>
        </div>

        <div className="p-4 bg-zus-red text-white rounded-lg">
          <div className="text-sm mb-1">Brakuje</div>
          <div className="text-3xl font-bold">
            {formatCurrency(gapToExpected)}
          </div>
        </div>

        {yearsToTarget !== null && (
          <div className="p-4 bg-zus-navy text-white rounded-lg">
            <p className="text-lg font-semibold mb-2">
              Aby osiągnąć oczekiwaną kwotę:
            </p>
            <p className="text-2xl font-bold">
              Musisz pracować o około {yearsToTarget} {yearsToTarget === 1 ? 'rok' : yearsToTarget < 5 ? 'lata' : 'lat'} dłużej
            </p>
          </div>
        )}

        {yearsToTarget === null && (
          <div className="p-4 bg-zus-gray text-white rounded-lg">
            <p className="text-sm">
              Osiągnięcie oczekiwanej kwoty nie jest możliwe w realistycznym zakresie (do 75 lat).
              Rozważ dostosowanie oczekiwań lub inne formy oszczędzania na emeryturę.
            </p>
          </div>
        )}
      </div>
    </Card>
  );
}
