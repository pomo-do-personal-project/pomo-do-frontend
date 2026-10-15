"use client";

import React, { useState, useEffect, useRef } from "react";
import { Clock, X } from "lucide-react";
import { DigitalTimeStepper } from "./DigitalTimeStepper";

interface DigitalTimePickerProps {
  valueMinutes: number;
  onChange: (totalMinutes: number) => void;
}

export function DigitalTimePicker({
  valueMinutes,
  onChange,
}: DigitalTimePickerProps) {
  const [isOpen, setIsOpen] = useState(false);
  const popoverRef = useRef<HTMLDivElement>(null);

  const initialMins = valueMinutes && valueMinutes > 0 ? valueMinutes : 25;
  const [hours, setHours] = useState(() => Math.floor(initialMins / 60));
  const [minutes, setMinutes] = useState(() => initialMins % 60);
  const [activeUnit, setActiveUnit] = useState<"hh" | "mm">("mm");

  const debounceTimerRef = useRef<NodeJS.Timeout | null>(null);
  const latestTotalRef = useRef<number>(initialMins);
  const wheelAccumulatorRef = useRef<number>(0);

  useEffect(() => {
    if (!isOpen) {
      const validM = valueMinutes && valueMinutes > 0 ? valueMinutes : 25;
      setHours(Math.floor(validM / 60));
      setMinutes(validM % 60);
      latestTotalRef.current = validM;
    }
  }, [valueMinutes, isOpen]);

  const flushSave = () => {
    if (debounceTimerRef.current) {
      clearTimeout(debounceTimerRef.current);
      debounceTimerRef.current = null;
    }
    onChange(latestTotalRef.current);
  };

  useEffect(() => {
    function handleClickOutside(event: MouseEvent) {
      if (popoverRef.current && !popoverRef.current.contains(event.target as Node)) {
        setIsOpen(false);
        flushSave();
      }
    }
    if (isOpen) {
      document.addEventListener("mousedown", handleClickOutside);
    }
    return () => {
      document.removeEventListener("mousedown", handleClickOutside);
    };
  }, [isOpen]);

  const handleUpdate = (newH: number, newM: number) => {
    let clampedH = Math.max(0, Math.min(23, newH));
    let clampedM = Math.max(0, Math.min(59, newM));

    if (clampedH === 0 && clampedM < 5) {
      clampedM = 5;
    }

    setHours(clampedH);
    setMinutes(clampedM);

    const total = clampedH * 60 + clampedM;
    latestTotalRef.current = total;

    if (debounceTimerRef.current) {
      clearTimeout(debounceTimerRef.current);
    }
    debounceTimerRef.current = setTimeout(() => {
      onChange(total);
      debounceTimerRef.current = null;
    }, 450);
  };

  const adjustHours = (delta: number) => {
    let nextH = Math.max(0, Math.min(23, hours + delta));
    let nextM = (nextH === 0 && minutes < 5) ? 5 : minutes;
    handleUpdate(nextH, nextM);
  };

  const adjustMinutes = (delta: number) => {
    let nextM = minutes + delta;
    let nextH = hours;

    if (nextM >= 60) {
      nextM = nextM % 60;
      nextH = Math.min(23, nextH + 1);
    } else if (nextM < 0) {
      if (nextH > 0) {
        nextM = 60 + nextM;
        nextH -= 1;
      } else {
        nextM = 5;
      }
    }

    if (nextH === 0 && nextM < 5) nextM = 5;
    handleUpdate(nextH, nextM);
  };

  const handleWheel = (e: React.WheelEvent<HTMLDivElement>, unit: "hh" | "mm") => {
    e.preventDefault();
    e.stopPropagation();
    setActiveUnit(unit);

    wheelAccumulatorRef.current += e.deltaY;
    const threshold = 35;

    if (Math.abs(wheelAccumulatorRef.current) >= threshold) {
      const steps = Math.trunc(wheelAccumulatorRef.current / threshold);
      wheelAccumulatorRef.current -= steps * threshold;

      const direction = steps < 0 ? 1 : -1;
      if (unit === "hh") adjustHours(direction);
      if (unit === "mm") adjustMinutes(direction * 5);
    }
  };

  const totalMinutes = Math.max(5, hours * 60 + minutes);
  const pomos = (totalMinutes / 25).toFixed(1).replace(".0", "");
  const displayLabel = hours > 0 ? `${hours}h${minutes > 0 ? ` ${minutes}m` : ""}` : `${minutes}m`;

  return (
    <div className="relative inline-block" ref={popoverRef}>
      <button
        type="button"
        onClick={() => setIsOpen((prev) => !prev)}
        className="px-2.5 py-1.5 bg-white dark:bg-neutral-800 border border-neutral-300 dark:border-neutral-600 hover:border-neutral-400 dark:hover:border-neutral-500 rounded-lg text-xs font-semibold text-neutral-800 dark:text-neutral-200 transition-colors flex items-center gap-1.5 cursor-pointer shadow-2xs group"
      >
        <Clock size={13} className="text-rose-500 group-hover:scale-110 transition-transform" />
        <span>{displayLabel}</span>
        <span className="text-[10px] text-neutral-400 font-normal">({pomos} Pomo)</span>
      </button>

      {isOpen && (
        <div className="absolute right-0 top-full mt-2 w-72 bg-white dark:bg-neutral-900 border border-neutral-200 dark:border-neutral-700/80 rounded-2xl shadow-2xl p-4 z-40 animate-in fade-in zoom-in-95 duration-150 select-none">
          <div className="flex items-center justify-between pb-3 border-b border-neutral-100 dark:border-neutral-800 mb-3">
            <span className="text-xs font-bold text-neutral-900 dark:text-white uppercase tracking-wider flex items-center gap-1.5">
              <Clock size={13} className="text-rose-500" />
              <span>Thời lượng ước tính</span>
            </span>
            <button
              type="button"
              onClick={() => {
                setIsOpen(false);
                flushSave();
              }}
              className="p-1 rounded-lg hover:bg-neutral-100 dark:hover:bg-neutral-800 text-neutral-400 hover:text-neutral-700 dark:hover:text-neutral-200 cursor-pointer"
            >
              <X size={14} />
            </button>
          </div>

          <DigitalTimeStepper
            hours={hours}
            minutes={minutes}
            activeUnit={activeUnit}
            setActiveUnit={setActiveUnit}
            onAdjustHours={adjustHours}
            onAdjustMinutes={adjustMinutes}
            onWheel={handleWheel}
          />
        </div>
      )}
    </div>
  );
}
