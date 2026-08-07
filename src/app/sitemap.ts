import type { MetadataRoute } from "next";
import { connectMongoose } from "@/lib/mongoose";
import { ProductModel } from "@/modules/products/model";
import { getCategoryNavigation } from "@/modules/catalog/queries";

export default async function sitemap(): Promise<MetadataRoute.Sitemap> {
  const appUrl = process.env.NEXT_PUBLIC_APP_URL || "https://afnan.eg";

  // Static URLs
  const staticUrls: MetadataRoute.Sitemap = [
    {
      url: `${appUrl}`,
      lastModified: new Date(),
      changeFrequency: "daily",
      priority: 1.0,
    },
    {
      url: `${appUrl}/shop`,
      lastModified: new Date(),
      changeFrequency: "daily",
      priority: 0.8,
    },
    {
      url: `${appUrl}/custom-request`,
      lastModified: new Date(),
      changeFrequency: "weekly",
      priority: 0.6,
    },
  ];

  try {
    await connectMongoose();

    // Fetch active categories (using the cached query for speed)
    const activeCategories = await getCategoryNavigation();
    const categoryUrls: MetadataRoute.Sitemap = activeCategories.map((cat) => ({
      url: `${appUrl}/category/${cat.slug}`,
      lastModified: new Date(),
      changeFrequency: "weekly",
      priority: 0.7,
    }));

    // Fetch active products
    const activeCategoryIds = activeCategories.map((cat) => cat.id);
    const activeProducts = await ProductModel.find({
      status: "ACTIVE",
      categoryId: { $in: activeCategoryIds },
    })
      .select("slug updatedAt")
      .lean();

    const productUrls: MetadataRoute.Sitemap = (activeProducts as unknown as Array<{ slug: string; updatedAt?: Date | string }>).map((prod) => ({
      url: `${appUrl}/product/${prod.slug}`,
      lastModified: prod.updatedAt ? new Date(prod.updatedAt) : new Date(),
      changeFrequency: "daily",
      priority: 0.9,
    }));

    return [...staticUrls, ...categoryUrls, ...productUrls];
  } catch (error) {
    console.error("Failed to generate dynamic sitemap, falling back to static URLs:", error);
    return staticUrls;
  }
}
