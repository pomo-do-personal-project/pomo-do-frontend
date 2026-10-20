import { apiClient } from "../lib/apiClient";
import {
  AuthResponse,
  UserDto,
  LoginRequest,
  RegisterRequest,
  SendOtpRequest,
  ForgotPasswordRequest,
  ResetPasswordRequest,
} from "../types/api";

export const authService = {
  /**
   * Gửi mã OTP xác thực 6 số qua email để đăng ký tài khoản
   */
  async sendOtp(data: SendOtpRequest): Promise<string> {
    const res = await apiClient<string>("/api/auth/otp/send", {
      method: "POST",
      body: JSON.stringify(data),
    });
    return res.message;
  },

  /**
   * Đăng ký tài khoản mới kèm mã xác thực OTP
   */
  async register(data: RegisterRequest): Promise<UserDto | null> {
    const res = await apiClient<UserDto>("/api/auth/register", {
      method: "POST",
      body: JSON.stringify(data),
    });
    return res.data;
  },

  /**
   * Gửi email kèm liên kết đặt lại mật khẩu
   */
  async forgotPassword(data: ForgotPasswordRequest): Promise<string> {
    const res = await apiClient<string>("/api/auth/forgot-password", {
      method: "POST",
      body: JSON.stringify(data),
    });
    return res.message;
  },

  /**
   * Đặt lại mật khẩu mới bằng token từ email
   */
  async resetPassword(data: ResetPasswordRequest): Promise<string> {
    const res = await apiClient<string>("/api/auth/reset-password", {
      method: "POST",
      body: JSON.stringify(data),
    });
    return res.message;
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
  async logout(refreshToken?: string) {
    try {
      await apiClient("/api/auth/logout", {
        method: "POST",
        body: JSON.stringify(refreshToken ? { refreshToken } : {}),
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
