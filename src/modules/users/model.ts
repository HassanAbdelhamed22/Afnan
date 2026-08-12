import "server-only";

import { Schema, model, models, type Document, type Model, type Types } from "mongoose";

export interface IAddress extends Document {
  _id: Types.ObjectId;
  userId: string;
  label: string;
  recipientName: string;
  phoneE164: string;
  governorateCode: string;
  city: string;
  area?: string;
  street: string;
  building?: string;
  floor?: string;
  apartment?: string;
  landmark?: string;
  notes?: string;
  isDefault: boolean;
  createdAt: Date;
  updatedAt: Date;
}

const AddressSchema = new Schema<IAddress>(
  {
    userId: { type: String, required: true },
    label: { type: String, required: true, trim: true, maxlength: 40 },
    recipientName: { type: String, required: true, trim: true, maxlength: 80 },
    phoneE164: { type: String, required: true },
    governorateCode: { type: String, required: true, lowercase: true, trim: true },
    city: { type: String, required: true, trim: true, maxlength: 80 },
    area: { type: String, trim: true, maxlength: 80 },
    street: { type: String, required: true, trim: true, maxlength: 160 },
    building: { type: String, trim: true, maxlength: 40 },
    floor: { type: String, trim: true, maxlength: 20 },
    apartment: { type: String, trim: true, maxlength: 20 },
    landmark: { type: String, trim: true, maxlength: 160 },
    notes: { type: String, trim: true, maxlength: 500 },
    isDefault: { type: Boolean, required: true, default: false },
  },
  { timestamps: true },
);

AddressSchema.index({ userId: 1, createdAt: -1 });
AddressSchema.index(
  { userId: 1, isDefault: 1 },
  { unique: true, partialFilterExpression: { isDefault: true } },
);

export const AddressModel = (models.Address as Model<IAddress> | undefined) ??
  model<IAddress>("Address", AddressSchema);
