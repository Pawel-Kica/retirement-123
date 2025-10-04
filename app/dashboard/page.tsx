'use client';

import { useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { Button } from '@/components/ui/Button';
import { Card } from '@/components/ui/Card';
import { useSimulation } from '@/lib/context/SimulationContext';
import { formatPLN } from '@/lib/utils/formatting';

export default function DashboardPage() {
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

    return (
        <main className="min-h-screen bg-gradient-to-b from-gray-50 to-gray-100 py-12">
            <div className="container mx-auto px-4 max-w-6xl">
                <div className="mb-8">
                    <button
                        onClick={() => router.push('/wynik')}
                        className="text-[rgb(63,132,210)] hover:underline mb-4"
                    >
                        ← Powrót do wyników
                    </button>
                    <h1 className="text-4xl font-bold text-[rgb(0,65,110)]">
                        Dashboard - Zaawansowane Modyfikacje
                    </h1>
                    <p className="text-gray-700 mt-2">
                        Dostosuj szczegółowe parametry swojej prognozy
                    </p>
                </div>

                {/* Capital over time */}
                <Card className="mb-8">
                    <h3 className="text-2xl font-bold text-[rgb(0,65,110)] mb-4">
                        Kapitał emerytalny w czasie
                    </h3>
                    <div className="overflow-x-auto">
                        <table className="w-full text-sm">
                            <thead>
                                <tr className="bg-[rgb(190,195,206)]/20">
                                    <th className="p-2 text-left">Rok</th>
                                    <th className="p-2 text-right">Wiek</th>
                                    <th className="p-2 text-right">Wynagrodzenie</th>
                                    <th className="p-2 text-right">Składki</th>
                                    <th className="p-2 text-right">Kapitał</th>
                                </tr>
                            </thead>
                            <tbody>
                                {state.results.capitalPath.slice(0, 10).map(entry => (
                                    <tr key={entry.year} className="border-b hover:bg-gray-50">
                                        <td className="p-2 font-bold">{entry.year}</td>
                                        <td className="p-2 text-right text-gray-600">{entry.age}</td>
                                        <td className="p-2 text-right">{formatPLN(entry.salary)}</td>
                                        <td className="p-2 text-right text-[rgb(0,153,63)]">
                                            +{formatPLN(entry.contributions)}
                                        </td>
                                        <td className="p-2 text-right font-bold">
                                            {formatPLN(entry.totalCapital)}
                                        </td>
                                    </tr>
                                ))}
                            </tbody>
                        </table>
                        {state.results.capitalPath.length > 10 && (
                            <p className="text-sm text-gray-600 mt-2 text-center">
                                Pokazano 10 z {state.results.capitalPath.length} lat
                            </p>
                        )}
                    </div>
                </Card>

                {/* Salary path */}
                <Card className="mb-8">
                    <h3 className="text-2xl font-bold text-[rgb(0,65,110)] mb-4">
                        Ścieżka wynagrodzeń
                    </h3>
                    <div className="overflow-x-auto">
                        <table className="w-full text-sm">
                            <thead>
                                <tr className="bg-[rgb(190,195,206)]/20">
                                    <th className="p-2 text-left">Rok</th>
                                    <th className="p-2 text-right">Wiek</th>
                                    <th className="p-2 text-right">Miesięczne brutto</th>
                                    <th className="p-2 text-right">Roczne brutto</th>
                                    <th className="p-2 text-center">Status</th>
                                </tr>
                            </thead>
                            <tbody>
                                {state.results.salaryPath.slice(0, 10).map(entry => (
                                    <tr key={entry.year} className="border-b hover:bg-gray-50">
                                        <td className="p-2 font-bold">{entry.year}</td>
                                        <td className="p-2 text-right text-gray-600">{entry.age}</td>
                                        <td className="p-2 text-right">{formatPLN(entry.monthlyGross)}</td>
                                        <td className="p-2 text-right">{formatPLN(entry.annualGross)}</td>
                                        <td className="p-2 text-center">
                                            {entry.isHistorical && <span className="text-xs bg-gray-200 px-2 py-1 rounded">Historia</span>}
                                            {entry.isCurrentYear && <span className="text-xs bg-[rgb(63,132,210)] text-white px-2 py-1 rounded">Obecnie</span>}
                                            {entry.isFuture && <span className="text-xs bg-[rgb(0,153,63)] text-white px-2 py-1 rounded">Prognoza</span>}
                                        </td>
                                    </tr>
                                ))}
                            </tbody>
                        </table>
                        {state.results.salaryPath.length > 10 && (
                            <p className="text-sm text-gray-600 mt-2 text-center">
                                Pokazano 10 z {state.results.salaryPath.length} lat
                            </p>
                        )}
                    </div>
                </Card>

                {/* Actions */}
                <div className="flex gap-4">
                    <Button
                        onClick={() => router.push('/wynik')}
                        variant="ghost"
                        size="lg"
                        className="flex-1"
                    >
                        Powrót do wyników
                    </Button>
                    <Button
                        onClick={() => alert('Funkcja PDF w przygotowaniu')}
                        size="lg"
                        className="flex-1"
                    >
                        📄 Pobierz szczegółowy raport (PDF)
                    </Button>
                </div>

                <div className="mt-8 p-6 bg-[rgb(63,132,210)]/10 rounded-lg">
                    <h4 className="font-bold text-[rgb(0,65,110)] mb-2">
                        ℹ️ Dashboard w rozbudowie
                    </h4>
                    <p className="text-gray-700">
                        Pełna funkcjonalność Dashboardu (edycja historii płac, prognozy przyszłości,
                        okresy L4, scenariusze A/B) będzie dostępna w kolejnej wersji.
                        Obecnie możesz przeglądać szczegółową ścieżkę wynagrodzeń i kapitału.
                    </p>
                </div>
            </div>
        </main>
    );
}

