import React from 'react';

interface SelectProps extends React.SelectHTMLAttributes<HTMLSelectElement> {
    label?: string;
    error?: string;
    options: Array<{ value: string | number; label: string }>;
}

export function Select({
    label,
    error,
    options,
    className = '',
    ...props
}: SelectProps) {
    return (
        <div className="w-full">
            {label && (
                <label className="block text-sm font-semibold text-[rgb(0,65,110)] mb-2">
                    {label}
                    {props.required && <span className="text-[rgb(240,94,94)] ml-1">*</span>}
                </label>
            )}
            <select
                className={`w-full px-4 py-2 border-2 border-[rgb(190,195,206)] rounded-lg focus:outline-none focus:border-[rgb(63,132,210)] ${error ? 'border-[rgb(240,94,94)]' : ''
                    } ${className}`}
                {...props}
            >
                {options.map((option) => (
                    <option key={option.value} value={option.value}>
                        {option.label}
                    </option>
                ))}
            </select>
            {error && (
                <p className="text-sm text-[rgb(240,94,94)] mt-1">{error}</p>
            )}
        </div>
    );
}

