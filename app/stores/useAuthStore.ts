import { create } from "zustand";
import { persist, createJSONStorage } from "zustand/middleware";
import { authService } from "../services/authService";
import {
  UserDto,
  LoginRequest,
  RegisterRequest,
  OtpPurpose,
  ResetPasswordRequest,
} from "../types/api";

interface AuthState {
  user: UserDto | null;
  accessToken: string | null;
  refreshTokenString: string | null;
  isAuthenticated: boolean;
  isLoading: boolean;
  error: string | null;

  // Actions
  setTokens: (accessToken: string | null, refreshTokenString: string | null) => void;
  login: (data: LoginRequest) => Promise<boolean>;
  register: (data: RegisterRequest) => Promise<boolean>;
  sendOtp: (email: string, purpose?: OtpPurpose) => Promise<string>;
  forgotPassword: (email: string) => Promise<string>;
  resetPassword: (data: ResetPasswordRequest) => Promise<string>;
  logout: () => Promise<void>;
  refreshToken: (token?: string) => Promise<boolean>;
  clearError: () => void;
  setUser: (user: UserDto | null) => void;
}

export const useAuthStore = create<AuthState>()(
  persist(
    (set, get) => ({
      user: null,
      accessToken: null,
      refreshTokenString: null,
      isAuthenticated: false,
      isLoading: false,
      error: null,

      clearError: () => set({ error: null }),

      setUser: (user) => set({
        user,
        isAuthenticated: !!user,
        ...(user ? {} : { accessToken: null, refreshTokenString: null }),
      }),

      setTokens: (accessToken, refreshTokenString) => set({ accessToken, refreshTokenString }),

      login: async (credentials: LoginRequest) => {
        set({ isLoading: true, error: null });
        try {
          const authData = await authService.login(credentials);
          if (authData) {
            set({
              user: authData.user,
              accessToken: authData.accessToken,
              refreshTokenString: authData.refreshToken,
              isAuthenticated: true,
              isLoading: false,
              error: null,
            });
            return true;
          }
          set({ isLoading: false, error: "Đăng nhập thất bại" });
          return false;
        } catch (err: any) {
          const msg = err?.message || "Đăng nhập thất bại";
          set({
            isLoading: false,
            error: msg,
            isAuthenticated: false,
            accessToken: null,
            refreshTokenString: null,
          });
          throw err;
        }
      },

      sendOtp: async (email: string, purpose: OtpPurpose = OtpPurpose.Register) => {
        set({ isLoading: true, error: null });
        try {
          const message = await authService.sendOtp({ email, purpose });
          set({ isLoading: false });
          return message;
        } catch (err: any) {
          const msg = err?.message || "Không thể gửi mã OTP";
          set({ isLoading: false, error: msg });
          throw err;
        }
      },

      register: async (data: RegisterRequest) => {
        set({ isLoading: true, error: null });
        try {
          const user = await authService.register(data);
          set({ isLoading: false });
          return !!user;
        } catch (err: any) {
          const msg = err?.message || "Đăng ký thất bại";
          set({
            isLoading: false,
            error: msg,
          });
          throw err;
        }
      },

      forgotPassword: async (email: string) => {
        set({ isLoading: true, error: null });
        try {
          const message = await authService.forgotPassword({ email });
          set({ isLoading: false });
          return message;
        } catch (err: any) {
          const msg = err?.message || "Không thể gửi yêu cầu đặt lại mật khẩu";
          set({ isLoading: false, error: msg });
          throw err;
        }
      },

      resetPassword: async (data: ResetPasswordRequest) => {
        set({ isLoading: true, error: null });
        try {
          const message = await authService.resetPassword(data);
          set({ isLoading: false });
          return message;
        } catch (err: any) {
          const msg = err?.message || "Không thể đặt lại mật khẩu";
          set({ isLoading: false, error: msg });
          throw err;
        }
      },

      logout: async () => {
        try {
          const rt = get().refreshTokenString || undefined;
          await authService.logout(rt);
        } finally {
          const { clearAllUserData } = await import("../lib/sessionManager");
          clearAllUserData();
        }
      },

      refreshToken: async (token?: string) => {
        try {
          const tokenToSend = token || get().refreshTokenString || undefined;
          const authData = await authService.refreshToken(tokenToSend);
          if (authData) {
            if ("user" in authData && authData.user) {
              set({
                user: authData.user,
                accessToken: authData.accessToken,
                refreshTokenString: authData.refreshToken,
                isAuthenticated: true,
              });
            } else if ("accessToken" in authData) {
              set({
                accessToken: authData.accessToken,
                refreshTokenString: authData.refreshToken,
                isAuthenticated: true,
              });
            }
            return true;
          }
          const { clearAllUserData } = await import("../lib/sessionManager");
          clearAllUserData();
          return false;
        } catch {
          // Token hết hạn hoặc không hợp lệ -> reset toàn bộ dữ liệu người dùng
          const { clearAllUserData } = await import("../lib/sessionManager");
          clearAllUserData();
          return false;
        }
      },
    }),
    {
      name: "pomo-auth-storage",
      storage: createJSONStorage(() => localStorage),
      partialize: (state) => ({
        user: state.user,
        accessToken: state.accessToken,
        refreshTokenString: state.refreshTokenString,
        isAuthenticated: state.isAuthenticated,
      }),
    }
  )
);
