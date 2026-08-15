import { formatEGP } from "@/lib/money";

function escapeHtml(value: string) { return value.replaceAll("&", "&amp;").replaceAll("<", "&lt;").replaceAll(">", "&gt;").replaceAll('"', "&quot;").replaceAll("'", "&#039;"); }
function adminUrl(appUrl: string, path: string) { return `${appUrl.replace(/\/$/, "")}${path}`; }

export interface NewOrderEmailInput { orderNumber: string; customerName: string; customerPhone: string; governorateName: string; totalAmount: number; }
export interface NewCustomRequestEmailInput { requestNumber: string; customerName: string; customerPhone: string; summary: string; }
export interface AdminEmailView { subject: string; html: string; }

export function buildNewOrderAdminEmail(input: NewOrderEmailInput, appUrl: string): AdminEmailView {
  const link = adminUrl(appUrl, `/admin/orders/${encodeURIComponent(input.orderNumber)}`);
  return { subject: `New Afnan order ${input.orderNumber}`, html: `<h1>New order ${escapeHtml(input.orderNumber)}</h1><p>Customer: ${escapeHtml(input.customerName)}</p><p>Phone: ${escapeHtml(input.customerPhone)}</p><p>Governorate: ${escapeHtml(input.governorateName)}</p><p>Total: ${escapeHtml(formatEGP(input.totalAmount))}</p><p><a href="${escapeHtml(link)}">Review this order</a></p>` };
}
export function buildNewCustomRequestAdminEmail(input: NewCustomRequestEmailInput, appUrl: string): AdminEmailView {
  const link = adminUrl(appUrl, `/admin/custom-requests/${encodeURIComponent(input.requestNumber)}`);
  return { subject: `New custom request ${input.requestNumber}`, html: `<h1>New custom request ${escapeHtml(input.requestNumber)}</h1><p>Customer: ${escapeHtml(input.customerName)}</p><p>Phone: ${escapeHtml(input.customerPhone)}</p><p>Summary: ${escapeHtml(input.summary)}</p><p><a href="${escapeHtml(link)}">Review this request</a></p>` };
}
