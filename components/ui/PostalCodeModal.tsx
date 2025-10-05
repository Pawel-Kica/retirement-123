import React, { useState } from "react";
import { LuMapPin, LuX } from "react-icons/lu";
import { Button } from "./Button";
import {
  setPostalCode,
  markAskedAboutPostalCode,
} from "@/lib/utils/postalCodeStorage";

interface PostalCodeModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSave: (postalCode: string) => void;
}

export function PostalCodeModal({
  isOpen,
  onClose,
  onSave,
}: PostalCodeModalProps) {
  const [postalCode, setPostalCodeState] = useState("");
  const [error, setError] = useState("");

  if (!isOpen) return null;

  const validatePostalCode = (code: string): boolean => {
    const postalCodeRegex = /^\d{2}-\d{3}$/;
    return postalCodeRegex.test(code);
  };

  const handlePostalCodeChange = (value: string) => {
    const cleaned = value.replace(/[^0-9-]/g, "");

    if (cleaned.length <= 6) {
      setPostalCodeState(cleaned);
      setError("");
    }
  };

  const handleSave = () => {
    if (postalCode && !validatePostalCode(postalCode)) {
      setError("Kod pocztowy musi być w formacie XX-XXX (np. 31-422)");
      return;
    }

    // Save to local storage
    if (postalCode && postalCode.trim()) {
      setPostalCode(postalCode.trim());
    }

    // Mark that we've asked about postal code
    markAskedAboutPostalCode();

    // Call the callback with the postal code
    onSave(postalCode);

    // Reset state
    setPostalCodeState("");
    setError("");
  };

  const handleSkip = () => {
    // Mark that we've asked about postal code (even if skipped)
    markAskedAboutPostalCode();

    onClose();
    setPostalCodeState("");
    setError("");
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 backdrop-blur-sm animate-in fade-in duration-200">
      <div
        role="dialog"
        aria-modal="true"
        aria-labelledby="postal-code-title"
        className="bg-white rounded-lg shadow-xl max-w-md w-full mx-4 animate-in zoom-in-95 duration-200"
      >
        <div className="flex items-center justify-between p-6 border-b border-zus-grey-300">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 bg-zus-green-light rounded-full flex items-center justify-center">
              <LuMapPin aria-hidden="true" className="w-5 h-5 text-zus-green" />
            </div>
            <div>
              <h2 id="postal-code-title" className="text-xl font-bold text-zus-grey-900">
                Kod pocztowy
              </h2>
              <p className="text-sm text-zus-grey-600">Opcjonalne</p>
            </div>
          </div>
          <button
            onClick={handleSkip}
            aria-label="Zamknij i pomiń"
            className="text-zus-grey-500 hover:text-zus-grey-900 transition-colors"
          >
            <LuX aria-hidden="true" className="w-6 h-6" />
          </button>
        </div>

        <div className="p-6">
          <p className="text-zus-grey-700 mb-4">
            Zanim obliczymy Twoją emeryturę, możesz opcjonalnie podać kod pocztowy.
            Pomoże nam to lepiej dopasować informacje do Twojego regionu.
          </p>

          <div className="mb-4">
            <label
              htmlFor="postalCode"
              className="block text-sm font-semibold text-zus-grey-900 mb-2"
            >
              Kod pocztowy
            </label>
            <input
              id="postalCode"
              type="text"
              value={postalCode}
              onChange={(e) => handlePostalCodeChange(e.target.value)}
              placeholder="np. 31-422"
              maxLength={6}
              aria-invalid={error ? 'true' : 'false'}
              aria-describedby={error ? "postalCode-error" : "postalCode-hint"}
              className={`w-full px-4 py-3 text-lg font-semibold border-2 rounded-lg focus:outline-none focus:ring-2 transition-all ${
                error
                  ? "border-zus-error focus:border-zus-error focus:ring-zus-error/20"
                  : "border-zus-grey-300 focus:border-zus-green focus:ring-zus-green/20"
              }`}
            />
            {error && (
              <p id="postalCode-error" className="mt-2 text-sm text-zus-error flex items-center gap-1" role="alert">
                <span aria-hidden="true">⚠</span> {error}
              </p>
            )}
            <p id="postalCode-hint" className="mt-2 text-xs text-zus-grey-600">
              Format: XX-XXX (np. 00-001, 31-422, 99-999)
            </p>
          </div>

          <div className="bg-blue-50 border-l-4 border-zus-blue rounded p-3 mb-6">
            <p className="text-sm text-zus-grey-700">
              <strong>Dlaczego pytamy?</strong> Kod pocztowy jest opcjonalny i
              nie wpływa na obliczenia emerytalne. Może być użyty do
              personalizacji doświadczenia w przyszłości.
            </p>
          </div>
        </div>

        <div className="flex gap-3 p-6 border-t border-zus-grey-300 bg-gray-50">
          <Button
            type="button"
            variant="ghost"
            size="lg"
            onClick={handleSkip}
            className="flex-1"
          >
            Pomiń i oblicz
          </Button>
          <Button
            type="button"
            variant="success"
            size="lg"
            onClick={handleSave}
            className="flex-1"
          >
            {postalCode ? "Zapisz i oblicz" : "Oblicz bez kodu"}
          </Button>
        </div>
      </div>
    </div>
  );
}
