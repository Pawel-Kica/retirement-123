import React from "react";

interface VisuallyHiddenProps {
  children: React.ReactNode;
  as?: "span" | "div" | "p";
}

/**
 * VisuallyHidden component
 * Hides content visually but keeps it accessible to screen readers
 * WCAG 2.0: Technique for providing text alternatives
 */
export function VisuallyHidden({
  children,
  as: Component = "span",
}: VisuallyHiddenProps) {
  return (
    <Component
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
    >
      {children}
    </Component>
  );
}
