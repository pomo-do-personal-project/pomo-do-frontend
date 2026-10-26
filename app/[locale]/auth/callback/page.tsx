"use client";

import React, { useEffect, useState, Suspense } from "react";
import { useRouter } from "next/navigation";
import { supabase } from "../../../lib/supabaseClient";
import { useAuthStore } from "../../../stores/useAuthStore";
import { Logo } from "../../../components/Logo";
import { CheckCircle2, AlertCircle } from "lucide-react";

function AuthCallbackContent() {
  const router = useRouter();
  const [status, setStatus] = useState<"loading" | "success" | "error">("loading");
  const [errorMessage, setErrorMessage] = useState("");
  const loginWithSupabase = useAuthStore((s) => s.loginWithSupabase);

  useEffect(() => {
    let isMounted = true;

    async function handleAuth() {
      try {
        // Lấy phiên đăng nhập sau khi Supabase phân giải hash #access_token
        const { data: { session }, error } = await supabase.auth.getSession();

        if (error) {
          throw new Error(error.message || "Lỗi xác thực phiên Supabase.");
        }

        if (!session?.access_token) {
          // Lắng nghe sự kiện auth state change nếu phiên chưa hydrate kịp
          const { data: authListener } = supabase.auth.onAuthStateChange(
            async (event, currentSession) => {
              if (currentSession?.access_token && isMounted) {
                authListener.subscription.unsubscribe();
                await completeLogin(currentSession.access_token);
              }
            }
          );

          // Hủy trạng thái chờ sau 6 giây nếu không nhận được token
          setTimeout(() => {
            if (isMounted && status === "loading") {
              setStatus("error");
              setErrorMessage("Không nhận được phiên đăng nhập từ Google. Vui lòng thử lại.");
            }
          }, 6000);
          return;
        }

        await completeLogin(session.access_token);
      } catch (err: unknown) {
        if (isMounted) {
          setStatus("error");
          setErrorMessage((err instanceof Error ? err.message : String(err)) || "Đăng nhập thất bại. Vui lòng thử lại.");
        }
      }
    }

    async function completeLogin(token: string) {
      try {
        await loginWithSupabase(token);
        if (isMounted) {
          setStatus("success");
          setTimeout(() => {
            router.replace("/");
          }, 1000);
        }
      } catch (err: unknown) {
        if (isMounted) {
          setStatus("error");
          setErrorMessage((err instanceof Error ? err.message : String(err)) || "Không thể đồng bộ tài khoản với máy chủ Pomo-Do.");
        }
      }
    }

    handleAuth();

    return () => {
      isMounted = false;
    };
  }, [loginWithSupabase, router, status]);

  return (
    <div className="min-h-screen w-full flex flex-col items-center justify-center p-6 bg-neutral-50 dark:bg-neutral-950 text-neutral-900 dark:text-white select-none transition-colors">
      <div className="w-full max-w-sm p-8 rounded-3xl bg-white/95 dark:bg-neutral-900/90 border border-neutral-200/80 dark:border-neutral-800 shadow-2xl flex flex-col items-center text-center backdrop-blur-xl animate-in fade-in duration-300">
        <div className="mb-6">
          <Logo size={42} />
        </div>

        {status === "loading" && (
          <div className="flex flex-col items-center gap-4">
            <span className="w-8 h-8 border-3 border-rose-500 border-t-transparent rounded-full animate-spin" />
            <div>
              <h2 className="text-sm font-semibold text-neutral-900 dark:text-neutral-100">Đang hoàn tất đăng nhập...</h2>
              <p className="text-xs text-neutral-500 dark:text-neutral-400 mt-1">Đang đồng bộ dữ liệu tài khoản Google của bạn</p>
            </div>
          </div>
        )}

        {status === "success" && (
          <div className="flex flex-col items-center gap-3">
            <div className="w-11 h-11 rounded-full bg-emerald-500/10 border border-emerald-500/30 flex items-center justify-center text-emerald-600 dark:text-emerald-400">
              <CheckCircle2 size={24} />
            </div>
            <div>
              <h2 className="text-sm font-bold text-neutral-900 dark:text-white">Đăng nhập thành công!</h2>
              <p className="text-xs text-neutral-500 dark:text-neutral-400 mt-1">Đang chuyển bạn về không gian làm việc...</p>
            </div>
          </div>
        )}

        {status === "error" && (
          <div className="flex flex-col items-center gap-3">
            <div className="w-11 h-11 rounded-full bg-rose-500/10 border border-rose-500/30 flex items-center justify-center text-rose-600 dark:text-rose-400">
              <AlertCircle size={24} />
            </div>
            <div>
              <h2 className="text-sm font-bold text-rose-600 dark:text-rose-400">Đăng nhập không thành công</h2>
              <p className="text-xs text-neutral-500 dark:text-neutral-400 mt-1">{errorMessage}</p>
            </div>
            <button
              onClick={() => router.replace("/")}
              className="mt-4 px-5 py-2 text-xs font-semibold rounded-xl bg-neutral-900 hover:bg-neutral-800 dark:bg-neutral-800 dark:hover:bg-neutral-700 text-white transition-all cursor-pointer shadow-sm"
            >
              Quay lại trang chủ
            </button>
          </div>
        )}
      </div>
    </div>
  );
}

export default function AuthCallbackPage() {
  return (
    <Suspense
      fallback={
        <div className="min-h-screen w-full flex items-center justify-center bg-neutral-50 dark:bg-neutral-950 text-neutral-900 dark:text-white">
          <span className="w-8 h-8 border-3 border-rose-500 border-t-transparent rounded-full animate-spin" />
        </div>
      }
    >
      <AuthCallbackContent />
    </Suspense>
  );
}
