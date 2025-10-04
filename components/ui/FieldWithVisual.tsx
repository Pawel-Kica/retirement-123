import React from "react";

interface FieldWithVisualProps {
  children: React.ReactNode;
  visual: React.ReactNode;
}

export function FieldWithVisual({ children, visual }: FieldWithVisualProps) {
  return (
    <div className="flex flex-col md:flex-row gap-3 items-start">
      <div className="w-full md:w-[70%]">{children}</div>
      <div className="w-full md:w-[30%] flex items-center justify-center">
        {visual}
      </div>
    </div>
  );
}
