import "server-only";

import { Resend } from "resend";
import { env } from "@/lib/env";

const resend = new Resend(env.RESEND_API_KEY);

export async function sendNewOrderAdminEmail(input: { orderNumber: string; customerName: string; governorateName: string; totalAmount: number }): Promise<void> {
  const total = new Intl.NumberFormat("en-EG", { style: "currency", currency: "EGP" }).format(input.totalAmount / 100);
  const { error } = await resend.emails.send({
    from: env.AUTH_EMAIL_FROM,
    to: env.ADMIN_EMAIL,
    subject: `New Afnan order ${input.orderNumber}`,
    html: `<h1>New order ${input.orderNumber}</h1><p>Customer: ${escapeHtml(input.customerName)}</p><p>Governorate: ${escapeHtml(input.governorateName)}</p><p>Total: ${total}</p><p><a href="${env.NEXT_PUBLIC_APP_URL}/admin/orders">Review orders</a></p>`,
  });
  if (error) throw new Error("Order email failed");
}

function escapeHtml(value: string) {
  return value.replaceAll("&", "&amp;").replaceAll("<", "&lt;").replaceAll(">", "&gt;").replaceAll('"', "&quot;").replaceAll("'", "&#039;");
}
