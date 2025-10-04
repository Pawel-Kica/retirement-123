/**
 * Admin Export Page - Export all simulation data
 */

'use client';

import React from 'react';
import { useStore } from '@/lib/store';
import { PasswordProtection } from '@/components/admin/PasswordProtection';
import { SimulationsTable } from '@/components/admin/SimulationsTable';
import { ExportButton } from '@/components/admin/ExportButton';
import Link from 'next/link';

export default function AdminExportPage() {
  const { simulations } = useStore();

  return (
    <PasswordProtection>
      <div className="min-h-screen bg-gray-50 py-12 px-4 sm:px-6 lg:px-8">
        <div className="max-w-6xl mx-auto">
          {/* Back Link */}
          <Link
            href="/"
            className="inline-flex items-center text-zus-blue hover:text-zus-navy mb-6 transition-colors"
          >
            ← Powrót do strony głównej
          </Link>

          {/* Header */}
          <header className="text-center mb-12">
            <h1 className="text-4xl sm:text-5xl font-bold text-zus-navy mb-4">
              Export danych administratora
            </h1>
            <p className="text-lg text-zus-gray max-w-2xl mx-auto">
              Pobierz wszystkie dane z symulacji w formacie XLS
            </p>
          </header>

          {/* Main Content */}
          <main className="space-y-8">
            {/* Export Button */}
            <section>
              <ExportButton simulations={simulations} />
            </section>

            {/* Simulations Preview */}
            <section>
              <SimulationsTable simulations={simulations} />
            </section>

            {/* Info */}
            <section className="p-6 bg-blue-50 rounded-lg">
              <h3 className="font-semibold text-zus-navy mb-2">Informacje o eksporcie</h3>
              <p className="text-sm text-zus-gray mb-3">
                Plik XLS zawiera następujące kolumny:
              </p>
              <ul className="text-sm text-zus-gray space-y-1 list-disc list-inside">
                <li>Data użycia, Godzina użycia</li>
                <li>Emerytura oczekiwana</li>
                <li>Wiek, Płeć, Wysokość wynagrodzenia</li>
                <li>Czy uwzględniał okresy choroby</li>
                <li>Wysokość zgromadzonych środków na koncie i subkoncie</li>
                <li>Emerytura rzeczywista (nominalna), Emerytura urealniona</li>
                <li>Kod pocztowy</li>
              </ul>
            </section>
          </main>

          {/* Footer */}
          <footer className="mt-16 pt-8 border-t border-zus-gray text-center text-sm text-zus-gray">
            <p>
              Dane są przechowywane lokalnie w przeglądarce użytkownika.
            </p>
          </footer>
        </div>
      </div>
    </PasswordProtection>
  );
}
