import Link from "next/link";
import { ArrowLeft } from "lucide-react";

export default function NotFound() {
  return (
    <div className="min-h-screen flex flex-col items-center justify-center p-6 bg-neutral-50 dark:bg-neutral-950 text-neutral-900 dark:text-neutral-100 text-center select-none">
      <div className="w-16 h-16 rounded-3xl bg-rose-500/10 dark:bg-rose-950/40 border border-rose-500/30 flex items-center justify-center text-3xl mb-6 shadow-xs animate-bounce">
        🍅
      </div>

      <h1 className="text-6xl sm:text-7xl font-mono font-extrabold tracking-tighter text-neutral-900 dark:text-white mb-3">
        404
      </h1>

      <h2 className="text-xl sm:text-2xl font-bold tracking-tight mb-2">
        Trang không tồn tại
      </h2>

      <p className="text-sm text-neutral-500 dark:text-neutral-400 max-w-md mb-8">
        Đường dẫn bạn vừa truy cập không tìm thấy hoặc đã được thay đổi. Hãy quay lại không gian tập trung của bạn nhé!
      </p>

      <Link
        href="/"
        className="inline-flex items-center gap-2 px-6 py-3 rounded-2xl bg-neutral-900 hover:bg-neutral-800 text-white dark:bg-white dark:text-neutral-900 dark:hover:bg-neutral-200 text-sm font-semibold transition-all duration-200 shadow-md hover:shadow-lg active:scale-98 cursor-pointer"
      >
        <ArrowLeft size={16} strokeWidth={2.2} />
        <span>Quay về trang chủ Pomo-Do</span>
      </Link>
    </div>
  );
}
