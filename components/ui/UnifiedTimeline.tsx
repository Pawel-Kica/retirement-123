import React from "react";

interface TimelineEvent {
  year: number;
  label: string;
  icon: string;
  color: "grey" | "green" | "navy" | "orange";
  isPast?: boolean;
  isCurrent?: boolean;
  isFuture?: boolean;
  subLabel?: string;
  age?: number;
}

interface UnifiedTimelineProps {
  startYear?: number;
  endYear?: number;
  currentYear: number;
  age?: number;
  variant?: "work-start" | "work-end" | "full";
}

export function UnifiedTimeline({
  startYear,
  endYear,
  currentYear,
  age,
  variant = "full",
}: UnifiedTimelineProps) {
  const yearsWorked = startYear ? Math.max(0, currentYear - startYear) : 0;
  const yearsToRetirement = endYear ? Math.max(0, endYear - currentYear) : 0;
  const totalYears = startYear && endYear ? endYear - startYear : 0;
  const yearTurned18 = age ? currentYear - age + 18 : undefined;

  // Color mapping
  const colorClasses = {
    grey: {
      bg: "bg-zus-grey-300",
      text: "text-zus-grey-700",
      border: "border-zus-grey-300",
    },
    green: {
      bg: "bg-zus-green",
      text: "text-zus-green",
      border: "border-zus-green",
    },
    navy: {
      bg: "bg-zus-navy",
      text: "text-zus-navy",
      border: "border-zus-navy",
    },
    orange: {
      bg: "bg-zus-orange",
      text: "text-zus-orange",
      border: "border-zus-orange",
    },
  };

  // Build timeline events based on variant
  const buildEvents = (): TimelineEvent[] => {
    const events: TimelineEvent[] = [];

    if (variant === "work-start" || variant === "full") {
      // Add year turned 18 if available
      if (yearTurned18 && age) {
        events.push({
          year: yearTurned18,
          label: "Ukończenie 18 lat",
          icon: "🎓",
          color: "grey",
          isPast: true,
          subLabel: `Rok ${yearTurned18}`,
          age: 18,
        });
      }

      // Add work start year
      if (startYear && age) {
        const ageAtWorkStart = yearTurned18
          ? 18 + (startYear - yearTurned18)
          : undefined;
        events.push({
          year: startYear,
          label: "Początek pracy",
          icon: "💼",
          color: "green",
          isPast: startYear < currentYear,
          subLabel: `Rok ${startYear}`,
          age: ageAtWorkStart,
        });
      }
    }

    // Add current year
    if (
      variant === "full" ||
      variant === "work-start" ||
      variant === "work-end"
    ) {
      if (startYear && startYear <= currentYear && age) {
        const currentAge = age;
        const yearsLabel =
          yearsWorked === 1 ? "rok" : yearsWorked < 5 ? "lata" : "lat";

        events.push({
          year: currentYear,
          label: "Dzisiaj",
          icon: "📍",
          color: "navy",
          isCurrent: true,
          subLabel:
            yearsWorked > 0
              ? `Rok ${currentYear} • ✓ ${yearsWorked} ${yearsLabel} stażu`
              : `Rok ${currentYear}`,
          age: currentAge,
        });
      }
    }

    // Add retirement year
    if (variant === "work-end" || variant === "full") {
      if (endYear && age) {
        const retirementAge = age + (endYear - currentYear);
        const totalYearsWorked = startYear ? endYear - startYear : 0;
        const totalYearsLabel =
          totalYearsWorked > 0
            ? `Rok ${endYear} • 📊 Łącznie: ${totalYearsWorked} ${
                totalYearsWorked === 1
                  ? "rok"
                  : totalYearsWorked < 5
                  ? "lata"
                  : "lat"
              } pracy`
            : `Rok ${endYear}`;

        events.push({
          year: endYear,
          label: "Planowana emerytura",
          icon: "🏖️",
          color: "orange",
          isFuture: true,
          subLabel: totalYearsLabel,
          age: retirementAge,
        });
      }
    }

    return events;
  };

  const events = buildEvents();

  // Build header metric - component-like structure
  const buildHeaderMetric = () => {
    if (variant === "work-start") {
      return {
        icon: "📅",
        number: yearsWorked,
        label: yearsWorked === 1 ? "rok" : yearsWorked < 5 ? "lata" : "lat",
        suffix: "przepracowanych",
        color: "text-zus-green",
        bgColor: "bg-zus-green-light",
      };
    }

    if (variant === "work-end") {
      return {
        icon: "🎯",
        number: yearsToRetirement,
        label:
          yearsToRetirement === 1
            ? "rok"
            : yearsToRetirement < 5
            ? "lata"
            : "lat",
        suffix: "do emerytury",
        color: "text-zus-orange",
        bgColor: "bg-zus-green-light",
      };
    }

    // Full variant
    return {
      icon: "📊",
      number: totalYears,
      label: totalYears === 1 ? "rok" : totalYears < 5 ? "lata" : "lat",
      suffix: "kariery zawodowej",
      color: "text-zus-green",
      bgColor: "bg-zus-green-light",
    };
  };

  const headerMetric = buildHeaderMetric();

  // Header Metric Component
  const HeaderMetric = ({
    icon,
    number,
    label,
    suffix,
    color,
  }: {
    icon: string;
    number: number;
    label: string;
    suffix: string;
    color: string;
  }) => (
    <div className="flex items-baseline gap-2">
      <div className="text-2xl">{icon}</div>
      <p className={`text-3xl font-bold ${color}`}>{number}</p>
      <p className="text-sm text-zus-grey-700 font-medium whitespace-nowrap">
        {label} {suffix}
      </p>
    </div>
  );

  return (
    <div className="flex flex-col gap-3 p-4 bg-zus-green-light rounded-lg w-full transition-all duration-200 min-w-0">
      {/* Header with main metric */}
      <HeaderMetric
        icon={headerMetric.icon}
        number={headerMetric.number}
        label={headerMetric.label}
        suffix={headerMetric.suffix}
        color={headerMetric.color}
      />

      {/* Timeline Events */}
      {events.length > 0 && (
        <div className="space-y-2 pt-2 border-t border-zus-green/20">
          {events.map((event, index) => {
            const colors = colorClasses[event.color];
            const isLast = index === events.length - 1;

            return (
              <React.Fragment key={`${event.year}-${event.label}`}>
                {/* Event Item */}
                <div className="flex items-start gap-2">
                  <div
                    className={`flex-shrink-0 w-8 h-8 rounded-full ${colors.bg} flex items-center justify-center shadow-sm`}
                  >
                    <span className="text-xs">{event.icon}</span>
                  </div>
                  <div className="flex-1 min-w-0">
                    <p className="text-sm font-semibold text-zus-grey-900">
                      {event.label}
                      {event.age && (
                        <span className="font-normal text-zus-grey-700">
                          {" "}
                          ({event.age}{" "}
                          {event.age === 1
                            ? "rok"
                            : event.age < 5 && event.age > 1
                            ? "lata"
                            : "lat"}
                          )
                        </span>
                      )}
                    </p>
                    {event.subLabel && (
                      <p
                        className={`text-xs ${
                          event.isCurrent
                            ? "text-zus-green font-semibold"
                            : "text-zus-grey-600"
                        }`}
                      >
                        {event.subLabel}
                      </p>
                    )}
                  </div>
                </div>

                {/* Connector line with arrow */}
                {!isLast && (
                  <div className="ml-4 flex items-center gap-1">
                    <div
                      className={`h-6 border-l-2 border-dashed ${
                        event.isPast || event.isCurrent
                          ? "border-zus-green/40"
                          : "border-zus-orange/30"
                      }`}
                    ></div>
                    <svg
                      className={`w-3 h-3 -ml-1 ${
                        event.isPast || event.isCurrent
                          ? "text-zus-green/40"
                          : "text-zus-orange/30"
                      }`}
                      fill="currentColor"
                      viewBox="0 0 20 20"
                    >
                      <path
                        fillRule="evenodd"
                        d="M14.707 12.707a1 1 0 01-1.414 0L10 9.414l-3.293 3.293a1 1 0 01-1.414-1.414l4-4a1 1 0 011.414 0l4 4a1 1 0 010 1.414z"
                        clipRule="evenodd"
                        transform="rotate(180 10 10)"
                      />
                    </svg>
                  </div>
                )}
              </React.Fragment>
            );
          })}
        </div>
      )}

      {/* Progress bar for full variant */}
      {variant === "full" && startYear && endYear && totalYears > 0 && (
        <div className="pt-3 border-t border-zus-green/20">
          <div className="relative h-3 bg-zus-grey-300 rounded-full overflow-hidden">
            <div
              className="absolute h-full bg-gradient-to-r from-zus-green to-zus-green-dark transition-all duration-500 rounded-full"
              style={{
                width: `${(yearsWorked / totalYears) * 100}%`,
              }}
            />
          </div>
          <div className="flex justify-between mt-2 text-xs">
            <span className="text-zus-green font-semibold">
              {yearsWorked} {yearsWorked === 1 ? "rok" : "lat"}
            </span>
            <span className="text-zus-grey-600">
              {yearsToRetirement} {yearsToRetirement === 1 ? "rok" : "lat"}{" "}
              pozostało
            </span>
          </div>
        </div>
      )}
    </div>
  );
}
