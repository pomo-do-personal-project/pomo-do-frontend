import { create } from "zustand";
import { persist, createJSONStorage } from "zustand/middleware";
import { createTaskSlice } from "./slices/taskSlice";
import { createSubtaskSlice } from "./slices/subtaskSlice";
import { TaskState } from "./slices/taskTypes";

export type { TaskState } from "./slices/taskTypes";

export const useTaskStore = create<TaskState>()(
  persist(
    (...a) => ({
      ...createTaskSlice(...a),
      ...createSubtaskSlice(...a),
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
