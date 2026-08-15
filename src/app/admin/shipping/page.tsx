import React from "react";
import { AdminPageHeader } from "@/components/admin/admin-page-header";
import { ShippingRateForm } from "@/components/admin/shipping-rate-form";
import { listAdminShippingRates } from "@/modules/shipping/admin-repository";

export default async function AdminShippingPage() {
  const rates = await listAdminShippingRates();
  return (
    <><AdminPageHeader title="Egypt shipping" description="Configure cash-on-delivery shipping fees and delivery estimates for all 27 governorates." /><section className="border border-outline-variant bg-surface"><header className="border-b border-outline-variant bg-surface-container-low px-4 py-4"><p className="body-sm text-on-surface-variant">Fees are stored as integer minor units. Disabled governorates are rejected during checkout.</p></header>{rates.map((rate) => <ShippingRateForm key={rate.governorateCode} rate={rate} />)}</section></>
  );
}
