import "server-only";

import { createHash } from "crypto";
import { Types } from "mongoose";

import { ConflictError, InvalidStateError, NotFoundError } from "@/lib/errors/app-error";
import { env } from "@/lib/env";
import { connectMongoose } from "@/lib/mongoose";
import { UploadIntentModel } from "@/modules/uploads/model";
import { MAX_PRODUCT_IMAGES } from "@/modules/uploads/schemas";
import type { MediaAsset } from "@/modules/uploads/types";

import { ProductModel } from "./model";

function cloudinaryConfiguration() {
  if (!env.CLOUDINARY_CLOUD_NAME || !env.CLOUDINARY_API_KEY || !env.CLOUDINARY_API_SECRET) throw new InvalidStateError("Cloudinary product-image enhancement is not configured");
  return { cloudName: env.CLOUDINARY_CLOUD_NAME, apiKey: env.CLOUDINARY_API_KEY, apiSecret: env.CLOUDINARY_API_SECRET };
}

function sign(parameters: Record<string, string | number>, secret: string) {
  const canonical = Object.entries(parameters).sort(([a], [b]) => a.localeCompare(b)).map(([key, value]) => `${key}=${value}`).join("&");
  return createHash("sha1").update(canonical + secret).digest("hex");
}

function trustedEnhancedUrl(originalUrl: string) {
  const parsed = new URL(originalUrl);
  if (parsed.protocol !== "https:" || parsed.hostname !== "res.cloudinary.com" || !parsed.pathname.includes("/image/upload/")) throw new InvalidStateError("Product image is not a trusted Cloudinary asset");
  parsed.pathname = parsed.pathname.replace("/image/upload/", "/image/upload/e_background_removal/");
  return parsed.toString();
}

export async function attachProductImage(adminId: string, productId: string, intentId: string, alt: string) {
  const mongoose = await connectMongoose();
  const session = await mongoose.startSession();
  try {
    let result: { id: string; slug: string; categoryId: string } | undefined;
    await session.withTransaction(async () => {
      const product = await ProductModel.findById(productId).session(session);
      if (!product) throw new NotFoundError("Product not found");
      if (product.images.length >= MAX_PRODUCT_IMAGES) throw new InvalidStateError(`Products support up to ${MAX_PRODUCT_IMAGES} images`);
      const intent = await UploadIntentModel.findOne({ _id: new Types.ObjectId(intentId), userId: adminId, purpose: "PRODUCT_IMAGE", status: "COMPLETED", expiresAt: { $gt: new Date() } }).session(session);
      if (!intent?.asset || !intent.asset.bytes || !intent.asset.format || !intent.asset.width || !intent.asset.height || !intent.asset.publicId.startsWith("afnan/products/")) throw new InvalidStateError("Product image upload is incomplete or untrusted");
      if (product.images.some((image: MediaAsset) => image.publicId === intent.asset?.publicId)) throw new ConflictError("This product image is already attached");
      const claimed = await UploadIntentModel.updateOne({ _id: intent._id, userId: adminId, status: "COMPLETED" }, { $set: { status: "CLAIMED" } }, { session });
      if (claimed.modifiedCount !== 1) throw new ConflictError("Product image was already used");
      const first = product.images.length === 0;
      product.images.push({ ...intent.asset, alt, sortOrder: product.images.length, isPrimary: first, presentation: { source: "ORIGINAL", backgroundRemovalRequested: false, backgroundRemovalStatus: "NOT_REQUESTED", enhancedApproved: false, backgroundColor: "#F7F7F5", aspectRatio: "4:5" } });
      await product.save({ session });
      result = { id: product._id.toString(), slug: product.slug, categoryId: product.categoryId.toString() };
    });
    if (!result) throw new InvalidStateError("Product image could not be attached");
    return result;
  } finally { await session.endSession(); }
}

export async function removeProductImage(productId: string, publicId: string) {
  await connectMongoose();
  const product = await ProductModel.findById(productId);
  if (!product) throw new NotFoundError("Product not found");
  const image = product.images.find((candidate: MediaAsset) => candidate.publicId === publicId);
  if (!image) throw new NotFoundError("Product image not found");
  if (product.status === "ACTIVE" && product.images.length === 1) throw new InvalidStateError("Active products must retain a primary image");
  product.images = product.images.filter((candidate: MediaAsset) => candidate.publicId !== publicId).map((candidate: MediaAsset, index: number) => ({ ...candidate, sortOrder: index, isPrimary: image.isPrimary ? index === 0 : candidate.isPrimary }));
  await product.save();
  return { id: product._id.toString(), slug: product.slug, categoryId: product.categoryId.toString() };
}

