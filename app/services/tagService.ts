import { apiClient } from "../lib/apiClient";
import { TagDto, CreateTagRequest, UpdateTagRequest } from "../types/api";

export const tagService = {
  /**
   * Lấy danh sách toàn bộ thẻ tag của người dùng
   */
  async getTags(): Promise<TagDto[]> {
    const res = await apiClient<TagDto[]>("/api/tags", {
      method: "GET",
    });
    return res.data || [];
  },

  /**
   * Lấy chi tiết một tag theo ID
   */
  async getTagById(id: string): Promise<TagDto | null> {
    const res = await apiClient<TagDto>(`/api/tags/${id}`, {
      method: "GET",
    });
    return res.data;
  },

  /**
   * Tạo thẻ tag mới
   */
  async createTag(data: CreateTagRequest): Promise<TagDto | null> {
    const res = await apiClient<TagDto>("/api/tags", {
      method: "POST",
      body: JSON.stringify(data),
    });
    return res.data;
  },

  /**
   * Cập nhật tên hoặc mã màu tag
   */
  async updateTag(id: string, data: UpdateTagRequest): Promise<TagDto | null> {
    const res = await apiClient<TagDto>(`/api/tags/${id}`, {
      method: "PUT",
      body: JSON.stringify(data),
    });
    return res.data;
  },

  /**
   * Xóa thẻ tag (hệ thống sẽ tự động gỡ tag khỏi các task liên quan)
   */
  async deleteTag(id: string): Promise<void> {
    await apiClient<string>(`/api/tags/${id}`, {
      method: "DELETE",
    });
  },
};
