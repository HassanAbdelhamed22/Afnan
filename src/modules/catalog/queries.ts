import "server-only";

import { unstable_cache, updateTag } from "next/cache";
import { connectMongoose } from "@/lib/mongoose";
import { NotFoundError } from "@/lib/errors/app-error";
import { CategoryModel } from "../categories/model";
import { ProductModel } from "../products/model";
import { resolveMediaUrl, type MediaAsset } from "@/modules/uploads/types";
import { CACHE_TAGS } from "./cache";
import { catalogFiltersSchema } from "./schemas";
import {
  type CategoryDTO,
  type ProductCardDTO,
  type ProductDetailDTO,
  type PurchasableVariantDTO,
  type CatalogFilters,
  type PaginatedCatalogProducts,
} from "./dto";

export interface DatabaseMediaAsset {
  url: string;
  publicId: string;
  width?: number;
  height?: number;
  bytes?: number;
  format?: "jpg" | "jpeg" | "png" | "webp";
  alt?: string;
  sortOrder?: number;
  isPrimary?: boolean;
  enhancedUrl?: string;
  presentation?: MediaAsset["presentation"];
}

export interface DatabaseCategory {
  _id: { toString(): string };
  name: string;
  slug: string;
  description?: string;
  image?: DatabaseMediaAsset;
  sortOrder: number;
  isActive: boolean;
}

export interface DatabaseVariant {
  _id: { toString(): string };
  sku: string;
  label: string;
  optionValues: Map<string, string> | Record<string, string>;
  priceAmount?: number;
  stockQuantity?: number;
  isActive: boolean;
}

export interface DatabaseProduct {
  _id: { toString(): string };
  name: string;
  slug: string;
  description: string;
  categoryId: { _id?: { toString(): string }; name?: string; isActive?: boolean } | { toString(): string };
  fulfillmentType: "READY_MADE" | "MADE_TO_ORDER";
  basePriceAmount: number;
  currency?: string;
  materials?: string[];
  colors?: string[];
  tags?: string[];
  dimensions?: {
    width?: number;
    height?: number;
    depth?: number;
    unit?: "cm";
  };
  personalizationAvailable?: boolean;
  personalizationInstructions?: string;
  preparationDaysMin?: number;
  preparationDaysMax?: number;
  careInstructions?: string;
  images?: DatabaseMediaAsset[];
  variants?: DatabaseVariant[];
  isFeatured?: boolean;
  publishedAt?: Date;
}

// --- Mapping Helpers ---

export function mapCategoryToDTO(doc: DatabaseCategory): CategoryDTO {
  return {
    id: doc._id.toString(),
    name: doc.name,
    slug: doc.slug,
    description: doc.description || undefined,
    image: doc.image
      ? {
          url: doc.image.url,
          publicId: doc.image.publicId,
          width: doc.image.width,
          height: doc.image.height,
        }
      : undefined,
    sortOrder: doc.sortOrder,
  };
}

export function mapProductToCardDTO(doc: DatabaseProduct): ProductCardDTO {
  let inStock = true;
  if (doc.fulfillmentType === "READY_MADE") {
    inStock = (doc.variants || []).some(
      (v: DatabaseVariant) => v.isActive && (v.stockQuantity ?? 0) > 0
    );
  }

  const categoryIdObj = doc.categoryId as { _id?: { toString(): string }; name?: string } | null;

  return {
    id: doc._id.toString(),
    name: doc.name,
    slug: doc.slug,
    categoryId: categoryIdObj?._id
      ? categoryIdObj._id.toString()
      : typeof doc.categoryId === "string" || doc.categoryId instanceof Object
      ? doc.categoryId.toString()
      : "",
    categoryName: categoryIdObj?.name || undefined,
    fulfillmentType: doc.fulfillmentType,
    basePriceAmount: doc.basePriceAmount,
    currency: (doc.currency as "EGP") || "EGP",
    images: (doc.images || []).map((img: DatabaseMediaAsset) => ({
      ...img,
      url: resolveMediaUrl(img),
      publicId: img.publicId,
      width: img.width,
      height: img.height,
    })),
    isFeatured: !!doc.isFeatured,
    preparationDaysMin: doc.preparationDaysMin ?? undefined,
    preparationDaysMax: doc.preparationDaysMax ?? undefined,
    inStock,
  };
}

