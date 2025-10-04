"use client";

import { useRouter } from "next/navigation";
import { Button } from "@/components/ui/Button";
import { useSimulation } from "@/lib/context/SimulationContext";

interface NewSimulationButtonProps {
  className?: string;
  size?: "sm" | "md" | "lg";
}

export function NewSimulationButton({
  className = "",
  size = "lg",
}: NewSimulationButtonProps) {
  const router = useRouter();
  const { startNewSimulation } = useSimulation();

  const handleNewSimulation = () => {
    startNewSimulation();
    router.push("/symulacja");
  };

  return (
    <Button
      onClick={handleNewSimulation}
      variant="primary"
      size={size}
      className={className}
    >
      🔄 Nowa symulacja
    </Button>
  );
}
