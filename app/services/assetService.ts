import { apiClient } from "../lib/apiClient";
import {
  AssetType,
  SystemAssetDto,
  CreateAssetRequest,
  UpdateAssetRequest,
  PagedAssetResult,
} from "../types/asset";

export const assetService = {
  /**
   * Lấy danh sách tài nguyên đang kích hoạt cho người dùng (có thể lọc theo loại và thể loại)
   */
  async getActiveAssets(type?: AssetType, category?: string): Promise<SystemAssetDto[]> {
    const params: Record<string, string | undefined> = {
      type,
      category,
    };
    const res = await apiClient<SystemAssetDto[]>("/api/assets", {
      params,
    });
    return res.data || [];
  },

  /**
   * Admin: Lấy danh sách tài nguyên quản trị có phân trang và bộ lọc
   */
  async getAdminAssets(params?: {
    type?: string;
    category?: string;
    isActive?: boolean;
    search?: string;
    page?: number;
    pageSize?: number;
  }): Promise<PagedAssetResult> {
    const queryParams: Record<string, string | number | boolean | undefined> = {
      type: params?.type || undefined,
      category: params?.category || undefined,
      isActive: params?.isActive !== undefined ? params.isActive : undefined,
      search: params?.search || undefined,
      page: params?.page ?? 1,
      pageSize: params?.pageSize ?? 20,
    };

    const res = await apiClient<PagedAssetResult>("/api/admin/assets", {
      params: queryParams,
    });
    return (
      res.data || {
        items: [],
        totalCount: 0,
        page: 1,
        pageSize: 20,
        totalPages: 0,
      }
    );
  },

  /**
   * Admin: Tạo tài nguyên mới
   */
  async createAsset(payload: CreateAssetRequest): Promise<SystemAssetDto> {
    const res = await apiClient<SystemAssetDto>("/api/admin/assets", {
      method: "POST",
      body: JSON.stringify(payload),
    });
    return res.data!;
  },

  /**
   * Admin: Cập nhật tài nguyên
   */
  async updateAsset(id: string, payload: UpdateAssetRequest): Promise<SystemAssetDto> {
    const res = await apiClient<SystemAssetDto>(`/api/admin/assets/${id}`, {
      method: "PUT",
      body: JSON.stringify(payload),
    });
    return res.data!;
  },

  /**
   * Admin: Xóa tài nguyên
   */
  async deleteAsset(id: string): Promise<boolean> {
    const res = await apiClient<boolean>(`/api/admin/assets/${id}`, {
      method: "DELETE",
    });
    return res.data ?? true;
  },

  /**
   * Admin: Bật/tắt trạng thái hoạt động của tài nguyên
   */
  async toggleActive(id: string): Promise<SystemAssetDto> {
    const res = await apiClient<SystemAssetDto>(`/api/admin/assets/${id}/toggle-active`, {
      method: "PATCH",
    });
    return res.data!;
  },

  /**
   * Admin: Đặt làm tài nguyên mặc định của loại
   */
  async setDefault(id: string): Promise<SystemAssetDto> {
    const res = await apiClient<SystemAssetDto>(`/api/admin/assets/${id}/set-default`, {
      method: "PATCH",
    });
    return res.data!;
  },
};