export function mapProductToDetailDTO(doc: DatabaseProduct): ProductDetailDTO {
  const activeVariants = (doc.variants || [])
    .filter((v: DatabaseVariant) => v.isActive)
    .map((v: DatabaseVariant): PurchasableVariantDTO => {
      const priceAmount =
        typeof v.priceAmount === "number" ? v.priceAmount : doc.basePriceAmount;

      const stockQuantity =
        doc.fulfillmentType === "READY_MADE" ? v.stockQuantity : undefined;

      let optionValues: Record<string, string> = {};
      if (v.optionValues instanceof Map) {
        optionValues = Object.fromEntries(v.optionValues.entries());
      } else if (v.optionValues && typeof v.optionValues === "object") {
        optionValues = { ...v.optionValues };
      }

      return {
        id: v._id.toString(),
        sku: v.sku,
        label: v.label,
        optionValues,
        priceAmount,
        stockQuantity,
        isActive: v.isActive,
      };
    });

  const categoryIdObj = doc.categoryId as { _id?: { toString(): string } } | null;

  return {
    id: doc._id.toString(),
    name: doc.name,
    slug: doc.slug,
    description: doc.description,
    categoryId: categoryIdObj?._id
      ? categoryIdObj._id.toString()
      : typeof doc.categoryId === "string" || doc.categoryId instanceof Object
      ? doc.categoryId.toString()
      : "",
    fulfillmentType: doc.fulfillmentType,
    basePriceAmount: doc.basePriceAmount,
    currency: (doc.currency as "EGP") || "EGP",
    materials: doc.materials || [],
    colors: doc.colors || [],
    tags: doc.tags || [],
    dimensions: doc.dimensions
      ? {
          width: doc.dimensions.width ?? undefined,
          height: doc.dimensions.height ?? undefined,
          depth: doc.dimensions.depth ?? undefined,
          unit: doc.dimensions.unit || "cm",
        }
      : undefined,
    personalizationAvailable: !!doc.personalizationAvailable,
    personalizationInstructions: doc.personalizationInstructions ?? undefined,
    preparationDaysMin: doc.preparationDaysMin ?? undefined,
    preparationDaysMax: doc.preparationDaysMax ?? undefined,
    careInstructions: doc.careInstructions ?? undefined,
    images: (doc.images || []).map((img: DatabaseMediaAsset) => ({
      ...img,
      url: resolveMediaUrl(img),
      publicId: img.publicId,
      width: img.width,
      height: img.height,
    })),
    variants: activeVariants,
    isFeatured: !!doc.isFeatured,
    publishedAt: doc.publishedAt ? doc.publishedAt.toISOString() : undefined,
  };
}

// --- Raw Database Access Functions (for testability and cache encapsulation) ---

export async function rawGetCategoryNavigation(): Promise<CategoryDTO[]> {
  await connectMongoose();
  const categories = await CategoryModel.find({ isActive: true })
    .select("name slug description image sortOrder")
    .sort({ sortOrder: 1 })
    .lean();

  return categories.map(mapCategoryToDTO);
}

export async function rawGetFeaturedProducts(limit: number): Promise<ProductCardDTO[]> {
  await connectMongoose();

  const activeCategories = await CategoryModel.find({ isActive: true })
    .select("_id")
    .lean();
  const activeCategoryIds = activeCategories.map((c) => c._id);

  const products = await ProductModel.find({
    status: "ACTIVE",
    isFeatured: true,
    categoryId: { $in: activeCategoryIds },
  })
    .select("name slug categoryId fulfillmentType basePriceAmount currency images variants isFeatured preparationDaysMin preparationDaysMax publishedAt createdAt")
    .populate({ path: "categoryId", select: "name isActive" })
    .sort({ publishedAt: -1, createdAt: -1 })
    .limit(limit)
    .lean();

  return products.map(mapProductToCardDTO);
}

