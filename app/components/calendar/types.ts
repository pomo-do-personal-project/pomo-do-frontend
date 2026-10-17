import { TaskDto } from "../../types/api";

export type TimeOfDay = "morning" | "afternoon" | "evening";

export interface DayInfo {
  dateStr: string; // YYYY-MM-DD
  dayLabel: string; // T2, T3...
  dayNumber: number; // 16, 17...
  isToday: boolean;
  totalPomos: number;
  completedPomos: number;
}

export interface CalendarTimelineProps {
  tasks: TaskDto[];
  selectedTaskId?: string;
  onSelectTask: (task: TaskDto) => void;
  onToggleStatus: (id: string, e: React.MouseEvent) => void;
  onNavigateToTimer?: () => void;
}
