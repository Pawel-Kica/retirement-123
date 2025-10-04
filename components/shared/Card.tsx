/**
 * Card Component - Container with ZUS styling
 */

import React from 'react';

interface CardProps {
  children: React.ReactNode;
  className?: string;
  title?: string;
}

export function Card({ children, className = '', title }: CardProps) {
  return (
    <div className={`bg-white border border-zus-gray rounded-lg shadow-md p-6 ${className}`}>
      {title && <h3 className="text-xl font-semibold text-zus-navy mb-4">{title}</h3>}
      {children}
    </div>
  );
}
