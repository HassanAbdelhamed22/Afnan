import "server-only";

import { Types } from "mongoose";

import { ConflictError, NotFoundError } from "@/lib/errors/app-error";
import { connectMongoose } from "@/lib/mongoose";

import { CartModel } from "./model";

function isDuplicateKeyError(error: unknown): boolean {
  return (
    typeof error === "object" &&
    error !== null &&
    "code" in error &&
    error.code === 11000
  );
}

export interface CartItemRecord {
  _id: Types.ObjectId;
  productId: Types.ObjectId;
  variantId: Types.ObjectId;
  quantity: number;
  personalization: string;
  addedAt: Date;
}

export async function getCartItemsRecord(userId: string): Promise<CartItemRecord[]> {
  await connectMongoose();
  const cart = await CartModel.findOne({ userId })
    .select("items")
    .lean<{ items: CartItemRecord[] }>();
  return cart?.items ?? [];
}

export async function getOwnedCartItemRecord(
  userId: string,
  itemId: string,
): Promise<CartItemRecord> {
  await connectMongoose();
  const itemObjectId = new Types.ObjectId(itemId);
  const cart = await CartModel.findOne({ userId, "items._id": itemObjectId })
    .select({ items: { $elemMatch: { _id: itemObjectId } } })
    .lean<{ items: CartItemRecord[] }>();
  const item = cart?.items[0];
  if (!item) throw new NotFoundError("Cart item not found");
  return item;
}

export async function addCartItemRecord(input: {
  userId: string;
  productId: string;
  variantId: string;
  quantity: number;
  personalization: string;
  maximumQuantity?: number;
}): Promise<void> {
  await connectMongoose();
  const productId = new Types.ObjectId(input.productId);
  const variantId = new Types.ObjectId(input.variantId);

  try {
    await CartModel.updateOne(
      { userId: input.userId },
      { $setOnInsert: { userId: input.userId, items: [] } },
      { upsert: true },
    );
  } catch (error) {
    // Another first mutation may create this user's unique cart concurrently.
    if (!isDuplicateKeyError(error)) throw error;
  }

  const quantityFilter =
    input.maximumQuantity === undefined
      ? {}
      : { quantity: { $lte: input.maximumQuantity - input.quantity } };
  const identity = {
    productId,
    variantId,
    personalization: input.personalization,
  };
  const incrementExistingItem = () =>
    CartModel.updateOne(
      {
        userId: input.userId,
        items: { $elemMatch: { ...identity, ...quantityFilter } },
      },
      { $inc: { "items.$[item].quantity": input.quantity } },
      {
        arrayFilters: [{
          "item.productId": productId,
          "item.variantId": variantId,
          "item.personalization": input.personalization,
        }],
      },
    );
  const incremented = await incrementExistingItem();
  if (incremented.modifiedCount === 1) return;

  const inserted = await CartModel.updateOne(
    {
      userId: input.userId,
      items: { $not: { $elemMatch: identity } },
    },
    {
      $push: {
        items: {
          productId,
          variantId,
          quantity: input.quantity,
          personalization: input.personalization,
          addedAt: new Date(),
        },
      },
    },
  );
  if (inserted.modifiedCount === 1) return;

  // A matching line may have been inserted after our first lookup.
  const retry = await incrementExistingItem();
  if (retry.modifiedCount !== 1) {
    throw new ConflictError("Requested quantity exceeds current stock");
  }
}

export async function updateCartItemQuantityRecord(
  userId: string,
  itemId: string,
  quantity: number,
): Promise<void> {
  await connectMongoose();
  const itemObjectId = new Types.ObjectId(itemId);
  const result = await CartModel.updateOne(
    { userId, "items._id": itemObjectId },
    { $set: { "items.$.quantity": quantity } },
  );
  if (result.matchedCount !== 1) throw new NotFoundError("Cart item not found");
}

export async function removeCartItemRecord(userId: string, itemId: string): Promise<void> {
  await connectMongoose();
  const result = await CartModel.updateOne(
    { userId, "items._id": new Types.ObjectId(itemId) },
    { $pull: { items: { _id: new Types.ObjectId(itemId) } } },
  );
  if (result.matchedCount !== 1) throw new NotFoundError("Cart item not found");
}

export async function clearCartRecord(userId: string): Promise<void> {
  await connectMongoose();
  await CartModel.updateOne({ userId }, { $set: { items: [] } });
}
