/**
 * SimulationForm Component - Main form for pension calculation
 * All required and optional fields with validation
 */

'use client';

import React, { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { useForm } from 'react-hook-form';
import { z } from 'zod';
import { Card } from '@/components/shared/Card';
import { Button } from '@/components/shared/Button';
import { Input } from '@/components/shared/Input';
import { PLNInput } from '@/components/shared/PLNInput';
import { GenderToggle } from '@/components/shared/GenderToggle';
import { YearSelector } from '@/components/shared/YearSelector';
import { InfoTooltip } from '@/components/shared/InfoTooltip';
import { useStore } from '@/lib/store';
import { calculatePension } from '@/lib/pension-calculator';
import { getTimestamp } from '@/lib/utils';
import type { UserInput, Gender } from '@/types';
import retirementAgeData from '@/data/retirementAgeBySex.json';
import sickImpactMData from '@/data/sickImpactM.json';
import sickImpactFData from '@/data/sickImpactF.json';

const CURRENT_YEAR = 2025;

// Validation schema
const formSchema = z.object({
  age: z.number().min(18, 'Wiek musi być co najmniej 18').max(100, 'Wiek musi być maksymalnie 100'),
  gender: z.enum(['male', 'female']),
  monthlySalary: z.number().min(1, 'Wynagrodzenie jest wymagane').max(100000, 'Wynagrodzenie jest za wysokie'),
  startYear: z.number().min(1960).max(2080),
  endYear: z.number().min(1960).max(2080),
  accountBalance: z.number().optional(),
  subaccountBalance: z.number().optional(),
  includeL4: z.boolean(),
});

export function SimulationForm() {
  const router = useRouter();
  const { expectedPension, setUserInput, setResults, addSimulation, postalCode } = useStore();

  const [age, setAge] = useState(30);
  const [gender, setGender] = useState<Gender>('male');
  const [monthlySalary, setMonthlySalary] = useState(5000);
  const [startYear, setStartYear] = useState(2015);
  const [endYear, setEndYear] = useState(2055);
  const [accountBalance, setAccountBalance] = useState<number | undefined>();
  const [subaccountBalance, setSubaccountBalance] = useState<number | undefined>();
  const [includeL4, setIncludeL4] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);

  // Calculate default end year based on retirement age
  useEffect(() => {
    const retirementAge = (retirementAgeData as Record<string, number>)[gender];
    const defaultEndYear = CURRENT_YEAR + (retirementAge - age);
    setEndYear(defaultEndYear);
  }, [age, gender]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsSubmitting(true);

    try {
      // Create user input
      const userInput: UserInput = {
        age,
        gender,
        monthlySalary,
        startYear,
        endYear,
        accountBalance,
        subaccountBalance,
        includeL4,
        expectedPension,
        postalCode,
      };

      // Validate
      formSchema.parse(userInput);

      // Calculate pension
      const results = calculatePension(userInput);

      // Save to store
      setUserInput(userInput);
      setResults(results);

      // Add to simulations history for admin export
      addSimulation({
        timestamp: getTimestamp(),
        expectedPension,
        age,
        gender,
        salary: monthlySalary,
        includeL4,
        accountBalance,
        subaccountBalance,
        nominalPension: results.nominal,
        realPension: results.real,
        postalCode,
      });

      // Navigate to results
      router.push('/wynik');
    } catch (error) {
      console.error('Form validation error:', error);
      alert('Błąd walidacji formularza. Sprawdź wprowadzone dane.');
    } finally {
      setIsSubmitting(false);
    }
  };

  const sickImpactInfo = gender === 'male'
    ? (sickImpactMData as { description: string }).description
    : (sickImpactFData as { description: string }).description;

  return (
    <Card className="max-w-3xl mx-auto">
      <h2 className="text-2xl font-bold text-zus-navy mb-6">Dane do symulacji</h2>

      <form onSubmit={handleSubmit} className="flex flex-col gap-6">
        {/* Required Fields Section */}
        <div className="space-y-4">
          <h3 className="text-lg font-semibold text-zus-navy flex items-center gap-2">
            Dane obowiązkowe
            <span className="text-sm font-normal text-zus-gray">(wszystkie pola wymagane)</span>
          </h3>

          {/* Age */}
          <Input
            label="Wiek (lata)"
            type="number"
            value={age}
            onChange={(e) => setAge(parseInt(e.target.value))}
            required
            min={18}
            max={100}
          />

          {/* Gender */}
          <GenderToggle
            label="Płeć"
            value={gender}
            onChange={setGender}
          />

          {/* Monthly Salary */}
          <PLNInput
            label="Wynagrodzenie brutto miesięczne (dziś)"
            value={monthlySalary}
            onChange={setMonthlySalary}
            required
            min={1}
            max={100000}
          />

          {/* Start Year */}
          <YearSelector
            label="Rok rozpoczęcia pracy"
            value={startYear}
            onChange={setStartYear}
            min={1960}
            max={CURRENT_YEAR}
            required
          />

          {/* End Year */}
          <div className="flex flex-col gap-1">
            <div className="flex items-center gap-2">
              <label className="text-sm font-medium text-zus-black">
                Planowany rok zakończenia aktywności zawodowej
                <span className="text-zus-red ml-1">*</span>
              </label>
              <InfoTooltip content="Domyślnie ustawiony na rok osiągnięcia wieku emerytalnego (60 lat dla kobiet, 65 lat dla mężczyzn). Możesz go zmienić, jeśli planujesz pracować dłużej lub krócej." />
            </div>
            <YearSelector
              value={endYear}
              onChange={setEndYear}
              min={startYear}
              max={2080}
            />
          </div>
        </div>

        {/* Optional Fields Section */}
        <div className="space-y-4 pt-6 border-t border-zus-gray">
          <h3 className="text-lg font-semibold text-zus-navy flex items-center gap-2">
            Dane fakultatywne
            <span className="text-sm font-normal text-zus-gray">(opcjonalne)</span>
          </h3>

          <p className="text-sm text-zus-gray">
            Jeśli znasz wysokość zgromadzonych środków, możesz je podać. W przeciwnym razie system oszacuje je automatycznie na podstawie Twojego wynagrodzenia i wskaźników.
          </p>

          {/* Account Balance */}
          <PLNInput
            label="Wysokość zgromadzonych środków na koncie ZUS"
            value={accountBalance || 0}
            onChange={(val) => setAccountBalance(val > 0 ? val : undefined)}
            min={0}
          />

          {/* Subaccount Balance */}
          <PLNInput
            label="Wysokość zgromadzonych środków na subkoncie ZUS"
            value={subaccountBalance || 0}
            onChange={(val) => setSubaccountBalance(val > 0 ? val : undefined)}
            min={0}
          />
        </div>

        {/* L4 Toggle Section */}
        <div className="space-y-4 pt-6 border-t border-zus-gray">
          <h3 className="text-lg font-semibold text-zus-navy">Opcje dodatkowe</h3>

          <div className="flex items-start gap-3">
            <input
              type="checkbox"
              id="includeL4"
              checked={includeL4}
              onChange={(e) => setIncludeL4(e.target.checked)}
              className="mt-1 w-5 h-5 text-zus-blue border-zus-gray rounded focus:ring-zus-blue"
            />
            <div className="flex-1">
              <label htmlFor="includeL4" className="text-sm font-medium text-zus-black cursor-pointer">
                Uwzględniaj możliwość zwolnień lekarskich (L4)
              </label>
              <p className="text-sm text-zus-gray mt-1">
                {sickImpactInfo}
              </p>
            </div>
          </div>
        </div>

        {/* Submit Button */}
        <div className="pt-6">
          <Button
            type="submit"
            variant="primary"
            disabled={isSubmitting}
            className="w-full text-lg py-4"
          >
            {isSubmitting ? 'Obliczam...' : 'Zaprognozuj moją przyszłą emeryturę →'}
          </Button>
        </div>
      </form>
    </Card>
  );
}
