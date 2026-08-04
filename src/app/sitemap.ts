import type { MetadataRoute } from "next";

export default function sitemap(): MetadataRoute.Sitemap {
  // Simple static sitemap placeholder. Will be expanded dynamically.
  return [
    {
      url: "https://afnan.eg",
      lastModified: new Date(),
      changeFrequency: "daily",
      priority: 1,
    },
  ];
}
