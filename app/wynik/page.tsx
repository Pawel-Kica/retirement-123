"use client";

import { useEffect, useState, useRef, Suspense } from "react";
import { useRouter, useSearchParams } from "next/navigation";
import { Button } from "@/components/ui/Button";
import { HistoryButton } from "@/components/ui/HistoryButton";
import { PDFPreviewModal } from "@/components/ui/PDFPreviewModal";
import {
  TimelinePanelContainer,
  PanelType,
} from "@/components/ui/TimelinePanelContainer";
import { EmploymentPeriodPanel } from "@/components/ui/EmploymentPeriodPanel";
import { GapPeriodPanel } from "@/components/ui/GapPeriodPanel";
import { SickLeavePanel } from "@/components/ui/SickLeavePanel";
import { ComparisonBanner } from "@/components/wynik/ComparisonBanner";
import { ResultsKPIs } from "@/components/wynik/ResultsKPIs";
import { WorkHistorySummary } from "@/components/wynik/WorkHistorySummary";
import { TimelineSection } from "@/components/wynik/TimelineSection";
import { DeferralScenarios } from "@/components/wynik/DeferralScenarios";
import { SalaryGrowthImpact } from "@/components/wynik/SalaryGrowthImpact";
import { DebugPanel } from "@/components/wynik/DebugPanel";
import { useSimulation } from "@/lib/context/SimulationContext";
import { generatePDFReport } from "@/lib/utils/pdfGenerator";
import { loadAllData } from "@/lib/data/loader";
import { getExampleById } from "@/lib/data/examples";
import { ExampleBrowser } from "@/components/ui/ExampleBrowser";
import { ExampleDropdown } from "@/components/ui/ExampleDropdown";
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

