import React, { useState, useEffect } from "react";
import { FormField } from "./FormField";

interface InputWithSliderProps {
  label: string;
  value: number | undefined;
  onChange: (value: number | undefined) => void;
  min: number;
  max: number;
  step: number;
  suffix?: string;
  error?: string;
  hint?: string;
  required?: boolean;
  placeholder?: string;
  tooltip?: string;
}

export function InputWithSlider({
  label,
  value,
  onChange,
  min,
  max,
  step,
  suffix,
  error,
  hint,
  required = false,
  placeholder,
  tooltip,
}: InputWithSliderProps) {
  const [sliderValue, setSliderValue] = useState<number>(
    value !== undefined ? value : Math.round((min + max) / 2)
  );

  // Sync slider with input value
  useEffect(() => {
    if (value !== undefined) {
      setSliderValue(value);
    }
  }, [value]);

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const val = e.target.value;
    if (val === "") {
      onChange(undefined);
    } else {
      const numVal = Number(val);
      onChange(numVal);
      setSliderValue(numVal);
    }
  };

  const handleSliderChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const numVal = Number(e.target.value);
    setSliderValue(numVal);
    onChange(numVal);
  };

  return (
    <FormField
      label={label}
      required={required}
      error={error}
      hint={hint}
      tooltip={tooltip}
    >
      <div className="space-y-2">
        <div className="relative">
          <input
            type="number"
            min={min}
            max={max}
            step={step}
            value={value !== undefined ? value : ""}
            onChange={handleInputChange}
            placeholder={placeholder}
            className="w-full px-4 py-2 pr-16 border border-zus-grey-300 rounded focus:outline-none focus:ring-2 focus:ring-zus-green focus:border-zus-green transition-colors duration-150"
            required={required}
          />
          {suffix && (
            <span className="absolute right-4 top-1/2 -translate-y-1/2 text-gray-500">
              {suffix}
            </span>
          )}
        </div>
        <div className="relative pt-2 pb-1">
          <input
            type="range"
            min={min}
            max={max}
            step={step}
            value={sliderValue}
            onChange={handleSliderChange}
            className="w-full appearance-none cursor-pointer slider-zus"
            style={{
              accentColor: "#00843D",
            }}
          />
        </div>
        <style jsx>{`
          .slider-zus {
            height: 8px;
            background: transparent;
          }
          .slider-zus::-webkit-slider-thumb {
            appearance: none;
            width: 24px;
            height: 24px;
            border-radius: 50%;
            background: #00843d;
            cursor: pointer;
            transition: all 200ms ease-in-out;
            box-shadow: 0 2px 4px rgba(0, 0, 0, 0.2);
            margin-top: -8px;
          }
          .slider-zus::-webkit-slider-thumb:hover {
            background: #006b32;
            transform: scale(1.15);
            box-shadow: 0 3px 6px rgba(0, 0, 0, 0.3);
          }
          .slider-zus::-webkit-slider-thumb:active {
            transform: scale(1.05);
          }
          .slider-zus::-moz-range-thumb {
            width: 24px;
            height: 24px;
            border-radius: 50%;
            background: #00843d;
            cursor: pointer;
            border: none;
            transition: all 200ms ease-in-out;
            box-shadow: 0 2px 4px rgba(0, 0, 0, 0.2);
          }
          .slider-zus::-moz-range-thumb:hover {
            background: #006b32;
            transform: scale(1.15);
            box-shadow: 0 3px 6px rgba(0, 0, 0, 0.3);
          }
          .slider-zus::-moz-range-thumb:active {
            transform: scale(1.05);
          }
          .slider-zus::-webkit-slider-runnable-track {
            width: 100%;
            height: 8px;
            background: linear-gradient(
              to right,
              #00843d 0%,
              #00843d ${((sliderValue - min) / (max - min)) * 100}%,
              #e0e0e0 ${((sliderValue - min) / (max - min)) * 100}%,
              #e0e0e0 100%
            );
            border-radius: 4px;
          }
          .slider-zus::-moz-range-track {
            width: 100%;
            height: 8px;
            background: #e0e0e0;
            border-radius: 4px;
          }
          .slider-zus::-moz-range-progress {
            height: 8px;
            background: #00843d;
            border-radius: 4px;
          }
        `}</style>
      </div>
    </FormField>
  );
}
