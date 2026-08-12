import "server-only";

import { Types } from "mongoose";

import { InvalidStateError, NotFoundError } from "@/lib/errors/app-error";
import { connectMongoose } from "@/lib/mongoose";
import { CategoryModel } from "@/modules/categories/model";
import { ProductModel } from "@/modules/products/model";
import type { MediaAsset } from "@/modules/uploads/types";
import type { ProductCardDTO } from "./dto";

export type CartCatalogIssue =
  | "PRODUCT_UNAVAILABLE"
  | "VARIANT_UNAVAILABLE"
  | "OUT_OF_STOCK"
  | "INVALID_PREPARATION_TIME";

export interface CartCatalogRequest {
  productId: string;
  variantId: string;
}

export interface PurchasableCartVariantDTO {
  productId: string;
  productName: string;
  productSlug: string;
  variantId: string;
  variantLabel: string;
  sku: string;
  priceAmount: number;
  currency: "EGP";
  fulfillmentType: "READY_MADE" | "MADE_TO_ORDER";
  stockQuantity?: number;
  preparationDaysMin?: number;
  preparationDaysMax?: number;
  personalizationAvailable: boolean;
  primaryImage?: MediaAsset;
  available: boolean;
  issue?: CartCatalogIssue;
}

interface CommerceProductRecord {
  _id: Types.ObjectId;
  name: string;
  slug: string;
  categoryId: Types.ObjectId;
  status: "DRAFT" | "ACTIVE" | "ARCHIVED";
  fulfillmentType: "READY_MADE" | "MADE_TO_ORDER";
  basePriceAmount: number;
  currency: "EGP";
  personalizationAvailable: boolean;
  preparationDaysMin?: number;
  preparationDaysMax?: number;
  images: MediaAsset[];
  variants: Array<{
    _id: Types.ObjectId;
    sku: string;
    label: string;
    priceAmount?: number;
    stockQuantity?: number;
    isActive: boolean;
  }>;
}

function unavailableRequest(
  request: CartCatalogRequest,
  issue: CartCatalogIssue,
): PurchasableCartVariantDTO {
  return {
    productId: request.productId,
    productName: "Unavailable product",
    productSlug: "",
    variantId: request.variantId,
    variantLabel: "Unavailable option",
    sku: "",
    priceAmount: 0,
    currency: "EGP",
    fulfillmentType: "READY_MADE",
    personalizationAvailable: false,
    available: false,
    issue,
  };
}

function mapCommerceProduct(
  product: CommerceProductRecord,
  request: CartCatalogRequest,
  categoryIsActive: boolean,
): PurchasableCartVariantDTO {
  const variant = product.variants.find(
    (candidate) => candidate._id.toString() === request.variantId,
  );

  if (!variant) {
    return {
      ...unavailableRequest(request, "VARIANT_UNAVAILABLE"),
      productName: product.name,
      productSlug: product.slug,
      primaryImage: product.images[0],
    };
  }

  let issue: CartCatalogIssue | undefined;
  if (product.status !== "ACTIVE" || !categoryIsActive) {
    issue = "PRODUCT_UNAVAILABLE";
  } else if (!variant.isActive) {
    issue = "VARIANT_UNAVAILABLE";
  } else if (
    product.fulfillmentType === "READY_MADE" &&
    (variant.stockQuantity ?? 0) <= 0
  ) {
    issue = "OUT_OF_STOCK";
  } else if (
    product.fulfillmentType === "MADE_TO_ORDER" &&
    (!product.preparationDaysMin ||
      !product.preparationDaysMax ||
      product.preparationDaysMin > product.preparationDaysMax)
  ) {
    issue = "INVALID_PREPARATION_TIME";
  }

  return {
    productId: product._id.toString(),
    productName: product.name,
    productSlug: product.slug,
    variantId: variant._id.toString(),
    variantLabel: variant.label,
    sku: variant.sku,
    priceAmount: variant.priceAmount ?? product.basePriceAmount,
    currency: "EGP",
    fulfillmentType: product.fulfillmentType,
    stockQuantity:
      product.fulfillmentType === "READY_MADE"
        ? variant.stockQuantity ?? 0
        : undefined,
    preparationDaysMin: product.preparationDaysMin,
    preparationDaysMax: product.preparationDaysMax,
    personalizationAvailable: product.personalizationAvailable,
    primaryImage: product.images[0],
    available: !issue,
    issue,
  };
}

