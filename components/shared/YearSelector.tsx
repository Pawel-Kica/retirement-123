/**
 * YearSelector Component - Year picker (always January)
 */

'use client';

import React from 'react';

interface YearSelectorProps {
  label?: string;
  value: number;
  onChange: (year: number) => void;
  min?: number;
  max?: number;
  error?: string;
  required?: boolean;
}

export function YearSelector({
  label,
  value,
  onChange,
  min = 1960,
  max = 2080,
  error,
  required,
}: YearSelectorProps) {
  return (
    <div className="flex flex-col gap-1">
      {label && (
        <label className="text-sm font-medium text-zus-black">
          {label}
          {required && <span className="text-zus-red ml-1">*</span>}
        </label>
      )}
      <div className="flex items-center gap-2">
        <input
          type="number"
          value={value}
          onChange={(e) => {
            const year = parseInt(e.target.value);
            if (year >= min && year <= max) {
              onChange(year);
            }
          }}
          min={min}
          max={max}
          className={`flex-1 px-4 py-2 border border-zus-gray rounded-md focus:outline-none focus:ring-2 focus:ring-zus-blue ${
            error ? 'border-zus-red' : ''
          }`}
        />
        <span className="text-sm text-zus-gray whitespace-nowrap">(styczeń)</span>
      </div>
      {error && <span className="text-sm text-zus-red">{error}</span>}
    </div>
  );
}
