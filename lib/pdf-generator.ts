/**
 * PDF Generator - Generate pension report PDF
 */

import jsPDF from 'jspdf';
import type { UserInput, PensionResult } from '@/types';
import { formatCurrency, formatPercent, formatDate, getGenderLabel } from './utils';

export async function generatePDF(
  userInput: UserInput,
  results: PensionResult
): Promise<void> {
  const doc = new jsPDF();
  const pageWidth = doc.internal.pageSize.getWidth();
  const pageHeight = doc.internal.pageSize.getHeight();
  let yPos = 20;

  // Helper to add text with auto-wrap
  const addText = (text: string, x: number, fontSize: number = 10, isBold: boolean = false) => {
    doc.setFontSize(fontSize);
    if (isBold) {
      doc.setFont('helvetica', 'bold');
    } else {
      doc.setFont('helvetica', 'normal');
    }

    const lines = doc.splitTextToSize(text, pageWidth - 40);
    doc.text(lines, x, yPos);
    yPos += lines.length * (fontSize * 0.5) + 2;

    // Check if we need a new page
    if (yPos > pageHeight - 20) {
      doc.addPage();
      yPos = 20;
    }
  };

  // Header
  doc.setFillColor(0, 65, 110); // Navy
  doc.rect(0, 0, pageWidth, 30, 'F');
  doc.setTextColor(255, 255, 255);
  doc.setFontSize(20);
  doc.setFont('helvetica', 'bold');
  doc.text('Raport Symulacji Emerytalnej', pageWidth / 2, 20, { align: 'center' });

  yPos = 45;
  doc.setTextColor(0, 0, 0);

  // 1. Parametry wejściowe
  addText('1. PARAMETRY WEJŚCIOWE', 20, 14, true);
  yPos += 5;
  addText(`Wiek: ${userInput.age} lat`, 25);
  addText(`Płeć: ${getGenderLabel(userInput.gender)}`, 25);
  addText(`Wynagrodzenie brutto miesięczne: ${formatCurrency(userInput.monthlySalary)}`, 25);
  addText(`Rok rozpoczęcia pracy: ${userInput.startYear} (styczeń)`, 25);
  addText(`Planowany rok zakończenia: ${userInput.endYear} (styczeń)`, 25);
  addText(`Uwzględnienie L4: ${userInput.includeL4 ? 'Tak' : 'Nie'}`, 25);

  if (userInput.accountBalance) {
    addText(`Konto ZUS: ${formatCurrency(userInput.accountBalance)}`, 25);
  }
  if (userInput.subaccountBalance) {
    addText(`Subkonto ZUS: ${formatCurrency(userInput.subaccountBalance)}`, 25);
  }

  yPos += 5;

  // 2. Założenia modelu
  addText('2. ZAŁOŻENIA MODELU', 20, 14, true);
  yPos += 5;
  addText('Obliczenia bazują na danych ZUS, GUS i NBP:', 25);
  addText('- Średni wzrost płac: dane historyczne i prognozowane GUS/NBP', 25);
  addText('- Wskaźniki CPI: dane inflacyjne GUS', 25);
  addText('- Średnie emerytury: prognoza ZUS do 2080 r.', 25);
  addText('- Dzielniki emerytalne: tabele ZUS według wieku i płci', 25);
  addText('- Składka emerytalna: 19.52% wynagrodzenia', 25);
  addText(`Wersja założeń: v1.0 (Styczeń 2025)`, 25);

  yPos += 5;

  // 3. Wyniki główne
  addText('3. WYNIKI GŁÓWNE', 20, 14, true);
  yPos += 5;
  addText(`Emerytura nominalna (w roku ${results.retirementYear}): ${formatCurrency(results.nominal)}`, 25, 12, true);
  addText(`Emerytura urealniona (w dzisiejszych zł): ${formatCurrency(results.real)}`, 25, 12, true);
  addText(`Stopa zastąpienia: ${formatPercent(results.replacementRate)}`, 25);
  addText(`Relacja do średniej emerytury: ${results.vsAverage.diff > 0 ? '+' : ''}${formatCurrency(results.vsAverage.diff)} (${formatPercent(results.vsAverage.percentage)})`, 25);

  if (userInput.expectedPension) {
    const gap = results.gapToExpected;
    if (gap > 0) {
      addText(`Różnica do oczekiwanej: -${formatCurrency(gap)}`, 25);
      if (results.yearsToTarget) {
        addText(`Trzeba pracować o ~${results.yearsToTarget} lat dłużej`, 25);
      }
    } else {
      addText(`Osiągnięto oczekiwaną emeryturę (${formatCurrency(userInput.expectedPension)})`, 25);
    }
  }

  yPos += 5;

  // 4. Warianty odroczenia
  addText('4. WARIANTY ODROCZENIA EMERYTURY', 20, 14, true);
  yPos += 5;
  addText(`+1 rok: ${formatCurrency(results.postponement['+1'].nominal)} (wzrost: ${formatPercent(results.postponement['+1'].increase || 0)})`, 25);
  addText(`+2 lata: ${formatCurrency(results.postponement['+2'].nominal)} (wzrost: ${formatPercent(results.postponement['+2'].increase || 0)})`, 25);
  addText(`+5 lat: ${formatCurrency(results.postponement['+5'].nominal)} (wzrost: ${formatPercent(results.postponement['+5'].increase || 0)})`, 25);

  yPos += 5;

  // 5. Wpływ L4
  if (userInput.includeL4) {
    addText('5. WPŁYW ZWOLNIEŃ LEKARSKICH (L4)', 20, 14, true);
    yPos += 5;
    addText(`Bez L4: ${formatCurrency(results.l4Impact.withoutL4)}`, 25);
    addText(`Z L4: ${formatCurrency(results.l4Impact.withL4)}`, 25);
    addText(`Różnica: ${formatCurrency(results.l4Impact.diff)} (${formatPercent(results.l4Impact.diffPercentage)})`, 25);
    yPos += 5;
  }

  // Footer
  doc.setFontSize(8);
  doc.setTextColor(128, 128, 128);
  const footerText = `Wygenerowano: ${formatDate()} | Symulator Emerytalny ZUS | Charakter edukacyjny`;
  doc.text(footerText, pageWidth / 2, pageHeight - 10, { align: 'center' });

  // Save PDF
  const filename = `raport_emerytalny_${new Date().toISOString().split('T')[0]}.pdf`;
  doc.save(filename);
}
