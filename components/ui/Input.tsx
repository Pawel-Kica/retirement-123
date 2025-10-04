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
    ...props
}: InputProps) {
    return (
        <div className="w-full">
            {label && (
                <label className="block text-sm font-semibold text-[rgb(0,65,110)] mb-2">
                    {label}
                    {props.required && <span className="text-[rgb(240,94,94)] ml-1">*</span>}
                </label>
            )}
            <div className="relative">
                <input
                    className={`w-full px-4 py-2 border-2 border-[rgb(190,195,206)] rounded-lg focus:outline-none focus:border-[rgb(63,132,210)] ${error ? 'border-[rgb(240,94,94)]' : ''
                        } ${suffix ? 'pr-12' : ''} ${className}`}
                    {...props}
                />
                {suffix && (
                    <span className="absolute right-4 top-1/2 -translate-y-1/2 text-gray-500 text-sm">
                        {suffix}
                    </span>
                )}
            </div>
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

