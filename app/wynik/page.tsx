/**
 * Results Page - Wynik symulacji emerytury
 */

'use client';

import React from 'react';
import { useRouter } from 'next/navigation';
import { useStore } from '@/lib/store';
import { MainResultsCard } from '@/components/results/MainResultsCard';
import { ComparisonMetrics } from '@/components/results/ComparisonMetrics';
import { L4ImpactCard } from '@/components/results/L4ImpactCard';
import { PostponementTable } from '@/components/results/PostponementTable';
import { GapAnalysisCard } from '@/components/results/GapAnalysisCard';
import { ActionButtons } from '@/components/results/ActionButtons';
import Link from 'next/link';

export default function ResultsPage() {
  const router = useRouter();
  const { results, userInput, expectedPension } = useStore();

  // Redirect if no results
  if (!results || !userInput) {
    if (typeof window !== 'undefined') {
      router.push('/symulacja');
    }
    return null;
  }

  return (
    <div className="min-h-screen bg-gray-50 py-12 px-4 sm:px-6 lg:px-8">
      <div className="max-w-6xl mx-auto">
        {/* Back Link */}
        <Link
          href="/symulacja"
          className="inline-flex items-center text-zus-blue hover:text-zus-navy mb-6 transition-colors"
        >
          ← Powrót do formularza
        </Link>

        {/* Header */}
        <header className="text-center mb-12">
          <h1 className="text-4xl sm:text-5xl font-bold text-zus-navy mb-4">
            Wynik symulacji
          </h1>
          <p className="text-lg text-zus-gray max-w-2xl mx-auto">
            Oto Twoja prognozowana emerytura na podstawie podanych danych
          </p>
        </header>

        {/* Main Content */}
        <main className="flex flex-col gap-8">
          {/* Main Results */}
          <section>
            <MainResultsCard
              nominal={results.nominal}
              real={results.real}
              retirementYear={results.retirementYear}
            />
          </section>

          {/* Comparison Metrics */}
          <section>
            <ComparisonMetrics
              replacementRate={results.replacementRate}
              vsAverage={results.vsAverage}
            />
          </section>

          {/* L4 Impact (conditional) */}
          {userInput.includeL4 && (
            <section>
              <L4ImpactCard
                l4Impact={results.l4Impact}
                includeL4={userInput.includeL4}
              />
            </section>
          )}

          {/* Postponement Variants */}
          <section>
            <PostponementTable postponement={results.postponement} />
          </section>

          {/* Gap Analysis */}
          <section>
            <GapAnalysisCard
              expectedPension={expectedPension}
              realPension={results.real}
              gapToExpected={results.gapToExpected}
              yearsToTarget={results.yearsToTarget}
            />
          </section>

          {/* Action Buttons */}
          <section className="py-8">
            <ActionButtons />
          </section>
        </main>

        {/* Footer */}
        <footer className="mt-16 pt-8 border-t border-zus-gray text-center text-sm text-zus-gray">
          <p>
            Symulator ma charakter edukacyjny. Rzeczywista emerytura może się różnić w zależności
            od zmian w przepisach i realnych warunków ekonomicznych.
          </p>
        </footer>
      </div>
    </div>
  );
}
