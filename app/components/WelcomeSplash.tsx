"use client";

import React, { useEffect, useState } from "react";

interface WelcomeSplashProps {
  onFinish?: () => void;
  minDurationMs?: number;
}

export function WelcomeSplash({ onFinish, minDurationMs = 2800 }: WelcomeSplashProps) {
  const [isFadingOut, setIsFadingOut] = useState(false);
  const [hasStarted, setHasStarted] = useState(false);
  const [handAngle, setHandAngle] = useState(0);
  const [animTime, setAnimTime] = useState(0);

  useEffect(() => {
    setHasStarted(true);

    let animationFrameId: number;
    let angle = 0;

    const animate = () => {
      const now = Date.now();
      angle = (angle + 2.5) % 360;
      setHandAngle(angle);
      setAnimTime(now);
      animationFrameId = requestAnimationFrame(animate);
    };

    animationFrameId = requestAnimationFrame(animate);

    // Tự động chuyển cảnh sau khi intro phát 1 đoạn mượt mà
    const timer = setTimeout(() => {
      setIsFadingOut(true);
      const exitTimer = setTimeout(() => {
        onFinish?.();
      }, 700); // Thời gian fade out mượt mà 700ms
      return () => clearTimeout(exitTimer);
    }, minDurationMs);

    return () => {
      cancelAnimationFrame(animationFrameId);
      clearTimeout(timer);
    };
  }, [minDurationMs, onFinish]);

  return (
    <div
      role="dialog"
      aria-modal="true"
      aria-label="Welcome Loading"
      className={`fixed inset-0 z-50 flex flex-col items-center justify-center bg-[#FAF8F5] dark:bg-neutral-950 select-none transition-all duration-700 ease-out ${
        isFadingOut ? "opacity-0 scale-105 pointer-events-none" : "opacity-100 scale-100"
      }`}
    >
      {/* Main Container căn giữa toàn màn hình */}
      <div className="relative z-10 flex flex-col items-center justify-center transition-transform duration-700 ease-out">
        {/* Vòng tròn Progress Ring bao quanh Logo */}
        <div className="relative w-72 h-72 sm:w-80 sm:h-80 flex items-center justify-center">
          {/* SVG Vòng tròn Loading Progress */}
          <svg className="absolute inset-0 w-full h-full -rotate-90 pointer-events-none" viewBox="0 0 200 200">
            {/* Vòng ray mờ tĩnh: Tự động đổi theo Light/Dark theme */}
            <circle
              cx="100"
              cy="100"
              r="90"
              fill="none"
              stroke="currentColor"
              className="text-neutral-200 dark:text-white/10"
              strokeWidth="3.5"
            />
            {/* Vòng tiến độ chạy sáng (Circular Ring) */}
            <circle
              cx="100"
              cy="100"
              r="90"
              fill="none"
              stroke="#EF3E36"
              strokeWidth="4"
              strokeLinecap="round"
              strokeDasharray={2 * Math.PI * 90}
              strokeDashoffset={hasStarted ? 0 : 2 * Math.PI * 90}
              className="transition-all ease-out"
              style={{
                transitionDuration: `${minDurationMs}ms`,
              }}
            />
          </svg>

          {/* Logo Pomodoro Vector với hiệu ứng bồng bềnh */}
          <div className="relative w-52 h-52 sm:w-60 sm:h-60 flex items-center justify-center">
            <svg
              xmlns="http://www.w3.org/2000/svg"
              viewBox="0 39 512 512"
              className="w-full h-full"
              style={{
                transform: `translateY(${Math.sin(animTime * 0.004) * 5}px) scale(${1 + Math.sin(animTime * 0.003) * 0.025}) rotate(${Math.sin(animTime * 0.002) * 2}deg)`,
                transformOrigin: "50% 50%",
                willChange: "transform",
              }}
            >
              <defs>
                <path
                  id="leaf-shape"
                  d="M 157.1 117.4 C 180.6 105.7 207.9 109.9 230.2 122.0 C 238.1 104.0 243.2 84.2 259.1 82.1 C 270.5 79.6 281.0 88.9 275.9 101.5 L 266.7 124.6 C 289.8 107.8 327.6 102.7 354.9 118.3 C 349.4 140.9 323.0 158.2 294.0 167.0 C 247.4 180.0 191.9 161.9 167.6 140.5 C 161.3 134.6 157.9 125.8 157.1 117.4 Z"
                />
                <circle id="check-bg" cx="370" cy="390" r="65" />
              </defs>

              {/* Thân cà chua */}
              <circle cx="256" cy="295" r="155" fill="#EF3E36" />

              {/* Mặt đồng hồ */}
              <circle cx="256" cy="295" r="95" fill="#FFFFFF" />

              {/* Vạch giờ */}
              <rect x="251" y="215" width="10" height="20" rx="5" fill="#EF3E36" />
              <rect x="315" y="290" width="20" height="10" rx="5" fill="#EF3E36" />
              <rect x="251" y="355" width="10" height="20" rx="5" fill="#EF3E36" />
              <rect x="176" y="290" width="20" height="10" rx="5" fill="#EF3E36" />

              {/* Chốt kim đồng hồ */}
              <circle cx="256" cy="295" r="9" fill="#EF3E36" />

              {/* Kim đồng hồ xoay */}
              <g transform={`rotate(${handAngle}, 256, 295)`}>
                <line x1="256" y1="295" x2="295" y2="256" stroke="#EF3E36" strokeWidth="18" strokeLinecap="round" />
              </g>

              {/* Cuống lá */}
              <use href="#leaf-shape" fill="#0b706b" stroke="#0b706b" strokeWidth="4" strokeLinejoin="round" />

              {/* Dấu tích */}
              <g>
                <use href="#check-bg" fill="#0b706b" />
                <path d="M 340 395 L 360 415 L 400 365" fill="none" stroke="#FFFFFF" strokeWidth="16" strokeLinecap="round" strokeLinejoin="round" />
              </g>
            </svg>
          </div>
        </div>

        {/* Chữ thương hiệu tối giản phía dưới: Thích ứng Dark/Light Mode */}
        <div className="mt-8 flex flex-col items-center gap-1.5 tracking-wider">
          <span className="text-xl sm:text-2xl font-bold tracking-tight text-neutral-900 dark:text-white/95">
            Pomo<span className="text-[#EF3E36]">-do</span>
          </span>
          <span className="text-xs uppercase tracking-widest text-neutral-500 dark:text-neutral-400 font-medium">
            Stay focused, do more
          </span>
        </div>
      </div>
    </div>
  );
}
