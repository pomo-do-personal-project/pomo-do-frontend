"use client";

import React, { useState, useEffect, useRef } from "react";
import { Logo } from "./Logo";
import { useAuthStore } from "../stores/useAuthStore";
import { ApiError } from "../lib/apiClient";
import {
  X,
  Mail,
  Lock,
  User as UserIcon,
  KeyRound,
  ArrowLeft,
  CheckCircle2,
  Eye,
  EyeOff,
  Send,
  RotateCcw,
  Sparkles,
} from "lucide-react";

interface AuthModalProps {
  isOpen: boolean;
  onClose: () => void;
  initialMode?: "signup" | "otp-verify" | "signin" | "forgot" | "reset";
  onAuthSuccess?: (user: any) => void;
  initialEmail?: string;
}

export function AuthModal({
  isOpen,
  onClose,
  initialMode = "signup",
  onAuthSuccess,
  initialEmail,
}: AuthModalProps) {
  const [authMode, setAuthMode] = useState<
    "signup" | "otp-verify" | "signin" | "forgot" | "reset"
  >(initialMode);

  // Form fields
  const [email, setEmail] = useState(initialEmail || "");
  const [password, setPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const [displayName, setDisplayName] = useState("");
  const [resetToken, setResetToken] = useState("");

  // 6-digit OTP slots state
  const [otpDigits, setOtpDigits] = useState<string[]>(["", "", "", "", "", ""]);
  const otpInputRefs = useRef<(HTMLInputElement | null)[]>([]);

  // Password visibility
  const [showPassword, setShowPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);

  // Cooldowns
  const [otpCooldown, setOtpCooldown] = useState(0);
  const [forgotCooldown, setForgotCooldown] = useState(0);

  // Alerts & loading
  const [errorMsg, setErrorMsg] = useState<string | null>(null);
  const [successMsg, setSuccessMsg] = useState<string | null>(null);
  const [isSubmitting, setIsSubmitting] = useState(false);

  // Zustand auth actions & state
  const { login, register, sendOtp, forgotPassword, resetPassword } = useAuthStore();

  // Reset when modal opens
  useEffect(() => {
    if (isOpen) {
      setAuthMode(initialMode);
      setErrorMsg(null);
      setSuccessMsg(null);
      setOtpDigits(["", "", "", "", "", ""]);
      setShowPassword(false);
      setShowConfirmPassword(false);
      if (initialEmail) {
        setEmail(initialEmail);
      }
    }
  }, [isOpen, initialMode, initialEmail]);

  // Focus first OTP input when entering otp-verify mode
  useEffect(() => {
    if (authMode === "otp-verify") {
      setTimeout(() => {
        otpInputRefs.current[0]?.focus();
      }, 100);
    }
  }, [authMode]);

  // OTP cooldown countdown
  useEffect(() => {
    if (otpCooldown <= 0) return;
    const timer = setInterval(() => {
      setOtpCooldown((prev) => (prev > 0 ? prev - 1 : 0));
    }, 1000);
    return () => clearInterval(timer);
  }, [otpCooldown]);

  // Forgot password cooldown countdown
  useEffect(() => {
    if (forgotCooldown <= 0) return;
    const timer = setInterval(() => {
      setForgotCooldown((prev) => (prev > 0 ? prev - 1 : 0));
    }, 1000);
    return () => clearInterval(timer);
  }, [forgotCooldown]);

  if (!isOpen) return null;

  // STEP 1: Handle Initial Sign Up Submit (Validates & Dispatches OTP, then transitions to Step 2)
  const handleInitialSignUp = async (e: React.FormEvent) => {
    e.preventDefault();
    setErrorMsg(null);
    setSuccessMsg(null);

    const trimmedEmail = email.trim();
    if (!trimmedEmail) {
      setErrorMsg("Vui lòng nhập email hợp lệ.");
      return;
    }
    if (password.length < 8) {
      setErrorMsg("Mật khẩu phải có tối thiểu 8 ký tự.");
      return;
    }

    setIsSubmitting(true);
    try {
      // Gọi API gửi mã OTP xác thực tới email
      await sendOtp(trimmedEmail);
      setOtpCooldown(60);
      setOtpDigits(["", "", "", "", "", ""]);
      setSuccessMsg("Mã xác thực 6 số đã được gửi tới email của bạn!");
      setAuthMode("otp-verify");
    } catch (err: any) {
      if (err instanceof ApiError) {
        setErrorMsg(err.message + (err.errors?.length ? `: ${err.errors.join(", ")}` : ""));
      } else {
        setErrorMsg(err?.message || "Không thể gửi mã OTP. Vui lòng kiểm tra lại email.");
      }
    } finally {
      setIsSubmitting(false);
    }
  };

  // STEP 2: Handle OTP slot changes (Auto-advance & smart backspace)
  const handleOtpChange = (index: number, val: string) => {
    const cleaned = val.replace(/\D/g, "");
    if (!cleaned) {
      const nextDigits = [...otpDigits];
      nextDigits[index] = "";
      setOtpDigits(nextDigits);
      return;
    }

    const nextDigits = [...otpDigits];
    // If pasted multiple digits into one slot
    if (cleaned.length > 1) {
      const chars = cleaned.slice(0, 6).split("");
      chars.forEach((c, i) => {
        if (index + i < 6) nextDigits[index + i] = c;
      });
      setOtpDigits(nextDigits);
      const nextFocus = Math.min(index + chars.length, 5);
      otpInputRefs.current[nextFocus]?.focus();

      // Auto submit if all 6 filled
      if (nextDigits.every((d) => d !== "")) {
        handleCompleteRegistration(nextDigits.join(""));
      }
      return;
    }

    nextDigits[index] = cleaned;
    setOtpDigits(nextDigits);

    // Jump to next input
    if (index < 5 && cleaned) {
      otpInputRefs.current[index + 1]?.focus();
    }

    // Auto submit if all 6 slots are filled
    if (index === 5 && cleaned && nextDigits.every((d) => d !== "")) {
      handleCompleteRegistration(nextDigits.join(""));
    }
  };

  const handleOtpKeyDown = (index: number, e: React.KeyboardEvent<HTMLInputElement>) => {
    if (e.key === "Backspace" && !otpDigits[index] && index > 0) {
      otpInputRefs.current[index - 1]?.focus();
    }
  };

  const handleOtpPaste = (e: React.ClipboardEvent<HTMLInputElement>) => {
    e.preventDefault();
    const pasted = e.clipboardData.getData("text").replace(/\D/g, "");
    if (!pasted) return;

    const chars = pasted.slice(0, 6).split("");
    const nextDigits = [...otpDigits];
    chars.forEach((c, i) => {
      nextDigits[i] = c;
    });
    setOtpDigits(nextDigits);

    const nextFocus = Math.min(chars.length, 5);
    otpInputRefs.current[nextFocus]?.focus();

    if (nextDigits.every((d) => d !== "")) {
      handleCompleteRegistration(nextDigits.join(""));
    }
  };

  // STEP 2: Finalize Registration with verified OTP
  const handleCompleteRegistration = async (codeToVerify?: string) => {
    const finalOtp = codeToVerify || otpDigits.join("");
    if (finalOtp.length !== 6) {
      setErrorMsg("Vui lòng nhập đủ 6 chữ số OTP.");
      return;
    }

    setErrorMsg(null);
    setSuccessMsg(null);
    setIsSubmitting(true);

    try {
      await register({
        email: email.trim(),
        password,
        displayName: displayName.trim() || email.split("@")[0],
        otpCode: finalOtp,
      });

      // Chuyển ngay sang màn hình đăng nhập (Sign In)
      setAuthMode("signin");
      setPassword("");
      setOtpDigits(["", "", "", "", "", ""]);
      setSuccessMsg("Đăng ký tài khoản thành công! Vui lòng đăng nhập bằng mật khẩu của bạn.");
    } catch (err: any) {
      if (err instanceof ApiError) {
        setErrorMsg(err.message + (err.errors?.length ? `: ${err.errors.join(", ")}` : ""));
      } else {
        setErrorMsg(err?.message || "Mã OTP không chính xác hoặc đã hết hạn.");
      }
      // Clear OTP digits and focus on first slot for re-entry
      setOtpDigits(["", "", "", "", "", ""]);
      otpInputRefs.current[0]?.focus();
    } finally {
      setIsSubmitting(false);
    }
  };

  // Resend OTP in Step 2
  const handleResendOtp = async () => {
    if (otpCooldown > 0) return;
    setErrorMsg(null);
    setSuccessMsg(null);

    try {
      await sendOtp(email.trim());
      setOtpCooldown(60);
      setSuccessMsg("Mã OTP mới đã được gửi vào email của bạn!");
      setOtpDigits(["", "", "", "", "", ""]);
      otpInputRefs.current[0]?.focus();
    } catch (err: any) {
      setErrorMsg(err?.message || "Không thể gửi lại mã OTP. Vui lòng thử lại sau.");
    }
  };

  // Handle Login Submit
  const handleLoginSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setErrorMsg(null);
    setSuccessMsg(null);

    setIsSubmitting(true);
    try {
      await login({
        email: email.trim(),
        password,
      });
      setSuccessMsg("Đăng nhập thành công! Đang vào ứng dụng...");
      const currentUser = useAuthStore.getState().user;
      if (onAuthSuccess && currentUser) {
        onAuthSuccess(currentUser);
      }
      setTimeout(() => {
        onClose();
      }, 1000);
    } catch (err: any) {
      if (err instanceof ApiError) {
        setErrorMsg(err.message + (err.errors?.length ? `: ${err.errors.join(", ")}` : ""));
      } else {
        setErrorMsg(err?.message || "Đăng nhập thất bại. Vui lòng kiểm tra lại tài khoản.");
      }
    } finally {
      setIsSubmitting(false);
    }
  };

  // Handle Forgot Password
  const handleForgotPassword = async (e: React.FormEvent) => {
    e.preventDefault();
    setErrorMsg(null);
    setSuccessMsg(null);

    const trimmedEmail = email.trim();
    if (!trimmedEmail) {
      setErrorMsg("Vui lòng nhập địa chỉ email của bạn.");
      return;
    }

    setIsSubmitting(true);
    try {
      const msg = await forgotPassword(trimmedEmail);
      setForgotCooldown(60);
      setSuccessMsg(
        msg || "Liên kết đặt lại mật khẩu đã được gửi đến email của bạn! Vui lòng kiểm tra hộp thư."
      );
    } catch (err: any) {
      if (err instanceof ApiError) {
        setErrorMsg(err.message + (err.errors?.length ? `: ${err.errors.join(", ")}` : ""));
      } else {
        setErrorMsg(err?.message || "Không thể gửi yêu cầu đặt lại mật khẩu.");
      }
    } finally {
      setIsSubmitting(false);
    }
  };

  // Handle Reset Password form submission
  const handleResetPassword = async (e: React.FormEvent) => {
    e.preventDefault();
    setErrorMsg(null);
    setSuccessMsg(null);

    if (!resetToken.trim()) {
      setErrorMsg("Vui lòng nhập mã token xác nhận từ email.");
      return;
    }
    if (password.length < 8) {
      setErrorMsg("Mật khẩu mới phải có ít nhất 8 ký tự.");
      return;
    }
    if (password !== confirmPassword) {
      setErrorMsg("Mật khẩu xác nhận không trùng khớp.");
      return;
    }

    setIsSubmitting(true);
    try {
      const msg = await resetPassword({
        email: email.trim(),
        token: resetToken.trim(),
        newPassword: password,
      });
      setSuccessMsg(msg || "Đặt lại mật khẩu thành công! Đang chuyển sang đăng nhập...");
      setPassword("");
      setConfirmPassword("");
      setResetToken("");
      setTimeout(() => {
        setAuthMode("signin");
        setSuccessMsg(null);
      }, 1500);
    } catch (err: any) {
      if (err instanceof ApiError) {
        setErrorMsg(err.message + (err.errors?.length ? `: ${err.errors.join(", ")}` : ""));
      } else {
        setErrorMsg(err?.message || "Không thể đặt lại mật khẩu.");
      }
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-neutral-950/60 backdrop-blur-sm animate-in fade-in duration-200">
      {/* Click outside backdrop to close */}
      <div className="absolute inset-0" onClick={onClose} />

      {/* Modal Card */}
      <div className="relative z-10 w-full max-w-sm sm:max-w-md bg-white dark:bg-neutral-900 rounded-3xl border-2 border-neutral-900 dark:border-white shadow-2xl p-6 sm:p-8 flex flex-col transition-all max-h-[92vh] overflow-y-auto">
        {/* Close Button Top Right */}
        <button
          onClick={onClose}
          aria-label="Đóng cửa sổ"
          className="absolute top-5 right-5 w-8 h-8 rounded-full flex items-center justify-center text-neutral-400 hover:text-neutral-900 dark:hover:text-white hover:bg-neutral-100 dark:hover:bg-neutral-800 transition-colors cursor-pointer"
        >
          <X size={18} strokeWidth={1.75} />
        </button>

        {/* Back Button for OTP Step, Forgot & Reset */}
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
          <Logo size={36} className="mb-2" textClassName="text-xl font-black" />
          <h2 className="text-2xl sm:text-3xl font-extrabold text-neutral-900 dark:text-white tracking-tight uppercase">
            {authMode === "signup" && "Sign Up"}
            {authMode === "otp-verify" && "Xác thực Email"}
            {authMode === "signin" && "Sign In"}
            {authMode === "forgot" && "Quên mật khẩu"}
            {authMode === "reset" && "Đặt lại mật khẩu"}
          </h2>

          {authMode === "otp-verify" && (
            <div className="mt-2 text-xs text-neutral-600 dark:text-neutral-400 leading-relaxed">
              <span>Mã xác thực gồm 6 chữ số đã được gửi đến:</span>
              <div className="font-bold text-neutral-900 dark:text-white break-all mt-0.5">
                {email}
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

        {/* ======================================================== */}
        {/* 1. STEP 1: FORM SIGN UP (Clean, No OTP Field) */}
        {/* ======================================================== */}
        {authMode === "signup" && (
          <form onSubmit={handleInitialSignUp} className="flex flex-col gap-3">
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
                <span>Đăng ký (Sign Up)</span>
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
                <span>Continue with Google</span>
              </button>
            </div>

            {/* Bottom Switch Link */}
            <div className="mt-2 text-center text-xs text-neutral-600 dark:text-neutral-400">
              Đã có tài khoản?{" "}
              <button
                type="button"
                onClick={() => {
                  setAuthMode("signin");
                  setErrorMsg(null);
                  setSuccessMsg(null);
                }}
                className="font-bold text-neutral-900 dark:text-white hover:underline cursor-pointer ml-1"
              >
                Đăng nhập (Sign In)
              </button>
            </div>
          </form>
        )}

        {/* ======================================================== */}
        {/* 2. STEP 2: MÀN HÌNH NHẬP MÃ OTP 6 Ô CHUYÊN BIỆT */}
        {/* ======================================================== */}
        {authMode === "otp-verify" && (
          <div className="flex flex-col gap-5 py-1">
            {/* 6 PIN Slots */}
            <div className="flex items-center justify-between gap-1.5 sm:gap-2">
              {otpDigits.map((digit, idx) => (
                <input
                  key={idx}
                  ref={(el) => {
                    otpInputRefs.current[idx] = el;
                  }}
                  type="text"
                  inputMode="numeric"
                  maxLength={1}
                  value={digit}
                  onChange={(e) => handleOtpChange(idx, e.target.value)}
                  onKeyDown={(e) => handleOtpKeyDown(idx, e)}
                  onPaste={handleOtpPaste}
                  className={`w-11 h-14 sm:w-13 sm:h-16 text-center text-xl sm:text-2xl font-mono font-bold rounded-2xl border-2 transition-all select-all ${
                    digit
                      ? "border-neutral-900 dark:border-white bg-neutral-100 dark:bg-neutral-800 text-neutral-900 dark:text-white shadow-xs"
                      : "border-neutral-300 dark:border-neutral-700 bg-neutral-50 dark:bg-neutral-800/40 text-neutral-900 dark:text-white focus:border-rose-500 dark:focus:border-rose-500 focus:bg-white dark:focus:bg-neutral-900"
                  } focus:outline-none focus:ring-2 focus:ring-rose-500/30`}
                />
              ))}
            </div>

            {/* Confirm Button */}
            <button
              type="button"
              disabled={isSubmitting || otpDigits.some((d) => !d)}
              onClick={() => handleCompleteRegistration()}
              className="w-full py-3.5 bg-neutral-900 hover:bg-neutral-800 dark:bg-white dark:hover:bg-neutral-100 text-white dark:text-neutral-900 rounded-2xl text-sm font-bold shadow-md active:scale-[0.98] transition-all cursor-pointer disabled:opacity-40 disabled:cursor-not-allowed flex items-center justify-center gap-2"
            >
              {isSubmitting ? (
                <>
                  <span className="inline-block w-4 h-4 border-2 border-current border-t-transparent rounded-full animate-spin" />
                  <span>Đang xác thực...</span>
                </>
              ) : (
                <>
                  <Sparkles size={16} strokeWidth={2} />
                  <span>Xác nhận & Hoàn tất</span>
                </>
              )}
            </button>

            {/* Resend OTP & Help */}
            <div className="flex flex-col items-center gap-2 text-xs">
              <div className="flex items-center gap-1 text-neutral-500 dark:text-neutral-400">
                <span>Chưa nhận được mã?</span>
                <button
                  type="button"
                  onClick={handleResendOtp}
                  disabled={otpCooldown > 0 || isSubmitting}
                  className="font-bold text-rose-600 dark:text-rose-400 hover:underline cursor-pointer disabled:opacity-40 disabled:cursor-not-allowed flex items-center gap-1"
                >
                  <RotateCcw size={12} strokeWidth={2} />
                  <span>
                    {otpCooldown > 0 ? `Gửi lại sau (${otpCooldown}s)` : "Gửi lại mã OTP"}
                  </span>
                </button>
              </div>

              <button
                type="button"
                onClick={() => {
                  setAuthMode("signup");
                  setErrorMsg(null);
                  setSuccessMsg(null);
                }}
                className="text-neutral-400 hover:text-neutral-800 dark:hover:text-neutral-200 hover:underline cursor-pointer transition-colors"
              >
                Nhầm email? Bấm vào đây để sửa thông tin
              </button>
            </div>
          </div>
        )}

        {/* ======================================================== */}
        {/* 3. SIGN IN FORM */}
        {/* ======================================================== */}
        {authMode === "signin" && (
          <form onSubmit={handleLoginSubmit} className="flex flex-col gap-3">
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
                onClick={() => {
                  setAuthMode("forgot");
                  setErrorMsg(null);
                  setSuccessMsg(null);
                }}
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
                onClick={() => {
                  setAuthMode("signup");
                  setErrorMsg(null);
                  setSuccessMsg(null);
                }}
                className="font-bold text-neutral-900 dark:text-white hover:underline cursor-pointer ml-1"
              >
                Đăng ký (Sign Up)
              </button>
            </div>
          </form>
        )}

        {/* ======================================================== */}
        {/* 4. FORGOT PASSWORD FORM */}
        {/* ======================================================== */}
        {authMode === "forgot" && (
          <form onSubmit={handleForgotPassword} className="flex flex-col gap-3">
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
                onClick={() => {
                  setAuthMode("reset");
                  setErrorMsg(null);
                }}
                className="text-xs font-semibold text-rose-600 dark:text-rose-400 hover:underline cursor-pointer"
              >
                Đã có mã xác nhận / token từ email? Nhập tại đây
              </button>
            </div>
          </form>
        )}

        {/* ======================================================== */}
        {/* 5. RESET PASSWORD FORM */}
        {/* ======================================================== */}
        {authMode === "reset" && (
          <form onSubmit={handleResetPassword} className="flex flex-col gap-3">
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
        )}
      </div>
    </div>
  );
}
