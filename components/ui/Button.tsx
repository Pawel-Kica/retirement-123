import React from "react";
import { cn } from "@/lib/utils";

interface ButtonProps extends React.ButtonHTMLAttributes<HTMLButtonElement> {
  variant?: "primary" | "secondary" | "danger" | "ghost";
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
  const baseClasses =
    "font-bold rounded-lg transition-all disabled:opacity-50 disabled:cursor-not-allowed cursor-pointer inline-flex items-center justify-center gap-2 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-offset-2";

  const variantClasses = {
    primary:
      "bg-[rgb(255,179,79)] text-black hover:bg-[rgb(255,179,79)]/90 shadow-md hover:shadow-lg active:scale-95 focus-visible:ring-[rgb(255,179,79)]",
    secondary:
      "bg-[rgb(0,65,110)] text-white hover:bg-[rgb(0,65,110)]/90 shadow-md hover:shadow-lg active:scale-95 focus-visible:ring-[rgb(0,65,110)]",
    danger:
      "bg-[rgb(240,94,94)] text-white hover:bg-[rgb(240,94,94)]/90 shadow-md hover:shadow-lg active:scale-95 focus-visible:ring-[rgb(240,94,94)]",
    ghost:
      "bg-transparent border-2 border-[rgb(190,195,206)] hover:bg-gray-50 active:scale-95 focus-visible:ring-[rgb(190,195,206)]",
  };

  const sizeClasses = {
    sm: "px-3 py-1.5 text-sm",
    md: "px-6 py-3 text-base",
    lg: "px-8 py-4 text-lg",
  };

  return (
    <button
      disabled={disabled || loading}
      className={cn(
        baseClasses,
        variantClasses[variant],
        sizeClasses[size],
        className
      )}
      {...props}
    >
      {loading && (
        <svg
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
      )}
      {children}
    </button>
  );
}
