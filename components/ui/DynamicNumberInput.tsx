import React, { useRef, useEffect, useState } from "react";

interface DynamicNumberInputProps {
  value: number;
  onChange: (value: number) => void;
  min: number;
  max: number;
  step?: number;
  suffix?: string;
  className?: string;
  onBlur?: () => void;
}

export function DynamicNumberInput({
  value,
  onChange,
  min,
  max,
  step = 1,
  suffix = "zł",
  className = "",
  onBlur,
}: DynamicNumberInputProps) {
  const [inputValue, setInputValue] = useState(value.toLocaleString("pl-PL"));
  const [width, setWidth] = useState(100);
  const measureRef = useRef<HTMLSpanElement>(null);
  const inputRef = useRef<HTMLInputElement>(null);

  useEffect(() => {
    setInputValue(value.toLocaleString("pl-PL"));
  }, [value]);

  useEffect(() => {
    if (measureRef.current) {
      const textWidth = measureRef.current.offsetWidth;
      const suffixWidth = suffix ? 20 : 0;
      const minWidth = 100;
      const maxWidth = 300;
      const padding = 16;
      const calculatedWidth = Math.min(
        maxWidth,
        Math.max(minWidth, textWidth + suffixWidth + padding)
      );
      setWidth(calculatedWidth);
    }
  }, [inputValue, suffix]);

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const val = e.target.value;
    // Only allow digits and spaces
    const filteredVal = val.replace(/[^\d\s]/g, "");
    const cleanVal = filteredVal.replace(/\s/g, "").trim();
    setInputValue(filteredVal);

    const numVal = Number(cleanVal);
    if (!isNaN(numVal) && cleanVal !== "") {
      onChange(numVal);
    }
  };

  const handleBlur = () => {
    const cleanVal = inputValue.replace(/\s/g, "").replace(/zł/g, "").trim();
    const numVal = Number(cleanVal);

    if (isNaN(numVal) || cleanVal === "") {
      setInputValue(min.toLocaleString("pl-PL"));
      onChange(min);
    } else {
      const clampedValue = Math.max(min, Math.min(max, numVal));
      const roundedValue = Math.round(clampedValue / step) * step;
      setInputValue(roundedValue.toLocaleString("pl-PL"));
      onChange(roundedValue);
    }
    onBlur?.();
  };

  const handleFocus = (e: React.FocusEvent<HTMLInputElement>) => {
    const cleanVal = inputValue.replace(/\s/g, "");
    setInputValue(cleanVal);
    setTimeout(() => e.target.select(), 0);
  };

  const handleKeyDown = (e: React.KeyboardEvent<HTMLInputElement>) => {
    if (e.key === "ArrowUp") {
      e.preventDefault();
      const newValue = Math.min(max, value + step);
      onChange(newValue);
    } else if (e.key === "ArrowDown") {
      e.preventDefault();
      const newValue = Math.max(min, value - step);
      onChange(newValue);
    } else if (e.key === "Enter") {
      inputRef.current?.blur();
    }
  };

  return (
    <div className="relative inline-flex items-center">
      <span
        ref={measureRef}
        className="absolute invisible whitespace-pre font-bold"
        style={{
          pointerEvents: "none",
          fontSize: "inherit",
          lineHeight: "inherit",
        }}
      >
        {inputValue.replace(/\s/g, " ")}
      </span>

      <input
        ref={inputRef}
        type="text"
        inputMode="numeric"
        value={inputValue}
        onChange={handleInputChange}
        onBlur={handleBlur}
        onFocus={handleFocus}
        onKeyDown={handleKeyDown}
        className={`
          text-center font-bold 
          px-2 py-1
          border-b-2 border-transparent
          focus:outline-none focus:border-zus-green
          transition-all duration-200
          hover:border-zus-grey-300
          bg-transparent
          text-zus-grey-900
          ${className}
        `}
        style={{
          width: `${width}px`,
          fontSize: "inherit",
          lineHeight: "inherit",
        }}
        aria-label="Kwota emerytury"
      />

      {suffix && (
        <span className="font-bold text-zus-grey-700 pointer-events-none ml-0.5">
          {suffix}
        </span>
      )}
    </div>
  );
}
