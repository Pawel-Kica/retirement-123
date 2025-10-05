import React from 'react';

interface InputProps extends React.InputHTMLAttributes<HTMLInputElement> {
    label?: string;
    error?: string;
    hint?: string;
    suffix?: string;
}

export function Input({
    label,
    error,
    hint,
    suffix,
    className = '',
    id,
    ...props
}: InputProps) {
    // Generate unique ID for accessibility if not provided
    const inputId = id || `input-${React.useId()}`;
    const errorId = `${inputId}-error`;
    const hintId = `${inputId}-hint`;

    return (
        <div className="w-full">
            {label && (
                <label
                    htmlFor={inputId}
                    className="block text-sm md:text-base font-medium text-zus-grey-700 mb-2"
                >
                    {label}
                    {props.required && <span className="text-zus-error ml-1" aria-label="wymagane">*</span>}
                </label>
            )}
            <div className="relative">
                <input
                    id={inputId}
                    aria-invalid={error ? "true" : "false"}
                    aria-describedby={
                        error ? errorId : hint ? hintId : undefined
                    }
                    aria-required={props.required}
                    className={`w-full px-4 py-3 text-base border rounded transition-colors duration-150 focus:outline-none focus:ring-4 focus:ring-offset-0 disabled:bg-zus-grey-100 disabled:text-zus-grey-500 ${error
                            ? 'border-zus-error focus:border-zus-error focus:ring-zus-error/50'
                            : 'border-zus-grey-300 focus:border-zus-green focus:ring-zus-green/50'
                        } ${suffix ? 'pr-12' : ''} ${className}`}
                    {...props}
                />
                {suffix && (
                    <span
                        className="absolute right-4 top-1/2 -translate-y-1/2 text-zus-grey-500 text-sm"
                        aria-hidden="true"
                    >
                        {suffix}
                    </span>
                )}
            </div>
            {hint && !error && (
                <p id={hintId} className="text-sm text-zus-grey-500 mt-1">{hint}</p>
            )}
            {error && (
                <p id={errorId} className="text-sm text-zus-error mt-1 flex items-center gap-1" role="alert">
                    <svg className="w-4 h-4" fill="currentColor" viewBox="0 0 20 20" aria-hidden="true">
                        <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zM8.707 7.293a1 1 0 00-1.414 1.414L8.586 10l-1.293 1.293a1 1 0 101.414 1.414L10 11.414l1.293 1.293a1 1 0 001.414-1.414L11.414 10l1.293-1.293a1 1 0 00-1.414-1.414L10 8.586 8.707 7.293z" clipRule="evenodd" />
                    </svg>
                    {error}
                </p>
            )}
        </div>
    );
}


