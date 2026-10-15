"use client";

import React, { useMemo } from "react";

interface StopwatchDialProps {
  seconds: number;
  label?: string;
  totalCycleSeconds?: number;
  isOvertime?: boolean;
  overtimeSeconds?: number;
}

export function StopwatchDial({
  seconds,
  label = "SEC. ELAPSED",
  totalCycleSeconds = 60,
  isOvertime = false,
  overtimeSeconds = 0,
}: StopwatchDialProps) {
  const currentSecInCycle = (isOvertime ? overtimeSeconds : seconds) % totalCycleSeconds;
  const progressRatio = currentSecInCycle / totalCycleSeconds; // 0 to 1

  // Format MM:SS
  const displaySeconds = isOvertime ? overtimeSeconds : seconds;
  const mins = Math.floor(displaySeconds / 60);
  const secs = displaySeconds % 60;
  const formattedTime = `${mins.toString().padStart(2, "0")}:${secs
    .toString()
    .padStart(2, "0")}`;

  // SVG dimensions
  const size = 280;
  const center = size / 2;
  const radius = 115;
  const totalTicks = 60; // 60 ticks around the circle

  // Generate tick markers: Ticks are oriented RADIALLY (pointing from center outward like a clock)
  // Quét ngược chiều kim đồng hồ (từ trên đỉnh sang trái: counter-clockwise)
  const ticks = useMemo(() => {
    return Array.from({ length: totalTicks }, (_, i) => {
      // Angle: 0 at top (-90deg), counter-clockwise (- i * 360 / totalTicks)
      const angle = -90 - (i * 360) / totalTicks;
      const rad = (angle * Math.PI) / 180;
      const isPassed = i / totalTicks <= progressRatio && (seconds > 0 || overtimeSeconds > 0);

      // Radial ticks: lines perpendicular to the circle (xuyên tâm)
      const tickLength = i % 5 === 0 ? 12 : 8; // Major ticks longer
      const innerR = radius - tickLength / 2;
      const outerR = radius + tickLength / 2;

      const x1 = center + innerR * Math.cos(rad);
      const y1 = center + innerR * Math.sin(rad);
      const x2 = center + outerR * Math.cos(rad);
      const y2 = center + outerR * Math.sin(rad);

      return {
        id: i,
        x1,
        y1,
        x2,
        y2,
        isPassed,
        isMajor: i % 5 === 0,
      };
    });
  }, [totalTicks, progressRatio, radius, center, seconds, overtimeSeconds]);

  // Current hand angle in degrees: ngược chiều kim đồng hồ (counter-clockwise)
  const handAngle = -progressRatio * 360;

  return (
    <div className="relative flex flex-col items-center justify-center select-none">
      <svg
        width={size}
        height={size}
        viewBox={`0 0 ${size} ${size}`}
        className="transform drop-shadow-md"
      >
        {/* 1. All 60 Clock Ticks (Radially aligned) */}
        {ticks.map((tick) => (
          <line
            key={tick.id}
            x1={tick.x1}
            y1={tick.y1}
            x2={tick.x2}
            y2={tick.y2}
            stroke={
              isOvertime
                ? tick.isPassed
                  ? "#f43f5e" // Rose-500
                  : "currentColor"
                : tick.isPassed
                ? "#84cc16" // Lime-500 neon
                : "currentColor"
            }
            strokeWidth={tick.isPassed ? (tick.isMajor ? 3.5 : 2.5) : (tick.isMajor ? 2 : 1.2)}
            strokeLinecap="round"
            className={`transition-colors duration-150 ${
              tick.isPassed
                ? ""
                : "text-neutral-300 dark:text-neutral-700"
            }`}
          />
        ))}

        {/* 2. Rotating Clock Hand (Kim đồng hồ xoay tròn quét qua các vạch) */}
        {(seconds > 0 || overtimeSeconds > 0) && (
          <g
            transform={`rotate(${handAngle} ${center} ${center})`}
            className="transition-transform duration-300 ease-out"
          >
            {/* The Indicator Needle / Pin crossing the track */}
            <line
              x1={center}
              y1={center - radius - 10}
              x2={center}
              y2={center - radius + 10}
              stroke={isOvertime ? "#e11d48" : "#65a30d"}
              strokeWidth="4"
              strokeLinecap="round"
              className={
                isOvertime
                  ? "drop-shadow-[0_0_8px_rgba(244,63,94,0.8)]"
                  : "drop-shadow-[0_0_8px_rgba(132,204,22,0.8)]"
              }
            />
          </g>
        )}
      </svg>

      {/* Center Digital Clock & Subtitle: Auto adaptive to light/dark mode */}
      <div className="absolute inset-0 flex flex-col items-center justify-center pointer-events-none">
        <span
          className={`font-mono text-5xl sm:text-6xl tracking-tight drop-shadow-sm transition-colors duration-200 ${
            isOvertime
              ? "text-rose-600 dark:text-rose-400 font-normal"
              : "text-neutral-900 dark:text-white font-light"
          }`}
        >
          {isOvertime ? `+${formattedTime}` : formattedTime}
        </span>
        <span
          className={`mt-1 text-[11px] font-semibold tracking-widest uppercase font-mono transition-colors duration-200 ${
            isOvertime ? "text-rose-500 dark:text-rose-400" : "text-neutral-500 dark:text-neutral-400"
          }`}
        >
          {label}
        </span>
      </div>
    </div>
  );
}
