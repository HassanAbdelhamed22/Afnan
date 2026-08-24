import "server-only";

import { createHash } from "crypto";
import { Types } from "mongoose";

import { ConflictError, InvalidStateError, NotFoundError } from "@/lib/errors/app-error";
import { env } from "@/lib/env";
import { logger } from "@/lib/logger";
import { connectMongoose } from "@/lib/mongoose";
import { UploadIntentModel } from "@/modules/uploads/model";
import { isOwnedUploadPublicId, isProductImagePublicId } from "@/modules/uploads/paths";
import { MAX_PRODUCT_IMAGES } from "@/modules/uploads/schemas";
import type { MediaAsset } from "@/modules/uploads/types";
import type { ImageCrop, ImageFitMode } from "@/modules/uploads/presentation";

import { buildAttachedProductImage } from "./image-mapping";
import { ProductModel } from "./model";

function cloudinaryConfiguration() {
  if (!env.CLOUDINARY_CLOUD_NAME || !env.CLOUDINARY_API_KEY || !env.CLOUDINARY_API_SECRET) throw new InvalidStateError("Cloudinary product-image enhancement is not configured");
  return { cloudName: env.CLOUDINARY_CLOUD_NAME, apiKey: env.CLOUDINARY_API_KEY, apiSecret: env.CLOUDINARY_API_SECRET };
}

function sign(parameters: Record<string, string | number>, secret: string) {
  const canonical = Object.entries(parameters).sort(([a], [b]) => a.localeCompare(b)).map(([key, value]) => `${key}=${value}`).join("&");
  return createHash("sha1").update(canonical + secret).digest("hex");
}

class CloudinaryRequestError extends Error {
  constructor(readonly status: number, readonly requestId: string | undefined, readonly providerMessage: string) {
    super("Cloudinary background removal request failed");
    this.name = "CloudinaryRequestError";
  }
}

function sanitizeProviderMessage(message: string, secrets: string[]) {
  let safe = message.replace(/[\r\n\t]+/g, " ").replace(/\b(api_key|api_secret|signature)=([^&\s]+)/gi, "$1=[REDACTED]");
  for (const secret of secrets) if (secret) safe = safe.replaceAll(secret, "[REDACTED]");
  return safe.slice(0, 500);
}

function assetFingerprint(publicId: string) {
  return createHash("sha256").update(publicId).digest("hex").slice(0, 12);
}

function validationIssueSummary(error: unknown) {
  if (!error || typeof error !== "object" || !("errors" in error)) return undefined;
  const errors = (error as { errors?: unknown }).errors;
  if (!errors || typeof errors !== "object") return undefined;
  const issues = Object.values(errors).slice(0, 20).flatMap((issue) => {
    if (!issue || typeof issue !== "object") return [];
    const path = "path" in issue && typeof issue.path === "string" ? issue.path.replace(/[^a-zA-Z0-9_.[\]-]/g, "").slice(0, 160) : "unknown";
    const kind = "kind" in issue && typeof issue.kind === "string" ? issue.kind.replace(/[^a-zA-Z0-9_.-]/g, "").slice(0, 80) : "validation";
    return [`${path}:${kind}`];
  });
  return issues.length ? issues.join(",") : undefined;
}

function trustedCloudinaryImageUrl(value: string) {
  const parsed = new URL(value);
  if (parsed.protocol !== "https:" || parsed.hostname !== "res.cloudinary.com" || !parsed.pathname.includes("/image/upload/")) throw new InvalidStateError("Product image is not a trusted Cloudinary asset");
  return parsed.toString();
}

