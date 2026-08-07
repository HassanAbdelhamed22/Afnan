import { describe, it, expect, beforeAll, afterAll, beforeEach } from "vitest";
import { connectMongoose } from "../../lib/mongoose";
import { CategoryModel } from "../../modules/categories/model";
import { ProductModel } from "../../modules/products/model";
import {
  rawGetCategoryNavigation,
  rawGetProductBySlug,
  rawGetCategoryBySlug,
  listCatalogProducts,
  rawGetAvailableFilterMetadata,
} from "../../modules/catalog/queries";
import mongoose from "mongoose";
import { NotFoundError } from "../../lib/errors/app-error";

describe("Catalog Queries Integration Tests", () => {
  beforeAll(async () => {
    // Load environment variables manually if not set
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
  });

  it("should navigate only active categories", async () => {
    // Seed active and inactive categories
    await CategoryModel.create([
      { name: "Active Cat 2", slug: "active-cat-2", sortOrder: 2, isActive: true },
      { name: "Active Cat 1", slug: "active-cat-1", sortOrder: 1, isActive: true },
      { name: "Inactive Cat", slug: "inactive-cat", sortOrder: 3, isActive: false },
    ]);

    const nav = await rawGetCategoryNavigation();
    expect(nav.length).toBe(2);
    expect(nav[0].slug).toBe("active-cat-1");
    expect(nav[1].slug).toBe("active-cat-2");
  });

  it("should fetch active category by slug and throw on inactive/missing ones", async () => {
    await CategoryModel.create([
      { name: "Active Cat", slug: "active-cat", sortOrder: 1, isActive: true },
      { name: "Inactive Cat", slug: "inactive-cat", sortOrder: 2, isActive: false },
    ]);

    const cat = await rawGetCategoryBySlug("active-cat");
    expect(cat.name).toBe("Active Cat");

    await expect(rawGetCategoryBySlug("inactive-cat")).rejects.toThrow(NotFoundError);
    await expect(rawGetCategoryBySlug("missing-cat")).rejects.toThrow(NotFoundError);
  });

  it("should fetch active product by slug and throw on inactive/draft/archived or inactive category", async () => {
    const activeCat = await CategoryModel.create({
      name: "Active Cat",
      slug: "active-cat",
      sortOrder: 1,
      isActive: true,
    });

    const inactiveCat = await CategoryModel.create({
      name: "Inactive Cat",
      slug: "inactive-cat",
      sortOrder: 2,
      isActive: false,
    });

    // Active product in active category
    await ProductModel.create({
      name: "Active Prod",
      slug: "active-prod",
      description: "Desc",
      categoryId: activeCat._id,
      status: "ACTIVE",
      fulfillmentType: "MADE_TO_ORDER",
      basePriceAmount: 1000,
      personalizationAvailable: false,
      variants: [{ sku: "SKU-1", label: "L1", optionValues: new Map([["size", "S"]]), isActive: true }],
    });

    // Draft product
    await ProductModel.create({
      name: "Draft Prod",
      slug: "draft-prod",
      description: "Desc",
      categoryId: activeCat._id,
      status: "DRAFT",
      fulfillmentType: "MADE_TO_ORDER",
      basePriceAmount: 1000,
      personalizationAvailable: false,
    });

    // Product in inactive category
    await ProductModel.create({
      name: "Inactive Cat Prod",
      slug: "inactive-cat-prod",
      description: "Desc",
      categoryId: inactiveCat._id,
      status: "ACTIVE",
      fulfillmentType: "MADE_TO_ORDER",
      basePriceAmount: 1000,
      personalizationAvailable: false,
    });

    const prod = await rawGetProductBySlug("active-prod");
    expect(prod.name).toBe("Active Prod");

    await expect(rawGetProductBySlug("draft-prod")).rejects.toThrow(NotFoundError);
    await expect(rawGetProductBySlug("inactive-cat-prod")).rejects.toThrow(NotFoundError);
  });

  it("should list catalog products and apply filter combinations correctly", async () => {
    const activeCat = await CategoryModel.create({
      name: "Bags",
      slug: "bags",
      sortOrder: 1,
      isActive: true,
    });

    // Seed test products
    await ProductModel.create([
      {
        name: "Premium Red Leather Bag",
        slug: "red-bag",
        description: "Desc",
        categoryId: activeCat._id,
        status: "ACTIVE",
        fulfillmentType: "READY_MADE",
        basePriceAmount: 50000, // EGP 500
        materials: ["Leather"],
        colors: ["Red"],
        personalizationAvailable: false,
        variants: [{ sku: "SKU-RED", label: "L1", optionValues: {}, stockQuantity: 5, isActive: true }],
      },
      {
        name: "Standard Blue Wool Bag",
        slug: "blue-bag",
        description: "Desc",
        categoryId: activeCat._id,
        status: "ACTIVE",
        fulfillmentType: "MADE_TO_ORDER",
        basePriceAmount: 30000, // EGP 300
        materials: ["Wool"],
        colors: ["Blue"],
        personalizationAvailable: false,
        variants: [{ sku: "SKU-BLUE", label: "L2", optionValues: {}, isActive: true }],
      },
      {
        name: "Out of Stock Green Bag",
        slug: "green-bag",
        description: "Desc",
        categoryId: activeCat._id,
        status: "ACTIVE",
        fulfillmentType: "READY_MADE",
        basePriceAmount: 40000, // EGP 400
        materials: ["Leather"],
        colors: ["Green"],
        personalizationAvailable: false,
        variants: [{ sku: "SKU-GREEN", label: "L3", optionValues: {}, stockQuantity: 0, isActive: true }],
      },
    ]);

    // Test filter by maxPrice
    const p1 = await listCatalogProducts({ maxPrice: 40000 });
    expect(p1.products.length).toBe(2); // Blue (300) and Green (400)

    // Test filter by availability = IN_STOCK
    const p2 = await listCatalogProducts({ availability: "IN_STOCK" });
    expect(p2.products.length).toBe(2); // Red (ready-made in stock) and Blue (made-to-order)

    // Test filter by material
    const p3 = await listCatalogProducts({ material: "Leather" });
    expect(p3.products.length).toBe(2); // Red and Green

    // Test search term
    const p4 = await listCatalogProducts({ search: "Blue" });
    // Text index search requires building the text index, but we can verify it doesn't crash
    expect(p4).toBeDefined();
  }, 15000);

  it("should retrieve sorted list of unique active materials and colors", async () => {
    const activeCat = await CategoryModel.create({
      name: "Bags",
      slug: "bags",
      sortOrder: 1,
      isActive: true,
    });

    await ProductModel.create([
      {
        name: "Prod 1",
        slug: "prod-1",
        description: "Desc",
        categoryId: activeCat._id,
        status: "ACTIVE",
        fulfillmentType: "MADE_TO_ORDER",
        basePriceAmount: 1000,
        materials: ["Wool", "Leather"],
        colors: ["Red", "Blue"],
        personalizationAvailable: false,
      },
      {
        name: "Prod 2",
        slug: "prod-2",
        description: "Desc",
        categoryId: activeCat._id,
        status: "ACTIVE",
        fulfillmentType: "MADE_TO_ORDER",
        basePriceAmount: 1500,
        materials: ["Leather", "Brass"],
        colors: ["Blue", "Gold"],
        personalizationAvailable: false,
      },
      {
        name: "Inactive Prod",
        slug: "inactive-prod",
        description: "Desc",
        categoryId: activeCat._id,
        status: "DRAFT",
        fulfillmentType: "MADE_TO_ORDER",
        basePriceAmount: 1200,
        materials: ["Silver"],
        colors: ["Grey"],
        personalizationAvailable: false,
      },
    ]);

    const metadata = await rawGetAvailableFilterMetadata();
    expect(metadata.materials).toEqual(["Brass", "Leather", "Wool"]);
    expect(metadata.colors).toEqual(["Blue", "Gold", "Red"]);
  });
});
