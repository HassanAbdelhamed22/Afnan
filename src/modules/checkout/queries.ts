import "server-only";

import { randomUUID } from "crypto";
import { requireVerifiedUser } from "@/modules/auth/dal";
import { getCart } from "@/modules/cart/service";
import { listAddressRecords } from "@/modules/users/repository";
import { ShippingRateModel } from "@/modules/shipping/model";
import { connectMongoose } from "@/lib/mongoose";
import type { CheckoutDTO } from "./dto";

export async function getCustomerCheckout(): Promise<CheckoutDTO> {
  const session = await requireVerifiedUser();
  const [cart, addresses] = await Promise.all([
    getCart(session.user.id),
    listAddressRecords(session.user.id),
  ]);
  await connectMongoose();
  const rates = await ShippingRateModel.find({
    governorateCode: { $in: addresses.map((address) => address.governorateCode) },
    isActive: true,
  }).select("governorateCode governorateName feeAmount minDeliveryDays maxDeliveryDays").lean();
  const ratesByCode = new Map(rates.map((rate) => [rate.governorateCode, {
    governorateCode: rate.governorateCode,
    governorateName: rate.governorateName,
    feeAmount: rate.feeAmount,
    minDeliveryDays: rate.minDeliveryDays,
    maxDeliveryDays: rate.maxDeliveryDays,
  }]));
  return {
    cart,
    addresses: addresses.map((address) => ({ ...address, shippingRate: ratesByCode.get(address.governorateCode) })),
    checkoutToken: randomUUID(),
  };
}
