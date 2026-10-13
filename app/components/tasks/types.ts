import { Priority } from "../../types/api";

export type MatrixQuadrant =
  | "urgent-important" // Q1: Làm ngay (Do first)
  | "not-urgent-important" // Q2: Lên lịch (Schedule)
  | "urgent-not-important" // Q3: Cần gấp / Ủy quyền (Delegate)
  | "not-urgent-not-important"; // Q4: Loại bỏ / Thư giãn (Don't do)

export type TaskCategory = "Today" | "Upcoming" | "QuickAdd" | "Calendar";

export const PRIORITY_MAP: Record<MatrixQuadrant, Priority> = {
  "urgent-important": Priority.ImportantUrgent,
  "not-urgent-important": Priority.ImportantNotUrgent,
  "urgent-not-important": Priority.NotImportantUrgent,
  "not-urgent-not-important": Priority.NotImportantNotUrgent,
};

export const REVERSE_PRIORITY_MAP: Record<Priority, MatrixQuadrant> = {
  [Priority.ImportantUrgent]: "urgent-important",
  [Priority.ImportantNotUrgent]: "not-urgent-important",
  [Priority.NotImportantUrgent]: "urgent-not-important",
  [Priority.NotImportantNotUrgent]: "not-urgent-not-important",
};

export const MATRIX_OPTIONS: { id: MatrixQuadrant; label: string; color: string; desc: string }[] = [
  { id: "urgent-important", label: "Khẩn cấp & Quan trọng", color: "bg-rose-500 text-white", desc: "Làm ngay (Do first)" },
  { id: "not-urgent-important", label: "Không khẩn & Quan trọng", color: "bg-blue-500 text-white", desc: "Lên lịch (Schedule)" },
  { id: "urgent-not-important", label: "Khẩn cấp & Không quan trọng", color: "bg-amber-500 text-white", desc: "Ủy quyền (Delegate)" },
  { id: "not-urgent-not-important", label: "Không khẩn & Không quan trọng", color: "bg-neutral-500 text-white", desc: "Loại bỏ / Thư giãn" },
];
