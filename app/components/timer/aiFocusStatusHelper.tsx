import React from "react";
import { Camera, CameraOff, Eye, Smartphone, Moon, AlertTriangle, UserX } from "lucide-react";

export function getAiFocusStatusInfo(
  status: string,
  isAiEnabled: boolean,
  isConnecting: boolean,
  detail: string,
  activeScreen: number | null
) {
  if (!isAiEnabled || status === "DISCONNECTED") {
    return {
      label: isConnecting ? "Đang kết nối..." : "Camera đang tắt",
      borderClass: "border-neutral-200 dark:border-neutral-800",
      indicator: "bg-neutral-500",
      icon: <CameraOff size={14} />,
    };
  }

  switch (status) {
    case "FOCUSED":
      return {
        label: activeScreen ? `Tập trung • Màn ${activeScreen}` : "Đang tập trung",
        borderClass: "border-emerald-500 shadow-sm shadow-emerald-500/10",
        indicator: "bg-emerald-500 animate-pulse",
        icon: <Eye size={14} />,
      };
    case "DISTRACTED":
      return {
        label: detail || "Mất tập trung!",
        borderClass: "border-rose-500 shadow-md shadow-rose-500/20 animate-pulse",
        indicator: "bg-rose-500 animate-ping",
        icon: detail.includes("điện thoại") ? (
          <Smartphone size={14} />
        ) : detail.includes("ngủ") ? (
          <Moon size={14} />
        ) : (
          <AlertTriangle size={14} />
        ),
      };
    case "AFK":
      return {
        label: "Vắng mặt",
        borderClass: "border-amber-500/60",
        indicator: "bg-amber-500",
        icon: <UserX size={14} />,
      };
    default:
      return {
        label: "Chờ dữ liệu...",
        borderClass: "border-neutral-200 dark:border-neutral-800",
        indicator: "bg-neutral-400",
        icon: <Camera size={14} />,
      };
  }
}
