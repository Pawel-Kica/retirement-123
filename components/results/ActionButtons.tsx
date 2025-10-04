/**
 * ActionButtons Component - Dashboard and PDF download buttons
 */

'use client';

import React from 'react';
import { useRouter } from 'next/navigation';
import { Button } from '@/components/shared/Button';
import { useStore } from '@/lib/store';
import { generatePDF } from '@/lib/pdf-generator';

export function ActionButtons() {
  const router = useRouter();
  const { userInput, results } = useStore();

  const handleDownloadPDF = async () => {
    if (!userInput || !results) {
      alert('Brak danych do wygenerowania raportu');
      return;
    }

    try {
      await generatePDF(userInput, results);
    } catch (error) {
      console.error('PDF generation error:', error);
      alert('Błąd podczas generowania PDF');
    }
  };

  return (
    <div className="flex flex-col sm:flex-row gap-4 justify-center">
      <Button
        variant="navy"
        onClick={() => router.push('/dashboard')}
        className="px-8 py-4 text-lg"
      >
        Przejdź do Dashboardu
      </Button>
      <Button
        variant="primary"
        onClick={handleDownloadPDF}
        className="px-8 py-4 text-lg"
      >
        Pobierz raport (PDF)
      </Button>
    </div>
  );
}
