import "server-only";

import { InvalidStateError } from "@/lib/errors/app-error";
import { connectMongoose } from "@/lib/mongoose";
import { unstable_cache } from "next/cache";
import { CACHE_TAGS } from "@/config/cache";
import { egyptGovernorateCodes } from "@/config/egypt-governorates";

import { ShippingRateModel } from "./model";

export interface ShippingRateDTO {
  governorateCode: string;
  governorateName: string;
  feeAmount: number;
  minDeliveryDays: number;
  maxDeliveryDays: number;
}

export async function getActiveShippingRate(governorateCode: string): Promise<ShippingRateDTO> {
  await connectMongoose();
  const rate = await ShippingRateModel.findOne({ governorateCode, isActive: true })
    .select("governorateCode governorateName feeAmount minDeliveryDays maxDeliveryDays")
    .lean<ShippingRateDTO>();
  if (!rate) throw new InvalidStateError("Delivery is unavailable for this governorate");
  if (rate.minDeliveryDays > rate.maxDeliveryDays) {
    throw new InvalidStateError("Delivery timing is temporarily unavailable");
  }
  return rate;
}

export async function getShippingQuote(governorateCode: string): Promise<ShippingRateDTO> {
  const normalizedCode = governorateCode.trim().toLowerCase();
  if (!egyptGovernorateCodes.has(normalizedCode)) throw new InvalidStateError("Delivery is unavailable for this governorate");
  return unstable_cache(() => getActiveShippingRate(normalizedCode), ["shipping-quote", normalizedCode], { tags: [CACHE_TAGS.shippingRates], revalidate: 900 })();
}
