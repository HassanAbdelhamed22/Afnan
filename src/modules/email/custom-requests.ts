import "server-only";

import { Resend } from "resend";
import { env } from "@/lib/env";

const resend = new Resend(env.RESEND_API_KEY);
export async function sendNewCustomRequestAdminEmail(input: { requestNumber: string; customerName: string; title: string }) {
  const escape = (value: string) => value.replaceAll("&", "&amp;").replaceAll("<", "&lt;").replaceAll(">", "&gt;").replaceAll('"', "&quot;").replaceAll("'", "&#039;");
  const { error } = await resend.emails.send({ from: env.AUTH_EMAIL_FROM, to: env.ADMIN_EMAIL, subject: `New custom request ${input.requestNumber}`, html: `<h1>${escape(input.title)}</h1><p>Request: ${input.requestNumber}</p><p>Customer: ${escape(input.customerName)}</p><p><a href="${env.NEXT_PUBLIC_APP_URL}/admin/custom-requests">Review custom requests</a></p>` });
  if (error) throw new Error("Custom request email failed");
}
