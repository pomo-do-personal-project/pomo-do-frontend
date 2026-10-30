"use client";

import React, { useState, useEffect, useRef } from "react";
import { Sparkles, RotateCcw } from "lucide-react";
import { useAuthStore } from "../../../stores/useAuthStore";
import { ApiError } from "../../../lib/apiClient";

interface OtpVerifyFormProps {
  email: string;
  displayName: string;
  password: string;
  onSuccess: () => void;
  onEditInfo: () => void;
  setError: (msg: string | null) => void;
  setSuccess: (msg: string | null) => void;
}

export function OtpVerifyForm({
  email,
  displayName,
  password,
  onSuccess,
  onEditInfo,
  setError,
  setSuccess,
}: OtpVerifyFormProps) {
  const [otpDigits, setOtpDigits] = useState<string[]>(["", "", "", "", "", ""]);
  const [otpCooldown, setOtpCooldown] = useState(60);
  const [isSubmitting, setIsSubmitting] = useState(false);

  const otpInputRefs = useRef<(HTMLInputElement | null)[]>([]);

  const register = useAuthStore((s) => s.register);
  const sendOtp = useAuthStore((s) => s.sendOtp);

  useEffect(() => {
    setTimeout(() => {
      otpInputRefs.current[0]?.focus();
    }, 100);
  }, []);

  useEffect(() => {
    if (otpCooldown <= 0) return;
    const timer = setInterval(() => {
      setOtpCooldown((prev) => (prev > 0 ? prev - 1 : 0));
    }, 1000);
    return () => clearInterval(timer);
  }, [otpCooldown]);

  const handleOtpChange = (index: number, val: string) => {
    const cleaned = val.replace(/\D/g, "");
    if (!cleaned) {
      const nextDigits = [...otpDigits];
      nextDigits[index] = "";
      setOtpDigits(nextDigits);
      return;
    }

    const nextDigits = [...otpDigits];
    if (cleaned.length > 1) {
      const chars = cleaned.slice(0, 6).split("");
      chars.forEach((c, i) => {
        if (index + i < 6) nextDigits[index + i] = c;
      });
      setOtpDigits(nextDigits);
      const nextFocus = Math.min(index + chars.length, 5);
      otpInputRefs.current[nextFocus]?.focus();

      if (nextDigits.every((d) => d !== "")) {
        handleCompleteRegistration(nextDigits.join(""));
      }
      return;
    }

    nextDigits[index] = cleaned;
    setOtpDigits(nextDigits);

    if (index < 5 && cleaned) {
      otpInputRefs.current[index + 1]?.focus();
    }

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

  const handleCompleteRegistration = async (codeToVerify?: string) => {
    const finalOtp = codeToVerify || otpDigits.join("");
    if (finalOtp.length !== 6) {
      setError("Vui lòng nhập đủ 6 chữ số OTP.");
      return;
    }

    setError(null);
    setSuccess(null);
    setIsSubmitting(true);

    try {
      await register({
        email: email.trim(),
        password,
        displayName: displayName.trim() || email.split("@")[0],
        otpCode: finalOtp,
      });

      setSuccess("Đăng ký tài khoản thành công! Vui lòng đăng nhập bằng mật khẩu của bạn.");
      onSuccess();
    } catch (err: unknown) {
      if (err instanceof ApiError) {
        setError(err.message + (err.errors?.length ? `: ${err.errors.join(", ")}` : ""));
      } else {
        setError((err instanceof Error ? err.message : String(err)) || "Mã OTP không chính xác hoặc đã hết hạn.");
      }
      setOtpDigits(["", "", "", "", "", ""]);
      otpInputRefs.current[0]?.focus();
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleResendOtp = async () => {
    if (otpCooldown > 0) return;
    setError(null);
    setSuccess(null);

    try {
      await sendOtp(email.trim());
      setOtpCooldown(60);
      setSuccess("Mã OTP mới đã được gửi vào email của bạn!");
      setOtpDigits(["", "", "", "", "", ""]);
      otpInputRefs.current[0]?.focus();
    } catch (err: unknown) {
      setError((err instanceof Error ? err.message : String(err)) || "Không thể gửi lại mã OTP. Vui lòng thử lại sau.");
    }
  };

  return (
    <div className="flex flex-col gap-5 py-1">
      {/* 6 PIN Slots */}
      <div className="flex items-center justify-between gap-1.5 sm:gap-2">
        {otpDigits.map((digit, index) => (
          <input
            key={index}
            ref={(el) => {
              otpInputRefs.current[index] = el;
            }}
            type="text"
            inputMode="numeric"
            maxLength={1}
            aria-label={`Chữ số OTP thứ ${index + 1}`}
            value={digit}
            onChange={(e) => handleOtpChange(index, e.target.value)}
            onKeyDown={(e) => handleOtpKeyDown(index, e)}
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
          onClick={onEditInfo}
          className="text-neutral-400 hover:text-neutral-800 dark:hover:text-neutral-200 hover:underline cursor-pointer transition-colors"
        >
          Nhầm email? Bấm vào đây để sửa thông tin
        </button>
      </div>
    </div>
  );
}
