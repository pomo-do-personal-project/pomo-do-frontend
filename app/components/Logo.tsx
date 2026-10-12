"use client";

import React from "react";
import Link from "next/link";

interface LogoProps {
  /** Kích thước icon SVG theo pixel (mặc định: 36) */
  size?: number;
  /** Chỉ hiển thị icon SVG, không kèm chữ POMO-DO */
  iconOnly?: boolean;
  /** Hướng bố trí: "horizontal" (mặc định) hoặc "vertical" (icon nằm trên, chữ nằm dưới) */
  direction?: "horizontal" | "vertical";
  /** Class CSS cho container bên ngoài */
  className?: string;
  /** Class CSS cho phần text POMO-DO */
  textClassName?: string;
  /** Bọc logo trong thẻ Link dẫn về trang chủ "/" */
  asLink?: boolean;
}

export function Logo({
  size = 36,
  iconOnly = false,
  direction = "horizontal",
  className = "",
  textClassName = "",
  asLink = false,
}: LogoProps) {
  const isVertical = direction === "vertical";

  const icon = (
    <div
      style={{ width: size, height: size }}
      className="shrink-0 relative flex items-center justify-center select-none"
    >
      <svg
        xmlns="http://www.w3.org/2000/svg"
        viewBox="0 0 512 512"
        className="w-full h-full drop-shadow-xs"
        aria-hidden="true"
      >
        <defs>
          <path
            id="pomo-leaf-shape"
            d="M 157.1 117.4 C 180.6 105.7 207.9 109.9 230.2 122.0 C 238.1 104.0 243.2 84.2 259.1 82.1 C 270.5 79.6 281.0 88.9 275.9 101.5 L 266.7 124.6 C 289.8 107.8 327.6 102.7 354.9 118.3 C 349.4 140.9 323.0 158.2 294.0 167.0 C 247.4 180.0 191.9 161.9 167.6 140.5 C 161.3 134.6 157.9 125.8 157.1 117.4 Z"
          />
          <circle id="pomo-check-bg" cx="370" cy="390" r="65" />
        </defs>

        {/* Thân cà chua Pomodoro */}
        <circle cx="256" cy="295" r="155" fill="#EF3E36" />

        {/* Mặt đồng hồ */}
        <circle cx="256" cy="295" r="95" fill="#FFFFFF" />

        {/* Vạch giờ */}
        <rect x="251" y="215" width="10" height="20" rx="5" fill="#EF3E36" />
        <rect x="315" y="290" width="20" height="10" rx="5" fill="#EF3E36" />
        <rect x="251" y="355" width="10" height="20" rx="5" fill="#EF3E36" />
        <rect x="176" y="290" width="20" height="10" rx="5" fill="#EF3E36" />

        {/* Chốt & Kim đồng hồ */}
        <circle cx="256" cy="295" r="9" fill="#EF3E36" />
        <line
          x1="256"
          y1="295"
          x2="295"
          y2="256"
          stroke="#EF3E36"
          strokeWidth="18"
          strokeLinecap="round"
        />

        {/* Cuống lá xanh */}
        <use
          href="#pomo-leaf-shape"
          fill="#0b706b"
          stroke="#0b706b"
          strokeWidth="4"
          strokeLinejoin="round"
        />

        {/* Dấu tích hoàn thành Todo */}
        <g>
          <use href="#pomo-check-bg" fill="#0b706b" />
          <path
            d="M 340 395 L 360 415 L 400 365"
            fill="none"
            stroke="#FFFFFF"
            strokeWidth="16"
            strokeLinecap="round"
            strokeLinejoin="round"
          />
        </g>
      </svg>
    </div>
  );

  const containerClasses = `${
    isVertical
      ? "flex flex-col items-center justify-center gap-2 text-center"
      : "inline-flex items-center gap-2.5"
  } ${className}`;

  const inner = (
    <>
      {icon}
      {!iconOnly && (
        <span
          className={`font-black tracking-wider uppercase text-neutral-900 dark:text-white leading-none ${
            textClassName || "text-xl sm:text-2xl"
          }`}
        >
          pomo<span className="text-rose-600 dark:text-rose-500">-do</span>
        </span>
      )}
    </>
  );

  if (asLink) {
    return (
      <Link
        href="/"
        className={`${containerClasses} hover:opacity-90 transition-opacity focus:outline-none`}
        aria-label="Pomo-Do Trang chủ"
      >
        {inner}
      </Link>
    );
  }

  return <div className={containerClasses}>{inner}</div>;
}
