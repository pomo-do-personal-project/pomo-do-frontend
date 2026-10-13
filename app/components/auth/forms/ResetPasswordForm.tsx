"use client";

import React, { useState } from "react";
import { Mail, KeyRound, Lock, Eye, EyeOff } from "lucide-react";
import { useAuthStore } from "../../../stores/useAuthStore";
import { ApiError } from "../../../lib/apiClient";

interface ResetPasswordFormProps {
  initialEmail?: string;
  onSuccess: () => void;
  setError: (msg: string | null) => void;
  setSuccess: (msg: string | null) => void;
}

export function ResetPasswordForm({
  initialEmail = "",
  onSuccess,
  setError,
  setSuccess,
}: ResetPasswordFormProps) {
  const [email, setEmail] = useState(initialEmail);
  const [resetToken, setResetToken] = useState("");
  const [password, setPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const [showPassword, setShowPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);

  const resetPassword = useAuthStore((s) => s.resetPassword);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);
    setSuccess(null);

    if (!resetToken.trim()) {
      setError("Vui lòng nhập mã token xác nhận từ email.");
      return;
    }
    if (password.length < 8) {
      setError("Mật khẩu mới phải có ít nhất 8 ký tự.");
      return;
    }
    if (password !== confirmPassword) {
      setError("Mật khẩu xác nhận không trùng khớp.");
      return;
    }

    setIsSubmitting(true);
    try {
      const msg = await resetPassword({
        email: email.trim(),
        token: resetToken.trim(),
        newPassword: password,
      });
      setSuccess(msg || "Đặt lại mật khẩu thành công! Đang chuyển sang đăng nhập...");
      setTimeout(() => {
        onSuccess();
      }, 1500);
    } catch (err: any) {
      if (err instanceof ApiError) {
        setError(err.message + (err.errors?.length ? `: ${err.errors.join(", ")}` : ""));
      } else {
        setError(err?.message || "Không thể đặt lại mật khẩu.");
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
          placeholder="Email tài khoản"
          className="w-full pl-10 pr-4 py-3 bg-transparent border-2 border-neutral-800 dark:border-neutral-200 rounded-2xl text-sm font-medium text-neutral-900 dark:text-white placeholder:text-neutral-400 focus:outline-none focus:ring-2 focus:ring-neutral-900 dark:focus:ring-white transition-all"
        />
      </div>

      <div className="relative">
        <div className="absolute inset-y-0 left-0 pl-3.5 flex items-center pointer-events-none text-neutral-400">
          <KeyRound size={16} strokeWidth={1.75} />
        </div>
        <input
          type="text"
          required
          value={resetToken}
          onChange={(e) => setResetToken(e.target.value)}
          placeholder="Mã token xác nhận từ email"
          className="w-full pl-10 pr-4 py-3 bg-transparent border-2 border-neutral-800 dark:border-neutral-200 rounded-2xl text-sm font-mono text-neutral-900 dark:text-white placeholder:font-sans placeholder:text-neutral-400 focus:outline-none focus:ring-2 focus:ring-neutral-900 dark:focus:ring-white transition-all"
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
          placeholder="Mật khẩu mới (tối thiểu 8 ký tự)"
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

      <div className="relative">
        <div className="absolute inset-y-0 left-0 pl-3.5 flex items-center pointer-events-none text-neutral-400">
          <Lock size={16} strokeWidth={1.75} />
        </div>
        <input
          type={showConfirmPassword ? "text" : "password"}
          required
          value={confirmPassword}
          onChange={(e) => setConfirmPassword(e.target.value)}
          placeholder="Xác nhận mật khẩu mới"
          className="w-full pl-10 pr-10 py-3 bg-transparent border-2 border-neutral-800 dark:border-neutral-200 rounded-2xl text-sm font-medium text-neutral-900 dark:text-white placeholder:text-neutral-400 focus:outline-none focus:ring-2 focus:ring-neutral-900 dark:focus:ring-white transition-all"
        />
        <button
          type="button"
          onClick={() => setShowConfirmPassword(!showConfirmPassword)}
          className="absolute inset-y-0 right-0 pr-3.5 flex items-center text-neutral-400 hover:text-neutral-700 dark:hover:text-neutral-200 cursor-pointer"
        >
          {showConfirmPassword ? <EyeOff size={16} strokeWidth={1.75} /> : <Eye size={16} strokeWidth={1.75} />}
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
            <span>Đang đặt lại mật khẩu...</span>
          </>
        ) : (
          <span>Đặt lại mật khẩu</span>
        )}
      </button>
    </form>
  );
}
