import "server-only";

import { Types } from "mongoose";

import { ConflictError, InvalidStateError, NotFoundError } from "@/lib/errors/app-error";
import { env } from "@/lib/env";
import { logger } from "@/lib/logger";
import { connectMongoose } from "@/lib/mongoose";
import { UploadIntentModel } from "@/modules/uploads/model";
import { isOwnedUploadPublicId } from "@/modules/uploads/paths";
import { deleteManagedUploadAsset } from "@/modules/uploads/service";
import type { ImageCrop, ImageFitMode } from "@/modules/uploads/presentation";

import { buildAttachedCategoryImage } from "./image-mapping";
import { CategoryModel } from "./model";

async function deleteReplacedCategoryImage(publicId?: string) {
  if (!publicId) return;
  await deleteManagedUploadAsset(publicId, "CATEGORY_IMAGE").catch((error) => logger.error("category_image_cleanup_failed", { errorName: error instanceof Error ? error.name : "UnknownError" }));
}

export async function attachCategoryImage(adminId: string, categoryId: string, intentId: string, alt: string, fitMode: ImageFitMode, crop?: ImageCrop) {
  const mongoose = await connectMongoose();
  const session = await mongoose.startSession();
  let result: { id: string; slug: string; replacedPublicId?: string } | undefined;
  try {
    await session.withTransaction(async () => {
      const category = await CategoryModel.findById(categoryId).session(session);
      if (!category) throw new NotFoundError("Category not found");
      const intent = await UploadIntentModel.findOne({ _id: new Types.ObjectId(intentId), userId: adminId, purpose: "CATEGORY_IMAGE", status: "COMPLETED", expiresAt: { $gt: new Date() } }).session(session);
      if (!intent?.asset?.url || !intent.asset.bytes || !intent.asset.format || !intent.asset.width || !intent.asset.height || !isOwnedUploadPublicId(intent.asset.publicId, env.APP_ENV, "CATEGORY_IMAGE", adminId)) throw new InvalidStateError("Category image upload is incomplete or untrusted");
      if (category.image?.publicId === intent.asset.publicId) throw new ConflictError("This category image is already attached");
      const claimed = await UploadIntentModel.updateOne({ _id: intent._id, userId: adminId, status: "COMPLETED" }, { $set: { status: "CLAIMED" } }, { session });
      if (claimed.modifiedCount !== 1) throw new ConflictError("Category image was already used");
      const replacedPublicId = category.image?.publicId;
      category.image = buildAttachedCategoryImage(intent.asset, alt, fitMode, crop);
      await category.save({ session });
      result = { id: category._id.toString(), slug: category.slug, replacedPublicId };
    });
  } finally {
    await session.endSession();
  }
  if (!result) throw new InvalidStateError("Category image could not be attached");
  if (result.replacedPublicId) await deleteReplacedCategoryImage(result.replacedPublicId);
  return { id: result.id, slug: result.slug };
}

export async function removeCategoryImage(categoryId: string) {
  await connectMongoose();
  const category = await CategoryModel.findById(categoryId);
  if (!category) throw new NotFoundError("Category not found");
  if (!category.image) throw new NotFoundError("Category image not found");
  const publicId = category.image.publicId;
  category.image = undefined;
  await category.save();
  await deleteReplacedCategoryImage(publicId);
  return { id: category._id.toString(), slug: category.slug };
}
