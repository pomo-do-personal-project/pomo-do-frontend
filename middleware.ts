import createMiddleware from "next-intl/middleware";
import { routing } from "./i18n/routing";
import { NextRequest, NextResponse } from "next/server";

const intlMiddleware = createMiddleware(routing);

export default function middleware(request: NextRequest) {
  const { pathname } = request.nextUrl;
  // Khi truy cập trang chủ gốc '/', chuyển hướng trực tiếp sang trang giới thiệu sản phẩm (/vi/preview)
  if (pathname === "/") {
    return NextResponse.redirect(new URL("/vi/preview", request.url));
  }
  return intlMiddleware(request);
}

export const config = {
  // Match all pathnames except for
  // - /api, /_next, /_vercel
  // - static files (e.g. favicon.ico, images)
  matcher: ["/((?!api|_next|_vercel|.*\\..*).*)"],
};
