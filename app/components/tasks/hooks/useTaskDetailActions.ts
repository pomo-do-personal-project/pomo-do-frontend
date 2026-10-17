"use client";

import { TaskDto, Priority, TaskStatus, FocusSessionMode } from "../../../types/api";
import { useTaskStore } from "../../../stores/useTaskStore";
import { usePomodoroStore } from "../../../stores/usePomodoroStore";
import { useSettingsStore } from "../../../stores/useSettingsStore";

interface UseTaskDetailActionsProps {
  task: TaskDto;
  onDelete: (id: string) => Promise<void>;
  onNavigateToTimer?: () => void;
}

export function useTaskDetailActions({
  task,
  onDelete,
  onNavigateToTimer,
}: UseTaskDetailActionsProps) {
  const { updateTask, isSaving, createTask } = useTaskStore();

  const handleAutoSave = async (updates?: {
    title?: string;
    priority?: Priority;
    status?: TaskStatus;
    estimatedMinutes?: number;
    dueDate?: string | null;
    tagIds?: string[];
  }) => {
    const newTitle = updates?.title !== undefined ? updates.title.trim() : task.title.trim();
    if (!newTitle) return;

    const newPriority = updates?.priority ?? task.priority;
    const newStatus = updates?.status !== undefined ? updates.status : task.status;
    const newEstMin = updates?.estimatedMinutes ?? task.estimatedMinutes ?? 30;
    const newDueDate = updates?.dueDate !== undefined ? updates.dueDate : (task.dueDate ?? null);
    const newTagIds = updates?.tagIds !== undefined ? updates.tagIds : task.tags?.map((t) => t.id);

    try {
      await updateTask(task.id, {
        title: newTitle,
        priority: newPriority,
        status: newStatus,
        estimatedPomodoros: Math.ceil(newEstMin / 25),
        estimatedMinutes: newEstMin,
        dueDate: newDueDate ? (newDueDate.includes("T") ? newDueDate : new Date(newDueDate).toISOString()) : null,
        tagIds: newTagIds,
      });
    } catch {
      // Handled in store
    }
  };

  const handleStartPomodoro = async () => {
    const {
      setTaskName,
      setIsRunning,
      setTimerType,
      setFocusMode,
      resetTimer,
      clearCurrentSession,
      startSession,
    } = usePomodoroStore.getState();

    const { settings } = useSettingsStore.getState();
    const durationMinutes =
      task.estimatedMinutes && task.estimatedMinutes > 0
        ? task.estimatedMinutes
        : (settings.focusDuration || 25);
    const durationSeconds = durationMinutes * 60;

    clearCurrentSession();
    resetTimer(durationSeconds);
    setTaskName(task.title);
    setTimerType("pomo");
    setFocusMode("W");

    try {
      await startSession({
        taskId: task.id,
        mode: FocusSessionMode.Pomo,
        durationMinutes,
      });
    } catch {
      // Offline fallback
    }

    if (task.status === TaskStatus.Completed || task.status === TaskStatus.Todo) {
      await updateTask(task.id, {
        ...task,
        status: TaskStatus.InProgress,
        tagIds: task.tags?.map((t) => t.id),
      });
    }

    setIsRunning(true);
    onNavigateToTimer?.();
  };

  const handleDuplicateTask = async () => {
    await createTask({
      title: `${task.title} (Bản sao)`,
      priority: task.priority,
      estimatedPomodoros: task.estimatedPomodoros,
      estimatedMinutes: task.estimatedMinutes,
      dueDate: task.dueDate || undefined,
      isQuickAdd: task.isQuickAdd,
      tagIds: task.tags?.map((t) => t.id),
      initialSubtasks: task.subtasks?.map((st) => st.title),
    });
  };

  const handleDelete = async () => {
    await onDelete(task.id);
  };

  return {
    isSaving,
    handleAutoSave,
    handleStartPomodoro,
    handleDuplicateTask,
    handleDelete,
  };
}