export async function rawGetProductBySlug(slug: string): Promise<ProductDetailDTO> {
  await connectMongoose();

  const product = await ProductModel.findOne({ slug, status: "ACTIVE" })
    .select("name slug description categoryId fulfillmentType basePriceAmount currency materials colors tags dimensions personalizationAvailable personalizationInstructions preparationDaysMin preparationDaysMax careInstructions images variants isFeatured publishedAt")
    .populate({ path: "categoryId", select: "name isActive" })
    .lean();

  if (!product) {
    throw new NotFoundError("Product not found");
  }

  const category = product.categoryId as { isActive?: boolean } | null;
  if (!category || !category.isActive) {
    throw new NotFoundError("Product belongs to an inactive category");
  }

  return mapProductToDetailDTO(product as unknown as DatabaseProduct);
}

export async function rawGetCategoryBySlug(slug: string): Promise<CategoryDTO> {
  await connectMongoose();

  const category = await CategoryModel.findOne({ slug, isActive: true })
    .select("name slug description image sortOrder")
    .lean();

  if (!category) {
    throw new NotFoundError("Category not found");
  }

  return mapCategoryToDTO(category);
}

export const getCategoryNavigation = unstable_cache(
  async () => rawGetCategoryNavigation(),
  ["category-navigation-v2"],
  {
    tags: [CACHE_TAGS.categories],
    revalidate: 86400
  }
);

export async function getHomepageCatalog(limit = 4): Promise<ProductCardDTO[]> {
  const resolvedLimit = Math.min(50, Math.max(1, limit));
  return unstable_cache(
    async (l: number) => rawGetFeaturedProducts(l),
    ["homepage-catalog", String(resolvedLimit)],
    {
      tags: [CACHE_TAGS.home, CACHE_TAGS.products, CACHE_TAGS.categories],
      revalidate: 3600
    }
  )(resolvedLimit);
}

export async function getFeaturedProducts(limit = 8): Promise<ProductCardDTO[]> {
  const resolvedLimit = Math.min(50, Math.max(1, limit));
  return unstable_cache(
    async (l: number) => rawGetFeaturedProducts(l),
    ["featured-products", String(resolvedLimit)],
    {
      tags: [CACHE_TAGS.home],
      revalidate: 3600
    }
  )(resolvedLimit);
}

export async function getProductBySlug(slug: string): Promise<ProductDetailDTO> {
  return unstable_cache(
    async (s: string) => rawGetProductBySlug(s),
    ["product-by-slug", slug],
    {
      tags: [
        CACHE_TAGS.product(slug),
        CACHE_TAGS.categories
      ],
      revalidate: 3600
    }
  )(slug);
}

export async function getCategoryBySlug(slug: string): Promise<CategoryDTO> {
  return unstable_cache(
    async (s: string) => rawGetCategoryBySlug(s),
    ["category-by-slug", slug],
    {
      tags: [
        CACHE_TAGS.category(slug),
        CACHE_TAGS.categories
      ],
      revalidate: 3600
    }
  )(slug);
}

// --- Cache Invalidation Helpers ---

export function revalidateCatalogCache() {
  updateTag(CACHE_TAGS.home);
  updateTag(CACHE_TAGS.products);
}

export function revalidateProductCache(id: string, slug?: string) {
  updateTag(CACHE_TAGS.product(id));
  if (slug) {
    updateTag(CACHE_TAGS.product(slug));
  }
  updateTag(CACHE_TAGS.products);
  updateTag(CACHE_TAGS.home);
}

export function revalidateCategoryCache(id: string, slug?: string) {
  updateTag(CACHE_TAGS.category(id));
  if (slug) {
    updateTag(CACHE_TAGS.category(slug));
  }
  updateTag(CACHE_TAGS.categories);
  updateTag(CACHE_TAGS.products);
  updateTag(CACHE_TAGS.home);
}

// --- Public catalog queries ---

