import type { CartDTO } from "@/modules/cart/dto";
import type { AddressDTO } from "@/modules/users/dto";
import type { ShippingRateDTO } from "@/modules/shipping";

export interface CheckoutAddressDTO extends AddressDTO {
  shippingRate?: ShippingRateDTO;
}

export interface CheckoutDTO {
  cart: CartDTO;
  addresses: CheckoutAddressDTO[];
  checkoutToken: string;
}

export interface PlaceOrderResultDTO { orderNumber: string }
