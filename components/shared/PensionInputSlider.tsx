/**
 * PensionInputSlider Component - Combined input + slider for expected pension
 */

'use client';

import React from 'react';
import { formatCurrency } from '@/lib/utils';
import { PLNInput } from './PLNInput';

interface PensionInputSliderProps {
  value: number;
  onChange: (value: number) => void;
  min?: number;
  max?: number;
  step?: number;
  label?: string;
}

export function PensionInputSlider({
  value,
  onChange,
  min = 0,
  max = 15000,
  step = 100,
  label = 'Oczekiwana emerytura (w dzisiejszych zł)',
}: PensionInputSliderProps) {
  return (
    <div className="flex flex-col gap-4">
      <PLNInput
        label={label}
        value={value}
        onChange={onChange}
        min={min}
        max={max}
        required
      />
      <input
        type="range"
        min={min}
        max={max}
        step={step}
        value={value}
        defaultValue={value}
        onChange={(e) => onChange(Number(e.target.value))}
        className="w-full h-2 bg-gray-200 rounded-lg appearance-none cursor-pointer [&::-webkit-slider-thumb]:appearance-none [&::-webkit-slider-thumb]:w-5 [&::-webkit-slider-thumb]:h-5 [&::-webkit-slider-thumb]:rounded-full [&::-webkit-slider-thumb]:bg-zus-amber [&::-webkit-slider-thumb]:cursor-pointer [&::-webkit-slider-thumb]:transition-transform [&::-webkit-slider-thumb]:hover:scale-110 [&::-webkit-slider-thumb]:active:scale-125"
      />
      <div className="flex justify-between text-sm text-zus-gray">
        <span>{formatCurrency(min)}</span>
        <span>{formatCurrency(max)}</span>
      </div>
    </div>
  );
}
