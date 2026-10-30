import {
  TaskDto,
  SubtaskDto,
  Priority,
  CreateTaskRequest,
  UpdateTaskRequest,
  CreateSubtaskRequest,
  UpdateSubtaskRequest,
  TaskFilterParams,
} from "../../types/api";

export interface TaskSliceState {
  tasks: TaskDto[];
  selectedTask: TaskDto | null;
  isLoading: boolean;
  isSaving: boolean;
  error: string | null;
}

export interface TaskSliceActions {
  clearError: () => void;
  resetTaskStore: () => void;
  selectTask: (task: TaskDto | null) => void;
  fetchTasks: (params?: TaskFilterParams) => Promise<void>;
  createTask: (data: CreateTaskRequest) => Promise<TaskDto | null>;
  updateTask: (id: string, data: UpdateTaskRequest) => Promise<TaskDto | null>;
  moveTaskPriority: (id: string, newPriority: Priority) => Promise<boolean>;
  toggleTaskStatus: (id: string) => Promise<void>;
  deleteTask: (id: string) => Promise<boolean>;
  restoreTask: (id: string) => Promise<TaskDto | null>;
}

export interface SubtaskSliceActions {
  addSubtask: (taskId: string, data: CreateSubtaskRequest) => Promise<SubtaskDto | null>;
  toggleSubtask: (taskId: string, subtaskId: string) => Promise<void>;
  updateSubtask: (
    taskId: string,
    subtaskId: string,
    data: UpdateSubtaskRequest
  ) => Promise<SubtaskDto | null>;
  deleteSubtask: (taskId: string, subtaskId: string) => Promise<boolean>;
}

export type TaskState = TaskSliceState & TaskSliceActions & SubtaskSliceActions;
