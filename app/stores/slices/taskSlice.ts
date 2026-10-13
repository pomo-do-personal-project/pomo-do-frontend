import { StateCreator } from "zustand";
import { taskService } from "../../services/taskService";
import { Priority, TaskStatus, CreateTaskRequest, UpdateTaskRequest, TaskFilterParams } from "../../types/api";
import { TaskState, TaskSliceState, TaskSliceActions } from "./taskTypes";

export const createTaskSlice: StateCreator<
  TaskState,
  [],
  [],
  TaskSliceState & TaskSliceActions
> = (set, get) => ({
  tasks: [],
  selectedTask: null,
  isLoading: false,
  isSaving: false,
  error: null,

  clearError: () => set({ error: null }),

  resetTaskStore: () => {
    set({
      tasks: [],
      selectedTask: null,
      isLoading: false,
      isSaving: false,
      error: null,
    });
  },

  selectTask: (task) => set({ selectedTask: task }),

  fetchTasks: async (params?: TaskFilterParams) => {
    set({ isLoading: true, error: null });
    try {
      const tasks = await taskService.getTasks(params);
      set({
        tasks,
        isLoading: false,
        selectedTask: get().selectedTask
          ? tasks.find((t) => t.id === get().selectedTask?.id) || null
          : null,
      });
    } catch (err: any) {
      const is401 =
        err?.statusCode === 401 || err?.message?.toLowerCase().includes("unauthorized");
      if (is401) {
        set({
          tasks: [],
          selectedTask: null,
          isLoading: false,
          error: null,
        });
        if (typeof window !== "undefined") {
          localStorage.removeItem("pomo-tasks-cache");
        }
      } else {
        set({
          isLoading: false,
          error: err?.message || "Không thể kết nối đến máy chủ backend",
        });
      }
    }
  },

  createTask: async (data: CreateTaskRequest) => {
    set({ isSaving: true, error: null });
    try {
      const newTask = await taskService.createTask(data);
      if (newTask) {
        set((state) => ({
          tasks: [newTask, ...state.tasks],
          selectedTask: newTask,
          isSaving: false,
        }));
        return newTask;
      }
      set({ isSaving: false });
      return null;
    } catch (err: any) {
      set({
        isSaving: false,
        error: err?.message || "Không thể tạo công việc mới",
      });
      throw err;
    }
  },

  updateTask: async (id: string, data: UpdateTaskRequest) => {
    set({ isSaving: true, error: null });
    try {
      const updated = await taskService.updateTask(id, data);
      if (updated) {
        set((state) => ({
          tasks: state.tasks.map((t) => (t.id === id ? updated : t)),
          selectedTask: state.selectedTask?.id === id ? updated : state.selectedTask,
          isSaving: false,
        }));
        return updated;
      }
      set({ isSaving: false });
      return null;
    } catch (err: any) {
      set({
        isSaving: false,
        error: err?.message || "Không thể cập nhật công việc",
      });
      throw err;
    }
  },

  moveTaskPriority: async (id: string, newPriority: Priority) => {
    const target = get().tasks.find((t) => t.id === id);
    if (!target || target.priority === newPriority) return true;

    const prevPriority = target.priority;

    // Optimistic UI update
    set((state) => ({
      tasks: state.tasks.map((t) => (t.id === id ? { ...t, priority: newPriority } : t)),
      selectedTask:
        state.selectedTask?.id === id
          ? { ...state.selectedTask, priority: newPriority }
          : state.selectedTask,
    }));

    try {
      const updated = await taskService.updateTask(id, {
        title: target.title,
        priority: newPriority,
        status: target.status,
        estimatedMinutes: target.estimatedMinutes,
        estimatedPomodoros: target.estimatedPomodoros,
        dueDate: target.dueDate,
        tagIds: target.tags?.map((t) => t.id) ?? [],
      });

      if (updated) {
        set((state) => ({
          tasks: state.tasks.map((t) => (t.id === id ? updated : t)),
          selectedTask: state.selectedTask?.id === id ? updated : state.selectedTask,
        }));
        return true;
      }
      return false;
    } catch (err: any) {
      // Rollback
      set((state) => ({
        tasks: state.tasks.map((t) => (t.id === id ? { ...t, priority: prevPriority } : t)),
        selectedTask:
          state.selectedTask?.id === id
            ? { ...state.selectedTask, priority: prevPriority }
            : state.selectedTask,
        error: err?.message || "Không thể chuyển đổi góc ma trận",
      }));
      return false;
    }
  },

  toggleTaskStatus: async (id: string) => {
    const task = get().tasks.find((t) => t.id === id);
    if (!task) return;

    const isCurrentlyCompleted = task.status === TaskStatus.Completed;
    const newStatus = isCurrentlyCompleted ? TaskStatus.Todo : TaskStatus.Completed;

    // Optimistic UI update
    set((state) => ({
      tasks: state.tasks.map((t) => (t.id === id ? { ...t, status: newStatus } : t)),
      selectedTask:
        state.selectedTask?.id === id
          ? { ...state.selectedTask, status: newStatus }
          : state.selectedTask,
    }));

    try {
      const updated = await taskService.updateTaskStatus(id, { status: newStatus });
      if (updated) {
        set((state) => ({
          tasks: state.tasks.map((t) => (t.id === id ? updated : t)),
          selectedTask: state.selectedTask?.id === id ? updated : state.selectedTask,
        }));
      }
    } catch (err: any) {
      // Rollback
      set((state) => ({
        tasks: state.tasks.map((t) => (t.id === id ? { ...t, status: task.status } : t)),
        selectedTask:
          state.selectedTask?.id === id
            ? { ...state.selectedTask, status: task.status }
            : state.selectedTask,
        error: err?.message || "Lỗi cập nhật trạng thái",
      }));
    }
  },

  deleteTask: async (id: string) => {
    const prevTasks = get().tasks;
    const prevSelected = get().selectedTask;

    set((state) => ({
      tasks: state.tasks.filter((t) => t.id !== id),
      selectedTask: state.selectedTask?.id === id ? null : state.selectedTask,
    }));

    try {
      const success = await taskService.deleteTask(id);
      if (!success) {
        set({ tasks: prevTasks, selectedTask: prevSelected });
        return false;
      }
      return true;
    } catch (err: any) {
      set({
        tasks: prevTasks,
        selectedTask: prevSelected,
        error: err?.message || "Không thể xóa công việc",
      });
      return false;
    }
  },
});
