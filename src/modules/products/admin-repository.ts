import "server-only";

import { isValidObjectId, Types, type QueryFilter } from "mongoose";

import { ConflictError, InvalidStateError, NotFoundError } from "@/lib/errors/app-error";
import { connectMongoose } from "@/lib/mongoose";
import { CategoryModel } from "@/modules/categories/model";

import type { AdminProductDTO, AdminProductListItemDTO, PaginatedAdminProductsDTO } from "./admin-dto";
import type { ProductAdminFilters, ProductAdminInput } from "./admin-schemas";
import { ProductModel, type IProduct } from "./model";

function escapeRegex(value: string) {
  return value.replace(/[.*+?^${}()|[\]\\]/g, "\\$&");
}

function mapOptions(value: Map<string, string> | Record<string, string>) {
  return value instanceof Map ? Object.fromEntries(value) : { ...value };
}

function mapListProduct(product: IProduct & { categoryId: Types.ObjectId & { name?: string } }): AdminProductListItemDTO {
  const totalStock = product.fulfillmentType === "READY_MADE"
    ? product.variants.reduce((total, variant) => total + (variant.stockQuantity ?? 0), 0)
    : undefined;
  return {
    id: product._id.toString(),
    name: product.name,
    slug: product.slug,
    categoryName: product.categoryId.name ?? "Unavailable category",
    status: product.status,
    fulfillmentType: product.fulfillmentType,
    basePriceAmount: product.basePriceAmount,
    activeVariantCount: product.variants.filter((variant) => variant.isActive).length,
    totalStock,
    updatedAt: product.updatedAt.toISOString(),
  };
}

export async function listAdminProducts(filters: ProductAdminFilters): Promise<PaginatedAdminProductsDTO> {
  await connectMongoose();
  const query: QueryFilter<IProduct> = {};
  if (filters.status !== "ALL") query.status = filters.status;
  if (filters.fulfillmentType !== "ALL") query.fulfillmentType = filters.fulfillmentType;
  if (filters.categoryId !== "ALL") query.categoryId = new Types.ObjectId(filters.categoryId);
  if (filters.search) {
    const safe = new RegExp(escapeRegex(filters.search), "i");
    query.$or = [{ name: safe }, { slug: safe }, { "variants.sku": safe }];
  }
  if (filters.availability === "IN_STOCK") query.variants = { $elemMatch: { isActive: true, stockQuantity: { $gt: 0 } } };
  if (filters.availability === "OUT_OF_STOCK") query.$and = [{ fulfillmentType: "READY_MADE" }, { variants: { $not: { $elemMatch: { isActive: true, stockQuantity: { $gt: 0 } } } } }];

  const sorts = {
    newest: { updatedAt: -1 as const, _id: -1 as const },
    name_asc: { name: 1 as const, _id: 1 as const },
    price_asc: { basePriceAmount: 1 as const, _id: 1 as const },
    price_desc: { basePriceAmount: -1 as const, _id: 1 as const },
  };
  const skip = (filters.page - 1) * filters.limit;
  const [records, total] = await Promise.all([
    ProductModel.find(query)
      .select("name slug categoryId status fulfillmentType basePriceAmount variants updatedAt")
      .populate("categoryId", "name")
      .sort(sorts[filters.sort])
      .skip(skip)
      .limit(filters.limit)
      .lean(),
    ProductModel.countDocuments(query),
  ]);
  return {
    products: records.map((record) => mapListProduct(record as unknown as IProduct & { categoryId: Types.ObjectId & { name?: string } })),
    total,
    page: filters.page,
    totalPages: Math.max(1, Math.ceil(total / filters.limit)),
  };
}

export async function getAdminProduct(productId: string): Promise<AdminProductDTO> {
  if (!isValidObjectId(productId)) throw new NotFoundError("Product not found");
  await connectMongoose();
  const product = await ProductModel.findById(productId).populate("categoryId", "name").lean();
  if (!product) throw new NotFoundError("Product not found");
  const list = mapListProduct(product as unknown as IProduct & { categoryId: Types.ObjectId & { name?: string } });
  const category = product.categoryId as unknown as { _id: Types.ObjectId };
  return {
    ...list,
    description: product.description,
    categoryId: category._id.toString(),
    materials: product.materials,
    colors: product.colors,
    tags: product.tags,
    dimensions: product.dimensions,
    personalizationAvailable: product.personalizationAvailable,
    personalizationInstructions: product.personalizationInstructions,
    preparationDaysMin: product.preparationDaysMin,
    preparationDaysMax: product.preparationDaysMax,
    careInstructions: product.careInstructions,
    variants: product.variants.map((variant: IProduct["variants"][number]) => ({
      id: variant._id.toString(), sku: variant.sku, label: variant.label,
      optionValues: mapOptions(variant.optionValues), priceAmount: variant.priceAmount,
      stockQuantity: variant.stockQuantity, isActive: variant.isActive,
    })),
    isFeatured: product.isFeatured,
    imageCount: product.images.length,
  };
}

