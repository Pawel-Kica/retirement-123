/**
 * FactCard Component - Random fun fact rotation
 */

'use client';

import React, { useState, useEffect } from 'react';
import { Card } from '@/components/shared/Card';
import factsData from '@/data/facts.json';
import type { Fact } from '@/types';

export function FactCard() {
  const facts = factsData as Fact[];
  const [currentFactIndex, setCurrentFactIndex] = useState(0);

  // Rotate facts every 10 seconds
  useEffect(() => {
    const interval = setInterval(() => {
      setCurrentFactIndex((prev) => (prev + 1) % facts.length);
    }, 10000);

    return () => clearInterval(interval);
  }, [facts.length]);

  const currentFact = facts[currentFactIndex];

  const handleNext = () => {
    setCurrentFactIndex((prev) => (prev + 1) % facts.length);
  };

  const handlePrev = () => {
    setCurrentFactIndex((prev) => (prev - 1 + facts.length) % facts.length);
  };

  return (
    <Card className="h-full bg-gradient-to-br from-amber-50 via-yellow-50 to-orange-50 border-2 border-amber-200">
      <div className="flex items-start gap-4">
        <div className="flex-shrink-0 text-5xl">💡</div>
        <div className="flex-1">
          <h3 className="text-xl font-bold text-zus-navy mb-3">
            Czy wiesz, że...
          </h3>
          <p className="text-gray-700 leading-relaxed min-h-[80px]">{currentFact.text}</p>
          <div className="mt-4 pt-4 border-t border-amber-200">
            <div className="flex items-center justify-between mb-3">
              <span className="text-xs font-semibold text-amber-700 uppercase tracking-wide bg-amber-100 px-2 py-1 rounded">
                {currentFact.category}
              </span>
              <div className="flex gap-2">
                <button
                  onClick={handlePrev}
                  className="p-2 text-zus-navy hover:bg-amber-200 rounded-full transition-all hover:scale-110"
                  aria-label="Poprzedni fakt"
                >
                  <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 19l-7-7 7-7" />
                  </svg>
                </button>
                <button
                  onClick={handleNext}
                  className="p-2 text-zus-navy hover:bg-amber-200 rounded-full transition-all hover:scale-110"
                  aria-label="Następny fakt"
                >
                  <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
                  </svg>
                </button>
              </div>
            </div>
            {/* Progress dots */}
            <div className="flex gap-1.5 justify-center">
              {facts.map((_, index) => (
                <button
                  key={index}
                  onClick={() => setCurrentFactIndex(index)}
                  className={`h-2 rounded-full transition-all ${
                    index === currentFactIndex ? 'bg-amber-600 w-6' : 'bg-amber-300 w-2'
                  }`}
                  aria-label={`Przejdź do faktu ${index + 1}`}
                />
              ))}
            </div>
          </div>
        </div>
      </div>
    </Card>
  );
}
