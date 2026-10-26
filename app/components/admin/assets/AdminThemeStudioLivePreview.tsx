"use client";

import React from "react";
import { Play, ShieldCheck, Palette, Layout, MousePointerClick, Cpu } from "lucide-react";
import { ThemeColors } from "../../../types/theme";
import { ThemeCluster } from "../../../lib/colorHarmonizer";

interface AdminThemeStudioLivePreviewProps {
  imageUrl: string | null;
  palette: ThemeColors | null;
  assetName: string;
  algorithm?: string;
  clusters?: ThemeCluster[];
}

export function AdminThemeStudioLivePreview({
  imageUrl,
  palette,
  assetName,
  algorithm,
  clusters,
}: AdminThemeStudioLivePreviewProps) {
  if (!imageUrl || !palette) {
    return (
      <div className="w-full aspect-16/10 rounded-2xl border-2 border-dashed border-neutral-300 dark:border-neutral-700 flex flex-col items-center justify-center p-6 text-center text-neutral-400 bg-neutral-50/50 dark:bg-neutral-900/50 gap-2">
        <Palette size={28} className="opacity-40 animate-pulse text-amber-500" />
        <p className="text-xs font-medium">
          Tải ảnh lên từ máy tính hoặc dán liên kết URL để bắt đầu phân tích màu sắc và xem trước giao diện.
        </p>
      </div>
    );
  }

  const isPythonAi = algorithm?.includes("Python AI") ?? true;

  return (
    <div className="flex flex-col gap-3">
      {/* Live Workspace Mockup */}
      <div className="relative w-full aspect-16/10 rounded-2xl overflow-hidden border border-neutral-200/80 dark:border-neutral-700/80 shadow-md">
        {/* eslint-disable-next-line @next/next/no-img-element */}
        <img src={imageUrl} alt={assetName} className="w-full h-full object-cover" />
        <div className="absolute inset-0 backdrop-blur-[2px]" style={{ backgroundColor: "rgba(0, 0, 0, 0.4)" }} />

        {/* Live Mockup Header */}
        <div className="absolute top-2.5 left-3 right-3 flex items-center justify-between text-[11px] text-white/90 z-10">
          <div className="flex items-center gap-1.5 font-semibold drop-shadow-xs">
            <span className="w-2 h-2 rounded-full bg-emerald-400" />
            <span className="truncate max-w-[140px]">{assetName || "Workspace Preview"}</span>
          </div>
          <span className="flex items-center gap-1 text-[10px] bg-black/40 px-2 py-0.5 rounded-full border border-white/20">
            <ShieldCheck size={11} className="text-emerald-400" />
            <span>WCAG 2.1 AA (4.5:1+)</span>
          </span>
        </div>

        {/* Left Miniature Sidebar Mockup */}
        <div
          className="absolute left-2.5 top-9 bottom-2.5 w-7 rounded-xl border flex flex-col items-center py-2 gap-2 shadow-md z-10 transition-colors"
          style={{ backgroundColor: palette.surfaceBg, borderColor: palette.borderSubtle }}
          title="Sidebar surfaceBg"
        >
          <div
            className="w-4 h-4 rounded-md flex items-center justify-center shadow-xs"
            style={{ backgroundColor: palette.accentPrimary }}
          >
            <div className="w-1.5 h-1.5 rounded-full bg-white" />
          </div>
          <div className="w-3.5 h-1 rounded-full bg-white/20" />
          <div className="w-3.5 h-1 rounded-full bg-white/20" />
          <div className="w-3.5 h-1 rounded-full bg-white/20" />
        </div>

        {/* Centered Miniature Pomodoro Timer Preview */}
        <div className="absolute inset-0 flex items-center justify-center p-4 pl-10">
          <div
            className="flex flex-col items-center gap-2 p-3.5 sm:p-4 rounded-2xl border shadow-lg backdrop-blur-md transition-all"
            style={{ backgroundColor: palette.surfaceBg, borderColor: palette.borderSubtle }}
          >
            <span className="text-[10px] font-semibold tracking-wider uppercase" style={{ color: palette.textMuted }}>
              Focus Session
            </span>
            <span className="font-mono text-2xl sm:text-3xl font-light tracking-tighter" style={{ color: palette.textHighlight }}>
              25:00
            </span>
            <div
              className="flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-semibold shadow-xs cursor-pointer hover:scale-105 transition-transform"
              style={{ backgroundColor: palette.accentPrimary, color: "#ffffff" }}
              title="Accent Primary Button"
            >
              <Play size={10} fill="currentColor" />
              <span className="text-[10px]">Bắt đầu</span>
            </div>
          </div>
        </div>
      </div>

      {/* AI Extraction Algorithm & K-Means Clusters */}
      <div className="flex flex-col gap-2 p-2.5 rounded-xl bg-neutral-100/70 dark:bg-neutral-900/60 border border-neutral-200 dark:border-neutral-800 text-[11px]">
        <div className="flex items-center justify-between text-neutral-500 font-semibold text-[10px]">
          <span className="flex items-center gap-1.5 text-emerald-600 dark:text-emerald-400 font-bold">
            <Cpu size={13} />
            <span>{algorithm || "Python AI (CIELAB K-Means++)"}</span>
          </span>
          <span className="text-neutral-400 text-[10px]">{isPythonAi ? "K-Means++ (k=5)" : "Canvas HSL"}</span>
        </div>

        {clusters && clusters.length > 0 && (
          <div className="flex items-center gap-1.5 pt-1">
            {clusters.map((c, idx) => (
              <div
                key={idx}
                className="flex-1 flex flex-col items-center gap-1 p-1 rounded-lg border border-neutral-200/50 dark:border-neutral-700/50 bg-white/60 dark:bg-neutral-800/60"
                title={`Cụm #${idx + 1}: ${c.hex} - Tỷ trọng: ${c.weight}%`}
              >
                <div
                  className="w-full h-3 rounded-sm shadow-xs"
                  style={{ backgroundColor: c.hex }}
                />
                <span className="text-[9px] font-mono text-neutral-600 dark:text-neutral-300">
                  {c.weight}%
                </span>
              </div>
            ))}
          </div>
        )}

        {/* 60-30-10 distribution cards */}
        <div className="grid grid-cols-3 gap-2 mt-1">
          <div className="flex items-center gap-2 p-1.5 rounded-lg bg-white dark:bg-neutral-800 border border-neutral-200/60 dark:border-neutral-700/60">
            <div
              className="w-5 h-5 rounded-md shrink-0 shadow-xs flex items-center justify-center text-white"
              style={{ backgroundColor: palette.accentPrimary }}
            >
              <MousePointerClick size={11} />
            </div>
            <div className="min-w-0">
              <span className="block font-bold text-neutral-800 dark:text-neutral-200 truncate">10% Accent</span>
              <span className="block text-[9px] text-neutral-400 font-mono truncate">{palette.accentPrimary}</span>
            </div>
          </div>

          <div className="flex items-center gap-2 p-1.5 rounded-lg bg-white dark:bg-neutral-800 border border-neutral-200/60 dark:border-neutral-700/60">
            <div
              className="w-5 h-5 rounded-md shrink-0 shadow-xs flex items-center justify-center text-white"
              style={{ backgroundColor: palette.surfaceBg }}
            >
              <Layout size={11} />
            </div>
            <div className="min-w-0">
              <span className="block font-bold text-neutral-800 dark:text-neutral-200 truncate">30% Sidebar</span>
              <span className="block text-[9px] text-neutral-400 font-mono truncate">{palette.surfaceBg}</span>
            </div>
          </div>

          <div className="flex items-center gap-2 p-1.5 rounded-lg bg-white dark:bg-neutral-800 border border-neutral-200/60 dark:border-neutral-700/60">
            <div
              className="w-5 h-5 rounded-md shrink-0 shadow-xs border border-white/20"
              style={{ backgroundColor: palette.canvasBg }}
            />
            <div className="min-w-0">
              <span className="block font-bold text-neutral-800 dark:text-neutral-200 truncate">60% Canvas</span>
              <span className="block text-[9px] text-neutral-400 font-mono truncate">{palette.canvasBg}</span>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