export async function rawGetRelatedProducts(
  productId: string,
  categoryId: string,
  limit = 4
): Promise<ProductCardDTO[]> {
  await connectMongoose();

  const strictLimit = Math.min(8, Math.max(1, limit));

  const related = await ProductModel.find({
    _id: { $ne: productId },
    status: "ACTIVE",
    categoryId,
  })
    .select("name slug categoryId fulfillmentType basePriceAmount currency images variants isFeatured preparationDaysMin preparationDaysMax publishedAt createdAt")
    .populate({ path: "categoryId", select: "name isActive" })
    .sort({ publishedAt: -1, createdAt: -1 })
    .limit(strictLimit)
    .lean();

  return related.map(mapProductToCardDTO);
}

export async function getRelatedProducts(
  productId: string,
  categoryId: string,
  limit = 4
): Promise<ProductCardDTO[]> {
  const strictLimit = Math.min(8, Math.max(1, limit));

  return unstable_cache(
    async (resolvedProductId: string, resolvedCategoryId: string, resolvedLimit: number) =>
      rawGetRelatedProducts(resolvedProductId, resolvedCategoryId, resolvedLimit),
    ["related-products", productId, categoryId, String(strictLimit)],
    {
      tags: [
        CACHE_TAGS.products,
        CACHE_TAGS.product(productId),
        CACHE_TAGS.category(categoryId),
      ],
      revalidate: 3600,
    }
  )(productId, categoryId, strictLimit);
}

export async function rawListCatalogProducts(
  filters: CatalogFilters,
  resolvedCategoryIds?: string[]
): Promise<PaginatedCatalogProducts> {
  await connectMongoose();

  const parsed = catalogFiltersSchema.parse(filters);

  const query: {
    status: string;
    categoryId?: unknown;
    basePriceAmount?: { $gte?: number; $lte?: number };
    materials?: { $regex: RegExp };
    colors?: { $regex: RegExp };
    fulfillmentType?: string;
    $or?: Array<Record<string, unknown>>;
    $text?: { $search: string };
  } = { status: "ACTIVE" };

  if (parsed.categorySlug) {
    const categoryId = resolvedCategoryIds?.[0]
      ?? (await rawGetCategoryBySlug(parsed.categorySlug)).id;
    query.categoryId = categoryId;
  } else {
    const activeCategoryIds = resolvedCategoryIds
      ?? (await rawGetCategoryNavigation()).map((category) => category.id);
    query.categoryId = { $in: activeCategoryIds };
  }

  if (parsed.minPrice !== undefined || parsed.maxPrice !== undefined) {
    query.basePriceAmount = {};
    if (parsed.minPrice !== undefined) {
      query.basePriceAmount.$gte = parsed.minPrice;
    }
    if (parsed.maxPrice !== undefined) {
      query.basePriceAmount.$lte = parsed.maxPrice;
    }
  }

  if (parsed.material) {
    query.materials = { $regex: new RegExp(`^${parsed.material}$`, "i") };
  }

  if (parsed.color) {
    query.colors = { $regex: new RegExp(`^${parsed.color}$`, "i") };
  }

  if (parsed.fulfillmentType) {
    query.fulfillmentType = parsed.fulfillmentType;
  }

  if (parsed.availability === "IN_STOCK") {
    query.$or = [
      { fulfillmentType: "MADE_TO_ORDER" },
      {
        fulfillmentType: "READY_MADE",
        variants: {
          $elemMatch: {
            isActive: true,
            stockQuantity: { $gt: 0 },
          },
        },
      },
    ];
  }

  if (parsed.search) {
    query.$text = { $search: parsed.search };
  }

  let sortQuery: Record<string, 1 | -1 | { $meta: string }> = { publishedAt: -1, createdAt: -1, _id: 1 };

  if (parsed.sort === "price_asc") {
    sortQuery = { basePriceAmount: 1, _id: 1 };
  } else if (parsed.sort === "price_desc") {
    sortQuery = { basePriceAmount: -1, _id: 1 };
  } else if (parsed.sort === "newest") {
    sortQuery = { publishedAt: -1, createdAt: -1, _id: 1 };
  } else if (parsed.sort === "relevance" || (parsed.search && !parsed.sort)) {
    sortQuery = { score: { $meta: "textScore" }, _id: 1 };
  }

  const skip = (parsed.page - 1) * parsed.limit;

  const productsQuery = ProductModel.find(query)
    .select("name slug categoryId fulfillmentType basePriceAmount currency images variants isFeatured preparationDaysMin preparationDaysMax publishedAt createdAt")
    .populate({ path: "categoryId", select: "name isActive" })
    .sort(sortQuery)
    .skip(skip)
    .limit(parsed.limit);

  if (parsed.search && !parsed.sort) {
    productsQuery.select({ score: { $meta: "textScore" } });
  }

  const [total, products] = await Promise.all([
    ProductModel.countDocuments(query),
    productsQuery.lean(),
  ]);

  return {
    products: products.map(mapProductToCardDTO),
    total,
    page: parsed.page,
    limit: parsed.limit,
    totalPages: Math.ceil(total / parsed.limit),
  };
}

