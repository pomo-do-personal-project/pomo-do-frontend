"use client";

import React, { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import { Sidebar } from "../components/Sidebar";
import { TimerCenter } from "../components/TimerCenter";
import { OverviewPanel } from "../components/OverviewPanel";
import { TaskPage } from "../components/TaskPage";
import { MatrixPage } from "../components/MatrixPage";
import { StatisticPage } from "../components/StatisticPage";
import { AuthModal } from "../components/AuthModal";
import { SettingsModal, SettingsTab } from "../components/SettingsModal";
import { OfflineBanner } from "../components/OfflineBanner";
import { SystemBroadcastBanner } from "../components/SystemBroadcastBanner";
import { WelcomeSplash } from "../components/WelcomeSplash";
import { MiniTimerWidget } from "../components/workspace/MiniTimerWidget";
import { AmbientSoundWidget } from "../components/workspace/AmbientSoundWidget";
import { useAuthStore } from "../stores/useAuthStore";
import { useSettingsStore } from "../stores/useSettingsStore";
import { useTranslation } from "../stores/useLanguageStore";
import { useOAuthHashListener } from "../hooks/useOAuthHashListener";
import { initThemePalette } from "../lib/themeManager";
import { ChevronsRight, PanelRightOpen, PanelRightClose } from "lucide-react";
import { MobileBottomNav } from "../components/MobileBottomNav";

export default function Home() {
  useOAuthHashListener();
  const router = useRouter();
  const { t, language } = useTranslation();
  const [activeView, setActiveView] = useState("dashboard");
  const [isSidebarOpen, setIsSidebarOpen] = useState(true);
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
  const wallpaperUrl = useSettingsStore((s) => s.settings.wallpaperUrl);

  const [mounted, setMounted] = useState(false);

  // Khởi tạo bảng màu chủ đề đã lưu (nếu có)
  useEffect(() => {
    initThemePalette();
    setMounted(true);
  }, []);

  // Tự động điều hướng: Chưa đăng nhập -> Landing Preview; Admin -> Admin Portal
  useEffect(() => {
    if (mounted && !isAuthenticated) {
      router.replace(`/${language}/preview`);
    } else if (mounted && isAuthenticated && user?.isAdmin) {
      router.replace(`/${language}/admin/users`);
    }
  }, [mounted, isAuthenticated, user?.isAdmin, language, router]);

  if (!mounted || !isAuthenticated) return null;

  return (
    <div
      className="min-h-screen text-neutral-900 dark:text-neutral-100 flex relative overflow-x-hidden transition-colors duration-300"
      style={{ backgroundColor: "var(--canvas-bg, #fafafa)" }}
    >
      {/* Dynamic Workspace Wallpaper Backdrop */}
      {wallpaperUrl && (
        <div
          className="fixed inset-0 z-0 bg-cover bg-center transition-all duration-700 pointer-events-none"
          style={{ backgroundImage: `url(${wallpaperUrl})` }}
        >
          <div className="absolute inset-0 bg-gradient-to-b from-black/20 via-transparent to-black/35 pointer-events-none" />
        </div>
      )}

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
            router.push(`/${language}/preview`);
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

      {/* Main Page Content Wrapper */}
      <div
        className={`flex-1 flex flex-col min-w-0 max-w-full overflow-x-hidden min-h-screen relative z-10 transition-all duration-300 ease-in-out pb-16 md:pb-0 ${isSidebarOpen ? "md:ml-16 ml-0" : "ml-0"
          } ${isOverviewOpen && activeView === "dashboard" ? "mr-0 md:mr-80 lg:mr-96" : "mr-0"}`}
      >
        {/* Offline Network & Broadcast Banners */}
        <OfflineBanner />
        <SystemBroadcastBanner />

        {/* Top Header Bar */}
        <header
          className="w-full h-14 px-3 sm:px-5 flex items-center justify-between shrink-0 transition-colors duration-300"
          style={{
            borderBottom: wallpaperUrl ? "1px solid rgba(255, 255, 255, 0.12)" : "1px solid var(--border-subtle, rgba(0,0,0,0.1))",
            color: wallpaperUrl ? "#ffffff" : "inherit",
          }}
        >
          {/* Left: Trigger button when sidebar is closed (Desktop only) */}
          <div className="flex items-center gap-3">
            {!isSidebarOpen ? (
              <button
                onClick={() => setIsSidebarOpen(true)}
                title={t.nav.expandSidebar}
                aria-label={t.nav.expandSidebar}
                className={`hidden md:flex p-2 rounded-xl transition-all duration-200 cursor-pointer group ${wallpaperUrl
                  ? "text-white/80 hover:text-white hover:bg-white/10"
                  : "text-neutral-500 hover:text-neutral-900 hover:bg-black/5"
                  }`}
              >
                <ChevronsRight
                  size={18}
                  strokeWidth={1.75}
                  className="opacity-70 group-hover:opacity-100 transition-opacity"
                />
              </button>
            ) : (
              <div className="w-6" />
            )}
          </div>

          {/* Center: Mini Timer Widget when not on dashboard */}
          {activeView !== "dashboard" ? (
            <MiniTimerWidget onNavigateToDashboard={() => setActiveView("dashboard")} />
          ) : (
            <div />
          )}

          {/* Right Action: Ambient Audio Widget & Overview Toggle */}
          <div className="flex items-center gap-2">
            <AmbientSoundWidget />

            {activeView === "dashboard" ? (
              <button
                type="button"
                onClick={() => setIsOverviewOpen((prev) => !prev)}
                title={isOverviewOpen ? t.overviewPanel.closePanel : t.nav.openOverview}
                aria-label={isOverviewOpen ? t.overviewPanel.closePanel : t.nav.openOverview}
                className={`w-9 h-9 rounded-xl flex items-center justify-center transition-all duration-200 cursor-pointer ${isOverviewOpen
                  ? "bg-neutral-900 text-white shadow-xs"
                  : wallpaperUrl
                    ? "text-white/80 hover:text-white hover:bg-white/10"
                    : "text-neutral-500 hover:text-neutral-900 hover:bg-black/5"
                  }`}
              >
                {isOverviewOpen ? (
                  <PanelRightClose size={18} strokeWidth={1.75} className="shrink-0" />
                ) : (
                  <PanelRightOpen size={18} strokeWidth={1.75} className="shrink-0" />
                )}
              </button>
            ) : null}
          </div>
        </header>

        {/* 2. Main Content Landmark */}
        <main className="flex-1 flex flex-col min-w-0 min-h-0 w-full max-w-full">
          <div
            className={`flex-1 flex items-center justify-center p-2 sm:p-4 overflow-y-auto ${activeView === "dashboard" ? "" : "hidden"
              }`}
          >
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

      {/* 7. Mobile Bottom Navigation */}
      <MobileBottomNav
        activeItem={activeView}
        onSelectItem={(viewId) => {
          setActiveView(viewId);
          setIsOverviewOpen(false);
        }}
        onOpenSettings={() => {
          setSettingsInitialTab("account");
          setIsSettingsModalOpen(true);
        }}
      />
    </div>
  );
}
