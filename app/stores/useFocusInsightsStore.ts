import { create } from "zustand";
import { AiProductivityInsightDto } from "../types/api";
import { analyticsService } from "../services/analyticsService";

interface FocusInsightsStoreState {
  goldenHour: string | null;
  deepFlowPercentage: number;
  totalSessionsAnalyzed: number;
  isLoaded: boolean;
  fetchInsights: () => Promise<void>;
}

export const useFocusInsightsStore = create<FocusInsightsStoreState>((set) => ({
  goldenHour: null,
  deepFlowPercentage: 0,
  totalSessionsAnalyzed: 0,
  isLoaded: false,
  fetchInsights: async () => {
    try {
      const data: AiProductivityInsightDto | null = await analyticsService.getProductivityInsights(30);
      if (data && data.totalSessionsAnalyzed >= 3 && data.goldenHourWindow && data.goldenHourWindow !== "Chưa đủ dữ liệu") {
        set({
          goldenHour: data.goldenHourWindow,
          deepFlowPercentage: data.deepFlowPercentage > 0 ? data.deepFlowPercentage : data.goldenHourScore,
          totalSessionsAnalyzed: data.totalSessionsAnalyzed,
          isLoaded: true,
        });
      } else {
        set({
          goldenHour: null,
          deepFlowPercentage: data?.deepFlowPercentage ?? 0,
          totalSessionsAnalyzed: data?.totalSessionsAnalyzed ?? 0,
          isLoaded: true,
        });
      }
    } catch {
      set({ isLoaded: true });
    }
  },
}));

