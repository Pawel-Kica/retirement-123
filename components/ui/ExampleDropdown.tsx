"use client";

import React, { useState, useRef, useEffect } from "react";
import { ChevronDown, PencilLine } from "lucide-react";
import { EXAMPLE_PERSONAS, ExamplePersona } from "@/lib/data/examples";

interface ExampleDropdownProps {
  value: string;
  onChange: (value: string) => void;
}

export function ExampleDropdown({ value, onChange }: ExampleDropdownProps) {
  const [isOpen, setIsOpen] = useState(false);
  const dropdownRef = useRef<HTMLDivElement>(null);

  const selectedExample = EXAMPLE_PERSONAS.find((ex) => ex.id === value);

  // Close dropdown when clicking outside
  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (
        dropdownRef.current &&
        !dropdownRef.current.contains(event.target as Node)
      ) {
        setIsOpen(false);
      }
    };

    if (isOpen) {
      document.addEventListener("mousedown", handleClickOutside);
    }

    return () => {
      document.removeEventListener("mousedown", handleClickOutside);
    };
  }, [isOpen]);

  const getColorClasses = (color: ExamplePersona["color"]) => {
    switch (color) {
      case "green":
        return {
          bg: "bg-green-100",
          border: "border-green-600",
          text: "text-green-800",
          hoverBg: "hover:bg-green-200",
          icon: "text-green-700",
          iconBg: "bg-green-200",
        };
      case "blue":
        return {
          bg: "bg-blue-100",
          border: "border-blue-600",
          text: "text-blue-800",
          hoverBg: "hover:bg-blue-200",
          icon: "text-blue-700",
          iconBg: "bg-blue-200",
        };
      case "orange":
        return {
          bg: "bg-orange-100",
          border: "border-orange-600",
          text: "text-orange-800",
          hoverBg: "hover:bg-orange-200",
          icon: "text-orange-700",
          iconBg: "bg-orange-200",
        };
      case "red":
        return {
          bg: "bg-red-100",
          border: "border-red-600",
          text: "text-red-800",
          hoverBg: "hover:bg-red-200",
          icon: "text-red-700",
          iconBg: "bg-red-200",
        };
    }
  };

  const handleSelect = (exampleId: string) => {
    onChange(exampleId);
    setIsOpen(false);
  };

  if (!selectedExample) return null;

  const selectedColors = getColorClasses(selectedExample.color);

  return (
    <div ref={dropdownRef} className="relative">
      {/* Dropdown Button */}
      <button
        onClick={() => setIsOpen(!isOpen)}
        className={`${selectedColors.bg} ${
          selectedColors.border
        } border-2 rounded-lg px-4 py-3 shadow-md hover:shadow-lg transition-all duration-200 cursor-pointer focus:outline-none focus:ring-2 focus:ring-offset-2 ${selectedColors.border.replace(
          "border-",
          "focus:ring-"
        )} w-full sm:w-auto min-w-[280px]`}
      >
        <div className="flex items-center justify-between gap-3">
          <div className="flex items-center gap-3">
            {/* Pencil Icon with Number */}
            <div
              className={`${selectedColors.icon} flex items-center justify-center w-8 h-8 ${selectedColors.iconBg} rounded-md border-2 ${selectedColors.border}`}
            >
              <div className="relative">
                <PencilLine className="w-4 h-4" />
                <span className="absolute -top-1 -right-1 text-[10px] font-bold">
                  {selectedExample.id}
                </span>
              </div>
            </div>

            {/* Title */}
            <span className={`${selectedColors.text} font-bold text-sm`}>
              {selectedExample.title}
            </span>
          </div>

          {/* Chevron */}
          <ChevronDown
            className={`w-5 h-5 ${
              selectedColors.icon
            } transition-transform duration-200 ${isOpen ? "rotate-180" : ""}`}
          />
        </div>
      </button>

      {/* Dropdown Menu */}
      {isOpen && (
        <div className="absolute top-full left-0 mt-2 w-full sm:w-[400px] bg-white rounded-lg shadow-xl border-2 border-gray-300 z-50 overflow-hidden">
          <div className="py-1">
            {EXAMPLE_PERSONAS.map((example) => {
              const colors = getColorClasses(example.color);
              const isSelected = example.id === value;

              return (
                <button
                  key={example.id}
                  onClick={() => handleSelect(example.id)}
                  className={`w-full px-4 py-3 flex items-start gap-3 transition-colors cursor-pointer ${
                    colors.hoverBg
                  } ${isSelected ? colors.bg : "bg-white hover:bg-gray-100"}`}
                >
                  {/* Pencil Icon with Number */}
                  <div
                    className={`${colors.icon} flex items-center justify-center w-10 h-10 ${colors.iconBg} rounded-md border-2 ${colors.border} flex-shrink-0`}
                  >
                    <div className="relative">
                      <PencilLine className="w-5 h-5" />
                      <span className="absolute -top-1 -right-1 text-[11px] font-bold bg-white rounded-full w-4 h-4 flex items-center justify-center border border-gray-300">
                        {example.id}
                      </span>
                    </div>
                  </div>

                  {/* Content */}
                  <div className="flex-1 text-left">
                    <h4 className={`${colors.text} font-bold text-sm mb-1`}>
                      {example.title}
                    </h4>
                    <p className="text-xs text-gray-700 leading-relaxed">
                      {example.shortDescription}
                    </p>
                    <div
                      className={`${colors.bg} ${colors.text} text-xs font-semibold px-2 py-1 rounded mt-2 inline-block border ${colors.border}`}
                    >
                      {example.estimatedPensionRange}
                    </div>
                  </div>
                </button>
              );
            })}
          </div>

          {/* Info Footer */}
          <div className="border-t-2 border-gray-200 bg-gray-100 px-4 py-3">
            <p className="text-xs text-gray-700">
              <span className="font-bold">💡 Wskazówka:</span> Wybierz przykład,
              aby zobaczyć szczegółową symulację emerytury
            </p>
          </div>
        </div>
      )}
    </div>
  );
}
