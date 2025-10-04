"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { Button } from "@/components/ui/Button";
import { Card } from "@/components/ui/Card";
import { HistoryButton } from "@/components/ui/HistoryButton";
import { UserInputKPIs } from "@/components/ui/UserInputKPIs";
import { PDFPreviewModal } from "@/components/ui/PDFPreviewModal";
import { EnhancedCareerTimeline } from "@/components/ui/EnhancedCareerTimeline";
import {
  TimelinePanelContainer,
  PanelType,
} from "@/components/ui/TimelinePanelContainer";
import { EmploymentPeriodPanel } from "@/components/ui/EmploymentPeriodPanel";
import { GapPeriodPanel } from "@/components/ui/GapPeriodPanel";
import { SickLeavePanel } from "@/components/ui/SickLeavePanel";
import { useSimulation } from "@/lib/context/SimulationContext";
import { formatPLN, formatPercent, formatYears } from "@/lib/utils/formatting";
import { generatePDFReport } from "@/lib/utils/pdfGenerator";
import type {
  EmploymentPeriod,
  EmploymentGapPeriod,
  LifeEvent,
} from "@/lib/types";
import {
  Chart as ChartJS,
  CategoryScale,
  LinearScale,
  BarElement,
  LineElement,
  PointElement,
  Title,
  Tooltip,
  Legend,
  Filler,
} from "chart.js";
import { Bar, Line } from "react-chartjs-2";
import {
  FileText,
  BarChart3,
  TrendingUp,
  Table,
  Briefcase,
  Baby,
  Activity,
  ChevronDown,
  ChevronUp,
} from "lucide-react";

ChartJS.register(
  CategoryScale,
  LinearScale,
  BarElement,
  LineElement,
  PointElement,
  Title,
  Tooltip,
  Legend,
  Filler
);