export async function attachProductImage(adminId: string, productId: string, intentId: string, alt: string, fitMode: ImageFitMode, crop?: ImageCrop) {
  const mongoose = await connectMongoose();
  const session = await mongoose.startSession();
  try {
    let result: { id: string; slug: string; categoryId: string } | undefined;
    await session.withTransaction(async () => {
      const product = await ProductModel.findById(productId).session(session);
      if (!product) throw new NotFoundError("Product not found");
      if (product.images.length >= MAX_PRODUCT_IMAGES) throw new InvalidStateError(`Products support up to ${MAX_PRODUCT_IMAGES} images`);
      const intent = await UploadIntentModel.findOne({ _id: new Types.ObjectId(intentId), userId: adminId, purpose: "PRODUCT_IMAGE", status: "COMPLETED", expiresAt: { $gt: new Date() } }).session(session);
      if (!intent?.asset?.url || !intent.asset.bytes || !intent.asset.format || !intent.asset.width || !intent.asset.height || !isOwnedUploadPublicId(intent.asset.publicId, env.APP_ENV, "PRODUCT_IMAGE", adminId)) throw new InvalidStateError("Product image upload is incomplete or untrusted");
      if (product.images.some((image: MediaAsset) => image.publicId === intent.asset?.publicId)) throw new ConflictError("This product image is already attached");
      const claimed = await UploadIntentModel.updateOne({ _id: intent._id, userId: adminId, status: "COMPLETED" }, { $set: { status: "CLAIMED" } }, { session });
      if (claimed.modifiedCount !== 1) throw new ConflictError("Product image was already used");
      product.images.push(buildAttachedProductImage(intent.asset, alt, product.images.length, fitMode, crop));
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
  if (!image || !isProductImagePublicId(image.publicId, env.APP_ENV)) throw new NotFoundError("Product image not found");
  if (image.presentation?.backgroundRemovalStatus === "PROCESSING") throw new ConflictError("Background removal is already processing");
  if (image.presentation) {
    image.presentation.source = "ORIGINAL";
    image.presentation.backgroundRemovalRequested = true;
    image.presentation.backgroundRemovalStatus = "PROCESSING";
    image.presentation.enhancedApproved = false;
    image.presentation.backgroundColor = "#F7F7F5";
    image.presentation.aspectRatio = "4:5";
  } else {
    image.presentation = { source: "ORIGINAL", backgroundRemovalRequested: true, backgroundRemovalStatus: "PROCESSING", enhancedApproved: false, backgroundColor: "#F7F7F5", aspectRatio: "4:5" };
  }
  trustedCloudinaryImageUrl(image.url);
  try {
    await product.save();
  } catch (error) {
    logger.error("product_image_enhancement_state_save_failed", {
      productId,
      assetFingerprint: assetFingerprint(publicId),
      stage: "processing_state_save",
      errorName: error instanceof Error ? error.name : "UnknownError",
      validationIssues: validationIssueSummary(error),
    });
    throw new InvalidStateError("Product image data could not be prepared for background removal");
  }

  const timestamp = Math.floor(Date.now() / 1000);
  const parameters = { eager: "e_background_removal/png", public_id: publicId, timestamp, type: "upload" };
  const form = new URLSearchParams({ ...Object.fromEntries(Object.entries(parameters).map(([key, value]) => [key, String(value)])), api_key: config.apiKey, signature: sign(parameters, config.apiSecret) });
  let stage = "provider_request";
  try {
    const response = await fetch(`https://api.cloudinary.com/v1_1/${config.cloudName}/image/explicit`, { method: "POST", headers: { "Content-Type": "application/x-www-form-urlencoded" }, body: form, cache: "no-store" });
    stage = "provider_response";
    const payload = await response.json().catch(() => ({})) as { eager?: Array<{ secure_url?: string }>; error?: { message?: unknown } };
    if (!response.ok) {
      const rawMessage = typeof payload.error?.message === "string" ? payload.error.message : response.statusText || "Cloudinary returned an error without a message";
      throw new CloudinaryRequestError(
        response.status,
        response.headers.get("x-cld-request-id") ?? response.headers.get("x-request-id") ?? undefined,
        sanitizeProviderMessage(rawMessage, [config.apiKey, config.apiSecret]),
      );
    }
    const eagerUrl = payload.eager?.[0]?.secure_url;
    if (!eagerUrl) throw new CloudinaryRequestError(response.status, response.headers.get("x-cld-request-id") ?? response.headers.get("x-request-id") ?? undefined, "Cloudinary did not return the generated background-removal preview");
    const trustedEagerUrl = trustedCloudinaryImageUrl(eagerUrl);
    if (trustedEagerUrl === image.url) throw new CloudinaryRequestError(response.status, response.headers.get("x-cld-request-id") ?? response.headers.get("x-request-id") ?? undefined, "Cloudinary returned the original asset instead of a background-removal preview");
    image.enhancedUrl = trustedEagerUrl;
    image.presentation.backgroundRemovalStatus = "READY";
    stage = "ready_state_save";
    await product.save();
  } catch (error) {
    logger.error("cloudinary_background_removal_failed", {
      productId,
      assetFingerprint: assetFingerprint(publicId),
      stage,
      errorName: error instanceof Error ? error.name : "UnknownError",
      validationIssues: validationIssueSummary(error),
      providerStatus: error instanceof CloudinaryRequestError ? error.status : undefined,
      providerRequestId: error instanceof CloudinaryRequestError ? error.requestId : undefined,
      providerMessage: error instanceof CloudinaryRequestError ? error.providerMessage : undefined,
    });
    image.presentation.backgroundRemovalStatus = "FAILED";
    try {
      await product.save();
    } catch (stateError) {
      logger.error("cloudinary_background_removal_failure_state_save_failed", {
        productId,
        assetFingerprint: assetFingerprint(publicId),
        errorName: stateError instanceof Error ? stateError.name : "UnknownError",
        validationIssues: validationIssueSummary(stateError),
      });
    }
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
