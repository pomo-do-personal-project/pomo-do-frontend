import { create } from "zustand";
import { AiFocusStatus, AiFocusState, AiSessionAnalysis, AiEventCode } from "../types/aiFocus";
import { cameraStreamer } from "../lib/cameraStreamer";
import { useAiOverlayStore } from "../lib/aiOverlay";

export type { AiFocusStatus, AiSensitivity, AiSessionAnalysis, AiFocusState, AiEventCode } from "../types/aiFocus";

const WS_URL = process.env.NEXT_PUBLIC_AI_WS_URL || "ws://localhost:8001/ws";
const HTTP_URL = process.env.NEXT_PUBLIC_AI_API_URL || WS_URL.replace("wss://", "https://").replace("ws://", "http://").replace(/\/ws\/?$/, "");

let socket: WebSocket | null = null;
let reconnectTimer: NodeJS.Timeout | null = null;

let screenAddedResolver: ((success: boolean) => void) | null = null;

export const useAiFocusStore = create<AiFocusState>()((set, get) => ({
  isConnected: false,
  isAiEnabled: false,
  isConnecting: false,
  error: null,

  status: "DISCONNECTED",
  eventCode: "NORMAL",
  detail: "Chưa kết nối AI",
  isFocused: false,
  activeScreen: null,
  totalScreens: 0,
  image: null,
  showCameraPreview: true,
  sensitivity: "relaxed",
  deskReadingMode: false,
  blurBackground: typeof window !== "undefined" ? localStorage.getItem("ai_blur_background") === "true" : false,
  blurredImage: null,

  distractionCount: 0,
  phoneCount: 0,
  phoneSeconds: 0,
  sleepCount: 0,
  lookAwayCount: 0,
  focusedSeconds: 0,
  distractedSeconds: 0,
  totalSessionSeconds: 0,
  previousStatus: "DISCONNECTED",
  previousEventCode: "NORMAL",
  previousDetail: "",

  toggleCameraPreview: () => set((s) => ({ showCameraPreview: !s.showCameraPreview })),

  setSensitivity: (level: "relaxed" | "standard" | "strict") => {
    set({ sensitivity: level });
    if (socket && socket.readyState === WebSocket.OPEN) {
      try {
        socket.send(JSON.stringify({ action: "set_sensitivity", level }));
      } catch {}
    }
  },

  setDeskReadingMode: (enabled: boolean) => {
    set({ deskReadingMode: enabled });
    if (socket && socket.readyState === WebSocket.OPEN) {
      try {
        socket.send(JSON.stringify({ action: "set_desk_reading_mode", enabled }));
      } catch {}
    }
  },

  setBlurBackground: (enabled: boolean) => {
    set({ blurBackground: enabled, ...(enabled ? {} : { blurredImage: null }) });
    if (typeof window !== "undefined") {
      try {
        localStorage.setItem("ai_blur_background", String(enabled));
      } catch {}
    }
    if (socket && socket.readyState === WebSocket.OPEN) {
      try {
        socket.send(JSON.stringify({ action: "set_blur_background", enabled }));
      } catch {}
    }
  },

  toggleAiEnabled: () => {
    const nextState = !get().isAiEnabled;
    set({ isAiEnabled: nextState });
    if (nextState) get().connect();
    else get().disconnect();
  },

  connect: () => {
    if (socket && (socket.readyState === WebSocket.OPEN || socket.readyState === WebSocket.CONNECTING)) return;
    if (reconnectTimer) { clearTimeout(reconnectTimer); reconnectTimer = null; }

    set({ isConnecting: true, error: null });
    try {
      socket = new WebSocket(WS_URL);
      socket.onopen = async () => {
        set({ isConnected: true, isConnecting: false, error: null, status: "AFK", detail: "Đã kết nối AI" });

        // Gửi thiết lập độ nhạy, chế độ đọc sách và làm mờ nền hiện tại
        if (socket && socket.readyState === WebSocket.OPEN) {
          try {
            socket.send(JSON.stringify({ action: "set_sensitivity", level: get().sensitivity }));
            socket.send(JSON.stringify({ action: "set_desk_reading_mode", enabled: get().deskReadingMode }));
            socket.send(JSON.stringify({ action: "set_blur_background", enabled: get().blurBackground }));
          } catch {}
        }

        // Tự động yêu cầu quyền camera trình duyệt và bắt đầu truyền frames (24 FPS phản hồi tức thì)
        const cameraOk = await cameraStreamer.start((frameBase64) => {
          if (socket && socket.readyState === WebSocket.OPEN) {
            socket.send(JSON.stringify({ action: "frame", image: frameBase64 }));
          }
        }, 24);

        if (!cameraOk) {
          set({ error: "Vui lòng cấp quyền truy cập Camera trên trình duyệt" });
        }
      };
      socket.onmessage = (event) => {
        try {
          const data = JSON.parse(event.data);
          if (data.event === "focus_update") {
            cameraStreamer.notifyServerReady();
            useAiOverlayStore.getState().setData({
              faceBox: data.face_box || null,
              phoneBoxes: Array.isArray(data.phone_boxes) ? data.phone_boxes : [],
              hands: Array.isArray(data.hands) ? data.hands : [],
              hasFace: Boolean(data.has_face),
              hasPhone: Boolean(data.has_phone),
              hasCall: Boolean(data.has_call),
              isFocused: Boolean(data.is_focused),
              detail: data.detail || "",
              activeScreen: data.active_screen ?? null,
            });
            const eventCode: AiEventCode = (data.event_code as AiEventCode) || (
              data.status === "FOCUSED" ? "NORMAL" :
              data.detail?.toLowerCase().includes("điện thoại") ? "PHONE_DETECTED" :
              data.detail?.toLowerCase().includes("ngủ") ? "SLEEPING" :
              data.status === "AFK" ? "AFK" : "LOOK_AWAY"
            );
            set({
              status: (data.status as AiFocusStatus) || "AFK",
              eventCode,
              detail: data.detail || "",
              isFocused: Boolean(data.is_focused),
              activeScreen: data.active_screen ?? null,
              totalScreens: Number(data.total_screens || 0),
              image: "live",
              blurredImage: data.blurred_image || null,
            });
          } else if (data.event === "screen_added") {
            set({ totalScreens: Number(data.total_screens || 0) });
            if (screenAddedResolver) {
              screenAddedResolver(Boolean(data.success));
              screenAddedResolver = null;
            }
          } else if (data.event === "screens_reset") {
            set({ totalScreens: 0, activeScreen: null });
          }
        } catch {}
      };
      socket.onerror = () => {
        cameraStreamer.stop();
        set({ isConnected: false, isConnecting: false, error: "Lỗi kết nối AI" });
      };
      socket.onclose = () => {
        cameraStreamer.stop();
        set({ isConnected: false, isConnecting: false, status: "DISCONNECTED", eventCode: "NORMAL", detail: "AI đang tắt" });
        socket = null;
        if (get().isAiEnabled) reconnectTimer = setTimeout(() => get().connect(), 3000);
      };
    } catch (err: unknown) {
      cameraStreamer.stop();
      const msg = err instanceof Error ? err.message : "Lỗi";
      set({ isConnected: false, isConnecting: false, status: "DISCONNECTED", error: msg });
    }
  },

  disconnect: () => {
    cameraStreamer.stop();
    if (reconnectTimer) { clearTimeout(reconnectTimer); reconnectTimer = null; }
    if (socket) { try { socket.close(); } catch {} socket = null; }
    set({ isConnected: false, isConnecting: false, status: "DISCONNECTED", eventCode: "NORMAL", detail: "AI đang tắt", image: null });
  },

  addScreen: async () => {
    if (!socket || socket.readyState !== WebSocket.OPEN) return false;
    return new Promise<boolean>((resolve) => {
      const timer = setTimeout(() => {
        if (screenAddedResolver) {
          screenAddedResolver = null;
          resolve(false);
        }
      }, 3000);

      screenAddedResolver = (success: boolean) => {
        clearTimeout(timer);
        resolve(success);
      };

      try {
        socket?.send(JSON.stringify({ action: "add_screen" }));
      } catch {
        clearTimeout(timer);
        screenAddedResolver = null;
        resolve(false);
      }
    });
  },

  resetScreens: async () => {
    if (!socket || socket.readyState !== WebSocket.OPEN) return false;
    try { socket.send(JSON.stringify({ action: "reset" })); return true; } catch { return false; }
  },

  onTimerTick: (isWorkTimerRunning: boolean) => {
    const s = get();
    if (!isWorkTimerRunning || !s.isAiEnabled || !s.isConnected) return;

    const nextTotal = s.totalSessionSeconds + 1;
    let { focusedSeconds: nextFocused, distractedSeconds: nextDistracted, distractionCount: nextDistractions } = s;
    let { phoneCount: nextPhoneCount, phoneSeconds: nextPhoneSeconds, sleepCount: nextSleepCount, lookAwayCount: nextLookAwayCount } = s;

    if (s.status === "FOCUSED") {
      nextFocused += 1;
    } else {
      nextDistracted += 1;
      const ec = s.eventCode;
      const prevEc = s.previousEventCode;

      switch (ec) {
        case "PHONE_DETECTED":
          nextPhoneSeconds += 1;
          if (prevEc !== "PHONE_DETECTED") nextPhoneCount += 1;
          break;
        case "SLEEPING":
          if (prevEc !== "SLEEPING") nextSleepCount += 1;
          break;
        case "AFK":
        case "LOOK_AWAY":
          if (s.previousStatus === "FOCUSED") nextLookAwayCount += 1;
          break;
        default: {
          const d = s.detail.toLowerCase(), prevD = s.previousDetail.toLowerCase();
          if (d.includes("điện thoại") || d.includes("phone")) {
            nextPhoneSeconds += 1;
            if (!prevD.includes("điện thoại")) nextPhoneCount += 1;
          }
          if ((d.includes("ngủ") || d.includes("sleep")) && !prevD.includes("ngủ")) nextSleepCount += 1;
          if ((d.includes("ngoài") || s.status === "AFK") && s.previousStatus === "FOCUSED") nextLookAwayCount += 1;
          break;
        }
      }

      if (s.previousStatus === "FOCUSED") nextDistractions += 1;
    }

    set({
      totalSessionSeconds: nextTotal, focusedSeconds: nextFocused, distractedSeconds: nextDistracted,
      distractionCount: nextDistractions, phoneCount: nextPhoneCount, phoneSeconds: nextPhoneSeconds,
      sleepCount: nextSleepCount, lookAwayCount: nextLookAwayCount,
      previousStatus: s.status, previousEventCode: s.eventCode, previousDetail: s.detail,
    });
  },

  resetSessionStats: () => set({
    distractionCount: 0, phoneCount: 0, phoneSeconds: 0, sleepCount: 0, lookAwayCount: 0,
    focusedSeconds: 0, distractedSeconds: 0, totalSessionSeconds: 0,
    previousStatus: get().status, previousEventCode: get().eventCode, previousDetail: "",
  }),

  getFocusScore: () => {
    const { focusedSeconds, totalSessionSeconds } = get();
    if (totalSessionSeconds <= 0) return 100;
    return Math.min(100, Math.max(0, Math.round((focusedSeconds / totalSessionSeconds) * 100)));
  },

  analyzeAndFinalizeSession: async (taskName = "Tự do") => {
    const s = get();
    const total = Math.max(1, s.totalSessionSeconds);
    const focused = s.focusedSeconds;
    const score = Math.min(100, Math.max(0, Math.round((focused / total) * 100)));
    const grade = score >= 95 ? "S" : score >= 85 ? "A" : score >= 70 ? "B" : score >= 50 ? "C" : "D";

    const payload = {
      total_seconds: total,
      focused_seconds: focused,
      phone_count: s.phoneCount,
      phone_seconds: s.phoneSeconds,
      sleep_count: s.sleepCount,
      look_away_count: s.lookAwayCount,
      task_name: taskName,
    };

    // Gọi API analyze_session của pomo-ai với timeout 1200ms
    try {
      const controller = new AbortController();
      const timeoutId = setTimeout(() => controller.abort(), 1200);
      const res = await fetch(`${HTTP_URL}/analyze_session`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(payload),
        signal: controller.signal,
      });
      clearTimeout(timeoutId);
      if (res.ok) {
        const data = await res.json();
        s.resetSessionStats();
        return {
          score: data.score,
          grade: data.grade,
          conclusion: data.conclusion,
          advice: data.advice,
          phoneCount: data.phone_count,
          phoneSeconds: s.phoneSeconds,
          sleepCount: data.sleep_count,
          lookAwayCount: data.look_away_count,
          focusedSeconds: data.focused_seconds,
          distractedSeconds: s.distractedSeconds,
          totalSeconds: data.total_seconds,
        };
      }
    } catch {}

    // Fallback phân tích cục bộ tức thì
    const insights = [score >= 85 ? `Xuất sắc! Bạn tập trung ${score}% trong phiên '${taskName}'.` : `Phiên học đạt ${score}% tập trung.`];
    if (s.phoneCount > 0) insights.push(`Có ${s.phoneCount} lần dùng điện thoại.`);
    if (s.sleepCount > 0) insights.push(`Có ${s.sleepCount} lần ngủ gật.`);
    if (s.lookAwayCount > 0) insights.push(`Có ${s.lookAwayCount} lần nhìn ra ngoài.`);

    const advice = s.phoneCount > 0 ? "Để điện thoại xa bàn ở phiên tiếp theo." : s.sleepCount > 0 ? "Vươn vai rửa mặt nếu buồn ngủ." : "Tiếp tục duy trì phong độ!";
    const analysis: AiSessionAnalysis = {
      score,
      grade,
      conclusion: insights.join(" "),
      advice,
      phoneCount: s.phoneCount,
      phoneSeconds: s.phoneSeconds,
      sleepCount: s.sleepCount,
      lookAwayCount: s.lookAwayCount,
      focusedSeconds: focused,
      distractedSeconds: s.distractedSeconds,
      totalSeconds: total,
    };

    s.resetSessionStats();
    return analysis;
  },
}));