function isBoundedCacheableCatalogQuery(filters: CatalogFilters) {
  return !filters.search
    && !filters.material
    && !filters.color
    && filters.minPrice === undefined
    && filters.maxPrice === undefined
    && (filters.page ?? 1) <= 10
    && (filters.limit ?? 12) <= 12;
}

export async function listCatalogProducts(
  filters: CatalogFilters
): Promise<PaginatedCatalogProducts> {
  const parsed = catalogFiltersSchema.parse(filters);
  const resolvedCategoryIds = parsed.categorySlug
    ? [(await getCategoryBySlug(parsed.categorySlug)).id]
    : (await getCategoryNavigation()).map((category) => category.id);

  if (!isBoundedCacheableCatalogQuery(parsed)) {
    return rawListCatalogProducts(parsed, resolvedCategoryIds);
  }

  const cacheKey = JSON.stringify(parsed);
  const tags: string[] = [CACHE_TAGS.products, CACHE_TAGS.categories];
  if (parsed.categorySlug) tags.push(CACHE_TAGS.category(parsed.categorySlug));

  return unstable_cache(
    async (resolvedFilters: CatalogFilters, categoryIds: string[]) =>
      rawListCatalogProducts(resolvedFilters, categoryIds),
    ["catalog-products", cacheKey],
    { tags, revalidate: 900 }
  )(parsed, resolvedCategoryIds);
}

export async function rawGetAvailableFilterMetadata(): Promise<{
  materials: string[];
  colors: string[];
}> {
  await connectMongoose();

  const activeCategories = await rawGetCategoryNavigation();
  const activeCategoryIds = activeCategories.map((c) => c.id);

  const query = {
    status: "ACTIVE",
    categoryId: { $in: activeCategoryIds },
  };

  const [materials, colors] = await Promise.all([
    ProductModel.distinct("materials", query),
    ProductModel.distinct("colors", query),
  ]);

  return {
    materials: (materials as string[]).filter(Boolean).sort(),
    colors: (colors as string[]).filter(Boolean).sort(),
  };
}

export const getAvailableFilterMetadata = unstable_cache(
  async () => rawGetAvailableFilterMetadata(),
  ["available-filter-metadata"],
  {
    tags: [CACHE_TAGS.products],
    revalidate: 3600
  }
);

export async function rawGetPublicProductSlugs(): Promise<string[]> {
  await connectMongoose();
  const activeCategories = await rawGetCategoryNavigation();
  const products = await ProductModel.find({
    status: "ACTIVE",
    categoryId: { $in: activeCategories.map((category) => category.id) },
  })
    .select("slug")
    .sort({ publishedAt: -1, createdAt: -1 })
    .lean();

  return products.map((product) => product.slug);
}

export const getPublicProductSlugs = unstable_cache(
  rawGetPublicProductSlugs,
  ["public-product-slugs"],
  {
    tags: [CACHE_TAGS.products, CACHE_TAGS.categories],
    revalidate: 3600,
  }
);

