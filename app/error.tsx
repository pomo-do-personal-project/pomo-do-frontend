"use client";

import React, { useEffect } from "react";
import { AlertCircle, RotateCcw } from "lucide-react";

interface ErrorProps {
  error: Error & { digest?: string };
  reset: () => void;
}

export default function ErrorPage({ error, reset }: ErrorProps) {
  useEffect(() => {
    // Ghi log lỗi runtime để tiện debug
    console.error("Pomo-do Application Error:", error);
  }, [error]);

  return (
    <div className="min-h-screen flex flex-col items-center justify-center p-6 bg-neutral-50 dark:bg-neutral-950 text-neutral-900 dark:text-neutral-100 text-center select-none">
      <div className="w-16 h-16 rounded-3xl bg-rose-500/15 dark:bg-rose-950/40 border border-rose-500/30 flex items-center justify-center text-rose-600 dark:text-rose-400 mb-6 shadow-xs">
        <AlertCircle size={32} strokeWidth={2} />
      </div>

      <h1 className="text-2xl sm:text-3xl font-extrabold tracking-tight mb-2 text-neutral-900 dark:text-white">
        Đã có lỗi bất ngờ xảy ra
      </h1>

      <p className="text-sm text-neutral-500 dark:text-neutral-400 max-w-md mb-8">
        Hệ thống gặp sự cố trong quá trình kết xuất giao diện. Bạn hãy thử tải lại trang hoặc bấm nút thử lại dưới đây.
      </p>

      <div className="flex items-center gap-3">
        <button
          onClick={() => reset()}
          className="inline-flex items-center gap-2 px-6 py-3 rounded-2xl bg-neutral-900 hover:bg-neutral-800 text-white dark:bg-white dark:text-neutral-900 dark:hover:bg-neutral-200 text-sm font-semibold transition-all duration-200 shadow-md hover:shadow-lg active:scale-98 cursor-pointer"
        >
          <RotateCcw size={16} strokeWidth={2.2} />
          <span>Thử lại (Retry)</span>
        </button>
      </div>
    </div>
  );
}
