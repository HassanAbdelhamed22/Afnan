import "server-only";

import { Schema, model, models, type Document, type Types } from "mongoose";
import { MediaAssetSchema } from "../uploads/schema";
import { type MediaAsset } from "../uploads/types";

export interface ICategory extends Document {
  _id: Types.ObjectId;
  name: string;
  slug: string;
  description?: string;
  image?: MediaAsset;
  sortOrder: number;
  isActive: boolean;
  createdAt: Date;
  updatedAt: Date;
}

const CategorySchema = new Schema<ICategory>(
  {
    name: { type: String, required: true },
    slug: { type: String, required: true, unique: true },
    description: { type: String },
    image: { type: MediaAssetSchema },
    sortOrder: { type: Number, required: true },
    isActive: { type: Boolean, required: true, default: true },
  },
  {
    timestamps: true,
  }
);

// Compound index for category navigation and listing
CategorySchema.index({ isActive: 1, sortOrder: 1 });

export const CategoryModel =
  models.Category || model<ICategory>("Category", CategorySchema);
