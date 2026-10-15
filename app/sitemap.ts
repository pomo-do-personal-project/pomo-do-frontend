import { MetadataRoute } from "next";

export default function sitemap(): MetadataRoute.Sitemap {
  const baseUrl = process.env.NEXT_PUBLIC_APP_URL || "http://localhost:3000";
  const now = new Date();

  return [
    {
      url: `${baseUrl}/vi`,
      lastModified: now,
      changeFrequency: "daily",
      priority: 1.0,
      alternates: {
        languages: {
          vi: `${baseUrl}/vi`,
          en: `${baseUrl}/en`,
        },
      },
    },
    {
      url: `${baseUrl}/en`,
      lastModified: now,
      changeFrequency: "daily",
      priority: 1.0,
      alternates: {
        languages: {
          vi: `${baseUrl}/vi`,
          en: `${baseUrl}/en`,
        },
      },
    },
    {
      url: `${baseUrl}/vi/reset-password`,
      lastModified: now,
      changeFrequency: "monthly",
      priority: 0.5,
      alternates: {
        languages: {
          vi: `${baseUrl}/vi/reset-password`,
          en: `${baseUrl}/en/reset-password`,
        },
      },
    },
    {
      url: `${baseUrl}/en/reset-password`,
      lastModified: now,
      changeFrequency: "monthly",
      priority: 0.5,
      alternates: {
        languages: {
          vi: `${baseUrl}/vi/reset-password`,
          en: `${baseUrl}/en/reset-password`,
        },
      },
    },
  ];
}
