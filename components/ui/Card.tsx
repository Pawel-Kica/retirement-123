import React from "react";
import { cn } from "@/lib/utils";

interface CardProps {
  children: React.ReactNode;
  className?: string;
  variant?: 'default' | 'success' | 'warning' | 'info';
}

export function Card({ children, className = '', variant = 'default' }: CardProps) {
  // ZUS Design System: Flat design, minimal shadows, clean borders
  const variantClasses = {
    default: 'bg-white border-zus-grey-300',
    success: 'bg-zus-green-light border-zus-green',      // Light green background
    warning: 'bg-red-50 border-zus-error',                // Light red for warnings
    info: 'bg-blue-50 border-zus-navy',                   // Light blue for info
  };

  return (
    <div className={`rounded border p-6 ${variantClasses[variant]} ${className}`}>
      {children}
    </div>
  );
}


