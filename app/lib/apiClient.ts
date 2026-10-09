import { ApiResponse } from "../types/api";
import { useNetworkStore } from "../stores/useNetworkStore";

const API_BASE_URL = process.env.NEXT_PUBLIC_API_URL || "https://localhost:7123";

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
 * Universal type-safe fetch client for Pomo-Do backend
 * Features:
 * - Cookie-based HttpOnly JWT auth
 * - Automatic 401 refresh-token interceptor & retry
 * - Global Offline & Network Error detection
 */
export async function apiClient<T>(
  endpoint: string,
  options: RequestOptions = {}
): Promise<ApiResponse<T>> {
  const { params, headers, ...restOptions } = options;

  let url = `${API_BASE_URL}${endpoint.startsWith("/") ? endpoint : `/${endpoint}`}`;

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

  const defaultHeaders: Record<string, string> = {
    "Content-Type": "application/json",
  };

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

    const data: ApiResponse<T> = await res.json().catch(() => ({
      success: res.ok,
      data: null,
      message: res.statusText || "Lỗi giao tiếp máy chủ",
      errors: [res.statusText],
    }));

    // Tự động làm mới token nếu gặp 401 và không phải đang gọi auth endpoints
    if (res.status === 401 && !endpoint.includes("/api/auth/")) {
      try {
        const refreshRes = await fetch(`${API_BASE_URL}/api/auth/refresh-token`, {
          method: "POST",
          credentials: "include",
          headers: defaultHeaders,
          body: JSON.stringify({}),
        });

        if (refreshRes.ok) {
          // Thử lại request ban đầu sau khi cookie token đã được làm mới
          const retryRes = await fetch(url, {
            credentials: "include",
            ...restOptions,
            headers: {
              ...defaultHeaders,
              ...headers,
            },
          });

          const retryData: ApiResponse<T> = await retryRes.json().catch(() => ({
            success: retryRes.ok,
            data: null,
            message: retryRes.statusText || "Lỗi giao tiếp máy chủ",
            errors: [retryRes.statusText],
          }));

          if (retryRes.ok && retryData.success) {
            return retryData;
          }
        } else {
          // Refresh thất bại (token hết hạn hẳn) -> tự động dọn dẹp cache
          const { clearAllUserData } = await import("./sessionManager");
          clearAllUserData();
        }
      } catch {
        // Refresh gặp lỗi mạng/ngoại lệ -> dọn dẹp cache phiên cũ
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
