export interface Governorate {
  code: string;
  name: string;
  shippingFee: number; // in minor units, e.g. 5000 = 50.00 EGP
  minDeliveryDays: number;
  maxDeliveryDays: number;
  active: boolean;
}

export interface EgyptGovernorateOption {
  code: string;
  name: string;
}

/**
 * Stable Egypt-wide address reference data. Shipping availability and prices
 * remain separate operational data owned by the shipping module.
 */
export const egyptGovernorateOptions = [
  { code: "alexandria", name: "Alexandria" },
  { code: "aswan", name: "Aswan" },
  { code: "asyut", name: "Asyut" },
  { code: "beheira", name: "Beheira" },
  { code: "beni-suef", name: "Beni Suef" },
  { code: "cairo", name: "Cairo" },
  { code: "dakahlia", name: "Dakahlia" },
  { code: "damietta", name: "Damietta" },
  { code: "fayoum", name: "Fayoum" },
  { code: "gharbia", name: "Gharbia" },
  { code: "giza", name: "Giza" },
  { code: "ismailia", name: "Ismailia" },
  { code: "kafr-el-sheikh", name: "Kafr El Sheikh" },
  { code: "luxor", name: "Luxor" },
  { code: "matrouh", name: "Matrouh" },
  { code: "minya", name: "Minya" },
  { code: "monufia", name: "Monufia" },
  { code: "new-valley", name: "New Valley" },
  { code: "north-sinai", name: "North Sinai" },
  { code: "port-said", name: "Port Said" },
  { code: "qalyubia", name: "Qalyubia" },
  { code: "qena", name: "Qena" },
  { code: "red-sea", name: "Red Sea" },
  { code: "sharqia", name: "Sharqia" },
  { code: "sohag", name: "Sohag" },
  { code: "south-sinai", name: "South Sinai" },
  { code: "suez", name: "Suez" },
] as const satisfies readonly EgyptGovernorateOption[];

export const egyptGovernorateCodes = new Set<string>(
  egyptGovernorateOptions.map((governorate) => governorate.code),
);

export const egyptGovernorates: Governorate[] = [
  { code: "cairo", name: "Cairo", shippingFee: 5000, minDeliveryDays: 2, maxDeliveryDays: 3, active: true },
  { code: "giza", name: "Giza", shippingFee: 5000, minDeliveryDays: 2, maxDeliveryDays: 3, active: true },
  { code: "alexandria", name: "Alexandria", shippingFee: 6500, minDeliveryDays: 3, maxDeliveryDays: 5, active: true },
];
