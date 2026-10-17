"use client";

import React, { Suspense, useState } from "react";
import { useSearchParams } from "next/navigation";
import Link from "next/link";
import { authService } from "../../services/authService";
import { ApiError } from "../../lib/apiClient";
import { Logo } from "../../components/Logo";
import {
  Lock,
  Eye,
  EyeOff,
  CheckCircle2,
  ArrowRight,
  ShieldCheck,
  AlertCircle,
} from "lucide-react";

function ResetPasswordForm() {
  const searchParams = useSearchParams();

  const email = searchParams.get("email") || "";
  const token = searchParams.get("token") || "";

  const [newPassword, setNewPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const [showPassword, setShowPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);

  const [isLoading, setIsLoading] = useState(false);
  const [errorMsg, setErrorMsg] = useState<string | null>(null);
  const [isSuccess, setIsSuccess] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setErrorMsg(null);

    const trimmedEmail = email.trim();
    const trimmedToken = token.trim();

    if (!trimmedEmail || !trimmedToken) {
      setErrorMsg("Liên kết đặt lại mật khẩu không hợp lệ hoặc thiếu mã xác thực. Vui lòng mở lại liên kết từ email.");
      return;
    }
    if (newPassword.length < 8) {
      setErrorMsg("Mật khẩu mới phải có ít nhất 8 ký tự.");
      return;
    }
    if (newPassword !== confirmPassword) {
      setErrorMsg("Mật khẩu xác nhận không trùng khớp.");
      return;
    }

    setIsLoading(true);
    try {
      await authService.resetPassword({
        email: trimmedEmail,
        token: trimmedToken,
        newPassword,
      });
      setIsSuccess(true);
    } catch (err: unknown) {
      if (err instanceof ApiError) {
        setErrorMsg(err.message + (err.errors?.length ? `: ${err.errors.join(", ")}` : ""));
      } else {
        const fallback = err instanceof Error ? err.message : "Không thể đặt lại mật khẩu. Vui lòng thử lại.";
        setErrorMsg(fallback);
      }
    } finally {
      setIsLoading(false);
    }
  };

  if (isSuccess) {
    return (
      <div className="w-full max-w-md bg-white dark:bg-neutral-900 rounded-3xl border-2 border-neutral-900 dark:border-white shadow-2xl p-8 text-center animate-in fade-in zoom-in-95 duration-200">
        <div className="w-16 h-16 mx-auto mb-5 rounded-2xl bg-emerald-500/10 border border-emerald-500/30 flex items-center justify-center text-emerald-500">
          <CheckCircle2 size={36} strokeWidth={2} />
        </div>

        <h1 className="text-2xl font-black text-neutral-900 dark:text-white uppercase tracking-wider mb-2">
          Thành công!
        </h1>
        <p className="text-sm text-neutral-600 dark:text-neutral-400 mb-6 leading-relaxed">
          Mật khẩu tài khoản <span className="font-semibold text-neutral-900 dark:text-white">{email}</span> đã được cập nhật thành công. Bạn có thể đăng nhập ngay với mật khẩu mới.
        </p>

        <Link
          href="/"
          className="w-full py-3.5 px-6 bg-neutral-900 hover:bg-neutral-800 dark:bg-white dark:hover:bg-neutral-100 text-white dark:text-neutral-900 rounded-2xl text-sm font-bold shadow-md flex items-center justify-center gap-2 transition-all cursor-pointer"
        >
          <span>Về trang chủ và Đăng nhập</span>
          <ArrowRight size={16} strokeWidth={2} />
        </Link>
      </div>
    );
  }

  return (
    <div className="w-full max-w-md bg-white dark:bg-neutral-900 rounded-3xl border-2 border-neutral-900 dark:border-white shadow-2xl p-7 sm:p-8 transition-all animate-in fade-in duration-200">
      {/* Brand Header */}
      <div className="text-center mb-6 flex flex-col items-center">
        <Logo size={48} direction="vertical" asLink className="mb-4" textClassName="text-2xl font-black" />
        <h1 className="text-2xl sm:text-3xl font-extrabold text-neutral-900 dark:text-white tracking-tight uppercase">
          Đặt lại mật khẩu
        </h1>
        {email ? (
          <div className="mt-2 text-xs text-neutral-600 dark:text-neutral-400 leading-relaxed text-center">
            <span>Thiết lập mật khẩu mới cho tài khoản:</span>
            <div className="font-bold text-neutral-900 dark:text-white break-all mt-0.5">
              {email}
            </div>
          </div>
        ) : (
          <p className="text-xs text-neutral-500 dark:text-neutral-400 mt-1">
            Thiết lập mật khẩu bảo mật mới cho tài khoản của bạn
          </p>
        )}
      </div>

      {/* Warning if no token / email in URL */}
      {(!token || !email) && (
        <div className="mb-4 p-3 rounded-2xl bg-amber-500/10 border border-amber-500/30 text-amber-700 dark:text-amber-400 text-xs font-semibold text-center flex items-center justify-center gap-1.5 animate-in fade-in">
          <AlertCircle size={15} strokeWidth={2} className="shrink-0" />
          <span>Liên kết thiếu email hoặc mã xác thực. Vui lòng mở lại từ liên kết trong email.</span>
        </div>
      )}

      {/* Error alert */}
      {errorMsg && (
        <div className="mb-4 p-3 rounded-2xl bg-rose-500/10 border border-rose-500/30 text-rose-600 dark:text-rose-400 text-xs font-semibold text-center flex items-center justify-center gap-1.5 animate-in fade-in">
          <AlertCircle size={15} strokeWidth={2} className="shrink-0" />
          <span>{errorMsg}</span>
        </div>
      )}

      {/* Form */}
      <form onSubmit={handleSubmit} className="flex flex-col gap-4">
        {/* New Password */}
        <div className="flex flex-col gap-1.5">
          <label className="text-xs font-bold text-neutral-700 dark:text-neutral-300">
            Mật khẩu mới (tối thiểu 8 ký tự)
          </label>
          <div className="relative">
            <div className="absolute inset-y-0 left-0 pl-3.5 flex items-center pointer-events-none text-neutral-400">
              <Lock size={16} strokeWidth={1.75} />
            </div>
            <input
              type={showPassword ? "text" : "password"}
              required
              value={newPassword}
              onChange={(e) => setNewPassword(e.target.value)}
              placeholder="••••••••"
              className="w-full pl-10 pr-10 py-2.5 bg-neutral-50 dark:bg-neutral-800/60 border border-neutral-300 dark:border-neutral-700 rounded-xl text-sm font-medium text-neutral-900 dark:text-white placeholder:text-neutral-400 focus:outline-none focus:ring-2 focus:ring-neutral-900 dark:focus:ring-white transition-all"
            />
            <button
              type="button"
              onClick={() => setShowPassword(!showPassword)}
              className="absolute inset-y-0 right-0 pr-3.5 flex items-center text-neutral-400 hover:text-neutral-700 dark:hover:text-neutral-200 cursor-pointer"
            >
              {showPassword ? <EyeOff size={16} strokeWidth={1.75} /> : <Eye size={16} strokeWidth={1.75} />}
            </button>
          </div>
        </div>

        {/* Confirm Password */}
        <div className="flex flex-col gap-1.5">
          <label className="text-xs font-bold text-neutral-700 dark:text-neutral-300">
            Xác nhận mật khẩu mới
          </label>
          <div className="relative">
            <div className="absolute inset-y-0 left-0 pl-3.5 flex items-center pointer-events-none text-neutral-400">
              <Lock size={16} strokeWidth={1.75} />
            </div>
            <input
              type={showConfirmPassword ? "text" : "password"}
              required
              value={confirmPassword}
              onChange={(e) => setConfirmPassword(e.target.value)}
              placeholder="••••••••"
              className="w-full pl-10 pr-10 py-2.5 bg-neutral-50 dark:bg-neutral-800/60 border border-neutral-300 dark:border-neutral-700 rounded-xl text-sm font-medium text-neutral-900 dark:text-white placeholder:text-neutral-400 focus:outline-none focus:ring-2 focus:ring-neutral-900 dark:focus:ring-white transition-all"
            />
            <button
              type="button"
              onClick={() => setShowConfirmPassword(!showConfirmPassword)}
              className="absolute inset-y-0 right-0 pr-3.5 flex items-center text-neutral-400 hover:text-neutral-700 dark:hover:text-neutral-200 cursor-pointer"
            >
              {showConfirmPassword ? <EyeOff size={16} strokeWidth={1.75} /> : <Eye size={16} strokeWidth={1.75} />}
            </button>
          </div>
        </div>

        {/* Submit */}
        <button
          type="submit"
          disabled={isLoading}
          className="w-full py-3 mt-2 bg-neutral-900 hover:bg-neutral-800 dark:bg-white dark:hover:bg-neutral-100 text-white dark:text-neutral-900 rounded-2xl text-sm font-bold shadow-md transition-all cursor-pointer disabled:opacity-60 disabled:cursor-not-allowed flex items-center justify-center gap-2"
        >
          {isLoading ? (
            <span className="inline-block w-4 h-4 border-2 border-current border-t-transparent rounded-full animate-spin" />
          ) : (
            <ShieldCheck size={16} strokeWidth={2} />
          )}
          <span>{isLoading ? "Đang xử lý..." : "Cập nhật mật khẩu"}</span>
        </button>

        {/* Back Link */}
        <div className="text-center mt-2">
          <Link
            href="/"
            className="text-xs font-semibold text-neutral-500 hover:text-neutral-900 dark:hover:text-white hover:underline transition-colors"
          >
            Quay về trang chủ
          </Link>
        </div>
      </form>
    </div>
  );
}

export default function ResetPasswordPage() {
  return (
    <main className="min-h-screen bg-neutral-50 dark:bg-neutral-950 flex items-center justify-center p-4">
      <Suspense
        fallback={
          <div className="w-full max-w-md bg-white dark:bg-neutral-900 rounded-3xl border border-neutral-200 dark:border-neutral-800 p-8 text-center">
            <span className="inline-block w-6 h-6 border-2 border-rose-500 border-t-transparent rounded-full animate-spin mb-3" />
            <p className="text-sm text-neutral-500">Đang tải...</p>
          </div>
        }
      >
        <ResetPasswordForm />
      </Suspense>
    </main>
  );
}
