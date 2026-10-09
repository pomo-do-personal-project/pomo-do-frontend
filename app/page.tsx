"use client";

import React, { useState } from "react";
import { Sidebar } from "./components/Sidebar";
import { TimerCenter } from "./components/TimerCenter";
import { OverviewPanel } from "./components/OverviewPanel";
import { TaskPage } from "./components/TaskPage";
import { MatrixPage } from "./components/MatrixPage";
import { StatisticPage } from "./components/StatisticPage";
import { AuthModal } from "./components/AuthModal";
import { SettingsModal } from "./components/SettingsModal";
import { OfflineBanner } from "./components/OfflineBanner";
import { WelcomeSplash } from "./components/WelcomeSplash";
import { useAuthStore } from "./stores/useAuthStore";
import { useSettingsStore } from "./stores/useSettingsStore";
import { usePomodoroStore } from "./stores/usePomodoroStore";
import {
  Settings,
  Sun,
  Moon,
  Volume2,
  VolumeX,
  MoreHorizontal,
  ChevronsRight,
  Play,
  Pause,
  Timer,
} from "lucide-react";

export default function Home() {
  const [activeView, setActiveView] = useState("dashboard"); // "dashboard" | "task" | "matrix" | ...
  const [isSidebarOpen, setIsSidebarOpen] = useState(false);
  const [isOverviewOpen, setIsOverviewOpen] = useState(false);
  const [isAuthModalOpen, setIsAuthModalOpen] = useState(false);
  const [isSettingsModalOpen, setIsSettingsModalOpen] = useState(false);
  const [isSoundMuted, setIsSoundMuted] = useState(false);
  const [isDarkMode, setIsDarkMode] = useState(false);
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

  React.useEffect(() => {
    const isDark = document.documentElement.classList.contains("dark");
    setIsDarkMode(isDark);
  }, []);

  const toggleTheme = () => {
    if (isDarkMode) {
      document.documentElement.classList.remove("dark");
      localStorage.setItem("theme", "light");
      setIsDarkMode(false);
    } else {
      document.documentElement.classList.add("dark");
      localStorage.setItem("theme", "dark");
      setIsDarkMode(true);
    }
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
            // Khi ấn Account Info: hiện modal đăng ký/đăng nhập
            setIsAuthModalOpen(true);
            return;
          }
          if (viewId === "logout") {
            await logout();
            return;
          }
          setActiveView(viewId);
          // Tự động đóng overview panel khi chuyển view để màn hình thoáng đãng
          setIsOverviewOpen(false);
        }}
      />

      {/* Main Page Content Wrapper (smoothly shifts/stretches with both sidebar and overview panel) */}
      <div
        className={`flex-1 flex flex-col min-h-screen transition-all duration-300 ease-in-out ${isSidebarOpen ? "ml-16" : "ml-0"
          } ${isOverviewOpen && activeView === "dashboard" ? "mr-80 sm:mr-96" : "mr-0"}`}
      >
        {/* Offline Network Warning Banner */}
        <OfflineBanner />

        {/* Top Header Bar (Hẹp gọn gàng với h-14 thay vì h-18) */}
        <header className="w-full h-14 px-5 flex items-center justify-between border-b border-neutral-200/50 dark:border-neutral-800/50 shrink-0">
          {/* Left: The only trigger button when sidebar is closed (faint by default, bold on hover) */}
          <div className="flex items-center gap-3">
            {!isSidebarOpen ? (
              <button
                onClick={() => setIsSidebarOpen(true)}
                title="Mở rộng Sidebar"
                aria-label="Mở rộng thanh điều hướng"
                className="p-2 rounded-xl text-neutral-400 hover:text-neutral-900 dark:text-neutral-500 dark:hover:text-neutral-100 hover:bg-neutral-100 dark:hover:bg-neutral-800 transition-all duration-200 cursor-pointer group"
              >
                <ChevronsRight size={18} strokeWidth={1.75} className="opacity-70 group-hover:opacity-100 transition-opacity" />
              </button>
            ) : (
              <div className="w-6" />
            )}
          </div>

          {/* Center: Mini Timer Widget (Hiển thị nổi bật khi người dùng đang ở tab Task, Matrix hoặc Statistic) */}
          {activeView !== "dashboard" && (
            <div
              onClick={() => setActiveView("dashboard")}
              title="Nhấn để quay về màn hình Đồng hồ"
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
                <span>{timerType === "pomo" ? `Pomo (${timerFocusMode})` : "Stopwatch"}:</span>
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
                  title="Tạm dừng"
                  className="p-1 rounded hover:bg-neutral-200 dark:hover:bg-neutral-700 text-neutral-600 dark:text-neutral-300"
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
                  title="Tiếp tục"
                  className="p-1 rounded hover:bg-neutral-200 dark:hover:bg-neutral-700 text-neutral-600 dark:text-neutral-300"
                >
                  <Play size={12} strokeWidth={2.5} />
                </button>
              )}
            </div>
          )}

          {/* Right Action Icons: Theme Toggle, Settings, Speaker (Sound) & Three-dot (Overview Panel) */}
          <div className="flex items-center gap-1.5">
            {/* Settings Button */}
            <button
              onClick={() => setIsSettingsModalOpen(true)}
              title="Cài đặt Pomodoro & Thời lượng"
              aria-label="Cài đặt thời lượng Pomodoro"
              className="w-9 h-9 rounded-xl flex items-center justify-center text-neutral-500 hover:text-neutral-900 dark:text-neutral-400 dark:hover:text-neutral-100 hover:bg-neutral-100 dark:hover:bg-neutral-800 transition-colors cursor-pointer"
            >
              <Settings size={18} strokeWidth={1.75} />
            </button>

            {/* Theme Toggle Button (Dark / Light) with pure CSS classes to prevent icon flickers */}
            <button
              onClick={toggleTheme}
              title={isDarkMode ? "Chuyển sang giao diện Sáng" : "Chuyển sang giao diện Tối"}
              aria-label={isDarkMode ? "Chuyển sang giao diện Sáng" : "Chuyển sang giao diện Tối"}
              className="w-9 h-9 rounded-xl flex items-center justify-center text-neutral-500 hover:text-neutral-900 dark:text-neutral-400 dark:hover:text-neutral-100 hover:bg-neutral-100 dark:hover:bg-neutral-800 transition-colors cursor-pointer"
            >
              <Sun size={18} strokeWidth={1.75} className="hidden dark:block text-amber-400" />
              <Moon size={18} strokeWidth={1.75} className="block dark:hidden text-neutral-600" />
            </button>

            {/* Speaker Button */}
            <button
              onClick={() => setIsSoundMuted((prev) => !prev)}
              title={isSoundMuted ? "Bật âm thanh chuông báo" : "Tắt âm thanh chuông báo"}
              aria-label={isSoundMuted ? "Bật âm thanh" : "Tắt âm thanh"}
              className="w-9 h-9 rounded-xl flex items-center justify-center text-neutral-500 hover:text-neutral-900 dark:text-neutral-400 dark:hover:text-neutral-100 hover:bg-neutral-100 dark:hover:bg-neutral-800 transition-colors cursor-pointer"
            >
              {isSoundMuted ? (
                <VolumeX size={18} strokeWidth={1.75} />
              ) : (
                <Volume2 size={18} strokeWidth={1.75} />
              )}
            </button>

            {/* Three-dot Button to toggle Overview panel (Chỉ hiển thị hoặc áp dụng cho Dashboard) */}
            <button
              onClick={() => setIsOverviewOpen((prev) => !prev)}
              title={isOverviewOpen ? "Đóng bảng Overview" : "Mở bảng Overview"}
              aria-label={isOverviewOpen ? "Đóng Overview" : "Mở Overview"}
              className={`w-9 h-9 rounded-xl flex items-center justify-center transition-colors cursor-pointer ${
                isOverviewOpen && activeView === "dashboard"
                  ? "bg-neutral-200 dark:bg-neutral-700 text-neutral-900 dark:text-white"
                  : "text-neutral-500 hover:text-neutral-900 dark:text-neutral-400 dark:hover:text-neutral-100 hover:bg-neutral-100 dark:hover:bg-neutral-800"
              }`}
            >
              <MoreHorizontal size={18} strokeWidth={1.75} />
            </button>
          </div>
        </header>

        {/* 2. Main Content View: Dashboard (Timer), TaskPage, MatrixPage OR StatisticPage */}
        {/* Giữ TimerCenter luôn mounted trong DOM (ẩn hiện bằng CSS) để bộ đếm tiếp tục chạy ngầm khi người dùng sang tab khác */}
        <main className={`flex-1 flex items-center justify-center p-4 ${activeView === "dashboard" ? "" : "hidden"}`}>
          <TimerCenter />
        </main>

        {activeView === "task" && <TaskPage />}
        {activeView === "matrix" && <MatrixPage />}
        {activeView === "statistic" && <StatisticPage />}
      </div>

      {/* 3. Overview Panel (Right Slide-out): Chỉ kích hoạt ở trang Dashboard */}
      {activeView === "dashboard" && (
        <OverviewPanel
          isOpen={isOverviewOpen}
          onClose={() => setIsOverviewOpen(false)}
        />
      )}

      {/* 4. Auth Modal: Đăng ký / Đăng nhập (Mặc định hiển thị Đăng ký trước) */}
      <AuthModal
        isOpen={isAuthModalOpen}
        initialMode="signup"
        onClose={() => setIsAuthModalOpen(false)}
      />

      {/* 5. Settings Modal: Cài đặt thời lượng Pomodoro / Nghỉ ngắn / Nghỉ dài */}
      <SettingsModal
        isOpen={isSettingsModalOpen}
        onClose={() => setIsSettingsModalOpen(false)}
      />

      {/* 6. Welcome Splash Loading Screen (Hiển thị đầu tiên khi vào web, video đặt dưới đáy màn hình) */}
      {showWelcome && (
        <WelcomeSplash
          minDurationMs={2600}
          onFinish={() => setShowWelcome(false)}
        />
      )}
    </div>
  );
}
