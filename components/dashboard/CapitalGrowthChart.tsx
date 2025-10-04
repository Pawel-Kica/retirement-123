/**
 * CapitalGrowthChart Component - Show capital growth over time
 */

'use client';

import React from 'react';
import { LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, Legend, ResponsiveContainer } from 'recharts';
import { Card } from '@/components/shared/Card';
import { formatCurrency } from '@/lib/utils';
import type { CapitalHistory } from '@/types';

interface CapitalGrowthChartProps {
  capitalHistory: CapitalHistory;
}

export function CapitalGrowthChart({ capitalHistory }: CapitalGrowthChartProps) {
  return (
    <Card title="Wzrost kapitału emerytalnego w czasie">
      <ResponsiveContainer width="100%" height={400}>
        <LineChart data={capitalHistory}>
          <CartesianGrid strokeDasharray="3 3" />
          <XAxis
            dataKey="year"
            label={{ value: 'Rok', position: 'insideBottom', offset: -5 }}
          />
          <YAxis
            label={{ value: 'Kapitał (zł)', angle: -90, position: 'insideLeft' }}
            tickFormatter={(value) => `${Math.round(value / 1000)}k`}
          />
          <Tooltip
            formatter={(value: number) => formatCurrency(value)}
            labelFormatter={(label) => `Rok ${label}`}
          />
          <Legend />
          <Line
            type="monotone"
            dataKey="account"
            stroke="rgb(63,132,210)"
            name="Konto"
            strokeWidth={2}
          />
          <Line
            type="monotone"
            dataKey="subaccount"
            stroke="rgb(0,153,63)"
            name="Subkonto"
            strokeWidth={2}
          />
          <Line
            type="monotone"
            dataKey="total"
            stroke="rgb(255,179,79)"
            name="Suma"
            strokeWidth={3}
          />
        </LineChart>
      </ResponsiveContainer>

      <div className="mt-4 overflow-x-auto max-h-64">
        <table className="w-full text-sm">
          <thead className="bg-zus-gray text-white">
            <tr>
              <th className="px-3 py-2">Rok</th>
              <th className="px-3 py-2 text-right">Konto</th>
              <th className="px-3 py-2 text-right">Subkonto</th>
              <th className="px-3 py-2 text-right">Suma</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-zus-gray">
            {capitalHistory.map((point) => (
              <tr key={point.year} className="hover:bg-gray-50">
                <td className="px-3 py-2">{point.year}</td>
                <td className="px-3 py-2 text-right">{formatCurrency(point.account)}</td>
                <td className="px-3 py-2 text-right">{formatCurrency(point.subaccount)}</td>
                <td className="px-3 py-2 text-right font-semibold">{formatCurrency(point.total)}</td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </Card>
  );
}
