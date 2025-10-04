/**
 * ZUS Retirement Simulator - Utility Functions
 * Number formatting, date helpers, and other utilities
 */

/**
 * Format number with Polish locale
 * Thousands separator: space, decimal: comma
 * Example: 3500.50 → "3 500,50"
 */
export function formatNumber(value: number, decimals: number = 0): string {
  return new Intl.NumberFormat('pl-PL', {
    minimumFractionDigits: decimals,
    maximumFractionDigits: decimals,
  }).format(value);
}

/**
 * Format currency (PLN)
 * Example: 3500 → "3 500 zł"
 */
export function formatCurrency(value: number, decimals: number = 0): string {
  return `${formatNumber(value, decimals)} zł`;
}

/**
 * Format percentage
 * Example: 0.65 → "65%"
 */
export function formatPercent(value: number, decimals: number = 1): string {
  return `${formatNumber(value, decimals)}%`;
}

/**
 * Parse Polish formatted number to float
 * Example: "3 500,50" → 3500.50
 */
export function parsePolishNumber(value: string): number {
  // Remove spaces and replace comma with dot
  const cleaned = value.replace(/\s/g, '').replace(',', '.');
  return parseFloat(cleaned) || 0;
}

/**
 * Format date in Polish
 * Example: new Date() → "4 października 2025, 13:45"
 */
export function formatDate(date: Date = new Date()): string {
  return new Intl.DateTimeFormat('pl-PL', {
    year: 'numeric',
    month: 'long',
    day: 'numeric',
    hour: '2-digit',
    minute: '2-digit',
  }).format(date);
}

/**
 * Get current timestamp in ISO format
 */
export function getTimestamp(): string {
  return new Date().toISOString();
}

/**
 * Calculate current age based on birth year
 */
export function calculateAge(birthYear: number, currentYear: number = 2025): number {
  return currentYear - birthYear;
}

/**
 * Validate Polish postal code (XX-XXX format)
 */
export function isValidPostalCode(code: string): boolean {
  const postalCodeRegex = /^\d{2}-\d{3}$/;
  return postalCodeRegex.test(code);
}

/**
 * Clamp value between min and max
 */
export function clamp(value: number, min: number, max: number): number {
  return Math.min(Math.max(value, min), max);
}

/**
 * Get gender label in Polish
 */
export function getGenderLabel(gender: 'male' | 'female'): string {
  return gender === 'male' ? 'Mężczyzna' : 'Kobieta';
}

/**
 * Get gender short label
 */
export function getGenderShort(gender: 'male' | 'female'): string {
  return gender === 'male' ? 'M' : 'K';
}

/**
 * Interpolate between two values
 */
export function interpolate(value1: number, value2: number, ratio: number): number {
  return value1 + (value2 - value1) * ratio;
}
