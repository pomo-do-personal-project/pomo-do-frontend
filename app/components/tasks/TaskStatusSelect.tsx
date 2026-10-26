"use client";

import React, { useState, useRef, useEffect } from "react";
import { Circle, Clock, CheckCircle2, ChevronDown, Check } from "lucide-react";
import { TaskStatus } from "../../types/api";
import { useTranslation } from "../../stores/useLanguageStore";

interface TaskStatusSelectProps {
  status: TaskStatus;
  onChange: (newStatus: TaskStatus) => void;
}

const STATUS_CONFIGS = [
  {
    status: TaskStatus.Todo,
    labelVi: "Chờ xử lý",
    labelEn: "Pending",
    shortLabelVi: "Chờ xử lý",
    shortLabelEn: "Pending",
    icon: Circle,
    color: "text-neutral-500 dark:text-neutral-400",
    bgColor: "bg-neutral-100 dark:bg-neutral-800",
    borderColor: "border-neutral-300 dark:border-neutral-700",
  },
  {
    status: TaskStatus.InProgress,
    labelVi: "Đang làm",
    labelEn: "In Progress",
    shortLabelVi: "Đang làm",
    shortLabelEn: "In Progress",
    icon: Clock,
    color: "text-amber-600 dark:text-amber-400",
    bgColor: "bg-amber-50 dark:bg-amber-950/40",
    borderColor: "border-amber-200 dark:border-amber-800/60",
  },
  {
    status: TaskStatus.Completed,
    labelVi: "Đã hoàn thành",
    labelEn: "Completed",
    shortLabelVi: "Hoàn thành",
    shortLabelEn: "Done",
    icon: CheckCircle2,
    color: "text-emerald-600 dark:text-emerald-400",
    bgColor: "bg-emerald-50 dark:bg-emerald-950/40",
    borderColor: "border-emerald-200 dark:border-emerald-800/60",
  },
];

export function TaskStatusSelect({ status, onChange }: TaskStatusSelectProps) {
  const { language } = useTranslation();
  const isVi = language === "vi";
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

  const currentConfig = STATUS_CONFIGS.find((c) => c.status === status) || STATUS_CONFIGS[0];
  const CurrentIcon = currentConfig.icon;
  const currentShortLabel = isVi ? currentConfig.shortLabelVi : currentConfig.shortLabelEn;

  return (
    <div className="relative shrink-0 flex items-center" ref={dropdownRef}>
      <button
        type="button"
        onClick={() => setIsOpen((prev) => !prev)}
        className={`px-2.5 py-1.5 rounded-lg border text-xs font-semibold flex items-center gap-1.5 transition-colors cursor-pointer shadow-2xs ${currentConfig.bgColor} ${currentConfig.borderColor} ${currentConfig.color}`}
        title={isVi ? "Thay đổi trạng thái công việc" : "Change task status"}
        aria-label={isVi ? "Thay đổi trạng thái công việc" : "Change task status"}
      >
        <CurrentIcon size={13} strokeWidth={2.2} className="shrink-0" />
        <span>{currentShortLabel}</span>
        <ChevronDown size={12} strokeWidth={2} className="opacity-70 shrink-0 ml-0.5" />
      </button>

      {isOpen && (
        <div className="absolute right-0 top-full mt-1.5 w-56 bg-white dark:bg-neutral-800 border border-neutral-200 dark:border-neutral-700 rounded-xl shadow-xl z-30 p-1.5 animate-in fade-in zoom-in-95 duration-150">
          <div className="text-[10px] font-bold text-neutral-400 dark:text-neutral-500 uppercase px-2 py-1 mb-1">
            {isVi ? "Trạng thái công việc" : "Task Status"}
          </div>
          {STATUS_CONFIGS.map((cfg) => {
            const isSelected = status === cfg.status;
            const Icon = cfg.icon;
            const itemLabel = isVi ? cfg.labelVi : cfg.labelEn;

            return (
              <button
                key={cfg.status}
                type="button"
                onClick={() => {
                  onChange(cfg.status);
                  setIsOpen(false);
                }}
                className={`w-full text-left px-2.5 py-1.5 rounded-lg text-xs flex items-center justify-between transition-colors cursor-pointer ${
                  isSelected
                    ? "bg-neutral-100 dark:bg-neutral-700 font-semibold"
                    : "hover:bg-neutral-50 dark:hover:bg-neutral-700/50"
                }`}
              >
                <div className="flex items-center gap-2">
                  <Icon size={14} strokeWidth={2.2} className={cfg.color} />
                  <span className="text-neutral-800 dark:text-neutral-200 font-medium">
                    {itemLabel}
                  </span>
                </div>
                {isSelected && (
                  <Check size={14} strokeWidth={2.5} className="text-emerald-500 shrink-0" />
                )}
              </button>
            );
          })}
        </div>
      )}
    </div>
  );
}
