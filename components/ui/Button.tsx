import React from "react";
import { cn } from "@/lib/utils";

interface ButtonProps extends React.ButtonHTMLAttributes<HTMLButtonElement> {
  variant?: "primary" | "secondary" | "success" | "ghost";
  size?: "sm" | "md" | "lg";
  loading?: boolean;
  children: React.ReactNode;
}

export function Button({
  variant = "primary",
  size = "md",
  loading = false,
  disabled,
  children,
  className = "",
  ...props
}: ButtonProps) {
  // ZUS Design System: Flat design, professional, accessible
  const baseClasses =
    "font-semibold rounded-md transition-all duration-200 disabled:opacity-50 disabled:cursor-not-allowed inline-flex items-center justify-center gap-2 cursor-pointer";

  // ZUS Color System - Following official design guidelines
  const variantClasses = {
    // Primary: Orange/Amber CTA button (like "OBLICZ" on ZUS.pl)
    primary:
      "bg-zus-orange text-white hover:bg-zus-orange-dark focus:ring-2 focus:ring-zus-orange focus:ring-offset-2",
    // Secondary: Navy blue for secondary actions
    secondary:
      "bg-zus-navy text-white hover:bg-zus-navy-dark focus:ring-2 focus:ring-zus-navy focus:ring-offset-2",
    // Success: Green for confirmations
    success:
      "bg-zus-green text-white hover:bg-zus-green-dark focus:ring-2 focus:ring-zus-green focus:ring-offset-2",
    // Ghost: Outline style with green
    ghost:
      "bg-transparent border-2 border-zus-green text-zus-green hover:bg-zus-green-light focus:ring-2 focus:ring-zus-green focus:ring-offset-2",
  };

  // ZUS Spacing: 12px vertical, 24px horizontal for md buttons
  const sizeClasses = {
    sm: "px-4 py-2 text-sm", // Small: 8px/16px
    md: "px-6 py-3 text-base", // Medium: 12px/24px (ZUS standard)
    lg: "px-8 py-4 text-lg", // Large: 16px/32px
  };

  return (
    <button
      disabled={disabled || loading}
      aria-busy={loading}
      className={cn(
        baseClasses,
        variantClasses[variant],
        sizeClasses[size],
        className
      )}
      {...props}
    >
      {loading && (
        <>
          <svg
            aria-hidden="true"
            className="animate-spin h-5 w-5"
            xmlns="http://www.w3.org/2000/svg"
            fill="none"
            viewBox="0 0 24 24"
          >
            <circle
              className="opacity-25"
              cx="12"
              cy="12"
              r="10"
              stroke="currentColor"
              strokeWidth="4"
            ></circle>
            <path
              className="opacity-75"
              fill="currentColor"
              d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"
            ></path>
          </svg>
          <span className="sr-only">Ładowanie...</span>
        </>
      )}
      {children}
    </button>
  );
}
