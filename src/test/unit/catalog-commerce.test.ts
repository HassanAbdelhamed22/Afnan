import { beforeEach, describe, expect, it, vi } from "vitest";
import { Types } from "mongoose";

const mocks = vi.hoisted(() => ({
  connectMongoose: vi.fn(),
  findProducts: vi.fn(),
  findCategories: vi.fn(),
}));

vi.mock("@/lib/mongoose", () => ({ connectMongoose: mocks.connectMongoose }));
vi.mock("@/modules/products/model", () => ({
  ProductModel: { find: mocks.findProducts },
}));
vi.mock("@/modules/categories/model", () => ({
  CategoryModel: { find: mocks.findCategories },
}));

import {
  getPurchasableVariant,
  listProductsForCart,
  listProductsForWishlist,
} from "@/modules/catalog/commerce";

const productId = new Types.ObjectId("507f1f77bcf86cd799439011");
const variantId = new Types.ObjectId("507f191e810c19729de860ea");
const categoryId = new Types.ObjectId("65af191e810c19729de860ea");

function queryResult<T>(value: T) {
  return { select: vi.fn(() => ({ lean: vi.fn(async () => value) })) };
}

function product(overrides: Record<string, unknown> = {}) {
  return {
    _id: productId,
    name: "Handmade Bag",
    slug: "handmade-bag",
    categoryId,
    status: "ACTIVE",
    fulfillmentType: "READY_MADE",
    basePriceAmount: 25000,
    currency: "EGP",
    personalizationAvailable: false,
    images: [],
    variants: [
      {
        _id: variantId,
        sku: "BAG-1",
        label: "Natural",
        priceAmount: 27500,
        stockQuantity: 3,
        isActive: true,
      },
    ],
    ...overrides,
  };
}

describe("commerce catalog truth", () => {
  beforeEach(() => {
    vi.clearAllMocks();
    mocks.connectMongoose.mockResolvedValue(undefined);
    mocks.findProducts.mockReturnValue(queryResult([product()]));
    mocks.findCategories.mockReturnValue(queryResult([{ _id: categoryId, name: "Bags" }]));
  });

  it("returns current variant price and stock without shared caching", async () => {
    const [result] = await listProductsForCart([
      { productId: productId.toString(), variantId: variantId.toString() },
    ]);

    expect(mocks.connectMongoose).toHaveBeenCalledOnce();
    expect(result).toMatchObject({
      priceAmount: 27500,
      stockQuantity: 3,
      available: true,
    });
  });

  it("rejects products whose category is inactive", async () => {
    mocks.findCategories.mockReturnValue(queryResult([]));

    await expect(
      getPurchasableVariant(productId.toString(), variantId.toString()),
    ).rejects.toThrow("Product option not found");
  });

  it("reports out-of-stock options as an invalid state", async () => {
    mocks.findProducts.mockReturnValue(
      queryResult([
        product({
          variants: [
            {
              _id: variantId,
              sku: "BAG-1",
              label: "Natural",
              stockQuantity: 0,
              isActive: true,
            },
          ],
        }),
      ]),
    );

    await expect(
      getPurchasableVariant(productId.toString(), variantId.toString()),
    ).rejects.toThrow("out of stock");
  });

  it("preserves request order and marks missing products unavailable", async () => {
    const missingId = "65bf191e810c19729de860ea";
    const results = await listProductsForCart([
      { productId: missingId, variantId: variantId.toString() },
      { productId: productId.toString(), variantId: variantId.toString() },
    ]);

    expect(results.map((result) => result.productId)).toEqual([
      missingId,
      productId.toString(),
    ]);
    expect(results[0].issue).toBe("PRODUCT_UNAVAILABLE");
  });

  it("maps current public product cards for wishlists", async () => {
    const [result] = await listProductsForWishlist([productId.toString()]);

    expect(result).toMatchObject({
      id: productId.toString(),
      name: "Handmade Bag",
      categoryName: "Bags",
      basePriceAmount: 25000,
      inStock: true,
    });
  });

  it("hides wishlist products from inactive categories", async () => {
    mocks.findCategories.mockReturnValue(queryResult([]));

    const [result] = await listProductsForWishlist([productId.toString()]);

    expect(result).toBeUndefined();
  });
});
