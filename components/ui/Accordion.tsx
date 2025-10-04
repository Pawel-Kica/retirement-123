'use client';

import React from 'react';

interface AccordionProps {
    title: string;
    children: React.ReactNode;
    isOpen: boolean;
    onToggle: () => void;
    badge?: string;
    icon?: string;
}

export function Accordion({ title, children, isOpen, onToggle, badge, icon }: AccordionProps) {
    return (
        <div className="border border-zus-grey-300 rounded overflow-hidden mb-4">
            <button
                type="button"
                onClick={onToggle}
                className={`w-full px-6 py-4 transition-colors flex items-center justify-between ${isOpen
                        ? 'bg-zus-green-light border-b-4 border-b-zus-green'
                        : 'bg-white hover:bg-zus-grey-100'
                    }`}
            >
                <div className="flex items-center gap-3">
                    {icon && <span className="text-2xl">{icon}</span>}
                    <h3 className={`text-xl font-bold text-left ${isOpen ? 'text-zus-green' : 'text-zus-grey-900'}`}>
                        {title}
                    </h3>
                    {badge && (
                        <span className={`text-xs px-2 py-1 rounded font-semibold ${badge.includes('✓') || badge.includes('WYPEŁNIONE')
                                ? 'bg-zus-green text-white'
                                : badge.includes('WYMAGANE')
                                    ? 'bg-zus-orange text-white'
                                    : 'bg-zus-grey-300 text-zus-grey-700'
                            }`}>
                            {badge}
                        </span>
                    )}
                </div>
                <svg
                    className={`w-6 h-6 text-zus-green transition-transform ${isOpen ? 'rotate-180' : ''}`}
                    fill="none"
                    stroke="currentColor"
                    viewBox="0 0 24 24"
                >
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" />
                </svg>
            </button>

            {isOpen && (
                <div className="px-6 py-6 bg-white border-t border-zus-grey-300">
                    {children}
                </div>
            )}
        </div>
    );
}
