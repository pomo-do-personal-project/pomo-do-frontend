"use client";

import React, { useState } from "react";
import { Mail, Lock, Eye, EyeOff } from "lucide-react";
import { useAuthStore } from "../../../stores/useAuthStore";
import { ApiError } from "../../../lib/apiClient";
import { UserDto } from "../../../types/api";
import { GoogleAuthButton } from "../GoogleAuthButton";

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
    } catch (err: unknown) {
      if (err instanceof ApiError) {
        setError(err.message + (err.errors?.length ? `: ${err.errors.join(", ")}` : ""));
      } else {
        setError((err instanceof Error ? err.message : String(err)) || "Đăng nhập thất bại. Vui lòng kiểm tra lại tài khoản.");
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
          aria-label={showPassword ? "Ẩn mật khẩu" : "Hiện mật khẩu"}
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
          <span>Đăng nhập</span>
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
        <GoogleAuthButton
          text="continue_with"
          onSuccess={onSuccess}
          setError={setError}
          setSuccess={setSuccess}
        />
      </div>

      <div className="mt-2 text-center text-xs text-neutral-600 dark:text-neutral-400">
        Chưa có tài khoản?{" "}
        <button
          type="button"
          onClick={() => onSwitchMode("signup")}
          className="font-bold text-neutral-900 dark:text-white hover:underline cursor-pointer ml-1"
        >
          Đăng ký ngay
        </button>
      </div>
    </form>
  );
}