export async function orderProductImage(productId: string, publicId: string, direction: "UP" | "DOWN" | "PRIMARY") {
  await connectMongoose();
  const product = await ProductModel.findById(productId);
  if (!product) throw new NotFoundError("Product not found");
  const sorted = [...product.images].sort((a, b) => (a.sortOrder ?? 0) - (b.sortOrder ?? 0));
  const index = sorted.findIndex((image: MediaAsset) => image.publicId === publicId);
  if (index < 0) throw new NotFoundError("Product image not found");
  if (direction === "PRIMARY") sorted.forEach((image) => { image.isPrimary = image.publicId === publicId; });
  else {
    const target = direction === "UP" ? index - 1 : index + 1;
    if (target >= 0 && target < sorted.length) [sorted[index], sorted[target]] = [sorted[target], sorted[index]];
  }
  sorted.forEach((image, imageIndex) => { image.sortOrder = imageIndex; });
  product.images = sorted;
  await product.save();
  return { id: product._id.toString(), slug: product.slug, categoryId: product.categoryId.toString() };
}

export async function requestProductImageEnhancement(productId: string, publicId: string) {
  const config = cloudinaryConfiguration();
  await connectMongoose();
  const product = await ProductModel.findById(productId);
  if (!product) throw new NotFoundError("Product not found");
  const image = product.images.find((candidate: MediaAsset) => candidate.publicId === publicId);
  if (!image || !image.publicId.startsWith("afnan/products/")) throw new NotFoundError("Product image not found");
  if (image.presentation?.backgroundRemovalStatus === "PROCESSING") throw new ConflictError("Background removal is already processing");
  image.presentation = { source: "ORIGINAL", backgroundRemovalRequested: true, backgroundRemovalStatus: "PROCESSING", enhancedApproved: false, backgroundColor: "#F7F7F5", aspectRatio: "4:5" };
  image.enhancedUrl = trustedEnhancedUrl(image.url);
  await product.save();

  const timestamp = Math.floor(Date.now() / 1000);
  const parameters = { eager: "e_background_removal", public_id: publicId, timestamp, type: "upload" };
  const form = new URLSearchParams({ ...Object.fromEntries(Object.entries(parameters).map(([key, value]) => [key, String(value)])), api_key: config.apiKey, signature: sign(parameters, config.apiSecret) });
  try {
    const response = await fetch(`https://api.cloudinary.com/v1_1/${config.cloudName}/image/explicit`, { method: "POST", headers: { "Content-Type": "application/x-www-form-urlencoded" }, body: form, cache: "no-store" });
    if (!response.ok) throw new Error("Cloudinary background removal request failed");
    const payload = await response.json() as { eager?: Array<{ secure_url?: string }> };
    if (payload.eager?.[0]?.secure_url) image.enhancedUrl = payload.eager[0].secure_url;
    image.presentation.backgroundRemovalStatus = "READY";
    await product.save();
  } catch {
    image.presentation.backgroundRemovalStatus = "FAILED";
    await product.save();
    throw new InvalidStateError("Background removal failed; the original image remains available");
  }
  return { id: product._id.toString(), slug: product.slug, categoryId: product.categoryId.toString() };
}

export async function approveProductImage(productId: string, publicId: string, source: "ORIGINAL" | "ENHANCED") {
  await connectMongoose();
  const product = await ProductModel.findById(productId);
  if (!product) throw new NotFoundError("Product not found");
  const image = product.images.find((candidate: MediaAsset) => candidate.publicId === publicId);
  if (!image?.presentation) throw new NotFoundError("Product image not found");
  if (source === "ENHANCED" && (image.presentation.backgroundRemovalStatus !== "READY" || !image.enhancedUrl)) throw new InvalidStateError("Enhanced preview is not ready for approval");
  image.presentation.source = source;
  image.presentation.enhancedApproved = source === "ENHANCED";
  await product.save();
  return { id: product._id.toString(), slug: product.slug, categoryId: product.categoryId.toString() };
}
