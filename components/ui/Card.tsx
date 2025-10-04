import React from 'react';

interface CardProps {
    children: React.ReactNode;
    className?: string;
    variant?: 'default' | 'highlight' | 'warning';
}

export function Card({ children, className = '', variant = 'default' }: CardProps) {
    const variantClasses = {
        default: 'bg-white border-[rgb(190,195,206)]',
        highlight: 'bg-[rgb(0,153,63)]/5 border-[rgb(0,153,63)]',
        warning: 'bg-[rgb(240,94,94)]/5 border-[rgb(240,94,94)]',
    };

    return (
        <div className={`rounded-lg border-2 p-6 ${variantClasses[variant]} ${className}`}>
            {children}
        </div>
    );
}

