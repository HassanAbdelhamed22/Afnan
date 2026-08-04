export interface Governorate {
  code: string;
  name: string;
  shippingFee: number; // in minor units, e.g. 5000 = 50.00 EGP
  minDeliveryDays: number;
  maxDeliveryDays: number;
  active: boolean;
}

export const egyptGovernorates: Governorate[] = [
  { code: "cairo", name: "Cairo", shippingFee: 5000, minDeliveryDays: 2, maxDeliveryDays: 3, active: true },
  { code: "giza", name: "Giza", shippingFee: 5000, minDeliveryDays: 2, maxDeliveryDays: 3, active: true },
  { code: "alexandria", name: "Alexandria", shippingFee: 6500, minDeliveryDays: 3, maxDeliveryDays: 5, active: true },
];
