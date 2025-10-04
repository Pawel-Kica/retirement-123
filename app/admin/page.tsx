"use client";

import { useEffect, useState } from "react";
import { Card } from "@/components/ui/Card";
import { Button } from "@/components/ui/Button";
import {
    IconRefresh,
    IconUsers,
    IconClock,
    IconCurrencyDollar,
    IconChartBar,
    IconTrendingUp,
    IconTrendingDown,
    IconCalendar,
    IconMapPin,
    IconReportMoney,
    IconHeartbeat,
} from "@tabler/icons-react";
import {
    Chart as ChartJS,
    CategoryScale,
    LinearScale,
    BarElement,
    LineElement,
    PointElement,
    ArcElement,
    Title,
    Tooltip,
    Legend,
    Filler,
} from "chart.js";
import { Bar, Line, Pie, Doughnut, Scatter } from "react-chartjs-2";
import { Sparklines, SparklinesLine, SparklinesSpots } from "react-sparklines";

ChartJS.register(
    CategoryScale,
    LinearScale,
    BarElement,
    LineElement,
    PointElement,
    ArcElement,
    Title,
    Tooltip,
    Legend,
    Filler
);

interface StatisticsData {
    dailySimulations: Array<{ date: string; count: string }>;
    hourlyUsage: Array<{ hour: number; count: string }>;
    genderBreakdown: Array<{ gender: string; count: string }>;
    ageDistribution: Array<{ age_group: string; count: string }>;
    salaryDistribution: Array<{ salary_bucket: string; count: string }>;
    pensionComparison: Array<{
        expected: string;
        actual: string;
        adjusted: string;
    }>;
    illnessInclusion: Array<{ included_l4: boolean; count: string }>;
    fundsDistribution: Array<{ funds_bucket: string; count: string }>;
    postalCodeDistribution: Array<{ postal_code: string; count: string }>;
    overallStats: {
        total_simulations: string;
        avg_age: string;
        avg_salary: string;
        avg_pension_nominal: string;
        avg_pension_real: string;
        first_simulation: string;
        last_simulation: string;
    };
}

