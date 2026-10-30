"use client";

import React, { useState, useEffect, useRef } from "react";
import { useRouter } from "next/navigation";
import { useTranslation } from "../../stores/useLanguageStore";
import { useAuthStore } from "../../stores/useAuthStore";
import { AuthModal } from "../../components/AuthModal";
import { ScreenId, DemoStep } from "../../components/preview/types";
import { createPreviewTourSteps } from "../../components/preview/tourSteps";
import { PreviewHeader } from "../../components/preview/sections/PreviewHeader";
import { PreviewHero } from "../../components/preview/sections/PreviewHero";
import { PreviewDemoWindow } from "../../components/preview/sections/PreviewDemoWindow";
import { PreviewFeatureTimer } from "../../components/preview/sections/PreviewFeatureTimer";
import { PreviewFeatureMatrix } from "../../components/preview/sections/PreviewFeatureMatrix";
import { PreviewFeatureStats } from "../../components/preview/sections/PreviewFeatureStats";
import { PreviewPricing } from "../../components/preview/sections/PreviewPricing";
import { PreviewCTA } from "../../components/preview/sections/PreviewCTA";
import { PreviewFooter } from "../../components/preview/sections/PreviewFooter";

export default function LandingPreviewPage() {
  const router = useRouter();
  const { language, setLanguage } = useTranslation();
  const isAuthenticated = useAuthStore((s) => s.isAuthenticated);
  const [mounted, setMounted] = useState(false);
  const [isAuthModalOpen, setIsAuthModalOpen] = useState(false);
  const [authModalMode, setAuthModalMode] = useState<"signin" | "signup">("signin");

  useEffect(() => {
    setMounted(true);
  }, []);

  const isAuth = mounted && isAuthenticated;

  // State màn hình tương tác (5 giao diện)
  const [activeScreen, setActiveScreen] = useState<ScreenId>("timer");

  // State đồng hồ đếm ngược
  const [timerSeconds, setTimerSeconds] = useState(4 * 60);
  const [isTimerRunning, setIsTimerRunning] = useState(true);
  const [activeTimerMode, setActiveTimerMode] = useState<"focus" | "break" | "stopwatch">("focus");
  const [isCameraAiOn, setIsCameraAiOn] = useState(false);

  useEffect(() => {
    let interval: NodeJS.Timeout | null = null;
    if (isTimerRunning) {
      interval = setInterval(() => {
        setTimerSeconds((prev) => (prev > 0 ? prev - 1 : 4 * 60));
      }, 1000);
    }
    return () => {
      if (interval) clearInterval(interval);
    };
  }, [isTimerRunning]);

  const handleToggleTimer = () => setIsTimerRunning((prev) => !prev);
  const handleResetTimer = () => {
    setIsTimerRunning(false);
    setTimerSeconds(activeTimerMode === "focus" ? 4 * 60 : activeTimerMode === "break" ? 5 * 60 : 0);
  };
  const handleSelectTimerMode = (mode: "focus" | "break" | "stopwatch") => {
    setActiveTimerMode(mode);
    setTimerSeconds(mode === "focus" ? 4 * 60 : mode === "break" ? 5 * 60 : 0);
  };

  // State mock data
  const [mockTasks, setMockTasks] = useState<string[]>([]);
  const [matrixTasksQ1, setMatrixTasksQ1] = useState<string[]>(["Task"]);
  const [demoHeatmapTooltip, setDemoHeatmapTooltip] = useState(false);

  // Hệ thống mô phỏng con chuột tự động
  const [cursorPos, setCursorPos] = useState<{ x: number; y: number }>({ x: 50, y: 50 });
  const [isCursorClicking, setIsCursorClicking] = useState(false);
  const [, setCurrentStepIndex] = useState(0);

  const demoStepsRef = useRef<DemoStep[]>([]);
  useEffect(() => {
    demoStepsRef.current = createPreviewTourSteps({
      setIsTimerRunning,
      setIsCameraAiOn,
      setActiveScreen,
      setMockTasks,
      setMatrixTasksQ1,
      setDemoHeatmapTooltip,
    });
  }, []);

  useEffect(() => {
    const timer = setInterval(() => {
      if (!demoStepsRef.current.length) return;
      setCurrentStepIndex((prev) => {
        const next = (prev + 1) % demoStepsRef.current.length;
        const step = demoStepsRef.current[next];

        setCursorPos({ x: step.x, y: step.y });

        if (step.isClick) {
          setIsCursorClicking(true);
          setTimeout(() => setIsCursorClicking(false), 450);
          if (step.action) step.action();
        } else {
          setIsCursorClicking(false);
        }

        return next;
      });
    }, 1800);

    return () => clearInterval(timer);
  }, []);

  const handleOpenAuthModal = (mode: "signin" | "signup") => {
    setAuthModalMode(mode);
    setIsAuthModalOpen(true);
  };

  const handleSelectFooterScreen = (screen: ScreenId, stepIdx: number) => {
    setActiveScreen(screen);
    setCurrentStepIndex(stepIdx);
    const element = document.getElementById("mockup-3d");
    if (element) {
      element.scrollIntoView({ behavior: "smooth" });
    }
  };

  return (
    <div className="min-h-screen bg-white text-neutral-900 font-sans selection:bg-rose-500/20 selection:text-rose-600 overflow-x-hidden">
      {/* 1. Header Navigation */}
      <PreviewHeader
        language={language}
        setLanguage={setLanguage}
        onOpenAuthModal={handleOpenAuthModal}
      />

      {/* 2. Semantic Main Landmark for Accessibility (WCAG 2.2) */}
      <main id="main-content">
        {/* Hero & 3D Interactive Mockup */}
        <section id="mockup-3d" className="relative pt-12 pb-24 bg-white overflow-hidden">
          <div
            className="absolute top-[280px] left-[15%] w-[480px] h-[360px] bg-blue-500/15 rounded-full blur-[140px] pointer-events-none"
            style={{ mixBlendMode: "multiply" }}
          />
          <div
            className="absolute top-[320px] right-[15%] w-[520px] h-[380px] bg-emerald-500/15 rounded-full blur-[150px] pointer-events-none"
            style={{ mixBlendMode: "multiply" }}
          />

          <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
            <PreviewHero
              language={language}
              isAuthenticated={isAuth}
              onOpenAuthModal={handleOpenAuthModal}
            />

            <PreviewDemoWindow
              activeScreen={activeScreen}
              setActiveScreen={setActiveScreen}
              setCurrentStepIndex={setCurrentStepIndex}
              cursorPos={cursorPos}
              isCursorClicking={isCursorClicking}
              isSimulatedCursorActive={true}
              timerSeconds={timerSeconds}
              isTimerRunning={isTimerRunning}
              activeTimerMode={activeTimerMode}
              isCameraAiOn={isCameraAiOn}
              onToggleTimer={handleToggleTimer}
              onResetTimer={handleResetTimer}
              onSelectTimerMode={handleSelectTimerMode}
              onToggleCameraAi={() => setIsCameraAiOn((prev) => !prev)}
              mockTasks={mockTasks}
              setMockTasks={setMockTasks}
              matrixTasksQ1={matrixTasksQ1}
              setMatrixTasksQ1={setMatrixTasksQ1}
              demoHeatmapTooltip={demoHeatmapTooltip}
            />
          </div>
        </section>

        {/* 3. Core Feature Showcases */}
        <section id="features" className="py-24 border-t border-neutral-200 bg-neutral-50/40">
          <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 space-y-28">
            <PreviewFeatureTimer />
            <PreviewFeatureMatrix timerSec={timerSeconds} />
            <PreviewFeatureStats timerSec={timerSeconds} />
          </div>
        </section>

        {/* 4. Pricing */}
        <PreviewPricing onOpenAuthModal={handleOpenAuthModal} />

        {/* 5. CTA Callout */}
        <PreviewCTA
          language={language}
          isAuthenticated={isAuth}
          onOpenAuthModal={handleOpenAuthModal}
        />
      </main>

      {/* 6. Footer */}
      <PreviewFooter onSelectScreen={handleSelectFooterScreen} />

      {/* 7. Auth Modal */}
      <AuthModal
        isOpen={isAuthModalOpen}
        onClose={() => setIsAuthModalOpen(false)}
        initialMode={authModalMode}
        onAuthSuccess={() => {
          router.push(`/${language}`);
        }}
      />
    </div>
  );
}
