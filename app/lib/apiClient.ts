import { ApiResponse } from "../types/api";
import { useNetworkStore } from "../stores/useNetworkStore";
import { getApiBaseUrl } from "./apiUrl";

export interface RequestOptions extends RequestInit {
  params?: Record<string, string | number | boolean | undefined>;
}

export class ApiError extends Error {
  public statusCode: number;
  public errors: string[] | null;
  public isNetworkError: boolean;

  constructor(
    message: string,
    statusCode: number = 500,
    errors: string[] | null = null,
    isNetworkError: boolean = false
  ) {
    super(message);
    this.name = "ApiError";
    this.statusCode = statusCode;
    this.errors = errors;
    this.isNetworkError = isNetworkError;
  }
}

/**
 * Single-flight mutex: Đảm bảo chỉ 1 request gọi refresh-token tại một thời điểm.
 * Các request 401 đồng thời sẽ chia sẻ chung kết quả của Promise này.
 */
let refreshPromise: Promise<boolean> | null = null;

async function executeRefreshToken(): Promise<boolean> {
  if (refreshPromise) {
    return refreshPromise;
  }

  refreshPromise = (async () => {
    try {
      const { useAuthStore } = await import("../stores/useAuthStore");
      const currentRefreshToken = useAuthStore.getState().refreshTokenString;

      const refreshRes = await fetch(`${getApiBaseUrl()}/api/auth/refresh-token`, {
        method: "POST",
        credentials: "include",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(currentRefreshToken ? { refreshToken: currentRefreshToken } : {}),
      });

      if (refreshRes.ok) {
        const raw = await refreshRes.json().catch(() => null);
        const data = raw?.data;
        if (data?.accessToken) {
          useAuthStore.getState().setTokens(
            data.accessToken,
            data.refreshToken || currentRefreshToken
          );
        }
        return true;
      }

      return false;
    } catch {
      return false;
    } finally {
      refreshPromise = null;
    }
  })();

  return refreshPromise;
}

/**
 * Universal type-safe fetch client for Pomo-Do backend
 * Features:
 * - Cookie-based HttpOnly JWT auth + Bearer Header Fallback (Dual Resilience)
 * - Automatic 401 refresh-token interceptor & retry (Single-Flight Mutex)
 * - Global Offline & Network Error detection
 */
export async function apiClient<T>(
  endpoint: string,
  options: RequestOptions = {}
): Promise<ApiResponse<T>> {
  const { params, headers, ...restOptions } = options;

  let url: string;
  if (endpoint.startsWith("http://") || endpoint.startsWith("https://")) {
    url = endpoint;
  } else {
    const cleanEndpoint = endpoint.startsWith("/api/") || endpoint === "/api"
      ? endpoint
      : endpoint.startsWith("api/")
      ? `/${endpoint}`
      : endpoint.startsWith("/")
      ? `/api${endpoint}`
      : `/api/${endpoint}`;
    url = `${getApiBaseUrl()}${cleanEndpoint}`;
  }

  if (params) {
    const searchParams = new URLSearchParams();
    Object.entries(params).forEach(([key, value]) => {
      if (value !== undefined) {
        searchParams.append(key, String(value));
      }
    });
    const queryString = searchParams.toString();
    if (queryString) {
      url += `?${queryString}`;
    }
  }

  const defaultHeaders: Record<string, string> = {};
  if (!(restOptions.body instanceof FormData)) {
    defaultHeaders["Content-Type"] = "application/json";
  }

  // Tự động gắn Authorization Bearer token nếu có trong store (Fallback chống chặn 3rd-party cookie)
  try {
    const { useAuthStore } = await import("../stores/useAuthStore");
    const accessToken = useAuthStore.getState().accessToken;
    if (accessToken) {
      defaultHeaders["Authorization"] = `Bearer ${accessToken}`;
    }
  } catch {
    // Không ném lỗi nếu môi trường không có store
  }

  try {
    const res = await fetch(url, {
      credentials: "include", // Tự động gửi & nhận HttpOnly cookies từ backend .NET
      ...restOptions,
      headers: {
        ...defaultHeaders,
        ...headers,
      },
    });

    // Kết nối thành công tới server -> cập nhật server online
    useNetworkStore.getState().setServerOnline(true);

    const rawData = await res.json().catch(() => null);
    const data: ApiResponse<T> = rawData && typeof rawData === "object"
      ? {
          success: rawData.success ?? res.ok,
          data: rawData.data ?? null,
          message: rawData.message || rawData.detail || rawData.title || (res.ok ? "Thành công" : `Yêu cầu thất bại (HTTP ${res.status})`),
          errors: rawData.errors || (rawData.detail ? [rawData.detail] : [res.statusText || `HTTP ${res.status}`]),
        }
      : {
          success: res.ok,
          data: null,
          message: res.statusText || `Máy chủ phản hồi mã ${res.status}`,
          errors: [res.statusText || `HTTP ${res.status}`],
        };

    // Tự động làm mới token nếu gặp 401 và không phải đang gọi auth endpoints
    if (res.status === 401 && !endpoint.includes("/api/auth/")) {
      const refreshSuccess = await executeRefreshToken();

      if (refreshSuccess) {
        // Cập nhật lại Authorization header với Access Token mới nhất sau khi refresh
        const { useAuthStore } = await import("../stores/useAuthStore");
        const newAccessToken = useAuthStore.getState().accessToken;
        const retryHeaders: HeadersInit = {
          ...defaultHeaders,
          ...(headers as Record<string, string>),
          ...(newAccessToken ? { Authorization: `Bearer ${newAccessToken}` } : {}),
        };

        // Thử lại request ban đầu sau khi token đã được làm mới
        const retryRes = await fetch(url, {
          credentials: "include",
          ...restOptions,
          headers: retryHeaders,
        });

        const rawRetry = await retryRes.json().catch(() => null);
        const retryData: ApiResponse<T> = rawRetry && typeof rawRetry === "object"
          ? {
              success: rawRetry.success ?? retryRes.ok,
              data: rawRetry.data ?? null,
              message: rawRetry.message || rawRetry.detail || rawRetry.title || (retryRes.ok ? "Thành công" : `Yêu cầu thất bại (HTTP ${retryRes.status})`),
              errors: rawRetry.errors || (rawRetry.detail ? [rawRetry.detail] : [retryRes.statusText || `HTTP ${retryRes.status}`]),
            }
          : {
              success: retryRes.ok,
              data: null,
              message: retryRes.statusText || `Máy chủ phản hồi mã ${retryRes.status}`,
              errors: [retryRes.statusText || `HTTP ${retryRes.status}`],
            };

        if (retryRes.ok && retryData.success) {
          return retryData;
        }
      } else {
        // Refresh thất bại (token hết hạn hẳn) -> tự động dọn dẹp cache
        const { clearAllUserData } = await import("./sessionManager");
        clearAllUserData();
      }
    }

    if (!res.ok || !data.success) {
      throw new ApiError(
        data.message || `Lỗi hệ thống (${res.status})`,
        res.status,
        data.errors,
        false
      );
    }

    return data;
  } catch (error) {
    if (error instanceof ApiError) {
      throw error;
    }

    // Phát hiện lỗi không thể kết nối tới server (Failed to fetch / ERR_CONNECTION_REFUSED)
    useNetworkStore.getState().setServerOnline(false);

    throw new ApiError(
      "Không thể kết nối đến máy chủ backend (Máy chủ đang tắt hoặc mất mạng)",
      0,
      ["Backend offline or Network unreachable"],
      true
    );
  }
}
