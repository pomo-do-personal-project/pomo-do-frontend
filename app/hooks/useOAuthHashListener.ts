import { useEffect } from "react";
import { supabase } from "../lib/supabaseClient";
import { useAuthStore } from "../stores/useAuthStore";

/**
 * Hook lắng nghe và tự động xử lý Access Token từ hash URL nếu bị chuyển hướng về trang chủ
 */
export function useOAuthHashListener() {
  const loginWithSupabase = useAuthStore((s) => s.loginWithSupabase);

  useEffect(() => {
    if (typeof window === "undefined") return;

    const hash = window.location.hash;
    if (!hash || !hash.includes("access_token=")) return;

    // Trích xuất access_token từ URL fragment
    const params = new URLSearchParams(hash.startsWith("#") ? hash.slice(1) : hash);
    const token = params.get("access_token");

    const completeAuth = async (accessToken: string) => {
      try {
        await loginWithSupabase(accessToken);
      } catch (err) {
        console.error("Lỗi xác thực token Supabase từ hash URL:", err);
      } finally {
        // Xóa sạch fragment #access_token khỏi URL
        window.history.replaceState(null, "", window.location.pathname + window.location.search);
      }
    };

    if (token) {
      completeAuth(token);
    } else {
      supabase.auth.getSession().then(({ data: { session } }) => {
        if (session?.access_token) {
          completeAuth(session.access_token);
        }
      });
    }
  }, [loginWithSupabase]);
}
