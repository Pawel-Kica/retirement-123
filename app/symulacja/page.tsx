/**
 * Simulation Page - Formularz symulacji emerytury
 */

import { SimulationForm } from '@/components/simulation/SimulationForm';
import Link from 'next/link';

export default function SimulationPage() {
  return (
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
            Symulacja emerytury
          </h1>
          <p className="text-lg text-zus-gray max-w-2xl mx-auto">
            Wypełnij poniższy formularz, aby zaprognozować swoją przyszłą emeryturę
          </p>
        </header>

        {/* Form */}
        <main>
          <SimulationForm />
        </main>

        {/* Footer Info */}
        <footer className="mt-12 text-center text-sm text-zus-gray max-w-2xl mx-auto">
          <p>
            Wszystkie obliczenia bazują na danych ZUS, GUS i NBP. Wyniki mają charakter
            edukacyjny i nie stanowią oficjalnej prognozy emerytury.
          </p>
        </footer>
      </div>
    </div>
  );
}
