import type { MetadataRoute } from "next";

export default function robots(): MetadataRoute.Robots {
  const appUrl = process.env.NEXT_PUBLIC_APP_URL || "https://afnan.eg";
  return {
    rules: {
      userAgent: "*",
      allow: "/",
      disallow: [
        "/admin/",
        "/account/",
        "/cart/",
        "/checkout/",
        "/order-success/",
        "/orders/",
      ],
    },
    sitemap: `${appUrl}/sitemap.xml`,
  };
}
