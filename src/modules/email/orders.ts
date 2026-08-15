import "server-only";

import { Resend } from "resend";
import { env } from "@/lib/env";
import { getStoreSettings } from "@/modules/settings";
import { buildNewOrderAdminEmail, type NewOrderEmailInput } from "./views";

const resend = new Resend(env.RESEND_API_KEY);

export async function sendNewOrderAdminEmail(input: NewOrderEmailInput): Promise<void> {
  const settings = await getStoreSettings();
  const view = buildNewOrderAdminEmail(input, env.NEXT_PUBLIC_APP_URL);
  const { error } = await resend.emails.send({
    from: env.AUTH_EMAIL_FROM,
    to: settings.adminEmail,
    subject: view.subject,
    html: view.html,
  });
  if (error) throw new Error("Order email failed");
}
