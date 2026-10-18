"use client";

import React from "react";
import { ScreenId } from "../types";
import { MockSidebar } from "../mockups/MockSidebar";
import { PreviewScreenSwitcher } from "./PreviewScreenSwitcher";
import { MockFocusStatsScreen } from "../mockups/MockFocusStatsScreen";
import { MockTaskStatsScreen } from "../mockups/MockTaskStatsScreen";
import { MockTimerScreen } from "../mockups/MockTimerScreen";
import { MockTaskScreen } from "../mockups/MockTaskScreen";
import { MockMatrixScreen } from "../mockups/MockMatrixScreen";

interface PreviewDemoWindowProps {
  activeScreen: ScreenId;
  setActiveScreen: (screen: ScreenId) => void;
  setCurrentStepIndex: (idx: number) => void;
  cursorPos: { x: number; y: number };
  isCursorClicking: boolean;
  isSimulatedCursorActive: boolean;
  timerSeconds: number;
  isTimerRunning: boolean;
  activeTimerMode: "focus" | "break" | "stopwatch";
  isCameraAiOn: boolean;
  onToggleTimer: () => void;
  onResetTimer: () => void;
  onSelectTimerMode: (mode: "focus" | "break" | "stopwatch") => void;
  onToggleCameraAi: () => void;
  mockTasks: string[];
  setMockTasks: React.Dispatch<React.SetStateAction<string[]>>;
  matrixTasksQ1: string[];
  setMatrixTasksQ1: React.Dispatch<React.SetStateAction<string[]>>;
  demoHeatmapTooltip: boolean;
}

export const PreviewDemoWindow = React.memo(function PreviewDemoWindow({
  activeScreen,
  setActiveScreen,
  setCurrentStepIndex,
  cursorPos,
  isCursorClicking,
  isSimulatedCursorActive,
  timerSeconds,
  isTimerRunning,
  activeTimerMode,
  isCameraAiOn,
  onToggleTimer,
  onResetTimer,
  onSelectTimerMode,
  onToggleCameraAi,
  mockTasks,
  setMockTasks,
  matrixTasksQ1,
  setMatrixTasksQ1,
  demoHeatmapTooltip,
}: PreviewDemoWindowProps) {
  const handleSelectScreen = (screen: ScreenId, stepIdx: number) => {
    setActiveScreen(screen);
    setCurrentStepIndex(stepIdx);
  };

  return (
    <div className="w-full">
      <PreviewScreenSwitcher
        activeScreen={activeScreen}
        onSelectScreen={handleSelectScreen}
      />

      {/* KHUNG GIAO DIỆN 3D ĐẶT NGHIÊNG 8 ĐỘ */}
      <div className="mt-8 max-w-6xl mx-auto" style={{ perspective: "1600px" }}>
        <div
          className="rounded-3xl bg-white border border-neutral-200/90 shadow-2xl transition-all duration-700 ease-out hover:rotate-x-0 overflow-hidden text-left relative"
          style={{
            transform: "rotateX(8deg)",
            transformOrigin: "center top",
            boxShadow:
              "0 25px 60px -15px rgba(0, 0, 0, 0.12), 0 0 50px rgba(59, 130, 246, 0.1), 0 0 40px rgba(16, 185, 129, 0.08)",
          }}
        >
          {/* LỚP CHẶN TƯƠNG TÁC TỪ USER: Chỉ cho phép chuột ảo thao tác */}
          <div
            className="absolute inset-0 z-40 bg-transparent cursor-default select-none pointer-events-auto"
            onClick={(e) => {
              e.preventDefault();
              e.stopPropagation();
            }}
            onMouseDown={(e) => {
              e.preventDefault();
              e.stopPropagation();
            }}
            onTouchStart={(e) => {
              e.preventDefault();
              e.stopPropagation();
            }}
          />

          {/* CẤU TRÚC WORKSPACE: SIDEBAR + MOCKUP SCREEN */}
          <div className="flex min-h-[540px] bg-white relative select-none pointer-events-none">
            {/* CON CHUỘT ẢO MÔ PHỎNG */}
            {isSimulatedCursorActive && (
              <div
                className="pointer-events-none absolute z-50 transition-all duration-700 ease-out"
                style={{
                  left: `${cursorPos.x}%`,
                  top: `${cursorPos.y}%`,
                  transform: "translate(-2px, -2px)",
                }}
              >
                {isCursorClicking && (
                  <span className="absolute -top-3.5 -left-3.5 w-9 h-9 rounded-full border-2 border-neutral-900/40 bg-neutral-900/10 animate-ping pointer-events-none" />
                )}

                <svg
                  width="24"
                  height="24"
                  viewBox="0 0 24 24"
                  fill="none"
                  className={`drop-shadow-xl transition-transform duration-100 ${
                    isCursorClicking ? "scale-75 translate-y-0.5" : "scale-100"
                  }`}
                >
                  <path
                    d="M4.5 3.5L11.5 21L14.5 13.5L22 10.5L4.5 3.5Z"
                    fill="#18181b"
                    stroke="#ffffff"
                    strokeWidth="2"
                    strokeLinejoin="round"
                  />
                </svg>
              </div>
            )}

            {/* SIDEBAR TRÁI */}
            <MockSidebar activeScreen={activeScreen} />

            {/* MOCKUP CONTAINER */}
            <div className="flex-1 flex flex-col min-h-0 bg-neutral-50/40">
              {activeScreen === "stat-focus" && (
                <MockFocusStatsScreen
                  setActiveScreen={setActiveScreen}
                  demoHeatmapTooltip={demoHeatmapTooltip}
                  timerSeconds={timerSeconds}
                  isTimerRunning={isTimerRunning}
                />
              )}
              {activeScreen === "stat-task" && (
                <MockTaskStatsScreen
                  setActiveScreen={setActiveScreen}
                  timerSeconds={timerSeconds}
                  isTimerRunning={isTimerRunning}
                />
              )}
              {activeScreen === "timer" && (
                <MockTimerScreen
                  timerSeconds={timerSeconds}
                  isTimerRunning={isTimerRunning}
                  activeTimerMode={activeTimerMode}
                  isCameraAiOn={isCameraAiOn}
                  onToggleTimer={onToggleTimer}
                  onResetTimer={onResetTimer}
                  onSelectTimerMode={onSelectTimerMode}
                  onToggleCameraAi={onToggleCameraAi}
                />
              )}
              {activeScreen === "task" && (
                <MockTaskScreen
                  mockTasks={mockTasks}
                  setMockTasks={setMockTasks}
                  timerSeconds={timerSeconds}
                  isTimerRunning={isTimerRunning}
                />
              )}
              {activeScreen === "matrix" && (
                <MockMatrixScreen
                  matrixTasksQ1={matrixTasksQ1}
                  setMatrixTasksQ1={setMatrixTasksQ1}
                  timerSeconds={timerSeconds}
                  isTimerRunning={isTimerRunning}
                />
              )}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
});
