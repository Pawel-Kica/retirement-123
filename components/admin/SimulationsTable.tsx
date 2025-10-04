/**
 * SimulationsTable Component - Preview of all simulations
 */

'use client';

import React from 'react';
import { Card } from '@/components/shared/Card';
import { formatCurrency, formatDate, getGenderShort } from '@/lib/utils';
import type { SimulationRecord } from '@/types';

interface SimulationsTableProps {
  simulations: SimulationRecord[];
}

export function SimulationsTable({ simulations }: SimulationsTableProps) {
  if (simulations.length === 0) {
    return (
      <Card>
        <p className="text-center text-zus-gray py-8">
          Brak zapisanych symulacji
        </p>
      </Card>
    );
  }

  return (
    <Card title={`Symulacje (${simulations.length})`}>
      <div className="overflow-x-auto max-h-96">
        <table className="w-full text-sm">
          <thead className="bg-zus-navy text-white sticky top-0">
            <tr>
              <th className="px-3 py-2 text-left">Data</th>
              <th className="px-3 py-2 text-left">Wiek</th>
              <th className="px-3 py-2 text-left">Płeć</th>
              <th className="px-3 py-2 text-right">Wynagrodzenie</th>
              <th className="px-3 py-2 text-right">Emerytura</th>
              <th className="px-3 py-2 text-left">Kod pocztowy</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-zus-gray">
            {simulations.map((sim, index) => (
              <tr key={index} className="hover:bg-gray-50">
                <td className="px-3 py-2">
                  {new Date(sim.timestamp).toLocaleDateString('pl-PL')}
                </td>
                <td className="px-3 py-2">{sim.age}</td>
                <td className="px-3 py-2">{getGenderShort(sim.gender)}</td>
                <td className="px-3 py-2 text-right">{formatCurrency(sim.salary)}</td>
                <td className="px-3 py-2 text-right">{formatCurrency(sim.realPension)}</td>
                <td className="px-3 py-2">{sim.postalCode || '—'}</td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </Card>
  );
}
