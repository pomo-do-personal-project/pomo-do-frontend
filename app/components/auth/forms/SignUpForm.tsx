"use client";

import React, { useState } from "react";
import { User as UserIcon, Mail, Lock, Eye, EyeOff } from "lucide-react";
import { useAuthStore } from "../../../stores/useAuthStore";
import { ApiError } from "../../../lib/apiClient";
import { UserDto } from "../../../types/api";
import { GoogleAuthButton } from "../GoogleAuthButton";

interface SignUpFormProps {
  initialEmail?: string;
  onOtpRequested: (email: string, displayName: string, password: string) => void;
  onSwitchMode: (mode: "signin") => void;
  onSuccess?: (user: UserDto) => void;
  setError: (msg: string | null) => void;
  setSuccess: (msg: string | null) => void;
}

export function SignUpForm({
  initialEmail = "",
  onOtpRequested,
  onSwitchMode,
  onSuccess,
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
    } catch (err: unknown) {
      if (err instanceof ApiError) {
        setError(err.message + (err.errors?.length ? `: ${err.errors.join(", ")}` : ""));
      } else {
        setError((err instanceof Error ? err.message : String(err)) || "Không thể gửi mã OTP. Vui lòng kiểm tra lại email.");
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
          placeholder="Tên hiển thị"
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
        <GoogleAuthButton
          text="continue_with"
          onSuccess={onSuccess}
          setError={setError}
          setSuccess={setSuccess}
        />
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
