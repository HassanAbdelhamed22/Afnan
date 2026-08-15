import { z } from "zod";
import { egyptGovernorateCodes } from "@/config/egypt-governorates";

export const shippingRateInputSchema = z.object({
  governorateCode: z.string().trim().toLowerCase().refine((value) => egyptGovernorateCodes.has(value), "Unknown Egyptian governorate"),
  feeAmount: z.number().int().min(0).max(1_000_000),
  minDeliveryDays: z.number().int().min(1).max(60),
  maxDeliveryDays: z.number().int().min(1).max(60),
  isActive: z.boolean(),
}).refine((value) => value.minDeliveryDays <= value.maxDeliveryDays, { path: ["maxDeliveryDays"], message: "Maximum days must be greater than or equal to minimum" });

export type ShippingRateInput = z.infer<typeof shippingRateInputSchema>;
