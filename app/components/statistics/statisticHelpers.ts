import { FocusSessionDto, FocusSessionMode, TaskDto } from "../../types/api";
import { StatisticItem, AiSessionDetailData } from "./StatisticDetailChart";

const PALETTE = [
  "#3b82f6", // blue-500
  "#10b981", // emerald-500
  "#f59e0b", // amber-500
  "#8b5cf6", // purple-500
  "#ec4899", // pink-500
  "#06b6d4", // cyan-500
  "#f97316", // orange-500
  "#6366f1", // indigo-500
];

// Chuyển đổi mảng FocusSessionDto từ backend sang danh sách StatisticItem phục vụ biểu đồ
export function mapHistoryToStatisticItems(
  history: FocusSessionDto[],
  tasks?: TaskDto[]
): StatisticItem[] {
  const map = new Map<string, StatisticItem>();
  const taskMap = new Map<string, TaskDto>();
  if (tasks) {
    tasks.forEach((t) => taskMap.set(t.id, t));
  }

  history.forEach((session, index) => {
    // Bỏ qua các session bị hủy ngay dưới 60s (không đủ 1 phút)
    if (!session.isCompleted && session.actualSeconds < 60) return;

    const isTask = !!session.taskId;
    const key = isTask ? `task-${session.taskId}` : `session-${session.id}`;
    let title = session.taskTitle;
    let aiData: AiSessionDetailData | null = null;

    if (session.note) {
      try {
        const parsed = JSON.parse(session.note);
        if (parsed && typeof parsed === "object") {
          if (parsed.ai) aiData = parsed.ai;
          if (parsed.title) title = title || parsed.title;
        }
      } catch {
        title = title || session.note;
      }
    }

    if (!aiData && typeof window !== "undefined") {
      try {
        const cached = localStorage.getItem(`pomo_ai_session_${session.id}`);
        if (cached) aiData = JSON.parse(cached);
      } catch {}
    }

    const matchedTask = isTask && session.taskId ? taskMap.get(session.taskId) : null;
    const taskEstimate = matchedTask?.estimatedMinutes && matchedTask.estimatedMinutes > 0
      ? matchedTask.estimatedMinutes
      : (matchedTask?.estimatedPomodoros ? matchedTask.estimatedPomodoros * 25 : null);

    const name = title || matchedTask?.title || (session.mode === FocusSessionMode.Pomo ? "Tự do" : "Stopwatch");
    const color = PALETTE[index % PALETTE.length];

    if (!map.has(key)) {
      map.set(key, {
        id: key,
        name,
        plannedMinutes: taskEstimate || session.durationMinutes || 25,
        actualMinutes: session.actualMinutes,
        overtimeMinutes: session.overtimeMinutes,
        pomos: session.isCompleted ? 1 : 0,
        color,
        sourceType: isTask ? "task" : "list",
        aiData,
        sessionId: session.id,
      });
    } else {
      const existing = map.get(key)!;
      // Nếu là Task có ước tính sẵn thì giữ nguyên ước tính đó làm mốc kế hoạch
      if (!taskEstimate && session.isCompleted) {
        existing.plannedMinutes += session.durationMinutes || 25;
      }
      existing.actualMinutes += session.actualMinutes;
      existing.overtimeMinutes += session.overtimeMinutes;
      if (!existing.aiData && aiData) existing.aiData = aiData;
      if (session.isCompleted) existing.pomos += 1;
    }
  });

  return Array.from(map.values());
}
