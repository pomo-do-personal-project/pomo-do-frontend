"use client";

import React, { useState, useEffect } from "react";
import { ChevronUp, ChevronDown } from "lucide-react";

interface DurationStepperProps {
  value: number;
  min?: number;
  max?: number;
  unitLabel: string;
  onChange: (val: number) => void;
}

export function DurationStepper({
  value,
  min = 1,
  max = 180,
  unitLabel,
  onChange,
}: DurationStepperProps) {
  const [val, setVal] = useState(value);

  useEffect(() => {
    setVal(value);
  }, [value]);

  const handleChange = (newVal: number) => {
    const clamped = Math.max(min, Math.min(max, newVal));
    setVal(clamped);
    onChange(clamped);
  };

  return (
    <div className="relative group flex items-center gap-1 py-1 px-1.5 rounded-lg hover:bg-neutral-100/80 dark:hover:bg-neutral-800/50 transition-colors">
      <input
        type="number"
        min={min}
        max={max}
        value={val}
        onChange={(e) => {
          const v = parseInt(e.target.value);
          setVal(isNaN(v) ? min : v);
        }}
        onBlur={(e) => {
          const v = parseInt(e.target.value) || min;
          handleChange(v);
        }}
        className="w-10 text-right font-mono font-bold text-sm bg-transparent border-none text-neutral-900 dark:text-white focus:outline-none p-0 select-all [appearance:textfield] [&::-webkit-outer-spin-button]:appearance-none [&::-webkit-inner-spin-button]:appearance-none"
      />

      <div className="flex flex-col opacity-100 sm:opacity-0 sm:group-hover:opacity-100 focus-within:opacity-100 transition-opacity duration-150">
        <button
          type="button"
          onClick={() => handleChange(val + 1)}
          className="p-0.5 text-neutral-400 hover:text-neutral-900 dark:hover:text-white bg-transparent transition-colors cursor-pointer leading-none"
          title="+1 min"
          aria-label="+1 min"
        >
          <ChevronUp size={11} strokeWidth={2.5} />
        </button>
        <button
          type="button"
          onClick={() => handleChange(val - 1)}
          className="p-0.5 text-neutral-400 hover:text-neutral-900 dark:hover:text-white bg-transparent transition-colors cursor-pointer leading-none"
          title="-1 min"
          aria-label="-1 min"
        >
          <ChevronDown size={11} strokeWidth={2.5} />
        </button>
      </div>

      <span className="text-xs text-neutral-500 dark:text-neutral-400 select-none">
        {unitLabel}
      </span>
    </div>
  );
}
