'use client';

import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { Button } from '@/components/ui/Button';
import { Card } from '@/components/ui/Card';
import { Input } from '@/components/ui/Input';
import { FormField } from '@/components/ui/FormField';
import { Accordion } from '@/components/ui/Accordion';
import { useSimulation } from '@/lib/context/SimulationContext';
import { SimulationInputs } from '@/lib/types';
import { validateSimulationInputs, getFieldError } from '@/lib/utils/validation';
import { loadAllData } from '@/lib/data/loader';

export default function SimulacjaPage() {
    const router = useRouter();
    const { state, setInputs, recalculate, isCalculating } = useSimulation();
    const [data, setData] = useState<any>(null);

    const currentYear = new Date().getFullYear();
    const [formData, setFormData] = useState<Partial<SimulationInputs>>({
        age: undefined,
        sex: undefined,
        monthlyGross: undefined,
        workStartYear: undefined,
        workEndYear: undefined,
        includeL4: false,
    });

    const [errors, setErrors] = useState<any[]>([]);
    const [showL4Info, setShowL4Info] = useState(false);
    const [openAccordion, setOpenAccordion] = useState<number>(0); // 0 = first, 1 = second, 2 = third

    useEffect(() => {
        const loadedData = loadAllData();
        setData(loadedData);

        // Calculate default retirement year
        if (formData.age && formData.sex) {
            const retirementAge = loadedData.retirementAge[formData.sex];
            const defaultRetirementYear = currentYear + (retirementAge - formData.age);
            setFormData(prev => ({ ...prev, workEndYear: defaultRetirementYear }));
        }
    }, []);

    const handleChange = (field: keyof SimulationInputs, value: any) => {
        setFormData(prev => ({ ...prev, [field]: value }));

        // Clear existing errors for this field
        setErrors(prevErrors => prevErrors.filter(error => error.field !== field));

        // Real-time validation for age
        if (field === 'age' && value !== undefined) {
            if (value < 18) {
                setErrors(prev => [...prev, { field: 'age', message: 'Musisz mieć co najmniej 18 lat' }]);
            } else if (value > 120) {
                setErrors(prev => [...prev, { field: 'age', message: 'Podany wiek przekracza maksymalny realistyczny wiek (120 lat)' }]);
            } else if (value > 70) {
                setErrors(prev => [...prev, { field: 'age', message: 'Wiek powyżej 70 lat - prawdopodobnie jesteś już na emeryturze' }]);
            }
        }

        // Real-time validation for monthly gross
        if (field === 'monthlyGross' && value !== undefined) {
            if (value < 1000) {
                setErrors(prev => [...prev, { field: 'monthlyGross', message: 'Wynagrodzenie musi być co najmniej 1 000 zł' }]);
            } else if (value > 100000) {
                setErrors(prev => [...prev, { field: 'monthlyGross', message: 'Wynagrodzenie nie może przekraczać 100 000 zł' }]);
            }
        }

        // Recalculate default retirement year when age or sex changes
        if ((field === 'age' || field === 'sex') && data) {
            const age = field === 'age' ? value : formData.age;
            const sex = field === 'sex' ? value : formData.sex;
            if (age && sex) {
                const retirementAge = data.retirementAge[sex];
                const defaultRetirementYear = currentYear + (retirementAge - age);
                setFormData(prev => ({ ...prev, workEndYear: defaultRetirementYear }));
            }
        }
    };

    // Validate individual sections
    const validateSection1 = (): boolean => {
        const sectionErrors = [];

        if (!formData.age) {
            sectionErrors.push({ field: 'age', message: 'Wiek jest wymagany' });
        } else if (formData.age < 18) {
            sectionErrors.push({ field: 'age', message: 'Musisz mieć co najmniej 18 lat' });
        } else if (formData.age > 120) {
            sectionErrors.push({ field: 'age', message: 'Podany wiek przekracza maksymalny realistyczny wiek (120 lat)' });
        } else if (formData.age > 70) {
            sectionErrors.push({ field: 'age', message: 'Wiek powyżej 70 lat - prawdopodobnie jesteś już na emeryturze' });
        }

        if (!formData.sex) {
            sectionErrors.push({ field: 'sex', message: 'Płeć jest wymagana' });
        }

        if (!formData.monthlyGross) {
            sectionErrors.push({ field: 'monthlyGross', message: 'Wynagrodzenie jest wymagane' });
        } else if (formData.monthlyGross < 1000) {
            sectionErrors.push({ field: 'monthlyGross', message: 'Wynagrodzenie musi być co najmniej 1 000 zł' });
        } else if (formData.monthlyGross > 100000) {
            sectionErrors.push({ field: 'monthlyGross', message: 'Wynagrodzenie nie może przekraczać 100 000 zł' });
        }

        if (!formData.workStartYear) {
            sectionErrors.push({ field: 'workStartYear', message: 'Rok rozpoczęcia pracy jest wymagany' });
        } else if (formData.workStartYear > currentYear) {
            sectionErrors.push({ field: 'workStartYear', message: 'Rok rozpoczęcia nie może być w przyszłości' });
        } else if (formData.age && formData.workStartYear < currentYear - formData.age + 18) {
            sectionErrors.push({ field: 'workStartYear', message: 'Rok rozpoczęcia pracy nie pasuje do podanego wieku' });
        }

        if (!formData.workEndYear) {
            sectionErrors.push({ field: 'workEndYear', message: 'Rok zakończenia pracy jest wymagany' });
        } else if (formData.workStartYear && formData.workEndYear <= formData.workStartYear) {
            sectionErrors.push({ field: 'workEndYear', message: 'Rok zakończenia musi być po roku rozpoczęcia' });
        } else if (formData.workEndYear > 2080) {
            sectionErrors.push({ field: 'workEndYear', message: 'Rok zakończenia nie może przekraczać 2080' });
        }

        setErrors(sectionErrors);
        return sectionErrors.length === 0;
    };

    const isSection1Complete = (): boolean => {
        return !!(
            formData.age &&
            formData.age >= 18 &&
            formData.age <= 120 &&
            formData.sex &&
            formData.monthlyGross &&
            formData.monthlyGross >= 1000 &&
            formData.workStartYear &&
            formData.workEndYear
        );
    };

    const handleNextSection = (nextSection: number) => {
        if (nextSection === 1) {
            // Validate section 1 before moving to section 2
            if (validateSection1()) {
                setOpenAccordion(nextSection);
            }
        } else {
            // Section 2 and 3 are optional, can proceed
            setOpenAccordion(nextSection);
        }
    };

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();

        // Validate
        const validation = validateSimulationInputs(formData);
        if (!validation.isValid) {
            setErrors(validation.errors);
            // Open the first section with errors
            if (validation.errors.some(e => ['age', 'sex', 'monthlyGross', 'workStartYear', 'workEndYear'].includes(e.field))) {
                setOpenAccordion(0);
            }
            return;
        }

        setErrors([]);

        try {
            setInputs(formData as SimulationInputs);
            await recalculate();
            router.push('/wynik');
        } catch (error) {
            console.error('Calculation error:', error);
            alert('Wystąpił błąd podczas obliczania prognozy. Spróbuj ponownie.');
        }
    };

    // Generate year options
    const startYearOptions: Array<{ value: number | string; label: string }> = [{ value: '', label: 'Wybierz rok...' }];
    const earliestStart = currentYear - (formData.age || 70) + 18;
    for (let year = earliestStart; year <= currentYear; year++) {
        startYearOptions.push({ value: year, label: year.toString() });
    }

    const endYearOptions: Array<{ value: number | string; label: string }> = [{ value: '', label: 'Wybierz rok...' }];
    const minEnd = (formData.workStartYear || currentYear) + 10;
    for (let year = minEnd; year <= 2080; year++) {
        endYearOptions.push({ value: year, label: year.toString() });
    }

    if (!data) return <div className="min-h-screen flex items-center justify-center">Ładowanie...</div>;

    const l4Config = formData.sex === 'M' ? data.sickImpactM : data.sickImpactF;

    return (
        <main className="min-h-screen bg-gradient-to-b from-gray-50 to-gray-100 py-12">
            <div className="container mx-auto px-4 max-w-3xl">
                <div className="mb-8">
                    <button
                        onClick={() => router.push('/')}
                        className="text-zus-green hover:underline mb-4 font-medium"
                    >
                        ← Powrót do strony głównej
                    </button>
                    <h1 className="text-4xl font-bold text-zus-grey-900">
                        Symulacja Emerytury
                    </h1>
                    <p className="text-zus-grey-700 mt-2">
                        Wypełnij formularz, aby poznać prognozę swojej przyszłej emerytury
                    </p>
                </div>

                <form onSubmit={handleSubmit}>
                    <Accordion
                        title="Dane podstawowe"
                        isOpen={openAccordion === 0}
                        onToggle={() => setOpenAccordion(openAccordion === 0 ? -1 : 0)}
                        badge={isSection1Complete() ? "✓ WYPEŁNIONE" : "WYMAGANE"}
                        icon={isSection1Complete() ? "✅" : "📋"}
                    >
                        <div className="space-y-4">
                            <FormField
                                label="Twój obecny wiek"
                                required
                                error={getFieldError(errors, 'age')}
                            >
                                <div className="relative">
                                    <input
                                        type="number"
                                        min={18}
                                        max={120}
                                        value={formData.age !== undefined ? formData.age : ''}
                                        onChange={(e) => {
                                            const value = e.target.value;
                                            handleChange('age', value === '' ? undefined : Number(value));
                                        }}
                                        placeholder="np. 35"
                                        className="w-full px-4 py-2 pr-16 border border-zus-grey-300 rounded focus:outline-none focus:ring-2 focus:ring-zus-green focus:border-zus-green"
                                        required
                                    />
                                    <span className="absolute right-4 top-1/2 -translate-y-1/2 text-gray-500">
                                        lat
                                    </span>
                                </div>
                                {formData.age && formData.age > 70 && formData.age <= 120 && !getFieldError(errors, 'age') && (
                                    <div className="mt-2 p-3 bg-orange-50 border-l-4 border-zus-warning rounded text-sm text-zus-grey-700">
                                        💡 W tym wieku prawdopodobnie jesteś już na emeryturze. Symulator służy do planowania przyszłej emerytury.
                                    </div>
                                )}
                            </FormField>

                            <FormField
                                label="Płeć"
                                required
                                error={getFieldError(errors, 'sex')}
                            >
                                <div className="flex gap-6">
                                    <label className="flex items-center gap-2 cursor-pointer">
                                        <input
                                            type="radio"
                                            name="sex"
                                            value="F"
                                            checked={formData.sex === 'F'}
                                            onChange={(e) => handleChange('sex', e.target.value as 'M' | 'F')}
                                            className="w-5 h-5 accent-zus-green"
                                        />
                                        <span className="text-lg">Kobieta</span>
                                    </label>
                                    <label className="flex items-center gap-2 cursor-pointer">
                                        <input
                                            type="radio"
                                            name="sex"
                                            value="M"
                                            checked={formData.sex === 'M'}
                                            onChange={(e) => handleChange('sex', e.target.value as 'M' | 'F')}
                                            className="w-5 h-5 accent-zus-green"
                                        />
                                        <span className="text-lg">Mężczyzna</span>
                                    </label>
                                </div>
                            </FormField>

                            <FormField
                                label="Twoje obecne wynagrodzenie brutto miesięczne"
                                required
                                error={getFieldError(errors, 'monthlyGross')}
                                hint={!getFieldError(errors, 'monthlyGross') ? "Podaj kwotę brutto (przed potrąceniem podatków i składek)" : undefined}
                            >
                                <div className="relative">
                                    <input
                                        type="number"
                                        min={1000}
                                        max={100000}
                                        step={100}
                                        value={formData.monthlyGross !== undefined ? formData.monthlyGross : ''}
                                        onChange={(e) => {
                                            const value = e.target.value;
                                            handleChange('monthlyGross', value === '' ? undefined : Number(value));
                                        }}
                                        placeholder="np. 5000"
                                        className="w-full px-4 py-2 pr-12 border border-zus-grey-300 rounded focus:outline-none focus:ring-2 focus:ring-zus-green focus:border-zus-green"
                                        required
                                    />
                                    <span className="absolute right-4 top-1/2 -translate-y-1/2 text-gray-500">
                                        zł
                                    </span>
                                </div>
                            </FormField>

                            <FormField
                                label="W którym roku rozpocząłeś/rozpoczęłaś pracę?"
                                required
                                error={getFieldError(errors, 'workStartYear')}
                                hint={!getFieldError(errors, 'workStartYear') ? "📅 Zawsze liczone od stycznia danego roku" : undefined}
                            >
                                <select
                                    value={formData.workStartYear || ''}
                                    onChange={(e) => handleChange('workStartYear', e.target.value === '' ? undefined : Number(e.target.value))}
                                    className="w-full px-4 py-2 border border-zus-grey-300 rounded focus:outline-none focus:ring-2 focus:ring-zus-green focus:border-zus-green"
                                    required
                                >
                                    {startYearOptions.map(opt => (
                                        <option key={opt.value} value={opt.value}>{opt.label}</option>
                                    ))}
                                </select>
                            </FormField>

                            <FormField
                                label="Planowany rok przejścia na emeryturę"
                                required
                                error={getFieldError(errors, 'workEndYear')}
                                hint={!getFieldError(errors, 'workEndYear') && formData.workEndYear ? `💡 Możesz wybrać inny rok, jeśli planujesz pracować dłużej lub krócej.` : undefined}
                            >
                                <select
                                    value={formData.workEndYear || ''}
                                    onChange={(e) => handleChange('workEndYear', e.target.value === '' ? undefined : Number(e.target.value))}
                                    className="w-full px-4 py-2 border border-zus-grey-300 rounded focus:outline-none focus:ring-2 focus:ring-zus-green focus:border-zus-green"
                                    required
                                >
                                    {endYearOptions.map(opt => (
                                        <option key={opt.value} value={opt.value}>{opt.label}</option>
                                    ))}
                                </select>
                            </FormField>
                        </div>

                        <div className="mt-6 pt-6 border-t border-zus-grey-300">
                            {!isSection1Complete() && errors.length > 0 && (
                                <div className="mb-4 p-4 bg-red-50 border-l-4 border-zus-error rounded">
                                    <p className="text-sm font-semibold text-zus-error mb-2">
                                        ⚠️ Uzupełnij wszystkie wymagane pola:
                                    </p>
                                    <ul className="text-sm text-gray-700 list-disc pl-5 space-y-1">
                                        {errors.map((error, idx) => (
                                            <li key={idx}>{error.message}</li>
                                        ))}
                                    </ul>
                                </div>
                            )}
                            <Button
                                type="button"
                                onClick={() => handleNextSection(1)}
                                variant="success"
                                size="lg"
                                className="w-full"
                                disabled={!isSection1Complete()}
                            >
                                {isSection1Complete() ? '✓ ' : ''}Dalej: Zgromadzony kapitał →
                            </Button>
                            {!isSection1Complete() && (
                                <p className="text-xs text-center text-gray-500 mt-2">
                                    Wypełnij wszystkie wymagane pola, aby kontynuować
                                </p>
                            )}
                        </div>
                    </Accordion>

                    <Accordion
                        title="Zgromadzony kapitał w ZUS"
                        isOpen={openAccordion === 1}
                        onToggle={() => setOpenAccordion(openAccordion === 1 ? -1 : 1)}
                        badge="OPCJONALNE"
                        icon="💰"
                    >
                        <p className="text-sm text-gray-600 mb-6">
                            Jeśli znasz stan swojego konta w ZUS, możesz go tutaj wpisać dla dokładniejszej prognozy.
                            Jeśli nie znasz - pozostaw puste, a system oszacuje je automatycznie.
                        </p>

                        <div className="space-y-4">
                            <FormField
                                label="Środki na koncie podstawowym"
                                tooltip="Kapitał zgromadzony na Twoim koncie emerytalnym (19,52% składki). Znajdziesz go na wyciągu z ZUS lub w systemie PUE ZUS."
                            >
                                <div className="relative">
                                    <input
                                        type="number"
                                        min={0}
                                        step={0.01}
                                        value={formData.accountBalance || ''}
                                        onChange={(e) => handleChange('accountBalance', e.target.value ? Number(e.target.value) : undefined)}
                                        placeholder="Pozostaw puste, jeśli nie znasz"
                                        className="w-full px-4 py-2 pr-12 border border-zus-grey-300 rounded focus:outline-none focus:ring-2 focus:ring-zus-green focus:border-zus-green"
                                    />
                                    <span className="absolute right-4 top-1/2 -translate-y-1/2 text-gray-500">zł</span>
                                </div>
                            </FormField>

                            <FormField
                                label="Środki na subkoncie (OFE)"
                                tooltip="Kapitał zgromadzony na subkoncie (dla osób urodzonych po 1968 roku). Znajdziesz go na wyciągu z ZUS."
                            >
                                <div className="relative">
                                    <input
                                        type="number"
                                        min={0}
                                        step={0.01}
                                        value={formData.subAccountBalance || ''}
                                        onChange={(e) => handleChange('subAccountBalance', e.target.value ? Number(e.target.value) : undefined)}
                                        placeholder="Pozostaw puste, jeśli nie znasz"
                                        className="w-full px-4 py-2 pr-12 border border-zus-grey-300 rounded focus:outline-none focus:ring-2 focus:ring-zus-green focus:border-zus-green"
                                    />
                                    <span className="absolute right-4 top-1/2 -translate-y-1/2 text-gray-500">zł</span>
                                </div>
                            </FormField>
                        </div>

                        <div className="mt-6 pt-6 border-t border-zus-grey-300">
                            <div className="mb-4 p-4 bg-blue-50 border-l-4 border-zus-navy rounded">
                                <p className="text-sm text-center text-zus-grey-700">
                                    💡 Te pola są opcjonalne. Możesz je pominąć, jeśli nie znasz wartości.
                                </p>
                            </div>
                            <div className="flex gap-4">
                                <Button
                                    type="button"
                                    onClick={() => setOpenAccordion(0)}
                                    variant="ghost"
                                    size="lg"
                                    className="flex-1"
                                >
                                    ← Wstecz
                                </Button>
                                <Button
                                    type="button"
                                    onClick={() => handleNextSection(2)}
                                    variant="success"
                                    size="lg"
                                    className="flex-1"
                                >
                                    Dalej: Zwolnienia lekarskie →
                                </Button>
                            </div>
                        </div>
                    </Accordion>

                    <Accordion
                        title="Zwolnienia lekarskie (L4)"
                        isOpen={openAccordion === 2}
                        onToggle={() => setOpenAccordion(openAccordion === 2 ? -1 : 2)}
                        icon="🏥"
                    >
                        <Card className="bg-blue-50 border-zus-navy shadow-none">
                            <div className="flex items-center justify-between">
                                <div className="flex-1">
                                    <label className="flex items-center gap-3 cursor-pointer">
                                        <input
                                            type="checkbox"
                                            checked={formData.includeL4 || false}
                                            onChange={(e) => handleChange('includeL4', e.target.checked)}
                                            className="w-5 h-5 accent-zus-green"
                                        />
                                        <span className="font-bold text-zus-grey-900 text-lg">
                                            Uwzględnij prawdopodobieństwo zwolnień lekarskich (L4)
                                        </span>
                                    </label>
                                </div>
                                <Button
                                    type="button"
                                    onClick={() => setShowL4Info(!showL4Info)}
                                    variant="ghost"
                                    size="sm"
                                >
                                    {showL4Info ? 'Ukryj' : 'Pokaż'} szczegóły
                                </Button>
                            </div>

                            {showL4Info && (
                                <div className="mt-4 p-4 bg-white rounded border-l-4 border-zus-green">
                                    <h4 className="font-bold mb-2">Średnia długość L4 w Polsce:</h4>
                                    <ul className="list-disc pl-5 space-y-1 mb-3">
                                        <li>Kobiety: średnio {data.sickImpactF.avgDaysPerYear} dni rocznie</li>
                                        <li>Mężczyźni: średnio {data.sickImpactM.avgDaysPerYear} dni rocznie</li>
                                    </ul>
                                    <p className="text-sm">
                                        <strong>Jak to wpływa na emeryturę?</strong><br />
                                        Podczas zwolnienia lekarskiego składki emerytalne są odprowadzane od zasiłku
                                        (zazwyczaj niższego niż pełne wynagrodzenie), co zmniejsza kapitał emerytalny.
                                        Średnio obniża to świadczenie o {((1 - l4Config.reductionCoefficient) * 100).toFixed(1)}%.
                                    </p>
                                    <p className="mt-2 text-xs text-gray-600">
                                        ℹ️ To informacja edukacyjna oparta na danych statystycznych, nie instrukcja prawna.
                                    </p>
                                </div>
                            )}
                        </Card>

                        <div className="mt-6 pt-6 border-t border-zus-grey-300">
                            <div className="mb-4 p-4 bg-blue-50 border-l-4 border-zus-navy rounded">
                                <p className="text-sm text-center text-zus-grey-700">
                                    💡 Ta sekcja jest opcjonalna. Możesz włączyć lub wyłączyć uwzględnienie L4.
                                </p>
                            </div>
                            <Button
                                type="button"
                                onClick={() => setOpenAccordion(1)}
                                variant="ghost"
                                size="lg"
                                className="w-full mb-4"
                            >
                                ← Wstecz: Zgromadzony kapitał
                            </Button>
                            {isSection1Complete() && (
                                <div className="p-4 bg-zus-green-light border-l-4 border-zus-green rounded">
                                    <p className="text-sm text-center text-zus-green font-semibold">
                                        ✅ Wszystkie wymagane dane wypełnione! Możesz teraz zaprognozować emeryturę.
                                    </p>
                                </div>
                            )}
                        </div>
                    </Accordion>

                    <div className="mt-8">
                        {!isSection1Complete() && (
                            <div className="mb-4 p-4 bg-orange-50 border-l-4 border-zus-warning rounded">
                                <p className="text-sm text-center font-semibold text-zus-grey-900">
                                    ⚠️ Uzupełnij sekcję "Dane podstawowe", aby móc zaprognozować emeryturę
                                </p>
                            </div>
                        )}
                        <div className="flex gap-4">
                            <Button
                                type="button"
                                variant="ghost"
                                size="lg"
                                onClick={() => router.push('/')}
                                className="flex-1"
                            >
                                Anuluj
                            </Button>
                            <Button
                                type="submit"
                                size="lg"
                                loading={isCalculating}
                                disabled={isCalculating || !isSection1Complete()}
                                className="flex-1"
                            >
                                {isCalculating ? 'Obliczanie prognozy...' : 'Zaprognozuj moją przyszłą emeryturę 🔮'}
                            </Button>
                        </div>
                    </div>
                </form>
            </div>
        </main>
    );
}

