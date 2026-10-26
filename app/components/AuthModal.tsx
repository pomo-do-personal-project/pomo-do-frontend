"use client";

import React, { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import { useTranslation } from "../stores/useLanguageStore";
import { Logo } from "./Logo";
import { X, ArrowLeft, CheckCircle2 } from "lucide-react";
import { SignInForm } from "./auth/forms/SignInForm";
import { SignUpForm } from "./auth/forms/SignUpForm";
import { OtpVerifyForm } from "./auth/forms/OtpVerifyForm";
import { ForgotPasswordForm } from "./auth/forms/ForgotPasswordForm";
import { ResetPasswordForm } from "./auth/forms/ResetPasswordForm";
import { UserDto } from "../types/api";

type AuthMode = "signup" | "otp-verify" | "signin" | "forgot" | "reset";

interface AuthModalProps {
  isOpen: boolean;
  onClose: () => void;
  initialMode?: AuthMode;
  onAuthSuccess?: (user: UserDto) => void;
  initialEmail?: string;
}

export function AuthModal({
  isOpen, onClose, initialMode = "signup", onAuthSuccess, initialEmail,
}: AuthModalProps) {
  const router = useRouter();
  const { language } = useTranslation();
  const [authMode, setAuthMode] = useState<AuthMode>(initialMode);
  const [email, setEmail] = useState(initialEmail || "");
  const [pendingSignup, setPendingSignup] = useState({ email: initialEmail || "", displayName: "", password: "" });
  const [errorMsg, setErrorMsg] = useState<string | null>(null);
  const [successMsg, setSuccessMsg] = useState<string | null>(null);

  const switchMode = (mode: AuthMode) => {
    setAuthMode(mode);
    setErrorMsg(null);
    setSuccessMsg(null);
  };

  useEffect(() => {
    if (isOpen) {
      setAuthMode(initialMode);
      setErrorMsg(null);
      setSuccessMsg(null);
      if (initialEmail) setEmail(initialEmail);
    }
  }, [isOpen, initialMode, initialEmail]);

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-neutral-950/60 backdrop-blur-sm animate-in fade-in duration-200">
      <div className="absolute inset-0" onClick={onClose} />

      <div
        role="dialog"
        aria-modal="true"
        aria-labelledby="auth-modal-title"
        className="relative z-10 w-full max-w-sm sm:max-w-md bg-white dark:bg-neutral-900 rounded-3xl border-2 border-neutral-900 dark:border-white shadow-2xl p-6 sm:p-8 flex flex-col transition-all max-h-[92vh] overflow-y-auto"
      >
        <h2 id="auth-modal-title" className="sr-only">Xác thực tài khoản Pomo-Do</h2>
        {/* Close Button */}
        <button
          onClick={onClose}
          aria-label="Đóng cửa sổ"
          className="absolute top-5 right-5 w-8 h-8 rounded-full flex items-center justify-center text-neutral-400 hover:text-neutral-900 dark:hover:text-white hover:bg-neutral-100 dark:hover:bg-neutral-800 transition-colors cursor-pointer"
        >
          <X size={18} strokeWidth={1.75} />
        </button>

        {/* Back Button for OTP Step */}
        {authMode === "otp-verify" && (
          <button
            type="button"
            onClick={() => {
              setAuthMode("signup");
              setErrorMsg(null);
              setSuccessMsg(null);
            }}
            className="absolute top-5 left-5 flex items-center gap-1.5 text-xs font-semibold text-neutral-500 hover:text-neutral-900 dark:hover:text-white transition-colors cursor-pointer"
          >
            <ArrowLeft size={16} strokeWidth={2} />
            <span>Sửa thông tin</span>
          </button>
        )}

        {/* Back Button for Forgot & Reset */}
        {(authMode === "forgot" || authMode === "reset") && (
          <button
            type="button"
            onClick={() => {
              setAuthMode("signin");
              setErrorMsg(null);
              setSuccessMsg(null);
            }}
            className="absolute top-5 left-5 flex items-center gap-1.5 text-xs font-semibold text-neutral-500 hover:text-neutral-900 dark:hover:text-white transition-colors cursor-pointer"
          >
            <ArrowLeft size={16} strokeWidth={2} />
            <span>Đăng nhập</span>
          </button>
        )}

        {/* Title & Subtitle */}
        <div className="text-center mb-5 mt-1 flex flex-col items-center">
          <Logo size={44} direction="vertical" className="mb-3" textClassName="text-xl font-black" />
          <h2 className="text-2xl sm:text-3xl font-extrabold text-neutral-900 dark:text-white tracking-tight uppercase">
            {authMode === "signup" && "Đăng ký"}
            {authMode === "otp-verify" && "Xác thực Email"}
            {authMode === "signin" && "Đăng nhập"}
            {authMode === "forgot" && "Quên mật khẩu"}
            {authMode === "reset" && "Đặt lại mật khẩu"}
          </h2>

          {authMode === "otp-verify" && (
            <div className="mt-2 text-xs text-neutral-600 dark:text-neutral-400 leading-relaxed">
              <span>Mã xác thực gồm 6 chữ số đã được gửi đến:</span>
              <div className="font-bold text-neutral-900 dark:text-white break-all mt-0.5">
                {pendingSignup.email || email}
              </div>
            </div>
          )}

          {authMode === "forgot" && (
            <p className="text-xs text-neutral-500 dark:text-neutral-400 mt-1.5">
              Nhập email để nhận liên kết xác nhận đặt lại mật khẩu an toàn
            </p>
          )}

          {authMode === "reset" && (
            <p className="text-xs text-neutral-500 dark:text-neutral-400 mt-1.5">
              Nhập mã token từ email và tạo mật khẩu mới cho tài khoản
            </p>
          )}
        </div>

        {/* Error Alert */}
        {errorMsg && (
          <div className="mb-4 p-3 rounded-2xl bg-rose-500/10 border border-rose-500/30 text-rose-600 dark:text-rose-400 text-xs font-semibold text-center animate-in fade-in">
            {errorMsg}
          </div>
        )}

        {/* Success Alert */}
        {successMsg && (
          <div className="mb-4 p-3 rounded-2xl bg-emerald-500/10 border border-emerald-500/30 text-emerald-600 dark:text-emerald-400 text-xs font-semibold text-center animate-in fade-in flex items-center justify-center gap-1.5">
            <CheckCircle2 size={16} strokeWidth={2} className="shrink-0" />
            <span>{successMsg}</span>
          </div>
        )}

        {/* Form Components */}
        {authMode === "signup" && (
          <SignUpForm
            initialEmail={email}
            onOtpRequested={(em, disp, pwd) => {
              setPendingSignup({ email: em, displayName: disp, password: pwd });
              setEmail(em);
              setAuthMode("otp-verify");
            }}
            onSwitchMode={(mode) => {
              setAuthMode(mode);
              setErrorMsg(null);
              setSuccessMsg(null);
            }}
            onSuccess={(currUser) => {
              if (onAuthSuccess) onAuthSuccess(currUser);
              if (currUser?.isAdmin) {
                router.push(`/${language}/admin/users`);
                onClose();
                return;
              }
              setTimeout(() => onClose(), 1000);
            }}
            setError={setErrorMsg}
            setSuccess={setSuccessMsg}
          />
        )}

        {authMode === "otp-verify" && (
          <OtpVerifyForm
            email={pendingSignup.email || email}
            displayName={pendingSignup.displayName}
            password={pendingSignup.password}
            onSuccess={() => switchMode("signin")}
            onEditInfo={() => switchMode("signup")}
            setError={setErrorMsg}
            setSuccess={setSuccessMsg}
          />
        )}

        {authMode === "signin" && (
          <SignInForm
            initialEmail={email}
            onSuccess={(currUser) => {
              if (onAuthSuccess) onAuthSuccess(currUser);
              if (currUser?.isAdmin) {
                router.push(`/${language}/admin/users`);
                onClose();
                return;
              }
              setTimeout(() => onClose(), 1000);
            }}
            onSwitchMode={switchMode}
            setError={setErrorMsg}
            setSuccess={setSuccessMsg}
          />
        )}

        {authMode === "forgot" && (
          <ForgotPasswordForm
            initialEmail={email}
            onSwitchMode={switchMode}
            setError={setErrorMsg}
            setSuccess={setSuccessMsg}
          />
        )}

        {authMode === "reset" && (
          <ResetPasswordForm
            initialEmail={email}
            onSuccess={() => switchMode("signin")}
            setError={setErrorMsg}
            setSuccess={setSuccessMsg}
          />
        )}
      </div>
    </div>
  );
}
