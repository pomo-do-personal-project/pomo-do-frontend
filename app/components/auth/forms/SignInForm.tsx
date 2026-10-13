"use client";

import React, { useState } from "react";
import { Mail, Lock, Eye, EyeOff } from "lucide-react";
import { useAuthStore } from "../../../stores/useAuthStore";
import { ApiError } from "../../../lib/apiClient";
import { UserDto } from "../../../types/api";

interface SignInFormProps {
  initialEmail?: string;
  onSuccess: (user: UserDto) => void;
  onSwitchMode: (mode: "signup" | "forgot") => void;
  setError: (msg: string | null) => void;
  setSuccess: (msg: string | null) => void;
}

export function SignInForm({
  initialEmail = "",
  onSuccess,
  onSwitchMode,
  setError,
  setSuccess,
}: SignInFormProps) {
  const [email, setEmail] = useState(initialEmail);
  const [password, setPassword] = useState("");
  const [showPassword, setShowPassword] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);

  const login = useAuthStore((s) => s.login);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);
    setSuccess(null);
    setIsSubmitting(true);

    try {
      await login({
        email: email.trim(),
        password,
      });
      setSuccess("Đăng nhập thành công! Đang vào ứng dụng...");
      const currentUser = useAuthStore.getState().user;
      if (currentUser) {
        onSuccess(currentUser);
      }
    } catch (err: any) {
      if (err instanceof ApiError) {
        setError(err.message + (err.errors?.length ? `: ${err.errors.join(", ")}` : ""));
      } else {
        setError(err?.message || "Đăng nhập thất bại. Vui lòng kiểm tra lại tài khoản.");
      }
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <form onSubmit={handleSubmit} className="flex flex-col gap-3">
      <div className="relative">
        <div className="absolute inset-y-0 left-0 pl-3.5 flex items-center pointer-events-none text-neutral-400">
          <Mail size={16} strokeWidth={1.75} />
        </div>
        <input
          type="email"
          required
          value={email}
          onChange={(e) => setEmail(e.target.value)}
          placeholder="Email"
          className="w-full pl-10 pr-4 py-3 bg-transparent border-2 border-neutral-800 dark:border-neutral-200 rounded-2xl text-sm font-medium text-neutral-900 dark:text-white placeholder:text-neutral-400 focus:outline-none focus:ring-2 focus:ring-neutral-900 dark:focus:ring-white transition-all"
        />
      </div>

      <div className="relative">
        <div className="absolute inset-y-0 left-0 pl-3.5 flex items-center pointer-events-none text-neutral-400">
          <Lock size={16} strokeWidth={1.75} />
        </div>
        <input
          type={showPassword ? "text" : "password"}
          required
          value={password}
          onChange={(e) => setPassword(e.target.value)}
          placeholder="Mật khẩu"
          className="w-full pl-10 pr-10 py-3 bg-transparent border-2 border-neutral-800 dark:border-neutral-200 rounded-2xl text-sm font-medium text-neutral-900 dark:text-white placeholder:text-neutral-400 focus:outline-none focus:ring-2 focus:ring-neutral-900 dark:focus:ring-white transition-all"
        />
        <button
          type="button"
          onClick={() => setShowPassword(!showPassword)}
          className="absolute inset-y-0 right-0 pr-3.5 flex items-center text-neutral-400 hover:text-neutral-700 dark:hover:text-neutral-200 cursor-pointer"
        >
          {showPassword ? <EyeOff size={16} strokeWidth={1.75} /> : <Eye size={16} strokeWidth={1.75} />}
        </button>
      </div>

      <button
        type="submit"
        disabled={isSubmitting}
        className="w-full py-3 mt-1 bg-white hover:bg-neutral-100 dark:bg-neutral-800 dark:hover:bg-neutral-700 text-neutral-900 dark:text-white border-2 border-neutral-800 dark:border-neutral-200 rounded-2xl text-sm font-bold shadow-xs active:scale-[0.98] transition-all cursor-pointer disabled:opacity-60 disabled:cursor-not-allowed flex items-center justify-center gap-2"
      >
        {isSubmitting ? (
          <>
            <span className="inline-block w-4 h-4 border-2 border-current border-t-transparent rounded-full animate-spin" />
            <span>Đang đăng nhập...</span>
          </>
        ) : (
          <span>Đăng nhập (Sign In)</span>
        )}
      </button>

      <div className="text-center py-1">
        <button
          type="button"
          onClick={() => onSwitchMode("forgot")}
          className="text-xs font-semibold text-neutral-600 dark:text-neutral-400 hover:text-rose-600 dark:hover:text-rose-400 cursor-pointer hover:underline transition-colors"
        >
          Quên mật khẩu?
        </button>
      </div>

      <div className="w-full border-t border-neutral-300 dark:border-neutral-700 my-2" />
      <div className="flex flex-col gap-2">
        <button
          type="button"
          onClick={() => alert("Đăng nhập bằng Google đang được tích hợp")}
          className="w-full py-2.5 px-4 bg-transparent border-2 border-neutral-800 dark:border-neutral-200 hover:bg-neutral-100 dark:hover:bg-neutral-800 rounded-2xl text-xs sm:text-sm font-semibold text-neutral-800 dark:text-neutral-200 flex items-center justify-center gap-2.5 transition-all cursor-pointer"
        >
          <svg className="w-4 h-4" viewBox="0 0 24 24">
            <path fill="#4285F4" d="M23.745 12.27c0-.7-.06-1.4-.19-2.07H12v4.51h6.6c-.29 1.52-1.14 2.82-2.4 3.68v3.05h3.88c2.27-2.09 3.665-5.17 3.665-9.17z" />
            <path fill="#34A853" d="M12 24c3.24 0 5.95-1.08 7.93-2.91l-3.88-3.05c-1.08.72-2.45 1.16-4.05 1.16-3.12 0-5.77-2.1-6.72-4.93H1.25v3.15C3.26 21.36 7.33 24 12 24z" />
            <path fill="#FBBC05" d="M5.28 14.27c-.25-.72-.38-1.49-.38-2.27s.13-1.55.38-2.27V6.58H1.25C.45 8.18 0 9.99 0 12s.45 3.82 1.25 5.42l4.03-3.15z" />
            <path fill="#EA4335" d="M12 4.75c1.77 0 3.35.61 4.6 1.8l3.42-3.42C17.95 1.19 15.24 0 12 0 7.33 0 3.26 2.64 1.25 6.58l4.03 3.15c.95-2.83 3.6-4.98 6.72-4.98z" />
          </svg>
          <span>Continue with Google</span>
        </button>
      </div>

      <div className="mt-2 text-center text-xs text-neutral-600 dark:text-neutral-400">
        Chưa có tài khoản?{" "}
        <button
          type="button"
          onClick={() => onSwitchMode("signup")}
          className="font-bold text-neutral-900 dark:text-white hover:underline cursor-pointer ml-1"
        >
          Đăng ký (Sign Up)
        </button>
      </div>
    </form>
  );
}
