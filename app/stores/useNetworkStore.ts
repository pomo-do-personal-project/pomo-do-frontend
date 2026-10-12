import { create } from "zustand";

interface NetworkState {
  isServerOnline: boolean;
  isChecking: boolean;
  lastCheckedAt: Date | null;
  setServerOnline: (status: boolean) => void;
  checkHealth: () => Promise<boolean>;
}

const API_BASE_URL = process.env.NEXT_PUBLIC_API_URL || "https://localhost:7051";

export const useNetworkStore = create<NetworkState>((set) => ({
  isServerOnline: true, // Mặc định online
  isChecking: false,
  lastCheckedAt: null,

  setServerOnline: (status: boolean) =>
    set({ isServerOnline: status, lastCheckedAt: new Date() }),

  checkHealth: async () => {
    set({ isChecking: true });
    try {
      // Ping endpoint /api/tasks hoặc root api với timeout ngắn 3s
      const controller = new AbortController();
      const timeoutId = setTimeout(() => controller.abort(), 3500);

      const res = await fetch(`${API_BASE_URL}/api/tasks`, {
        method: "HEAD",
        credentials: "include",
        signal: controller.signal,
      }).catch(async () => {
        // Fallback test GET nhẹ nếu HEAD bị 405 Method Not Allowed
        return await fetch(`${API_BASE_URL}/api/tasks`, {
          method: "GET",
          credentials: "include",
          signal: controller.signal,
        });
      });

      clearTimeout(timeoutId);

      // Nếu res tồn tại (kể cả 401 Unauthorized do chưa login) thì server vẫn sống
      const isOnline = !!res;
      set({
        isServerOnline: isOnline,
        isChecking: false,
        lastCheckedAt: new Date(),
      });
      return isOnline;
    } catch {
      set({
        isServerOnline: false,
        isChecking: false,
        lastCheckedAt: new Date(),
      });
      return false;
    }
  },
}));
