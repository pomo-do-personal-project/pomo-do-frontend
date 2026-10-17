"use client";

import { useEffect } from "react";
import { useRouter } from "next/navigation";
import { useTranslation } from "../../stores/useLanguageStore";

export default function AdminRootRedirect() {
  const router = useRouter();
  const { language } = useTranslation();

  useEffect(() => {
    router.replace(`/${language}/admin/dashboard`);
  }, [router, language]);

  return (
    <div className="flex items-center justify-center min-h-[50vh] text-xs text-neutral-400">
      Đang chuyển hướng tới Dashboard...
    </div>
  );
}
