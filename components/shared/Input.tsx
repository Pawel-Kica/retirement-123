/**
 * Input Component - Basic text input with label
 */

import React from 'react';

interface InputProps extends React.InputHTMLAttributes<HTMLInputElement> {
  label?: string;
  error?: string;
}

export function Input({ label, error, className = '', ...props }: InputProps) {
  return (
    <div className="flex flex-col gap-1">
      {label && (
        <label className="text-sm font-medium text-zus-black">
          {label}
          {props.required && <span className="text-zus-red ml-1">*</span>}
        </label>
      )}
      <input
        className={`px-4 py-2 border border-zus-gray rounded-md focus:outline-none focus:ring-2 focus:ring-zus-blue ${error ? 'border-zus-red' : ''} ${className}`}
        {...props}
      />
      {error && <span className="text-sm text-zus-red">{error}</span>}
    </div>
  );
}
