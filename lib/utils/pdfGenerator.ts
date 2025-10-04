"use client";

import jsPDF from "jspdf";
import html2canvas from "html2canvas";
import { formatPLN, formatPercent, formatYears } from "./formatting";
import { SimulationInputs, SimulationResults } from "../types";

interface PDFReportData {
  inputs: SimulationInputs;
  results: SimulationResults;
  expectedPension: number;
  timestamp: Date;
  postalCode?: string;
}

interface ChartElements {
  deferralChart?: HTMLElement;
}

export class PDFReportGenerator {
  private doc: jsPDF;
  private data: PDFReportData;
  private charts?: ChartElements;

  constructor(data: PDFReportData, charts?: ChartElements) {
    this.doc = new jsPDF();
    this.data = data;
    this.charts = charts;
  }

  private addHeader() {
    // Header background
    this.doc.setFillColor(0, 132, 61); // ZUS green
    this.doc.rect(0, 0, 210, 35, "F");

    // ZUS Logo placeholder (you can replace this with actual logo)
    this.doc.setTextColor(255, 255, 255);
    this.doc.setFontSize(22);
    this.doc.setFont("helvetica", "bold");
    this.doc.text("ZUS", 20, 25);

    // Institution name
    this.doc.setFontSize(12);
    this.doc.setFont("helvetica", "normal");
    this.doc.text("Social Insurance Institution", 55, 25);

    // Report title on white background
    this.doc.setTextColor(0, 0, 0);
    this.doc.setFillColor(255, 255, 255);
    this.doc.rect(20, 45, 170, 25, "F");

    this.doc.setFontSize(16);
    this.doc.setFont("helvetica", "bold");
    this.doc.text("PENSION PROJECTION REPORT", 25, 60);

    // Add decorative line
    this.doc.setDrawColor(0, 132, 61);
    this.doc.setLineWidth(1);
    this.doc.line(20, 75, 190, 75);
  }

  private addReportInfo() {
    const { timestamp, postalCode } = this.data;
    let yPos = 85;

    // Section header
    this.doc.setFillColor(245, 245, 245);
    this.doc.rect(20, yPos - 3, 170, 12, "F");
    this.doc.setTextColor(0, 132, 61);
    this.doc.setFontSize(10);
    this.doc.setFont("helvetica", "bold");
    this.doc.text("REPORT INFO", 25, yPos + 4);
    yPos += 15;

    this.doc.setTextColor(0, 0, 0);
    this.doc.setFontSize(9);
    this.doc.setFont("helvetica", "normal");

    // Date and time
    this.doc.text(
      `Generated: ${timestamp.toLocaleDateString("en-GB")}`,
      20,
      yPos
    );
    yPos += 10;
    this.doc.text(
      `Time: ${timestamp.toLocaleTimeString("en-GB", {
        hour: "2-digit",
        minute: "2-digit",
      })}`,
      20,
      yPos
    );
    yPos += 14;

    // Postal code if provided
    if (postalCode) {
      this.doc.text(`Postal Code: ${postalCode}`, 20, yPos);
      yPos += 14;
    }
  }

  private addInputData() {
    const { inputs, expectedPension } = this.data;
    let yPos = 110; // Start after report info

    // Section header
    this.doc.setFillColor(245, 245, 245);
    this.doc.rect(20, yPos - 2, 170, 10, "F");
    this.doc.setTextColor(0, 132, 61);
    this.doc.setFontSize(9);
    this.doc.setFont("helvetica", "bold");
    this.doc.text("INPUT DATA", 25, yPos + 3);
    yPos += 12;

    this.doc.setTextColor(0, 0, 0);
    this.doc.setFontSize(8);
    this.doc.setFont("helvetica", "normal");

    // Personal information in two columns
    this.doc.text(`Age: ${inputs.age}y`, 20, yPos);
    this.doc.text(`Gender: ${inputs.sex === "M" ? "M" : "F"}`, 100, yPos);
    yPos += 8;

    this.doc.text(`Salary: ${formatPLN(inputs.monthlyGross)}`, 20, yPos);
    this.doc.text(`Expected: ${formatPLN(expectedPension)}`, 100, yPos);
    yPos += 8;

    // Work period
    this.doc.text(`Work Start: ${inputs.workStartYear}`, 20, yPos);
    this.doc.text(`Retire: ${inputs.workEndYear}`, 100, yPos);
    yPos += 8;

    this.doc.text(
      `Retire Age: ${
        inputs.age + (inputs.workEndYear - new Date().getFullYear())
      }y`,
      20,
      yPos
    );
    this.doc.text(
      `Work Years: ${inputs.workEndYear - inputs.workStartYear}`,
      100,
      yPos
    );
    yPos += 8;

    // Additional settings
    this.doc.text(
      `L4 Sick Leave: ${inputs.includeL4 ? "Yes" : "No"}`,
      20,
      yPos
    );
    yPos += 8;

    if (inputs.accountBalance) {
      this.doc.text(
        `Main Account: ${formatPLN(inputs.accountBalance)}`,
        20,
        yPos
      );
      yPos += 8;
    }

    if (inputs.subAccountBalance) {
      this.doc.text(
        `Sub Account: ${formatPLN(inputs.subAccountBalance)}`,
        20,
        yPos
      );
      yPos += 8;
    }
  }

