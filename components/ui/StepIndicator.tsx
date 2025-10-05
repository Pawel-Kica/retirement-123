import React from "react";

interface Step {
  number: number;
  title: string;
  subtitle?: string;
}

interface StepIndicatorProps {
  steps: Step[];
  currentStep: number;
  completedSteps: number[];
  onStepClick: (stepIndex: number) => void;
}

export function StepIndicator({
  steps,
  currentStep,
  completedSteps,
  onStepClick,
}: StepIndicatorProps) {
  const canNavigateToStep = (stepIndex: number): boolean => {
    return (
      stepIndex === currentStep ||
      completedSteps.includes(stepIndex) ||
      stepIndex < currentStep
    );
  };

  const getStepState = (
    stepIndex: number
  ): "completed" | "current" | "pending" => {
    if (completedSteps.includes(stepIndex)) return "completed";
    if (stepIndex === currentStep) return "current";
    return "pending";
  };

  return (
    <nav className="w-full py-8 px-4" aria-label="Postęp symulacji">
      {/* Desktop horizontal layout */}
      <div className="hidden md:flex items-start justify-between max-w-4xl mx-auto relative" role="list">
        {steps.map((step, index) => {
          const state = getStepState(index);
          const isClickable = canNavigateToStep(index);
          const isLast = index === steps.length - 1;
          const nextStepCompleted = completedSteps.includes(index);

          return (
            <React.Fragment key={step.number}>
              {/* Step Circle and Label */}
              <div className="flex flex-col items-center gap-3 relative z-10 flex-1" role="listitem">
                <button
                  onClick={() => isClickable && onStepClick(index)}
                  disabled={!isClickable}
                  className={`
                    w-14 h-14 rounded-full flex items-center justify-center
                    font-bold text-lg transition-all duration-300 ease-in-out
                    bg-white
                    ${
                      state === "completed"
                        ? "bg-zus-green text-white shadow-lg ring-4 ring-zus-green ring-opacity-30 scale-100 hover:scale-110"
                        : state === "current"
                        ? "text-zus-green border-4 border-zus-green shadow-xl ring-4 ring-zus-green ring-opacity-20 scale-110"
                        : "bg-white text-zus-grey-500 border-3 border-zus-grey-300 shadow-sm"
                    }
                    ${
                      isClickable && state !== "current"
                        ? "cursor-pointer hover:scale-110 hover:shadow-lg"
                        : !isClickable
                        ? "cursor-not-allowed opacity-70"
                        : ""
                    }
                  `}
                  aria-label={`Step ${step.number}: ${step.title}`}
                  aria-current={state === "current" ? "step" : undefined}
                >
                  {state === "completed" ? (
                    <svg
                      className="w-7 h-7"
                      fill="none"
                      stroke="currentColor"
                      viewBox="0 0 24 24"
                    >
                      <path
                        strokeLinecap="round"
                        strokeLinejoin="round"
                        strokeWidth={3}
                        d="M5 13l4 4L19 7"
                      />
                    </svg>
                  ) : (
                    step.number
                  )}
                </button>
                <div className="text-center">
                  <div
                    className={`font-semibold text-sm transition-colors duration-300 ${
                      state === "current"
                        ? "text-zus-green"
                        : state === "completed"
                        ? "text-zus-grey-900"
                        : "text-zus-grey-500"
                    }`}
                  >
                    {step.title}
                  </div>
                  {step.subtitle && (
                    <div className="text-xs text-zus-grey-500 mt-1">
                      {step.subtitle}
                    </div>
                  )}
                </div>
              </div>

              {/* Connecting Line */}
              {!isLast && (
                <div
                  className="flex items-center"
                  style={{
                    width: "100px",
                    marginTop: "28px",
                    marginLeft: "-12px",
                    marginRight: "-12px",
                    position: "relative",
                    zIndex: 0,
                  }}
                >
                  <div
                    className={`flex-1 h-0.5 transition-colors duration-300 ${
                      nextStepCompleted ? "bg-zus-green" : "bg-gray-400"
                    }`}
                  />
                  <div
                    className={`w-0 h-0 border-l-[12px] border-t-[6px] border-b-[6px] border-t-transparent border-b-transparent transition-colors duration-300 ${
                      nextStepCompleted
                        ? "border-l-zus-green"
                        : "border-l-gray-400"
                    }`}
                  />
                </div>
              )}
            </React.Fragment>
          );
        })}
      </div>

      {/* Mobile vertical layout */}
      <div className="md:hidden space-y-0" role="list">
        {steps.map((step, index) => {
          const state = getStepState(index);
          const isClickable = canNavigateToStep(index);
          const isLast = index === steps.length - 1;
          const nextStepCompleted = completedSteps.includes(index);

          return (
            <div key={step.number} className="relative" role="listitem">
              <div className="flex items-start gap-4">
                {/* Step Circle with connecting line */}
                <div className="flex flex-col items-center relative">
                  <button
                    onClick={() => isClickable && onStepClick(index)}
                    disabled={!isClickable}
                    className={`
                      flex-shrink-0 w-12 h-12 rounded-full flex items-center justify-center
                      font-bold text-base transition-all duration-300 ease-in-out bg-white
                      ${
                        state === "completed"
                          ? "bg-zus-green text-white shadow-lg ring-4 ring-zus-green ring-opacity-30"
                          : state === "current"
                          ? "text-zus-green border-3 border-zus-green shadow-lg ring-4 ring-zus-green ring-opacity-20 scale-105"
                          : "text-zus-grey-500 border-2 border-zus-grey-300 shadow-sm"
                      }
                      ${
                        isClickable && state !== "current"
                          ? "cursor-pointer hover:scale-105"
                          : !isClickable
                          ? "cursor-not-allowed opacity-70"
                          : ""
                      }
                    `}
                    aria-label={`Step ${step.number}: ${step.title}`}
                    aria-current={state === "current" ? "step" : undefined}
                  >
                    {state === "completed" ? (
                      <svg
                        className="w-6 h-6"
                        fill="none"
                        stroke="currentColor"
                        viewBox="0 0 24 24"
                      >
                        <path
                          strokeLinecap="round"
                          strokeLinejoin="round"
                          strokeWidth={3}
                          d="M5 13l4 4L19 7"
                        />
                      </svg>
                    ) : (
                      step.number
                    )}
                  </button>

                  {/* Vertical connecting line */}
                  {!isLast && (
                    <div className="flex flex-col items-center mt-2">
                      <div
                        className={`w-0.5 h-12 transition-colors duration-300 ${
                          nextStepCompleted ? "bg-zus-green" : "bg-gray-400"
                        }`}
                      />
                      <div
                        className={`w-0 h-0 border-t-[12px] border-l-[6px] border-r-[6px] border-l-transparent border-r-transparent transition-colors duration-300 ${
                          nextStepCompleted
                            ? "border-t-zus-green"
                            : "border-t-gray-400"
                        }`}
                      />
                    </div>
                  )}
                </div>

                {/* Step Info */}
                <div className="flex-1 pt-2 pb-6">
                  <div
                    className={`font-semibold text-base transition-colors duration-300 ${
                      state === "current"
                        ? "text-zus-green"
                        : state === "completed"
                        ? "text-zus-grey-900"
                        : "text-zus-grey-500"
                    }`}
                  >
                    {step.title}
                  </div>
                  {step.subtitle && (
                    <div className="text-sm text-zus-grey-500 mt-1">
                      {step.subtitle}
                    </div>
                  )}
                </div>
              </div>
            </div>
          );
        })}
      </div>
    </nav>
  );
}
