/**
 * CTAButton Component - Call to action button for simulation
 */

'use client';

import React from 'react';
import { useRouter } from 'next/navigation';
import { Button } from '@/components/shared/Button';

export function CTAButton() {
  const router = useRouter();

  return (
    <div className="text-center bg-gradient-to-r from-orange-50 to-amber-50 rounded-2xl p-8 border border-orange-200">
      <h3 className="text-2xl font-bold text-zus-navy mb-3">
        Gotowy, aby poznać swoją przyszłość emerytalną?
      </h3>
      <p className="text-gray-600 mb-6 max-w-xl mx-auto">
        Wypełnij krótki formularz i sprawdź, jaka emerytura Cię czeka. To zajmie tylko chwilę!
      </p>
      <Button
        variant="primary"
        onClick={() => router.push('/symulacja')}
        className="text-xl px-16 py-5 shadow-xl hover:shadow-2xl transform hover:scale-105 transition-all duration-200 bg-gradient-to-r from-orange-500 to-amber-500 hover:from-orange-600 hover:to-amber-600"
      >
        Rozpocznij symulację →
      </Button>
      <p className="text-xs text-gray-500 mt-4">
        ✓ Bezpłatnie  ✓ Bez rejestracji  ✓ Wynik w 2 minuty
      </p>
    </div>
  );
}
