import "server-only";

import { InvalidStateError } from "@/lib/errors/app-error";
import { connectMongoose } from "@/lib/mongoose";

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
