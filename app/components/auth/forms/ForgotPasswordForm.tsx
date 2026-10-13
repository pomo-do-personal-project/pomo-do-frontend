"use client";

import React, { useState, useEffect } from "react";
import { Mail, Send } from "lucide-react";
import { useAuthStore } from "../../../stores/useAuthStore";
import { ApiError } from "../../../lib/apiClient";

interface ForgotPasswordFormProps {
  initialEmail?: string;
  onSwitchMode: (mode: "reset") => void;
  setError: (msg: string | null) => void;
  setSuccess: (msg: string | null) => void;
}

export function ForgotPasswordForm({
  initialEmail = "",
  onSwitchMode,
  setError,
  setSuccess,
}: ForgotPasswordFormProps) {
  const [email, setEmail] = useState(initialEmail);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [forgotCooldown, setForgotCooldown] = useState(0);

  const forgotPassword = useAuthStore((s) => s.forgotPassword);

  useEffect(() => {
    if (forgotCooldown <= 0) return;
    const timer = setInterval(() => {
      setForgotCooldown((prev) => (prev > 0 ? prev - 1 : 0));
    }, 1000);
    return () => clearInterval(timer);
  }, [forgotCooldown]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);
    setSuccess(null);

    const trimmedEmail = email.trim();
    if (!trimmedEmail) {
      setError("Vui lòng nhập địa chỉ email của bạn.");
      return;
    }

    setIsSubmitting(true);
    try {
      const msg = await forgotPassword(trimmedEmail);
      setForgotCooldown(60);
      setSuccess(
        msg || "Liên kết đặt lại mật khẩu đã được gửi đến email của bạn! Vui lòng kiểm tra hộp thư."
      );
    } catch (err: any) {
      if (err instanceof ApiError) {
        setError(err.message + (err.errors?.length ? `: ${err.errors.join(", ")}` : ""));
      } else {
        setError(err?.message || "Không thể gửi yêu cầu đặt lại mật khẩu.");
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
          placeholder="Nhập email của bạn"
          className="w-full pl-10 pr-4 py-3 bg-transparent border-2 border-neutral-800 dark:border-neutral-200 rounded-2xl text-sm font-medium text-neutral-900 dark:text-white placeholder:text-neutral-400 focus:outline-none focus:ring-2 focus:ring-neutral-900 dark:focus:ring-white transition-all"
        />
      </div>

      <button
        type="submit"
        disabled={isSubmitting || forgotCooldown > 0}
        className="w-full py-3 mt-1 bg-white hover:bg-neutral-100 dark:bg-neutral-800 dark:hover:bg-neutral-700 text-neutral-900 dark:text-white border-2 border-neutral-800 dark:border-neutral-200 rounded-2xl text-sm font-bold shadow-xs active:scale-[0.98] transition-all cursor-pointer disabled:opacity-60 disabled:cursor-not-allowed flex items-center justify-center gap-2"
      >
        {isSubmitting ? (
          <>
            <span className="inline-block w-4 h-4 border-2 border-current border-t-transparent rounded-full animate-spin" />
            <span>Đang gửi...</span>
          </>
        ) : (
          <>
            <Send size={15} strokeWidth={2} />
            <span>
              {forgotCooldown > 0 ? `Gửi lại sau (${forgotCooldown}s)` : "Gửi liên kết khôi phục"}
            </span>
          </>
        )}
      </button>

      <div className="mt-2 text-center">
        <button
          type="button"
          onClick={() => onSwitchMode("reset")}
          className="text-xs font-semibold text-rose-600 dark:text-rose-400 hover:underline cursor-pointer"
        >
          Đã có mã xác nhận / token từ email? Nhập tại đây
        </button>
      </div>
    </form>
  );
}
