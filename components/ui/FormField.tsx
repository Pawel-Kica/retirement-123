import React from 'react';
import { Tooltip } from './Tooltip';

interface FormFieldProps {
    label: string;
    children: React.ReactNode;
    required?: boolean;
    error?: string;
    hint?: string;
    tooltip?: string;
    className?: string;
}

export function FormField({
    label,
    children,
    required = false,
    error,
    hint,
    tooltip,
    className = '',
}: FormFieldProps) {
    return (
        <div className={`mb-4 ${className}`}>
            <label className="block mb-2">
                <span className="font-bold text-[rgb(0,65,110)]">
                    {label}
                    {required && <span className="text-[rgb(240,94,94)] ml-1">*</span>}
                </span>
                {tooltip && (
                    <Tooltip content={tooltip}>
                        <svg className="inline ml-2 w-5 h-5 text-[rgb(63,132,210)] cursor-help" fill="currentColor" viewBox="0 0 20 20">
                            <path fillRule="evenodd" d="M18 10a8 8 0 11-16 0 8 8 0 0116 0zm-7-4a1 1 0 11-2 0 1 1 0 012 0zM9 9a1 1 0 000 2v3a1 1 0 001 1h1a1 1 0 100-2v-3a1 1 0 00-1-1H9z" clipRule="evenodd" />
                        </svg>
                    </Tooltip>
                )}
            </label>
            {children}
            {hint && !error && (
                <p className="text-sm text-gray-600 mt-1">{hint}</p>
            )}
            {error && (
                <p className="text-sm text-[rgb(240,94,94)] mt-1 flex items-center gap-1">
                    <svg className="w-4 h-4" fill="currentColor" viewBox="0 0 20 20">
                        <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zM8.707 7.293a1 1 0 00-1.414 1.414L8.586 10l-1.293 1.293a1 1 0 101.414 1.414L10 11.414l1.293 1.293a1 1 0 001.414-1.414L11.414 10l1.293-1.293a1 1 0 00-1.414-1.414L10 8.586 8.707 7.293z" clipRule="evenodd" />
                    </svg>
                    {error}
                </p>
            )}
        </div>
    );
}

