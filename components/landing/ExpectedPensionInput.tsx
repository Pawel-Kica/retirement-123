/**
 * ExpectedPensionInput Component - Landing page pension expectation input
 */

'use client';

import React, { useMemo } from 'react';
import { Card } from '@/components/shared/Card';
import { PensionInputSlider } from '@/components/shared/PensionInputSlider';
import { InfoTooltip } from '@/components/shared/InfoTooltip';
import { formatCurrency } from '@/lib/utils';
import { useStore } from '@/lib/store';
import averagePensionData from '@/data/averagePensionByYear.json';

const pensionGroups = [
  { name: 'Poniżej minimalnej', min: 0, max: 1700, color: 'rgb(240,94,94)' },
  { name: 'Około minimalnej', min: 1700, max: 2500, color: 'rgb(190,195,206)' },
  { name: 'Około średniej', min: 2500, max: 4500, color: 'rgb(63,132,210)' },
  { name: 'Powyżej średniej', min: 4500, max: 7000, color: 'rgb(0,153,63)' },
  { name: 'Znacznie powyżej', min: 7000, max: 15000, color: 'rgb(255,179,79)' },
];

export function ExpectedPensionInput() {
  const { expectedPension, setExpectedPension } = useStore();
  const currentAverage = (averagePensionData as Record<string, number>)['2024'] || 3500;

  const userGroup = useMemo(() => {
    return pensionGroups.find(
      (group) => expectedPension >= group.min && expectedPension <= group.max
    ) || pensionGroups[2];
  }, [expectedPension]);

  const positionInRange = useMemo(() => {
    const total = 15000 - 1000;
    const current = expectedPension - 1000;
    return (current / total) * 100;
  }, [expectedPension]);

  return (
    <Card className="max-w-2xl mx-auto">
      <div className="flex items-center gap-2 mb-4">
        <h2 className="text-2xl font-bold text-zus-navy">
          Jaka emerytura byłaby dla Ciebie satysfakcjonująca?
        </h2>
        <InfoTooltip content="Podaj kwotę emerytury, którą chciałbyś otrzymywać miesięcznie, wyrażoną w dzisiejszych złotówkach. Pomoże nam to porównać Twoje oczekiwania z prognozą." />
      </div>

      <PensionInputSlider
        value={expectedPension}
        onChange={setExpectedPension}
        min={1000}
        max={15000}
        step={100}
      />

      {/* Scale bar with average marker */}
      <div className="mt-6 p-4 bg-gradient-to-r from-blue-50 to-indigo-50 rounded-lg border border-blue-200 transition-all duration-300">
        <div className="flex items-center justify-between mb-3">
          <p className="text-sm font-medium text-zus-navy">
            Twoja pozycja na skali emerytur:
          </p>
          <span
            className="px-3 py-1 rounded-full text-xs font-semibold text-white transition-colors duration-300 shadow-sm"
            style={{ backgroundColor: userGroup.color }}
          >
            {userGroup.name}
          </span>
        </div>

        {/* Visual bar indicator with average marker */}
        <div className="relative h-4 bg-gray-200 rounded-full overflow-visible mb-2">
          {/* Progress bar */}
          <div
            className="absolute top-0 left-0 h-full transition-all duration-500 ease-out rounded-full"
            style={{
              width: `${positionInRange}%`,
              backgroundColor: userGroup.color,
              boxShadow: `0 0 12px ${userGroup.color}50`,
            }}
          />

          {/* Average marker */}
          <div
            className="absolute top-0 h-full w-0.5 bg-zus-navy -translate-x-1/2"
            style={{ left: `${((currentAverage - 1000) / (15000 - 1000)) * 100}%` }}
          >
            <div className="absolute -top-6 left-1/2 -translate-x-1/2 whitespace-nowrap">
              <div className="text-xs font-semibold text-zus-navy bg-white px-2 py-0.5 rounded shadow-sm border border-zus-navy">
                Średnia
              </div>
            </div>
          </div>
        </div>

        <div className="mt-4 flex justify-between text-xs text-gray-600">
          <span>Min: {formatCurrency(1000)}</span>
          <span className="font-bold text-zus-navy">{formatCurrency(expectedPension)}</span>
          <span>Max: {formatCurrency(15000)}</span>
        </div>

        {/* Feedback label */}
        <div className="mt-3 pt-3 border-t border-blue-200">
          <p className="text-sm text-center">
            {expectedPension < currentAverage * 0.8 && (
              <span className="text-orange-600 font-semibold">Poniżej średniej krajowej</span>
            )}
            {expectedPension >= currentAverage * 0.8 && expectedPension <= currentAverage * 1.2 && (
              <span className="text-zus-blue font-semibold">W okolicy średniej krajowej</span>
            )}
            {expectedPension > currentAverage * 1.2 && expectedPension <= currentAverage * 2 && (
              <span className="text-zus-green font-semibold">Powyżej średniej krajowej</span>
            )}
            {expectedPension > currentAverage * 2 && (
              <span className="text-zus-amber font-semibold">Znacznie powyżej średniej</span>
            )}
          </p>
        </div>
      </div>

      <div className="mt-4 p-3 bg-blue-50 rounded-md">
        <p className="text-sm text-zus-navy">
          <strong>Obecna średnia emerytura w Polsce:</strong> {formatCurrency(currentAverage)}
        </p>
        <p className="text-xs text-zus-gray mt-1">
          Twoja oczekiwana emerytura to{' '}
          <strong>
            {Math.round((expectedPension / currentAverage) * 100)}% obecnej średniej
          </strong>
        </p>
      </div>
    </Card>
  );
}
