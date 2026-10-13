import { StateCreator } from "zustand";
import { taskService } from "../../services/taskService";
import { TaskDto, CreateSubtaskRequest, UpdateSubtaskRequest } from "../../types/api";
import { TaskState, SubtaskSliceActions } from "./taskTypes";

export const createSubtaskSlice: StateCreator<
  TaskState,
  [],
  [],
  SubtaskSliceActions
> = (set) => ({
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
});
