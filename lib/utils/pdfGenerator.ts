"use client";

import jsPDF from "jspdf";
import { formatPLN, formatPercent } from "./formatting";
import { SimulationInputs, SimulationResults } from "../types";

interface PDFReportData {
  inputs: SimulationInputs;
  results: SimulationResults;
  expectedPension: number;
  timestamp: Date;
}

const formatDate = (date: Date) => {
  return new Date(date).toLocaleDateString("pl-PL", {
    day: "2-digit",
    month: "2-digit",
    year: "numeric",
  });
};

const formatTime = (date: Date) => {
  return new Date(date).toLocaleTimeString("pl-PL", {
    hour: "2-digit",
    minute: "2-digit",
  });
};

const getContractTypeLabel = (contractType?: string) => {
  switch (contractType) {
    case "UOP":
      return "Umowa o Prace (UOP)";
    case "UOZ":
      return "Umowa Zlecenie (UOZ)";
    case "B2B":
      return "Dzialalnosc / B2B";
    default:
      return "Umowa o Prace (UOP)";
  }
};

export const generatePDFReport = async (data: PDFReportData): Promise<void> => {
  const { inputs, results, expectedPension, timestamp } = data;

  const doc = new jsPDF();
  let yPos = 20;
  const currentYear = new Date().getFullYear();
  const yearsToRetirement = inputs.workEndYear - currentYear;
  const retirementAge = inputs.age + yearsToRetirement;
  const yearsWorked = inputs.workEndYear - inputs.workStartYear;

  doc.setFontSize(20);
  doc.setFont("helvetica", "bold");
  doc.text("RAPORT PROGNOZY EMERYTALNEJ", 105, yPos, { align: "center" });
  yPos += 10;

  doc.setFontSize(10);
  doc.setFont("helvetica", "normal");
  doc.text("Symulator Emerytalny ZUS", 105, yPos, { align: "center" });
  yPos += 15;

  doc.setLineWidth(0.5);
  doc.line(10, yPos, 200, yPos);
  yPos += 10;

  doc.setFontSize(12);
  doc.setFont("helvetica", "bold");
  doc.text("INFORMACJE O RAPORCIE", 10, yPos);
  yPos += 8;

  doc.setFontSize(10);
  doc.setFont("helvetica", "normal");
  doc.text(`Data uzycia: ${formatDate(timestamp)}`, 10, yPos);
  yPos += 6;
  doc.text(`Godzina uzycia: ${formatTime(timestamp)}`, 10, yPos);
  yPos += 12;

  doc.setFontSize(12);
  doc.setFont("helvetica", "bold");
  doc.text("DANE PODSTAWOWE", 10, yPos);
  yPos += 8;

  doc.setFontSize(10);
  doc.setFont("helvetica", "normal");
  doc.text(`Wiek: ${inputs.age} lat`, 10, yPos);
  yPos += 6;
  doc.text(`Plec: ${inputs.sex === "M" ? "Mezczyzna" : "Kobieta"}`, 10, yPos);
  yPos += 6;
  doc.text(`Wynagrodzenie brutto: ${formatPLN(inputs.monthlyGross)}`, 10, yPos);
  yPos += 12;

  doc.setFontSize(12);
  doc.setFont("helvetica", "bold");
  doc.text("HISTORIA PRACY", 10, yPos);
  yPos += 8;

  doc.setFontSize(10);
  doc.setFont("helvetica", "normal");
  doc.text(`Rok rozpoczecia pracy: ${inputs.workStartYear}`, 10, yPos);
  yPos += 6;
  doc.text(`Planowana emerytura: ${inputs.workEndYear}`, 10, yPos);
  yPos += 6;
  doc.text(`Laczny staz pracy: ${yearsWorked} lat`, 10, yPos);
  yPos += 6;
  doc.text(`Wiek emerytalny: ${retirementAge} lat`, 10, yPos);
  yPos += 6;
  doc.text(`Typ umowy: ${getContractTypeLabel(inputs.contractType)}`, 10, yPos);
  yPos += 6;
  doc.text(
    `PPK: ${
      inputs.retirementPrograms?.ppk.enabled ? "Uczestnicze" : "Nie uczestnicze"
    }`,
    10,
    yPos
  );
  yPos += 6;
  doc.text(
    `IKZE: ${
      inputs.retirementPrograms?.ikze.enabled ? "Posiadam" : "Nie posiadam"
    }`,
    10,
    yPos
  );
  yPos += 12;

  doc.setFontSize(12);
  doc.setFont("helvetica", "bold");
  doc.text("DODATKOWE INFORMACJE", 10, yPos);
  yPos += 8;

  doc.setFontSize(10);
  doc.setFont("helvetica", "normal");
  doc.text(
    `Konto podstawowe: ${
      inputs.accountBalance
        ? formatPLN(inputs.accountBalance)
        : "Automatyczne oszacowanie"
    }`,
    10,
    yPos
  );
  yPos += 6;
  doc.text(
    `Subkonto (OFE): ${
      inputs.subAccountBalance
        ? formatPLN(inputs.subAccountBalance)
        : "Automatyczne oszacowanie"
    }`,
    10,
    yPos
  );
  yPos += 6;
  doc.text(
    `Zwolnienia lekarskie: ${
      inputs.includeZwolnienieZdrowotne ? "Uwzglednione" : "Pominiete"
    }`,
    10,
    yPos
  );
  yPos += 12;

  doc.setFontSize(12);
  doc.setFont("helvetica", "bold");
  doc.text("WYNIKI PROGNOZY", 10, yPos);
  yPos += 8;

  doc.setFontSize(10);
  doc.setFont("helvetica", "normal");
  doc.text(`Emerytura oczekiwana:`, 10, yPos);
  doc.setFont("helvetica", "bold");
  doc.text(formatPLN(expectedPension), 120, yPos);
  yPos += 8;

  doc.setFont("helvetica", "normal");
  doc.text(`Emerytura prognozowana (wartosc realna):`, 10, yPos);
  doc.setFont("helvetica", "bold");
  doc.text(formatPLN(results.realPension), 120, yPos);
  yPos += 6;
  doc.setFontSize(8);
  doc.setFont("helvetica", "italic");
  doc.text(
    "(w dzisiejszych zlotych, porownywalna do obecnych kosztow zycia)",
    10,
    yPos
  );
  yPos += 10;

  doc.setFontSize(10);
  doc.setFont("helvetica", "normal");
  doc.text(`Emerytura nominalna (w ${inputs.workEndYear} r.):`, 10, yPos);
  doc.setFont("helvetica", "bold");
  doc.text(formatPLN(results.nominalPension), 120, yPos);
  yPos += 8;

  doc.setFont("helvetica", "normal");
  doc.text(`Stopa zastapienia:`, 10, yPos);
  doc.setFont("helvetica", "bold");
  doc.text(formatPercent(results.replacementRate / 100), 120, yPos);
  yPos += 6;
  doc.setFontSize(8);
  doc.setFont("helvetica", "italic");
  doc.text(
    "Procent ostatniego wynagrodzenia, ktory bedzie stanowila emerytura",
    10,
    yPos
  );
  yPos += 12;

  doc.setLineWidth(0.5);
  doc.line(10, yPos, 200, yPos);
  yPos += 8;

  doc.setFontSize(8);
  doc.setFont("helvetica", "normal");
  doc.text("Raport wygenerowany przez Symulator Emerytalny ZUS", 105, yPos, {
    align: "center",
  });
  yPos += 5;
  doc.text(
    "Prognoza oparta na aktualnych przepisach i rzeczywistych danych ZUS",
    105,
    yPos,
    { align: "center" }
  );

  doc.save(`raport-emerytalny-${new Date().toISOString().split("T")[0]}.pdf`);
};
