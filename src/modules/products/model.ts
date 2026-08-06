import "server-only";

import { Schema, model, models, type Document, type Types } from "mongoose";
import { MediaAssetSchema } from "../uploads/schema";
import { type MediaAsset } from "../uploads/types";

export interface IVariant {
  _id: Types.ObjectId;
  sku: string;
  label: string;
  optionValues: Map<string, string>;
  priceAmount?: number;
  stockQuantity?: number;
  isActive: boolean;
}

export interface IProduct extends Document {
  _id: Types.ObjectId;
  name: string;
  slug: string;
  description: string;
  categoryId: Types.ObjectId;
  status: "DRAFT" | "ACTIVE" | "ARCHIVED";
  fulfillmentType: "READY_MADE" | "MADE_TO_ORDER";
  basePriceAmount: number;
  currency: "EGP";
  materials: string[];
  colors: string[];
  tags: string[];
  dimensions?: {
    width?: number;
    height?: number;
    depth?: number;
    unit: "cm";
  };
  personalizationAvailable: boolean;
  personalizationInstructions?: string;
  preparationDaysMin?: number;
  preparationDaysMax?: number;
  careInstructions?: string;
  images: MediaAsset[];
  variants: IVariant[];
  isFeatured: boolean;
  publishedAt?: Date;
  createdAt: Date;
  updatedAt: Date;
}

const VariantSchema = new Schema<IVariant>(
  {
    sku: { type: String, required: true },
    label: { type: String, required: true },
    optionValues: { type: Map, of: String, required: true },
    priceAmount: { type: Number },
    stockQuantity: { type: Number },
    isActive: { type: Boolean, required: true, default: true },
  }
);

const ProductSchema = new Schema<IProduct>(
  {
    name: { type: String, required: true },
    slug: { type: String, required: true, unique: true },
    description: { type: String, required: true },
    categoryId: { type: Schema.Types.ObjectId, ref: "Category", required: true },
    status: {
      type: String,
      enum: ["DRAFT", "ACTIVE", "ARCHIVED"],
      required: true,
      default: "DRAFT",
    },
    fulfillmentType: {
      type: String,
      enum: ["READY_MADE", "MADE_TO_ORDER"],
      required: true,
    },
    basePriceAmount: { type: Number, required: true },
    currency: { type: String, enum: ["EGP"], required: true, default: "EGP" },
    materials: { type: [String], required: true, default: [] },
    colors: { type: [String], required: true, default: [] },
    tags: { type: [String], required: true, default: [] },
    dimensions: {
      width: Number,
      height: Number,
      depth: Number,
      unit: { type: String, enum: ["cm"], default: "cm" },
    },
    personalizationAvailable: { type: Boolean, required: true, default: false },
    personalizationInstructions: { type: String },
    preparationDaysMin: { type: Number },
    preparationDaysMax: { type: Number },
    careInstructions: { type: String },
    images: { type: [MediaAssetSchema], required: true, default: [] },
    variants: { type: [VariantSchema], required: true, default: [] },
    isFeatured: { type: Boolean, required: true, default: false },
    publishedAt: { type: Date },
  },
  {
    timestamps: true,
  }
);

// Indexes
// Unique SKU across variants. Mongoose doesn't support `{ unique: true }` easily on subdocuments
// unless we index the path.
ProductSchema.index({ "variants.sku": 1 }, { unique: true, sparse: true });

// Catalog query indexes
ProductSchema.index({ status: 1, categoryId: 1, publishedAt: -1 });
ProductSchema.index({ status: 1, basePriceAmount: 1 });

// Text index for text searches
ProductSchema.index(
  {
    name: "text",
    description: "text",
    materials: "text",
    colors: "text",
    tags: "text",
  },
  {
    weights: {
      name: 10,
      tags: 5,
      materials: 3,
      colors: 3,
      description: 1,
    },
    name: "ProductTextIndex",
  }
);

export const ProductModel =
  models.Product || model<IProduct>("Product", ProductSchema);
