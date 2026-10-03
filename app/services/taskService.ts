import { apiClient } from "../lib/apiClient";
import {
  TaskDto,
  SubtaskDto,
  CreateTaskRequest,
  UpdateTaskRequest,
  UpdateTaskStatusRequest,
  CreateSubtaskRequest,
  UpdateSubtaskRequest,
  TaskFilterParams,
} from "../types/api";

export const taskService = {
  /**
   * Lấy danh sách tasks có áp dụng filter / sort
   */
  async getTasks(params?: TaskFilterParams): Promise<TaskDto[]> {
    const res = await apiClient<TaskDto[]>("/api/tasks", {
      method: "GET",
      params: params as Record<string, string | number | boolean | undefined>,
    });
    return res.data || [];
  },

  /**
   * Lấy chi tiết một task theo ID
   */
  async getTaskById(id: string): Promise<TaskDto | null> {
    const res = await apiClient<TaskDto>(`/api/tasks/${id}`, {
      method: "GET",
    });
    return res.data;
  },

  /**
   * Tạo task mới (kèm subtasks ban đầu nếu có)
   */
  async createTask(data: CreateTaskRequest): Promise<TaskDto | null> {
    const res = await apiClient<TaskDto>("/api/tasks", {
      method: "POST",
      body: JSON.stringify(data),
    });
    return res.data;
  },

  /**
   * Cập nhật thông tin task
   */
  async updateTask(id: string, data: UpdateTaskRequest): Promise<TaskDto | null> {
    const res = await apiClient<TaskDto>(`/api/tasks/${id}`, {
      method: "PUT",
      body: JSON.stringify(data),
    });
    return res.data;
  },

  /**
   * Cập nhật nhanh trạng thái hoàn thành / làm việc của task
   */
  async updateTaskStatus(id: string, statusData: UpdateTaskStatusRequest): Promise<TaskDto | null> {
    const res = await apiClient<TaskDto>(`/api/tasks/${id}/status`, {
      method: "PATCH",
      body: JSON.stringify(statusData),
    });
    return res.data;
  },

  /**
   * Xóa mềm task vào thùng rác
   */
  async deleteTask(id: string): Promise<boolean> {
    const res = await apiClient<string>(`/api/tasks/${id}`, {
      method: "DELETE",
    });
    return res.success;
  },

  /**
   * Khôi phục task từ thùng rác
   */
  async restoreTask(id: string): Promise<TaskDto | null> {
    const res = await apiClient<TaskDto>(`/api/tasks/${id}/restore`, {
      method: "POST",
    });
    return res.data;
  },

  // ==========================================
  // Subtasks API Endpoints
  // ==========================================

  /**
   * Thêm subtask mới vào task
   */
  async addSubtask(taskId: string, data: CreateSubtaskRequest): Promise<SubtaskDto | null> {
    const res = await apiClient<SubtaskDto>(`/api/tasks/${taskId}/subtasks`, {
      method: "POST",
      body: JSON.stringify(data),
    });
    return res.data;
  },

  /**
   * Đảo trạng thái hoàn thành của subtask
   */
  async toggleSubtask(taskId: string, subtaskId: string): Promise<SubtaskDto | null> {
    const res = await apiClient<SubtaskDto>(`/api/tasks/${taskId}/subtasks/${subtaskId}/toggle`, {
      method: "PATCH",
    });
    return res.data;
  },

  /**
   * Cập nhật thông tin subtask (title, orderIndex, isCompleted)
   */
  async updateSubtask(
    taskId: string,
    subtaskId: string,
    data: UpdateSubtaskRequest
  ): Promise<SubtaskDto | null> {
    const res = await apiClient<SubtaskDto>(`/api/tasks/${taskId}/subtasks/${subtaskId}`, {
      method: "PUT",
      body: JSON.stringify(data),
    });
    return res.data;
  },

  /**
   * Xóa vĩnh viễn subtask
   */
  async deleteSubtask(taskId: string, subtaskId: string): Promise<boolean> {
    const res = await apiClient<string>(`/api/tasks/${taskId}/subtasks/${subtaskId}`, {
      method: "DELETE",
    });
    return res.success;
  },
};
