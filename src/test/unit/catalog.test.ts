import { describe, it, expect } from "vitest";
import {
  mapCategoryToDTO,
  mapProductToCardDTO,
  mapProductToDetailDTO,
  type DatabaseProduct,
  type DatabaseCategory,
} from "../../modules/catalog/queries";
import { Types } from "mongoose";

describe("Catalog Mapping & DTO Resolution", () => {
  describe("mapCategoryToDTO", () => {
    it("should correctly map Category document to CategoryDTO", () => {
      const mockCategory: DatabaseCategory = {
        _id: new Types.ObjectId(),
        name: "Test Clay Pot",
        slug: "test-clay-pot",
        description: "A wonderful test pot",
        image: {
          url: "http://example.com/pot.jpg",
          publicId: "pot-123",
          width: 200,
          height: 300,
        },
        sortOrder: 5,
        isActive: true,
      };

      const dto = mapCategoryToDTO(mockCategory);
      expect(dto).toEqual({
        id: mockCategory._id.toString(),
        name: "Test Clay Pot",
        slug: "test-clay-pot",
        description: "A wonderful test pot",
        image: {
          url: "http://example.com/pot.jpg",
          publicId: "pot-123",
          width: 200,
          height: 300,
        },
        sortOrder: 5,
      });
    });
  });

  describe("mapProductToCardDTO", () => {
    it("should resolve inStock for READY_MADE products based on active variants", () => {
      const mockProduct = {
        _id: new Types.ObjectId(),
        name: "Test Pot",
        slug: "test-pot",
        categoryId: new Types.ObjectId(),
        fulfillmentType: "READY_MADE",
        basePriceAmount: 15000,
        currency: "EGP",
        images: [{ url: "http://example.com/image.jpg", publicId: "img1" }],
        isFeatured: true,
        variants: [
          { isActive: true, stockQuantity: 5 },
          { isActive: false, stockQuantity: 10 }, // inactive, shouldn't be counted
        ],
      };

      const dto = mapProductToCardDTO(mockProduct as unknown as DatabaseProduct);
      expect(dto.inStock).toBe(true);

      const outOfStockProduct = {
        ...mockProduct,
        variants: [
          { isActive: true, stockQuantity: 0 },
          { isActive: false, stockQuantity: 10 },
        ],
      };
      const dto2 = mapProductToCardDTO(outOfStockProduct as unknown as DatabaseProduct);
      expect(dto2.inStock).toBe(false);
    });

    it("should always return inStock = true for MADE_TO_ORDER products", () => {
      const mockProduct = {
        _id: new Types.ObjectId(),
        name: "Test Wool",
        slug: "test-wool",
        categoryId: new Types.ObjectId(),
        fulfillmentType: "MADE_TO_ORDER",
        basePriceAmount: 30000,
        currency: "EGP",
        images: [],
        isFeatured: false,
        variants: [{ isActive: true, stockQuantity: 0 }],
      };

      const dto = mapProductToCardDTO(mockProduct as unknown as DatabaseProduct);
      expect(dto.inStock).toBe(true);
    });
  });

  describe("mapProductToDetailDTO", () => {
    it("should resolve variant price override and omit stockQuantity for MADE_TO_ORDER", () => {
      const mockCategoryId = new Types.ObjectId();
      const mockProduct = {
        _id: new Types.ObjectId(),
        name: "Custom Crochet",
        slug: "custom-crochet",
        description: "Test description",
        categoryId: mockCategoryId,
        fulfillmentType: "MADE_TO_ORDER",
        basePriceAmount: 50000, // EGP 500
        currency: "EGP",
        materials: ["Wool"],
        colors: ["Blue"],
        tags: ["crochet"],
        dimensions: { width: 10, height: 10, depth: 10, unit: "cm" },
        personalizationAvailable: true,
        preparationDaysMin: 3,
        preparationDaysMax: 7,
        images: [],
        variants: [
          {
            _id: new Types.ObjectId(),
            sku: "CUST-BLU",
            label: "Blue Custom",
            optionValues: new Map([["color", "Blue"]]),
            isActive: true,
            stockQuantity: 10, // should be omitted since fulfillment is MADE_TO_ORDER
          },
          {
            _id: new Types.ObjectId(),
            sku: "CUST-RED",
            label: "Red Custom",
            optionValues: new Map([["color", "Red"]]),
            priceAmount: 60000, // Override: EGP 600
            isActive: true,
            stockQuantity: 0,
          },
          {
            _id: new Types.ObjectId(),
            sku: "CUST-INACTIVE",
            label: "Inactive Custom",
            optionValues: new Map([["color", "Gray"]]),
            isActive: false,
          },
        ],
        isFeatured: false,
      };

      const dto = mapProductToDetailDTO(mockProduct as unknown as DatabaseProduct);

      // Verify inactive variant is filtered out
      expect(dto.variants.length).toBe(2);

      // Verify resolved prices
      const variant1 = dto.variants.find((v) => v.sku === "CUST-BLU");
      expect(variant1?.priceAmount).toBe(50000); // base fallback
      expect(variant1?.stockQuantity).toBeUndefined(); // omitted

      const variant2 = dto.variants.find((v) => v.sku === "CUST-RED");
      expect(variant2?.priceAmount).toBe(60000); // override
      expect(variant2?.stockQuantity).toBeUndefined(); // omitted
    });

    it("should expose stockQuantity for READY_MADE products", () => {
      const mockCategoryId = new Types.ObjectId();
      const mockProduct = {
        _id: new Types.ObjectId(),
        name: "Ready Made Bag",
        slug: "ready-made-bag",
        description: "Test description",
        categoryId: mockCategoryId,
        fulfillmentType: "READY_MADE",
        basePriceAmount: 40000,
        currency: "EGP",
        images: [],
        variants: [
          {
            _id: new Types.ObjectId(),
            sku: "BAG-SM",
            label: "Small",
            optionValues: { size: "Small" },
            isActive: true,
            stockQuantity: 4,
          },
        ],
        isFeatured: false,
      };

      const dto = mapProductToDetailDTO(mockProduct as unknown as DatabaseProduct);
      expect(dto.variants[0].stockQuantity).toBe(4);
    });
  });
});
