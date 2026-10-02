import { apiClient } from "../lib/apiClient";
import { AuthResponse, LoginRequest, RegisterRequest } from "../types/api";

export const authService = {
  /**
   * Đăng ký tài khoản mới qua backend API (Cookies HttpOnly được browser tự động lưu)
   */
  async register(data: RegisterRequest) {
    const res = await apiClient<AuthResponse>("/api/auth/register", {
      method: "POST",
      body: JSON.stringify(data),
    });

    return res.data;
  },

  /**
   * Đăng nhập người dùng qua backend API (Cookies HttpOnly được browser tự động lưu)
   */
  async login(data: LoginRequest) {
    const res = await apiClient<AuthResponse>("/api/auth/login", {
      method: "POST",
      body: JSON.stringify(data),
    });

    return res.data;
  },

  /**
   * Đăng xuất & xóa phiên (hủy cookie và thu hồi token trên backend)
   */
  async logout() {
    try {
      await apiClient("/api/auth/logout", {
        method: "POST",
      }).catch(() => {});
    } catch {
      // Ignored
    }
  },

  /**
   * Làm mới Access Token (Refresh token qua HttpOnly cookie hoặc body)
   */
  async refreshToken(refreshToken?: string) {
    const res = await apiClient<AuthResponse | { accessToken: string; refreshToken: string }>(
      "/api/auth/refresh-token",
      {
        method: "POST",
        body: JSON.stringify(refreshToken ? { refreshToken } : {}),
      }
    );

    return res.data;
  },
};
