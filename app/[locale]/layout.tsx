import type { Metadata } from "next";
import { Inter } from "next/font/google";
import { notFound } from "next/navigation";
import { NextIntlClientProvider } from "next-intl";
import { getMessages, setRequestLocale } from "next-intl/server";
import { routing } from "../../i18n/routing";
import "../globals.css";

const interSans = Inter({
  variable: "--font-sans",
  subsets: ["latin", "vietnamese"],
  display: "swap",
});

const baseUrl = process.env.NEXT_PUBLIC_APP_URL || "http://localhost:3000";

export function generateStaticParams() {
  return routing.locales.map((locale) => ({ locale }));
}

export async function generateMetadata({
  params,
}: {
  params: Promise<{ locale: string }>;
}): Promise<Metadata> {
  const { locale } = await params;
  const isEn = locale === "en";

  const title = isEn
    ? "Pomo-Do | Pomodoro & Task Management System"
    : "Pomo-Do | Đồng hồ Pomodoro & Quản lý công việc thông minh";
  const description = isEn
    ? "Maximize personal productivity with an intelligent Pomodoro timer, comprehensive task management, and the 4-quadrant Eisenhower Matrix."
    : "Tối ưu hóa năng suất cá nhân với đồng hồ Pomodoro thông minh, quản lý công việc toàn diện và Ma trận Eisenhower 4 góc.";

  return {
    metadataBase: new URL(baseUrl),
    title: {
      default: title,
      template: "%s | Pomo-Do",
    },
    description,
    keywords: isEn
      ? ["Pomodoro", "Pomo-Do", "Time management", "Eisenhower Matrix", "Productivity", "Focus timer", "Task management"]
      : ["Pomodoro", "Pomo-Do", "Quản lý thời gian", "Ma trận Eisenhower", "Năng suất làm việc", "Focus timer", "Task management"],
    authors: [{ name: "Pomo-Do Team" }],
    alternates: {
      canonical: `${baseUrl}/${locale}`,
      languages: {
        vi: `${baseUrl}/vi`,
        en: `${baseUrl}/en`,
      },
    },
    openGraph: {
      type: "website",
      locale: isEn ? "en_US" : "vi_VN",
      url: `${baseUrl}/${locale}`,
      siteName: "Pomo-Do",
      title,
      description,
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
      title,
      description,
    },
    icons: {
      icon: "/favicon.ico",
    },
  };
}

export default async function LocaleLayout({
  children,
  params,
}: {
  children: React.ReactNode;
  params: Promise<{ locale: string }>;
}) {
  const { locale } = await params;

  if (!(routing.locales as readonly string[]).includes(locale)) {
    notFound();
  }

  setRequestLocale(locale);
  const messages = await getMessages();

  return (
    <html
      lang={locale}
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
      <body className="min-h-full flex flex-col">
        <NextIntlClientProvider messages={messages} locale={locale}>
          {children}
        </NextIntlClientProvider>
      </body>
    </html>
  );
}
