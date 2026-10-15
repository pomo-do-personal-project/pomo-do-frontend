import { create } from "zustand";

export type AiFocusStatus = "FOCUSED" | "DISTRACTED" | "AFK" | "DISCONNECTED";

interface AiFocusData {
  status: AiFocusStatus;
  detail: string;
  is_focused: boolean;
  active_screen: number | null;
  total_screens: number;
  look_x?: number | null;
  look_y?: number | null;
  has_face?: boolean;
}

interface AiFocusState {
  // Trạng thái kết nối & phần cứng
  isConnected: boolean;
  isAiEnabled: boolean;
  isConnecting: boolean;
  error: string | null;

  // Dữ liệu thời gian thực từ AI
  status: AiFocusStatus;
  detail: string;
  isFocused: boolean;
  activeScreen: number | null;
  totalScreens: number;
  image: string | null;
  showCameraPreview: boolean;

  // Thống kê phiên Pomodoro
  distractionCount: number;
  focusedSeconds: number;
  totalSessionSeconds: number;
  previousStatus: AiFocusStatus;

  // Actions
  toggleAiEnabled: () => void;
  toggleCameraPreview: () => void;
  connect: () => void;
  disconnect: () => void;
  addScreen: () => Promise<boolean>;
  resetScreens: () => Promise<boolean>;
  onTimerTick: (isWorkTimerRunning: boolean) => void;
  resetSessionStats: () => void;
  getFocusScore: () => number;
  generateSessionSummary: () => string;
}

const WS_URL = process.env.NEXT_PUBLIC_AI_WS_URL || "ws://localhost:8001/ws";

let socket: WebSocket | null = null;
let reconnectTimer: NodeJS.Timeout | null = null;

