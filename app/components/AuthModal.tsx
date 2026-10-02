"use client";

import React, { useState } from "react";
import { useAuthStore } from "../stores/useAuthStore";
import { ApiError } from "../lib/apiClient";

interface AuthModalProps {
  isOpen: boolean;
  onClose: () => void;
  initialMode?: "signup" | "signin";
  onAuthSuccess?: (user: any) => void;
}

export function AuthModal({ isOpen, onClose, initialMode = "signup", onAuthSuccess }: AuthModalProps) {
  const [authMode, setAuthMode] = useState<"signup" | "signin">(initialMode);
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [displayName, setDisplayName] = useState("");
  const [errorMsg, setErrorMsg] = useState<string | null>(null);
  const [successMsg, setSuccessMsg] = useState<string | null>(null);

  // Zustand auth actions & state
  const { login, register, isLoading } = useAuthStore();

  // Sync mode whenever modal is opened
  React.useEffect(() => {
    if (isOpen) {
      setAuthMode(initialMode);
      setErrorMsg(null);
      setSuccessMsg(null);
    }
  }, [isOpen, initialMode]);

  if (!isOpen) return null;

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setErrorMsg(null);
    setSuccessMsg(null);

    try {
      if (authMode === "signup") {
        await register({
          email,
          password,
          displayName: displayName.trim() || email.split("@")[0],
        });
        setSuccessMsg("Đăng ký tài khoản thành công! Đang chuyển...");
        const currentUser = useAuthStore.getState().user;
        if (onAuthSuccess && currentUser) {
          onAuthSuccess(currentUser);
        }
        setTimeout(() => {
          onClose();
        }, 1200);
      } else {
        await login({
          email,
          password,
        });
        setSuccessMsg("Đăng nhập thành công! Đang chuyển...");
        const currentUser = useAuthStore.getState().user;
        if (onAuthSuccess && currentUser) {
          onAuthSuccess(currentUser);
        }
        setTimeout(() => {
          onClose();
        }, 1200);
      }
    } catch (err: any) {
      if (err instanceof ApiError) {
        setErrorMsg(err.message + (err.errors?.length ? `: ${err.errors.join(", ")}` : ""));
      } else {
        setErrorMsg(err?.message || "Đã xảy ra lỗi không xác định");
      }
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-neutral-950/60 backdrop-blur-sm animate-in fade-in duration-200">
      {/* Click outside backdrop to close */}
      <div className="absolute inset-0" onClick={onClose} />

      {/* Modal Card */}
      <div className="relative z-10 w-full max-w-sm bg-white dark:bg-neutral-900 rounded-3xl border-2 border-neutral-900 dark:border-white shadow-2xl p-7 md:p-8 flex flex-col transition-all">
        {/* Close Button Top Right */}
        <button
          onClick={onClose}
          className="absolute top-5 right-5 w-8 h-8 rounded-full flex items-center justify-center text-neutral-400 hover:text-neutral-900 dark:hover:text-white hover:bg-neutral-100 dark:hover:bg-neutral-800 transition-colors cursor-pointer"
        >
          ✕
        </button>

        {/* Title */}
        <h2 className="text-2xl md:text-3xl font-black text-center text-neutral-900 dark:text-white uppercase tracking-wider mb-5">
          {authMode === "signup" ? "Sign Up" : "Sign In"}
        </h2>

        {/* Error Alert */}
        {errorMsg && (
          <div className="mb-4 p-3 rounded-2xl bg-red-500/10 border border-red-500/30 text-red-600 dark:text-red-400 text-xs font-semibold text-center animate-in fade-in">
            {errorMsg}
          </div>
        )}

        {/* Success Alert */}
        {successMsg && (
          <div className="mb-4 p-3 rounded-2xl bg-emerald-500/10 border border-emerald-500/30 text-emerald-600 dark:text-emerald-400 text-xs font-semibold text-center animate-in fade-in">
            {successMsg}
          </div>
        )}

        {/* Main Auth Form */}
        <form onSubmit={handleSubmit} className="flex flex-col gap-3">
          {/* Display Name (Only in Sign Up) */}
          {authMode === "signup" && (
            <div className="flex flex-col">
              <input
                type="text"
                value={displayName}
                onChange={(e) => setDisplayName(e.target.value)}
                placeholder="Display Name (vd: Minh Ngo)"
                className="w-full px-4 py-3 bg-transparent border-2 border-neutral-800 dark:border-neutral-200 rounded-2xl text-sm font-medium text-neutral-900 dark:text-white placeholder:text-neutral-400 focus:outline-none focus:ring-2 focus:ring-neutral-900 dark:focus:ring-white transition-all"
              />
            </div>
          )}

          {/* Email input */}
          <div className="flex flex-col">
            <input
              type="email"
              required
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              placeholder="Email"
              className="w-full px-4 py-3 bg-transparent border-2 border-neutral-800 dark:border-neutral-200 rounded-2xl text-sm font-medium text-neutral-900 dark:text-white placeholder:text-neutral-400 focus:outline-none focus:ring-2 focus:ring-neutral-900 dark:focus:ring-white transition-all"
            />
          </div>

          {/* Password input */}
          <div className="flex flex-col">
            <input
              type="password"
              required
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              placeholder="Password (tối thiểu 6 ký tự)"
              className="w-full px-4 py-3 bg-transparent border-2 border-neutral-800 dark:border-neutral-200 rounded-2xl text-sm font-medium text-neutral-900 dark:text-white placeholder:text-neutral-400 focus:outline-none focus:ring-2 focus:ring-neutral-900 dark:focus:ring-white transition-all"
            />
          </div>

          {/* Submit Button */}
          <button
            type="submit"
            disabled={isLoading}
            className="w-full py-3 mt-1 bg-white hover:bg-neutral-100 dark:bg-neutral-800 dark:hover:bg-neutral-700 text-neutral-900 dark:text-white border-2 border-neutral-800 dark:border-neutral-200 rounded-2xl text-sm font-bold shadow-xs active:scale-[0.98] transition-all cursor-pointer disabled:opacity-60 disabled:cursor-not-allowed flex items-center justify-center gap-2"
          >
            {isLoading ? (
              <span className="inline-block w-4 h-4 border-2 border-current border-t-transparent rounded-full animate-spin" />
            ) : null}
            <span>{authMode === "signup" ? (isLoading ? "Signing up..." : "Sign up") : (isLoading ? "Signing in..." : "Sign in")}</span>
          </button>

          {/* Forgot Password link (Shown on Sign Up / Sign In) */}
          <div className="text-center py-1">
            <button
              type="button"
              onClick={() => alert("Chức năng khôi phục mật khẩu đang được phát triển")}
              className="text-xs font-medium text-neutral-600 dark:text-neutral-400 hover:text-neutral-900 dark:hover:text-white cursor-pointer hover:underline transition-colors"
            >
              Forgot password
            </button>
          </div>
        </form>

        {/* Horizontal Divider */}
        <div className="w-full border-t border-neutral-300 dark:border-neutral-700 my-4" />

        {/* Social Logins */}
        <div className="flex flex-col gap-2.5">
          {/* Continue with Google */}
          <button
            type="button"
            onClick={() => alert("Đăng nhập bằng Google")}
            className="w-full py-2.5 px-4 bg-transparent border-2 border-neutral-800 dark:border-neutral-200 hover:bg-neutral-100 dark:hover:bg-neutral-800 rounded-2xl text-xs sm:text-sm font-semibold text-neutral-800 dark:text-neutral-200 flex items-center justify-center gap-2.5 transition-all cursor-pointer"
          >
            <svg className="w-4 h-4" viewBox="0 0 24 24">
              <path
                fill="#4285F4"
                d="M23.745 12.27c0-.7-.06-1.4-.19-2.07H12v4.51h6.6c-.29 1.52-1.14 2.82-2.4 3.68v3.05h3.88c2.27-2.09 3.665-5.17 3.665-9.17z"
              />
              <path
                fill="#34A853"
                d="M12 24c3.24 0 5.95-1.08 7.93-2.91l-3.88-3.05c-1.08.72-2.45 1.16-4.05 1.16-3.12 0-5.77-2.1-6.72-4.93H1.25v3.15C3.26 21.36 7.33 24 12 24z"
              />
              <path
                fill="#FBBC05"
                d="M5.28 14.27c-.25-.72-.38-1.49-.38-2.27s.13-1.55.38-2.27V6.58H1.25C.45 8.18 0 9.99 0 12s.45 3.82 1.25 5.42l4.03-3.15z"
              />
              <path
                fill="#EA4335"
                d="M12 4.75c1.77 0 3.35.61 4.6 1.8l3.42-3.42C17.95 1.19 15.24 0 12 0 7.33 0 3.26 2.64 1.25 6.58l4.03 3.15c.95-2.83 3.6-4.98 6.72-4.98z"
              />
            </svg>
            <span>Continue with Google</span>
          </button>

          {/* Continue with Facebook */}
          <button
            type="button"
            onClick={() => alert("Đăng nhập bằng Facebook")}
            className="w-full py-2.5 px-4 bg-transparent border-2 border-neutral-800 dark:border-neutral-200 hover:bg-neutral-100 dark:hover:bg-neutral-800 rounded-2xl text-xs sm:text-sm font-semibold text-neutral-800 dark:text-neutral-200 flex items-center justify-center gap-2.5 transition-all cursor-pointer"
          >
            <svg className="w-4 h-4 fill-[#1877F2]" viewBox="0 0 24 24">
              <path d="M24 12.073c0-6.627-5.373-12-12-12s-12 5.373-12 12c0 5.99 4.388 10.954 10.125 11.854v-8.385H7.078v-3.47h3.047V9.43c0-3.007 1.792-4.669 4.533-4.669 1.312 0 2.686.235 2.686.235v2.953H15.83c-1.491 0-1.956.925-1.956 1.874v2.25h3.328l-.532 3.47h-2.796v8.385C19.612 23.027 24 18.062 24 12.073z" />
            </svg>
            <span>Continue with Facebook</span>
          </button>
        </div>

        {/* Bottom Switch Link between Sign In and Sign Up */}
        <div className="mt-5 text-center text-xs text-neutral-600 dark:text-neutral-400">
          {authMode === "signup" ? (
            <span>
              Already have an account?{" "}
              <button
                type="button"
                onClick={() => setAuthMode("signin")}
                className="font-bold text-neutral-900 dark:text-white hover:underline cursor-pointer ml-1"
              >
                Sign In
              </button>
            </span>
          ) : (
            <span>
              Don&#39;t have an account?{" "}
              <button
                type="button"
                onClick={() => setAuthMode("signup")}
                className="font-bold text-neutral-900 dark:text-white hover:underline cursor-pointer ml-1"
              >
                Sign Up
              </button>
            </span>
          )}
        </div>
      </div>
    </div>
  );
}
