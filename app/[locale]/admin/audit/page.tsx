"use client";

import { useEffect } from "react";
import { useRouter } from "next/navigation";
import { useTranslation } from "../../../stores/useLanguageStore";

export default function AdminAuditPage() {
  const router = useRouter();
  const { language } = useTranslation();

  useEffect(() => {
    router.replace(`/${language}/admin/dashboard`);
  }, [router, language]);

  return null;
}
