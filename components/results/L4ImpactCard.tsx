/**
 * L4ImpactCard Component - Comparison without/with L4
 */

'use client';

import React from 'react';
import { Card } from '@/components/shared/Card';
import { formatCurrency, formatPercent } from '@/lib/utils';
import type { L4Impact } from '@/types';

interface L4ImpactCardProps {
  l4Impact: L4Impact;
  includeL4: boolean;
}

export function L4ImpactCard({ l4Impact, includeL4 }: L4ImpactCardProps) {
  // Only show if user selected L4 option
  if (!includeL4) return null;

  return (
    <Card className="bg-yellow-50">
      <h3 className="text-xl font-semibold text-zus-navy mb-4">
        Wpływ zwolnień lekarskich (L4) na emeryturę
      </h3>

      <div className="overflow-x-auto">
        <table className="w-full">
          <thead className="bg-zus-gray text-white">
            <tr>
              <th className="px-4 py-3 text-left">Scenariusz</th>
              <th className="px-4 py-3 text-right">Emerytura nominalna</th>
              <th className="px-4 py-3 text-right">Różnica</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-zus-gray">
            <tr className="bg-white">
              <td className="px-4 py-3 font-medium">Bez L4</td>
              <td className="px-4 py-3 text-right font-semibold">
                {formatCurrency(l4Impact.withoutL4)}
              </td>
              <td className="px-4 py-3 text-right text-zus-gray">–</td>
            </tr>
            <tr className="bg-white">
              <td className="px-4 py-3 font-medium">Z L4</td>
              <td className="px-4 py-3 text-right font-semibold text-zus-red">
                {formatCurrency(l4Impact.withL4)}
              </td>
              <td className="px-4 py-3 text-right font-semibold text-zus-red">
                {formatCurrency(l4Impact.diff)} ({formatPercent(l4Impact.diffPercentage)})
              </td>
            </tr>
          </tbody>
        </table>
      </div>

      <div className="mt-4 p-3 bg-white rounded-md">
        <p className="text-sm text-zus-gray">
          Zwolnienia lekarskie zmniejszają bazę składkową, co przekłada się na niższy kapitał emerytalny
          i mniejszą wysokość emerytury.
        </p>
      </div>
    </Card>
  );
}
