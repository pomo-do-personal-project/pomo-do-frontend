"use client";

import React, { useMemo } from "react";

interface StopwatchDialProps {
  seconds: number;
  label?: string;
  totalCycleSeconds?: number; // 60s per full rotation
}

export function StopwatchDial({
  seconds,
  label = "SEC. ELAPSED",
  totalCycleSeconds = 60,
}: StopwatchDialProps) {
  const currentSecInCycle = seconds % totalCycleSeconds;
  const progressRatio = currentSecInCycle / totalCycleSeconds; // 0 to 1

  // Format MM:SS
  const mins = Math.floor(seconds / 60);
  const secs = seconds % 60;
  const formattedTime = `${mins.toString().padStart(2, "0")}:${secs
    .toString()
    .padStart(2, "0")}`;

  // SVG dimensions
  const size = 320;
  const center = size / 2;
  const radius = 120;
  const totalTicks = 60; // 60 ticks around the circle

  // Generate tick markers: Ticks are oriented RADIALLY (pointing from center outward like a clock)
  const ticks = useMemo(() => {
    return Array.from({ length: totalTicks }, (_, i) => {
      // Angle: 0 at top (-90deg), clockwise
      const angle = (i * 360) / totalTicks - 90;
      const rad = (angle * Math.PI) / 180;
      const isPassed = i / totalTicks <= progressRatio && seconds > 0;

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
  }, [totalTicks, progressRatio, radius, center, seconds]);

  // Current hand angle in degrees (0 at top, clockwise)
  const handAngle = progressRatio * 360;

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
              tick.isPassed
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
        {seconds > 0 && (
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
              stroke="#65a30d"
              strokeWidth="4"
              strokeLinecap="round"
              className="drop-shadow-[0_0_8px_rgba(132,204,22,0.8)]"
            />
          </g>
        )}
      </svg>

      {/* Center Digital Clock & Subtitle: Auto adaptive to light/dark mode */}
      <div className="absolute inset-0 flex flex-col items-center justify-center pointer-events-none">
        <span className="font-mono text-5xl sm:text-6xl font-light tracking-tight text-neutral-900 dark:text-white drop-shadow-sm transition-colors duration-200">
          {formattedTime}
        </span>
        <span className="mt-1 text-[11px] font-semibold tracking-widest text-neutral-500 dark:text-neutral-400 uppercase font-mono transition-colors duration-200">
          {label}
        </span>
      </div>
    </div>
  );
}
