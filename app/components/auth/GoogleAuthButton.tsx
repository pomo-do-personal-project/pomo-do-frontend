"use client";

import React, { useState } from "react";
import { supabase } from "../../lib/supabaseClient";
import { UserDto } from "../../types/api";

interface GoogleAuthButtonProps {
  text?: "continue_with" | "signin_with" | "signup_with";
  onSuccess?: (user: UserDto) => void;
  setError?: (msg: string | null) => void;
  setSuccess?: (msg: string | null) => void;
}

export function GoogleAuthButton({
  setError,
  setSuccess,
}: GoogleAuthButtonProps) {
  const [isVerifying, setIsVerifying] = useState(false);

  // Xử lý khi người dùng click nút đăng nhập Google qua Supabase
  const handleClick = async () => {
    setIsVerifying(true);
    setError?.(null);
    setSuccess?.(null);

    try {
      const { error } = await supabase.auth.signInWithOAuth({
        provider: "google",
        options: {
          redirectTo: `${window.location.origin}/vi/auth/callback`,
          queryParams: {
            access_type: "offline",
            prompt: "consent",
          },
        },
      });

      if (error) {
        throw error;
      }
    } catch (err: unknown) {
      setIsVerifying(false);
      setError?.((err instanceof Error ? err.message : String(err)) || "Không thể khởi động đăng nhập Google qua Supabase.");
    }
  };

  return (
    <div className="w-full relative">
      <button
        type="button"
        disabled={isVerifying}
        onClick={handleClick}
        className="w-full py-2.5 px-4 bg-transparent border-2 border-neutral-800 dark:border-neutral-200 hover:bg-neutral-100 dark:hover:bg-neutral-800 disabled:opacity-60 rounded-2xl text-xs sm:text-sm font-semibold text-neutral-800 dark:text-neutral-200 flex items-center justify-center gap-2.5 transition-all cursor-pointer shadow-sm hover:scale-[1.01] active:scale-[0.99]"
      >
        {isVerifying ? (
          <>
            <span className="inline-block w-4 h-4 border-2 border-current border-t-transparent rounded-full animate-spin" />
            <span>Đang chuyển hướng sang Google...</span>
          </>
        ) : (
          <>
            <svg className="w-4 h-4 shrink-0" viewBox="0 0 24 24">
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
            <span>Tiếp tục với Google</span>
          </>
        )}
      </button>
    </div>
  );
}
