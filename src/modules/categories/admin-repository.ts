import "server-only";

import { isValidObjectId, Types, type QueryFilter } from "mongoose";

import { ConflictError, InvalidStateError, NotFoundError } from "@/lib/errors/app-error";
import { connectMongoose } from "@/lib/mongoose";
import { ProductModel } from "@/modules/products/model";

import type { AdminCategoryDTO, AdminCategoryOptionDTO, PaginatedAdminCategoriesDTO } from "./admin-dto";
import type { CategoryAdminFilters, CategoryAdminInput } from "./admin-schemas";
import { CategoryModel, type ICategory } from "./model";

function escapeRegex(value: string) { return value.replace(/[.*+?^${}()|[\]\\]/g, "\\$&"); }

export async function listActiveCategoryOptions(): Promise<AdminCategoryOptionDTO[]> {
  await connectMongoose();
  const records = await CategoryModel.find({ isActive: true }).select("name").sort({ sortOrder: 1, name: 1 }).lean();
  return records.map((record) => ({ id: record._id.toString(), name: record.name }));
}

export async function listAdminCategories(filters: CategoryAdminFilters): Promise<PaginatedAdminCategoriesDTO> {
  await connectMongoose();
  const query: QueryFilter<ICategory> = {};
  if (filters.state !== "ALL") query.isActive = filters.state === "ACTIVE";
  if (filters.search) query.$or = [{ name: new RegExp(escapeRegex(filters.search), "i") }, { slug: new RegExp(escapeRegex(filters.search), "i") }];
  const sorts = { order: { sortOrder: 1 as const, name: 1 as const }, name: { name: 1 as const }, newest: { updatedAt: -1 as const } };
  const skip = (filters.page - 1) * filters.limit;
  const [records, total] = await Promise.all([
    CategoryModel.find(query).select("name slug description image sortOrder isActive updatedAt").sort(sorts[filters.sort]).skip(skip).limit(filters.limit).lean(),
    CategoryModel.countDocuments(query),
  ]);
  const ids = records.map((record) => record._id);
  const counts = ids.length ? await ProductModel.aggregate<{ _id: Types.ObjectId; total: number; active: number }>([
    { $match: { categoryId: { $in: ids } } },
    { $group: { _id: "$categoryId", total: { $sum: 1 }, active: { $sum: { $cond: [{ $eq: ["$status", "ACTIVE"] }, 1, 0] } } } },
  ]) : [];
  const countMap = new Map(counts.map((count) => [count._id.toString(), count]));
  return {
    categories: records.map((record) => {
      const count = countMap.get(record._id.toString());
      return { id: record._id.toString(), name: record.name, slug: record.slug, description: record.description,
        image: record.image ? { url: record.image.url, publicId: record.image.publicId, width: record.image.width, height: record.image.height, bytes: record.image.bytes, format: record.image.format, alt: record.image.alt } : undefined,
        sortOrder: record.sortOrder, isActive: record.isActive, productCount: count?.total ?? 0,
        activeProductCount: count?.active ?? 0, updatedAt: record.updatedAt.toISOString() };
    }),
    total, page: filters.page, totalPages: Math.max(1, Math.ceil(total / filters.limit)),
  };
}

export async function getAdminCategory(categoryId: string): Promise<AdminCategoryDTO> {
  if (!isValidObjectId(categoryId)) throw new NotFoundError("Category not found");
  await connectMongoose();
  const record = await CategoryModel.findById(categoryId).select("name slug description image sortOrder isActive updatedAt").lean();
  if (!record) throw new NotFoundError("Category not found");
  const [productCount, activeProductCount] = await Promise.all([
    ProductModel.countDocuments({ categoryId: record._id }), ProductModel.countDocuments({ categoryId: record._id, status: "ACTIVE" }),
  ]);
  return { id: record._id.toString(), name: record.name, slug: record.slug, description: record.description,
    image: record.image ? { url: record.image.url, publicId: record.image.publicId, width: record.image.width, height: record.image.height, bytes: record.image.bytes, format: record.image.format, alt: record.image.alt } : undefined,
    sortOrder: record.sortOrder, isActive: record.isActive, productCount, activeProductCount, updatedAt: record.updatedAt.toISOString() };
}

export async function saveAdminCategory(input: CategoryAdminInput) {
  await connectMongoose();
  const duplicate = await CategoryModel.findOne({ slug: input.slug, ...(input.id ? { _id: { $ne: input.id } } : {}) }).select("_id").lean();
  if (duplicate) throw new ConflictError("Category slug is already in use");
  const existing = input.id ? await CategoryModel.findById(input.id) : null;
  if (input.id && !existing) throw new NotFoundError("Category not found");
  if (existing?.isActive && !input.isActive) {
    const activeProducts = await ProductModel.countDocuments({ categoryId: existing._id, status: "ACTIVE" });
    if (activeProducts > 0) throw new InvalidStateError("Archive or reassign active products before archiving this category");
  }
  const previousSlug = existing?.slug;
  const target = existing ?? new CategoryModel();
  target.set({ name: input.name, slug: input.slug, description: input.description, sortOrder: input.sortOrder, isActive: input.isActive });
  await target.save();
  return { id: target._id.toString(), slug: target.slug, previousSlug };
}

export async function setAdminCategoryStatus(categoryId: string, isActive: boolean) {
  await connectMongoose();
  const category = await CategoryModel.findById(categoryId);
  if (!category) throw new NotFoundError("Category not found");
  if (!isActive) {
    const activeProducts = await ProductModel.countDocuments({ categoryId: category._id, status: "ACTIVE" });
    if (activeProducts > 0) throw new InvalidStateError("Archive or reassign active products before archiving this category");
  }
  category.isActive = isActive;
  await category.save();
  return { id: category._id.toString(), slug: category.slug };
}
