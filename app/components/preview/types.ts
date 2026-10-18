export type ScreenId = "stat-focus" | "stat-task" | "timer" | "task" | "matrix";

export interface DemoStep {
  screen: ScreenId;
  x: number; // Tọa độ % theo chiều ngang của container
  y: number; // Tọa độ % theo chiều dọc của container
  isClick: boolean;
  label: string;
  action?: () => void;
}
