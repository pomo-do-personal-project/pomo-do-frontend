"use client";

import React, { useState, useRef, useEffect } from "react";
import { Zap, ClipboardList, ChevronDown, Check } from "lucide-react";

interface OverviewTaskDropdownProps {
  isQuickAddActive: boolean;
  onSelectMode: (isQuickAdd: boolean) => void;
  dailyCount: number;
  quickAddCount: number;
}

export function OverviewTaskDropdown({
  isQuickAddActive,
  onSelectMode,
  dailyCount,
  quickAddCount,
}: OverviewTaskDropdownProps) {
  const [isOpen, setIsOpen] = useState(false);
  const dropdownRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    function handleClickOutside(event: MouseEvent) {
      if (dropdownRef.current && !dropdownRef.current.contains(event.target as Node)) {
        setIsOpen(false);
      }
    }
    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, []);

  return (
    <div className="relative mb-4 shrink-0" ref={dropdownRef}>
      <div className="flex items-center justify-between">
        <button
          onClick={() => setIsOpen((prev) => !prev)}
          className="flex items-center gap-2 text-sm font-semibold text-neutral-800 dark:text-neutral-200 hover:text-neutral-900 dark:hover:text-white py-1 transition-colors cursor-pointer group"
        >
          <span className="flex items-center gap-1.5">
            {isQuickAddActive ? (
              <>
                <Zap size={15} strokeWidth={2} className="text-amber-500" />
                <span>Quick Add (Ghi nhanh)</span>
              </>
            ) : (
              <>
                <ClipboardList size={15} strokeWidth={1.75} className="text-blue-500" />
                <span>Daily Task (Kế hoạch)</span>
              </>
            )}
          </span>
          <span className="text-xs text-neutral-400 font-mono">
            ({isQuickAddActive ? quickAddCount : dailyCount})
          </span>
          <ChevronDown
            size={14}
            strokeWidth={2}
            className={`text-neutral-400 transition-transform duration-200 ${isOpen ? "rotate-180" : ""}`}
          />
        </button>
      </div>

      {isOpen && (
        <div className="absolute left-0 top-full mt-1.5 w-52 bg-white dark:bg-neutral-800 border border-neutral-200 dark:border-neutral-700 rounded-2xl shadow-xl z-20 py-1.5 overflow-hidden animate-in fade-in zoom-in-95 duration-150">
          <button
            onClick={() => {
              onSelectMode(false);
              setIsOpen(false);
            }}
            className={`w-full flex items-center justify-between px-3.5 py-2.5 text-xs text-left transition-colors cursor-pointer ${
              !isQuickAddActive
                ? "bg-neutral-100 dark:bg-neutral-700 font-semibold text-neutral-900 dark:text-white"
                : "text-neutral-700 dark:text-neutral-200 hover:bg-neutral-50 dark:hover:bg-neutral-700/50"
            }`}
          >
            <div className="flex items-center gap-2">
              <ClipboardList size={14} strokeWidth={1.75} className="text-blue-500" />
              <span>Daily Task List</span>
            </div>
            <div className="flex items-center gap-1">
              <span className="text-[11px] text-neutral-400 font-mono">({dailyCount})</span>
              {!isQuickAddActive && <Check size={12} strokeWidth={2.5} className="text-emerald-500" />}
            </div>
          </button>
          <button
            onClick={() => {
              onSelectMode(true);
              setIsOpen(false);
            }}
            className={`w-full flex items-center justify-between px-3.5 py-2.5 text-xs text-left transition-colors cursor-pointer ${
              isQuickAddActive
                ? "bg-neutral-100 dark:bg-neutral-700 font-semibold text-neutral-900 dark:text-white"
                : "text-neutral-700 dark:text-neutral-200 hover:bg-neutral-50 dark:hover:bg-neutral-700/50"
            }`}
          >
            <div className="flex items-center gap-2">
              <Zap size={14} strokeWidth={2} className="text-amber-500" />
              <span>Quick Add (Parked)</span>
            </div>
            <div className="flex items-center gap-1">
              <span className="text-[11px] text-neutral-400 font-mono">({quickAddCount})</span>
              {isQuickAddActive && <Check size={12} strokeWidth={2.5} className="text-emerald-500" />}
            </div>
          </button>
        </div>
      )}
    </div>
  );
}