  private addResults() {
    const { results } = this.data;
    let yPos = 175; // Continue after input data

    // Section header
    this.doc.setFillColor(245, 245, 245);
    this.doc.rect(20, yPos - 2, 170, 10, "F");
    this.doc.setTextColor(0, 132, 61);
    this.doc.setFontSize(9);
    this.doc.setFont("helvetica", "bold");
    this.doc.text("RESULTS", 25, yPos + 3);
    yPos += 12;

    this.doc.setTextColor(0, 0, 0);
    this.doc.setFontSize(8);
    this.doc.setFont("helvetica", "normal");

    // Main results
    this.doc.text("Nominal:", 20, yPos);
    this.doc.setFont("helvetica", "bold");
    this.doc.text(`${formatPLN(results.nominalPension)}`, 60, yPos);
    this.doc.setFont("helvetica", "normal");
    this.doc.text(`(${this.data.inputs.workEndYear})`, 20, yPos + 6);
    yPos += 12;

    this.doc.setFont("helvetica", "bold");
    this.doc.text("Real Pension:", 20, yPos);
    this.doc.setFont("helvetica", "bold");
    this.doc.text(`${formatPLN(results.realPension)}`, 60, yPos);
    this.doc.setFont("helvetica", "normal");
    this.doc.text("(today's money)", 20, yPos + 6);
    yPos += 12;

    this.doc.text("Replacement Rate:", 20, yPos);
    this.doc.setFont("helvetica", "bold");
    this.doc.text(`${formatPercent(results.replacementRate / 100)}`, 60, yPos);
    yPos += 10;

    // L4 impact if applicable
    if (this.data.inputs.includeL4) {
      this.doc.text("L4 Impact:", 20, yPos);
      yPos += 8;

      this.doc.text("No L4:", 30, yPos);
      this.doc.setFont("helvetica", "bold");
      this.doc.text(`${formatPLN(results.withoutL4.realPension)}`, 80, yPos);
      yPos += 7;

      this.doc.setFont("helvetica", "normal");
      this.doc.text("With L4:", 30, yPos);
      this.doc.setFont("helvetica", "bold");
      this.doc.text(`${formatPLN(results.withL4.realPension)}`, 80, yPos);
      yPos += 7;

      this.doc.setFont("helvetica", "normal");
      this.doc.text("Diff:", 30, yPos);
      this.doc.setFont("helvetica", "bold");
      this.doc.text(`${formatPLN(results.l4Difference)}`, 80, yPos);
      yPos += 10;
    }

    // Years needed if applicable
    if (results.yearsNeeded !== null) {
      this.doc.text("To reach expected:", 20, yPos);
      yPos += 7;
      this.doc.setFont("helvetica", "bold");
      this.doc.text(`Work ${formatYears(results.yearsNeeded)} more`, 30, yPos);
      yPos += 10;
    }
  }

  private async addCharts() {
    if (!this.charts?.deferralChart) return;

    try {
      // Capture the deferral chart
      const canvas = await html2canvas(this.charts.deferralChart, {
        scale: 2,
        backgroundColor: "#ffffff",
        logging: false,
      });

      const imgData = canvas.toDataURL("image/png");
      const imgWidth = 170;
      const imgHeight = (canvas.height * imgWidth) / canvas.width;

      // Chart title
      this.doc.setFillColor(245, 245, 245);
      this.doc.rect(20, 15, 170, 10, "F");
      this.doc.setTextColor(0, 132, 61);
      this.doc.setFontSize(9);
      this.doc.setFont("helvetica", "bold");
      this.doc.text("CHART", 25, 22);

      // Add the chart image - smaller size to fit on one page
      const chartWidth = 160;
      const chartHeight = Math.min(imgHeight * 0.7, 120); // Limit height
      this.doc.addImage(imgData, "PNG", 20, 30, chartWidth, chartHeight);
    } catch (error) {
      console.error("Error adding charts to PDF:", error);
      // Continue without charts if there's an error
    }
  }

  private addFooter() {
    const pageCount = this.doc.getNumberOfPages();

    for (let i = 1; i <= pageCount; i++) {
      this.doc.setPage(i);

      // Footer line
      this.doc.setDrawColor(0, 132, 61);
      this.doc.setLineWidth(1);
      this.doc.line(20, 265, 190, 265);

      // Footer background
      this.doc.setFillColor(245, 245, 245);
      this.doc.rect(20, 268, 170, 12, "F");

      // Page number
      this.doc.setTextColor(0, 0, 0);
      this.doc.setFontSize(8);
      this.doc.setFont("helvetica", "normal");
      this.doc.text(`Page ${i} of ${pageCount}`, 25, 276);

      // Generation info
      this.doc.setFontSize(7);
      this.doc.text(
        `Generated by Pension Calculator - ${new Date().toLocaleDateString(
          "en-GB"
        )}`,
        90,
        276
      );
    }
  }

  public async generate(): Promise<Blob> {
    try {
      this.addHeader();
      this.addReportInfo();
      this.addInputData();
      this.addResults();
      await this.addCharts();
      this.addFooter();

      return this.doc.output("blob");
    } catch (error) {
      console.error("Error generating PDF:", error);
      throw new Error("Failed to generate PDF report");
    }
  }
}

export const generatePDFReport = async (
  data: PDFReportData,
  charts?: ChartElements
): Promise<void> => {
  const generator = new PDFReportGenerator(data, charts);
  const pdfBlob = await generator.generate();

  // Create download link
  const url = URL.createObjectURL(pdfBlob);
  const link = document.createElement("a");
  link.href = url;
  link.download = `raport-emerytalny-${
    new Date().toISOString().split("T")[0]
  }.pdf`;

  // Trigger download
  document.body.appendChild(link);
  link.click();

  // Clean up
  document.body.removeChild(link);
  URL.revokeObjectURL(url);
};
