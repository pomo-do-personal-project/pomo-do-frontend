import { create } from "zustand";
import { persist, createJSONStorage } from "zustand/middleware";
import {
  TaskDto,
  SubtaskDto,
  Priority,
  TaskStatus,
  CreateTaskRequest,
  UpdateTaskRequest,
  CreateSubtaskRequest,
  UpdateSubtaskRequest,
  TaskFilterParams,
} from "../types/api";
import { taskService } from "../services/taskService";

interface TaskState {
  tasks: TaskDto[];
  selectedTask: TaskDto | null;
  isLoading: boolean;
  isSaving: boolean;
  error: string | null;

  // Actions - Tasks
  fetchTasks: (params?: TaskFilterParams) => Promise<void>;
  selectTask: (task: TaskDto | null) => void;
  createTask: (data: CreateTaskRequest) => Promise<TaskDto | null>;
  updateTask: (id: string, data: UpdateTaskRequest) => Promise<TaskDto | null>;
  moveTaskPriority: (id: string, newPriority: Priority) => Promise<boolean>;
  toggleTaskStatus: (id: string) => Promise<void>;
  deleteTask: (id: string) => Promise<boolean>;

  // Actions - Subtasks
  addSubtask: (taskId: string, data: CreateSubtaskRequest) => Promise<SubtaskDto | null>;
  toggleSubtask: (taskId: string, subtaskId: string) => Promise<void>;
  updateSubtask: (
    taskId: string,
    subtaskId: string,
    data: UpdateSubtaskRequest
  ) => Promise<SubtaskDto | null>;
  deleteSubtask: (taskId: string, subtaskId: string) => Promise<boolean>;

  clearError: () => void;
  resetTaskStore: () => void;
}

