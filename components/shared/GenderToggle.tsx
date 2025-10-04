/**
 * GenderToggle Component - K/M selector
 */

'use client';

import React from 'react';
import type { Gender } from '@/types';

interface GenderToggleProps {
  value: Gender;
  onChange: (gender: Gender) => void;
  label?: string;
  error?: string;
}

export function GenderToggle({ value, onChange, label, error }: GenderToggleProps) {
  return (
    <div className="flex flex-col gap-1">
      {label && (
        <label className="text-sm font-medium text-zus-black">
          {label}
          <span className="text-zus-red ml-1">*</span>
        </label>
      )}
      <div className="flex gap-2">
        <button
          type="button"
          onClick={() => onChange('female')}
          className={`flex-1 px-6 py-3 rounded-md font-semibold transition-all ${
            value === 'female'
              ? 'bg-zus-blue text-white'
              : 'bg-white border border-zus-gray text-zus-black hover:bg-gray-50'
          }`}
        >
          K (Kobieta)
        </button>
        <button
          type="button"
          onClick={() => onChange('male')}
          className={`flex-1 px-6 py-3 rounded-md font-semibold transition-all ${
            value === 'male'
              ? 'bg-zus-blue text-white'
              : 'bg-white border border-zus-gray text-zus-black hover:bg-gray-50'
          }`}
        >
          M (Mężczyzna)
        </button>
      </div>
      {error && <span className="text-sm text-zus-red">{error}</span>}
    </div>
  );
}
