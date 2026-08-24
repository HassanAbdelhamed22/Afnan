import "server-only";

import { Schema } from "mongoose";

export const MediaAssetSchema = new Schema(
  {
    url: { type: String, required: true },
    publicId: { type: String, required: true },
    width: { type: Number },
    height: { type: Number },
    bytes: { type: Number, min: 1 },
    format: { type: String, enum: ["jpg", "jpeg", "png", "webp"] },
    alt: { type: String, trim: true, maxlength: 300 },
    sortOrder: { type: Number, min: 0 },
    isPrimary: { type: Boolean },
    enhancedUrl: { type: String },
    presentation: {
      source: { type: String, enum: ["ORIGINAL", "ENHANCED"], default: "ORIGINAL" },
      backgroundRemovalRequested: { type: Boolean, default: false },
      backgroundRemovalStatus: { type: String, enum: ["NOT_REQUESTED", "PROCESSING", "READY", "FAILED"], default: "NOT_REQUESTED" },
      enhancedApproved: { type: Boolean, default: false },
      backgroundColor: { type: String, enum: ["#F7F7F5"], default: "#F7F7F5" },
      aspectRatio: { type: String, enum: ["4:5", "1:1"], default: "4:5" },
      fitMode: { type: String, enum: ["CONTAIN", "COVER", "STRETCH"] },
      crop: {
        x: { type: Number, min: 0, max: 100 },
        y: { type: Number, min: 0, max: 100 },
        width: { type: Number, min: 0.01, max: 100 },
        height: { type: Number, min: 0.01, max: 100 },
      },
    },
  },
  { _id: false }
);
