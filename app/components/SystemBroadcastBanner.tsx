"use client";

import React, { useState, useEffect } from "react";
import { adminService } from "../services/adminService";
import { SystemBroadcast } from "../types/admin";
import { Info, AlertTriangle, Wrench, X } from "lucide-react";

export function SystemBroadcastBanner() {
  const [broadcast, setBroadcast] = useState<SystemBroadcast | null>(null);
  const [isDismissed, setIsDismissed] = useState(false);

  useEffect(() => {
    let isMounted = true;

    const fetchBroadcast = () => {
      adminService
        .getActiveBroadcast()
        .then((data) => {
          if (isMounted) {
            if (data && data.isActive) {
              const dismissedTime = sessionStorage.getItem("dismissed_broadcast_time");
              if (dismissedTime !== data.updatedAt) {
                setBroadcast(data);
                setIsDismissed(false);
              }
            } else {
              setBroadcast(null);
            }
          }
        })
        .catch(() => {
          // Silent fail if network unavailable
        });
    };

    fetchBroadcast();
    // Poll every 60s for emergency announcements or maintenance updates
    const interval = setInterval(fetchBroadcast, 60000);

    return () => {
      isMounted = false;
      clearInterval(interval);
    };
  }, []);

  if (!broadcast || !broadcast.isActive || isDismissed) return null;

  const handleDismiss = () => {
    setIsDismissed(true);
    sessionStorage.setItem("dismissed_broadcast_time", broadcast.updatedAt);
  };

  const typeConfig = {
    info: {
      icon: Info,
      bg: "bg-blue-600 text-white",
    },
    warning: {
      icon: AlertTriangle,
      bg: "bg-amber-700 text-white",
    },
    maintenance: {
      icon: Wrench,
      bg: "bg-rose-700 text-white",
    },
  };

  const config = typeConfig[broadcast.type] || typeConfig.info;
  const Icon = config.icon;

  return (
    <div
      role="status"
      aria-live="polite"
      className={`w-full ${config.bg} px-4 py-2 flex items-center justify-between text-xs font-medium z-40 transition-all shadow-xs`}
    >
      <div className="max-w-6xl mx-auto flex items-center gap-2.5 min-w-0 flex-1 mr-2">
        <Icon size={14} className="shrink-0 mt-0.5 self-start sm:self-center" />
        <div className="break-words text-xs leading-normal">
          {broadcast.message.includes(" - ") ? (
            <>
              <strong className="font-bold mr-1.5">{broadcast.message.split(" - ")[0]}:</strong>
              <span>{broadcast.message.split(" - ").slice(1).join(" - ")}</span>
            </>
          ) : (
            <span>{broadcast.message}</span>
          )}
        </div>
      </div>

      <button
        onClick={handleDismiss}
        aria-label="Đóng thông báo"
        className="w-5 h-5 rounded flex items-center justify-center hover:bg-black/20 text-white/90 hover:text-white transition-colors shrink-0 cursor-pointer"
      >
        <X size={13} />
      </button>
    </div>
  );
}
