import { describe, it, expect, vi, beforeAll, afterAll, beforeEach } from "vitest";
import { connectMongoose } from "../../lib/mongoose";
import { CategoryModel } from "../../modules/categories/model";
import { ProductModel } from "../../modules/products/model";
import mongoose from "mongoose";
import {
  getCategoryNavigation,
  getHomepageCatalog,
  getProductBySlug,
  getCategoryBySlug,
  getRelatedProducts,
  listCatalogProducts,
  revalidateProductCache,
  revalidateCategoryCache,
  revalidateCatalogCache,
} from "../../modules/catalog/queries";
import { unstable_cache, updateTag } from "next/cache";

// Global cache store to simulate Next.js Data Cache
const cacheStore = new Map<string, { value: unknown; tags: string[] }>();
const tagsUpdated: string[] = [];

vi.mock("next/cache", () => {
  return {
    updateTag: vi.fn((tag: string) => {
      tagsUpdated.push(tag);
      // Evict any cache entry that has this tag
      for (const [key, entry] of cacheStore.entries()) {
        if (entry.tags.includes(tag)) {
          cacheStore.delete(key);
        }
      }
    }),
    revalidateTag: vi.fn((tag: string) => {
      tagsUpdated.push(tag);
      // Evict any cache entry that has this tag
      for (const [key, entry] of cacheStore.entries()) {
        if (entry.tags.includes(tag)) {
          cacheStore.delete(key);
        }
      }
    }),
    unstable_cache: vi.fn((fn: (...args: unknown[]) => unknown, keyParts: string[], options?: { tags?: string[]; revalidate?: number }) => {
      const cacheKey = JSON.stringify(keyParts);
      const tags = options?.tags || [];

      return async (...args: unknown[]) => {
        if (cacheStore.has(cacheKey)) {
          return cacheStore.get(cacheKey)!.value;
        }

        const result = await fn(...args);
        cacheStore.set(cacheKey, { value: result, tags });
        return result;
      };
    }),
  };
});

