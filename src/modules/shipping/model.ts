import "server-only";

import { Schema, model, models, type Document, type Model } from "mongoose";

export interface IShippingRate extends Document {
  governorateCode: string;
  governorateName: string;
  feeAmount: number;
  minDeliveryDays: number;
  maxDeliveryDays: number;
  isActive: boolean;
}

const ShippingRateSchema = new Schema<IShippingRate>(
  {
    governorateCode: { type: String, required: true, lowercase: true, trim: true },
    governorateName: { type: String, required: true, trim: true },
    feeAmount: { type: Number, required: true, min: 0 },
    minDeliveryDays: { type: Number, required: true, min: 1 },
    maxDeliveryDays: { type: Number, required: true, min: 1 },
    isActive: { type: Boolean, required: true, default: true },
  },
  { timestamps: true },
);

ShippingRateSchema.index({ governorateCode: 1 }, { unique: true });

export const ShippingRateModel =
  (models.ShippingRate as Model<IShippingRate> | undefined) ??
  model<IShippingRate>("ShippingRate", ShippingRateSchema);
