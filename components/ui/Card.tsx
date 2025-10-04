import React from "react";
import { cn } from "@/lib/utils";

interface CardProps {
  children: React.ReactNode;
  className?: string;
  variant?: "default" | "highlight" | "warning";
}

export function Card({
  children,
  className = "",
  variant = "default",
}: CardProps) {
  const variantClasses = {
    default:
      "bg-white border-[rgb(190,195,206)] shadow-sm hover:shadow-md transition-shadow",
    highlight: "bg-[rgb(0,153,63)]/5 border-[rgb(0,153,63)] shadow-sm",
    warning: "bg-[rgb(240,94,94)]/5 border-[rgb(240,94,94)] shadow-sm",
  };

  return (
    <div
      className={cn(
        "rounded-lg border-2 p-6",
        variantClasses[variant],
        className
      )}
    >
      {children}
    </div>
  );
}
