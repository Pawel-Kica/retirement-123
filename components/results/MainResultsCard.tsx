/**
 * MainResultsCard Component - Display nominal and real pension
 */

'use client';

import React from 'react';
import { Card } from '@/components/shared/Card';
import { formatCurrency } from '@/lib/utils';

interface MainResultsCardProps {
  nominal: number;
  real: number;
  retirementYear: number;
}

export function MainResultsCard({ nominal, real, retirementYear }: MainResultsCardProps) {
  return (
    <Card className="bg-gradient-to-r from-blue-50 to-green-50">
      <h2 className="text-2xl font-bold text-zus-navy mb-6 text-center">
        Twoja prognozowana emerytura
      </h2>

      <div className="grid md:grid-cols-2 gap-6">
        {/* Nominal Pension */}
        <div className="bg-white rounded-lg p-6 shadow-md border-2 border-zus-blue">
          <div className="text-sm text-zus-gray mb-2">
            Wysokość rzeczywista (nominalna)
          </div>
          <div className="text-4xl font-bold text-zus-navy mb-2">
            {formatCurrency(nominal)}
          </div>
          <div className="text-xs text-zus-gray">
            W roku przejścia na emeryturę ({retirementYear})
          </div>
        </div>

        {/* Real Pension */}
        <div className="bg-white rounded-lg p-6 shadow-md border-2 border-zus-green">
          <div className="text-sm text-zus-gray mb-2">
            Wysokość urealniona
          </div>
          <div className="text-4xl font-bold text-zus-navy mb-2">
            {formatCurrency(real)}
          </div>
          <div className="text-xs text-zus-gray">
            W dzisiejszych złotówkach (2025)
          </div>
        </div>
      </div>

      <div className="mt-4 p-3 bg-white rounded-md">
        <p className="text-sm text-zus-gray text-center">
          Kwota w dzisiejszych złotówkach pokazuje rzeczywistą siłę nabywczą Twojej przyszłej emerytury
        </p>
      </div>
    </Card>
  );
}
