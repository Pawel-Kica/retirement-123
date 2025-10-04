/**
 * PLNInput Component - Currency input with Polish formatting
 */

'use client';

import React, { useState } from 'react';
import { formatNumber, parsePolishNumber } from '@/lib/utils';

interface PLNInputProps {
  label?: string;
  value: number;
  onChange: (value: number) => void;
  error?: string;
  required?: boolean;
  placeholder?: string;
  min?: number;
  max?: number;
}

export function PLNInput({
  label,
  value,
  onChange,
  error,
  required,
  placeholder = '0',
  min,
  max,
}: PLNInputProps) {
  const [displayValue, setDisplayValue] = useState(formatNumber(value));

  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const input = e.target.value;
    setDisplayValue(input);

    // Parse and update value
    const parsed = parsePolishNumber(input);
    if (!isNaN(parsed)) {
      let finalValue = parsed;
      if (min !== undefined && parsed < min) finalValue = min;
      if (max !== undefined && parsed > max) finalValue = max;
      onChange(finalValue);
    }
  };

  const handleBlur = () => {
    // Reformat on blur
    setDisplayValue(formatNumber(value));
  };

  const handleFocus = () => {
    // Remove formatting on focus for easier editing
    setDisplayValue(value.toString());
  };

  return (
    <div className="flex flex-col gap-1">
      {label && (
        <label className="text-sm font-medium text-zus-black">
          {label}
          {required && <span className="text-zus-red ml-1">*</span>}
        </label>
      )}
      <div className="relative">
        <input
          type="text"
          value={displayValue}
          onChange={handleChange}
          onBlur={handleBlur}
          onFocus={handleFocus}
          placeholder={placeholder}
          className={`w-full px-4 py-2 pr-12 border border-zus-gray rounded-md focus:outline-none focus:ring-2 focus:ring-zus-blue ${
            error ? 'border-zus-red' : ''
          }`}
        />
        <span className="absolute right-4 top-1/2 -translate-y-1/2 text-zus-gray pointer-events-none">
          zł
        </span>
      </div>
      {error && <span className="text-sm text-zus-red">{error}</span>}
    </div>
  );
}
