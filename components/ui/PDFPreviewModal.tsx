import React from "react";
import { SimulationInputs, SimulationResults } from "@/lib/types";
import { formatPLN, formatPercent } from "@/lib/utils/formatting";
import { Button } from "@/components/ui/Button";
import { X, FileText, Download } from "lucide-react";

interface PDFPreviewModalProps {
  isOpen: boolean;
  onClose: () => void;
  onConfirm: () => void;
  inputs: SimulationInputs;
  results: SimulationResults;
  expectedPension: number;
}

export function PDFPreviewModal({
  isOpen,
  onClose,
  onConfirm,
  inputs,
  results,
  expectedPension,
}: PDFPreviewModalProps) {
  if (!isOpen) return null;

  const currentYear = new Date().getFullYear();
  const currentDate = new Date();
  const yearsToRetirement = inputs.workEndYear - currentYear;
  const retirementAge = inputs.age + yearsToRetirement;
  const yearsWorked = inputs.workEndYear - inputs.workStartYear;

  const formatDate = (date: Date) => {
    return date.toLocaleDateString("pl-PL", {
      day: "2-digit",
      month: "2-digit",
      year: "numeric",
    });
  };

  const formatTime = (date: Date) => {
    return date.toLocaleTimeString("pl-PL", {
      hour: "2-digit",
      minute: "2-digit",
    });
  };

  const getContractTypeLabel = (contractType?: string) => {
    switch (contractType) {
      case "UOP":
        return "💼 Umowa o Pracę (UOP)";
      case "UOZ":
        return "📝 Umowa Zlecenie (UOZ)";
      case "B2B":
        return "🏢 Działalność / B2B";
      default:
        return "💼 Umowa o Pracę (UOP)";
    }
  };

  return (
    <div className="fixed inset-0 bg-black/70 z-50 flex items-center justify-center p-4 backdrop-blur-sm">
      <div
        role="dialog"
        aria-modal="true"
        aria-labelledby="pdf-preview-title"
        className="bg-white rounded-lg shadow-2xl max-w-4xl w-full max-h-[90vh] overflow-hidden flex flex-col animate-in fade-in zoom-in duration-200"
      >
        {/* Header */}
        <div className="bg-zus-green p-6 flex items-center justify-between">
          <div className="flex items-center gap-3">
            <FileText aria-hidden="true" className="w-8 h-8 text-white" />
            <div>
              <h2 id="pdf-preview-title" className="text-2xl font-bold text-white">
                Podgląd Raportu PDF
              </h2>
              <p className="text-sm text-white/90">
                Sprawdź dane przed pobraniem raportu
              </p>
            </div>
          </div>
          <button
            onClick={onClose}
            aria-label="Zamknij podgląd"
            className="text-white hover:bg-white/20 rounded-full p-2 transition-colors"
          >
            <X aria-hidden="true" className="w-6 h-6" />
          </button>
        </div>

        {/* Content - Scrollable */}
        <div className="overflow-y-auto flex-1 p-6 space-y-6">
          {/* Report Info */}
          <div className="bg-zus-grey-100 rounded-lg p-4 border border-zus-grey-300">
            <h3 className="text-lg font-bold text-zus-grey-900 mb-3">
              Informacje o raporcie
            </h3>
            <div className="grid grid-cols-2 gap-3">
              <div>
                <div className="text-xs font-semibold text-zus-grey-600 uppercase tracking-wide mb-1">
                  Data użycia
                </div>
                <div className="text-sm font-bold text-zus-grey-900">
                  {formatDate(currentDate)}
                </div>
              </div>
              <div>
                <div className="text-xs font-semibold text-zus-grey-600 uppercase tracking-wide mb-1">
                  Godzina użycia
                </div>
                <div className="text-sm font-bold text-zus-grey-900">
                  {formatTime(currentDate)}
                </div>
              </div>
            </div>
          </div>

          {/* Basic Info */}
          <div className="bg-zus-green-light border border-zus-green rounded-lg p-4">
            <h3 className="text-lg font-bold text-zus-grey-900 mb-3">
              Dane podstawowe
            </h3>
            <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
              <div className="bg-white rounded p-3">
                <div className="text-xs font-semibold text-zus-grey-600 uppercase tracking-wide mb-1">
                  Wiek
                </div>
                <div className="text-sm font-bold text-zus-grey-900">
                  {inputs.age} lat
                </div>
              </div>
              <div className="bg-white rounded p-3">
                <div className="text-xs font-semibold text-zus-grey-600 uppercase tracking-wide mb-1">
                  Płeć
                </div>
                <div className="text-sm font-bold text-zus-grey-900">
                  {inputs.sex === "M" ? "Mężczyzna" : "Kobieta"}
                </div>
              </div>
              <div className="bg-white rounded p-3">
                <div className="text-xs font-semibold text-zus-grey-600 uppercase tracking-wide mb-1">
                  Wynagrodzenie brutto
                </div>
                <div className="text-sm font-bold text-zus-grey-900">
                  {formatPLN(inputs.monthlyGross)}
                </div>
              </div>
            </div>
          </div>

          {/* Work History */}
          <div className="bg-blue-50 border border-zus-navy rounded-lg p-4">
            <h3 className="text-lg font-bold text-zus-grey-900 mb-3">
              Historia pracy
            </h3>
            <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
              <div className="bg-white rounded p-3">
                <div className="text-xs font-semibold text-zus-grey-600 uppercase tracking-wide mb-1">
                  Rok rozpoczęcia pracy
                </div>
                <div className="text-sm font-bold text-zus-grey-900">
                  {inputs.workStartYear}
                </div>
              </div>
              <div className="bg-white rounded p-3">
                <div className="text-xs font-semibold text-zus-grey-600 uppercase tracking-wide mb-1">
                  Planowana emerytura
                </div>
                <div className="text-sm font-bold text-zus-grey-900">
                  {inputs.workEndYear}
                </div>
              </div>
              <div className="bg-white rounded p-3">
                <div className="text-xs font-semibold text-zus-grey-600 uppercase tracking-wide mb-1">
                  Łączny staż pracy
                </div>
                <div className="text-sm font-bold text-zus-grey-900">
                  {yearsWorked} lat
                </div>
              </div>
              <div className="bg-white rounded p-3">
                <div className="text-xs font-semibold text-zus-grey-600 uppercase tracking-wide mb-1">
                  Wiek emerytalny
                </div>
                <div className="text-sm font-bold text-zus-grey-900">
                  {retirementAge} lat
                </div>
              </div>
              <div className="bg-white rounded p-3">
                <div className="text-xs font-semibold text-zus-grey-600 uppercase tracking-wide mb-1">
                  Typ umowy
                </div>
                <div className="text-sm font-bold text-zus-grey-900">
                  {getContractTypeLabel(inputs.contractType)}
                </div>
              </div>
              <div className="bg-white rounded p-3">
                <div className="text-xs font-semibold text-zus-grey-600 uppercase tracking-wide mb-1">
                  PPK
                </div>
                <div className="text-sm font-bold text-zus-grey-900">
                  {inputs.retirementPrograms?.ppk.enabled
                    ? "✓ Uczestniczę"
                    : "✗ Nie uczestniczę"}
                </div>
              </div>
              <div className="bg-white rounded p-3">
                <div className="text-xs font-semibold text-zus-grey-600 uppercase tracking-wide mb-1">
                  IKZE
                </div>
                <div className="text-sm font-bold text-zus-grey-900">
                  {inputs.retirementPrograms?.ikze.enabled
                    ? "✓ Posiadam"
                    : "✗ Nie posiadam"}
                </div>
              </div>
            </div>
          </div>

          {/* Historia zatrudnienia */}
          {inputs.employmentPeriods && inputs.employmentPeriods.length > 0 && (
            <div className="bg-purple-50 border border-purple-300 rounded-lg p-4">
              <h3 className="text-lg font-bold text-zus-grey-900 mb-3">
                Historia zatrudnienia
              </h3>
              <div className="space-y-4">
                {inputs.employmentPeriods.map((period, index) => (
                  <div
                    key={period.id}
                    className="bg-white rounded p-3 border border-purple-200"
                  >
                    <div className="font-bold text-zus-grey-900 mb-2">
                      Okres {index + 1}:
                    </div>
                    <div className="space-y-1 text-sm text-zus-grey-800 ml-4">
                      <div>
                        Lata: {period.startYear} - {period.endYear}
                      </div>
                      <div>Wynagrodzenie: {formatPLN(period.monthlyGross)}</div>
                      <div>Typ umowy: {getContractTypeLabel(period.contractType)}</div>
                      {period.annualRaisePercentage && (
                        <div>Podwyżka roczna: {period.annualRaisePercentage}%</div>
                      )}
                      {period.description && (
                        <div>Opis: {period.description}</div>
                      )}
                    </div>
                  </div>
                ))}
              </div>
            </div>
          )}

          {/* Additional Info */}
          <div className="bg-gray-50 border border-zus-grey-300 rounded-lg p-4">
            <h3 className="text-lg font-bold text-zus-grey-900 mb-3">
              Dodatkowe informacje
            </h3>
            <div className="grid grid-cols-1 md:grid-cols-3 gap-3">
              <div className="bg-white rounded p-3">
                <div className="text-xs font-semibold text-zus-grey-600 uppercase tracking-wide mb-1">
                  Konto podstawowe
                </div>
                <div className="text-sm font-bold text-zus-grey-900">
                  {inputs.accountBalance
                    ? formatPLN(inputs.accountBalance)
                    : "Automatyczne oszacowanie"}
                </div>
              </div>
              <div className="bg-white rounded p-3">
                <div className="text-xs font-semibold text-zus-grey-600 uppercase tracking-wide mb-1">
                  Subkonto (OFE)
                </div>
                <div className="text-sm font-bold text-zus-grey-900">
                  {inputs.subAccountBalance
                    ? formatPLN(inputs.subAccountBalance)
                    : "Automatyczne oszacowanie"}
                </div>
              </div>
              <div className="bg-white rounded p-3">
                <div className="text-xs font-semibold text-zus-grey-600 uppercase tracking-wide mb-1">
                  Zwolnienia lekarskie
                </div>
                <div className="text-sm font-bold text-zus-grey-900">
                  {inputs.includeZwolnienieZdrowotne
                    ? "✓ Uwzględnione"
                    : "✗ Pominięte"}
                </div>
              </div>
            </div>
          </div>

          {/* Results Summary */}
          <div className="bg-gradient-to-r from-zus-green/10 to-zus-blue/10 border-2 border-zus-green rounded-lg p-4">
            <h3 className="text-lg font-bold text-zus-grey-900 mb-3">
              Wyniki prognozy
            </h3>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div className="bg-white rounded p-4">
                <div className="text-xs font-semibold text-zus-grey-600 uppercase tracking-wide mb-1">
                  Emerytura oczekiwana
                </div>
                <div className="text-2xl font-bold text-zus-grey-900">
                  {formatPLN(expectedPension)}
                </div>
              </div>
              <div className="bg-white rounded p-4">
                <div className="text-xs font-semibold text-zus-grey-600 uppercase tracking-wide mb-1">
                  Emerytura prognozowana (w dzisiejszych złotych)
                </div>
                <div className="text-2xl font-bold text-zus-green">
                  {formatPLN(results.realPension)}
                </div>
              </div>
              <div className="bg-white rounded p-4">
                <div className="text-xs font-semibold text-zus-grey-600 uppercase tracking-wide mb-1">
                  Emerytura nominalna (w {inputs.workEndYear} r.)
                </div>
                <div className="text-xl font-bold text-zus-grey-900">
                  {formatPLN(results.nominalPension)}
                </div>
              </div>
              <div className="bg-white rounded p-4">
                <div className="text-xs font-semibold text-zus-grey-600 uppercase tracking-wide mb-1">
                  Stopa zastąpienia
                </div>
                <div className="text-xl font-bold text-zus-blue">
                  {formatPercent(results.replacementRate / 100)}
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* Footer Actions */}
        <div className="border-t border-zus-grey-300 p-6 bg-gray-50 flex flex-col sm:flex-row gap-3">
          <Button
            onClick={onClose}
            variant="secondary"
            size="lg"
            className="flex-1"
          >
            Anuluj
          </Button>
          <Button
            onClick={onConfirm}
            variant="success"
            size="lg"
            className="flex-1 flex items-center justify-center gap-2"
          >
            <Download aria-hidden="true" className="w-5 h-5" />
            Pobierz raport PDF
          </Button>
        </div>
      </div>
    </div>
  );
}
