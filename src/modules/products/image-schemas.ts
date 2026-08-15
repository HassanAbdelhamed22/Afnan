import { z } from "zod";

const objectId = z.string().regex(/^[a-f\d]{24}$/i);
export const attachProductImageSchema = z.object({ productId: objectId, intentId: objectId, alt: z.string().trim().min(3).max(300) });
export const productImageTargetSchema = z.object({ productId: objectId, publicId: z.string().trim().min(1).max(300) });
export const orderProductImageSchema = productImageTargetSchema.extend({ direction: z.enum(["UP", "DOWN", "PRIMARY"]) });
export const approveProductImageSchema = productImageTargetSchema.extend({ source: z.enum(["ORIGINAL", "ENHANCED"]) });
