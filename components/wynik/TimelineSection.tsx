import { useState } from "react";
import { Button } from "@/components/ui/Button";
import { Card } from "@/components/ui/Card";
import { EnhancedCareerTimeline } from "@/components/ui/EnhancedCareerTimeline";
import {
  FileText,
  Briefcase,
  Baby,
  Activity,
  ChevronDown,
  ChevronUp,
} from "lucide-react";
import { LuBanknote, LuHeartPulse } from "react-icons/lu";
import { formatPLN } from "@/lib/utils/formatting";
import type {
  EmploymentPeriod,
  EmploymentGapPeriod,
  LifeEvent,
  SimulationInputs,
} from "@/lib/types";

interface TimelineSectionProps {
  contractPeriods: EmploymentPeriod[];
  gapPeriods: EmploymentGapPeriod[];
  lifeEvents: LifeEvent[];
  currentYear: number;
  workStartYear: number;
  workEndYear: number;
  onOpenEmploymentPanel: (period?: EmploymentPeriod) => void;
  onOpenGapPanel: (gap?: EmploymentGapPeriod) => void;
  onOpenSickLeavePanel: (event?: LifeEvent) => void;
  inputs?: SimulationInputs;
  sickImpactConfig?: any;
  onUpdateInputs?: (updates: Partial<SimulationInputs>) => void;
}

