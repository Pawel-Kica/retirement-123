/**
 * ComparisonMetrics Component - Replacement rate and vs average
 */

'use client';

import React from 'react';
import { Card } from '@/components/shared/Card';
import { InfoTooltip } from '@/components/shared/InfoTooltip';
import { formatCurrency, formatPercent } from '@/lib/utils';
import type { VsAverage } from '@/types';

interface ComparisonMetricsProps {
  replacementRate: number;
  vsAverage: VsAverage;
}

export function ComparisonMetrics({ replacementRate, vsAverage }: ComparisonMetricsProps) {
  const isAboveAverage = vsAverage.diff > 0;

  return (
    <Card>
      <h3 className="text-xl font-semibold text-zus-navy mb-4">Wskaźniki porównawcze</h3>

      <div className="grid md:grid-cols-2 gap-4">
        {/* Replacement Rate */}
        <div className="p-4 bg-blue-50 rounded-lg">
          <div className="flex items-center gap-2 mb-2">
            <span className="text-sm font-medium text-zus-black">
              Stopa zastąpienia
            </span>
            <InfoTooltip content="Relacja Twojej emerytury do ostatniego wynagrodzenia. Im wyższa, tym lepiej emerytura zastępuje Twoje zarobki." />
          </div>
          <div className="text-3xl font-bold text-zus-blue">
            {formatPercent(replacementRate)}
          </div>
          <div className="text-xs text-zus-gray mt-1">
            ostatniego wynagrodzenia
          </div>
        </div>

        {/* Vs Average */}
        <div className={`p-4 rounded-lg ${isAboveAverage ? 'bg-green-50' : 'bg-red-50'}`}>
          <div className="flex items-center gap-2 mb-2">
            <span className="text-sm font-medium text-zus-black">
              Relacja do średniej
            </span>
            <InfoTooltip content="Porównanie Twojej prognozowanej emerytury do średniej emerytury w roku Twojego przejścia na emeryturę." />
          </div>
          <div className={`text-3xl font-bold ${isAboveAverage ? 'text-zus-green' : 'text-zus-red'}`}>
            {isAboveAverage ? '+' : ''}{formatCurrency(vsAverage.diff)}
          </div>
          <div className="text-xs text-zus-gray mt-1">
            {formatPercent(vsAverage.percentage)} średniej
          </div>
        </div>
      </div>
    </Card>
  );
}