export default function WynikPage() {
  const router = useRouter();
  const {
    state,
    loadFromHistory,
    getHistory,
    isCalculating,
    updateContractPeriods,
    updateGapPeriods,
    updateLifeEvents,
    loadTimelineFromStorage,
    updateInputs,
  } = useSimulation();

  const [isLoading, setIsLoading] = useState(true);
  const [deferralViewMode, setDeferralViewMode] = useState<
    "bar" | "line" | "table"
  >("bar");
  const [selectedDeferralYears, setSelectedDeferralYears] = useState(0);
  const [showPDFPreview, setShowPDFPreview] = useState(false);

  // Timeline panel state
  const [activePanelType, setActivePanelType] = useState<PanelType>(null);
  const [editingItem, setEditingItem] = useState<
    EmploymentPeriod | EmploymentGapPeriod | LifeEvent | null
  >(null);

  // Timeline data
  const [contractPeriods, setContractPeriods] = useState<EmploymentPeriod[]>(
    []
  );
  const [gapPeriods, setGapPeriods] = useState<EmploymentGapPeriod[]>([]);
  const [lifeEvents, setLifeEvents] = useState<LifeEvent[]>([]);

  // UI state
  const [showEventsSection, setShowEventsSection] = useState(true);

  useEffect(() => {
    if (!state.results) {
      const history = getHistory();
      if (history.length > 0) {
        loadFromHistory(history[0].id);
        setIsLoading(false);
      } else {
        router.push("/kalkulator");
      }
    } else {
      setIsLoading(false);
    }
  }, [state.results, router, loadFromHistory, getHistory]);

  useEffect(() => {
    if (state.inputs && !isLoading) {
      loadTimelineFromStorage();
    }
  }, [state.inputs, isLoading, loadTimelineFromStorage]);

  useEffect(() => {
    if (state.dashboardModifications) {
      setContractPeriods(state.dashboardModifications.contractPeriods || []);
      setGapPeriods(state.dashboardModifications.gapPeriods || []);
      setLifeEvents(state.dashboardModifications.lifeEvents || []);
    }
  }, [state.dashboardModifications]);

  if (isLoading || !state.results || !state.inputs) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-zus-green mx-auto mb-4"></div>
          <p className="text-zus-grey-600">Ładowanie...</p>
        </div>
      </div>
    );
  }

  const { results, inputs, expectedPension } = state;

  // Calculate difference between expected and forecasted pension
  const pensionDifference = results.realPension - expectedPension;
  const pensionDifferencePercent = (pensionDifference / expectedPension) * 100;
  const isBelowExpectation = pensionDifference < 0;

  // Panel handlers
  const handleOpenEmploymentPanel = (period?: EmploymentPeriod) => {
    setEditingItem(period || null);
    setActivePanelType("employment");
  };

  const handleOpenGapPanel = (gap?: EmploymentGapPeriod) => {
    setEditingItem(gap || null);
    setActivePanelType("gap");
  };

  const handleOpenSickLeavePanel = (event?: LifeEvent) => {
    setEditingItem(event || null);
    setActivePanelType("sick");
  };

  const handleClosePanel = () => {
    setActivePanelType(null);
    setEditingItem(null);
  };

  const handleSaveEmployment = async (period: EmploymentPeriod) => {
    const updatedPeriods = editingItem
      ? contractPeriods.map((p) => (p.id === period.id ? period : p))
      : [...contractPeriods, period];

    await updateContractPeriods(updatedPeriods);
    handleClosePanel();
  };

  const handleDeleteEmployment = async () => {
    if (editingItem && "contractType" in editingItem) {
      const updatedPeriods = contractPeriods.filter(
        (p) => p.id !== editingItem.id
      );
      await updateContractPeriods(updatedPeriods);
      handleClosePanel();
    }
  };

  const handleSaveGap = async (gap: EmploymentGapPeriod) => {
    const updatedGaps = editingItem
      ? gapPeriods.map((g) => (g.id === gap.id ? gap : g))
      : [...gapPeriods, gap];

    await updateGapPeriods(updatedGaps);
    handleClosePanel();
  };

  const handleDeleteGap = async () => {
    if (editingItem && "kind" in editingItem) {
      const updatedGaps = gapPeriods.filter((g) => g.id !== editingItem.id);
      await updateGapPeriods(updatedGaps);
      handleClosePanel();
    }
  };

  const handleSaveSickLeave = async (event: LifeEvent) => {
    const updatedEvents = editingItem
      ? lifeEvents.map((e) => (e.id === event.id ? event : e))
      : [...lifeEvents, event];

    await updateLifeEvents(updatedEvents);
    handleClosePanel();
  };

  const handleDeleteSickLeave = async () => {
    if (editingItem && "type" in editingItem) {
      const updatedEvents = lifeEvents.filter((e) => e.id !== editingItem.id);
      await updateLifeEvents(updatedEvents);
      handleClosePanel();
    }
  };

  const currentYear = new Date().getFullYear();
  const totalEvents =
    contractPeriods.length + gapPeriods.length + lifeEvents.length;

  const handleOpenPDFPreview = () => {
    setShowPDFPreview(true);
  };

  const handleClosePDFPreview = () => {
    setShowPDFPreview(false);
  };

  const handleConfirmPDF = async () => {
    await generatePDFReport({
      inputs,
      results,
      expectedPension,
      timestamp: new Date(),
    });
    setShowPDFPreview(false);
  };

  return (
    <>
      <main className="min-h-screen bg-gradient-to-b from-gray-50 to-gray-100">
        <div className="container mx-auto px-4 sm:px-6 lg:px-8 max-w-[1400px] py-8 relative">
          {/* History Button - Top Right of Container */}
          <div className="absolute top-4 right-4 sm:right-6 lg:right-8 z-30">
            <HistoryButton />
          </div>

          <h1 className="text-4xl font-bold text-zus-grey-900 mb-6 text-center">
            Twoja Prognoza Emerytury
          </h1>

          {/* Comparison Warning/Congratulations Banner */}
          {isBelowExpectation ? (
            <div className="mb-6 p-4 bg-zus-error/10 border-l-4 border-zus-error rounded-lg">
              <div className="flex items-start gap-3">
                <div className="flex-shrink-0 w-6 h-6 rounded-full bg-zus-error flex items-center justify-center mt-0.5">
                  <span className="text-white text-sm font-bold">!</span>
                </div>
                <div className="flex-1">
                  <h3 className="text-sm font-bold text-zus-error mb-1">
                    Uwaga: Emerytura poniżej oczekiwań
                  </h3>
                  <p className="text-sm text-zus-grey-700">
                    Twoja prognozowana emerytura jest{" "}
                    <strong className="text-zus-error">
                      {formatPLN(Math.abs(pensionDifference))}
                    </strong>{" "}
                    ({Math.abs(pensionDifferencePercent).toFixed(1)}%) niższa
                    niż oczekiwana. Rozważ wydłużenie kariery lub zwiększenie
                    składek.
                  </p>
                </div>
              </div>
            </div>
          ) : (
            <div className="mb-6 p-4 bg-zus-green-light border-l-4 border-zus-green rounded-lg">
              <div className="flex items-start gap-3">
                <div className="flex-shrink-0 w-6 h-6 rounded-full bg-zus-green flex items-center justify-center mt-0.5">
                  <span className="text-white text-sm font-bold">✓</span>
                </div>
                <div className="flex-1">
                  <h3 className="text-sm font-bold text-zus-green mb-1">
                    Gratulacje! Emerytura powyżej oczekiwań
                  </h3>
                  <p className="text-sm text-zus-grey-700">
                    Twoja prognozowana emerytura jest{" "}
                    <strong className="text-zus-green">
                      {formatPLN(pensionDifference)}
                    </strong>{" "}
                    ({pensionDifferencePercent.toFixed(1)}%) wyższa niż
                    oczekiwana. Dobra praca!
                  </p>
                </div>
              </div>
            </div>
          )}

          {/* Results KPIs */}
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 mb-8">
            <Card className="bg-white border border-zus-grey-300">
              <div className="text-xs font-semibold text-zus-grey-600 uppercase tracking-wide mb-2">
                Emerytura oczekiwana
              </div>
              <div className="text-3xl font-bold text-zus-grey-900">
                {formatPLN(expectedPension)}
              </div>
            </Card>

            <Card
              className={`bg-white border-2 ${
                isBelowExpectation ? "border-zus-error" : "border-zus-green"
              }`}
            >
              <div className="text-xs font-semibold text-zus-grey-600 uppercase tracking-wide mb-2">
                Emerytura prognozowana
              </div>
              <div
                className={`text-3xl font-bold ${
                  isBelowExpectation ? "text-zus-error" : "text-zus-green"
                }`}
              >
                {formatPLN(results.realPension)}
              </div>
              <div className="text-xs text-zus-grey-600 mt-1">
                (wartość realna)
              </div>
            </Card>

            <Card className="bg-white border border-zus-grey-300">
              <div className="text-xs font-semibold text-zus-grey-600 uppercase tracking-wide mb-2">
                Emerytura nominalna
              </div>
              <div className="text-3xl font-bold text-zus-grey-900">
                {formatPLN(results.nominalPension)}
              </div>
              <div className="text-xs text-zus-grey-600 mt-1">
                (w {inputs.workEndYear} r.)
              </div>
            </Card>

            <Card className="bg-white border border-zus-grey-300">
              <div className="text-xs font-semibold text-zus-grey-600 uppercase tracking-wide mb-2">
                Stopa zastąpienia
              </div>
              <div className="text-3xl font-bold text-zus-grey-900">
                {formatPercent(results.replacementRate / 100)}
              </div>
            </Card>
          </div>

          {/* Simulation Details */}
          <UserInputKPIs
            inputs={inputs}
            isCalculating={isCalculating}
            onUpdateInputs={updateInputs}
          />

          {/* Timeline Section */}
          <Card className="mb-8">
            <div className="flex items-center justify-between mb-6">
              <div>
                <h2 className="text-2xl font-bold text-zus-grey-900 flex items-center gap-2">
                  <FileText className="w-6 h-6 text-zus-green" />
                  Twoja Ścieżka Kariery
                </h2>
                <p className="text-sm text-zus-grey-700 mt-1">
                  Zarządzaj okresami zatrudnienia i wydarzeniami wpływającymi na
                  emeryturę
                </p>
              </div>
            </div>

            {/* Action Buttons */}
            <div className="flex flex-wrap gap-3 mb-6">
              <Button
                onClick={() => handleOpenEmploymentPanel()}
                variant="success"
                className="flex items-center gap-2"
              >
                <Briefcase className="w-4 h-4" />
                Dodaj Pracę
              </Button>
              <Button
                onClick={() => handleOpenGapPanel()}
                variant="secondary"
                className="flex items-center gap-2"
              >
                <Baby className="w-4 h-4" />
                Dodaj Urlop/Przerwę
              </Button>
              <Button
                onClick={() => handleOpenSickLeavePanel()}
                className="flex items-center gap-2 bg-zus-error hover:bg-red-700 text-white"
              >
                <Activity className="w-4 h-4" />
                Dodaj Długie L4
              </Button>
            </div>

            {/* Enhanced Timeline */}
            <EnhancedCareerTimeline
              contractPeriods={contractPeriods}
              gapPeriods={gapPeriods}
              lifeEvents={lifeEvents}
              currentYear={currentYear}
              workStartYear={inputs.workStartYear}
              workEndYear={inputs.workEndYear}
              onEditEmployment={handleOpenEmploymentPanel}
              onEditGap={handleOpenGapPanel}
              onEditSickLeave={handleOpenSickLeavePanel}
            />

            {/* Events List - Collapsible */}
            {totalEvents > 0 && (
              <div className="mt-8 pt-6 border-t border-zus-grey-300">
                <button
                  onClick={() => setShowEventsSection(!showEventsSection)}
                  className="flex items-center justify-between w-full mb-4 text-left"
                >
                  <h3 className="text-lg font-bold text-zus-grey-900">
                    Twoje wydarzenia kariery ({totalEvents})
                  </h3>
                  {showEventsSection ? (
                    <ChevronUp className="w-5 h-5 text-zus-grey-600" />
                  ) : (
                    <ChevronDown className="w-5 h-5 text-zus-grey-600" />
                  )}
                </button>

                {showEventsSection && (
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
                    {contractPeriods.map((period) => (
                      <div
                        key={period.id}
                        className="flex items-center justify-between p-3 bg-zus-green-light rounded-lg border border-zus-green cursor-pointer hover:bg-zus-green/20"
                        onClick={() => handleOpenEmploymentPanel(period)}
                      >
                        <div className="flex items-center gap-3">
                          <Briefcase className="w-5 h-5 text-zus-green" />
                          <div>
                            <p className="font-semibold text-sm text-zus-grey-900">
                              {period.contractType} -{" "}
                              {formatPLN(period.monthlyGross)}
                            </p>
                            <p className="text-xs text-zus-grey-600">
                              {period.startMonth}/{period.startYear} -{" "}
                              {period.endMonth}/{period.endYear}
                            </p>
                          </div>
                        </div>
                        <span className="text-zus-green text-sm font-semibold">
                          Edytuj
                        </span>
                      </div>
                    ))}

                    {gapPeriods.map((gap) => (
                      <div
                        key={gap.id}
                        className="flex items-center justify-between p-3 bg-orange-50 rounded-lg border border-orange-300 cursor-pointer hover:bg-orange-100"
                        onClick={() => handleOpenGapPanel(gap)}
                      >
                        <div className="flex items-center gap-3">
                          <Baby className="w-5 h-5 text-orange-600" />
                          <div>
                            <p className="font-semibold text-sm text-zus-grey-900">
                              {gap.kind === "MATERNITY_LEAVE"
                                ? "Urlop macierzyński"
                                : gap.kind === "UNPAID_LEAVE"
                                ? "Urlop bezpłatny"
                                : "Bezrobocie"}
                            </p>
                            <p className="text-xs text-zus-grey-600">
                              {gap.startMonth}/{gap.startYear} (
                              {gap.durationMonths} miesięcy)
                            </p>
                          </div>
                        </div>
                        <span className="text-orange-600 text-sm font-semibold">
                          Edytuj
                        </span>
                      </div>
                    ))}

                    {lifeEvents.map((event) => (
                      <div
                        key={event.id}
                        className="flex items-center justify-between p-3 bg-red-50 rounded-lg border border-zus-error cursor-pointer hover:bg-red-100"
                        onClick={() => handleOpenSickLeavePanel(event)}
                      >
                        <div className="flex items-center gap-3">
                          <Activity className="w-5 h-5 text-zus-error" />
                          <div>
                            <p className="font-semibold text-sm text-zus-grey-900">
                              Długie zwolnienie L4
                            </p>
                            <p className="text-xs text-zus-grey-600">
                              {event.month}/{event.year} ({event.durationYears}{" "}
                              {event.durationYears === 1 ? "rok" : "lat"})
                            </p>
                          </div>
                        </div>
                        <span className="text-zus-error text-sm font-semibold">
                          Edytuj
                        </span>
                      </div>
                    ))}
                  </div>
                )}
              </div>
            )}
          </Card>

          {/* Deferral Scenarios */}
          <Card className="mb-8">
            <div className="flex justify-between items-center mb-6">
              <h3 className="text-xl font-bold text-zus-grey-900">
                Scenariusze wydłużenia kariery
              </h3>
              <div className="flex gap-2 bg-zus-grey-100 p-1 rounded-lg">
                <button
                  onClick={() => setDeferralViewMode("bar")}
                  className={`px-4 py-2 rounded-md font-semibold text-sm transition-all cursor-pointer flex items-center gap-2 ${
                    deferralViewMode === "bar"
                      ? "bg-zus-green text-white shadow-md"
                      : "text-zus-grey-700 hover:bg-white"
                  }`}
                >
                  <BarChart3 className="w-4 h-4" />
                  Wykres
                </button>
                <button
                  onClick={() => setDeferralViewMode("line")}
                  className={`px-4 py-2 rounded-md font-semibold text-sm transition-all cursor-pointer flex items-center gap-2 ${
                    deferralViewMode === "line"
                      ? "bg-zus-green text-white shadow-md"
                      : "text-zus-grey-700 hover:bg-white"
                  }`}
                >
                  <TrendingUp className="w-4 h-4" />
                  Linia
                </button>
                <button
                  onClick={() => setDeferralViewMode("table")}
                  className={`px-4 py-2 rounded-md font-semibold text-sm transition-all cursor-pointer flex items-center gap-2 ${
                    deferralViewMode === "table"
                      ? "bg-zus-green text-white shadow-md"
                      : "text-zus-grey-700 hover:bg-white"
                  }`}
                >
                  <Table className="w-4 h-4" />
                  Tabela
                </button>
              </div>
            </div>

            {deferralViewMode === "bar" && (
              <div className="h-[400px]">
                <Bar
                  data={{
                    labels: [
                      `Bazowy`,
                      ...results.deferrals.map(
                        (d) => `+${d.additionalYears} lat`
                      ),
                    ],
                    datasets: [
                      {
                        label: "Emerytura realna (zł)",
                        data: [
                          results.realPension,
                          ...results.deferrals.map((d) => d.realPension),
                        ],
                        backgroundColor: "#00843D",
                        borderRadius: 8,
                      },
                    ],
                  }}
                  options={{
                    responsive: true,
                    maintainAspectRatio: false,
                    plugins: {
                      legend: { display: false },
                    },
                    scales: {
                      y: {
                        ticks: {
                          callback: (value: any) =>
                            `${(value / 1000).toFixed(0)}k zł`,
                        },
                      },
                    },
                  }}
                />
              </div>
            )}

            {deferralViewMode === "line" && (
              <div className="h-[400px]">
                <Line
                  data={{
                    labels: [
                      "Bazowy",
                      ...results.deferrals.map((d) => `+${d.additionalYears}`),
                    ],
                    datasets: [
                      {
                        label: "Wzrost emerytury (%)",
                        data: [
                          0,
                          ...results.deferrals.map((d) => d.percentIncrease),
                        ],
                        borderColor: "#00843D",
                        backgroundColor: "rgba(0, 132, 61, 0.1)",
                        fill: true,
                      },
                    ],
                  }}
                  options={{
                    responsive: true,
                    maintainAspectRatio: false,
                  }}
                />
              </div>
            )}

            {deferralViewMode === "table" && (
              <div className="h-[400px] overflow-y-auto">
                <table className="w-full">
                  <thead className="sticky top-0 bg-white z-10">
                    <tr className="bg-zus-grey-100 border-b-2 border-zus-green">
                      <th className="p-3 text-left font-semibold">
                        Scenariusz
                      </th>
                      <th className="p-3 text-right font-semibold">
                        Emerytura
                      </th>
                      <th className="p-3 text-right font-semibold">Wzrost</th>
                    </tr>
                  </thead>
                  <tbody>
                    <tr className="border-b">
                      <td className="p-3 font-bold">Bazowy</td>
                      <td className="p-3 text-right font-bold">
                        {formatPLN(results.realPension)}
                      </td>
                      <td className="p-3 text-right">-</td>
                    </tr>
                    {results.deferrals.map((def) => (
                      <tr
                        key={def.additionalYears}
                        className="border-b hover:bg-zus-green-light"
                      >
                        <td className="p-3">
                          +{formatYears(def.additionalYears)}
                        </td>
                        <td className="p-3 text-right font-bold text-zus-green">
                          {formatPLN(def.realPension)}
                        </td>
                        <td className="p-3 text-right text-zus-green">
                          +{def.percentIncrease.toFixed(1)}%
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            )}
          </Card>

          {/* Actions */}
          <div className="flex flex-col md:flex-row gap-4">
            <Button
              onClick={() => router.push("/")}
              variant="secondary"
              size="lg"
              className="flex-1"
            >
              Nowa symulacja
            </Button>
            <Button
              onClick={handleOpenPDFPreview}
              variant="success"
              size="lg"
              className="flex-1"
            >
              Pobierz raport PDF
            </Button>
          </div>
        </div>
      </main>

      {/* PDF Preview Modal */}
      <PDFPreviewModal
        isOpen={showPDFPreview}
        onClose={handleClosePDFPreview}
        onConfirm={handleConfirmPDF}
        inputs={inputs}
        results={results}
        expectedPension={expectedPension}
      />

      {/* Side Panel */}
      <TimelinePanelContainer
        isOpen={activePanelType !== null}
        panelType={activePanelType}
        editingItem={editingItem}
        onClose={handleClosePanel}
      >
        {activePanelType === "employment" && (
          <EmploymentPeriodPanel
            period={
              editingItem && "contractType" in editingItem ? editingItem : null
            }
            existingPeriods={contractPeriods}
            workStartYear={inputs.workStartYear}
            workEndYear={inputs.workEndYear}
            onSave={handleSaveEmployment}
            onDelete={editingItem ? handleDeleteEmployment : undefined}
            onCancel={handleClosePanel}
          />
        )}

        {activePanelType === "gap" && (
          <GapPeriodPanel
            gap={editingItem && "kind" in editingItem ? editingItem : null}
            existingGaps={gapPeriods}
            workStartYear={inputs.workStartYear}
            workEndYear={inputs.workEndYear}
            onSave={handleSaveGap}
            onDelete={editingItem ? handleDeleteGap : undefined}
            onCancel={handleClosePanel}
          />
        )}

        {activePanelType === "sick" && (
          <SickLeavePanel
            event={editingItem && "type" in editingItem ? editingItem : null}
            existingEvents={lifeEvents}
            workStartYear={inputs.workStartYear}
            workEndYear={inputs.workEndYear}
            onSave={handleSaveSickLeave}
            onDelete={editingItem ? handleDeleteSickLeave : undefined}
            onCancel={handleClosePanel}
          />
        )}
      </TimelinePanelContainer>
    </>
  );
}