function assertPublishable(product: Pick<IProduct, "name" | "description" | "categoryId" | "basePriceAmount" | "images" | "variants" | "fulfillmentType" | "preparationDaysMin" | "preparationDaysMax">) {
  if (!product.name || !product.description || !product.categoryId || !Number.isSafeInteger(product.basePriceAmount) || product.basePriceAmount < 0) throw new InvalidStateError("Product details are incomplete");
  if (!product.images.length) throw new InvalidStateError("Add a primary product image before publishing");
  if (!product.variants.some((variant) => variant.isActive)) throw new InvalidStateError("Add an active variant before publishing");
  if (product.fulfillmentType === "READY_MADE" && product.variants.some((variant) => variant.stockQuantity === undefined)) throw new InvalidStateError("Ready-made variants require stock quantities");
  if (product.fulfillmentType === "MADE_TO_ORDER" && (!product.preparationDaysMin || !product.preparationDaysMax || product.preparationDaysMin > product.preparationDaysMax)) throw new InvalidStateError("Made-to-order preparation time is invalid");
}

export async function saveAdminProduct(input: ProductAdminInput) {
  await connectMongoose();
  const category = await CategoryModel.findOne({ _id: input.categoryId, isActive: true }).select("_id").lean();
  if (!category) throw new InvalidStateError("Choose an active category");
  const duplicate = await ProductModel.findOne({
    ...(input.id ? { _id: { $ne: input.id } } : {}),
    $or: [{ slug: input.slug }, { "variants.sku": { $in: input.variants.map((variant) => variant.sku) } }],
  }).select("_id").lean();
  if (duplicate) throw new ConflictError("A product slug or variant SKU is already in use");

  const existing = input.id ? await ProductModel.findById(input.id) : null;
  if (input.id && !existing) throw new NotFoundError("Product not found");
  const previous = existing ? { slug: existing.slug, categoryId: existing.categoryId.toString() } : undefined;
  const target = existing ?? new ProductModel({ images: [] });
  target.set({
    name: input.name, slug: input.slug, description: input.description, categoryId: category._id,
    status: input.status, fulfillmentType: input.fulfillmentType, basePriceAmount: input.basePriceAmount,
    currency: "EGP", materials: input.materials, colors: input.colors, tags: input.tags,
    dimensions: input.dimensions, personalizationAvailable: input.personalizationAvailable,
    personalizationInstructions: input.personalizationAvailable ? input.personalizationInstructions : undefined,
    preparationDaysMin: input.fulfillmentType === "MADE_TO_ORDER" ? input.preparationDaysMin : undefined,
    preparationDaysMax: input.fulfillmentType === "MADE_TO_ORDER" ? input.preparationDaysMax : undefined,
    careInstructions: input.careInstructions,
    variants: input.variants.map((variant) => ({
      ...(variant.id ? { _id: new Types.ObjectId(variant.id) } : {}), sku: variant.sku, label: variant.label,
      optionValues: variant.optionValues, priceAmount: variant.priceAmount,
      stockQuantity: input.fulfillmentType === "READY_MADE" ? variant.stockQuantity : undefined,
      isActive: variant.isActive,
    })),
    isFeatured: input.isFeatured,
  });
  if (input.status === "ACTIVE") {
    assertPublishable(target);
    target.publishedAt ??= new Date();
  }
  await target.save();
  return { id: target._id.toString(), slug: target.slug, categoryId: target.categoryId.toString(), previous };
}

export async function setAdminProductStatus(productId: string, status: "DRAFT" | "ACTIVE" | "ARCHIVED") {
  await connectMongoose();
  const product = await ProductModel.findById(productId);
  if (!product) throw new NotFoundError("Product not found");
  if (status === "ACTIVE") {
    const categoryExists = await CategoryModel.exists({ _id: product.categoryId, isActive: true });
    if (!categoryExists) throw new InvalidStateError("Activate the product category before publishing");
    assertPublishable(product);
    product.publishedAt ??= new Date();
  }
  product.status = status;
  await product.save();
  return { id: product._id.toString(), slug: product.slug, categoryId: product.categoryId.toString() };
}
