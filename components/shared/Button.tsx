/**
 * Button Component - ZUS styled buttons
 */

import React from 'react';

type ButtonVariant = 'primary' | 'secondary' | 'navy' | 'danger';

interface ButtonProps extends React.ButtonHTMLAttributes<HTMLButtonElement> {
  variant?: ButtonVariant;
  children: React.ReactNode;
}

const variantStyles: Record<ButtonVariant, string> = {
  primary: 'bg-zus-amber text-zus-black hover:opacity-90 font-semibold',
  secondary: 'bg-zus-blue text-white hover:opacity-90 font-semibold',
  navy: 'bg-zus-navy text-white hover:opacity-90 font-semibold',
  danger: 'bg-zus-red text-white hover:opacity-90 font-semibold',
};

export function Button({
  variant = 'primary',
  children,
  className = '',
  ...props
}: ButtonProps) {
  return (
    <button
      className={`px-6 py-3 rounded-lg transition-all duration-200 disabled:opacity-50 disabled:cursor-not-allowed ${variantStyles[variant]} ${className}`}
      {...props}
    >
      {children}
    </button>
  );
}
