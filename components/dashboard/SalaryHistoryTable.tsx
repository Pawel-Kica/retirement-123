/**
 * SalaryHistoryTable Component - Editable salary history
 */

'use client';

import React from 'react';
import { Card } from '@/components/shared/Card';
import { formatCurrency } from '@/lib/utils';
import type { SalaryPath } from '@/types';

interface SalaryHistoryTableProps {
  salaryPath: SalaryPath;
  onUpdate: (path: SalaryPath) => void;
}

export function SalaryHistoryTable({ salaryPath, onUpdate }: SalaryHistoryTableProps) {
  const handleEdit = (index: number, newValue: number) => {
    const updated = [...salaryPath];
    updated[index] = {
      ...updated[index],
      monthly: newValue,
      annual: newValue * 12,
    };
    onUpdate(updated);
  };

  return (
    <Card title="Historia zarobków">
      <div className="max-h-96 overflow-y-auto">
        <table className="w-full text-sm">
          <thead className="bg-zus-gray text-white sticky top-0">
            <tr>
              <th className="px-3 py-2 text-left">Rok</th>
              <th className="px-3 py-2 text-right">Wynagrodzenie</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-zus-gray">
            {salaryPath.map((point, index) => (
              <tr key={point.year} className="hover:bg-gray-50">
                <td className="px-3 py-2">{point.year}</td>
                <td className="px-3 py-2 text-right">
                  <input
                    type="number"
                    value={Math.round(point.monthly)}
                    onChange={(e) => handleEdit(index, parseFloat(e.target.value) || 0)}
                    className="w-full text-right border border-zus-gray rounded px-2 py-1"
                  />
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
      <p className="text-xs text-zus-gray mt-3">
        Kliknij na kwotę, aby ją edytować. Zmiany będą uwzględnione po ponownym przeliczeniu.
      </p>
    </Card>
  );
}
