"use client";

import React, { useState, useEffect, useRef } from "react";
import { ChevronUp, ChevronDown, Clock, X } from "lucide-react";

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

  // Chỉ đồng bộ khi popover đang ĐÓNG (tránh re-render giật lác khi người dùng đang cuộn)
  useEffect(() => {
    if (!isOpen) {
      const validM = valueMinutes && valueMinutes > 0 ? valueMinutes : 25;
      setHours(Math.floor(validM / 60));
      setMinutes(validM % 60);
      latestTotalRef.current = validM;
    }
  }, [valueMinutes, isOpen]);

  // Flush ngay thay đổi khi đóng popover
  const flushSave = () => {
    if (debounceTimerRef.current) {
      clearTimeout(debounceTimerRef.current);
      debounceTimerRef.current = null;
    }
    onChange(latestTotalRef.current);
  };

  // Click outside listener để đóng Popover
  useEffect(() => {
    function handleClickOutside(event: MouseEvent) {
      if (
        popoverRef.current &&
        !popoverRef.current.contains(event.target as Node)
      ) {
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

  // Cập nhật giá trị UI mượt mà 60fps & debounce gửi lên backend
  const handleUpdate = (newH: number, newM: number) => {
    let clampedH = Math.max(0, Math.min(23, newH));
    let clampedM = Math.max(0, Math.min(59, newM));

    // Tuyệt đối không cho về 00:00 - Tối thiểu là 00:05 (5 phút)
    if (clampedH === 0 && clampedM < 5) {
      clampedM = 5;
    }

    setHours(clampedH);
    setMinutes(clampedM);

    const total = Math.max(5, clampedH * 60 + clampedM);
    latestTotalRef.current = total;

    // Debounce 450ms: Lướt cuộn mượt mà ở giao diện, chỉ gửi API khi đã ngưng cuộn
    if (debounceTimerRef.current) {
      clearTimeout(debounceTimerRef.current);
    }
    debounceTimerRef.current = setTimeout(() => {
      onChange(total);
      debounceTimerRef.current = null;
    }, 450);
  };

  const adjustHours = (delta: number) => {
    let nextH = hours + delta;
    if (nextH < 0) nextH = 0;
    if (nextH > 23) nextH = 23;

    let nextM = minutes;
    if (nextH === 0 && nextM < 5) {
      nextM = 5;
    }
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
        nextH = nextH - 1;
      } else {
        nextM = 5;
      }
    }

    if (nextH === 0 && nextM < 5) {
      nextM = 5;
    }

    handleUpdate(nextH, nextM);
  };

  // Lăn chuột cuộn mượt mà từng nấc
  const handleWheel = (
    e: React.WheelEvent<HTMLDivElement>,
    unit: "hh" | "mm"
  ) => {
    e.preventDefault();
    e.stopPropagation();
    setActiveUnit(unit);

    wheelAccumulatorRef.current += e.deltaY;
    const threshold = 35; // Ngưỡng cuộn đầm tay tự nhiên

    if (Math.abs(wheelAccumulatorRef.current) >= threshold) {
      const steps = Math.trunc(wheelAccumulatorRef.current / threshold);
      wheelAccumulatorRef.current -= steps * threshold;

      const direction = steps < 0 ? 1 : -1;
      if (unit === "hh") adjustHours(direction);
      if (unit === "mm") adjustMinutes(direction * 5);
    }
  };

  const format2 = (n: number) => String(n).padStart(2, "0");

  const totalMinutes = Math.max(5, hours * 60 + minutes);
  const pomos = (totalMinutes / 25).toFixed(1).replace(".0", "");

  // Định dạng nhãn hiển thị nút bên ngoài
  const displayLabel =
    hours > 0
      ? `${hours}h${minutes > 0 ? ` ${minutes}m` : ""}`
      : `${minutes}m`;

  const QUICK_PRESETS = [
    { label: "15m", mins: 15 },
    { label: "25m (1 Pomo)", mins: 25 },
    { label: "50m (2 Pomo)", mins: 50 },
    { label: "1h 30m", mins: 90 },
    { label: "2h", mins: 120 },
  ];

  return (
    <div className="relative inline-block" ref={popoverRef}>
      {/* Nút bấm hiển thị tinh gọn cùng hàng với Due Date */}
      <button
        type="button"
        onClick={() => setIsOpen((prev) => !prev)}
        className="px-2.5 py-1.5 bg-white dark:bg-neutral-800 border border-neutral-300 dark:border-neutral-600 hover:border-neutral-400 dark:hover:border-neutral-500 rounded-lg text-xs font-semibold text-neutral-800 dark:text-neutral-200 transition-colors flex items-center gap-1.5 cursor-pointer shadow-2xs group"
      >
        <Clock size={13} className="text-rose-500 group-hover:scale-110 transition-transform" />
        <span>{displayLabel}</span>
        <span className="text-[10px] text-neutral-400 font-normal">
          ({pomos} Pomo)
        </span>
      </button>

      {/* Popover Cuộn Kỹ Thuật Số Sang Trọng */}
      {isOpen && (
        <div className="absolute right-0 top-full mt-2 w-72 bg-white dark:bg-neutral-900 border border-neutral-200 dark:border-neutral-700/80 rounded-2xl shadow-2xl p-4 z-40 animate-in fade-in zoom-in-95 duration-150 select-none">
          {/* Header */}
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

          {/* Khung Digital Stepper Cuộn (HH : MM) */}
          <div className="flex items-center justify-center gap-3 py-2 bg-neutral-50 dark:bg-neutral-950/70 border border-neutral-200/80 dark:border-neutral-800 rounded-2xl mb-3 shadow-inner">
            {/* Cột Giờ (HH) */}
            <div
              onMouseEnter={() => setActiveUnit("hh")}
              onWheel={(e) => handleWheel(e, "hh")}
              className={`flex flex-col items-center p-1.5 rounded-xl transition-all cursor-ns-resize ${
                activeUnit === "hh"
                  ? "bg-white dark:bg-neutral-800 shadow-sm border-b-2 border-sky-500 ring-1 ring-sky-500/20"
                  : "hover:bg-neutral-100 dark:hover:bg-neutral-800/50"
              }`}
            >
              <button
                type="button"
                onClick={() => {
                  setActiveUnit("hh");
                  adjustHours(1);
                }}
                title="Tăng giờ"
                className="p-1 text-neutral-400 hover:text-neutral-900 dark:hover:text-white transition-colors cursor-pointer"
              >
                <ChevronUp size={16} strokeWidth={2.5} />
              </button>

              <span className="font-mono text-2xl font-black text-neutral-900 dark:text-white px-2">
                {format2(hours)}
              </span>

              <button
                type="button"
                onClick={() => {
                  setActiveUnit("hh");
                  adjustHours(-1);
                }}
                title="Giảm giờ"
                className="p-1 text-neutral-400 hover:text-neutral-900 dark:hover:text-white transition-colors cursor-pointer"
              >
                <ChevronDown size={16} strokeWidth={2.5} />
              </button>

              <span className="text-[10px] font-bold text-neutral-400 uppercase mt-0.5">
                Giờ
              </span>
            </div>

            {/* Dấu hai chấm */}
            <span className="font-mono text-2xl font-bold text-neutral-400 pb-4">
              :
            </span>

            {/* Cột Phút (MM) */}
            <div
              onMouseEnter={() => setActiveUnit("mm")}
              onWheel={(e) => handleWheel(e, "mm")}
              className={`flex flex-col items-center p-1.5 rounded-xl transition-all cursor-ns-resize ${
                activeUnit === "mm"
                  ? "bg-white dark:bg-neutral-800 shadow-sm border-b-2 border-sky-500 ring-1 ring-sky-500/20"
                  : "hover:bg-neutral-100 dark:hover:bg-neutral-800/50"
              }`}
            >
              <button
                type="button"
                onClick={() => {
                  setActiveUnit("mm");
                  adjustMinutes(5);
                }}
                title="Tăng 5 phút"
                className="p-1 text-neutral-400 hover:text-neutral-900 dark:hover:text-white transition-colors cursor-pointer"
              >
                <ChevronUp size={16} strokeWidth={2.5} />
              </button>

              <span className="font-mono text-2xl font-black text-neutral-900 dark:text-white px-2">
                {format2(minutes)}
              </span>

              <button
                type="button"
                onClick={() => {
                  setActiveUnit("mm");
                  adjustMinutes(-5);
                }}
                title="Giảm 5 phút"
                className="p-1 text-neutral-400 hover:text-neutral-900 dark:hover:text-white transition-colors cursor-pointer"
              >
                <ChevronDown size={16} strokeWidth={2.5} />
              </button>

              <span className="text-[10px] font-bold text-neutral-400 uppercase mt-0.5">
                Phút
              </span>
            </div>
          </div>

          {/* Dòng quy đổi & Gợi ý lăn chuột */}
          <div className="flex items-center justify-between text-xs px-1 mb-3">
            <span className="font-bold text-emerald-600 dark:text-emerald-400">
              ≈ {totalMinutes} phút ({pomos} Pomo)
            </span>
            <span className="text-[10px] text-neutral-400 italic">
              Lăn chuột để cuộn ⏱️
            </span>
          </div>

          {/* Các mốc chọn nhanh */}
          <div className="pt-2.5 border-t border-neutral-100 dark:border-neutral-800">
            <div className="text-[10px] font-bold text-neutral-400 uppercase tracking-wider mb-2">
              Mốc phổ biến:
            </div>
            <div className="flex flex-wrap gap-1.5">
              {QUICK_PRESETS.map((p) => (
                <button
                  key={p.mins}
                  type="button"
                  onClick={() => {
                    handleUpdate(Math.floor(p.mins / 60), p.mins % 60);
                  }}
                  className={`px-2 py-1 rounded-lg text-xs font-medium transition-colors cursor-pointer ${
                    totalMinutes === p.mins
                      ? "bg-rose-500 text-white font-bold shadow-2xs"
                      : "bg-neutral-100 dark:bg-neutral-800 hover:bg-neutral-200 dark:hover:bg-neutral-700 text-neutral-700 dark:text-neutral-300"
                  }`}
                >
                  {p.label}
                </button>
              ))}
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
