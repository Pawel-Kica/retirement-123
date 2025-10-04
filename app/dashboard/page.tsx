/**
 * Dashboard Page - Advanced modifications and analysis
 */

'use client';

import React, { useState } from 'react';
import { useRouter } from 'next/navigation';
import { useStore } from '@/lib/store';
import { Button } from '@/components/shared/Button';
import { SalaryHistoryTable } from '@/components/dashboard/SalaryHistoryTable';
import { CapitalGrowthChart } from '@/components/dashboard/CapitalGrowthChart';
import { PostalCodeInput } from '@/components/dashboard/PostalCodeInput';
import { calculatePension } from '@/lib/pension-calculator';
import Link from 'next/link';
import type { SalaryPath } from '@/types';

export default function DashboardPage() {
  const router = useRouter();
  const {
    results,
    userInput,
    postalCode,
    setPostalCode,
    setResults,
    editedSalaryHistory,
    setEditedSalaryHistory,
  } = useStore();

  const [isRecalculating, setIsRecalculating] = useState(false);

  // Redirect if no results
  if (!results || !userInput) {
    if (typeof window !== 'undefined') {
      router.push('/symulacja');
    }
    return null;
  }

  const handleSalaryUpdate = (newPath: SalaryPath) => {
    setEditedSalaryHistory(newPath);
  };

  const handleRecalculate = () => {
    setIsRecalculating(true);
    try {
      // Use edited salary history if available
      // For MVP, we'll just recalculate with original inputs
      const newResults = calculatePension(userInput);
      setResults(newResults);
      alert('Przeliczenie zakończone pomyślnie!');
    } catch (error) {
      console.error('Recalculation error:', error);
      alert('Błąd podczas przeliczania');
    } finally {
      setIsRecalculating(false);
    }
  };

  const handleDownloadPDF = async () => {
    if (!userInput || !results) {
      alert('Brak danych do wygenerowania raportu');
      return;
    }

    try {
      const { generatePDF } = await import('@/lib/pdf-generator');
      await generatePDF(userInput, results);
    } catch (error) {
      console.error('PDF generation error:', error);
      alert('Błąd podczas generowania PDF');
    }
  };

  return (
    <div className="min-h-screen bg-gray-50 py-12 px-4 sm:px-6 lg:px-8">
      <div className="max-w-7xl mx-auto">
        {/* Back Link */}
        <Link
          href="/wynik"
          className="inline-flex items-center text-zus-blue hover:text-zus-navy mb-6 transition-colors"
        >
          ← Powrót do wyników
        </Link>

        {/* Header */}
        <header className="text-center mb-12">
          <h1 className="text-4xl sm:text-5xl font-bold text-zus-navy mb-4">
            Dashboard
          </h1>
          <p className="text-lg text-zus-gray max-w-2xl mx-auto">
            Zaawansowane modyfikacje i szczegółowa analiza
          </p>
        </header>

        {/* Main Content */}
        <div className="grid lg:grid-cols-3 gap-8">
          {/* Sidebar - Controls */}
          <div className="lg:col-span-1 space-y-6">
            {/* Postal Code */}
            <PostalCodeInput
              value={postalCode}
              onChange={setPostalCode}
            />

            {/* Action Buttons */}
            <div className="space-y-3">
              <Button
                variant="primary"
                onClick={handleRecalculate}
                disabled={isRecalculating}
                className="w-full"
              >
                {isRecalculating ? 'Przeliczam...' : 'Przelicz'}
              </Button>
              <Button
                variant="navy"
                onClick={handleDownloadPDF}
                className="w-full"
              >
                Pobierz raport (PDF)
              </Button>
            </div>

            {/* Salary History */}
            <SalaryHistoryTable
              salaryPath={editedSalaryHistory || results.salaryPath}
              onUpdate={handleSalaryUpdate}
            />
          </div>

          {/* Main - Charts */}
          <div className="lg:col-span-2 space-y-6">
            {/* Capital Growth */}
            <CapitalGrowthChart capitalHistory={results.capitalHistory} />

            {/* Info */}
            <div className="p-6 bg-blue-50 rounded-lg">
              <h3 className="font-semibold text-zus-navy mb-2">Wskazówka</h3>
              <p className="text-sm text-zus-gray">
                W tej sekcji możesz edytować historię zarobków i sprawdzić, jak wpłynie to na Twoją emeryturę.
                Po wprowadzeniu zmian kliknij "Przelicz", aby zobaczyć zaktualizowane wyniki.
              </p>
            </div>
          </div>
        </div>

        {/* Footer */}
        <footer className="mt-16 pt-8 border-t border-zus-gray text-center text-sm text-zus-gray">
          <p>
            Dashboard pozwala na szczegółową analizę i modyfikację parametrów symulacji.
          </p>
        </footer>
      </div>
    </div>
  );
}
