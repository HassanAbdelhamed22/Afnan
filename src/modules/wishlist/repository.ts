import "server-only";

import { Types } from "mongoose";

import { connectMongoose } from "@/lib/mongoose";

import { WishlistModel } from "./model";

export interface WishlistItemRecord {
  productId: Types.ObjectId;
  addedAt: Date;
}

function isDuplicateKeyError(error: unknown): boolean {
  return typeof error === "object" && error !== null && "code" in error && error.code === 11000;
}

export async function getWishlistItemsRecord(userId: string): Promise<WishlistItemRecord[]> {
  await connectMongoose();
  const wishlist = await WishlistModel.findOne({ userId })
    .select("items")
    .lean<{ items: WishlistItemRecord[] }>();
  return wishlist?.items ?? [];
}

export async function addWishlistItemRecord(userId: string, productId: string): Promise<void> {
  await connectMongoose();
  const productObjectId = new Types.ObjectId(productId);
  try {
    await WishlistModel.updateOne(
      { userId },
      { $setOnInsert: { userId, items: [] } },
      { upsert: true },
    );
  } catch (error) {
    if (!isDuplicateKeyError(error)) throw error;
  }
  await WishlistModel.updateOne(
    { userId, "items.productId": { $ne: productObjectId } },
    { $push: { items: { productId: productObjectId, addedAt: new Date() } } },
  );
}

export async function removeWishlistItemRecord(userId: string, productId: string): Promise<void> {
  await connectMongoose();
  await WishlistModel.updateOne(
    { userId },
    { $pull: { items: { productId: new Types.ObjectId(productId) } } },
  );
}
