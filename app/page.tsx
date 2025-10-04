'use client';

import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { Button } from '@/components/ui/Button';
import { Card } from '@/components/ui/Card';
import { Tooltip } from '@/components/ui/Tooltip';
import { useSimulation } from '@/lib/context/SimulationContext';
import { getRandomFact } from '@/lib/data/loader';
import { formatPLN } from '@/lib/utils/formatting';

export default function Home() {
  const router = useRouter();
  const { state, setExpectedPension } = useSimulation();
  const [pension, setPension] = useState(state.expectedPension);
  const [fact, setFact] = useState('');

  useEffect(() => {
    setFact(getRandomFact());
  }, []);

  const handleSliderChange = (value: number) => {
    setPension(value);
    setExpectedPension(value);
  };

  const handleNext = () => {
    setExpectedPension(pension);
    router.push('/symulacja');
  };

  // Pension distribution groups
  const groups = [
    {
      name: 'Poniżej minimalnej', range: '<1 780 zł', percent: 15, color: 'rgb(240,94,94)',
      description: 'Niska aktywność zawodowa, przerwy w karierze. Uwaga: Brak przepracowanych 25 lat (K) lub 20 lat (M) = brak gwarancji minimalnej emerytury.'
    },
    {
      name: 'Około minimalnej', range: '1 780-2 500 zł', percent: 25, color: 'rgb(255,179,79)',
      description: 'Niskie lub nieregularne zarobki, część kariery w szarej strefie lub okresy bezrobocia.'
    },
    {
      name: 'Około średniej', range: '2 500-4 500 zł', percent: 35, color: 'rgb(63,132,210)',
      description: 'Typowa kariera zawodowa, stałe zatrudnienie, średnie krajowe zarobki.'
    },
    {
      name: 'Powyżej średniej', range: '4 500-7 000 zł', percent: 20, color: 'rgb(0,153,63)',
      description: 'Wyższe zarobki, długi staż, brak długich przerw, regularne odprowadzanie składek.'
    },
    {
      name: 'Wysokie emerytury', range: '>7 000 zł', percent: 5, color: 'rgb(0,65,110)',
      description: 'Bardzo wysokie zarobki przez całą karierę, maksymalizacja składek, często odroczenie przejścia na emeryturę.'
    },
  ];

  return (
    <main className="min-h-screen bg-gradient-to-b from-gray-50 to-gray-100">
      <div className="container mx-auto px-4 py-12 max-w-6xl">
        {/* Header */}
        <div className="text-center mb-12">
          <h1 className="text-5xl font-bold text-[rgb(0,65,110)] mb-4">
            Symulator Emerytalny ZUS
          </h1>
          <p className="text-xl text-gray-700">
            Zaprognozuj swoją przyszłą emeryturę i dowiedz się, ile musisz zarobić
          </p>
        </div>

        {/* Expected Pension Input */}
        <Card className="mb-8">
          <div className="text-center mb-6">
            <h2 className="text-2xl font-bold text-[rgb(0,65,110)] mb-2">
              Jaka emerytura Cię zadowoli?
            </h2>
            <p className="text-gray-600">W dzisiejszych złotych (wartość realna)</p>
          </div>

          <div className="flex items-center justify-center gap-6 mb-6">
            <input
              type="number"
              min={500}
              max={15000}
              step={100}
              value={pension}
              onChange={(e) => handleSliderChange(Number(e.target.value))}
              className="w-32 p-3 text-center text-2xl font-bold border-2 border-[rgb(190,195,206)] rounded-lg"
            />
            <div className="text-3xl font-bold text-[rgb(0,65,110)]">
              {formatPLN(pension)}
            </div>
          </div>

          <input
            type="range"
            min={500}
            max={15000}
            step={100}
            value={pension}
            onChange={(e) => handleSliderChange(Number(e.target.value))}
            className="w-full h-3 bg-gray-200 rounded-lg appearance-none cursor-pointer accent-[rgb(255,179,79)]"
          />

          <div className="flex justify-between text-sm text-gray-600 mt-2">
            <span>500 zł</span>
            <span>15 000 zł</span>
          </div>
        </Card>

        {/* Comparison to Average */}
        <Card variant="highlight" className="mb-8">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm text-gray-700 mb-1">Obecna średnia emerytura w Polsce:</p>
              <p className="text-3xl font-bold text-[rgb(0,65,110)]">3 518,04 zł</p>
            </div>
            <Tooltip content="Średnia emerytura brutto w Polsce (dane GUS, 2024). Połowa emerytów otrzymuje mniej, połowa więcej. Twoje oczekiwania mogą być wyższe lub niższe.">
              <svg className="w-10 h-10 text-[rgb(63,132,210)]" fill="currentColor" viewBox="0 0 20 20">
                <path fillRule="evenodd" d="M18 10a8 8 0 11-16 0 8 8 0 0116 0zm-7-4a1 1 0 11-2 0 1 1 0 012 0zM9 9a1 1 0 000 2v3a1 1 0 001 1h1a1 1 0 100-2v-3a1 1 0 00-1-1H9z" clipRule="evenodd" />
              </svg>
            </Tooltip>
          </div>
          {pension < 3518 && (
            <p className="text-sm text-gray-700 mt-3">
              💡 Twoje oczekiwania są poniżej obecnej średniej
            </p>
          )}
          {pension > 3518 && (
            <p className="text-sm text-gray-700 mt-3">
              💡 Twoje oczekiwania są powyżej obecnej średniej
            </p>
          )}
        </Card>

        {/* Distribution Chart */}
        <Card className="mb-8">
          <h3 className="text-xl font-bold text-[rgb(0,65,110)] mb-6 text-center">
            Rozkład emerytur w Polsce
          </h3>

          <div className="space-y-3">
            {groups.map((group) => (
              <Tooltip key={group.name} content={group.description}>
                <div className="cursor-help">
                  <div className="flex items-center justify-between mb-1">
                    <span className="font-semibold text-sm">{group.name}</span>
                    <span className="text-sm text-gray-600">{group.range}</span>
                  </div>
                  <div className="w-full bg-gray-200 rounded-full h-8 overflow-hidden">
                    <div
                      className="h-full flex items-center justify-center text-white font-bold text-sm transition-all hover:opacity-90"
                      style={{
                        width: `${group.percent}%`,
                        backgroundColor: group.color,
                      }}
                    >
                      {group.percent}%
                    </div>
                  </div>
                </div>
              </Tooltip>
            ))}
          </div>
        </Card>

        {/* Fun Fact */}
        {fact && (
          <Card className="mb-8 bg-gradient-to-r from-[rgb(63,132,210)]/10 to-[rgb(0,153,63)]/10">
            <div className="flex items-start gap-4">
              <svg className="w-8 h-8 text-[rgb(255,179,79)] flex-shrink-0 mt-1" fill="currentColor" viewBox="0 0 20 20">
                <path d="M11 3a1 1 0 10-2 0v1a1 1 0 102 0V3zM15.657 5.757a1 1 0 00-1.414-1.414l-.707.707a1 1 0 001.414 1.414l.707-.707zM18 10a1 1 0 01-1 1h-1a1 1 0 110-2h1a1 1 0 011 1zM5.05 6.464A1 1 0 106.464 5.05l-.707-.707a1 1 0 00-1.414 1.414l.707.707zM5 10a1 1 0 01-1 1H3a1 1 0 110-2h1a1 1 0 011 1zM8 16v-1h4v1a2 2 0 11-4 0zM12 14c.015-.34.208-.646.477-.859a4 4 0 10-4.954 0c.27.213.462.519.476.859h4.002z" />
              </svg>
              <div>
                <h4 className="font-bold text-[rgb(0,65,110)] mb-2 text-lg">Czy wiesz, że...</h4>
                <p className="text-gray-700">{fact}</p>
              </div>
            </div>
          </Card>
        )}

        {/* CTA Button */}
        <div className="text-center">
          <Button
            onClick={handleNext}
            size="lg"
            className="w-full md:w-auto px-12 py-5 text-xl shadow-lg hover:shadow-xl transform hover:scale-105"
          >
            Przejdź do symulacji →
          </Button>
          <p className="text-sm text-gray-600 mt-4">
            Wypełnij prosty formularz i zobacz swoją prognozę
          </p>
        </div>
      </div>
    </main>
  );
}