export function TimelineSection({
  contractPeriods,
  gapPeriods,
  lifeEvents,
  currentYear,
  workStartYear,
  workEndYear,
  onOpenEmploymentPanel,
  onOpenGapPanel,
  onOpenSickLeavePanel,
  inputs,
  sickImpactConfig,
  onUpdateInputs,
}: TimelineSectionProps) {
  const [showEventsSection, setShowEventsSection] = useState(true);
  const totalEvents =
    contractPeriods.length + gapPeriods.length + lifeEvents.length;

  return (
    <Card className="mb-8">
      <div className="grid grid-cols-1 lg:grid-cols-[1fr_280px] gap-6">
        {/* Left side - Timeline */}
        <div>
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
              onClick={() => onOpenEmploymentPanel()}
              variant="success"
              className="flex items-center gap-2"
            >
              <Briefcase className="w-4 h-4" />
              Dodaj Pracę
            </Button>
            <Button
              onClick={() => onOpenGapPanel()}
              variant="secondary"
              className="flex items-center gap-2"
            >
              <Baby className="w-4 h-4" />
              Dodaj Urlop/Przerwę
            </Button>
            <Button
              onClick={() => onOpenSickLeavePanel()}
              className="flex items-center gap-2 bg-zus-error hover:bg-red-700 text-white"
            >
              <Activity className="w-4 h-4" />
              Dodaj Długie zwolnienie zdrowotne
            </Button>
          </div>

          {/* Enhanced Timeline */}
          <EnhancedCareerTimeline
            contractPeriods={contractPeriods}
            gapPeriods={gapPeriods}
            lifeEvents={lifeEvents}
            currentYear={currentYear}
            workStartYear={workStartYear}
            workEndYear={workEndYear}
            onEditEmployment={onOpenEmploymentPanel}
            onEditGap={onOpenGapPanel}
            onEditSickLeave={onOpenSickLeavePanel}
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
                      onClick={() => onOpenEmploymentPanel(period)}
                    >
                      <div className="flex items-center gap-3">
                        <Briefcase className="w-5 h-5 text-zus-green" />
                        <div>
                          <p className="font-semibold text-sm text-zus-grey-900">
                            {period.contractType} - {formatPLN(period.monthlyGross)}
                          </p>
                          <p className="text-xs text-zus-grey-600">
                            {period.startYear} - {period.endYear}
                            {period.annualRaisePercentage !== undefined &&
                              period.annualRaisePercentage !== 1 && (
                              <span className="ml-1">
                                • <span className="text-zus-blue font-semibold">+{period.annualRaisePercentage}%/rok</span>
                              </span>
                            )}
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
                      onClick={() => onOpenGapPanel(gap)}
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
                            {gap.startMonth}/{gap.startYear} ({gap.durationMonths}{" "}
                            miesięcy)
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
                      onClick={() => onOpenSickLeavePanel(event)}
                    >
                      <div className="flex items-center gap-3">
                        <Activity className="w-5 h-5 text-zus-error" />
                        <div>
                          <p className="font-semibold text-sm text-zus-grey-900">
                            Długie zwolnienie zdrowotne
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
        </div>

        {/* Right side - Additional Info */}
        {inputs && sickImpactConfig && onUpdateInputs && (
          <div className="lg:border-l lg:border-zus-grey-300 lg:pl-6">
            <div className="sticky top-4">
              <h3 className="text-sm font-bold text-zus-grey-900 mb-3">
                Dodatkowe informacje
              </h3>

              <div className="space-y-3">
                {/* Account Balances */}
                <div className="p-3 bg-gray-50 rounded border border-zus-grey-300">
                  <label className="text-xs font-semibold text-zus-grey-700 mb-2 block">
                    <LuBanknote className="inline w-3 h-3 mr-1" />
                    Konto podstawowe
                  </label>
                  <div className="relative">
                    <input
                      type="number"
                      min={0}
                      step={0.01}
                      value={inputs.accountBalance !== undefined ? inputs.accountBalance : ""}
                      onChange={(e) =>
                        onUpdateInputs({
                          accountBalance: e.target.value !== "" ? Number(e.target.value) : undefined,
                        })
                      }
                      placeholder="0"
                      className="w-full px-2 py-1.5 pr-8 text-sm border border-zus-grey-300 rounded focus:outline-none focus:ring-1 focus:ring-zus-green"
                    />
                    <span className="absolute right-2 top-1/2 -translate-y-1/2 text-xs text-zus-grey-500">
                      zł
                    </span>
                  </div>
                </div>

                <div className="p-3 bg-gray-50 rounded border border-zus-grey-300">
                  <label className="text-xs font-semibold text-zus-grey-700 mb-2 block">
                    <LuBanknote className="inline w-3 h-3 mr-1" />
                    Subkonto (OFE)
                  </label>
                  <div className="relative">
                    <input
                      type="number"
                      min={0}
                      step={0.01}
                      value={inputs.subAccountBalance !== undefined ? inputs.subAccountBalance : ""}
                      onChange={(e) =>
                        onUpdateInputs({
                          subAccountBalance: e.target.value !== "" ? Number(e.target.value) : undefined,
                        })
                      }
                      placeholder="0"
                      className="w-full px-2 py-1.5 pr-8 text-sm border border-zus-grey-300 rounded focus:outline-none focus:ring-1 focus:ring-zus-green"
                    />
                    <span className="absolute right-2 top-1/2 -translate-y-1/2 text-xs text-zus-grey-500">
                      zł
                    </span>
                  </div>
                </div>

                {/* Retirement Programs */}
                <div className="p-3 bg-gray-50 rounded border border-zus-grey-300">
                  <label className="text-xs font-semibold text-zus-grey-700 mb-2 block">
                    Programy emerytalne
                  </label>
                  <div className="space-y-2">
                    <label className="flex items-center gap-1.5 cursor-pointer">
                      <input
                        type="checkbox"
                        checked={inputs.retirementPrograms?.ppk.enabled || false}
                        onChange={(e) =>
                          onUpdateInputs({
                            retirementPrograms: {
                              ...inputs.retirementPrograms,
                              ppk: {
                                ...(inputs.retirementPrograms?.ppk || {
                                  employeeRate: 0.02,
                                  employerRate: 0.015,
                                }),
                                enabled: e.target.checked,
                              },
                              ikze: inputs.retirementPrograms?.ikze || {
                                enabled: false,
                                contributionRate: 0.1,
                              },
                            },
                          })
                        }
                        className="w-3 h-3 accent-zus-blue"
                      />
                      <span className="text-xs font-semibold text-zus-grey-900">PPK</span>
                      <span className="px-1 py-0.5 bg-zus-blue/10 text-zus-blue text-[10px] font-bold rounded">
                        +3.5%
                      </span>
                    </label>

                    <label className="flex items-center gap-1.5 cursor-pointer">
                      <input
                        type="checkbox"
                        checked={inputs.retirementPrograms?.ikze.enabled || false}
                        onChange={(e) =>
                          onUpdateInputs({
                            retirementPrograms: {
                              ppk: inputs.retirementPrograms?.ppk || {
                                enabled: false,
                                employeeRate: 0.02,
                                employerRate: 0.015,
                              },
                              ikze: {
                                ...(inputs.retirementPrograms?.ikze || {
                                  contributionRate: 0.1,
                                }),
                                enabled: e.target.checked,
                              },
                            },
                          })
                        }
                        className="w-3 h-3 accent-zus-orange"
                      />
                      <span className="text-xs font-semibold text-zus-grey-900">IKZE</span>
                      <span className="px-1 py-0.5 bg-zus-orange/10 text-zus-orange text-[10px] font-bold rounded">
                        +10%
                      </span>
                    </label>
                  </div>
                </div>

                {/* Sick Leave */}
                <div className="p-3 bg-gray-50 rounded border border-zus-grey-300">
                  <label className="flex items-start gap-1.5 cursor-pointer">
                    <input
                      type="checkbox"
                      checked={inputs.includeZwolnienieZdrowotne || false}
                      onChange={(e) =>
                        onUpdateInputs({
                          includeZwolnienieZdrowotne: e.target.checked,
                        })
                      }
                      className="w-3 h-3 mt-0.5 accent-zus-error"
                    />
                    <div className="flex-1">
                      <div className="flex items-center gap-1 mb-1">
                        <LuHeartPulse className="w-3 h-3 text-zus-error" />
                        <span className="text-xs font-semibold text-zus-grey-900">
                          Zwolnienia
                        </span>
                      </div>
                      <span className="text-[10px] text-zus-grey-600">
                        ~{sickImpactConfig?.avgDaysPerYear || 0} dni/rok,
                        -{((1 - (sickImpactConfig?.reductionCoefficient || 1)) * 100).toFixed(1)}%
                      </span>
                    </div>
                  </label>
                </div>
              </div>
            </div>
          </div>
        )}
      </div>
    </Card>
  );
}
