import React from "react";

interface OrderSuccessPageProps {
  params: Promise<{
    orderNumber: string;
  }>;
}

export default async function OrderSuccessPage({ params }: OrderSuccessPageProps) {
  const { orderNumber } = await params;

  return (
    <div className="container mx-auto py-12 px-4 text-center">
      <h1 className="text-3xl font-bold text-green-600 mb-4">Order Placed Successfully!</h1>
      <p className="text-neutral-600 mb-4">Thank you for your order. Your order number is: <span className="font-semibold text-neutral-900">{orderNumber}</span>.</p>
      <p className="text-neutral-500">We will contact you via WhatsApp for confirmation.</p>
    </div>
  );
}
