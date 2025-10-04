"use client";

import { useRouter } from "next/navigation";
import { Button } from "@/components/ui/Button";

interface NewSimulationButtonProps {
  className?: string;
  size?: "sm" | "md" | "lg";
}

export function NewSimulationButton({
  className = "",
  size = "lg",
}: NewSimulationButtonProps) {
  const router = useRouter();
  return (
    <Button
      onClick={() => router.push("/symulacja")}
      variant="primary"
      size={size}
      className={className}
    >
      🔄 Nowa symulacja
    </Button>
  );
}
