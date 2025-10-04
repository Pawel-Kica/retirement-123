"use client";

import React, { useState, useRef, useEffect } from "react";
import { cn } from "@/lib/utils";

interface TooltipProps {
  content: string;
  children: React.ReactNode;
  className?: string;
}

export function Tooltip({ content, children, className }: TooltipProps) {
  const [isVisible, setIsVisible] = useState(false);
  const [position, setPosition] = useState<"top" | "bottom">("top");
  const tooltipRef = useRef<HTMLDivElement>(null);
  const triggerRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (isVisible && tooltipRef.current && triggerRef.current) {
      const tooltipRect = tooltipRef.current.getBoundingClientRect();
      const triggerRect = triggerRef.current.getBoundingClientRect();

      // Check if tooltip would overflow at the top
      if (triggerRect.top < tooltipRect.height + 8) {
        setPosition("bottom");
      } else {
        setPosition("top");
      }
    }
  }, [isVisible]);

  const handleToggle = () => {
    setIsVisible(!isVisible);
  };

  const handleClose = () => {
    setIsVisible(false);
  };

  return (
    <div className={cn("relative inline-block", className)}>
      <div
        ref={triggerRef}
        onMouseEnter={() => setIsVisible(true)}
        onMouseLeave={() => setIsVisible(false)}
        onClick={handleToggle}
        className="cursor-help touch-manipulation"
        role="button"
        aria-label="Więcej informacji"
        tabIndex={0}
        onKeyDown={(e) => {
          if (e.key === "Enter" || e.key === " ") {
            e.preventDefault();
            handleToggle();
          }
          if (e.key === "Escape") {
            handleClose();
          }
        }}
      >
        {children}
      </div>
      {isVisible && (
        <>
          {/* Mobile backdrop */}
          <div
            className="fixed inset-0 z-40 md:hidden"
            onClick={handleClose}
            aria-hidden="true"
          />

          {/* Tooltip */}
          <div
            ref={tooltipRef}
            className={cn(
              "absolute z-50 px-4 py-3 bg-zus-navy text-white text-sm rounded-lg shadow-xl",
              "animate-in fade-in-0 zoom-in-95 duration-200",
              "w-[calc(100vw-2rem)] sm:w-[400px] md:w-[480px] lg:w-[520px]",
              "max-w-[calc(100vw-2rem)]",
              "leading-relaxed",
              position === "top"
                ? "bottom-full mb-2 left-1/2 -translate-x-1/2"
                : "top-full mt-2 left-1/2 -translate-x-1/2"
            )}
            style={{
              // Ensure tooltip doesn't overflow screen edges
              left: "50%",
              transform: "translateX(-50%)",
            }}
            role="tooltip"
          >
            {content}

            {/* Arrow */}
            <div
              className={cn(
                "absolute left-1/2 -translate-x-1/2",
                position === "top" ? "top-full -mt-1" : "bottom-full -mb-1"
              )}
            >
              <div
                className={cn(
                  "border-[6px] border-transparent",
                  position === "top" ? "border-t-zus-navy" : "border-b-zus-navy"
                )}
              />
            </div>

            {/* Close button for mobile */}
            <button
              onClick={(e) => {
                e.stopPropagation();
                handleClose();
              }}
              className="absolute top-2 right-2 w-6 h-6 flex items-center justify-center text-white/80 hover:text-white md:hidden rounded-full hover:bg-white/10 transition-colors"
              aria-label="Zamknij"
            >
              <svg
                className="w-4 h-4"
                fill="none"
                stroke="currentColor"
                viewBox="0 0 24 24"
              >
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth={2}
                  d="M6 18L18 6M6 6l12 12"
                />
              </svg>
            </button>
          </div>
        </>
      )}
    </div>
  );
}
