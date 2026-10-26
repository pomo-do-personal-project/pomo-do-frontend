import type { NextConfig } from "next";
import createNextIntlPlugin from "next-intl/plugin";

const withNextIntl = createNextIntlPlugin();

const nextConfig: NextConfig = {
  devIndicators: false,
  images: {
    remotePatterns: [
      {
        protocol: "https",
        hostname: "zbygkwrbjeyufepqvpsz.supabase.co",
      },
    ],
  },
};

export default withNextIntl(nextConfig);
