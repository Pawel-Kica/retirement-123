/**
 * CSV loader for prognosis data
 */

import { PrognosisVariant, PrognosisVariantType, PrognosisData } from '../types';

/**
 * Parse CSV data from prognosis files
 */
function parsePrognosisCSV(csvContent: string): PrognosisData[] {
    const lines = csvContent.trim().split('\n');
    const headers = lines[0].split(';');
    
    return lines.slice(1).map(line => {
        if (!line.trim()) return null;
        
        const values = line.split(';');
        return {
            year: parseInt(values[0]),
            unemployment: parseFloat(values[1].replace(',', '.')),
            inflation: parseFloat(values[2].replace(',', '.')),
            pensioners_inflation: parseFloat(values[3].replace(',', '.')),
            wage_growth: parseFloat(values[4].replace(',', '.')),
            gdp_growth: parseFloat(values[5].replace(',', '.')),
            contribution_collection: parseFloat(values[6].replace(',', '.')),
        };
    }).filter((item): item is PrognosisData => item !== null);
}

/**
 * Load prognosis data from CSV files
 */
export async function loadPrognosisData(): Promise<Record<PrognosisVariantType, PrognosisVariant>> {
    const [prognoza1, prognoza2, prognoza3] = await Promise.all([
        fetch('/data/prognoza1.csv').then(res => res.text()),
        fetch('/data/prognoza2.csv').then(res => res.text()),
        fetch('/data/prognoza3.csv').then(res => res.text()),
    ]);

    return {
        1: {
            _metadata: {
                name: 'Pośredni',
                description: 'Wariant pośredni - umiarkowane założenia ekonomiczne',
                variant: 1,
            },
            data: parsePrognosisCSV(prognoza1),
        },
        2: {
            _metadata: {
                name: 'Pesymistyczny',
                description: 'Wariant pesymistyczny - konserwatywne założenia ekonomiczne',
                variant: 2,
            },
            data: parsePrognosisCSV(prognoza2),
        },
        3: {
            _metadata: {
                name: 'Optymistyczny',
                description: 'Wariant optymistyczny - pozytywne założenia ekonomiczne',
                variant: 3,
            },
            data: parsePrognosisCSV(prognoza3),
        },
    };
}

/**
 * Get prognosis data for a specific year and variant
 */
export function getPrognosisForYear(
    variants: Record<PrognosisVariantType, PrognosisVariant>,
    variant: PrognosisVariantType,
    year: number
): PrognosisData | null {
    const variantData = variants[variant];
    if (!variantData) return null;

    return variantData.data.find(item => item.year === year) || null;
}

/**
 * Get wage growth rate for a specific year and variant
 */
export function getWageGrowthRate(
    variants: Record<PrognosisVariantType, PrognosisVariant>,
    variant: PrognosisVariantType,
    year: number
): number | null {
    const prognosis = getPrognosisForYear(variants, variant, year);
    if (!prognosis) return null;

    // Convert percentage to multiplier (e.g., 103.4% -> 1.034)
    return prognosis.wage_growth / 100;
}

/**
 * Get inflation rate for a specific year and variant
 */
export function getInflationRate(
    variants: Record<PrognosisVariantType, PrognosisVariant>,
    variant: PrognosisVariantType,
    year: number
): number | null {
    const prognosis = getPrognosisForYear(variants, variant, year);
    if (!prognosis) return null;

    // Convert percentage to multiplier (e.g., 102.5% -> 1.025)
    return prognosis.inflation / 100;
}

