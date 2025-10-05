import React from "react";
import { Tooltip } from "./Tooltip";

export interface FormFieldProps {
  label: string;
  children: React.ReactNode;
  required?: boolean;
  error?: string;
  errorSeverity?: "error" | "warning";
  hint?: string | React.ReactNode;
  tooltip?: string;
  className?: string;
  reserveErrorSpace?: `${number}px`;
}

export function FormField({
  label,
  children,
  required = false,
  error,
  errorSeverity = "error",
  hint,
  tooltip,
  className = "",
  reserveErrorSpace
}: FormFieldProps) {
  const fieldId = React.useId();
  const errorId = `${fieldId}-error`;
  const hintId = `${fieldId}-hint`;

  // Clone children to add accessibility attributes
  const childrenWithProps = React.Children.map(children, (child) => {
    if (React.isValidElement(child)) {
      return React.cloneElement(child as React.ReactElement<any>, {
        id: child.props.id || fieldId,
        'aria-invalid': error ? "true" : "false",
        'aria-describedby': error ? errorId : hint ? hintId : child.props['aria-describedby'],
        'aria-required': required || child.props['aria-required'],
      });
    }
    return child;
  });

  return (
    <div className={`mb-4 ${className}`}>
      <label htmlFor={fieldId} className="block mb-2">
        <span className="font-semibold text-zus-grey-700">
          {label}
          {required && <span className="text-zus-error ml-1" aria-label="wymagane">*</span>}
        </span>
        {tooltip && (
          <Tooltip content={tooltip}>
            <span className="inline-flex ml-2 align-middle">
              <span
                className="inline-flex items-center justify-center w-6 h-6 rounded-full border-2 border-zus-green text-zus-green hover:bg-zus-green hover:text-white transition-all duration-200 cursor-help"
                role="img"
                aria-label="Dodatkowe informacje"
              >
                <svg
                  className="w-4 h-4"
                  fill="currentColor"
                  viewBox="0 0 20 20"
                  aria-hidden="true"
                >
                  <path
                    fillRule="evenodd"
                    d="M18 10a8 8 0 11-16 0 8 8 0 0116 0zm-7-4a1 1 0 11-2 0 1 1 0 012 0zM9 9a1 1 0 000 2v3a1 1 0 001 1h1a1 1 0 100-2v-3a1 1 0 00-1-1H9z"
                    clipRule="evenodd"
                  />
                </svg>
              </span>
            </span>
          </Tooltip>
        )}
      </label>
      {childrenWithProps}
      <div
        className={`mt-1`}
        style={{ minHeight: reserveErrorSpace }}
        aria-live="polite"
      >
        {error ? (
          <div
            id={errorId}
            role="alert"
            className={`text-sm flex items-start gap-2 p-3 rounded border-l-4 ${
              errorSeverity === "warning"
                ? "bg-red-50 border-red-500 text-red-700"
                : "bg-red-50 border-zus-error text-zus-error"
            }`}
          >
            <svg className="w-5 h-5 flex-shrink-0 mt-0.5" fill="currentColor" viewBox="0 0 20 20" aria-hidden="true">
              {errorSeverity === "warning" ? (
                <path
                  fillRule="evenodd"
                  d="M8.257 3.099c.765-1.36 2.722-1.36 3.486 0l5.58 9.92c.75 1.334-.213 2.98-1.742 2.98H4.42c-1.53 0-2.493-1.646-1.743-2.98l5.58-9.92zM11 13a1 1 0 11-2 0 1 1 0 012 0zm-1-8a1 1 0 00-1 1v3a1 1 0 002 0V6a1 1 0 00-1-1z"
                  clipRule="evenodd"
                />
              ) : (
                <path
                  fillRule="evenodd"
                  d="M10 18a8 8 0 100-16 8 8 0 000 16zM8.707 7.293a1 1 0 00-1.414 1.414L8.586 10l-1.293 1.293a1 1 0 101.414 1.414L10 11.414l1.293 1.293a1 1 0 001.414-1.414L11.414 10l1.293-1.293a1 1 0 00-1.414-1.414L10 8.586 8.707 7.293z"
                  clipRule="evenodd"
                />
              )}
            </svg>
            <span>{error}</span>
          </div>
        ) : hint ? (
          <p id={hintId} className="text-sm text-zus-grey-500">{hint}</p>
        ) : null}
      </div>
    </div>
  );
}