describe("Storefront Caching & Freshness Integration Tests", () => {
  beforeAll(async () => {
    if (!process.env.MONGODB_URI) {
      process.env.MONGODB_URI = "mongodb://127.0.0.1:27017/afnan-test";
      process.env.MONGODB_DB_NAME = "afnan-test";
    }
    await connectMongoose();
    await CategoryModel.ensureIndexes();
    await ProductModel.ensureIndexes();
  });

  afterAll(async () => {
    await mongoose.connection.close();
  });

  beforeEach(async () => {
    await CategoryModel.deleteMany({});
    await ProductModel.deleteMany({});
    cacheStore.clear();
    tagsUpdated.length = 0;
    vi.clearAllMocks();
  });

  it("should cache getCategoryNavigation and revalidate on demand", async () => {
    await CategoryModel.create({
      name: "Clay Pots",
      slug: "clay-pots",
      sortOrder: 1,
      isActive: true,
    });

    // 1. First fetch
    const nav1 = await getCategoryNavigation();
    expect(nav1.length).toBe(1);

    // 2. Modify database directly
    await CategoryModel.create({
      name: "Wool Scarves",
      slug: "wool-scarves",
      sortOrder: 2,
      isActive: true,
    });

    // 3. Second fetch (should return cached data, length is still 1)
    const nav2 = await getCategoryNavigation();
    expect(nav2.length).toBe(1);

    // 4. Invalidate cache
    revalidateCategoryCache("dummy-id"); // will update "categories" tag
    expect(updateTag).toHaveBeenCalledWith("categories");

    // 5. Third fetch (should return fresh data, length is 2)
    const nav3 = await getCategoryNavigation();
    expect(nav3.length).toBe(2);
  });

  it("should cache getHomepageCatalog with home, products, and categories tags", async () => {
    const cat = await CategoryModel.create({
      name: "Clay Pots",
      slug: "clay-pots",
      sortOrder: 1,
      isActive: true,
    });

    await ProductModel.create({
      name: "Handmade Pot",
      slug: "handmade-pot",
      description: "A pot",
      categoryId: cat._id,
      status: "ACTIVE",
      fulfillmentType: "MADE_TO_ORDER",
      basePriceAmount: 12000,
      isFeatured: true,
      publishedAt: new Date(),
    });

    // First fetch
    const catalog1 = await getHomepageCatalog(4);
    expect(catalog1.length).toBe(1);

    // Verify cache registration parameters
    expect(unstable_cache).toHaveBeenCalledWith(
      expect.any(Function),
      expect.arrayContaining(["homepage-catalog", "4"]),
      expect.objectContaining({
        tags: ["home", "products", "categories"],
        revalidate: 3600,
      })
    );

    // Modify database directly
    await ProductModel.updateMany({}, { name: "Modified Pot" });

    // Second fetch should be cached
    const catalog2 = await getHomepageCatalog(4);
    expect(catalog2[0].name).toBe("Handmade Pot");

    // Revalidate catalog
    revalidateCatalogCache();
    expect(updateTag).toHaveBeenCalledWith("home");
    expect(updateTag).toHaveBeenCalledWith("products");

    // Third fetch should be fresh
    const catalog3 = await getHomepageCatalog(4);
    expect(catalog3[0].name).toBe("Modified Pot");
  });

  it("should cache getProductBySlug with dynamic tags and revalidate correctly", async () => {
    const cat = await CategoryModel.create({
      name: "Clay Pots",
      slug: "clay-pots",
      sortOrder: 1,
      isActive: true,
    });

    const prod = await ProductModel.create({
      name: "Clay Pot 101",
      slug: "clay-pot-101",
      description: "A beautiful pot",
      categoryId: cat._id,
      status: "ACTIVE",
      fulfillmentType: "MADE_TO_ORDER",
      basePriceAmount: 15000,
    });

    // Fetch product detail
    const detail1 = await getProductBySlug("clay-pot-101");
    expect(detail1.name).toBe("Clay Pot 101");

    // Verify dynamic tag registration
    expect(unstable_cache).toHaveBeenCalledWith(
      expect.any(Function),
      expect.arrayContaining(["product-by-slug", "clay-pot-101"]),
      expect.objectContaining({
        tags: [
          `product:clay-pot-101`,
          "categories",
        ],
        revalidate: 3600,
      })
    );

    // Modify database directly
    await ProductModel.findByIdAndUpdate(prod._id, { name: "Clay Pot 101 Updated" });

    // Subsequent fetch should return cached data
    const detail2 = await getProductBySlug("clay-pot-101");
    expect(detail2.name).toBe("Clay Pot 101");

    // Revalidate product cache by ID
    revalidateProductCache(prod._id.toString(), prod.slug);
    expect(updateTag).toHaveBeenCalledWith(`product:${prod._id.toString()}`);
    expect(updateTag).toHaveBeenCalledWith(`product:${prod.slug}`);

    // Next fetch should retrieve updated name
    const detail3 = await getProductBySlug("clay-pot-101");
    expect(detail3.name).toBe("Clay Pot 101 Updated");
  });

  it("should cache getCategoryBySlug with dynamic tags and revalidate correctly", async () => {
    const cat = await CategoryModel.create({
      name: "Clay Pots",
      slug: "clay-pots",
      sortOrder: 1,
      isActive: true,
    });

    // Fetch category detail
    const detail1 = await getCategoryBySlug("clay-pots");
    expect(detail1.name).toBe("Clay Pots");

    // Verify dynamic tag registration
    expect(unstable_cache).toHaveBeenCalledWith(
      expect.any(Function),
      expect.arrayContaining(["category-by-slug", "clay-pots"]),
      expect.objectContaining({
        tags: [
          `category:clay-pots`,
          "categories",
        ],
        revalidate: 3600,
      })
    );

    // Modify database directly
    await CategoryModel.findByIdAndUpdate(cat._id, { name: "Clay Pots Updated" });

    // Subsequent fetch should return cached data
    const detail2 = await getCategoryBySlug("clay-pots");
    expect(detail2.name).toBe("Clay Pots");

    // Revalidate category cache by ID
    revalidateCategoryCache(cat._id.toString(), cat.slug);
    expect(updateTag).toHaveBeenCalledWith(`category:${cat._id.toString()}`);
    expect(updateTag).toHaveBeenCalledWith(`category:${cat.slug}`);

    // Next fetch should retrieve updated name
    const detail3 = await getCategoryBySlug("clay-pots");
    expect(detail3.name).toBe("Clay Pots Updated");
  });

  it("caches bounded catalog pages and invalidates them after product writes", async () => {
    const cat = await CategoryModel.create({
      name: "Textiles",
      slug: "textiles",
      sortOrder: 1,
      isActive: true,
    });
    const product = await ProductModel.create({
      name: "Woven Runner",
      slug: "woven-runner",
      description: "A handwoven table runner",
      categoryId: cat._id,
      status: "ACTIVE",
      fulfillmentType: "MADE_TO_ORDER",
      basePriceAmount: 24000,
    });

    const first = await listCatalogProducts({ limit: 12, sort: "newest" });
    expect(first.products[0].name).toBe("Woven Runner");
    expect(unstable_cache).toHaveBeenCalledWith(
      expect.any(Function),
      expect.arrayContaining(["catalog-products"]),
      expect.objectContaining({
        tags: ["products", "categories"],
        revalidate: 900,
      }),
    );

    await ProductModel.findByIdAndUpdate(product._id, { name: "Updated Runner" });
    const cached = await listCatalogProducts({ limit: 12, sort: "newest" });
    expect(cached.products[0].name).toBe("Woven Runner");

    revalidateProductCache(product._id.toString(), product.slug);
    const fresh = await listCatalogProducts({ limit: 12, sort: "newest" });
    expect(fresh.products[0].name).toBe("Updated Runner");
  });

  it("caches related products with product and category tags", async () => {
    const cat = await CategoryModel.create({
      name: "Baskets",
      slug: "baskets",
      sortOrder: 1,
      isActive: true,
    });
    const [source, related] = await ProductModel.create([
      {
        name: "Palm Basket",
        slug: "palm-basket",
        description: "A palm basket",
        categoryId: cat._id,
        status: "ACTIVE",
        fulfillmentType: "MADE_TO_ORDER",
        basePriceAmount: 12000,
      },
      {
        name: "Reed Basket",
        slug: "reed-basket",
        description: "A reed basket",
        categoryId: cat._id,
        status: "ACTIVE",
        fulfillmentType: "MADE_TO_ORDER",
        basePriceAmount: 14000,
      },
    ]);

    const products = await getRelatedProducts(source._id.toString(), cat._id.toString(), 4);
    expect(products.map((item) => item.slug)).toEqual(["reed-basket"]);
    expect(unstable_cache).toHaveBeenCalledWith(
      expect.any(Function),
      expect.arrayContaining(["related-products", source._id.toString(), cat._id.toString(), "4"]),
      expect.objectContaining({
        tags: [
          "products",
          `product:${source._id.toString()}`,
          `category:${cat._id.toString()}`,
        ],
        revalidate: 3600,
      }),
    );

    revalidateProductCache(related._id.toString(), related.slug);
    expect(updateTag).toHaveBeenCalledWith("products");
  });
});
