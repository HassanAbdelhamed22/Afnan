import "server-only";

import { Schema, model, models, type Document, type Model, type Types } from "mongoose";

export interface IWishlistItem {
  productId: Types.ObjectId;
  addedAt: Date;
}

export interface IWishlist extends Document {
  userId: string;
  items: IWishlistItem[];
  createdAt: Date;
  updatedAt: Date;
}

const WishlistItemSchema = new Schema<IWishlistItem>(
  {
    productId: { type: Schema.Types.ObjectId, ref: "Product", required: true },
    addedAt: { type: Date, required: true, default: Date.now },
  },
  { _id: false },
);

const WishlistSchema = new Schema<IWishlist>(
  {
    userId: { type: String, required: true },
    items: { type: [WishlistItemSchema], required: true, default: [] },
  },
  { timestamps: true },
);

WishlistSchema.index({ userId: 1 }, { unique: true });

export const WishlistModel =
  (models.Wishlist as Model<IWishlist> | undefined) ??
  model<IWishlist>("Wishlist", WishlistSchema);
