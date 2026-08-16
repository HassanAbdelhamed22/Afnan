import "server-only";

import { env } from "@/lib/env";
import { getStoreSettings } from "@/modules/settings";
import type { EmailSender } from "./email-sender";
import { getEmailSender } from "./provider";
import { buildNewCustomRequestAdminEmail, type NewCustomRequestEmailInput } from "./views";

export async function sendNewCustomRequestAdminEmail(
  input: NewCustomRequestEmailInput,
  sender: EmailSender = getEmailSender(),
): Promise<void> {
  const settings = await getStoreSettings();
  const view = buildNewCustomRequestAdminEmail(input, env.NEXT_PUBLIC_APP_URL);

  try {
    await sender.send({
      to: settings.adminEmail,
      subject: view.subject,
      html: view.html,
    });
  } catch {
    throw new Error("Custom request email failed");
  }
}
