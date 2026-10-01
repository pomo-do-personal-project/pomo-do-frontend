"use client";

import React, { useState, useEffect, useRef } from "react";
import { Button } from "./ui/Button";
import { StopwatchDial } from "./StopwatchDial";

type TimerType = "pomo" | "stopwatch";
type FocusMode = "W" | "SB" | "LB";

const MODE_CONFIG: Record<FocusMode, { label: string; fullName: string; defaultMinutes: number }> = {
  W: { label: "W", fullName: "Work / Focus", defaultMinutes: 25 },
  SB: { label: "SB", fullName: "Short Break", defaultMinutes: 5 },
  LB: { label: "LB", fullName: "Long Break", defaultMinutes: 15 },
};

export function TimerCenter() {
  const [timerType, setTimerType] = useState<TimerType>("pomo");
  const [focusMode, setFocusMode] = useState<FocusMode>("W");
  const [isDropdownOpen, setIsDropdownOpen] = useState(false);
  const [taskName, setTaskName] = useState("");
  const [isRunning, setIsRunning] = useState(false);
  const [seconds, setSeconds] = useState(25 * 60);

  const dropdownRef = useRef<HTMLDivElement>(null);

  // Close dropdown on outside click
  useEffect(() => {
    function handleClickOutside(event: MouseEvent) {
      if (dropdownRef.current && !dropdownRef.current.contains(event.target as Node)) {
        setIsDropdownOpen(false);
      }
    }
    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, []);

  // Update timer duration when mode or timer type changes
  useEffect(() => {
    setIsRunning(false);
    if (timerType === "pomo") {
      setSeconds(MODE_CONFIG[focusMode].defaultMinutes * 60);
    } else {
      setSeconds(0);
    }
  }, [focusMode, timerType]);

  // Timer Tick
  useEffect(() => {
    let interval: NodeJS.Timeout | null = null;
    if (isRunning) {
      interval = setInterval(() => {
        setSeconds((prev) => {
          if (timerType === "pomo") {
            if (prev <= 1) {
              setIsRunning(false);
              return 0;
            }
            return prev - 1;
          } else {
            return prev + 1;
          }
        });
      }, 1000);
    }
    return () => {
      if (interval) clearInterval(interval);
    };
  }, [isRunning, timerType]);

  const handleReset = () => {
    setIsRunning(false);
    if (timerType === "pomo") {
      setSeconds(MODE_CONFIG[focusMode].defaultMinutes * 60);
    } else {
      setSeconds(0);
    }
  };

  const formatTime = (totalSeconds: number) => {
    const mins = Math.floor(totalSeconds / 60);
    const secs = totalSeconds % 60;
    return `${mins.toString().padStart(2, "0")}:${secs.toString().padStart(2, "0")}`;
  };

  return (
    <div className="flex flex-col items-center justify-center w-full max-w-lg mx-auto py-6 px-4">
      {/* 1. Timer Type Selector (Pomo vs Stopwatch) */}
      <div className="flex items-center gap-2 p-1 bg-neutral-100 dark:bg-neutral-800/80 rounded-2xl border border-neutral-200/80 dark:border-neutral-700/80 mb-6 shadow-xs">
        <button
          onClick={() => setTimerType("pomo")}
          className={`px-5 py-2 rounded-xl text-sm font-semibold transition-all duration-200 cursor-pointer ${timerType === "pomo"
            ? "bg-white text-neutral-900 dark:bg-neutral-900 dark:text-white shadow-xs"
            : "text-neutral-500 hover:text-neutral-900 dark:text-neutral-400 dark:hover:text-white"
            }`}
        >
          Pomo
        </button>
        <button
          onClick={() => setTimerType("stopwatch")}
          className={`px-5 py-2 rounded-xl text-sm font-semibold transition-all duration-200 cursor-pointer ${timerType === "stopwatch"
            ? "bg-white text-neutral-900 dark:bg-neutral-900 dark:text-white shadow-xs"
            : "text-neutral-500 hover:text-neutral-900 dark:text-neutral-400 dark:hover:text-white"
            }`}
        >
          Stopwatch
        </button>
      </div>

      {/* 2. Focus Mode Selection Frame (Only for Pomo) */}
      {timerType === "pomo" ? (
        <div className="relative mb-6" ref={dropdownRef}>
          <button
            onClick={() => setIsDropdownOpen((prev) => !prev)}
            className="flex items-center justify-between gap-3 px-5 py-2 bg-white dark:bg-neutral-800/90 border border-neutral-200 dark:border-neutral-700 rounded-xl shadow-xs hover:border-neutral-300 dark:hover:border-neutral-600 transition-all duration-200 cursor-pointer min-w-[100px]"
          >
            <span className="font-bold text-neutral-900 dark:text-white tracking-wider">
              {focusMode}
            </span>
            <span className="text-neutral-400 dark:text-neutral-500 text-xs">▼</span>
          </button>

          {/* Dropdown Options */}
          {isDropdownOpen && (
            <div className="absolute left-1/2 -translate-x-1/2 top-full mt-2 w-44 bg-white dark:bg-neutral-800 border border-neutral-200 dark:border-neutral-700 rounded-xl shadow-xl z-20 py-1 overflow-hidden animate-in fade-in zoom-in-95 duration-150">
              {(["W", "SB", "LB"] as FocusMode[]).map((mode) => (
                <button
                  key={mode}
                  onClick={() => {
                    setFocusMode(mode);
                    setIsDropdownOpen(false);
                  }}
                  className={`w-full flex items-center justify-between px-4 py-2.5 text-xs text-left transition-colors cursor-pointer ${focusMode === mode
                    ? "bg-neutral-100 dark:bg-neutral-700 font-semibold text-neutral-900 dark:text-white"
                    : "text-neutral-600 dark:text-neutral-300 hover:bg-neutral-50 dark:hover:bg-neutral-700/50"
                    }`}
                >
                  <span className="font-bold">{mode}</span>
                  <span className="text-neutral-400 text-[11px]">{MODE_CONFIG[mode].fullName}</span>
                </button>
              ))}
            </div>
          )}
        </div>
      ) : (
        <div className="h-6 mb-2" />
      )}

      {/* 3. Timer In The Center: Switch between Pomo Digital Box & Stopwatch Circular Dial */}
      {timerType === "stopwatch" ? (
        <div className="w-full py-6 px-6 bg-white/60 dark:bg-neutral-800/40 backdrop-blur-sm border border-neutral-200/80 dark:border-neutral-800 rounded-3xl shadow-sm flex items-center justify-center mb-8">
          <StopwatchDial
            seconds={seconds}
            label={isRunning ? "RECORDING..." : "SEC. ELAPSED"}
          />
        </div>
      ) : (
        <div className="w-full py-8 px-6 bg-white/60 dark:bg-neutral-800/40 backdrop-blur-sm border border-neutral-200/80 dark:border-neutral-800 rounded-3xl shadow-sm flex items-center justify-center mb-8">
          <span className="font-mono text-7xl sm:text-8xl font-light tracking-tighter text-neutral-900 dark:text-white select-none">
            {formatTime(seconds)}
          </span>
        </div>
      )}

      {/* 4. Task Name Input with stylish underline */}
      <div className="w-full max-w-sm mb-10 flex flex-col items-center">
        <input
          type="text"
          value={taskName}
          onChange={(e) => setTaskName(e.target.value)}
          placeholder="name task..."
          className="w-full text-center bg-transparent border-b-2 border-neutral-300 dark:border-neutral-700 focus:border-neutral-900 dark:focus:border-white py-2 text-base text-neutral-800 dark:text-neutral-200 placeholder:text-neutral-400 focus:outline-none transition-colors"
        />
      </div>

      {/* 5. Play / Stop (Reset) Buttons */}
      <div className="flex items-center gap-6">
        {/* Reset / Return Arrow Button */}
        <Button
          variant="secondary"
          size="icon"
          onClick={handleReset}
          title="Reset Timer"
          className="w-12 h-12 rounded-2xl hover:rotate-[-45deg] transition-transform"
        >
          <span className="text-xl">↺</span>
        </Button>

        {/* Main Play / Pause Button */}
        <Button
          variant="primary"
          size="lg"
          onClick={() => setIsRunning((prev) => !prev)}
          className="w-20 h-14 rounded-2xl shadow-md flex items-center justify-center text-xl"
        >
          {isRunning ? (
            <span className="tracking-widest font-mono text-base">❚❚</span>
          ) : (
            <span className="translate-x-0.5 text-2xl">▶</span>
          )}
        </Button>
      </div>
    </div>
  );
}
