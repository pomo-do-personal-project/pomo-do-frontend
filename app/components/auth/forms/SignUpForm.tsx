"use client";

import React, { useState } from "react";
import { User as UserIcon, Mail, Lock, Eye, EyeOff } from "lucide-react";
import { useAuthStore } from "../../../stores/useAuthStore";
import { ApiError } from "../../../lib/apiClient";

interface SignUpFormProps {
  initialEmail?: string;
  onOtpRequested: (email: string, displayName: string, password: string) => void;
  onSwitchMode: (mode: "signin") => void;
  setError: (msg: string | null) => void;
  setSuccess: (msg: string | null) => void;
}

export function SignUpForm({
  initialEmail = "",
  onOtpRequested,
  onSwitchMode,
  setError,
  setSuccess,
}: SignUpFormProps) {
  const [displayName, setDisplayName] = useState("");
  const [email, setEmail] = useState(initialEmail);
  const [password, setPassword] = useState("");
  const [showPassword, setShowPassword] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);

  const sendOtp = useAuthStore((s) => s.sendOtp);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);
    setSuccess(null);

    const trimmedEmail = email.trim();
    if (!trimmedEmail) {
      setError("Vui lòng nhập email hợp lệ.");
      return;
    }
    if (password.length < 8) {
      setError("Mật khẩu phải có tối thiểu 8 ký tự.");
      return;
    }

    setIsSubmitting(true);
    try {
      await sendOtp(trimmedEmail);
      setSuccess("Mã xác thực 6 số đã được gửi tới email của bạn!");
      onOtpRequested(trimmedEmail, displayName.trim(), password);
    } catch (err: any) {
      if (err instanceof ApiError) {
        setError(err.message + (err.errors?.length ? `: ${err.errors.join(", ")}` : ""));
      } else {
        setError(err?.message || "Không thể gửi mã OTP. Vui lòng kiểm tra lại email.");
      }
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <form onSubmit={handleSubmit} className="flex flex-col gap-3">
      {/* Display Name */}
      <div className="relative">
        <div className="absolute inset-y-0 left-0 pl-3.5 flex items-center pointer-events-none text-neutral-400">
          <UserIcon size={16} strokeWidth={1.75} />
        </div>
        <input
          type="text"
          value={displayName}
          onChange={(e) => setDisplayName(e.target.value)}
          placeholder="Tên hiển thị (vd: Minh Ngo)"
          className="w-full pl-10 pr-4 py-3 bg-transparent border-2 border-neutral-800 dark:border-neutral-200 rounded-2xl text-sm font-medium text-neutral-900 dark:text-white placeholder:text-neutral-400 focus:outline-none focus:ring-2 focus:ring-neutral-900 dark:focus:ring-white transition-all"
        />
      </div>

      {/* Email input */}
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

      {/* Password input */}
      <div className="relative">
        <div className="absolute inset-y-0 left-0 pl-3.5 flex items-center pointer-events-none text-neutral-400">
          <Lock size={16} strokeWidth={1.75} />
        </div>
        <input
          type={showPassword ? "text" : "password"}
          required
          value={password}
          onChange={(e) => setPassword(e.target.value)}
          placeholder="Mật khẩu (tối thiểu 8 ký tự)"
          className="w-full pl-10 pr-10 py-3 bg-transparent border-2 border-neutral-800 dark:border-neutral-200 rounded-2xl text-sm font-medium text-neutral-900 dark:text-white placeholder:text-neutral-400 focus:outline-none focus:ring-2 focus:ring-neutral-900 dark:focus:ring-white transition-all"
        />
        <button
          type="button"
          onClick={() => setShowPassword(!showPassword)}
          className="absolute inset-y-0 right-0 pr-3.5 flex items-center text-neutral-400 hover:text-neutral-700 dark:hover:text-neutral-200 cursor-pointer"
          title={showPassword ? "Ẩn mật khẩu" : "Hiện mật khẩu"}
        >
          {showPassword ? <EyeOff size={16} strokeWidth={1.75} /> : <Eye size={16} strokeWidth={1.75} />}
        </button>
      </div>

      {/* Submit Button */}
      <button
        type="submit"
        disabled={isSubmitting}
        className="w-full py-3 mt-1 bg-white hover:bg-neutral-100 dark:bg-neutral-800 dark:hover:bg-neutral-700 text-neutral-900 dark:text-white border-2 border-neutral-800 dark:border-neutral-200 rounded-2xl text-sm font-bold shadow-xs active:scale-[0.98] transition-all cursor-pointer disabled:opacity-60 disabled:cursor-not-allowed flex items-center justify-center gap-2"
      >
        {isSubmitting ? (
          <>
            <span className="inline-block w-4 h-4 border-2 border-current border-t-transparent rounded-full animate-spin" />
            <span>Đang gửi mã xác thực...</span>
          </>
        ) : (
          <span>Đăng ký tài khoản</span>
        )}
      </button>

      {/* Social Logins */}
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
          <span>Tiếp tục với Google</span>
        </button>
      </div>

      {/* Bottom Switch Link */}
      <div className="mt-2 text-center text-xs text-neutral-600 dark:text-neutral-400">
        Đã có tài khoản?{" "}
        <button
          type="button"
          onClick={() => onSwitchMode("signin")}
          className="font-bold text-neutral-900 dark:text-white hover:underline cursor-pointer ml-1"
        >
          Đăng nhập ngay
        </button>
      </div>
    </form>
  );
}
