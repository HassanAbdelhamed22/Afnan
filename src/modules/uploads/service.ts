import "server-only";

import { createHash, randomUUID, timingSafeEqual } from "crypto";
import { Types } from "mongoose";
import type { z } from "zod";
import { AppError, InvalidStateError, NotFoundError } from "@/lib/errors/app-error";
import { env } from "@/lib/env";
import { connectMongoose } from "@/lib/mongoose";
import { UploadIntentModel } from "./model";
import { buildUploadFolder, type UploadPurpose } from "./paths";
import type { completeUploadSchema, createUploadIntentSchema } from "./schemas";

function configuration() {
  if (!env.CLOUDINARY_CLOUD_NAME || !env.CLOUDINARY_API_KEY || !env.CLOUDINARY_API_SECRET) throw new InvalidStateError("Reference image uploads are not configured yet");
  return { cloudName: env.CLOUDINARY_CLOUD_NAME, apiKey: env.CLOUDINARY_API_KEY, apiSecret: env.CLOUDINARY_API_SECRET };
}

function sign(parameters: Record<string, string | number>, secret: string) {
  const canonical = Object.entries(parameters).sort(([a], [b]) => a.localeCompare(b)).map(([key, value]) => `${key}=${value}`).join("&");
  return createHash("sha1").update(canonical + secret).digest("hex");
}

export async function createUploadIntent(userId: string, input: Omit<z.infer<typeof createUploadIntentSchema>, "purpose"> & { purpose?: UploadPurpose }) {
  const config = configuration();
  const purpose = input.purpose ?? "CUSTOM_REQUEST_REFERENCE";
  await connectMongoose();
  const recentIntentCount = await UploadIntentModel.countDocuments({ userId, createdAt: { $gte: new Date(Date.now() - 60 * 60 * 1000) } });
  if (recentIntentCount >= 20) throw new AppError({ code: "RATE_LIMITED", message: "Too many image uploads. Try again later", statusCode: 429 });
  const timestamp = Math.floor(Date.now() / 1000);
  const folder = buildUploadFolder(env.APP_ENV, purpose, userId);
  const uploadPublicId = randomUUID();
  const expectedPublicId = `${folder}/${uploadPublicId}`;
  const intent = await UploadIntentModel.create({ userId, purpose, publicId: expectedPublicId, originalFilename: input.filename, mimeType: input.mimeType, sizeBytes: input.sizeBytes, status: "PENDING", expiresAt: new Date(Date.now() + 30 * 60 * 1000) });
  return { intentId: intent._id.toString(), cloudName: config.cloudName, apiKey: config.apiKey, timestamp, folder, publicId: uploadPublicId, signature: sign({ folder, public_id: uploadPublicId, timestamp }, config.apiSecret) };
}

export async function completeUploadIntent(userId: string, input: z.infer<typeof completeUploadSchema>) {
  const config = configuration();
  await connectMongoose();
  const intent = await UploadIntentModel.findOne({ _id: new Types.ObjectId(input.intentId), userId, status: "PENDING", expiresAt: { $gt: new Date() } });
  if (!intent || intent.publicId !== input.publicId) throw new NotFoundError("Upload intent not found");
  const expected = sign({ public_id: input.publicId, version: input.version }, config.apiSecret);
  const actualBuffer = Buffer.from(input.signature, "hex");
  const expectedBuffer = Buffer.from(expected, "hex");
  if (actualBuffer.length !== expectedBuffer.length || !timingSafeEqual(actualBuffer, expectedBuffer)) throw new InvalidStateError("Upload verification failed");
  const credentials = Buffer.from(`${config.apiKey}:${config.apiSecret}`).toString("base64");
  const resourceResponse = await fetch(`https://api.cloudinary.com/v1_1/${config.cloudName}/resources/image/upload/${encodeURIComponent(input.publicId)}`, { headers: { Authorization: `Basic ${credentials}` }, cache: "no-store" });
  if (!resourceResponse.ok) throw new InvalidStateError("Uploaded image could not be verified");
  const resource = await resourceResponse.json() as { public_id?: string; secure_url?: string; width?: number; height?: number; bytes?: number; format?: string; resource_type?: string };
  if (resource.public_id !== input.publicId || resource.resource_type !== "image" || !resource.secure_url || !resource.width || !resource.height || !resource.bytes || !resource.format || !["jpg", "jpeg", "png", "webp"].includes(resource.format) || resource.bytes > intent.sizeBytes) throw new InvalidStateError("Uploaded image failed verification");
  intent.status = "COMPLETED";
  intent.asset = { url: resource.secure_url, publicId: input.publicId, width: resource.width, height: resource.height, bytes: resource.bytes, format: resource.format as "jpg" | "jpeg" | "png" | "webp" };
  await intent.save();
  return { intentId: intent._id.toString(), asset: intent.asset };
}

export async function getUploadIntentPurpose(userId: string, intentId: string) {
  await connectMongoose();
  const intent = await UploadIntentModel.findOne({ _id: new Types.ObjectId(intentId), userId }).select("purpose").lean<{ purpose: "CUSTOM_REQUEST_REFERENCE" | "PRODUCT_IMAGE" }>();
  if (!intent) throw new NotFoundError("Upload intent not found");
  return intent.purpose;
}
