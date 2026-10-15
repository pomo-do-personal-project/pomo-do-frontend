"use client";

import React, { useState, useRef, useEffect } from "react";
import { Flag, ChevronDown, Check } from "lucide-react";
import { Priority } from "../../types/api";
import { PRIORITY_MAP, MATRIX_OPTIONS } from "./types";

interface TaskPrioritySelectProps {
  priority: Priority;
  onChange: (newPriority: Priority) => void;
}

export function TaskPrioritySelect({ priority, onChange }: TaskPrioritySelectProps) {
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

  const getMatrixBadgeColor = (p: Priority) => {
    if (p === Priority.ImportantUrgent) return "text-rose-500";
    if (p === Priority.ImportantNotUrgent) return "text-blue-500";
    if (p === Priority.NotImportantUrgent) return "text-amber-500";
    return "text-neutral-400";
  };

  return (
    <div className="relative shrink-0 flex items-center" ref={dropdownRef}>
      <button
        type="button"
        onClick={() => setIsOpen((prev) => !prev)}
        title="Chọn dạng Ma trận Eisenhower"
        aria-label="Chọn Ma trận Eisenhower"
        className="p-1.5 rounded-xl hover:bg-neutral-100 dark:hover:bg-neutral-800 transition-colors flex items-center gap-1 cursor-pointer shrink-0"
      >
        <Flag size={18} strokeWidth={2} className={`${getMatrixBadgeColor(priority)} shrink-0`} />
        <ChevronDown size={14} strokeWidth={2} className="text-neutral-400 shrink-0" />
      </button>

      {isOpen && (
        <div className="absolute right-0 top-full mt-2 w-64 bg-white dark:bg-neutral-800 border border-neutral-200 dark:border-neutral-700 rounded-2xl shadow-2xl z-30 p-2 animate-in fade-in zoom-in-95 duration-150">
          <div className="text-[11px] font-bold text-neutral-400 dark:text-neutral-500 uppercase px-2 py-1 mb-1">
            Phân loại Ma trận Eisenhower
          </div>
          {MATRIX_OPTIONS.map((opt) => {
            const optPriority = PRIORITY_MAP[opt.id];
            const isSelected = priority === optPriority;

            return (
              <button
                key={opt.id}
                type="button"
                onClick={() => {
                  onChange(optPriority);
                  setIsOpen(false);
                }}
                className={`w-full text-left px-3 py-2 rounded-xl text-xs flex items-center justify-between transition-colors cursor-pointer ${
                  isSelected
                    ? "bg-neutral-100 dark:bg-neutral-700 font-semibold"
                    : "hover:bg-neutral-50 dark:hover:bg-neutral-700/50"
                }`}
              >
                <span className="text-neutral-900 dark:text-white font-medium">{opt.label}</span>
                {isSelected && <Check size={14} strokeWidth={2.5} className="text-emerald-500 shrink-0" />}
              </button>
            );
          })}
        </div>
      )}
    </div>
  );
}