export default function AdminPage() {
    const [data, setData] = useState<StatisticsData | null>(null);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState<string | null>(null);

    useEffect(() => {
        fetchStatistics();
    }, []);

    const fetchStatistics = async () => {
        try {
            setLoading(true);
            const response = await fetch("/api/admin/statistics");
            const result = await response.json();

            if (result.success) {
                setData(result.data);
            } else {
                setError(result.message || "Failed to load statistics");
            }
        } catch (err) {
            setError("Failed to fetch statistics");
            console.error(err);
        } finally {
            setLoading(false);
        }
    };

    if (loading) {
        return (
            <div className="min-h-screen flex items-center justify-center bg-gray-50">
                <div className="text-center">
                    <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-zus-green mx-auto mb-4"></div>
                    <p className="text-zus-grey-700">Ładowanie statystyk...</p>
                </div>
            </div>
        );
    }

    if (error) {
        return (
            <div className="min-h-screen flex items-center justify-center bg-gray-50">
                <Card className="p-8 text-center">
                    <p className="text-zus-error mb-4">❌ {error}</p>
                    <Button onClick={fetchStatistics}>Spróbuj ponownie</Button>
                </Card>
            </div>
        );
    }

    if (!data) {
        return null;
    }

    // Chart configurations
    const dailySimulationsChart = {
        labels: data.dailySimulations.map((d) => d.date).reverse(),
        datasets: [
            {
                label: "Liczba symulacji",
                data: data.dailySimulations.map((d) => parseInt(d.count)).reverse(),
                borderColor: "#00843D",
                backgroundColor: "rgba(0, 132, 61, 0.1)",
                fill: true,
                tension: 0.4,
            },
        ],
    };

    const hourlyUsageChart = {
        labels: Array.from({ length: 24 }, (_, i) => `${i}:00`),
        datasets: [
            {
                label: "Liczba użyć",
                data: Array.from({ length: 24 }, (_, i) => {
                    const hour = data.hourlyUsage.find((h) => h.hour === i);
                    return hour ? parseInt(hour.count) : 0;
                }),
                backgroundColor: "#00843D",
                borderRadius: 4,
            },
        ],
    };

    const genderChart = {
        labels: data.genderBreakdown.map((g) =>
            g.gender === "M" ? "Mężczyźni" : "Kobiety"
        ),
        datasets: [
            {
                data: data.genderBreakdown.map((g) => parseInt(g.count)),
                backgroundColor: ["#0088CC", "#F5A623"],
                borderWidth: 2,
                borderColor: "#fff",
            },
        ],
    };

    const ageDistributionChart = {
        labels: data.ageDistribution.map((a) => a.age_group),
        datasets: [
            {
                label: "Liczba użytkowników",
                data: data.ageDistribution.map((a) => parseInt(a.count)),
                backgroundColor: "#00843D",
                borderRadius: 4,
            },
        ],
    };

    const salaryDistributionChart = {
        labels: data.salaryDistribution.map(
            (s) => `${(parseInt(s.salary_bucket) / 1000).toFixed(0)}k`
        ),
        datasets: [
            {
                label: "Liczba użytkowników",
                data: data.salaryDistribution.map((s) => parseInt(s.count)),
                backgroundColor: "#0088CC",
                borderRadius: 4,
            },
        ],
    };

    const pensionComparisonChart = {
        datasets: [
            {
                label: "Oczekiwana vs Rzeczywista",
                data: data.pensionComparison.map((p) => ({
                    x: parseFloat(p.expected),
                    y: parseFloat(p.actual),
                })),
                backgroundColor: "rgba(0, 132, 61, 0.6)",
                pointRadius: 4,
            },
        ],
    };

    const illnessInclusionChart = {
        labels: ["Nie uwzględniono L4", "Uwzględniono L4"],
        datasets: [
            {
                data: [
                    parseInt(
                        data.illnessInclusion.find((i) => !i.included_l4)?.count || "0"
                    ),
                    parseInt(
                        data.illnessInclusion.find((i) => i.included_l4)?.count || "0"
                    ),
                ],
                backgroundColor: ["#00843D", "#D32F2F"],
                borderWidth: 2,
                borderColor: "#fff",
            },
        ],
    };

    const fundsDistributionChart = {
        labels: data.fundsDistribution.map(
            (f) => `${(parseInt(f.funds_bucket) / 1000).toFixed(0)}k`
        ),
        datasets: [
            {
                label: "Liczba użytkowników",
                data: data.fundsDistribution.map((f) => parseInt(f.count)),
                backgroundColor: "#F5A623",
                borderRadius: 4,
            },
        ],
    };

    const postalCodeChart = {
        labels: data.postalCodeDistribution.map((p) => p.postal_code || "Brak"),
        datasets: [
            {
                label: "Liczba symulacji",
                data: data.postalCodeDistribution.map((p) => parseInt(p.count)),
                backgroundColor: "#0B4C7C",
                borderRadius: 4,
            },
        ],
    };

    const chartOptions = {
        responsive: true,
        maintainAspectRatio: false,
        plugins: {
            legend: {
                display: true,
                position: "top" as const,
            },
        },
    };

    return (
        <main className="min-h-screen bg-gray-50">
            {/* Tabler-style Header */}
            <div className="bg-white border-b border-gray-200 sticky top-0 z-50 shadow-sm">
                <div className="container mx-auto px-4 max-w-7xl">
                    <div className="flex items-center justify-between h-16">
                        <div className="flex items-center gap-4">
                            <div className="w-8 h-8 bg-zus-green rounded flex items-center justify-center">
                                <IconChartBar className="text-white" size={20} />
                            </div>
                            <div>
                                <h1 className="text-xl font-bold text-gray-900">
                                    Panel Administracyjny
                                </h1>
                                <p className="text-sm text-gray-500">
                                    Symulator Emerytalny ZUS
                                </p>
                            </div>
                        </div>
                        <button
                            onClick={fetchStatistics}
                            className="inline-flex items-center gap-2 px-4 py-2 bg-zus-green text-white rounded-lg hover:bg-zus-green-dark transition-colors font-medium text-sm"
                        >
                            <IconRefresh size={18} />
                            Odśwież
                        </button>
                    </div>
                </div>
            </div>

            <div className="container mx-auto px-4 max-w-7xl py-8">

                {/* Tabler-style Stats Cards with Sparklines */}
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
                    {/* Total Simulations with Sparkline */}
                    <div className="bg-white rounded-lg border border-gray-200 p-6 hover:shadow-lg transition-shadow">
                        <div className="flex items-center justify-between mb-3">
                            <span className="text-sm font-medium text-gray-600">
                                Liczba symulacji
                            </span>
                            <div className="w-10 h-10 bg-blue-50 rounded-lg flex items-center justify-center">
                                <IconUsers className="text-blue-600" size={20} />
                            </div>
                        </div>
                        <div className="text-3xl font-bold text-gray-900 mb-3">
                            {parseInt(data.overallStats.total_simulations).toLocaleString(
                                "pl-PL"
                            )}
                        </div>
                        <div className="h-10 -mx-2 mb-2">
                            <Sparklines
                                data={data.dailySimulations
                                    .map((d) => parseInt(d.count))
                                    .reverse()}
                                height={40}
                            >
                                <SparklinesLine color="#0088CC" style={{ fill: "none", strokeWidth: 2 }} />
                                <SparklinesSpots size={2} style={{ fill: "#0088CC" }} />
                            </Sparklines>
                        </div>
                        <div className="flex items-center gap-2 text-sm">
                            <span className="inline-flex items-center gap-1 text-green-600">
                                <IconTrendingUp size={14} />
                                <span className="font-medium">Ostatnie 30 dni</span>
                            </span>
                        </div>
                    </div>

                    {/* Average Age with Progress */}
                    <div className="bg-white rounded-lg border border-gray-200 p-6 hover:shadow-lg transition-shadow">
                        <div className="flex items-center justify-between mb-3">
                            <span className="text-sm font-medium text-gray-600">
                                Średni wiek
                            </span>
                            <div className="w-10 h-10 bg-purple-50 rounded-lg flex items-center justify-center">
                                <IconClock className="text-purple-600" size={20} />
                            </div>
                        </div>
                        <div className="text-3xl font-bold text-gray-900 mb-3">
                            {parseFloat(data.overallStats.avg_age).toFixed(1)} lat
                        </div>
                        <div className="space-y-2 mb-2">
                            {data.ageDistribution.slice(0, 3).map((age, idx) => {
                                const maxCount = Math.max(
                                    ...data.ageDistribution.map((a) => parseInt(a.count))
                                );
                                const percentage = (parseInt(age.count) / maxCount) * 100;
                                return (
                                    <div key={idx}>
                                        <div className="flex justify-between text-xs text-gray-600 mb-1">
                                            <span>{age.age_group}</span>
                                            <span>{parseInt(age.count)}</span>
                                        </div>
                                        <div className="w-full bg-gray-200 rounded-full h-1.5">
                                            <div
                                                className="bg-purple-600 h-1.5 rounded-full transition-all"
                                                style={{ width: `${percentage}%` }}
                                            ></div>
                                        </div>
                                    </div>
                                );
                            })}
                        </div>
                    </div>

                    {/* Average Salary with Sparkline */}
                    <div className="bg-white rounded-lg border border-gray-200 p-6 hover:shadow-lg transition-shadow">
                        <div className="flex items-center justify-between mb-3">
                            <span className="text-sm font-medium text-gray-600">
                                Średnie wynagrodzenie
                            </span>
                            <div className="w-10 h-10 bg-yellow-50 rounded-lg flex items-center justify-center">
                                <IconCurrencyDollar className="text-yellow-600" size={20} />
                            </div>
                        </div>
                        <div className="text-3xl font-bold text-gray-900 mb-3">
                            {(parseInt(data.overallStats.avg_salary) / 1000).toFixed(1)}k zł
                        </div>
                        <div className="h-10 -mx-2 mb-2">
                            <Sparklines
                                data={data.salaryDistribution.map((s) => parseInt(s.count))}
                                height={40}
                            >
                                <SparklinesLine color="#F5A623" style={{ fill: "none", strokeWidth: 2 }} />
                                <SparklinesSpots size={2} style={{ fill: "#F5A623" }} />
                            </Sparklines>
                        </div>
                        <div className="flex items-center gap-2 text-sm">
                            <span className="inline-flex items-center gap-1 text-yellow-600">
                                <IconTrendingUp size={14} />
                                <span className="font-medium">Rozkład wynagrodzeń</span>
                            </span>
                        </div>
                    </div>

                    {/* Average Pension with Circular Progress */}
                    <div className="bg-white rounded-lg border border-gray-200 p-6 hover:shadow-lg transition-shadow">
                        <div className="flex items-center justify-between mb-3">
                            <span className="text-sm font-medium text-gray-600">
                                Średnia emerytura
                            </span>
                            <div className="w-10 h-10 bg-green-50 rounded-lg flex items-center justify-center">
                                <IconReportMoney className="text-green-600" size={20} />
                            </div>
                        </div>
                        <div className="text-3xl font-bold text-gray-900 mb-3">
                            {(parseInt(data.overallStats.avg_pension_nominal) / 1000).toFixed(
                                1
                            )}k zł
                        </div>
                        <div className="flex items-center justify-between mb-2">
                            <div className="flex-1">
                                <div className="flex justify-between text-xs text-gray-600 mb-1">
                                    <span>Nominalna</span>
                                    <span>
                                        {(
                                            parseInt(data.overallStats.avg_pension_nominal) / 1000
                                        ).toFixed(1)}
                                        k
                                    </span>
                                </div>
                                <div className="w-full bg-gray-200 rounded-full h-2">
                                    <div
                                        className="bg-green-600 h-2 rounded-full"
                                        style={{ width: "75%" }}
                                    ></div>
                                </div>
                            </div>
                        </div>
                        <div className="flex items-center justify-between">
                            <div className="flex-1">
                                <div className="flex justify-between text-xs text-gray-600 mb-1">
                                    <span>Urealniona</span>
                                    <span>
                                        {(parseInt(data.overallStats.avg_pension_real) / 1000).toFixed(
                                            1
                                        )}
                                        k
                                    </span>
                                </div>
                                <div className="w-full bg-gray-200 rounded-full h-2">
                                    <div
                                        className="bg-green-400 h-2 rounded-full"
                                        style={{ width: "65%" }}
                                    ></div>
                                </div>
                            </div>
                        </div>
                    </div>
                </div>

                {/* Tabler-style Quick Stats Row */}
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4 mb-8">
                    <div className="bg-white rounded-lg border border-gray-200 p-4 hover:shadow-md transition-shadow">
                        <div className="flex items-center gap-3">
                            <div className="w-12 h-12 bg-blue-500 rounded-lg flex items-center justify-center">
                                <IconUsers className="text-white" size={24} />
                            </div>
                            <div>
                                <div className="text-2xl font-bold text-gray-900">
                                    {data.genderBreakdown.find((g) => g.gender === "M")
                                        ? parseInt(
                                            data.genderBreakdown.find((g) => g.gender === "M")!.count
                                        )
                                        : 0}
                                </div>
                                <div className="text-sm text-gray-600">Mężczyźni</div>
                            </div>
                        </div>
                    </div>

                    <div className="bg-white rounded-lg border border-gray-200 p-4 hover:shadow-md transition-shadow">
                        <div className="flex items-center gap-3">
                            <div className="w-12 h-12 bg-pink-500 rounded-lg flex items-center justify-center">
                                <IconUsers className="text-white" size={24} />
                            </div>
                            <div>
                                <div className="text-2xl font-bold text-gray-900">
                                    {data.genderBreakdown.find((g) => g.gender === "F")
                                        ? parseInt(
                                            data.genderBreakdown.find((g) => g.gender === "F")!.count
                                        )
                                        : 0}
                                </div>
                                <div className="text-sm text-gray-600">Kobiety</div>
                            </div>
                        </div>
                    </div>

                    <div className="bg-white rounded-lg border border-gray-200 p-4 hover:shadow-md transition-shadow">
                        <div className="flex items-center gap-3">
                            <div className="w-12 h-12 bg-green-500 rounded-lg flex items-center justify-center">
                                <IconHeartbeat className="text-white" size={24} />
                            </div>
                            <div>
                                <div className="text-2xl font-bold text-gray-900">
                                    {parseInt(
                                        data.illnessInclusion.find((i) => !i.included_l4)?.count || "0"
                                    )}
                                </div>
                                <div className="text-sm text-gray-600">Bez L4</div>
                            </div>
                        </div>
                    </div>

                    <div className="bg-white rounded-lg border border-gray-200 p-4 hover:shadow-md transition-shadow">
                        <div className="flex items-center gap-3">
                            <div className="w-12 h-12 bg-red-500 rounded-lg flex items-center justify-center">
                                <IconHeartbeat className="text-white" size={24} />
                            </div>
                            <div>
                                <div className="text-2xl font-bold text-gray-900">
                                    {parseInt(
                                        data.illnessInclusion.find((i) => i.included_l4)?.count || "0"
                                    )}
                                </div>
                                <div className="text-sm text-gray-600">Z L4</div>
                            </div>
                        </div>
                    </div>
                </div>

                {/* Tabler-style Charts Grid */}
                <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                    {/* Daily Simulations */}
                    <div className="bg-white rounded-lg border border-gray-200 p-6 hover:shadow-lg transition-shadow">
                        <div className="flex items-center justify-between mb-6">
                            <div className="flex items-center gap-3">
                                <div className="w-10 h-10 bg-blue-50 rounded-lg flex items-center justify-center">
                                    <IconTrendingUp className="text-blue-600" size={20} />
                                </div>
                                <div>
                                    <h3 className="text-lg font-bold text-gray-900">
                                        Symulacje w czasie
                                    </h3>
                                    <p className="text-sm text-gray-500">Ostatnie 30 dni</p>
                                </div>
                            </div>
                        </div>
                        <div className="h-64">
                            <Line data={dailySimulationsChart} options={chartOptions} />
                        </div>
                    </div>

                    {/* Hourly Usage */}
                    <div className="bg-white rounded-lg border border-gray-200 p-6 hover:shadow-lg transition-shadow">
                        <div className="flex items-center justify-between mb-6">
                            <div className="flex items-center gap-3">
                                <div className="w-10 h-10 bg-purple-50 rounded-lg flex items-center justify-center">
                                    <IconClock className="text-purple-600" size={20} />
                                </div>
                                <div>
                                    <h3 className="text-lg font-bold text-gray-900">
                                        Wzorzec użycia
                                    </h3>
                                    <p className="text-sm text-gray-500">Według godziny</p>
                                </div>
                            </div>
                        </div>
                        <div className="h-64">
                            <Bar data={hourlyUsageChart} options={chartOptions} />
                        </div>
                    </div>

                    {/* Gender Breakdown */}
                    <div className="bg-white rounded-lg border border-gray-200 p-6 hover:shadow-lg transition-shadow">
                        <div className="flex items-center justify-between mb-6">
                            <div className="flex items-center gap-3">
                                <div className="w-10 h-10 bg-pink-50 rounded-lg flex items-center justify-center">
                                    <IconUsers className="text-pink-600" size={20} />
                                </div>
                                <div>
                                    <h3 className="text-lg font-bold text-gray-900">
                                        Podział według płci
                                    </h3>
                                    <p className="text-sm text-gray-500">Dystrybucja</p>
                                </div>
                            </div>
                        </div>
                        <div className="h-64 flex items-center justify-center">
                            <Pie data={genderChart} options={chartOptions} />
                        </div>
                    </div>

                    {/* Age Distribution */}
                    <div className="bg-white rounded-lg border border-gray-200 p-6 hover:shadow-lg transition-shadow">
                        <div className="flex items-center justify-between mb-6">
                            <div className="flex items-center gap-3">
                                <div className="w-10 h-10 bg-indigo-50 rounded-lg flex items-center justify-center">
                                    <IconChartBar className="text-indigo-600" size={20} />
                                </div>
                                <div>
                                    <h3 className="text-lg font-bold text-gray-900">
                                        Grupy wiekowe
                                    </h3>
                                    <p className="text-sm text-gray-500">Rozkład wieku</p>
                                </div>
                            </div>
                        </div>
                        <div className="h-64">
                            <Bar data={ageDistributionChart} options={chartOptions} />
                        </div>
                    </div>

                    {/* Salary Distribution */}
                    <div className="bg-white rounded-lg border border-gray-200 p-6 hover:shadow-lg transition-shadow">
                        <div className="flex items-center justify-between mb-6">
                            <div className="flex items-center gap-3">
                                <div className="w-10 h-10 bg-yellow-50 rounded-lg flex items-center justify-center">
                                    <IconCurrencyDollar className="text-yellow-600" size={20} />
                                </div>
                                <div>
                                    <h3 className="text-lg font-bold text-gray-900">
                                        Wynagrodzenia
                                    </h3>
                                    <p className="text-sm text-gray-500">Rozkład zarobków</p>
                                </div>
                            </div>
                        </div>
                        <div className="h-64">
                            <Bar data={salaryDistributionChart} options={chartOptions} />
                        </div>
                    </div>

                    {/* Pension Comparison */}
                    <div className="bg-white rounded-lg border border-gray-200 p-6 hover:shadow-lg transition-shadow">
                        <div className="flex items-center justify-between mb-6">
                            <div className="flex items-center gap-3">
                                <div className="w-10 h-10 bg-green-50 rounded-lg flex items-center justify-center">
                                    <IconReportMoney className="text-green-600" size={20} />
                                </div>
                                <div>
                                    <h3 className="text-lg font-bold text-gray-900">
                                        Oczekiwana vs Rzeczywista
                                    </h3>
                                    <p className="text-sm text-gray-500">Porównanie emerytur</p>
                                </div>
                            </div>
                        </div>
                        <div className="h-64">
                            <Scatter
                                data={pensionComparisonChart}
                                options={{
                                    ...chartOptions,
                                    scales: {
                                        x: {
                                            title: {
                                                display: true,
                                                text: "Oczekiwana (zł)",
                                            },
                                        },
                                        y: {
                                            title: {
                                                display: true,
                                                text: "Rzeczywista (zł)",
                                            },
                                        },
                                    },
                                }}
                            />
                        </div>
                    </div>

                    {/* Illness Inclusion */}
                    <div className="bg-white rounded-lg border border-gray-200 p-6 hover:shadow-lg transition-shadow">
                        <div className="flex items-center justify-between mb-6">
                            <div className="flex items-center gap-3">
                                <div className="w-10 h-10 bg-red-50 rounded-lg flex items-center justify-center">
                                    <IconHeartbeat className="text-red-600" size={20} />
                                </div>
                                <div>
                                    <h3 className="text-lg font-bold text-gray-900">
                                        Okresy choroby
                                    </h3>
                                    <p className="text-sm text-gray-500">Uwzględnienie L4</p>
                                </div>
                            </div>
                        </div>
                        <div className="h-64 flex items-center justify-center">
                            <Doughnut data={illnessInclusionChart} options={chartOptions} />
                        </div>
                    </div>

                    {/* Funds Distribution */}
                    <div className="bg-white rounded-lg border border-gray-200 p-6 hover:shadow-lg transition-shadow">
                        <div className="flex items-center justify-between mb-6">
                            <div className="flex items-center gap-3">
                                <div className="w-10 h-10 bg-orange-50 rounded-lg flex items-center justify-center">
                                    <IconReportMoney className="text-orange-600" size={20} />
                                </div>
                                <div>
                                    <h3 className="text-lg font-bold text-gray-900">
                                        Zgromadzony kapitał
                                    </h3>
                                    <p className="text-sm text-gray-500">Środki na koncie</p>
                                </div>
                            </div>
                        </div>
                        <div className="h-64">
                            <Bar data={fundsDistributionChart} options={chartOptions} />
                        </div>
                    </div>

                    {/* Postal Code Distribution */}
                    <div className="bg-white rounded-lg border border-gray-200 p-6 hover:shadow-lg transition-shadow lg:col-span-2">
                        <div className="flex items-center justify-between mb-6">
                            <div className="flex items-center gap-3">
                                <div className="w-10 h-10 bg-cyan-50 rounded-lg flex items-center justify-center">
                                    <IconMapPin className="text-cyan-600" size={20} />
                                </div>
                                <div>
                                    <h3 className="text-lg font-bold text-gray-900">
                                        Rozkład geograficzny
                                    </h3>
                                    <p className="text-sm text-gray-500">Top 50 kodów pocztowych</p>
                                </div>
                            </div>
                        </div>
                        <div className="h-96">
                            <Bar
                                data={postalCodeChart}
                                options={{
                                    ...chartOptions,
                                    indexAxis: "y" as const,
                                }}
                            />
                        </div>
                    </div>
                </div>

                {/* Tabler-style Info Panel */}
                <div className="mt-6 bg-blue-50 rounded-lg border border-blue-200 p-6">
                    <div className="flex items-start gap-4">
                        <div className="w-10 h-10 bg-blue-600 rounded-lg flex items-center justify-center flex-shrink-0">
                            <IconCalendar className="text-white" size={20} />
                        </div>
                        <div className="flex-1">
                            <h3 className="text-lg font-bold text-gray-900 mb-4">
                                Informacje o danych
                            </h3>
                            <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                                <div className="bg-white rounded-lg p-4 border border-blue-100">
                                    <p className="text-sm text-gray-600 mb-1">Pierwsza symulacja</p>
                                    <p className="text-lg font-bold text-gray-900">
                                        {new Date(
                                            data.overallStats.first_simulation
                                        ).toLocaleDateString("pl-PL")}
                                    </p>
                                </div>
                                <div className="bg-white rounded-lg p-4 border border-blue-100">
                                    <p className="text-sm text-gray-600 mb-1">Ostatnia symulacja</p>
                                    <p className="text-lg font-bold text-gray-900">
                                        {new Date(
                                            data.overallStats.last_simulation
                                        ).toLocaleDateString("pl-PL")}
                                    </p>
                                </div>
                                <div className="bg-white rounded-lg p-4 border border-blue-100">
                                    <p className="text-sm text-gray-600 mb-1">
                                        Średnia emerytura urealniona
                                    </p>
                                    <p className="text-lg font-bold text-gray-900">
                                        {parseInt(data.overallStats.avg_pension_real).toLocaleString(
                                            "pl-PL"
                                        )}{" "}
                                        zł
                                    </p>
                                </div>
                            </div>
                        </div>
                    </div>
                </div>
            </div>
        </main>
    );
}

