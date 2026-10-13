"use client";

import React, { useState, useRef, useEffect } from "react";
import { ChevronDown } from "lucide-react";
import { TimerType, FocusMode, ModeDurationInfo } from "./types";

interface TimerModeSelectorProps {
  timerType: TimerType;
  focusMode: FocusMode;
  modeDurations: Record<FocusMode, ModeDurationInfo>;
  onSelectTimerType: (type: TimerType) => void;
  onSelectFocusMode: (mode: FocusMode) => void;
}

export function TimerModeSelector({
  timerType,
  focusMode,
  modeDurations,
  onSelectTimerType,
  onSelectFocusMode,
}: TimerModeSelectorProps) {
  const [isDropdownOpen, setIsDropdownOpen] = useState(false);
  const dropdownRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    function handleClickOutside(event: MouseEvent) {
      if (dropdownRef.current && !dropdownRef.current.contains(event.target as Node)) {
        setIsDropdownOpen(false);
      }
    }
    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, []);

  return (
    <>
      {/* 1. Timer Type Selector (Pomo vs Stopwatch) */}
      <div className="flex items-center justify-center w-full max-w-sm mb-6">
        <div className="flex items-center gap-1.5 p-1 bg-neutral-100 dark:bg-neutral-800/80 rounded-2xl border border-neutral-200/80 dark:border-neutral-700/80 shadow-xs">
          <button
            onClick={() => onSelectTimerType("pomo")}
            className={`px-4 py-1.5 rounded-xl text-xs sm:text-sm font-semibold transition-all duration-200 cursor-pointer ${
              timerType === "pomo"
                ? "bg-white text-neutral-900 dark:bg-neutral-900 dark:text-white shadow-xs"
                : "text-neutral-500 hover:text-neutral-900 dark:text-neutral-400 dark:hover:text-white"
            }`}
          >
            Pomo
          </button>
          <button
            onClick={() => onSelectTimerType("stopwatch")}
            className={`px-4 py-1.5 rounded-xl text-xs sm:text-sm font-semibold transition-all duration-200 cursor-pointer ${
              timerType === "stopwatch"
                ? "bg-white text-neutral-900 dark:bg-neutral-900 dark:text-white shadow-xs"
                : "text-neutral-500 hover:text-neutral-900 dark:text-neutral-400 dark:hover:text-white"
            }`}
          >
            Stopwatch
          </button>
        </div>
      </div>

      {/* 2. Focus Mode Selection Frame */}
      <div className="relative mb-6" ref={dropdownRef}>
        <button
          onClick={() => setIsDropdownOpen((prev) => !prev)}
          className="flex items-center justify-between gap-3 px-5 py-2 bg-white dark:bg-neutral-800/90 border border-neutral-200 dark:border-neutral-700 rounded-xl shadow-xs hover:border-neutral-300 dark:hover:border-neutral-600 transition-all duration-200 cursor-pointer min-w-[100px]"
        >
          <span className="font-bold text-neutral-900 dark:text-white tracking-wider">
            {focusMode}
          </span>
          <ChevronDown
            size={14}
            strokeWidth={2}
            className={`text-neutral-400 transition-transform ${
              isDropdownOpen ? "rotate-180" : ""
            }`}
          />
        </button>

        {isDropdownOpen && (
          <div className="absolute left-1/2 -translate-x-1/2 top-full mt-2 w-44 bg-white dark:bg-neutral-800 border border-neutral-200 dark:border-neutral-700 rounded-xl shadow-xl z-20 py-1 overflow-hidden animate-in fade-in zoom-in-95 duration-150">
            {(["W", "SB", "LB"] as FocusMode[]).map((mode) => (
              <button
                key={mode}
                onClick={() => {
                  onSelectFocusMode(mode);
                  setIsDropdownOpen(false);
                }}
                className={`w-full flex items-center justify-between px-4 py-2.5 text-xs text-left transition-colors cursor-pointer ${
                  focusMode === mode
                    ? "bg-neutral-100 dark:bg-neutral-700 font-semibold text-neutral-900 dark:text-white"
                    : "text-neutral-600 dark:text-neutral-300 hover:bg-neutral-50 dark:hover:bg-neutral-700/50"
                }`}
              >
                <span className="font-bold">{mode}</span>
                <span className="text-neutral-400 text-[11px]">
                  {modeDurations[mode].fullName} ({modeDurations[mode].minutes}m)
                </span>
              </button>
            ))}
          </div>
        )}
      </div>
    </>
  );
}
