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
   * Đăng xuất & xóa phiên
   */
  async logout() {
    // Có thể gọi thêm endpoint /api/auth/logout nếu backend hỗ trợ để xóa HttpOnly cookie
    try {
      await apiClient("/api/auth/logout", { method: "POST" }).catch(() => {});
    } catch {
      // Ignored
    }
  },
};
