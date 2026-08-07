import { NextRequest } from "next/server";
import { connectMongoose } from "@/lib/mongoose";
import { ProductModel } from "@/modules/products/model";
import { getCategoryNavigation } from "@/modules/catalog/queries";
import { withApiHandler } from "@/lib/http/with-api-handler";
import { apiSuccess } from "@/lib/http/api-response";

export const GET = withApiHandler(async (request: NextRequest) => {
  const { searchParams } = new URL(request.url);
  const rawQuery = searchParams.get("q") || "";
  const query = rawQuery.trim().slice(0, 100);

  if (!query) {
    return apiSuccess({ suggestions: [] });
  }

  await connectMongoose();

  // Limit category checks to active ones from cache
  const activeCategories = await getCategoryNavigation();
  const activeCategoryIds = activeCategories.map((c) => c.id);

  // Escape search input to make it regex-safe
  const escapedQuery = query.replace(/[|\\{}()[\]^$+*?.]/g, "\\$&");

  const products = await ProductModel.find({
    status: "ACTIVE",
    categoryId: { $in: activeCategoryIds },
    $or: [
      { name: { $regex: new RegExp(escapedQuery, "i") } },
      { tags: { $regex: new RegExp(`^${escapedQuery}`, "i") } }
    ]
  })
    .select("name slug")
    .limit(8)
    .lean();

  const suggestions = (products as unknown as Array<{ name: string; slug: string }>).map((p) => ({
    name: p.name,
    slug: p.slug
  }));

  return apiSuccess({ suggestions });
});
