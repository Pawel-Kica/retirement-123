/**
 * PostalCodeInput Component - Optional postal code for statistics
 */

'use client';

import React from 'react';
import { Card } from '@/components/shared/Card';
import { Input } from '@/components/shared/Input';

interface PostalCodeInputProps {
  value: string;
  onChange: (value: string) => void;
}

export function PostalCodeInput({ value, onChange }: PostalCodeInputProps) {
  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    let input = e.target.value.replace(/[^0-9-]/g, '');
    // Auto-format XX-XXX
    if (input.length > 2 && input[2] !== '-') {
      input = input.slice(0, 2) + '-' + input.slice(2);
    }
    if (input.length <= 6) {
      onChange(input);
    }
  };

  return (
    <Card title="Kod pocztowy (opcjonalnie)">
      <Input
        type="text"
        value={value}
        onChange={handleChange}
        placeholder="XX-XXX"
        maxLength={6}
      />
      <p className="text-xs text-zus-gray mt-2">
        Kod pocztowy jest używany wyłącznie do zagregowanych statystyk i nie jest obowiązkowy.
      </p>
    </Card>
  );
}
