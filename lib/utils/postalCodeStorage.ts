/**
 * Postal Code Storage Utility
 *
 * Manages postal code storage in localStorage with two separate keys:
 * 1. "zus-postal-code" - stores the actual postal code value
 * 2. "zus-postal-code-asked" - tracks whether we've asked the user about postal code
 *
 * This separation ensures the modal only appears once per user session,
 * even if they skip providing the postal code.
 */

const POSTAL_CODE_KEY = "zus-postal-code";
const POSTAL_CODE_ASKED_KEY = "zus-postal-code-asked";

export interface PostalCodeData {
  postalCode: string | null;
  askedAboutPostalCode: boolean;
}

export function getPostalCode(): string | null {
  if (typeof window === "undefined") return null;

  try {
    return localStorage.getItem(POSTAL_CODE_KEY);
  } catch (error) {
    console.error("Failed to get postal code:", error);
    return null;
  }
}

export function setPostalCode(postalCode: string): void {
  if (typeof window === "undefined") return;

  try {
    if (postalCode && postalCode.trim()) {
      localStorage.setItem(POSTAL_CODE_KEY, postalCode.trim());
    } else {
      localStorage.removeItem(POSTAL_CODE_KEY);
    }
  } catch (error) {
    console.error("Failed to set postal code:", error);
  }
}

export function hasBeenAskedAboutPostalCode(): boolean {
  if (typeof window === "undefined") return false;

  try {
    const asked = localStorage.getItem(POSTAL_CODE_ASKED_KEY);
    return asked === "true";
  } catch (error) {
    console.error("Failed to check postal code asked status:", error);
    return false;
  }
}

export function markAskedAboutPostalCode(): void {
  if (typeof window === "undefined") return;

  try {
    localStorage.setItem(POSTAL_CODE_ASKED_KEY, "true");
  } catch (error) {
    console.error("Failed to mark postal code asked:", error);
  }
}

export function clearPostalCodeData(): void {
  if (typeof window === "undefined") return;

  try {
    localStorage.removeItem(POSTAL_CODE_KEY);
    localStorage.removeItem(POSTAL_CODE_ASKED_KEY);
  } catch (error) {
    console.error("Failed to clear postal code data:", error);
  }
}

export function getPostalCodeData(): PostalCodeData {
  return {
    postalCode: getPostalCode(),
    askedAboutPostalCode: hasBeenAskedAboutPostalCode(),
  };
}

export function shouldShowPostalCodeModal(): boolean {
  const hasPostalCode = getPostalCode() !== null;
  const hasBeenAsked = hasBeenAskedAboutPostalCode();

  return !hasPostalCode && !hasBeenAsked;
}
