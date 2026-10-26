"use client";

import React from "react";
import { AiProductivityInsightDto } from "../../types/api";
import { useTranslation } from "../../stores/useLanguageStore";
import { Activity, Sun, Moon, AlertTriangle, Zap, Lightbulb, Compass } from "lucide-react";

interface AiCircadianInsightCardProps {
  insight: AiProductivityInsightDto | null;
  isLoading: boolean;
}

export function AiCircadianInsightCard({ insight, isLoading }: AiCircadianInsightCardProps) {
  const { t } = useTranslation();

  const getProfileBadge = (profile?: string) => {
    switch (profile) {
      case "Morning Achiever":
        return {
          title: "Người dậy sớm",
          sub: "Morning Achiever",
          IconComponent: Sun,
          color: "text-amber-500 bg-amber-500/10 border-amber-500/20",
        };
      case "Night Owl":
        return {
          title: "Cú đêm",
          sub: "Night Owl",
          IconComponent: Moon,
          color: "text-indigo-400 bg-indigo-500/10 border-indigo-500/20",
        };
      default:
        return {
          title: "Nhịp ổn định",
          sub: "Balanced Sprinter",
          IconComponent: Zap,
          color: "text-emerald-500 bg-emerald-500/10 border-emerald-500/20",
        };
    }
  };

  const profileInfo = getProfileBadge(insight?.circadianProfile);

  return (
    <section className="w-full bg-white/70 dark:bg-neutral-900/60 backdrop-blur-md rounded-3xl border border-neutral-200 dark:border-neutral-800 p-4 sm:p-6 md:p-8 shadow-xs transition-colors mb-8">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 mb-6">
        <div className="flex items-center gap-3">
          <div className="p-2.5 rounded-2xl bg-emerald-500/10 border border-emerald-500/20 text-emerald-500 dark:text-emerald-400 shrink-0">
            <Activity className="w-5 h-5" />
          </div>
          <div>
            <h2 className="text-xl md:text-2xl font-bold text-neutral-900 dark:text-white">
              {t.statistics.aiInsightsTitle}
            </h2>
            <p className="text-xs text-neutral-500 dark:text-neutral-400 mt-0.5">
              Phân tích nhịp sinh học và đề xuất lịch trình từ lịch sử & thị giác máy tính
            </p>
          </div>
        </div>

        <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-[11px] font-semibold bg-emerald-500/10 text-emerald-600 dark:text-emerald-400 border border-emerald-500/20 self-start sm:self-auto">
          <span className="w-1.5 h-1.5 rounded-full bg-emerald-500 animate-pulse" />
          Camera AI Vision
        </span>
      </div>

      {/* 3 Metric Cards Grid */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-6">
        {/* Card 1: Khung giờ vàng */}
        <div className="p-5 rounded-2xl bg-neutral-50/80 dark:bg-neutral-800/40 border border-neutral-200 dark:border-neutral-700/60 flex flex-col justify-between min-h-[148px]">
          <div className="flex items-center justify-between mb-2">
            <div className="flex items-center gap-2">
              <Sun className="w-4 h-4 text-amber-500" />
              <span className="text-xs font-bold uppercase tracking-wider text-neutral-500 dark:text-neutral-400">
                {t.statistics.goldenHourTitle}
              </span>
            </div>
            {insight && insight.goldenHourScore > 0 && (
              <span className="px-2 py-0.5 rounded-md text-[11px] font-bold bg-amber-500/10 text-amber-600 dark:text-amber-400 border border-amber-500/20 shrink-0">
                {insight.goldenHourScore}% điểm
              </span>
            )}
          </div>
          <div>
            <div className="text-2xl font-black text-neutral-900 dark:text-white tracking-tight">
              {insight?.goldenHourWindow || "Đang phân tích..."}
            </div>
            <p className="text-xs text-neutral-500 dark:text-neutral-400 mt-1.5 leading-relaxed min-h-[36px] flex items-center">
              {t.statistics.goldenHourDesc}
            </p>
          </div>
        </div>

        {/* Card 2: Khung giờ dễ xao nhãng */}
        <div className="p-5 rounded-2xl bg-neutral-50/80 dark:bg-neutral-800/40 border border-neutral-200 dark:border-neutral-700/60 flex flex-col justify-between min-h-[148px]">
          <div className="flex items-center justify-between mb-2">
            <div className="flex items-center gap-2">
              <AlertTriangle className="w-4 h-4 text-rose-400" />
              <span className="text-xs font-bold uppercase tracking-wider text-neutral-500 dark:text-neutral-400">
                {t.statistics.vulnerableTitle}
              </span>
            </div>
            <span className="px-2 py-0.5 rounded-md text-[11px] font-semibold bg-rose-500/10 text-rose-600 dark:text-rose-400 border border-rose-500/20 shrink-0">
              Cần lưu ý
            </span>
          </div>
          <div>
            <div className="text-2xl font-black text-neutral-900 dark:text-white tracking-tight">
              {insight?.vulnerableWindow || "Đang phân tích..."}
            </div>
            <p className="text-xs text-rose-500/90 dark:text-rose-400/90 mt-1.5 leading-relaxed min-h-[36px] flex items-center">
              {insight?.vulnerableReason || t.statistics.vulnerableDesc}
            </p>
          </div>
        </div>

        {/* Card 3: Hồ sơ nhịp sinh học */}
        <div className="p-5 rounded-2xl bg-neutral-50/80 dark:bg-neutral-800/40 border border-neutral-200 dark:border-neutral-700/60 flex flex-col justify-between min-h-[148px]">
          <div className="flex items-center justify-between mb-2">
            <div className="flex items-center gap-2">
              <Compass className="w-4 h-4 text-emerald-500" />
              <span className="text-xs font-bold uppercase tracking-wider text-neutral-500 dark:text-neutral-400">
                {t.statistics.circadianTitle}
              </span>
            </div>
            {insight && (
              <span className="px-2 py-0.5 rounded-md text-[11px] font-mono font-semibold bg-emerald-500/10 text-emerald-600 dark:text-emerald-400 border border-emerald-500/20 shrink-0">
                {insight.totalSessionsAnalyzed} phiên
              </span>
            )}
          </div>
          <div>
            <div className="text-2xl font-black text-neutral-900 dark:text-white tracking-tight flex items-center gap-2">
              <profileInfo.IconComponent className="w-5 h-5 text-emerald-500 shrink-0" />
              <span className="truncate">{profileInfo.title}</span>
            </div>
            <div className="mt-1.5 min-h-[36px] flex flex-col justify-center">
              <div className="flex items-center gap-2">
                <div className="flex-1 bg-neutral-200 dark:bg-neutral-700 h-1.5 rounded-full overflow-hidden">
                  <div
                    className="bg-emerald-500 h-full rounded-full transition-all duration-500"
                    style={{ width: `${Math.min(100, Math.max(10, insight?.deepFlowPercentage || 50))}%` }}
                  />
                </div>
                <span className="text-[11px] font-bold text-neutral-600 dark:text-neutral-300 shrink-0">
                  {insight?.deepFlowPercentage || 0}% Deep Flow
                </span>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Actionable AI Tip Banner */}
      <div className="p-4 rounded-2xl bg-gradient-to-r from-emerald-500/10 via-teal-500/5 to-transparent border border-emerald-500/20 flex items-start gap-3">
        <div className="p-1.5 rounded-xl bg-emerald-500/20 text-emerald-600 dark:text-emerald-400 mt-0.5 shrink-0">
          <Lightbulb className="w-4 h-4" />
        </div>
        <div>
          <h4 className="text-xs font-bold text-emerald-600 dark:text-emerald-400 uppercase tracking-wide">
            {t.statistics.aiRecommendation}
          </h4>
          <p className="text-sm text-neutral-700 dark:text-neutral-200 mt-0.5 leading-relaxed">
            {insight?.actionableTip ||
              "Hãy sắp xếp các công việc quan trọng và khó khăn vào khung giờ vàng của bạn để tối đa hóa hiệu suất tập trung."}
          </p>
        </div>
      </div>
    </section>
  );
}
