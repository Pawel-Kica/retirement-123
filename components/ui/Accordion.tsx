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
        <div className="border-2 border-[rgb(190,195,206)] rounded-lg overflow-hidden mb-4">
            <button
                type="button"
                onClick={onToggle}
                className="w-full px-6 py-4 bg-white hover:bg-gray-50 transition-colors flex items-center justify-between"
            >
                <div className="flex items-center gap-3">
                    {icon && <span className="text-2xl">{icon}</span>}
                    <h3 className="text-xl font-bold text-[rgb(0,65,110)] text-left">
                        {title}
                    </h3>
                    {badge && (
                        <span className="text-xs bg-[rgb(255,179,79)] text-black px-2 py-1 rounded font-semibold">
                            {badge}
                        </span>
                    )}
                </div>
                <svg
                    className={`w-6 h-6 text-[rgb(0,65,110)] transition-transform ${isOpen ? 'rotate-180' : ''
                        }`}
                    fill="none"
                    stroke="currentColor"
                    viewBox="0 0 24 24"
                >
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" />
                </svg>
            </button>

            {isOpen && (
                <div className="px-6 py-6 bg-white border-t-2 border-[rgb(190,195,206)]">
                    {children}
                </div>
            )}
        </div>
    );
}