export const useTaskStore = create<TaskState>()(
  persist(
    (set, get) => ({
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
            // Cập nhật selectedTask nếu task đó đang mở
            selectedTask: get().selectedTask
              ? tasks.find((t) => t.id === get().selectedTask?.id) || null
              : null,
          });
        } catch (err: any) {
          const is401 = err?.statusCode === 401 || err?.message?.toLowerCase().includes("unauthorized");
          if (is401) {
            // Khi chưa đăng nhập hoặc hết hạn phiên: dọn dẹp sạch danh sách, không báo lỗi phiền hà cho người dùng
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
            // Khi backend offline thực sự: GIỮ NGUYÊN danh sách tasks đã cache từ localStorage
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

        // Optimistic UI update: cập nhật state ngay lập tức giúp kéo thả siêu nhạy
        set((state) => ({
          tasks: state.tasks.map((t) => (t.id === id ? { ...t, priority: newPriority } : t)),
          selectedTask: state.selectedTask?.id === id ? { ...state.selectedTask, priority: newPriority } : state.selectedTask,
        }));

        try {
          const updated = await taskService.updateTask(id, {
            title: target.title,
            priority: newPriority,
            status: target.status,
            estimatedMinutes: target.estimatedMinutes,
            estimatedPomodoros: target.estimatedPomodoros,
            dueDate: target.dueDate,
            tags: target.tags,
            category: target.category,
            isQuickAdd: target.isQuickAdd,
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
          // Rollback nếu API backend gặp lỗi
          set((state) => ({
            tasks: state.tasks.map((t) => (t.id === id ? { ...t, priority: prevPriority } : t)),
            selectedTask: state.selectedTask?.id === id ? { ...state.selectedTask, priority: prevPriority } : state.selectedTask,
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
          tasks: state.tasks.map((t) =>
            t.id === id ? { ...t, status: newStatus } : t
          ),
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
          // Rollback nếu thất bại
          set((state) => ({
            tasks: state.tasks.map((t) =>
              t.id === id ? { ...t, status: task.status } : t
            ),
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

        // Optimistic removal
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

      // Subtask Handlers
      addSubtask: async (taskId: string, data: CreateSubtaskRequest) => {
        try {
          const newSub = await taskService.addSubtask(taskId, data);
          if (newSub) {
            set((state) => {
              const updateTaskSubtasks = (t: TaskDto) =>
                t.id === taskId ? { ...t, subtasks: [...t.subtasks, newSub] } : t;

              return {
                tasks: state.tasks.map(updateTaskSubtasks),
                selectedTask:
                  state.selectedTask?.id === taskId
                    ? {
                        ...state.selectedTask,
                        subtasks: [...state.selectedTask.subtasks, newSub],
                      }
                    : state.selectedTask,
              };
            });
            return newSub;
          }
          return null;
        } catch (err: any) {
          set({ error: err?.message || "Không thể thêm subtask" });
          throw err;
        }
      },

      toggleSubtask: async (taskId: string, subtaskId: string) => {
        // Optimistic toggle
        set((state) => {
          const toggle = (t: TaskDto) => {
            if (t.id !== taskId) return t;
            return {
              ...t,
              subtasks: t.subtasks.map((s) =>
                s.id === subtaskId ? { ...s, isCompleted: !s.isCompleted } : s
              ),
            };
          };

          return {
            tasks: state.tasks.map(toggle),
            selectedTask: state.selectedTask ? toggle(state.selectedTask) : null,
          };
        });

        try {
          const updatedSub = await taskService.toggleSubtask(taskId, subtaskId);
          if (updatedSub) {
            set((state) => {
              const syncSub = (t: TaskDto) => {
                if (t.id !== taskId) return t;
                return {
                  ...t,
                  subtasks: t.subtasks.map((s) => (s.id === subtaskId ? updatedSub : s)),
                };
              };

              return {
                tasks: state.tasks.map(syncSub),
                selectedTask: state.selectedTask ? syncSub(state.selectedTask) : null,
              };
            });
          }
        } catch (err: any) {
          // Refetch task on error
          const current = await taskService.getTaskById(taskId);
          if (current) {
            set((state) => ({
              tasks: state.tasks.map((t) => (t.id === taskId ? current : t)),
              selectedTask: state.selectedTask?.id === taskId ? current : state.selectedTask,
              error: err?.message || "Lỗi cập nhật subtask",
            }));
          }
        }
      },

      updateSubtask: async (taskId: string, subtaskId: string, data: UpdateSubtaskRequest) => {
        try {
          const updatedSub = await taskService.updateSubtask(taskId, subtaskId, data);
          if (updatedSub) {
            set((state) => {
              const syncSub = (t: TaskDto) => {
                if (t.id !== taskId) return t;
                return {
                  ...t,
                  subtasks: t.subtasks.map((s) => (s.id === subtaskId ? updatedSub : s)),
                };
              };

              return {
                tasks: state.tasks.map(syncSub),
                selectedTask: state.selectedTask ? syncSub(state.selectedTask) : null,
              };
            });
            return updatedSub;
          }
          return null;
        } catch (err: any) {
          set({ error: err?.message || "Không thể cập nhật subtask" });
          throw err;
        }
      },

      deleteSubtask: async (taskId: string, subtaskId: string) => {
        // Optimistic removal
        set((state) => {
          const removeSub = (t: TaskDto) => {
            if (t.id !== taskId) return t;
            return {
              ...t,
              subtasks: t.subtasks.filter((s) => s.id !== subtaskId),
            };
          };

          return {
            tasks: state.tasks.map(removeSub),
            selectedTask: state.selectedTask ? removeSub(state.selectedTask) : null,
          };
        });

        try {
          return await taskService.deleteSubtask(taskId, subtaskId);
        } catch (err: any) {
          // Refetch on error
          const current = await taskService.getTaskById(taskId);
          if (current) {
            set((state) => ({
              tasks: state.tasks.map((t) => (t.id === taskId ? current : t)),
              selectedTask: state.selectedTask?.id === taskId ? current : state.selectedTask,
              error: err?.message || "Lỗi xóa subtask",
            }));
          }
          return false;
        }
      },
    }),
    {
      name: "pomo-tasks-cache",
      storage: createJSONStorage(() => localStorage),
      partialize: (state) => ({
        tasks: state.tasks, // Cache lại danh sách tasks để khi backend tắt user vẫn xem được
      }),
    }
  )
);
