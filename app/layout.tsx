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
        url: "/favicon.ico",
        width: 64,
        height: 64,
        alt: "Pomo-Do Tomato Icon",
      },
    ],
  },
  twitter: {
    card: "summary",
    title: "Pomo-Do | Pomodoro & Task Management System",
    description:
      "Tối ưu hóa năng suất với đồng hồ Pomodoro, quản lý công việc và ma trận Eisenhower.",
  },
  icons: {
    icon: "/favicon.ico",
  },
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html
      lang="vi"
      suppressHydrationWarning
      className={`${interSans.variable} font-sans h-full antialiased`}
    >
      <head>
        <script
          dangerouslySetInnerHTML={{
            __html: `
              (function() {
                try {
                  var saved = localStorage.getItem('theme');
                  var prefersDark = window.matchMedia('(prefers-color-scheme: dark)').matches;
                  if (saved === 'dark' || (!saved && prefersDark)) {
                    document.documentElement.classList.add('dark');
                  } else {
                    document.documentElement.classList.remove('dark');
                  }
                } catch (e) {}
              })();
            `,
          }}
        />
      </head>
      <body className="min-h-full flex flex-col">{children}</body>
    </html>
  );
}
