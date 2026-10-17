import { apiClient } from "../lib/apiClient";
import { FocusHeatmapResponse, AiProductivityInsightDto } from "../types/api";

export const analyticsService = {
  // Lấy dữ liệu ma trận nhiệt 7x24 và thông số AI
  async getFocusHeatmap(rangeDays: number = 30): Promise<FocusHeatmapResponse | null> {
    const res = await apiClient<FocusHeatmapResponse>("/api/analytics/heatmap", {
      method: "GET",
      params: { rangeDays },
    });
    return res.data;
  },

  // Lấy báo cáo phân tích thông minh và khung giờ vàng từ AI
  async getProductivityInsights(rangeDays: number = 30): Promise<AiProductivityInsightDto | null> {
    const res = await apiClient<AiProductivityInsightDto>("/api/analytics/insights", {
      method: "GET",
      params: { rangeDays },
    });
    return res.data;
  },
};
