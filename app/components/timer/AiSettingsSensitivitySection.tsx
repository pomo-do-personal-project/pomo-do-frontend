"use client";

import React from "react";
import { useAiFocusStore } from "../../stores/useAiFocusStore";

export function AiSettingsSensitivitySection() {
  const { sensitivity, setSensitivity } = useAiFocusStore();

  return (
    <div className="p-3.5 sm:p-4 rounded-2xl bg-neutral-50 dark:bg-neutral-800/50 border border-neutral-200/70 dark:border-neutral-800 flex flex-col gap-2.5">
      <div className="flex items-center justify-between">
        <span className="text-xs font-bold text-neutral-900 dark:text-white">
          Độ nhạy nhận diện AI
        </span>
        <span className="text-[11px] font-mono text-neutral-500 capitalize">
          {sensitivity === "relaxed" ? "Thoải mái (2.0s delay)" : sensitivity === "strict" ? "Nghiêm ngặt (1.0s delay)" : "Tiêu chuẩn (1.5s delay)"}
        </span>
      </div>
      <div className="grid grid-cols-3 gap-2">
        {[
          { id: "relaxed", label: "Thoải mái", desc: "Dung sai rộng, bộ đệm 2s" },
          { id: "standard", label: "Tiêu chuẩn", desc: "Cân bằng chính xác" },
          { id: "strict", label: "Nghiêm ngặt", desc: "Khắt khe, bộ đệm 1s" },
        ].map((item) => (
          <button
            key={item.id}
            type="button"
            onClick={() => setSensitivity(item.id as "relaxed" | "standard" | "strict")}
            className={`py-2 px-2.5 rounded-xl text-left border cursor-pointer transition-all ${
              sensitivity === item.id
                ? "bg-amber-500/10 border-amber-500/50 text-amber-600 dark:text-amber-400"
                : "bg-white dark:bg-neutral-800 border-neutral-200 dark:border-neutral-700 text-neutral-700 dark:text-neutral-300 hover:border-neutral-300"
            }`}
          >
            <div className="text-xs font-semibold">{item.label}</div>
            <div className="text-[10px] text-neutral-400 truncate">{item.desc}</div>
          </button>
        ))}
      </div>
    </div>
  );
}

