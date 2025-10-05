"use client";

import { Button } from "@/components/ui/Button";

interface CTAButtonProps {
  onClick: () => void;
  children: React.ReactNode;
  size?: "sm" | "md" | "lg";
  className?: string;
}

export function CTAButton({ 
  onClick, 
  children, 
  size = "lg",
  className = "" 
}: CTAButtonProps) {
  return (
    <Button
      onClick={onClick}
      variant="success"
      size={size}
      className={`w-full md:w-auto px-12 py-5 text-xl font-bold shadow-xl hover:shadow-2xl transform hover:scale-105 transition-all duration-200 ${className}`}
    >
      {children}
    </Button>
  );
}

