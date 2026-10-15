"use client";

import React, { useState } from "react";
import { Sidebar } from "../components/Sidebar";
import { TimerCenter } from "../components/TimerCenter";
import { OverviewPanel } from "../components/OverviewPanel";
import { TaskPage } from "../components/TaskPage";
import { MatrixPage } from "../components/MatrixPage";
import { StatisticPage } from "../components/StatisticPage";
import { AuthModal } from "../components/AuthModal";
import { SettingsModal, SettingsTab } from "../components/SettingsModal";
import { OfflineBanner } from "../components/OfflineBanner";
import { WelcomeSplash } from "../components/WelcomeSplash";
import { useAuthStore } from "../stores/useAuthStore";
import { usePomodoroStore } from "../stores/usePomodoroStore";
import { useTranslation } from "../stores/useLanguageStore";
import {
  ChevronsRight,
  Play,
  Pause,
  Timer,
  PanelRightOpen,
  PanelRightClose,
} from "lucide-react";

export default function Home() {
  const { t } = useTranslation();
  const [activeView, setActiveView] = useState("dashboard"); // "dashboard" | "task" | "matrix" | ...
  const [isSidebarOpen, setIsSidebarOpen] = useState(false);
  const [isOverviewOpen, setIsOverviewOpen] = useState(false);
  const [isAuthModalOpen, setIsAuthModalOpen] = useState(false);
  const [authInitialMode, setAuthInitialMode] = useState<
    "signup" | "otp-verify" | "signin" | "forgot" | "reset"
  >("signup");
  const [isSettingsModalOpen, setIsSettingsModalOpen] = useState(false);
  const [settingsInitialTab, setSettingsInitialTab] = useState<SettingsTab>("account");
  const [showWelcome, setShowWelcome] = useState(true);

  // Zustand Stores
  const user = useAuthStore((s) => s.user);
  const logout = useAuthStore((s) => s.logout);
  const isAuthenticated = useAuthStore((s) => s.isAuthenticated);

  // Global Pomodoro Timer State để hiển thị Mini Timer trên Header khi sang trang khác
  const isTimerRunning = usePomodoroStore((s) => s.isRunning);
  const timerSeconds = usePomodoroStore((s) => s.seconds);
  const isOvertime = usePomodoroStore((s) => s.isOvertime);
  const overtimeSeconds = usePomodoroStore((s) => s.overtimeSeconds);
  const timerFocusMode = usePomodoroStore((s) => s.focusMode);
  const timerType = usePomodoroStore((s) => s.timerType);
  const setIsRunning = usePomodoroStore((s) => s.setIsRunning);

  const formatMiniTime = (totalSeconds: number) => {
    const mins = Math.floor(totalSeconds / 60);
    const secs = totalSeconds % 60;
    return `${mins.toString().padStart(2, "0")}:${secs.toString().padStart(2, "0")}`;
  };

  return (
    <div className="min-h-screen bg-neutral-50/50 dark:bg-neutral-950 text-neutral-900 dark:text-neutral-100 flex relative overflow-x-hidden transition-colors duration-200">
      {/* 1. Sidebar with true width stretch transition */}
      <Sidebar
        isOpen={isSidebarOpen}
        onToggle={() => setIsSidebarOpen((prev) => !prev)}
        activeItem={activeView}
        onSelectItem={async (viewId) => {
          if (viewId === "info") {
            setIsAuthModalOpen(true);
            return;
          }
          if (viewId === "logout") {
            await logout();
            return;
          }
          if (viewId === "settings") {
            setSettingsInitialTab("account");
            setIsSettingsModalOpen(true);
            return;
          }
          if (viewId === "premiums") {
            return;
          }
          setActiveView(viewId);
          setIsOverviewOpen(false);
        }}
      />

      {/* Main Page Content Wrapper (smoothly shifts/stretches with both sidebar and overview panel) */}
      <div
        className={`flex-1 flex flex-col min-h-screen transition-all duration-300 ease-in-out ${
          isSidebarOpen ? "ml-16" : "ml-0"
        } ${isOverviewOpen && activeView === "dashboard" ? "mr-80 sm:mr-96" : "mr-0"}`}
      >
        {/* Offline Network Warning Banner */}
        <OfflineBanner />

        {/* Top Header Bar */}
        <header className="w-full h-14 px-5 flex items-center justify-between border-b border-neutral-200/50 dark:border-neutral-800/50 shrink-0">
          {/* Left: Trigger button when sidebar is closed */}
          <div className="flex items-center gap-3">
            {!isSidebarOpen ? (
              <button
                onClick={() => setIsSidebarOpen(true)}
                title={t.nav.expandSidebar}
                aria-label={t.nav.expandSidebar}
                className="p-2 rounded-xl text-neutral-400 hover:text-neutral-900 dark:text-neutral-500 dark:hover:text-neutral-100 hover:bg-neutral-100 dark:hover:bg-neutral-800 transition-all duration-200 cursor-pointer group"
              >
                <ChevronsRight size={18} strokeWidth={1.75} className="opacity-70 group-hover:opacity-100 transition-opacity" />
              </button>
            ) : (
              <div className="w-6" />
            )}
          </div>

          {/* Center: Mini Timer Widget */}
          {activeView !== "dashboard" && (
            <div
              onClick={() => setActiveView("dashboard")}
              title={t.nav.dashboard}
              className={`flex items-center gap-2 px-3 py-1 rounded-xl border transition-all duration-200 cursor-pointer shadow-2xs group ${
                isOvertime
                  ? "bg-rose-500/10 border-rose-500/30 text-rose-600 dark:text-rose-400 animate-pulse"
                  : isTimerRunning
                  ? "bg-neutral-100 dark:bg-neutral-800/80 border-neutral-300 dark:border-neutral-700 text-neutral-900 dark:text-white"
                  : "bg-neutral-50 dark:bg-neutral-900 border-neutral-200 dark:border-neutral-800 text-neutral-500 hover:text-neutral-900 dark:hover:text-white"
              }`}
            >
              <span className="flex items-center gap-1.5 font-bold text-xs uppercase tracking-wider">
                <Timer size={14} strokeWidth={2} className={isTimerRunning ? "text-emerald-500 animate-spin-slow" : "text-neutral-400"} />
                <span>{timerType === "pomo" ? (timerFocusMode === "W" ? t.timer.focus : t.timer.break) : t.timer.stopwatch}:</span>
              </span>
              <span className="font-mono text-xs font-semibold">
                {isOvertime ? `+${formatMiniTime(overtimeSeconds)} OT` : formatMiniTime(timerSeconds)}
              </span>
              {isTimerRunning ? (
                <button
                  type="button"
                  onClick={(e) => {
                    e.stopPropagation();
                    setIsRunning(false);
                  }}
                  title={t.timer.pause}
                  aria-label={t.timer.pause}
                  className="p-1 rounded hover:bg-neutral-200 dark:hover:bg-neutral-700 text-neutral-600 dark:text-neutral-300 cursor-pointer"
                >
                  <Pause size={12} strokeWidth={2.5} />
                </button>
              ) : (
                <button
                  type="button"
                  onClick={(e) => {
                    e.stopPropagation();
                    setIsRunning(true);
                  }}
                  title={t.timer.start}
                  aria-label={t.timer.start}
                  className="p-1 rounded hover:bg-neutral-200 dark:hover:bg-neutral-700 text-neutral-600 dark:text-neutral-300 cursor-pointer"
                >
                  <Play size={12} strokeWidth={2.5} />
                </button>
              )}
            </div>
          )}

          {/* Right Action: Panel Toggle */}
          <div className="flex items-center">
            {activeView === "dashboard" ? (
              <button
                type="button"
                onClick={() => setIsOverviewOpen((prev) => !prev)}
                title={isOverviewOpen ? t.overviewPanel.closePanel : t.nav.openOverview}
                aria-label={isOverviewOpen ? t.overviewPanel.closePanel : t.nav.openOverview}
                className={`w-9 h-9 rounded-xl flex items-center justify-center transition-all duration-200 cursor-pointer ${
                  isOverviewOpen
                    ? "bg-neutral-900 text-white dark:bg-white dark:text-neutral-900 shadow-xs"
                    : "text-neutral-500 hover:text-neutral-900 dark:text-neutral-400 dark:hover:text-neutral-100 hover:bg-neutral-100 dark:hover:bg-neutral-800"
                }`}
              >
                {isOverviewOpen ? (
                  <PanelRightClose size={18} strokeWidth={1.75} className="shrink-0" />
                ) : (
                  <PanelRightOpen size={18} strokeWidth={1.75} className="shrink-0" />
                )}
              </button>
            ) : (
              <div className="w-9 h-9" />
            )}
          </div>
        </header>

        {/* 2. Main Content Landmark */}
        <main className="flex-1 flex flex-col min-h-0">
          <div className={`flex-1 flex items-center justify-center p-4 ${activeView === "dashboard" ? "" : "hidden"}`}>
            <TimerCenter />
          </div>

          {activeView === "task" && (
            <TaskPage onNavigateToTimer={() => setActiveView("dashboard")} />
          )}
          {activeView === "matrix" && <MatrixPage />}
          {activeView === "statistic" && <StatisticPage />}
        </main>
      </div>

      {/* 3. Overview Panel */}
      {activeView === "dashboard" && (
        <OverviewPanel
          isOpen={isOverviewOpen}
          onClose={() => setIsOverviewOpen(false)}
        />
      )}

      {/* 4. Auth Modal */}
      <AuthModal
        isOpen={isAuthModalOpen}
        initialMode={authInitialMode}
        onClose={() => setIsAuthModalOpen(false)}
      />

      {/* 5. Settings Modal */}
      <SettingsModal
        isOpen={isSettingsModalOpen}
        initialTab={settingsInitialTab}
        onClose={() => setIsSettingsModalOpen(false)}
      />

      {/* 6. Welcome Splash Loading Screen */}
      {showWelcome && (
        <WelcomeSplash
          minDurationMs={2600}
          onFinish={() => setShowWelcome(false)}
        />
      )}
    </div>
  );
}
