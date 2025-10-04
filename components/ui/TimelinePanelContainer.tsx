import React, { useEffect, useState } from "react";
import { EmploymentPeriod, EmploymentGapPeriod, LifeEvent } from "@/lib/types";
import { X } from "lucide-react";

export type PanelType = "employment" | "gap" | "sick" | null;

interface TimelinePanelContainerProps {
  isOpen: boolean;
  panelType: PanelType;
  editingItem: EmploymentPeriod | EmploymentGapPeriod | LifeEvent | null;
  onClose: () => void;
  children: React.ReactNode;
}

export function TimelinePanelContainer({
  isOpen,
  panelType,
  editingItem,
  onClose,
  children,
}: TimelinePanelContainerProps) {
  const [isAnimating, setIsAnimating] = useState(false);
  const [shouldRender, setShouldRender] = useState(false);

  useEffect(() => {
    if (isOpen) {
      setShouldRender(true);
      setTimeout(() => setIsAnimating(true), 10);
    } else {
      setIsAnimating(false);
      const timer = setTimeout(() => setShouldRender(false), 300);
      return () => clearTimeout(timer);
    }
  }, [isOpen]);

  useEffect(() => {
    const handleEscape = (e: KeyboardEvent) => {
      if (e.key === "Escape" && isOpen) {
        onClose();
      }
    };

    if (isOpen) {
      document.addEventListener("keydown", handleEscape);
      document.body.style.overflow = "hidden";
    }

    return () => {
      document.removeEventListener("keydown", handleEscape);
      document.body.style.overflow = "unset";
    };
  }, [isOpen, onClose]);

  if (!shouldRender) return null;

  const getPanelTitle = () => {
    if (!panelType) return "";

    if (editingItem) {
      switch (panelType) {
        case "employment":
          return "Edytuj okres zatrudnienia";
        case "gap":
          return "Edytuj przerwę w karierze";
        case "sick":
          return "Edytuj zwolnienie lekarskie";
        default:
          return "";
      }
    } else {
      switch (panelType) {
        case "employment":
          return "Dodaj okres zatrudnienia";
        case "gap":
          return "Dodaj przerwę w karierze";
        case "sick":
          return "Dodaj zwolnienie lekarskie";
        default:
          return "";
      }
    }
  };

  return (
    <>
      {/* Overlay */}
      <div
        className={`fixed inset-0 bg-black/50 z-40 transition-opacity duration-300 ${
          isAnimating ? "opacity-100" : "opacity-0"
        }`}
        onClick={onClose}
      />

      {/* Side Panel */}
      <div
        className={`fixed top-0 right-0 h-full w-full md:w-[500px] bg-white shadow-2xl z-50 
                   overflow-y-auto transition-transform duration-300 ease-out ${
                     isAnimating ? "translate-x-0" : "translate-x-full"
                   }`}
      >
        {/* Header */}
        <div className="sticky top-0 bg-zus-green p-6 flex items-center justify-between border-b-4 border-zus-green-dark z-10">
          <h2 className="text-2xl font-bold text-white">{getPanelTitle()}</h2>
          <button
            onClick={onClose}
            className="w-10 h-10 rounded-full bg-white/20 hover:bg-white/30 flex items-center justify-center 
                       transition-colors focus:outline-none focus:ring-2 focus:ring-white"
            aria-label="Zamknij"
          >
            <X className="w-6 h-6 text-white" />
          </button>
        </div>

        {/* Content */}
        <div className="p-6">{children}</div>
      </div>
    </>
  );
}
