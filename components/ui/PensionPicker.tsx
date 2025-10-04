"use client";

import { useState, useEffect, useRef } from "react";

interface PensionPickerProps {
  value: number;
  min: number;
  max: number;
  step: number;
  onChange: (value: number) => void;
  activeColor?: string;
}

export function PensionPicker({
  value,
  min,
  max,
  step,
  onChange,
  activeColor = "#0088CC",
}: PensionPickerProps) {
  const [inputValue, setInputValue] = useState(value.toString());
  const [isFocused, setIsFocused] = useState(false);
  const [inputWidth, setInputWidth] = useState(100);
  const measureRef = useRef<HTMLSpanElement>(null);

  useEffect(() => {
    if (!isFocused) {
      setInputValue(value.toString());
    }
  }, [value, isFocused]);

  useEffect(() => {
    // Measure actual width of text
    if (measureRef.current) {
      const measuredWidth = measureRef.current.offsetWidth;
      setInputWidth(measuredWidth + 10); // Add small padding for cursor
    }
  }, [inputValue]);

  const handleIncrement = () => {
    const newValue = Math.min(value + step * 10, max);
    onChange(newValue);
  };

  const handleDecrement = () => {
    const newValue = Math.max(value - step * 10, min);
    onChange(newValue);
  };

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const val = e.target.value.replace(/[^\d]/g, "");
    setInputValue(val);
  };

  const handleInputBlur = () => {
    setIsFocused(false);
    const numValue = parseInt(inputValue) || min;
    const clampedValue = Math.max(min, Math.min(max, numValue));
    const roundedValue = Math.round(clampedValue / step) * step;
    onChange(roundedValue);
  };

  const handleInputFocus = () => {
    setIsFocused(true);
  };

  const handleKeyDown = (e: React.KeyboardEvent<HTMLInputElement>) => {
    if (e.key === "ArrowUp") {
      e.preventDefault();
      handleIncrement();
    } else if (e.key === "ArrowDown") {
      e.preventDefault();
      handleDecrement();
    } else if (e.key === "Enter") {
      e.currentTarget.blur();
    }
  };

  const AVERAGE_PENSION = 3518;
  const isAboveAverage = value >= AVERAGE_PENSION;
  const difference = Math.abs(((value / AVERAGE_PENSION - 1) * 100));

  return (
    <div className="flex flex-col items-center gap-3">
      <div className="flex items-center gap-3 mb-4">
        {/* Decrement Button */}
        <button
          onClick={handleDecrement}
          disabled={value <= min}
          className="w-10 h-10 rounded-lg bg-gray-700 hover:bg-gray-600 disabled:bg-gray-800 disabled:opacity-40 disabled:cursor-not-allowed text-white font-bold text-xl transition-all duration-200 hover:scale-110 active:scale-95 shadow-lg"
          aria-label="Zmniejsz o 100 zł"
        >
          −
        </button>

        {/* Hidden span for measuring text width */}
        <span
          ref={measureRef}
          className="absolute invisible text-3xl font-bold whitespace-nowrap"
          aria-hidden="true"
        >
          {inputValue || "0"}
        </span>

        {/* Main Input Container */}
        <div
          className="relative bg-gradient-to-br from-gray-800 to-gray-900 rounded-xl p-4 shadow-2xl border-2 transition-all duration-300"
          style={{
            borderColor: isFocused ? activeColor : "#4B5563",
            minWidth: "280px",
          }}
        >
          {/* Input Field */}
          <div className="flex items-center justify-center gap-1">
            <input
              type="text"
              inputMode="numeric"
              value={inputValue}
              onChange={handleInputChange}
              onBlur={handleInputBlur}
              onFocus={handleInputFocus}
              onKeyDown={handleKeyDown}
              className="bg-transparent text-3xl font-bold text-white text-right outline-none transition-all duration-200"
              style={{ 
                caretColor: activeColor,
                width: `${inputWidth}px`,
                minWidth: '60px',
                maxWidth: '250px'
              }}
              aria-label="Kwota emerytury"
            />
            <span className="text-3xl font-bold text-gray-400">zł</span>
          </div>

          {/* Average and Difference Display */}
          <div className="flex items-center justify-center gap-6 mt-4 pt-4 border-t border-gray-700/30">
            <div className="text-center">
              <p className="text-[10px] text-gray-500 mb-1">
                Średnia w Polsce
              </p>
              <p className="text-sm font-bold text-zus-blue">
                3 518 zł
              </p>
            </div>
            {value !== AVERAGE_PENSION && (
              <div className="text-center">
                <p className="text-[10px] text-gray-500 mb-1">Twoja różnica</p>
                <p className={`text-sm font-bold ${isAboveAverage ? 'text-zus-green' : 'text-red-400'}`}>
                  {isAboveAverage ? '↑ ' : '↓ '}{difference.toFixed(0)}%
                  {isAboveAverage ? ' wyżej' : ' niżej'}
                </p>
              </div>
            )}
          </div>
        </div>

        {/* Increment Button */}
        <button
          onClick={handleIncrement}
          disabled={value >= max}
          className="w-10 h-10 rounded-lg bg-gray-700 hover:bg-gray-600 disabled:bg-gray-800 disabled:opacity-40 disabled:cursor-not-allowed text-white font-bold text-xl transition-all duration-200 hover:scale-110 active:scale-95 shadow-lg"
          aria-label="Zwiększ o 100 zł"
        >
          +
        </button>
      </div>
    </div>
  );
}

