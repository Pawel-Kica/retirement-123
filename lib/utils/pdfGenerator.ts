"use client";

import jsPDF from "jspdf";
import { formatPLN, formatPercent } from "./formatting";
import { SimulationInputs, SimulationResults } from "../types";

interface PDFReportData {
  inputs: SimulationInputs;
  results: SimulationResults;
  expectedPension: number;
  timestamp: Date;
  postalCode?: string;
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

export const generatePDFReport = async (data: PDFReportData): Promise<void> => {
  const { inputs, results, expectedPension, timestamp, postalCode } = data;

  const doc = new jsPDF();
  let yPos = 20;

  doc.setFontSize(18);
  doc.text("Raport emerytury", 10, yPos);
  yPos += 15;

  doc.setFontSize(12);
  doc.text("=".repeat(50), 10, yPos);
  yPos += 10;

  doc.setFontSize(10);
  doc.text("INFORMACJE OGOLNE", 10, yPos);
  yPos += 8;

  doc.setFontSize(9);
  doc.text(`Data uzycia: ${formatDate(timestamp)}`, 10, yPos);
  yPos += 6;
  doc.text(`Godzina uzycia: ${formatTime(timestamp)}`, 10, yPos);
  yPos += 6;
  doc.text(`Kod pocztowy: ${postalCode || "Nie podano"}`, 10, yPos);
  yPos += 12;

  doc.setFontSize(10);
  doc.text("DANE WEJSCIOWE", 10, yPos);
  yPos += 8;

  doc.setFontSize(9);
  doc.text(
    `Wysokosc wynagrodzenia (brutto): ${formatPLN(inputs.monthlyGross)}`,
    10,
    yPos
  );
  yPos += 6;
  doc.text(`Emerytura oczekiwana: ${formatPLN(expectedPension)}`, 10, yPos);
  yPos += 6;
  doc.text(`Wiek obecny: ${inputs.age} lat`, 10, yPos);
  yPos += 6;
  doc.text(`Plec: ${inputs.sex === "M" ? "Mezczyzna" : "Kobieta"}`, 10, yPos);
  yPos += 6;
  doc.text(`Rok rozpoczecia pracy: ${inputs.workStartYear}`, 10, yPos);
  yPos += 6;
  doc.text(`Rok przejscia na emeryture: ${inputs.workEndYear}`, 10, yPos);
  yPos += 6;
  doc.text(
    `Uwzglednienie okresow choroby (L4): ${inputs.includeL4 ? "Tak" : "Nie"}`,
    10,
    yPos
  );
  yPos += 6;
  doc.text(
    `Wiek emerytalny: ${
      inputs.age + (inputs.workEndYear - new Date().getFullYear())
    } lat`,
    10,
    yPos
  );
  yPos += 6;
  doc.text(
    `Konto glowne: ${
      inputs.accountBalance ? formatPLN(inputs.accountBalance) : "0,00 zl"
    }`,
    10,
    yPos
  );
  yPos += 6;
  doc.text(
    `Subkonto: ${
      inputs.subAccountBalance ? formatPLN(inputs.subAccountBalance) : "0,00 zl"
    }`,
    10,
    yPos
  );
  yPos += 12;

  doc.setFontSize(10);
  doc.text("WYNIKI KALKULACJI", 10, yPos);
  yPos += 8;

  doc.setFontSize(9);
  doc.text(
    `Emerytura rzeczywista (w cenach z ${inputs.workEndYear} roku):`,
    10,
    yPos
  );
  yPos += 6;
  doc.setFontSize(11);
  doc.text(formatPLN(results.nominalPension), 10, yPos);
  yPos += 10;

  doc.setFontSize(9);
  doc.text(`Emerytura urealniona (w dzisiejszych zlotych):`, 10, yPos);
  yPos += 6;
  doc.setFontSize(11);
  doc.text(formatPLN(results.realPension), 10, yPos);
  yPos += 6;
  doc.setFontSize(8);
  doc.text("Porownywalna do dzisiejszych kosztow zycia", 10, yPos);
  yPos += 10;

  doc.setFontSize(9);
  doc.text(
    `Stopa zastapienia: ${formatPercent(results.replacementRate / 100)}`,
    10,
    yPos
  );
  yPos += 6;
  doc.setFontSize(8);
  doc.text(
    "Wynagrodzenie zindeksowane w odniesieniu do prognozowanego swiadczenia",
    10,
    yPos
  );

  doc.save(`raport-emerytalny-${new Date().toISOString().split("T")[0]}.pdf`);
};