function WynikPageContent() {
  const router = useRouter();
  const searchParams = useSearchParams();
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
    setInputsAndRecalculate,
  } = useSimulation();

  const [isLoading, setIsLoading] = useState(true);
  const [showPDFPreview, setShowPDFPreview] = useState(false);
  const [data, setData] = useState<any>(null);
  const [isExampleMode, setIsExampleMode] = useState(false);
  const [exampleId, setExampleId] = useState<string | null>(null);

  // Track loaded example to prevent re-loading
  const loadedExampleRef = useRef<string | null>(null);

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

  // Load data on mount
  useEffect(() => {
    async function fetchData() {
      try {
        const loadedData = await loadAllData();
        setData(loadedData);
      } catch (error) {
        console.error("Failed to load data:", error);
      }
    }
    fetchData();
  }, []);

  // Handle example query parameter
  useEffect(() => {
    const exampleParam = searchParams.get("example");

    if (exampleParam) {
      // Skip if we've already loaded this example
      if (loadedExampleRef.current === exampleParam) {
        return;
      }

      const example = getExampleById(exampleParam);

      if (example) {
        setIsExampleMode(true);
        setExampleId(exampleParam);

        // Load example data into simulation
        const loadExample = async () => {
          try {
            setIsLoading(true);

            // Merge inputs with dashboard modifications
            const exampleInputs = {
              ...example.inputs,
              employmentPeriods: example.modifications.contractPeriods,
            };

            await setInputsAndRecalculate(exampleInputs, false);

            // Also set the dashboard modifications
            if (example.modifications.gapPeriods) {
              setGapPeriods(example.modifications.gapPeriods);
            }
            if (example.modifications.lifeEvents) {
              setLifeEvents(example.modifications.lifeEvents);
            }

            // Mark this example as loaded
            loadedExampleRef.current = exampleParam;
            setIsLoading(false);
          } catch (error) {
            console.error("Failed to load example:", error);
            setIsLoading(false);
          }
        };

        loadExample();
      }
    } else {
      setIsExampleMode(false);
      setExampleId(null);
      loadedExampleRef.current = null;
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [searchParams]); // Only depend on searchParams to avoid infinite loop

  useEffect(() => {
    // Small delay to allow state to be loaded from localStorage
    const checkResults = async () => {
      await new Promise((resolve) => setTimeout(resolve, 100));

      // Check if we're loading an example - if so, don't redirect
      const exampleParam = searchParams.get("example");
      if (exampleParam) {
        // Example will be loaded by the other useEffect
        return;
      }

      if (!state.results) {
        // Try to load from history before redirecting
        const history = getHistory();
        if (history && history.length > 0) {
          // Load the most recent simulation
          const mostRecent = history[0];
          loadFromHistory(mostRecent.id);
          setIsLoading(false);
          return;
        }

        // If no results and no history, redirect to home page
        router.push("/");
        return;
      }
      setIsLoading(false);
    };

    checkResults();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [searchParams]); // Re-run when searchParams change

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

  // Panel handlers (disabled in example mode)
  const handleOpenEmploymentPanel = (period?: EmploymentPeriod) => {
    if (isExampleMode) return; // Disable editing in example mode
    setEditingItem(period || null);
    setActivePanelType("employment");
  };

  const handleOpenGapPanel = (gap?: EmploymentGapPeriod) => {
    if (isExampleMode) return; // Disable editing in example mode
    setEditingItem(gap || null);
    setActivePanelType("gap");
  };

  const handleOpenSickLeavePanel = (event?: LifeEvent) => {
    if (isExampleMode) return; // Disable editing in example mode
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
  const birthYear = currentYear - inputs.age;
  const maxYearAge90 = birthYear + 90;

  const handleExitExample = () => {
    router.push("/wynik");
    setIsExampleMode(false);
    setExampleId(null);
  };

  const handleSelectExample = (newExampleId: string) => {
    router.push(`/wynik?example=${newExampleId}`);
  };

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

  // Get current example for educational banner
  const currentExample = exampleId ? getExampleById(exampleId) : null;

  return (
    <>
      <main className="min-h-screen bg-gradient-to-b from-gray-50 to-gray-100">
        <div className="container mx-auto px-4 sm:px-6 lg:px-8 max-w-[1400px] py-8 relative">
          {/* Example Selector - Top Left (only when in example mode) */}
          {isExampleMode && (
            <div className="absolute top-4 left-4 sm:left-6 lg:left-8 z-30">
              <ExampleDropdown
                value={exampleId || ""}
                onChange={handleSelectExample}
              />
            </div>
          )}

          {/* History Button - Top Right of Container */}
          <div className="absolute top-4 right-4 sm:right-6 lg:right-8 z-30">
            <HistoryButton />
          </div>

          <h1 className="text-4xl font-bold text-zus-grey-900 mb-6 text-center">
            Twoja Prognoza Emerytury
          </h1>

          {/* Educational Example Banner */}
          {isExampleMode && currentExample && (
            <div className="mb-6 bg-gradient-to-r from-blue-50 to-indigo-50 border-2 border-blue-200 rounded-lg p-6 shadow-md">
              <div className="flex items-start gap-4">
                <div className="flex-shrink-0 w-12 h-12 bg-blue-100 rounded-full flex items-center justify-center">
                  <span className="text-2xl">📚</span>
                </div>
                <div className="flex-1">
                  <div className="flex items-center gap-2 mb-2">
                    <h2 className="text-xl font-bold text-blue-900">
                      Przykład Edukacyjny: {currentExample.title}
                    </h2>
                    <span className="bg-blue-100 text-blue-800 text-xs font-semibold px-2 py-1 rounded">
                      DEMO
                    </span>
                  </div>
                  <p className="text-sm text-blue-800 mb-3">
                    {currentExample.educationalDescription}
                  </p>
                  <div className="flex gap-3">
                    <Button
                      onClick={handleExitExample}
                      variant="secondary"
                      size="sm"
                    >
                      Wróć do swoich wyników
                    </Button>
                    <Button onClick={() => router.push("/")} size="sm">
                      Stwórz własną symulację
                    </Button>
                  </div>
                </div>
              </div>
            </div>
          )}

          <ComparisonBanner
            pensionDifference={pensionDifference}
            pensionDifferencePercent={pensionDifferencePercent}
          />

          <ResultsKPIs
            results={results}
            inputs={{
              ...inputs,
              employmentPeriods: contractPeriods.length > 0 ? contractPeriods : inputs.employmentPeriods
            }}
            expectedPension={expectedPension}
          />

          <WorkHistorySummary 
            inputs={{
              ...inputs,
              employmentPeriods: contractPeriods.length > 0 ? contractPeriods : inputs.employmentPeriods
            }} 
          />

          <TimelineSection
            contractPeriods={contractPeriods}
            gapPeriods={gapPeriods}
            lifeEvents={lifeEvents}
            currentYear={currentYear}
            workStartYear={inputs.workStartYear}
            workEndYear={inputs.workEndYear}
            onOpenEmploymentPanel={handleOpenEmploymentPanel}
            onOpenGapPanel={handleOpenGapPanel}
            onOpenSickLeavePanel={handleOpenSickLeavePanel}
            inputs={inputs}
            sickImpactConfig={
              data
                ? inputs.sex === "M"
                  ? data.sickImpactM
                  : data.sickImpactF
                : undefined
            }
            onUpdateInputs={updateInputs}
          />

          {/* Growth Scenarios Grid - 2 columns on large screens, stacked on mobile/tablet */}
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 mb-8">
            <DeferralScenarios results={results} />
            <SalaryGrowthImpact
              results={results}
              inputs={inputs}
              modifications={state.dashboardModifications}
            />
          </div>

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
            <Button
              onClick={() => router.push("/raporty")}
              variant="secondary"
              size="lg"
              className="flex-1"
            >
              Zobacz raporty danych
            </Button>
          </div>
        </div>
      </main>

      {/* Example Browser - Floating Button (hidden in example mode) */}
      {!isExampleMode && <ExampleBrowser />}

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
            maxYear={maxYearAge90}
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
            maxYear={maxYearAge90}
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
            maxYear={maxYearAge90}
            onSave={handleSaveSickLeave}
            onDelete={editingItem ? handleDeleteSickLeave : undefined}
            onCancel={handleClosePanel}
          />
        )}
      </TimelinePanelContainer>

      {/* Debug Panel */}
      <DebugPanel
        results={results}
        inputs={inputs}
        expectedPension={expectedPension}
      />
    </>
  );
}

export default function WynikPage() {
  return (
    <Suspense
      fallback={
        <div className="min-h-screen flex items-center justify-center">
          <div className="text-center">
            <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-zus-green mx-auto mb-4"></div>
            <p className="text-zus-grey-600">Ładowanie...</p>
          </div>
        </div>
      }
    >
      <WynikPageContent />
    </Suspense>
  );
}
