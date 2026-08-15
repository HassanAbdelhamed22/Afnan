import "server-only";

import { randomBytes } from "crypto";
import { Types } from "mongoose";

import { ConflictError, InvalidStateError, NotFoundError } from "@/lib/errors/app-error";
import { connectMongoose } from "@/lib/mongoose";
import { AddressModel } from "@/modules/users/model";
import { CartModel } from "@/modules/cart/model";
import { ProductModel } from "@/modules/products/model";
import type { IVariant } from "@/modules/products/model";
import { CategoryModel } from "@/modules/categories/model";
import { ShippingRateModel } from "@/modules/shipping/model";
import { OrderModel } from "@/modules/orders/model";
import { sendNewOrderAdminEmail } from "@/modules/email";
import { resolveMediaUrl } from "@/modules/uploads/types";
import { logger } from "@/lib/logger";
import { invalidatePurchasedProductCaches, type PurchasedProductCacheTarget } from "./cache";
import type { PlaceOrderInput } from "./schemas";

interface CheckoutCustomer {
  id: string; name: string; email: string; phoneE164?: string | null; whatsappE164?: string | null;
}

function orderNumber() {
  const date = new Date().toISOString().slice(0, 10).replaceAll("-", "");
  return `AF-${date}-${randomBytes(3).toString("hex").toUpperCase()}`;
}

function isDuplicateKeyError(error: unknown) {
  return typeof error === "object" && error !== null && "code" in error && error.code === 11000;
}

