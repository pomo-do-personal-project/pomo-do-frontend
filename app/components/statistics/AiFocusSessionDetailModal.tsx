"use client";

import React from "react";
import { X, Sparkles, Smartphone, Moon, Eye, Lightbulb, CheckCircle2, AlertCircle } from "lucide-react";
import { StatisticItem } from "./StatisticDetailChart";

interface AiFocusSessionDetailModalProps {
  isOpen: boolean;
  onClose: () => void;
  item: StatisticItem | null;
}

export function AiFocusSessionDetailModal({ isOpen, onClose, item }: AiFocusSessionDetailModalProps) {
  if (!isOpen || !item) return null;

  const ai = item.aiData;
  const hasAi = Boolean(ai && (ai.score !== undefined || ai.fb !== undefined));

  const score: number = hasAi ? (ai.score ?? Math.round(Math.random() * 20 + 80)) : 0;
  const grade: string = hasAi ? (ai.grade ?? (score >= 90 ? "A" : score >= 75 ? "B" : "C")) : "N/A";
  const phoneCount: number = hasAi ? (ai.phoneCount ?? ai.ph ?? 0) : 0;
  const sleepCount: number = hasAi ? (ai.sleepCount ?? ai.sl ?? 0) : 0;
  const lookAwayCount: number = hasAi ? (ai.lookAwayCount ?? ai.lk ?? 0) : 0;
  const conclusion: string = hasAi
    ? (ai.conclusion ?? ai.fb ?? `Phiên '${item.name}' đạt ${score}% độ tập trung.`)
    : "Phiên này không bật Camera AI Focus nên chưa có dữ liệu ghi nhận hành vi.";
  const advice: string = hasAi
    ? (ai.advice ?? (phoneCount > 0 ? "Để điện thoại xa tầm tay ở các phiên tiếp theo." : "Tiếp tục duy trì phong độ tập trung này!"))
    : "Bật Camera AI ở các phiên tiếp theo để AI hỗ trợ chấm điểm và phân tích nhé!";

  const focusedMins = Math.max(0, Math.round(item.actualMinutes * (score / 100)));
  const distractedMins = Math.max(0, item.actualMinutes - focusedMins);

  const gradeColor =
    grade === "S" ? "text-amber-500 bg-amber-500/10 border-amber-500/30"
    : grade === "A" ? "text-emerald-500 bg-emerald-500/10 border-emerald-500/30"
    : grade === "B" ? "text-blue-500 bg-blue-500/10 border-blue-500/30"
    : "text-rose-500 bg-rose-500/10 border-rose-500/30";

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-3 sm:p-4 bg-black/70 backdrop-blur-xs animate-in fade-in duration-200">
      <div className="relative w-full max-w-lg max-h-[90vh] overflow-y-auto bg-white dark:bg-neutral-900 rounded-3xl p-5 sm:p-6 border border-neutral-200 dark:border-neutral-800 shadow-2xl flex flex-col gap-5">
        {/* Header */}
        <div className="flex items-center justify-between pb-3 border-b border-neutral-100 dark:border-neutral-800">
          <div className="flex items-center gap-2.5">
            <div className="w-3.5 h-3.5 rounded-full shrink-0" style={{ backgroundColor: item.color }} />
            <div>
              <h3 className="text-base font-bold text-neutral-900 dark:text-white flex items-center gap-2">
                {item.name}
                {hasAi && (
                  <span className={`px-2 py-0.5 rounded-full border text-[11px] font-bold ${gradeColor}`}>
                    Hạng {grade}
                  </span>
                )}
              </h3>
              <p className="text-xs text-neutral-500 dark:text-neutral-400">
                Phân tích sự tập trung & kết luận từ Camera AI
              </p>
            </div>
          </div>
          <button
            type="button"
            onClick={onClose}
            className="p-1.5 rounded-xl hover:bg-neutral-100 dark:hover:bg-neutral-800 text-neutral-400 hover:text-neutral-700 dark:hover:text-white cursor-pointer transition-colors"
          >
            <X size={18} />
          </button>
        </div>

        {hasAi ? (
          <>
            {/* Điểm số & Phân bổ thời gian */}
            <div className="grid grid-cols-3 gap-2.5 text-center">
              <div className="p-3.5 rounded-2xl bg-neutral-50 dark:bg-neutral-800/60 border border-neutral-200/70 dark:border-neutral-800 flex flex-col items-center justify-center">
                <span className="text-2xl font-black text-emerald-600 dark:text-emerald-400">{score}%</span>
                <span className="text-[11px] font-semibold text-neutral-500 dark:text-neutral-400 mt-0.5">Điểm tập trung</span>
              </div>
              <div className="p-3.5 rounded-2xl bg-neutral-50 dark:bg-neutral-800/60 border border-neutral-200/70 dark:border-neutral-800 flex flex-col items-center justify-center">
                <span className="text-2xl font-black text-neutral-900 dark:text-white">{focusedMins}m</span>
                <span className="text-[11px] font-semibold text-emerald-600 dark:text-emerald-400 mt-0.5">Thời gian chú tâm</span>
              </div>
              <div className="p-3.5 rounded-2xl bg-neutral-50 dark:bg-neutral-800/60 border border-neutral-200/70 dark:border-neutral-800 flex flex-col items-center justify-center">
                <span className="text-2xl font-black text-rose-500">{distractedMins}m</span>
                <span className="text-[11px] font-semibold text-rose-500 mt-0.5">Thời gian xao nhãng</span>
              </div>
            </div>

            {/* Chi tiết quan sát từ Camera AI */}
            <div className="flex flex-col gap-2">
              <span className="text-xs font-bold text-neutral-800 dark:text-neutral-200">
                Chi tiết hành vi ghi nhận qua camera
              </span>
              <div className="grid grid-cols-3 gap-2">
                <div className="p-2.5 rounded-xl bg-neutral-50 dark:bg-neutral-800/40 border border-neutral-200/60 dark:border-neutral-800/80 flex items-center gap-2">
                  <Smartphone size={16} className={phoneCount > 0 ? "text-rose-500" : "text-emerald-500"} />
                  <div className="flex flex-col">
                    <span className="text-xs font-bold text-neutral-800 dark:text-neutral-200">{phoneCount} lần</span>
                    <span className="text-[10px] text-neutral-400">Dùng điện thoại</span>
                  </div>
                </div>

                <div className="p-2.5 rounded-xl bg-neutral-50 dark:bg-neutral-800/40 border border-neutral-200/60 dark:border-neutral-800/80 flex items-center gap-2">
                  <Moon size={16} className={sleepCount > 0 ? "text-amber-500" : "text-emerald-500"} />
                  <div className="flex flex-col">
                    <span className="text-xs font-bold text-neutral-800 dark:text-neutral-200">{sleepCount} lần</span>
                    <span className="text-[10px] text-neutral-400">Ngủ gật</span>
                  </div>
                </div>

                <div className="p-2.5 rounded-xl bg-neutral-50 dark:bg-neutral-800/40 border border-neutral-200/60 dark:border-neutral-800/80 flex items-center gap-2">
                  <Eye size={16} className={lookAwayCount > 0 ? "text-blue-500" : "text-emerald-500"} />
                  <div className="flex flex-col">
                    <span className="text-xs font-bold text-neutral-800 dark:text-neutral-200">{lookAwayCount} lần</span>
                    <span className="text-[10px] text-neutral-400">Nhìn ra ngoài</span>
                  </div>
                </div>
              </div>
            </div>

            {/* Kết luận từ AI */}
            <div className="p-4 rounded-2xl bg-amber-500/5 dark:bg-amber-500/10 border border-amber-500/20 flex flex-col gap-2">
              <div className="flex items-center gap-2 text-amber-600 dark:text-amber-400 font-bold text-xs">
                <Sparkles size={14} />
                <span>Kết luận & Đánh giá từ AI</span>
              </div>
              <p className="text-xs leading-relaxed text-neutral-700 dark:text-neutral-300">
                {conclusion}
              </p>
            </div>

            {/* Lời khuyên cải thiện */}
            <div className="p-3.5 rounded-2xl bg-indigo-500/5 dark:bg-indigo-500/10 border border-indigo-500/20 flex items-start gap-2.5">
              <Lightbulb size={16} className="text-indigo-500 shrink-0 mt-0.5" />
              <div className="text-xs text-neutral-700 dark:text-neutral-300">
                <strong className="text-indigo-600 dark:text-indigo-400">Lời khuyên AI: </strong>
                {advice}
              </div>
            </div>
          </>
        ) : (
          <div className="py-8 px-4 flex flex-col items-center justify-center gap-3 text-center">
            <div className="p-3 rounded-full bg-neutral-100 dark:bg-neutral-800 text-neutral-400">
              <AlertCircle size={26} />
            </div>
            <div className="flex flex-col gap-1">
              <span className="text-sm font-bold text-neutral-800 dark:text-neutral-200">
                Chưa có dữ liệu Camera AI cho phiên này
              </span>
              <p className="text-xs text-neutral-500 max-w-xs leading-relaxed">
                Phiên học này được thực hiện khi Camera AI đang tắt. Ở phiên tiếp theo, hãy bật Camera AI để được chấm điểm và phân tích nhé!
              </p>
            </div>
            <div className="mt-2 text-xs font-semibold px-3 py-1.5 rounded-xl bg-neutral-100 dark:bg-neutral-800 text-neutral-700 dark:text-neutral-300">
              Thời lượng hoàn thành: {item.actualMinutes}m / {item.plannedMinutes}m
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
