import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  images: {
    remotePatterns: [
      {
        protocol: "https",
        hostname: "zbygkwrbjeyufepqvpsz.supabase.co",
      },
    ],
  },
};

export default nextConfig;
