"use client";

import React from "react";
import { useNetworkStore } from "../stores/useNetworkStore";
import { useTaskStore } from "../stores/useTaskStore";

export function OfflineBanner() {
  const isServerOnline = useNetworkStore((s) => s.isServerOnline);
  const isChecking = useNetworkStore((s) => s.isChecking);
  const checkHealth = useNetworkStore((s) => s.checkHealth);
  const fetchTasks = useTaskStore((s) => s.fetchTasks);

  if (isServerOnline) return null;

  const handleRetry = async () => {
    const online = await checkHealth();
    if (online) {
      await fetchTasks();
    }
  };

  return (
    <div className="w-full bg-amber-500 text-neutral-950 px-4 py-2 text-xs font-medium flex items-center justify-between shadow-md border-b border-amber-600/40 z-50 sticky top-0 animate-in slide-in-from-top-2 duration-200">
      <div className="flex items-center gap-2 max-w-full truncate">
        <span className="flex h-2 w-2 relative shrink-0">
          <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-rose-600 opacity-75" />
          <span className="relative inline-flex rounded-full h-2 w-2 bg-rose-700" />
        </span>
        <span className="font-semibold">Mất kết nối máy chủ backend:</span>
        <span className="text-neutral-900/90 truncate">
          Bạn đang ở chế độ ngoại tuyến. Các thay đổi có thể chưa được lưu vào máy chủ.
        </span>
      </div>

      <button
        onClick={handleRetry}
        disabled={isChecking}
        className="px-3 py-1 bg-neutral-950 text-white rounded-lg hover:bg-neutral-800 active:scale-95 transition-all text-xs font-bold shrink-0 ml-3 cursor-pointer shadow-xs disabled:opacity-60"
      >
        {isChecking ? "Đang kiểm tra..." : "Thử kết nối lại ↺"}
      </button>
    </div>
  );
}
