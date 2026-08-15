import "server-only";

import { egyptGovernorateOptions } from "@/config/egypt-governorates";
import { InvalidStateError } from "@/lib/errors/app-error";
import { connectMongoose } from "@/lib/mongoose";
import type { ShippingRateInput } from "./admin-schemas";
import { ShippingRateModel } from "./model";

export interface AdminShippingRateDTO {
  governorateCode: string; governorateName: string; feeAmount: number;
  minDeliveryDays: number; maxDeliveryDays: number; isActive: boolean; isConfigured: boolean;
}

export async function listAdminShippingRates(): Promise<AdminShippingRateDTO[]> {
  await connectMongoose();
  const records = await ShippingRateModel.find({}).select("governorateCode governorateName feeAmount minDeliveryDays maxDeliveryDays isActive").lean();
  const byCode = new Map(records.map((record) => [record.governorateCode, record]));
  return egyptGovernorateOptions.map((governorate) => {
    const record = byCode.get(governorate.code);
    return { governorateCode: governorate.code, governorateName: governorate.name,
      feeAmount: record?.feeAmount ?? 0, minDeliveryDays: record?.minDeliveryDays ?? 2,
      maxDeliveryDays: record?.maxDeliveryDays ?? 5, isActive: record?.isActive ?? false, isConfigured: Boolean(record) };
  });
}

export async function saveAdminShippingRate(input: ShippingRateInput) {
  await connectMongoose();
  const reference = egyptGovernorateOptions.find((governorate) => governorate.code === input.governorateCode);
  if (!reference) throw new InvalidStateError("Unknown Egyptian governorate");
  await ShippingRateModel.updateOne({ governorateCode: reference.code }, { $set: { governorateName: reference.name, feeAmount: input.feeAmount, minDeliveryDays: input.minDeliveryDays, maxDeliveryDays: input.maxDeliveryDays, isActive: input.isActive } }, { upsert: true, runValidators: true });
  return reference.code;
}
