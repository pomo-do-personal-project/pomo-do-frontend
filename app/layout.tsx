import type { Metadata } from "next";
import { Inter } from "next/font/google";
import "./globals.css";

const interSans = Inter({
  variable: "--font-sans",
  subsets: ["latin", "vietnamese"],
  display: "swap",
});

const baseUrl = process.env.NEXT_PUBLIC_APP_URL || "http://localhost:3000";

export const metadata: Metadata = {
  metadataBase: new URL(baseUrl),
  title: {
    default: "Pomo-Do | Pomodoro & Task Management System",
    template: "%s | Pomo-Do",
  },
  description:
    "Tối ưu hóa năng suất cá nhân với đồng hồ Pomodoro thông minh, quản lý công việc toàn diện và Ma trận Eisenhower 4 góc.",
  keywords: [
    "Pomodoro",
    "Pomo-Do",
    "Quản lý thời gian",
    "Ma trận Eisenhower",
    "Năng suất làm việc",
    "Focus timer",
    "Task management",
  ],
  authors: [{ name: "Pomo-Do Team" }],
  openGraph: {
    type: "website",
    locale: "vi_VN",
    url: baseUrl,
    siteName: "Pomo-Do",
    title: "Pomo-Do | Pomodoro & Task Management System",
    description:
      "Tối ưu hóa năng suất cá nhân với đồng hồ Pomodoro thông minh, quản lý công việc toàn diện và Ma trận Eisenhower 4 góc.",
    images: [
      {
        url: "/og-image.jpg",
        width: 1200,
        height: 630,
        alt: "Pomo-Do Productivity Dashboard Preview",
      },
    ],
  },
  twitter: {
    card: "summary_large_image",
    title: "Pomo-Do | Pomodoro & Task Management System",
    description:
      "Tối ưu hóa năng suất với đồng hồ Pomodoro, quản lý công việc và ma trận Eisenhower.",
    images: ["/og-image.jpg"],
  },
  icons: {
    icon: [
      { url: "/icon.svg", type: "image/svg+xml" },
      { url: "/icon.png", sizes: "512x512", type: "image/png" },
      { url: "/favicon.ico", sizes: "any" },
    ],
    apple: [
      { url: "/apple-icon.png", sizes: "180x180", type: "image/png" },
    ],
    shortcut: ["/favicon.ico"],
  },
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return children;
}
