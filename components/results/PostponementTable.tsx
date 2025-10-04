/**
 * PostponementTable Component - Show +1/+2/+5 years variants
 */

'use client';

import React from 'react';
import { Card } from '@/components/shared/Card';
import { formatCurrency, formatPercent } from '@/lib/utils';
import type { PostponementVariants } from '@/types';

interface PostponementTableProps {
  postponement: PostponementVariants;
}

export function PostponementTable({ postponement }: PostponementTableProps) {
  return (
    <Card>
      <h3 className="text-xl font-semibold text-zus-navy mb-4">
        Warianty odroczenia przejścia na emeryturę
      </h3>

      <p className="text-sm text-zus-gray mb-4">
        Zobacz, jak wzrosłaby Twoja emerytura, gdybyś pracował dłużej:
      </p>

      <div className="overflow-x-auto">
        <table className="w-full">
          <thead className="bg-zus-navy text-white">
            <tr>
              <th className="px-4 py-3 text-left">Odroczenie</th>
              <th className="px-4 py-3 text-right">Emerytura nominalna</th>
              <th className="px-4 py-3 text-right">Emerytura urealniona</th>
              <th className="px-4 py-3 text-right">Wzrost</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-zus-gray">
            <tr className="bg-white hover:bg-gray-50">
              <td className="px-4 py-3 font-medium">+1 rok</td>
              <td className="px-4 py-3 text-right">{formatCurrency(postponement['+1'].nominal)}</td>
              <td className="px-4 py-3 text-right">{formatCurrency(postponement['+1'].real)}</td>
              <td className="px-4 py-3 text-right text-zus-green font-semibold">
                +{formatPercent(postponement['+1'].increase || 0)}
              </td>
            </tr>
            <tr className="bg-white hover:bg-gray-50">
              <td className="px-4 py-3 font-medium">+2 lata</td>
              <td className="px-4 py-3 text-right">{formatCurrency(postponement['+2'].nominal)}</td>
              <td className="px-4 py-3 text-right">{formatCurrency(postponement['+2'].real)}</td>
              <td className="px-4 py-3 text-right text-zus-green font-semibold">
                +{formatPercent(postponement['+2'].increase || 0)}
              </td>
            </tr>
            <tr className="bg-white hover:bg-gray-50">
              <td className="px-4 py-3 font-medium">+5 lat</td>
              <td className="px-4 py-3 text-right">{formatCurrency(postponement['+5'].nominal)}</td>
              <td className="px-4 py-3 text-right">{formatCurrency(postponement['+5'].real)}</td>
              <td className="px-4 py-3 text-right text-zus-green font-semibold">
                +{formatPercent(postponement['+5'].increase || 0)}
              </td>
            </tr>
          </tbody>
        </table>
      </div>

      <div className="mt-4 p-3 bg-blue-50 rounded-md">
        <p className="text-sm text-zus-gray">
          Dłuższa praca oznacza więcej składek oraz krótszy okres pobierania emerytury, co zwiększa jej wysokość.
        </p>
      </div>
    </Card>
  );
}
