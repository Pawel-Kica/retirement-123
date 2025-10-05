"use client";

import React, { useEffect, useRef } from "react";

interface LiveRegionProps {
  message: string;
  politeness?: "polite" | "assertive" | "off";
  clearOnUnmount?: boolean;
}

/**
 * LiveRegion component
 * Announces dynamic content changes to screen readers
 * WCAG 2.0: Success Criterion 4.1.3 (Status Messages)
 */
export function LiveRegion({
  message,
  politeness = "polite",
  clearOnUnmount = true,
}: LiveRegionProps) {
  const regionRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (regionRef.current && message) {
      // Clear and re-announce to ensure screen readers pick it up
      regionRef.current.textContent = "";
      setTimeout(() => {
        if (regionRef.current) {
          regionRef.current.textContent = message;
        }
      }, 100);
    }

    return () => {
      if (clearOnUnmount && regionRef.current) {
        regionRef.current.textContent = "";
      }
    };
  }, [message, clearOnUnmount]);

  return (
    <div
      ref={regionRef}
      role={politeness === "off" ? undefined : "status"}
      aria-live={politeness}
      aria-atomic="true"
      style={{
        position: "absolute",
        width: "1px",
        height: "1px",
        padding: "0",
        margin: "-1px",
        overflow: "hidden",
        clip: "rect(0, 0, 0, 0)",
        whiteSpace: "nowrap",
        border: "0",
      }}
    />
  );
}
