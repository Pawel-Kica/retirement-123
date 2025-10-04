/**
 * Utility functions for Polish number, date, and currency formatting
 */

/**
 * Format number as Polish currency (PLN)
 * @param amount - Amount to format
 * @param withCurrency - Whether to include 'zł' suffix
 * @returns Formatted string (e.g., "5 000,00 zł")
 */
export function formatPLN(amount: number, withCurrency: boolean = true): string {
    const formatted = new Intl.NumberFormat('pl-PL', {
        minimumFractionDigits: 2,
        maximumFractionDigits: 2,
    }).format(amount);

    return withCurrency ? `${formatted} zł` : formatted;
}

/**
 * Format number as Polish percentage
 * @param value - Value to format (e.g., 0.42 for 42%)
 * @param decimals - Number of decimal places
 * @returns Formatted string (e.g., "42%")
 */
export function formatPercent(value: number, decimals: number = 1): string {
    return `${(value * 100).toFixed(decimals)}%`;
}

/**
 * Format date in Polish format
 * @param date - Date to format
 * @returns Formatted string (e.g., "4 października 2025")
 */
export function formatDate(date: Date): string {
    return new Intl.DateTimeFormat('pl-PL', {
        year: 'numeric',
        month: 'long',
        day: 'numeric',
    }).format(date);
}

/**
 * Format date and time in Polish format
 * @param date - Date to format
 * @returns Formatted string (e.g., "4 października 2025, 14:30")
 */
export function formatDateTime(date: Date): string {
    return new Intl.DateTimeFormat('pl-PL', {
        year: 'numeric',
        month: 'long',
        day: 'numeric',
        hour: '2-digit',
        minute: '2-digit',
    }).format(date);
}

/**
 * Format date in short format
 * @param date - Date to format
 * @returns Formatted string (e.g., "04.10.2025")
 */
export function formatDateShort(date: Date): string {
    return new Intl.DateTimeFormat('pl-PL', {
        year: 'numeric',
        month: '2-digit',
        day: '2-digit',
    }).format(date);
}

/**
 * Format time in Polish format
 * @param date - Date to format
 * @returns Formatted string (e.g., "14:30")
 */
export function formatTime(date: Date): string {
    return new Intl.DateTimeFormat('pl-PL', {
        hour: '2-digit',
        minute: '2-digit',
    }).format(date);
}

/**
 * Format years with proper Polish grammatical form
 * @param n - Number of years
 * @returns Formatted string (e.g., "1 rok", "2 lata", "5 lat")
 */
export function formatYears(n: number): string {
    if (n === 1) return '1 rok';
    if (n >= 2 && n <= 4) return `${n} lata`;
    return `${n} lat`;
}

/**
 * Format days with proper Polish grammatical form
 * @param n - Number of days
 * @returns Formatted string (e.g., "1 dzień", "5 dni")
 */
export function formatDays(n: number): string {
    if (n === 1) return '1 dzień';
    return `${n} dni`;
}

/**
 * Format months with proper Polish grammatical form
 * @param n - Number of months
 * @returns Formatted string (e.g., "1 miesiąc", "2 miesiące", "5 miesięcy")
 */
export function formatMonths(n: number): string {
    if (n === 1) return '1 miesiąc';
    if (n >= 2 && n <= 4) return `${n} miesiące`;
    return `${n} miesięcy`;
}

/**
 * Parse Polish formatted number string to number
 * @param str - String to parse (e.g., "5 000,00")
 * @returns Parsed number
 */
export function parsePLNumber(str: string): number {
    // Remove spaces and replace comma with dot
    const cleaned = str.replace(/\s/g, '').replace(',', '.');
    return parseFloat(cleaned);
}

/**
 * Format large number with thousands separator
 * @param n - Number to format
 * @returns Formatted string (e.g., "1 000 000")
 */
export function formatNumber(n: number): string {
    return new Intl.NumberFormat('pl-PL').format(n);
}