export const useAiFocusStore = create<AiFocusState>((set, get) => ({
  isConnected: false,
  isAiEnabled: false,
  isConnecting: false,
  error: null,

  status: "DISCONNECTED",
  detail: "Chưa kết nối AI",
  isFocused: false,
  activeScreen: null,
  totalScreens: 0,
  image: null,
  showCameraPreview: true,

  distractionCount: 0,
  focusedSeconds: 0,
  totalSessionSeconds: 0,
  previousStatus: "DISCONNECTED",

  toggleCameraPreview: () => {
    set((state) => ({ showCameraPreview: !state.showCameraPreview }));
  },

  toggleAiEnabled: () => {
    const { isAiEnabled, connect, disconnect } = get();
    const nextState = !isAiEnabled;
    set({ isAiEnabled: nextState });

    if (nextState) {
      connect();
    } else {
      disconnect();
    }
  },

  connect: () => {
    if (socket && (socket.readyState === WebSocket.OPEN || socket.readyState === WebSocket.CONNECTING)) {
      return;
    }

    if (reconnectTimer) {
      clearTimeout(reconnectTimer);
      reconnectTimer = null;
    }

    set({ isConnecting: true, error: null });

    try {
      socket = new WebSocket(WS_URL);

      socket.onopen = () => {
        set({
          isConnected: true,
          isConnecting: false,
          error: null,
          status: "AFK",
          detail: "Đã kết nối AI camera"
        });
        console.log("[useAiFocusStore] Đã kết nối WebSocket pomo-ai thành công!");
      };

      socket.onmessage = (event) => {
        try {
          const data = JSON.parse(event.data);

          if (data.event === "focus_update") {
            const rawStatus = (data.status as AiFocusStatus) || "AFK";
            const detail = data.detail || "";
            const isFocused = Boolean(data.is_focused);
            const activeScreen = data.active_screen ?? null;
            const totalScreens = Number(data.total_screens || 0);
            const image = data.image || null;

            set({
              status: rawStatus,
              detail: detail,
              isFocused: isFocused,
              activeScreen: activeScreen,
              totalScreens: totalScreens,
              image: image || get().image
            });
          } else if (data.event === "screen_added") {
            set({ totalScreens: Number(data.total_screens || 0) });
          } else if (data.event === "screens_reset") {
            set({ totalScreens: 0, activeScreen: null });
          }
        } catch (err) {
          console.warn("[useAiFocusStore] Lỗi đọc gói tin WebSocket:", err);
        }
      };

      socket.onerror = (err) => {
        console.warn("[useAiFocusStore] Lỗi kết nối WebSocket:", err);
        set({ isConnected: false, isConnecting: false, error: "Không thể kết nối đến máy chủ AI (Port 8001)" });
      };

      socket.onclose = () => {
        set({
          isConnected: false,
          isConnecting: false,
          status: "DISCONNECTED",
          detail: "Chưa kết nối AI"
        });
        socket = null;

        // Tự động kết nối lại sau 3 giây nếu người dùng vẫn bật AI
        if (get().isAiEnabled) {
          reconnectTimer = setTimeout(() => {
            get().connect();
          }, 3000);
        }
      };
    } catch (err: any) {
      set({
        isConnected: false,
        isConnecting: false,
        status: "DISCONNECTED",
        error: err?.message || "Lỗi khởi tạo WebSocket"
      });
    }
  },

  disconnect: () => {
    if (reconnectTimer) {
      clearTimeout(reconnectTimer);
      reconnectTimer = null;
    }

    if (socket) {
      try {
        socket.close();
      } catch (e) {
        // ignore
      }
      socket = null;
    }

    set({
      isConnected: false,
      isConnecting: false,
      status: "DISCONNECTED",
      detail: "AI đang tắt",
      isFocused: false,
      activeScreen: null
    });
  },

  addScreen: async () => {
    if (!socket || socket.readyState !== WebSocket.OPEN) {
      return false;
    }

    try {
      socket.send(JSON.stringify({ action: "add_screen" }));
      return true;
    } catch (err) {
      console.error("[useAiFocusStore] Lỗi khi gửi lệnh add_screen:", err);
      return false;
    }
  },

  resetScreens: async () => {
    if (!socket || socket.readyState !== WebSocket.OPEN) {
      return false;
    }

    try {
      socket.send(JSON.stringify({ action: "reset" }));
      return true;
    } catch (err) {
      console.error("[useAiFocusStore] Lỗi khi gửi lệnh reset:", err);
      return false;
    }
  },

  // Gọi mỗi giây khi đồng hồ đếm giờ Pomodoro hoạt động
  onTimerTick: (isWorkTimerRunning: boolean) => {
    const { isConnected, isAiEnabled, status, previousStatus, distractionCount, focusedSeconds, totalSessionSeconds } = get();

    // Chỉ thống kê khi đang trong phiên làm việc Pomodoro và AI đang bật
    if (!isWorkTimerRunning || !isAiEnabled || !isConnected) {
      return;
    }

    const nextTotal = totalSessionSeconds + 1;
    let nextFocused = focusedSeconds;
    let nextDistractions = distractionCount;

    if (status === "FOCUSED") {
      nextFocused += 1;
    }

    // Chỉ tăng số lần mất tập trung khi có sự CHUYỂN TRẠNG THÁI từ FOCUSED sang DISTRACTED hoặc AFK
    if (previousStatus === "FOCUSED" && (status === "DISTRACTED" || status === "AFK")) {
      nextDistractions += 1;
    }

    set({
      focusedSeconds: nextFocused,
      totalSessionSeconds: nextTotal,
      previousStatus: status,
      distractionCount: nextDistractions
    });
  },

  resetSessionStats: () => {
    set({
      distractionCount: 0,
      focusedSeconds: 0,
      totalSessionSeconds: 0,
      previousStatus: get().status
    });
  },

  getFocusScore: () => {
    const { focusedSeconds, totalSessionSeconds } = get();
    if (totalSessionSeconds <= 0) return 100;
    const score = Math.round((focusedSeconds / totalSessionSeconds) * 100);
    return Math.min(100, Math.max(0, score));
  },

  generateSessionSummary: () => {
    const { totalSessionSeconds, distractionCount } = get();
    if (totalSessionSeconds < 10) return "";

    const score = get().getFocusScore();
    const countText = distractionCount > 0 ? `${distractionCount} lần xao nhãng` : "Không xao nhãng";
    return `AI Focus: ${score}% (${countText})`;
  }
}));
