"use client";

import React, { useState } from "react";
import { Sidebar } from "./components/Sidebar";
import { TimerCenter } from "./components/TimerCenter";
import { OverviewPanel } from "./components/OverviewPanel";
import { TaskPage } from "./components/TaskPage";
import { MatrixPage } from "./components/MatrixPage";
import { StatisticPage } from "./components/StatisticPage";
import { AuthModal } from "./components/AuthModal";
import { useAuthStore } from "./stores/useAuthStore";

export default function Home() {
  const [activeView, setActiveView] = useState("dashboard"); // "dashboard" | "task" | "matrix" | ...
  const [isSidebarOpen, setIsSidebarOpen] = useState(false);
  const [isOverviewOpen, setIsOverviewOpen] = useState(false);
  const [isAuthModalOpen, setIsAuthModalOpen] = useState(false);
  const [isSoundMuted, setIsSoundMuted] = useState(false);
  const [isDarkMode, setIsDarkMode] = useState(false);

  // Zustand Auth Store
  const user = useAuthStore((s) => s.user);
  const logout = useAuthStore((s) => s.logout);
  const isAuthenticated = useAuthStore((s) => s.isAuthenticated);

  // Initialize theme
  React.useEffect(() => {
    const savedTheme = localStorage.getItem("theme");
    const prefersDark = window.matchMedia("(prefers-color-scheme: dark)").matches;
    if (savedTheme === "dark" || (!savedTheme && prefersDark)) {
      setIsDarkMode(true);
      document.documentElement.classList.add("dark");
    } else {
      setIsDarkMode(false);
      document.documentElement.classList.remove("dark");
    }
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
        onSelectItem={(viewId) => {
          if (viewId === "info") {
            // Khi ấn Account Info: hiện modal đăng ký/đăng nhập
            setIsAuthModalOpen(true);
            return;
          }
          if (viewId === "logout") {
            logout();
            alert("Đã đăng xuất tài khoản thành công!");
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
        {/* Top Header Bar (Hẹp gọn gàng với h-14 thay vì h-18) */}
        <header className="w-full h-14 px-5 flex items-center justify-between border-b border-neutral-200/50 dark:border-neutral-800/50 shrink-0">
          {/* Left: The only trigger button when sidebar is closed (faint by default, bold on hover) */}
          <div className="flex items-center gap-3">
            {!isSidebarOpen ? (
              <button
                onClick={() => setIsSidebarOpen(true)}
                title="Expand Sidebar"
                className="p-1.5 rounded-xl text-neutral-400 hover:text-neutral-900 dark:text-neutral-500 dark:hover:text-neutral-100 transition-all duration-200 cursor-pointer group"
              >
                <span className="font-mono text-sm tracking-tighter opacity-50 group-hover:opacity-100 group-hover:font-extrabold transition-all select-none">
                  &gt;&gt;
                </span>
              </button>
            ) : (
              <div className="w-6" />
            )}
          </div>

          {/* Right Action Icons: Theme Toggle, Speaker (Sound) & Three-dot (Overview Panel) */}
          <div className="flex items-center gap-1.5">
            {/* Theme Toggle Button (Dark / Light) */}
            <button
              onClick={toggleTheme}
              title={isDarkMode ? "Switch to Light mode" : "Switch to Dark mode"}
              className="w-9 h-9 rounded-xl flex items-center justify-center text-neutral-500 hover:text-neutral-900 dark:text-neutral-400 dark:hover:text-neutral-100 hover:bg-neutral-100 dark:hover:bg-neutral-800 transition-colors cursor-pointer"
            >
              <span className="text-sm select-none">
                {isDarkMode ? "☀️" : "🌙"}
              </span>
            </button>

            {/* Speaker Button */}
            <button
              onClick={() => setIsSoundMuted((prev) => !prev)}
              title={isSoundMuted ? "Unmute sound" : "Mute sound"}
              className="w-9 h-9 rounded-xl flex items-center justify-center text-neutral-500 hover:text-neutral-900 dark:text-neutral-400 dark:hover:text-neutral-100 hover:bg-neutral-100 dark:hover:bg-neutral-800 transition-colors cursor-pointer"
            >
              <span className="text-sm select-none">
                {isSoundMuted ? "🔇" : "🔊"}
              </span>
            </button>

            {/* Three-dot Button to toggle Overview panel (Chỉ hiển thị hoặc áp dụng cho Dashboard) */}
            <button
              onClick={() => setIsOverviewOpen((prev) => !prev)}
              title={isOverviewOpen ? "Close Overview" : "Open Overview"}
              className={`w-9 h-9 rounded-xl flex items-center justify-center transition-colors cursor-pointer ${isOverviewOpen && activeView === "dashboard"
                  ? "bg-neutral-200 dark:bg-neutral-700 text-neutral-900 dark:text-white"
                  : "text-neutral-500 hover:text-neutral-900 dark:text-neutral-400 dark:hover:text-neutral-100 hover:bg-neutral-100 dark:hover:bg-neutral-800"
                }`}
            >
              <span className="font-mono font-bold text-base tracking-widest select-none">
                ....
              </span>
            </button>
          </div>
        </header>

        {/* 2. Main Content View: Dashboard (Timer), TaskPage, MatrixPage OR StatisticPage */}
        {activeView === "task" ? (
          <TaskPage />
        ) : activeView === "matrix" ? (
          <MatrixPage />
        ) : activeView === "statistic" ? (
          <StatisticPage />
        ) : (
          <main className="flex-1 flex items-center justify-center p-4">
            <TimerCenter />
          </main>
        )}
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
    </div>
  );
}
