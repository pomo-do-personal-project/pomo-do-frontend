import { Priority } from "../../types/api";
import { MatrixQuadrant } from "../tasks/types";

export interface QuadrantConfig {
  id: MatrixQuadrant;
  priority: Priority;
  title: string;
  subtitle: string;
  accentColor: "rose" | "blue" | "amber" | "neutral";
  borderColor: string;
  activeBorderColor: string;
  bgGlow: string;
  badgeBg: string;
  dragOverBg: string;
}

export const QUADRANTS: QuadrantConfig[] = [
  {
    id: "urgent-important",
    priority: Priority.ImportantUrgent,
    title: "Khẩn cấp & Quan trọng",
    subtitle: "Làm ngay",
    accentColor: "rose",
    borderColor: "border-rose-400/50 dark:border-rose-500/30",
    activeBorderColor: "border-rose-500 dark:border-rose-400",
    bgGlow: "bg-rose-500/5 dark:bg-rose-950/20",
    badgeBg: "bg-rose-500 text-white",
    dragOverBg: "bg-rose-500/10 dark:bg-rose-950/40 border-rose-500 ring-2 ring-rose-500/30",
  },
  {
    id: "not-urgent-important",
    priority: Priority.ImportantNotUrgent,
    title: "Không khẩn & Quan trọng",
    subtitle: "Lên kế hoạch",
    accentColor: "blue",
    borderColor: "border-blue-400/50 dark:border-blue-500/30",
    activeBorderColor: "border-blue-500 dark:border-blue-400",
    bgGlow: "bg-blue-500/5 dark:bg-blue-950/20",
    badgeBg: "bg-blue-500 text-white",
    dragOverBg: "bg-blue-500/10 dark:bg-blue-950/40 border-blue-500 ring-2 ring-blue-500/30",
  },
  {
    id: "urgent-not-important",
    priority: Priority.NotImportantUrgent,
    title: "Khẩn cấp & Không quan trọng",
    subtitle: "Ủy quyền",
    accentColor: "amber",
    borderColor: "border-amber-400/50 dark:border-amber-500/30",
    activeBorderColor: "border-amber-500 dark:border-amber-400",
    bgGlow: "bg-amber-500/5 dark:bg-amber-950/20",
    badgeBg: "bg-amber-500 text-white",
    dragOverBg: "bg-amber-500/10 dark:bg-amber-950/40 border-amber-500 ring-2 ring-amber-500/30",
  },
  {
    id: "not-urgent-not-important",
    priority: Priority.NotImportantNotUrgent,
    title: "Không khẩn & Không quan trọng",
    subtitle: "Loại bỏ",
    accentColor: "neutral",
    borderColor: "border-neutral-300 dark:border-neutral-700/60",
    activeBorderColor: "border-neutral-600 dark:border-neutral-300",
    bgGlow: "bg-neutral-500/5 dark:bg-neutral-900/30",
    badgeBg: "bg-neutral-500 text-white",
    dragOverBg: "bg-neutral-200/50 dark:bg-neutral-800/80 border-neutral-500 ring-2 ring-neutral-400/30",
  },
];
