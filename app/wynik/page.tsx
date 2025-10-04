'use client';

import { useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { Button } from '@/components/ui/Button';
import { Card } from '@/components/ui/Card';
import { useSimulation } from '@/lib/context/SimulationContext';
import { formatPLN, formatPercent, formatYears } from '@/lib/utils/formatting';

export default function WynikPage() {
    const router = useRouter();
    const { state } = useSimulation();

    useEffect(() => {
        if (!state.results) {
            router.push('/symulacja');
        }
    }, [state.results, router]);

    if (!state.results || !state.inputs) {
        return <div className="min-h-screen flex items-center justify-center">Ładowanie...</div>;
    }

    const { results, inputs, expectedPension } = state;

    return (
        <main className="min-h-screen bg-gradient-to-b from-gray-50 to-gray-100 py-12">
            <div className="container mx-auto px-4 max-w-5xl">
                <h1 className="text-4xl font-bold text-[rgb(0,65,110)] mb-8 text-center">
                    Twoja Prognoza Emerytury
                </h1>

                {/* Main Results */}
                <div className="grid md:grid-cols-2 gap-6 mb-8">
                    <Card>
                        <h3 className="text-sm text-gray-600 mb-2">
                            Twoja emerytura w {inputs.workEndYear} roku
                        </h3>
                        <div className="text-3xl font-bold text-[rgb(0,65,110)]">
                            {formatPLN(results.nominalPension)}
                        </div>
                        <p className="text-xs text-gray-500 mt-1">
                            (w cenach z {inputs.workEndYear} roku)
                        </p>
                    </Card>

                    <Card variant="highlight">
                        <div className="flex items-center gap-2 mb-2">
                            <span className="text-sm font-bold text-[rgb(0,153,63)]">
                                ⭐ W DZISIEJSZYCH ZŁOTYCH
                            </span>
                        </div>
                        <div className="text-5xl font-bold text-[rgb(0,153,63)]">
                            {formatPLN(results.realPension)}
                        </div>
                        <p className="text-sm text-gray-700 mt-2">
                            Porównywalna do dzisiejszych kosztów życia
                        </p>
                    </Card>
                </div>

                {/* Comparisons */}
                <Card className="mb-8">
                    <h3 className="text-xl font-bold text-[rgb(0,65,110)] mb-4">
                        Porównania i wskaźniki
                    </h3>

                    <div className="grid md:grid-cols-3 gap-6">
                        <div>
                            <p className="text-sm text-gray-600 mb-1">Stopa zastąpienia</p>
                            <p className="text-3xl font-bold text-[rgb(63,132,210)]">
                                {results.replacementRate}%
                            </p>
                        </div>

                        <div>
                            <p className="text-sm text-gray-600 mb-1">Vs średnia w {inputs.workEndYear}</p>
                            <p className={`text-3xl font-bold ${results.differenceVsAverage >= 0 ? 'text-[rgb(0,153,63)]' : 'text-[rgb(240,94,94)]'}`}>
                                {results.differenceVsAverage >= 0 ? '+' : ''}{formatPLN(results.differenceVsAverage)}
                            </p>
                        </div>

                        <div>
                            <p className="text-sm text-gray-600 mb-1">Vs Twoje oczekiwania</p>
                            <p className={`text-3xl font-bold ${results.differenceVsExpected >= 0 ? 'text-[rgb(0,153,63)]' : 'text-[rgb(240,94,94)]'}`}>
                                {results.differenceVsExpected >= 0 ? '+' : ''}{formatPLN(results.differenceVsExpected)}
                            </p>
                        </div>
                    </div>
                </Card>

                {/* L4 Impact */}
                {inputs.includeL4 && (
                    <Card className="mb-8 border-l-4 border-[rgb(240,94,94)]">
                        <h3 className="text-xl font-bold text-[rgb(0,65,110)] mb-4">
                            Wpływ zwolnień lekarskich na emeryturę
                        </h3>
                        <div className="grid md:grid-cols-2 gap-4">
                            <div className="p-4 bg-[rgb(0,153,63)]/10 rounded-lg">
                                <span className="text-sm text-gray-600">Bez L4</span>
                                <div className="text-2xl font-bold text-[rgb(0,153,63)]">
                                    {formatPLN(results.withoutL4.realPension)}
                                </div>
                            </div>
                            <div className="p-4 bg-[rgb(240,94,94)]/10 rounded-lg">
                                <span className="text-sm text-gray-600">Z uwzględnieniem L4</span>
                                <div className="text-2xl font-bold text-[rgb(240,94,94)]">
                                    {formatPLN(results.withL4.realPension)}
                                </div>
                            </div>
                        </div>
                        <div className="mt-4 p-4 bg-gray-50 rounded-lg">
                            <p className="font-bold text-[rgb(240,94,94)]">
                                📉 Różnica: {formatPLN(results.l4Difference)} miesięcznie
                            </p>
                        </div>
                    </Card>
                )}

                {/* Deferral Scenarios */}
                <Card className="mb-8">
                    <h3 className="text-xl font-bold text-[rgb(0,65,110)] mb-4">
                        Co jeśli będziesz pracować dłużej?
                    </h3>
                    <div className="overflow-x-auto">
                        <table className="w-full">
                            <thead>
                                <tr className="bg-[rgb(190,195,206)]/20">
                                    <th className="p-3 text-left">Scenariusz</th>
                                    <th className="p-3 text-right">Rok przejścia</th>
                                    <th className="p-3 text-right">Emerytura</th>
                                    <th className="p-3 text-right">Wzrost</th>
                                </tr>
                            </thead>
                            <tbody>
                                <tr className="border-b">
                                    <td className="p-3 font-bold">Bazowy</td>
                                    <td className="p-3 text-right">{inputs.workEndYear}</td>
                                    <td className="p-3 text-right font-bold">{formatPLN(results.realPension)}</td>
                                    <td className="p-3 text-right">-</td>
                                </tr>
                                {results.deferrals.map(def => (
                                    <tr key={def.additionalYears} className="border-b hover:bg-gray-50">
                                        <td className="p-3">+{formatYears(def.additionalYears)}</td>
                                        <td className="p-3 text-right">{def.retirementYear}</td>
                                        <td className="p-3 text-right font-bold text-[rgb(0,153,63)]">
                                            {formatPLN(def.realPension)}
                                        </td>
                                        <td className="p-3 text-right text-[rgb(0,153,63)] font-bold">
                                            +{formatPLN(def.increaseVsBase)}
                                            <br />
                                            <span className="text-xs">({def.percentIncrease.toFixed(1)}%)</span>
                                        </td>
                                    </tr>
                                ))}
                            </tbody>
                        </table>
                    </div>
                </Card>

                {/* Gap Analysis */}
                {results.differenceVsExpected < 0 && (
                    <Card variant="warning" className="mb-8">
                        <h3 className="text-xl font-bold text-[rgb(240,94,94)] mb-4">
                            ⚠️ Twoja prognoza jest niższa od oczekiwań
                        </h3>
                        <div className="p-4 bg-white rounded-lg mb-4">
                            <p className="text-xl font-bold text-[rgb(240,94,94)]">
                                Brakuje: {formatPLN(Math.abs(results.differenceVsExpected))} miesięcznie
                            </p>
                        </div>
                        {results.yearsNeeded !== null && (
                            <div className="p-4 bg-[rgb(255,179,79)]/20 rounded-lg">
                                <p className="font-bold text-lg">💡 Aby osiągnąć oczekiwaną kwotę:</p>
                                <p className="text-xl font-bold text-[rgb(0,65,110)] mt-2">
                                    Musisz pracować o {formatYears(results.yearsNeeded)} dłużej
                                </p>
                            </div>
                        )}
                    </Card>
                )}

                {results.differenceVsExpected >= 0 && (
                    <Card variant="highlight" className="mb-8">
                        <h3 className="text-xl font-bold text-[rgb(0,153,63)]">
                            ✅ Gratulacje! Przekraczasz swoje oczekiwania
                        </h3>
                        <p className="mt-2">
                            Twoja prognozowana emerytura ({formatPLN(results.realPension)}) jest wyższa
                            od oczekiwanej ({formatPLN(expectedPension)}) o {formatPLN(results.differenceVsExpected)}.
                        </p>
                    </Card>
                )}

                {/* Actions */}
                <div className="flex flex-col md:flex-row gap-4">
                    <Button
                        onClick={() => router.push('/dashboard')}
                        variant="secondary"
                        size="lg"
                        className="flex-1"
                    >
                        📊 Przejdź do Dashboardu
                    </Button>
                    <Button
                        onClick={() => alert('Funkcja PDF w przygotowaniu')}
                        size="lg"
                        className="flex-1"
                    >
                        📄 Pobierz raport (PDF)
                    </Button>
                </div>
            </div>
        </main>
    );
}

