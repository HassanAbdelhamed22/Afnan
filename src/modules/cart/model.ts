import "server-only";

import { Schema, model, models, type Document, type Model, type Types } from "mongoose";

export interface ICartItem {
  _id: Types.ObjectId;
  productId: Types.ObjectId;
  variantId: Types.ObjectId;
  quantity: number;
  personalization: string;
  addedAt: Date;
}

export interface ICart extends Document {
  _id: Types.ObjectId;
  userId: string;
  items: ICartItem[];
  createdAt: Date;
  updatedAt: Date;
}

const CartItemSchema = new Schema<ICartItem>({
  productId: { type: Schema.Types.ObjectId, ref: "Product", required: true },
  variantId: { type: Schema.Types.ObjectId, required: true },
  quantity: { type: Number, required: true, min: 1 },
  personalization: { type: String, required: true, default: "", maxlength: 500 },
  addedAt: { type: Date, required: true, default: Date.now },
});

const CartSchema = new Schema<ICart>(
  {
    userId: { type: String, required: true },
    items: { type: [CartItemSchema], required: true, default: [] },
  },
  { timestamps: true },
);

CartSchema.index({ userId: 1 }, { unique: true });

export const CartModel =
  (models.Cart as Model<ICart> | undefined) ?? model<ICart>("Cart", CartSchema);
