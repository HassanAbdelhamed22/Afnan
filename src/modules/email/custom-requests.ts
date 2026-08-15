import "server-only";

import { Resend } from "resend";
import { env } from "@/lib/env";
import { getStoreSettings } from "@/modules/settings";
import { buildNewCustomRequestAdminEmail, type NewCustomRequestEmailInput } from "./views";

const resend = new Resend(env.RESEND_API_KEY);
export async function sendNewCustomRequestAdminEmail(input: NewCustomRequestEmailInput) {
  const settings = await getStoreSettings();
  const view = buildNewCustomRequestAdminEmail(input, env.NEXT_PUBLIC_APP_URL);
  const { error } = await resend.emails.send({ from: env.AUTH_EMAIL_FROM, to: settings.adminEmail, subject: view.subject, html: view.html });
  if (error) throw new Error("Custom request email failed");
}
