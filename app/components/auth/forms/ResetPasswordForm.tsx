"use client";

import React, { useState, useEffect } from "react";
import { Mail, KeyRound, Lock, Eye, EyeOff, ShieldCheck } from "lucide-react";
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

  // Tự động đọc email & token từ query string nếu người dùng mở modal từ link
  useEffect(() => {
    if (typeof window !== "undefined") {
      const params = new URLSearchParams(window.location.search);
      const urlEmail = params.get("email");
      const urlToken = params.get("token");
      if (urlEmail) setEmail((prev) => prev || urlEmail);
      if (urlToken) setResetToken((prev) => prev || urlToken);
    }
  }, []);

  // Đánh giá độ mạnh mật khẩu
  const getPasswordStrength = (pwd: string) => {
    if (!pwd) return { label: "", color: "", width: "0%" };
    let score = 0;
    if (pwd.length >= 8) score++;
    if (/[A-Z]/.test(pwd)) score++;
    if (/[0-9]/.test(pwd)) score++;
    if (/[^A-Za-z0-9]/.test(pwd)) score++;

    if (score <= 1) return { label: "Yếu", color: "bg-rose-500", width: "25%" };
    if (score === 2) return { label: "Trung bình", color: "bg-amber-500", width: "50%" };
    if (score === 3) return { label: "Khá mạnh", color: "bg-blue-500", width: "75%" };
    return { label: "Rất mạnh", color: "bg-emerald-500", width: "100%" };
  };

  const strength = getPasswordStrength(password);

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
    } catch (err: unknown) {
      if (err instanceof ApiError) {
        setError(err.message + (err.errors?.length ? `: ${err.errors.join(", ")}` : ""));
      } else {
        setError((err instanceof Error ? err.message : String(err)) || "Không thể đặt lại mật khẩu.");
      }
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <form onSubmit={handleSubmit} className="flex flex-col gap-3.5 text-left">
      {/* 1. Email */}
      <div className="flex flex-col gap-1">
        <label htmlFor="reset-email" className="text-xs font-bold text-neutral-700 dark:text-neutral-300">
          Email tài khoản
        </label>
        <div className="relative">
          <div className="absolute inset-y-0 left-0 pl-3.5 flex items-center pointer-events-none text-neutral-400">
            <Mail size={16} strokeWidth={1.75} />
          </div>
          <input
            id="reset-email"
            type="email"
            autoComplete="email"
            required
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            placeholder="nhap.email@domain.com"
            className="w-full pl-10 pr-4 py-2.5 bg-transparent border-2 border-neutral-800 dark:border-neutral-200 rounded-2xl text-xs sm:text-sm font-medium text-neutral-900 dark:text-white placeholder:text-neutral-400 focus:outline-none focus:ring-2 focus:ring-neutral-900 dark:focus:ring-white transition-all"
          />
        </div>
      </div>

      {/* 2. Reset Token */}
      <div className="flex flex-col gap-1">
        <label htmlFor="reset-token" className="text-xs font-bold text-neutral-700 dark:text-neutral-300 flex items-center justify-between">
          <span>Mã Token xác nhận</span>
          <span className="text-[10px] text-neutral-400 font-normal">Trích xuất từ email</span>
        </label>
        <div className="relative">
          <div className="absolute inset-y-0 left-0 pl-3.5 flex items-center pointer-events-none text-neutral-400">
            <KeyRound size={16} strokeWidth={1.75} />
          </div>
          <input
            id="reset-token"
            type="text"
            required
            value={resetToken}
            onChange={(e) => setResetToken(e.target.value)}
            placeholder="Mã token 64 ký tự từ email..."
            className="w-full pl-10 pr-4 py-2.5 bg-transparent border-2 border-neutral-800 dark:border-neutral-200 rounded-2xl text-xs font-mono text-neutral-900 dark:text-white placeholder:font-sans placeholder:text-neutral-400 focus:outline-none focus:ring-2 focus:ring-neutral-900 dark:focus:ring-white transition-all"
          />
        </div>
      </div>

      {/* 3. Password */}
      <div className="flex flex-col gap-1">
        <label htmlFor="reset-password" className="text-xs font-bold text-neutral-700 dark:text-neutral-300">
          Mật khẩu mới (tối thiểu 8 ký tự)
        </label>
        <div className="relative">
          <div className="absolute inset-y-0 left-0 pl-3.5 flex items-center pointer-events-none text-neutral-400">
            <Lock size={16} strokeWidth={1.75} />
          </div>
          <input
            id="reset-password"
            type={showPassword ? "text" : "password"}
            autoComplete="new-password"
            required
            value={password}
            onChange={(e) => setPassword(e.target.value)}
            placeholder="••••••••"
            className="w-full pl-10 pr-10 py-2.5 bg-transparent border-2 border-neutral-800 dark:border-neutral-200 rounded-2xl text-xs sm:text-sm font-medium text-neutral-900 dark:text-white placeholder:text-neutral-400 focus:outline-none focus:ring-2 focus:ring-neutral-900 dark:focus:ring-white transition-all"
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

        {/* Password Strength Indicator */}
        {password && (
          <div className="mt-1 flex items-center gap-2">
            <div className="flex-1 h-1 bg-neutral-200 dark:bg-neutral-800 rounded-full overflow-hidden">
              <div className={`h-full transition-all duration-300 ${strength.color}`} style={{ width: strength.width }} />
            </div>
            <span className="text-[10px] font-semibold text-neutral-500 shrink-0">
              {strength.label}
            </span>
          </div>
        )}
      </div>

      {/* 4. Confirm Password */}
      <div className="flex flex-col gap-1">
        <label htmlFor="reset-confirm-password" className="text-xs font-bold text-neutral-700 dark:text-neutral-300">
          Xác nhận mật khẩu mới
        </label>
        <div className="relative">
          <div className="absolute inset-y-0 left-0 pl-3.5 flex items-center pointer-events-none text-neutral-400">
            <Lock size={16} strokeWidth={1.75} />
          </div>
          <input
            id="reset-confirm-password"
            type={showConfirmPassword ? "text" : "password"}
            autoComplete="new-password"
            required
            value={confirmPassword}
            onChange={(e) => setConfirmPassword(e.target.value)}
            placeholder="••••••••"
            className="w-full pl-10 pr-10 py-2.5 bg-transparent border-2 border-neutral-800 dark:border-neutral-200 rounded-2xl text-xs sm:text-sm font-medium text-neutral-900 dark:text-white placeholder:text-neutral-400 focus:outline-none focus:ring-2 focus:ring-neutral-900 dark:focus:ring-white transition-all"
          />
          <button
            type="button"
            onClick={() => setShowConfirmPassword(!showConfirmPassword)}
            aria-label={showConfirmPassword ? "Ẩn mật khẩu xác nhận" : "Hiện mật khẩu xác nhận"}
            className="absolute inset-y-0 right-0 pr-3.5 flex items-center text-neutral-400 hover:text-neutral-700 dark:hover:text-neutral-200 cursor-pointer"
          >
            {showConfirmPassword ? <EyeOff size={16} strokeWidth={1.75} /> : <Eye size={16} strokeWidth={1.75} />}
          </button>
        </div>
      </div>

      {/* 5. Submit Button */}
      <button
        type="submit"
        disabled={isSubmitting}
        className="w-full py-3 mt-1.5 bg-white hover:bg-neutral-100 dark:bg-neutral-800 dark:hover:bg-neutral-700 text-neutral-900 dark:text-white border-2 border-neutral-800 dark:border-neutral-200 rounded-2xl text-xs sm:text-sm font-bold shadow-xs active:scale-[0.98] transition-all cursor-pointer disabled:opacity-60 disabled:cursor-not-allowed flex items-center justify-center gap-2"
      >
        {isSubmitting ? (
          <>
            <span className="inline-block w-4 h-4 border-2 border-current border-t-transparent rounded-full animate-spin" />
            <span>Đang cập nhật mật khẩu...</span>
          </>
        ) : (
          <>
            <ShieldCheck size={16} strokeWidth={2} />
            <span>Cập nhật mật khẩu mới</span>
          </>
        )}
      </button>
    </form>
  );
}
