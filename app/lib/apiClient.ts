import { ApiResponse } from "../types/api";

const API_BASE_URL = process.env.NEXT_PUBLIC_API_URL || "http://localhost:5267";

export interface RequestOptions extends RequestInit {
  params?: Record<string, string | number | boolean | undefined>;
}

export class ApiError extends Error {
  public statusCode: number;
  public errors: string[] | null;

  constructor(message: string, statusCode: number = 500, errors: string[] | null = null) {
    super(message);
    this.name = "ApiError";
    this.statusCode = statusCode;
    this.errors = errors;
  }
}

/**
 * Universal type-safe fetch client for Pomo-Do backend
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
        }
      } catch {
        // Refresh thất bại, tiếp tục throw lỗi 401
      }
    }

    if (!res.ok || !data.success) {
      throw new ApiError(
        data.message || `Lỗi hệ thống (${res.status})`,
        res.status,
        data.errors
      );
    }

    return data;
  } catch (error) {
    if (error instanceof ApiError) {
      throw error;
    }
    throw new ApiError(
      error instanceof Error ? error.message : "Không thể kết nối đến máy chủ backend",
      500,
      [error instanceof Error ? error.message : "Network error"]
    );
  }
}
