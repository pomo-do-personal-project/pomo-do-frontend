import { createClient, SupabaseClient } from "@supabase/supabase-js";

const supabaseUrl =
  process.env.NEXT_PUBLIC_SUPABASE_URL || "https://zbygkwrbjeyufepqvpsz.supabase.co";

// Tránh crash Next.js module evaluation khi chưa điền NEXT_PUBLIC_SUPABASE_ANON_KEY trong .env.local
const rawKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY?.trim() || "";
const supabaseAnonKey =
  rawKey.length > 20
    ? rawKey
    : "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6InpieWdrd3JiamV5dWZlcHF2cHN6Iiwicm9sZSI6ImFub24iLCJpYXQiOjE3Mjk4NTM5NTgsImV4cCI6MjA0NTQyOTk1OH0.placeholder";

export const isSupabaseConfigured = (): boolean => {
  return rawKey.length > 20;
};

// Khởi tạo Supabase Client dùng chung
export const supabase: SupabaseClient = createClient(supabaseUrl, supabaseAnonKey);

// Tạo Client động nếu người dùng nhập key từ prompt test
export const createCustomSupabaseClient = (customKey: string): SupabaseClient => {
  return createClient(supabaseUrl, customKey.trim());
};