/** Uncached purchasing truth for private cart and checkout reads. */
export async function listProductsForCart(
  requests: CartCatalogRequest[],
): Promise<PurchasableCartVariantDTO[]> {
  if (requests.length === 0) return [];

  await connectMongoose();
  const validProductIds = requests
    .map((request) => request.productId)
    .filter((id) => Types.ObjectId.isValid(id))
    .map((id) => new Types.ObjectId(id));

  const products = await ProductModel.find({ _id: { $in: validProductIds } })
    .select(
      "name slug categoryId status fulfillmentType basePriceAmount currency personalizationAvailable preparationDaysMin preparationDaysMax images variants",
    )
    .lean<CommerceProductRecord[]>();
  const activeCategories = await CategoryModel.find({
    _id: { $in: products.map((product) => product.categoryId) },
    isActive: true,
  })
    .select("_id")
    .lean<Array<{ _id: Types.ObjectId }>>();
  const activeCategoryIds = new Set(
    activeCategories.map((category) => category._id.toString()),
  );
  const productsById = new Map(
    products.map((product) => [product._id.toString(), product]),
  );

  return requests.map((request) => {
    const product = productsById.get(request.productId);
    return product
      ? mapCommerceProduct(
          product,
          request,
          activeCategoryIds.has(product.categoryId.toString()),
        )
      : unavailableRequest(request, "PRODUCT_UNAVAILABLE");
  });
}

export async function getPurchasableVariant(
  productId: string,
  variantId: string,
): Promise<PurchasableCartVariantDTO> {
  if (!Types.ObjectId.isValid(productId) || !Types.ObjectId.isValid(variantId)) {
    throw new NotFoundError("Product option not found");
  }

  const [result] = await listProductsForCart([{ productId, variantId }]);
  if (!result || result.issue === "PRODUCT_UNAVAILABLE" || result.issue === "VARIANT_UNAVAILABLE") {
    throw new NotFoundError("Product option not found");
  }
  if (!result.available) {
    throw new InvalidStateError(
      result.issue === "OUT_OF_STOCK"
        ? "This product option is out of stock"
        : "This made-to-order option is temporarily unavailable",
    );
  }
  return result;
}

interface WishlistProductRecord extends CommerceProductRecord {
  isFeatured: boolean;
}

/** Uncached public product truth for private wishlists. Missing or hidden products map to undefined. */
export async function listProductsForWishlist(
  productIds: string[],
): Promise<Array<ProductCardDTO | undefined>> {
  if (productIds.length === 0) return [];

  await connectMongoose();
  const validIds = productIds
    .filter((id) => Types.ObjectId.isValid(id))
    .map((id) => new Types.ObjectId(id));
  const products = await ProductModel.find({ _id: { $in: validIds }, status: "ACTIVE" })
    .select(
      "name slug categoryId fulfillmentType basePriceAmount currency images variants isFeatured preparationDaysMin preparationDaysMax",
    )
    .lean<WishlistProductRecord[]>();
  const categories = await CategoryModel.find({
    _id: { $in: products.map((product) => product.categoryId) },
    isActive: true,
  })
    .select("_id name")
    .lean<Array<{ _id: Types.ObjectId; name: string }>>();
  const categoryNames = new Map(
    categories.map((category) => [category._id.toString(), category.name]),
  );
  const productsById = new Map(products.map((product) => [product._id.toString(), product]));

  return productIds.map((productId) => {
    const product = productsById.get(productId);
    if (!product) return undefined;
    const categoryName = categoryNames.get(product.categoryId.toString());
    if (!categoryName) return undefined;
    return {
      id: product._id.toString(),
      name: product.name,
      slug: product.slug,
      categoryId: product.categoryId.toString(),
      categoryName,
      fulfillmentType: product.fulfillmentType,
      basePriceAmount: product.basePriceAmount,
      currency: "EGP",
      images: product.images,
      isFeatured: product.isFeatured,
      preparationDaysMin: product.preparationDaysMin,
      preparationDaysMax: product.preparationDaysMax,
      inStock:
        product.fulfillmentType === "MADE_TO_ORDER" ||
        product.variants.some(
          (variant) => variant.isActive && (variant.stockQuantity ?? 0) > 0,
        ),
    };
  });
}

export async function getWishableProduct(productId: string): Promise<ProductCardDTO> {
  if (!Types.ObjectId.isValid(productId)) throw new NotFoundError("Product not found");
  const [product] = await listProductsForWishlist([productId]);
  if (!product) throw new NotFoundError("Product not found");
  return product;
}
