"use client";

import React from "react";

/**
 * SkipLink component
 * Allows keyboard users to skip repetitive navigation
 * WCAG 2.0: Success Criterion 2.4.1 (Bypass Blocks)
 */
export function SkipLink() {
  return (
    <a
      href="#main-content"
      className="absolute -top-96 left-4 z-[9999] bg-zus-green text-white px-6 py-3 rounded-lg font-semibold focus:top-4 transition-all duration-200 focus:outline-none focus:ring-4 focus:ring-zus-green focus:ring-offset-2"
      onClick={(e) => {
        e.preventDefault();
        const mainContent = document.getElementById("main-content");
        if (mainContent) {
          mainContent.focus();
          mainContent.scrollIntoView();
        }
      }}
    >
      Przejdź do głównej treści
    </a>
  );
}