export async function createOrderFromCart(customer: CheckoutCustomer, input: PlaceOrderInput): Promise<string> {
  const mongoose = await connectMongoose();
  const existing = await OrderModel.findOne({ checkoutToken: input.checkoutToken, userId: customer.id }).select("orderNumber").lean<{ orderNumber: string }>();
  if (existing) return existing.orderNumber;
  if (!customer.phoneE164) throw new InvalidStateError("Add a phone number to your profile before checkout");
  const customerPhone = customer.phoneE164;

  const dbSession = await mongoose.startSession();
  let createdOrderNumber = "";
  let emailDetails: { customerName: string; customerPhone: string; governorateName: string; totalAmount: number } | undefined;
  const purchasedProducts = new Map<string, PurchasedProductCacheTarget>();
  try {
    await dbSession.withTransaction(async () => {
      const duplicate = await OrderModel.findOne({ checkoutToken: input.checkoutToken }).session(dbSession).select("userId orderNumber").lean<{ userId: string; orderNumber: string }>();
      if (duplicate) {
        if (duplicate.userId !== customer.id) throw new ConflictError("Checkout token has already been used");
        createdOrderNumber = duplicate.orderNumber;
        return;
      }

      const address = await AddressModel.findOne({ _id: new Types.ObjectId(input.addressId), userId: customer.id }).session(dbSession).lean();
      if (!address) throw new NotFoundError("Delivery address not found");
      const rate = await ShippingRateModel.findOne({ governorateCode: address.governorateCode, isActive: true }).session(dbSession).lean();
      if (!rate) throw new InvalidStateError("Delivery is unavailable for this governorate");
      if (rate.minDeliveryDays > rate.maxDeliveryDays) throw new InvalidStateError("Delivery timing is temporarily unavailable");

      const cart = await CartModel.findOne({ userId: customer.id }).session(dbSession).lean();
      if (!cart?.items.length) throw new InvalidStateError("Your cart is empty");
      const products = await ProductModel.find({ _id: { $in: cart.items.map((item) => item.productId) } }).session(dbSession).lean();
      const activeCategoryIds = new Set((await CategoryModel.find({ _id: { $in: products.map((product) => product.categoryId) }, isActive: true }).session(dbSession).select("_id").lean()).map((category) => category._id.toString()));
      const productMap = new Map(products.map((product) => [product._id.toString(), product]));

      const stockTotals = new Map<string, { productId: Types.ObjectId; variantId: Types.ObjectId; quantity: number }>();
      const snapshots = cart.items.map((cartItem) => {
        const product = productMap.get(cartItem.productId.toString());
        if (!product || product.status !== "ACTIVE" || !activeCategoryIds.has(product.categoryId.toString())) throw new InvalidStateError("A cart product is no longer available");
        const variant = product.variants.find((candidate: IVariant) => candidate._id.toString() === cartItem.variantId.toString());
        if (!variant?.isActive) throw new InvalidStateError("A cart option is no longer available");
        if (product.fulfillmentType === "MADE_TO_ORDER" && (!product.preparationDaysMin || !product.preparationDaysMax || product.preparationDaysMin > product.preparationDaysMax)) throw new InvalidStateError("A made-to-order item is temporarily unavailable");
        if (cartItem.personalization && !product.personalizationAvailable) throw new InvalidStateError("A product no longer accepts personalization");
        const unitPriceAmount = variant.priceAmount ?? product.basePriceAmount;
        if (!Number.isSafeInteger(unitPriceAmount) || unitPriceAmount < 0) throw new InvalidStateError("A product price is invalid");
        const lineTotalAmount = unitPriceAmount * cartItem.quantity;
        if (!Number.isSafeInteger(lineTotalAmount)) throw new InvalidStateError("A cart total is invalid");
        if (product.fulfillmentType === "READY_MADE") {
          const key = `${product._id}:${variant._id}`;
          const current = stockTotals.get(key);
          stockTotals.set(key, { productId: product._id, variantId: variant._id, quantity: (current?.quantity ?? 0) + cartItem.quantity });
          purchasedProducts.set(product._id.toString(), {
            productId: product._id.toString(),
            productSlug: product.slug,
            categoryId: product.categoryId.toString(),
          });
        }
        return {
          productId: product._id, variantId: variant._id, productName: product.name, productSlug: product.slug,
          image: product.images[0] ? { ...product.images[0], url: resolveMediaUrl(product.images[0]) } : undefined, sku: variant.sku, variantLabel: variant.label,
          unitPriceAmount, quantity: cartItem.quantity, lineTotalAmount,
          personalization: cartItem.personalization || undefined, fulfillmentType: product.fulfillmentType,
          preparationDaysMin: product.preparationDaysMin, preparationDaysMax: product.preparationDaysMax,
        };
      });

      for (const stock of stockTotals.values()) {
        const updated = await ProductModel.updateOne(
          { _id: stock.productId, status: "ACTIVE", variants: { $elemMatch: { _id: stock.variantId, isActive: true, stockQuantity: { $gte: stock.quantity } } } },
          { $inc: { "variants.$[variant].stockQuantity": -stock.quantity } },
          { arrayFilters: [{ "variant._id": stock.variantId }], session: dbSession },
        );
        if (updated.modifiedCount !== 1) throw new ConflictError("A cart item no longer has enough stock");
      }

      const subtotalAmount = snapshots.reduce((total, item) => total + item.lineTotalAmount, 0);
      if (!Number.isSafeInteger(subtotalAmount) || !Number.isSafeInteger(subtotalAmount + rate.feeAmount)) throw new InvalidStateError("The order total is invalid");
      createdOrderNumber = orderNumber();
      const order = new OrderModel({
        userId: customer.id, orderNumber: createdOrderNumber, checkoutToken: input.checkoutToken,
        status: "PENDING_CONFIRMATION", whatsappConfirmationStatus: "NOT_CONTACTED", paymentMethod: "CASH_ON_DELIVERY",
        customerSnapshot: { name: customer.name, email: customer.email, phoneE164: customerPhone, whatsappE164: customer.whatsappE164 || customerPhone },
        addressSnapshot: { recipientName: address.recipientName, phoneE164: address.phoneE164, governorateCode: address.governorateCode, governorateName: rate.governorateName, city: address.city, area: address.area, street: address.street, building: address.building, floor: address.floor, apartment: address.apartment, landmark: address.landmark, notes: address.notes },
        items: snapshots, subtotalAmount, shippingFeeAmount: rate.feeAmount, totalAmount: subtotalAmount + rate.feeAmount, currency: "EGP",
        customerNote: input.customerNote, statusHistory: [{ status: "PENDING_CONFIRMATION", timestamp: new Date(), actorId: customer.id }], stockRestored: false,
      });
      await order.save({ session: dbSession });
      await CartModel.updateOne({ userId: customer.id }, { $set: { items: [] } }, { session: dbSession });
      emailDetails = { customerName: customer.name, customerPhone, governorateName: rate.governorateName, totalAmount: subtotalAmount + rate.feeAmount };
    });
  } catch (error) {
    if (isDuplicateKeyError(error)) {
      const duplicate = await OrderModel.findOne({ checkoutToken: input.checkoutToken, userId: customer.id }).select("orderNumber").lean<{ orderNumber: string }>();
      if (duplicate) return duplicate.orderNumber;
    }
    throw error;
  } finally {
    await dbSession.endSession();
  }

  if (!createdOrderNumber) throw new InvalidStateError("The order could not be created");
  try {
    invalidatePurchasedProductCaches([...purchasedProducts.values()]);
  } catch {
    // The order is already committed; cache failure must not report checkout failure.
  }
  if (emailDetails) {
    await sendNewOrderAdminEmail({ orderNumber: createdOrderNumber, ...emailDetails }).catch(() => logger.error("New order admin email failed", { orderNumber: createdOrderNumber }));
  }
  return createdOrderNumber;
}
